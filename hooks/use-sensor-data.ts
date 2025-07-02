"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { SensorReading } from "@/lib/supabase"

interface SensorData {
  currentValues: {
    temperature: number
    humidity: number
    smallDustParticles: number
    largeParticles: number
    field3: number
    field6: number
    field7: number
    field8: number
  }
  chartData: Array<{
    time: string
    temperature: number
    humidity: number
    smallDust: number
    largeParticles: number
    timestamp: string
  }>
  readings: SensorReading[]
  channelInfo: any
  totalReadings: number
  timeRange: string
  lastUpdated: string | null
  isMockData?: boolean
  qualityMetrics?: {
    temperatureStatus: string
    humidityStatus: string
    smallDustStatus: string
    largeParticlesStatus: string
    overallQuality: string
  }
  fieldMappings?: {
    field1: string
    field2: string
    field3: string
    field4: string
    field5: string
  }
}

export function useSensorData(hours = 24, autoSync = true, enableRealtime = false) {
  const [data, setData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  const [syncInterval, setSyncInterval] = useState(30) // Start with 30 seconds
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)

  // Use refs to store the latest values without causing re-renders
  const fetchDataRef = useRef<(() => Promise<void>) | null>(null)
  const subscriptionRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/sensor-data?hours=${hours}&limit=100`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success || result.isMockData) {
        // Ensure chart data is properly formatted with appropriate ranges
        if (result.chartData && result.chartData.length > 0) {
          // Ensure values stay within reasonable ranges
          result.chartData = result.chartData.map((point: any) => ({
            ...point,
            temperature: Math.max(15, Math.min(30, point.temperature || 22)),
            humidity: Math.max(35, Math.min(85, point.humidity || 60)),
            smallDust: Math.max(0, Math.min(60, point.smallDust || 15)),
            largeParticles: Math.max(0, Math.min(40, point.largeParticles || 10)),
          }))
        }

        setData(result)
        setLastSync(new Date())
        setIsUsingMockData(!!result.isMockData)
        setConsecutiveErrors(0) // Reset error count on success

        if (result.isMockData) {
          console.log("⚠️ Using mock data for visualization")
        } else {
          console.log("✅ Real data loaded successfully")
        }
      } else {
        throw new Error(result.error || "Failed to fetch sensor data")
      }
    } catch (err: any) {
      console.error("❌ Error fetching sensor data:", err)
      setError(err.message)
      setConsecutiveErrors((prev) => prev + 1)

      // Create mock data for visualization
      const mockData = generateMockData(hours)
      setData(mockData)
      setIsUsingMockData(true)
      console.log("⚠️ Using generated mock data for visualization due to error")
    } finally {
      setLoading(false)
    }
  }, [hours])

  // Update the ref whenever fetchData changes
  useEffect(() => {
    fetchDataRef.current = fetchData
  }, [fetchData])

  const syncThingSpeak = useCallback(async () => {
    try {
      console.log("🔄 Syncing with ThingSpeak...")
      const response = await fetch("/api/sync-thingspeak", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        console.log("✅ ThingSpeak sync successful:", result.message)
        setConsecutiveErrors(0) // Reset error count on successful sync
        // Fetch updated data after sync
        if (fetchDataRef.current) {
          await fetchDataRef.current()
        }
        return result
      } else {
        console.log("⚠️ ThingSpeak sync completed with warnings:", result.error || "Unknown issue")
        setConsecutiveErrors((prev) => prev + 1)
        // Still try to fetch data even if sync had issues
        if (fetchDataRef.current) {
          await fetchDataRef.current()
        }
        return result
      }
    } catch (err: any) {
      console.error("❌ ThingSpeak sync error:", err)
      setConsecutiveErrors((prev) => prev + 1)
      // Don't throw the error, just log it and continue
      setError(`Sync warning: ${err.message}`)
      return { success: false, error: err.message }
    }
  }, [])

  // Dynamic interval calculation based on errors and conditions
  const calculateOptimalInterval = useCallback(() => {
    // Base intervals in seconds
    const FAST_INTERVAL = 30 // 30 seconds - optimal performance
    const NORMAL_INTERVAL = 60 // 1 minute - balanced
    const SLOW_INTERVAL = 120 // 2 minutes - conservative
    const FALLBACK_INTERVAL = 300 // 5 minutes - error recovery

    // If we have consecutive errors, slow down
    if (consecutiveErrors >= 3) {
      console.log("🐌 Using fallback interval due to consecutive errors")
      return FALLBACK_INTERVAL
    } else if (consecutiveErrors >= 1) {
      console.log("⚠️ Using slow interval due to errors")
      return SLOW_INTERVAL
    }

    // If using mock data, we can sync more frequently since it's local
    if (isUsingMockData) {
      console.log("⚡ Using fast interval for mock data")
      return FAST_INTERVAL
    }

    // Check if we have real sensor data and it's recent
    if (data && !isUsingMockData && lastSync) {
      const timeSinceLastSync = Date.now() - lastSync.getTime()

      // If last sync was recent and successful, use fast interval
      if (timeSinceLastSync < 2 * 60 * 1000) {
        // Less than 2 minutes ago
        console.log("⚡ Using fast interval - recent successful sync")
        return FAST_INTERVAL
      }
    }

    // Default to normal interval
    console.log("🔄 Using normal interval")
    return NORMAL_INTERVAL
  }, [consecutiveErrors, isUsingMockData, data, lastSync])

  // Generate mock data for visualization when real data is unavailable
  const generateMockData = (hours: number): SensorData => {
    const now = new Date()
    const chartData = Array.from({ length: Math.min(hours, 48) }, (_, i) => {
      const time = new Date(now.getTime() - i * 3600000)
      // Generate realistic values for coffee storage
      const hourOfDay = time.getHours()
      const dayFactor = Math.sin((hourOfDay / 24) * Math.PI * 2) // Daily cycle

      // Temperature varies between 18-26°C with daily pattern
      const temperature = 22 + dayFactor * 2 + (Math.random() - 0.5) * 2

      // Humidity varies between 50-70% inversely with temperature
      const humidity = 60 - dayFactor * 5 + (Math.random() - 0.5) * 5

      // Small dust accumulates over time (higher values later in the day)
      const smallDust = 15 + (hourOfDay / 24) * 10 + (Math.random() - 0.5) * 5

      // Large particles typically less than small dust
      const largeParticles = smallDust * 0.6 + (Math.random() - 0.5) * 3

      return {
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temperature: Math.max(15, Math.min(30, temperature)),
        humidity: Math.max(35, Math.min(85, humidity)),
        smallDust: Math.max(0, Math.min(60, smallDust)),
        largeParticles: Math.max(0, Math.min(40, largeParticles)),
        timestamp: time.toISOString(),
      }
    }).reverse()

    return {
      currentValues: {
        temperature: chartData[chartData.length - 1].temperature,
        humidity: chartData[chartData.length - 1].humidity,
        smallDustParticles: chartData[chartData.length - 1].smallDust,
        largeParticles: chartData[chartData.length - 1].largeParticles,
        field3: 0,
        field6: 0,
        field7: 0,
        field8: 0,
      },
      chartData,
      readings: [],
      channelInfo: null,
      totalReadings: chartData.length,
      timeRange: `${hours} hours`,
      lastUpdated: now.toISOString(),
      isMockData: true,
      qualityMetrics: {
        temperatureStatus: chartData[chartData.length - 1].temperature <= 24 ? "optimal" : "warning",
        humidityStatus: chartData[chartData.length - 1].humidity <= 65 ? "optimal" : "warning",
        smallDustStatus: chartData[chartData.length - 1].smallDust <= 20 ? "good" : "moderate",
        largeParticlesStatus: chartData[chartData.length - 1].largeParticles <= 15 ? "good" : "moderate",
        overallQuality: "good",
      },
      fieldMappings: {
        field1: "Small Dust Particles (µg/m³)",
        field2: "Large Particles (µg/m³)",
        field3: "Unused",
        field4: "Humidity (%)",
        field5: "Temperature (°C)",
      },
    }
  }

  // Cleanup subscription helper
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        console.log("🔄 Cleaning up real-time subscription")
        subscriptionRef.current.unsubscribe()
      } catch (cleanupError: any) {
        console.log("⚠️ Subscription cleanup warning:", cleanupError.message)
      } finally {
        subscriptionRef.current = null
        isSubscribedRef.current = false
        setRealtimeEnabled(false)
      }
    }
  }, [])

  // Setup real-time subscription (only if explicitly enabled)
  const setupRealtimeSubscription = useCallback(async () => {
    if (!enableRealtime || isSubscribedRef.current || isUsingMockData) {
      return
    }

    try {
      // Check if we have valid Supabase credentials
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log("⚠️ Supabase credentials not found, skipping real-time setup")
        return
      }

      // Test basic table access first
      const { data: testData, error: testError } = await supabase.from("sensor_readings").select("id").limit(1)

      if (testError) {
        console.log("⚠️ Cannot access sensor_readings table, skipping real-time setup:", testError.message)
        return
      }

      console.log("🔄 Setting up real-time subscription (experimental)")

      const channelName = `sensor_readings_${Date.now()}`
      const subscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sensor_readings",
          },
          (payload) => {
            console.log("📡 Real-time update received:", payload.eventType)
            if ((payload.eventType === "INSERT" || payload.eventType === "UPDATE") && fetchDataRef.current) {
              fetchDataRef.current()
            }
          },
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Real-time subscription active")
            setRealtimeEnabled(true)
            isSubscribedRef.current = true
          } else if (status === "CHANNEL_ERROR") {
            console.log("❌ Real-time subscription failed:", err?.message || "Unknown error")
            cleanupSubscription()
          }
        })

      subscriptionRef.current = subscription

      // Timeout to prevent hanging
      setTimeout(() => {
        if (!isSubscribedRef.current) {
          console.log("⚠️ Real-time subscription timeout")
          cleanupSubscription()
        }
      }, 10000)
    } catch (err: any) {
      console.log("⚠️ Real-time setup failed:", err.message)
      cleanupSubscription()
    }
  }, [enableRealtime, isUsingMockData, cleanupSubscription])

  // Setup auto-sync with dynamic intervals
  const setupAutoSync = useCallback(() => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
    }

    if (!autoSync) return

    // Calculate optimal interval
    const optimalInterval = calculateOptimalInterval()
    const intervalMs = optimalInterval * 1000

    console.log(`🔄 Setting up auto-sync: ${optimalInterval}s intervals (${intervalMs / 1000}s)`)
    setSyncInterval(optimalInterval)

    syncIntervalRef.current = setInterval(async () => {
      try {
        console.log(`🔄 Auto-sync triggered (${optimalInterval}s interval)`)
        await syncThingSpeak()

        // Recalculate interval after each sync in case conditions changed
        const newInterval = calculateOptimalInterval()
        if (newInterval !== optimalInterval) {
          console.log(`🔄 Interval changed from ${optimalInterval}s to ${newInterval}s`)
          setupAutoSync() // Restart with new interval
        }
      } catch (error: any) {
        console.error("Auto-sync failed:", error.message)
      }
    }, intervalMs)
  }, [autoSync, syncThingSpeak, calculateOptimalInterval])

  // Initial data fetch
  useEffect(() => {
    console.log("🚀 Initializing sensor data hook")
    fetchData()
  }, [fetchData])

  // Setup auto-sync after initial load
  useEffect(() => {
    if (!loading) {
      setupAutoSync()
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [loading, setupAutoSync, consecutiveErrors, isUsingMockData])

  // Setup real-time only if explicitly enabled
  useEffect(() => {
    if (!loading && enableRealtime && !isUsingMockData) {
      const timer = setTimeout(() => {
        setupRealtimeSubscription()
      }, 5000) // 5 second delay

      return () => clearTimeout(timer)
    }
  }, [loading, enableRealtime, isUsingMockData, setupRealtimeSubscription])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🔄 Sensor data hook unmounting")
      cleanupSubscription()
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [cleanupSubscription])

  return {
    data,
    loading,
    error,
    lastSync,
    isUsingMockData,
    realtimeEnabled,
    syncInterval, // Expose current interval
    consecutiveErrors, // Expose error count
    refetch: fetchData,
    syncThingSpeak,
  }
}
