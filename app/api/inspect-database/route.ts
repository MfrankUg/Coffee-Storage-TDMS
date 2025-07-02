import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Starting database inspection...")

    const supabase = createServerSupabaseClient()
    const results: any = {
      tables: [],
      sensorReadings: [],
      channelInfo: [],
      recentReadings: [],
      statistics: {},
      connectionStatus: {},
      policies: [],
      indexes: [],
    }

    // Test connection
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from("sensor_readings")
        .select("count", { count: "exact", head: true })

      results.connectionStatus = {
        connected: !connectionError,
        error: connectionError?.message,
        database: "postgres",
        host: process.env.POSTGRES_HOST || "supabase",
      }

      console.log("✅ Connection test:", results.connectionStatus.connected ? "Success" : "Failed")
    } catch (error: any) {
      results.connectionStatus = {
        connected: false,
        error: error.message,
        database: "unknown",
        host: "unknown",
      }
    }

    // Get table information
    try {
      const { data: tables, error: tablesError } = await supabase.rpc("get_table_info").select("*")

      if (!tablesError && tables) {
        results.tables = tables
      } else {
        // Fallback: manually check key tables
        const keyTables = ["sensor_readings", "channel_info"]
        for (const tableName of keyTables) {
          try {
            const { data, error } = await supabase.from(tableName).select("count", { count: "exact", head: true })

            results.tables.push({
              table_name: tableName,
              table_type: "BASE TABLE",
              row_count: data?.length || 0,
              exists: !error,
              size: "Unknown",
            })
          } catch (e) {
            results.tables.push({
              table_name: tableName,
              table_type: "BASE TABLE",
              row_count: 0,
              exists: false,
              size: "Unknown",
            })
          }
        }
      }

      console.log(`📊 Found ${results.tables.length} tables`)
    } catch (error: any) {
      console.log("⚠️ Table inspection failed:", error.message)
    }

    // Get recent sensor readings
    try {
      const { data: readings, error: readingsError } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (!readingsError && readings) {
        results.recentReadings = readings
        console.log(`📈 Retrieved ${readings.length} recent readings`)
      }
    } catch (error: any) {
      console.log("⚠️ Sensor readings query failed:", error.message)
    }

    // Get channel information
    try {
      const { data: channels, error: channelsError } = await supabase.from("channel_info").select("*")

      if (!channelsError && channels) {
        results.channelInfo = channels
        console.log(`📡 Retrieved ${channels.length} channel records`)
      }
    } catch (error: any) {
      console.log("⚠️ Channel info query failed:", error.message)
    }

    // Calculate statistics
    try {
      // Total readings
      const { count: totalReadings } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })

      // Today's readings
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayReadings } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())

      // This week's readings
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: weekReadings } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())

      // This month's readings
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const { count: monthReadings } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo.toISOString())

      // Get latest reading for last update time
      const { data: latestReading } = await supabase
        .from("sensor_readings")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Data quality metrics
      const { count: completeRecords } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .not("field1", "is", null)
        .not("field4", "is", null)
        .not("field5", "is", null)

      const { count: missingTemp } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .is("field5", null)

      const { count: missingHumidity } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .is("field4", null)

      const { count: missingDust } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true })
        .is("field1", null)

      // Get data ranges
      const { data: tempRange } = await supabase.rpc("get_field_range", { field_name: "field5" })

      const { data: humidityRange } = await supabase.rpc("get_field_range", { field_name: "field4" })

      const { data: dustRange } = await supabase.rpc("get_field_range", { field_name: "field1" })

      results.statistics = {
        totalReadings: totalReadings || 0,
        todayReadings: todayReadings || 0,
        weekReadings: weekReadings || 0,
        monthReadings: monthReadings || 0,
        lastUpdate: latestReading?.created_at,
        completeRecords: totalReadings ? Math.round(((completeRecords || 0) / totalReadings) * 100) : 0,
        missingTemp: missingTemp || 0,
        missingHumidity: missingHumidity || 0,
        missingDust: missingDust || 0,
        tempRange: tempRange?.[0] || null,
        humidityRange: humidityRange?.[0] || null,
        dustRange: dustRange?.[0] || null,
      }

      console.log("📊 Statistics calculated successfully")
    } catch (error: any) {
      console.log("⚠️ Statistics calculation failed:", error.message)
      results.statistics = {
        totalReadings: 0,
        todayReadings: 0,
        weekReadings: 0,
        monthReadings: 0,
        lastUpdate: null,
        completeRecords: 0,
        missingTemp: 0,
        missingHumidity: 0,
        missingDust: 0,
      }
    }

    // Get RLS policies (if accessible)
    try {
      const { data: policies, error: policiesError } = await supabase
        .from("pg_policies")
        .select("*")
        .in("tablename", ["sensor_readings", "channel_info"])

      if (!policiesError && policies) {
        results.policies = policies
        console.log(`🔒 Retrieved ${policies.length} RLS policies`)
      }
    } catch (error: any) {
      console.log("⚠️ RLS policies query failed (expected in some setups):", error.message)
    }

    // Get index information (if accessible)
    try {
      const { data: indexes, error: indexesError } = await supabase
        .from("pg_indexes")
        .select("*")
        .in("tablename", ["sensor_readings", "channel_info"])

      if (!indexesError && indexes) {
        results.indexes = indexes
        console.log(`📇 Retrieved ${indexes.length} indexes`)
      }
    } catch (error: any) {
      console.log("⚠️ Index information query failed (expected in some setups):", error.message)
    }

    console.log("✅ Database inspection completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database inspection completed",
      ...results,
      inspectionTime: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Database inspection failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database inspection failed",
        connectionStatus: {
          connected: false,
          error: error.message,
          database: "unknown",
          host: "unknown",
        },
        tables: [],
        sensorReadings: [],
        channelInfo: [],
        recentReadings: [],
        statistics: {},
        policies: [],
        indexes: [],
      },
      { status: 500 },
    )
  }
}
