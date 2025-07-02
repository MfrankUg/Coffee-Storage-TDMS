import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    console.log("🧪 Testing Supabase connection...")

    // Test 1: Check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from("sensor_readings")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("❌ Connection test failed:", connectionError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
        tests: {
          connection: false,
          tables: false,
          policies: false,
        },
      })
    }

    console.log("✅ Database connection successful")

    // Test 2: Check if tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from("channel_info")
      .select("count", { count: "exact", head: true })

    const tablesExist = !tablesError
    console.log(tablesExist ? "✅ Tables exist" : "❌ Tables missing")

    // Test 3: Try to insert a test record
    const testReading = {
      entry_id: 999999, // Use a high number to avoid conflicts
      field1: 25.0,
      field2: 60.0,
      field3: 30.0,
      created_at: new Date().toISOString(),
    }

    const { data: insertData, error: insertError } = await supabase
      .from("sensor_readings")
      .upsert(testReading, { onConflict: "entry_id" })

    const canWrite = !insertError
    console.log(canWrite ? "✅ Write permissions working" : "❌ Write permissions failed")

    if (insertError) {
      console.error("Write test error:", insertError)
    }

    // Test 4: Try to read the test record
    const { data: readData, error: readError } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("entry_id", 999999)
      .single()

    const canRead = !readError && readData
    console.log(canRead ? "✅ Read permissions working" : "❌ Read permissions failed")

    // Clean up test record
    if (canWrite) {
      await supabase.from("sensor_readings").delete().eq("entry_id", 999999)
      console.log("🧹 Cleaned up test record")
    }

    // Get current record count
    const { count: totalRecords } = await supabase.from("sensor_readings").select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      message: "Supabase connection test completed",
      tests: {
        connection: true,
        tables: tablesExist,
        canRead: canRead,
        canWrite: canWrite,
        policies: canRead && canWrite,
      },
      database: {
        totalRecords: totalRecords || 0,
        lastTested: new Date().toISOString(),
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error: any) {
    console.error("❌ Supabase test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Supabase test failed",
        details: error.message,
        tests: {
          connection: false,
          tables: false,
          policies: false,
        },
      },
      { status: 500 },
    )
  }
}
