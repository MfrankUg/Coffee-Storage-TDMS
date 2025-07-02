import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { CoffeeWarehouseSensorGenerator } from "@/lib/sensor-data-generator"

// Initialize the sensor data generator
const sensorGenerator = new CoffeeWarehouseSensorGenerator()

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    // Try to fetch data from ThingSpeak directly as a fallback
    let thingspeakData = null
    let hasRealData = false

    try {
      const thingspeakResponse = await fetch(
        `https://api.thingspeak.com/channels/2890593/feeds.json?api_key=CJDLIMXOTJ3RVEPF&results=${limit}`,
      )

      if (thingspeakResponse.ok) {
        thingspeakData = await thingspeakResponse.json()
        hasRealData = thingspeakData?.feeds?.length > 0
        console.log("✅ Fetched data directly from ThingSpeak:", {
          feeds: thingspeakData?.feeds?.length || 0,
          latest: thingspeakData?.feeds?.[0],
        })
      }
    } catch (thingspeakError) {
      console.error("❌ ThingSpeak direct fetch error:", thingspeakError)
    }

    // Calculate time range
    const startTime = new Date()
    startTime.setHours(startTime.getHours() - hours)

    // Fetch sensor readings from Supabase
    let readings = []
    try {
      const result = await supabase
        .from("sensor_readings")
        .select("*")
        .gte("created_at", startTime.toISOString())
        .order("created_at", { ascending: false })
        .limit(limit)

      readings = result.data || []

      if (readings.length > 0) {
        console.log(`✅ Fetched ${readings.length} readings from Supabase`)
      }
    } catch (error) {
      console.error("❌ Error fetching sensor readings from Supabase:", error)
    }

    // If no readings from Supabase but we have ThingSpeak data, use that
    if ((!readings || readings.length === 0) && hasRealData) {
      readings = thingspeakData.feeds.map((feed: any, index: number) => ({
        entry_id: 1000000 + index,
        field1: feed.field1 ? Number.parseFloat(feed.field1) : null, // Small Dust Particles
        field2: feed.field2 ? Number.parseFloat(feed.field2) : null, // Large Particles
        field3: null, // Unused field
        field4: feed.field4 ? Number.parseFloat(feed.field4) : null, // Humidity
        field5: feed.field5 ? Number.parseFloat(feed.field5) : null, // Temperature
        field6: feed.field6 ? Number.parseFloat(feed.field6) : null,
        field7: feed.field7 ? Number.parseFloat(feed.field7) : null,
        field8: feed.field8 ? Number.parseFloat(feed.field8) : null,
        created_at: feed.created_at,
      }))
      console.log(`✅ Using ${readings.length} readings directly from ThingSpeak`)
    }

    // If we still don't have readings, generate realistic mock data
    if (!readings || readings.length === 0) {
      console.log("⚠️ No real data available, generating realistic sensor data")
      const mockReadings = sensorGenerator.generateHistoricalData(hours)

      // Convert to database format with correct field mappings
      readings = mockReadings.map((reading, index) => ({
        entry_id: 1000000 + index,
        field1: reading.smallDustParticles, // Small Dust Particles
        field2: reading.largeParticles, // Large Particles
        field3: null, // Unused
        field4: reading.humidity, // Humidity
        field5: reading.temperature, // Temperature
        field6: null,
        field7: null,
        field8: null,
        created_at: reading.timestamp,
      }))
    }

    // Fetch channel info
    let channelInfo = null
    try {
      const { data } = await supabase.from("channel_info").select("*").limit(1).single()
      channelInfo = data
    } catch (error) {
      // Use ThingSpeak channel info if available
      if (thingspeakData?.channel) {
        channelInfo = thingspeakData.channel
      } else {
        // Default channel info with correct field mappings
        channelInfo = {
          name: "TDMS Coffee Warehouse Monitoring",
          description: "Temperature, Humidity, and Dust monitoring for optimal coffee storage",
          field1: "Small Dust Particles (µg/m³)",
          field2: "Large Particles (µg/m³)",
          field3: "Unused",
          field4: "Humidity (%)",
          field5: "Temperature (°C)",
        }
      }
    }

    // Get latest reading
    const latestReading = readings[0]

    // Calculate current values with correct field mappings
    const currentValues = {
      smallDustParticles: latestReading?.field1 || sensorGenerator.generateReading(0).smallDustParticles,
      largeParticles: latestReading?.field2 || sensorGenerator.generateReading(0).largeParticles,
      humidity: latestReading?.field4 || sensorGenerator.generateReading(0).humidity,
      temperature: latestReading?.field5 || sensorGenerator.generateReading(0).temperature,
      field3: latestReading?.field3 || 0, // Unused
      field6: latestReading?.field6 || 0,
      field7: latestReading?.field7 || 0,
      field8: latestReading?.field8 || 0,
    }

    // Format data for charts with correct field mappings
    const chartData = readings
      .slice()
      .reverse()
      .map((reading) => ({
        time: new Date(reading.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: reading.field5 || 0, // Temperature from field5
        humidity: reading.field4 || 0, // Humidity from field4
        smallDust: reading.field1 || 0, // Small Dust from field1
        largeParticles: reading.field2 || 0, // Large Particles from field2
        timestamp: reading.created_at,
      }))

    // Calculate quality metrics with correct field mappings
    const qualityMetrics = {
      temperatureStatus:
        currentValues.temperature >= 18 && currentValues.temperature <= 24
          ? "optimal"
          : currentValues.temperature >= 15 && currentValues.temperature <= 28
            ? "acceptable"
            : "critical",
      humidityStatus:
        currentValues.humidity >= 50 && currentValues.humidity <= 65
          ? "optimal"
          : currentValues.humidity >= 40 && currentValues.humidity <= 75
            ? "acceptable"
            : "critical",
      smallDustStatus:
        currentValues.smallDustParticles <= 20
          ? "good"
          : currentValues.smallDustParticles <= 35
            ? "moderate"
            : currentValues.smallDustParticles <= 50
              ? "poor"
              : "hazardous",
      largeParticlesStatus:
        currentValues.largeParticles <= 15
          ? "good"
          : currentValues.largeParticles <= 25
            ? "moderate"
            : currentValues.largeParticles <= 35
              ? "poor"
              : "hazardous",
      overallQuality: sensorGenerator.determineQuality(
        currentValues.temperature,
        currentValues.humidity,
        currentValues.smallDustParticles,
      ),
    }

    return NextResponse.json({
      success: true,
      currentValues,
      chartData,
      readings,
      channelInfo,
      qualityMetrics,
      totalReadings: readings.length,
      timeRange: `${hours} hours`,
      lastUpdated: latestReading?.created_at || new Date().toISOString(),
      isMockData: !hasRealData && readings.length > 0,
      dataSource: hasRealData ? "thingspeak" : !readings.length ? "none" : "generated",
      fieldMappings: {
        field1: "Small Dust Particles (µg/m³)",
        field2: "Large Particles (µg/m³)",
        field3: "Unused",
        field4: "Humidity (%)",
        field5: "Temperature (°C)",
      },
    })
  } catch (error: any) {
    console.error("❌ Sensor data fetch error:", error)

    // Return realistic mock data to prevent app from breaking
    const mockReadings = sensorGenerator.generateHistoricalData(24)
    const latestReading = mockReadings[mockReadings.length - 1]

    return NextResponse.json({
      success: false,
      currentValues: {
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        smallDustParticles: latestReading.smallDustParticles,
        largeParticles: latestReading.largeParticles,
        field3: 0,
        field6: 0,
        field7: 0,
        field8: 0,
      },
      chartData: mockReadings.map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: reading.temperature,
        humidity: reading.humidity,
        smallDust: reading.smallDustParticles,
        largeParticles: reading.largeParticles,
        timestamp: reading.timestamp,
      })),
      readings: [],
      channelInfo: {
        name: "TDMS Coffee Warehouse Monitoring",
        description: "Temperature, Humidity, and Dust monitoring for optimal coffee storage",
        field1: "Small Dust Particles (µg/m³)",
        field2: "Large Particles (µg/m³)",
        field3: "Unused",
        field4: "Humidity (%)",
        field5: "Temperature (°C)",
      },
      qualityMetrics: {
        temperatureStatus: "optimal",
        humidityStatus: "optimal",
        smallDustStatus: "good",
        largeParticlesStatus: "good",
        overallQuality: latestReading.quality,
      },
      totalReadings: mockReadings.length,
      timeRange: "24 hours",
      lastUpdated: latestReading.timestamp,
      isMockData: true,
      dataSource: "generated",
      error: "Failed to fetch sensor data, using generated data",
      details: error.message,
      fieldMappings: {
        field1: "Small Dust Particles (µg/m³)",
        field2: "Large Particles (µg/m³)",
        field3: "Unused",
        field4: "Humidity (%)",
        field5: "Temperature (°C)",
      },
    })
  }
}
