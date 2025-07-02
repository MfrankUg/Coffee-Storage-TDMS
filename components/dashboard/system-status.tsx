"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Wifi, Clock, CheckCircle, Info, Zap, AlertTriangle } from "lucide-react"
import { useSensorData } from "@/hooks/use-sensor-data"

export default function SystemStatus() {
  const { lastSync, isUsingMockData, error, syncInterval, consecutiveErrors } = useSensorData(24, true)
  const [systemHealth, setSystemHealth] = useState<"excellent" | "good" | "warning" | "error">("good")

  useEffect(() => {
    if (consecutiveErrors >= 3) {
      setSystemHealth("error")
    } else if (error || consecutiveErrors >= 1) {
      setSystemHealth("warning")
    } else if (isUsingMockData) {
      setSystemHealth("good")
    } else if (lastSync && Date.now() - lastSync.getTime() < 2 * 60 * 1000) {
      setSystemHealth("excellent")
    } else {
      setSystemHealth("good")
    }
  }, [error, isUsingMockData, lastSync, consecutiveErrors])

  const getHealthColor = () => {
    switch (systemHealth) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-green-500"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  const getHealthMessage = () => {
    switch (systemHealth) {
      case "excellent":
        return "All systems optimal"
      case "good":
        return "Systems operational"
      case "warning":
        return "Minor issues detected"
      case "error":
        return "System issues detected"
      default:
        return "Status unknown"
    }
  }

  const getDataSourceMessage = () => {
    if (isUsingMockData) {
      return "Demo mode - Using simulated data"
    }
    if (lastSync) {
      const minutesAgo = Math.floor((Date.now() - lastSync.getTime()) / 60000)
      return `Last updated ${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`
    }
    return "Initializing data connection"
  }

  const getSyncIntervalMessage = () => {
    if (syncInterval <= 30) {
      return `Fast sync (${syncInterval}s) - Real-time monitoring`
    } else if (syncInterval <= 60) {
      return `Normal sync (${syncInterval}s) - Balanced performance`
    } else if (syncInterval <= 120) {
      return `Slow sync (${syncInterval}s) - Conservative mode`
    } else {
      return `Fallback sync (${syncInterval}s) - Error recovery`
    }
  }

  const getSyncIcon = () => {
    if (syncInterval <= 30) {
      return <Zap className="h-3 w-3 text-green-500" />
    } else if (syncInterval <= 60) {
      return <Clock className="h-3 w-3 text-blue-500" />
    } else if (syncInterval <= 120) {
      return <Clock className="h-3 w-3 text-yellow-500" />
    } else {
      return <AlertTriangle className="h-3 w-3 text-red-500" />
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className={`h-4 w-4 ${getHealthColor()}`} />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`h-3 w-3 ${getHealthColor()}`} />
              <span className={`text-xs font-medium ${getHealthColor()}`}>
                {systemHealth === "error" ? "Offline" : "Online"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getSyncIcon()}
              <span className="text-xs text-gray-500">{syncInterval}s sync</span>
            </div>
          </div>

          <div
            className={`text-xs p-2 rounded flex items-center gap-2 ${
              systemHealth === "excellent" || systemHealth === "good"
                ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                : systemHealth === "warning"
                  ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                  : "text-red-600 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <CheckCircle className="h-3 w-3" />
            <span>{getHealthMessage()}</span>
          </div>

          <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>{getDataSourceMessage()}</span>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-1">
              {getSyncIcon()}
              <span>{getSyncIntervalMessage()}</span>
            </div>
            {consecutiveErrors > 0 && (
              <div className="mt-1 text-xs text-yellow-600">
                {consecutiveErrors} error{consecutiveErrors !== 1 ? "s" : ""} - interval adjusted
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
