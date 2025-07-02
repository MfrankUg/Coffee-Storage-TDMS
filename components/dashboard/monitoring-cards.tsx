"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Wind, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useSensorData } from "@/hooks/use-sensor-data"
import { Button } from "@/components/ui/button"
import {
  getTemperatureStatus,
  getHumidityStatus,
  getSmallDustStatus,
  getLargeParticlesStatus,
  formatTemperature,
  formatHumidity,
  formatSmallDustLevel,
  formatLargeParticles,
} from "@/lib/sensor-data-generator"

export default function MonitoringCards() {
  const { data, loading, error, lastSync, syncThingSpeak, isUsingMockData } = useSensorData(24, true)

  const handleManualSync = async () => {
    try {
      await syncThingSpeak()
    } catch (error) {
      console.error("Manual sync failed:", error)
    }
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-md hover:shadow-lg transition-shadow animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (error && !data) {
    return (
      <Card className="shadow-md col-span-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading sensor data: {error}</p>
            <Button onClick={handleManualSync} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentValues = data?.currentValues || {
    temperature: 0,
    humidity: 0,
    smallDustParticles: 0,
    largeParticles: 0,
  }

  const qualityMetrics = data?.qualityMetrics || {
    temperatureStatus: "optimal",
    humidityStatus: "optimal",
    smallDustStatus: "good",
    largeParticlesStatus: "good",
    overallQuality: "excellent",
  }

  // Get status information for each metric
  const tempStatus = getTemperatureStatus(currentValues.temperature)
  const humidityStatus = getHumidityStatus(currentValues.humidity)
  const smallDustStatus = getSmallDustStatus(currentValues.smallDustParticles)
  const largeParticlesStatus = getLargeParticlesStatus(currentValues.largeParticles)

  return (
    <>
      {/* Temperature Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-1 xs:pb-2 space-y-0">
          <CardTitle className="text-xs xs:text-sm font-medium text-gray-500">Temperature</CardTitle>
          <div className="flex items-center gap-1">
            <Thermometer className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${tempStatus.color}`} />
            {tempStatus.status === "Optimal" && <CheckCircle className="h-3 w-3 text-green-500" />}
            {tempStatus.status !== "Optimal" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold">
            <span className={tempStatus.color}>{formatTemperature(currentValues.temperature)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${tempStatus.color}`}>{tempStatus.status}</span>
            <span className="text-xs text-gray-500">• Ideal: 18-24°C</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {currentValues.temperature >= 18 && currentValues.temperature <= 24
              ? "Perfect for coffee storage"
              : currentValues.temperature < 18
                ? "Too cold - may affect quality"
                : currentValues.temperature <= 28
                  ? "Slightly warm - monitor closely"
                  : "Too hot - immediate action needed"}
          </p>
          {lastSync && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastSync.toLocaleTimeString()}
              {isUsingMockData && " (Demo)"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Humidity Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-1 xs:pb-2 space-y-0">
          <CardTitle className="text-xs xs:text-sm font-medium text-gray-500">Humidity</CardTitle>
          <div className="flex items-center gap-1">
            <Droplets className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${humidityStatus.color}`} />
            {humidityStatus.status === "Optimal" && <CheckCircle className="h-3 w-3 text-green-500" />}
            {humidityStatus.status !== "Optimal" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold">
            <span className={humidityStatus.color}>{formatHumidity(currentValues.humidity)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${humidityStatus.color}`}>{humidityStatus.status}</span>
            <span className="text-xs text-gray-500">• Ideal: 50-65%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {currentValues.humidity >= 50 && currentValues.humidity <= 65
              ? "Optimal for coffee preservation"
              : currentValues.humidity < 50
                ? "Too dry - beans may lose flavor"
                : currentValues.humidity <= 75
                  ? "Slightly humid - watch for mold"
                  : "Too humid - mold risk high"}
          </p>
          {lastSync && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastSync.toLocaleTimeString()}
              {isUsingMockData && " (Demo)"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Combined Dust Monitoring Card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-1 xs:pb-2 space-y-0">
          <CardTitle className="text-xs xs:text-sm font-medium text-gray-500">Dust Monitoring</CardTitle>
          <div className="flex items-center gap-1">
            <Wind className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${smallDustStatus.color}`} />
            {smallDustStatus.status === "Good" && largeParticlesStatus.status === "Good" && (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
            {(smallDustStatus.status !== "Good" || largeParticlesStatus.status !== "Good") && (
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Small Dust Particles */}
          <div className="mb-2 xs:mb-3">
            <div className="flex items-center justify-between mb-0.5 xs:mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Small Particles (PM2.5)</span>
              <span className={`text-base xs:text-lg sm:text-xl font-bold ${smallDustStatus.color}`}>
                {formatSmallDustLevel(currentValues.smallDustParticles)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${smallDustStatus.color}`}>{smallDustStatus.status}</span>
              <span className="text-xs text-gray-500">• Target: &lt;20 µg/m³</span>
            </div>
          </div>

          {/* Large Particles */}
          <div className="mb-2 xs:mb-3 pb-2 xs:pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-0.5 xs:mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Large Particles</span>
              <span className={`text-base xs:text-lg sm:text-xl font-bold ${largeParticlesStatus.color}`}>
                {formatLargeParticles(currentValues.largeParticles)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${largeParticlesStatus.color}`}>{largeParticlesStatus.status}</span>
              <span className="text-xs text-gray-500">• Target: &lt;15 µg/m³</span>
            </div>
          </div>

          {/* Overall Assessment */}
          <div>
            <p className="text-xs text-gray-500 mb-1 xs:mb-2 line-clamp-2">
              {currentValues.smallDustParticles <= 20 && currentValues.largeParticles <= 15
                ? "Excellent air quality for coffee storage"
                : currentValues.smallDustParticles <= 35 && currentValues.largeParticles <= 25
                  ? "Moderate air quality - cleaning recommended"
                  : currentValues.smallDustParticles <= 50 && currentValues.largeParticles <= 35
                    ? "Poor air quality - cleaning needed soon"
                    : "Critical air quality - immediate cleaning required"}
            </p>
            {lastSync && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastSync.toLocaleTimeString()}
                {isUsingMockData && " (Demo)"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Indicator - Only show if using mock data */}
      {(isUsingMockData || data?.dataSource === "generated") && (
        <div className="col-span-full mt-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 xs:p-3 flex flex-wrap items-center gap-2">
            <AlertTriangle className="h-3 w-3 xs:h-4 xs:w-4 text-blue-600" />
            <p className="text-xs text-blue-700 dark:text-blue-300 flex-1 min-w-[150px]">
              Using realistic demo data for coffee warehouse monitoring.
              {data?.dataSource === "generated"
                ? " Generated based on optimal coffee storage conditions."
                : " Connect to real sensors for live data."}
            </p>
            <Button onClick={handleManualSync} variant="outline" size="sm" className="ml-auto text-xs h-7 px-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Real Data
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
