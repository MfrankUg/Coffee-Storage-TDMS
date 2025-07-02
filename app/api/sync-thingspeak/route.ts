import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("🔄 Starting ThingSpeak sync...")

  try {
    // Get API key from environment
    const apiKey = process.env.SENSOR_API_KEY
    if (!apiKey) {
      console.log("⚠️ No ThingSpeak API key found, using fallback mode")
      return NextResponse.json({
        success: true,
        message: "Operating in fallback mode - no ThingSpeak API key configured",
        synced: 0,
        fallbackMode: true,
      })
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let thingSpeakData
    try {
      console.log("📡 Fetching data from ThingSpeak...")

      // Fetch data from ThingSpeak with timeout and proper headers
      const response = await fetch(
        `https://api.thingspeak.com/channels/2739927/feeds.json?api_key=${apiKey}&results=50`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "TDMS-Dashboard/1.0",
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status} ${response.statusText}`)
      }

      thingSpeakData = await response.json()
      console.log("✅ ThingSpeak data fetched successfully")
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.log("⏰ ThingSpeak request timed out, continuing with fallback")
      } else {
        console.log("⚠️ ThingSpeak fetch failed:", fetchError.message)
      }

      // Return success even if ThingSpeak fails - app should continue working
      return NextResponse.json({
        success: true,
        message: "ThingSpeak unavailable, operating in fallback mode",
        error: fetchError.message,
        synced: 0,
        fallbackMode: true,
      })
    }

    // Validate ThingSpeak response structure
    if (!thingSpeakData || !thingSpeakData.feeds || !Array.isArray(thingSpeakData.feeds)) {
      console.log("⚠️ Invalid ThingSpeak response structure")
      return NextResponse.json({
        success: true,
        message: "Invalid ThingSpeak response, operating in fallback mode",
        synced: 0,
        fallbackMode: true,
      })
    }

    const feeds = thingSpeakData.feeds
    console.log(`📊 Processing ${feeds.length} sensor readings...`)

    if (feeds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new data from ThingSpeak",
        synced: 0,
      })
    }

    // Process and store sensor readings (optional - non-critical)
    let syncedCount = 0
    let supabaseError = null

    try {
      // Prepare data for Supabase insertion
      const sensorReadings = feeds
        .filter((feed: any) => feed && feed.created_at) // Filter out invalid entries
        .map((feed: any) => {
          // Safely parse numeric values with validation
          const parseFloat = (value: any): number | null => {
            if (value === null || value === undefined || value === "") return null
            const parsed = Number(value)
            return isNaN(parsed) ? null : parsed
          }

          return {
            field1: parseFloat(feed.field1), // Small dust particles
            field2: parseFloat(feed.field2), // Large particles
            field3: parseFloat(feed.field3), // Reserved
            field4: parseFloat(feed.field4), // Humidity
            field5: parseFloat(feed.field5), // Temperature
            field6: parseFloat(feed.field6), // Reserved
            field7: parseFloat(feed.field7), // Reserved
            field8: parseFloat(feed.field8), // Reserved
            created_at: feed.created_at,
            entry_id: feed.entry_id ? Number.parseInt(feed.entry_id) : null,
            channel_id: thingSpeakData.channel?.id ? Number.parseInt(thingSpeakData.channel.id) : null,
          }
        })
        .filter((reading) => {
          // Filter out completely empty readings
          return (
            reading.field1 !== null || reading.field2 !== null || reading.field4 !== null || reading.field5 !== null
          )
        })

      if (sensorReadings.length > 0) {
        console.log(`💾 Attempting to store ${sensorReadings.length} readings in Supabase...`)

        // Try to store in Supabase (non-critical operation)
        const { data, error } = await supabase.from("sensor_readings").upsert(sensorReadings, {
          onConflict: "entry_id,channel_id",
          ignoreDuplicates: true,
        })

        if (error) {
          console.log("⚠️ Supabase storage failed (non-critical):", error.message)
          supabaseError = error.message
        } else {
          syncedCount = sensorReadings.length
          console.log(`✅ Successfully stored ${syncedCount} readings in Supabase`)
        }
      } else {
        console.log("⚠️ No valid sensor readings to store")
      }
    } catch (dbError: any) {
      console.log("⚠️ Database operation failed (non-critical):", dbError.message)
      supabaseError = dbError.message
    }

    // Always return success - the app should work even if storage fails
    const response = {
      success: true,
      message: supabaseError
        ? `ThingSpeak sync completed with storage warning: ${supabaseError}`
        : `Successfully synced ${syncedCount} sensor readings`,
      synced: syncedCount,
      totalFetched: feeds.length,
      channelInfo: thingSpeakData.channel || null,
      storageWarning: supabaseError,
      timestamp: new Date().toISOString(),
    }

    console.log("🎉 ThingSpeak sync completed:", response.message)
    return NextResponse.json(response)
  } catch (error: any) {
    // Even in case of unexpected errors, try to return a success response
    console.error("❌ Unexpected error in ThingSpeak sync:", error)

    return NextResponse.json({
      success: true, // Still return success to keep app working
      message: "Sync encountered issues but system remains operational",
      error: error.message,
      synced: 0,
      fallbackMode: true,
      timestamp: new Date().toISOString(),
    })
  }
}

export async function GET() {
  // Handle GET requests by redirecting to POST
  return POST(new NextRequest("http://localhost/api/sync-thingspeak", { method: "POST" }))
}
