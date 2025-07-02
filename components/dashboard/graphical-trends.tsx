"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/ui/chart"
import { ReferenceLine } from "recharts"
import { useSensorData } from "@/hooks/use-sensor-data"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Wifi, AlertTriangle } from "lucide-react"

export default function GraphicalTrends() {
  const [timeRange, setTimeRange] = useState("24h")
  const hours = timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720 // 24h, 7d, 30d
  const { data, loading, error, lastSync, syncThingSpeak, isUsingMockData } = useSensorData(hours, true)

  const handleManualSync = async () => {
    try {
      await syncThingSpeak()
    } catch (error) {
      console.error("Manual sync failed:", error)
    }
  }

  const LoadingSpinner = ({ color }: { color: string }) => (
    <div className="flex items-center justify-center h-full">
      <div
        className={`animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 border-b-2 border-${color}-500`}
      ></div>
    </div>
  )

  if (error && !data) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading chart data: {error}</p>
            <Button onClick={handleManualSync} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data?.chartData || []

  // Safely access current values with fallbacks to prevent undefined errors
  const currentValues = data?.currentValues || {
    temperature: 0,
    humidity: 0,
    smallDustParticles: 0,
    largeParticles: 0,
  }

  // Custom tick formatter for y-axis
  const formatTemperatureYAxis = (value: number) => `${value}°C`
  const formatHumidityYAxis = (value: number) => `${value}%`
  const formatDustYAxis = (value: number) => `${value}`

  // Custom tooltip formatter
  const temperatureTooltipFormatter = (value: any) => [`${value.toFixed(1)}°C`, "Temperature"]
  const humidityTooltipFormatter = (value: any) => [`${value.toFixed(1)}%`, "Humidity"]
  const smallDustTooltipFormatter = (value: any) => [`${value.toFixed(1)} µg/m³`, "Small Dust"]
  const largeParticlesTooltipFormatter = (value: any) => [`${value.toFixed(1)} µg/m³`, "Large Particles"]

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-0">
          <div className="flex items-center gap-1 xs:gap-2">
            <CardTitle className="text-base xs:text-lg sm:text-xl">Real-Time Sensor Data</CardTitle>
            {data?.lastUpdated && !isUsingMockData && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="h-3 w-3" />
                Live
              </div>
            )}
            {isUsingMockData && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Demo Data
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleManualSync}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <Database className="h-3 w-3" />
              <span className="hidden xs:inline">Sync</span>
            </Button>
            <Tabs defaultValue="24h" value={timeRange} onValueChange={setTimeRange}>
              <TabsList className="grid w-full grid-cols-3 h-7">
                <TabsTrigger value="24h" className="text-xs px-1 xs:px-2">
                  24h
                </TabsTrigger>
                <TabsTrigger value="7d" className="text-xs px-1 xs:px-2">
                  7d
                </TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-1 xs:px-2">
                  30d
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {lastSync && (
          <p className="text-xs text-gray-500">
            Last synced: {lastSync.toLocaleString()} • {data?.totalReadings || 0} readings
            {isUsingMockData && " (Demo data for visualization)"}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Temperature Chart */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
              Temperature vs Time
              <span className="text-orange-500 font-bold text-base sm:text-lg">
                {currentValues.temperature.toFixed(1)}°C
              </span>
            </h3>
            <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-2 sm:p-4 border">
              {loading ? (
                <LoadingSpinner color="orange" />
              ) : (
                <Suspense fallback={<LoadingSpinner color="orange" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f97316" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={[0, 60]} // 0°C to 60°C range
                        ticks={[0, 10, 18, 24, 30, 40, 50, 60]}
                        tickFormatter={formatTemperatureYAxis}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(249, 115, 22, 0.1)",
                          border: "1px solid #f97316",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={temperatureTooltipFormatter}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      {/* Reference lines for optimal range */}
                      <ReferenceLine y={18} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={24} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 3 }}
                        name="Temperature"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              )}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 px-2">
              <span>Optimal: 18-24°C</span>
              <span>Range: 0-60°C</span>
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
              Humidity vs Time
              <span className="text-blue-500 font-bold text-base sm:text-lg">{currentValues.humidity.toFixed(1)}%</span>
            </h3>
            <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-2 sm:p-4 border">
              {loading ? (
                <LoadingSpinner color="blue" />
              ) : (
                <Suspense fallback={<LoadingSpinner color="blue" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0ea5e9" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={[0, 90]} // 0% to 90% range
                        ticks={[0, 10, 20, 30, 40, 50, 65, 75, 90]}
                        tickFormatter={formatHumidityYAxis}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(14, 165, 233, 0.1)",
                          border: "1px solid #0ea5e9",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={humidityTooltipFormatter}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      {/* Reference lines for optimal range */}
                      <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={65} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, stroke: "#0ea5e9", strokeWidth: 3 }}
                        name="Humidity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              )}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 px-2">
              <span>Optimal: 50-65%</span>
              <span>Range: 0-90%</span>
            </div>
          </div>

          {/* Small Dust Particles Chart */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
              Small Dust Particles (PM2.5)
              <span className="text-purple-500 font-bold text-base sm:text-lg">
                {currentValues.smallDustParticles.toFixed(1)} µg/m³
              </span>
            </h3>
            <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-2 sm:p-4 border">
              {loading ? (
                <LoadingSpinner color="purple" />
              ) : (
                <Suspense fallback={<LoadingSpinner color="purple" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={[0, 100]} // Changed from [0, 500] to [0, 100]
                        ticks={[0, 15, 20, 35, 45, 60, 80, 100]} // Updated tick marks for better granularity
                        tickFormatter={formatDustYAxis}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          border: "1px solid #8b5cf6",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={smallDustTooltipFormatter}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      {/* Reference lines for thresholds */}
                      <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={35} stroke="#eab308" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="smallDust"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 3 }}
                        name="Small Dust"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              )}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 px-2">
              <span>Target: &lt;20 µg/m³</span>
              <span>Range: 0-100 µg/m³</span> {/* Changed from 0-500 */}
            </div>
          </div>

          {/* Large Particles Chart */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
              Large Particles
              <span className="text-green-500 font-bold text-base sm:text-lg">
                {currentValues.largeParticles.toFixed(1)} µg/m³
              </span>
            </h3>
            <div className="relative h-64 sm:h-80 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 sm:p-4 border">
              {loading ? (
                <LoadingSpinner color="green" />
              ) : (
                <Suspense fallback={<LoadingSpinner color="green" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={[0, 100]} // Changed from [0, 500] to [0, 100]
                        ticks={[0, 15, 25, 35, 50, 75, 100]} // Updated tick marks for better granularity
                        tickFormatter={formatDustYAxis}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          border: "1px solid #10b981",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={largeParticlesTooltipFormatter}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      {/* Reference lines for thresholds */}
                      <ReferenceLine y={15} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={25} stroke="#eab308" strokeDasharray="5 5" strokeWidth={2} />
                      <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="largeParticles"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 3 }}
                        name="Large Particles"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              )}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 px-2">
              <span>Target: &lt;15 µg/m³</span>
              <span>Range: 0-100 µg/m³</span> {/* Changed from 0-500 */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
