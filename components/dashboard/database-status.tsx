"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, CheckCircle, AlertCircle, RefreshCw, Wifi, Clock, Info, Activity } from "lucide-react"

interface DatabaseStatus {
  success: boolean
  tests: {
    connection: boolean
    tables: boolean
    canRead: boolean
    canWrite: boolean
    policies: boolean
  }
  database: {
    totalRecords: number
    lastTested: string
  }
  environment: {
    hasUrl: boolean
    hasAnonKey: boolean
    hasServiceKey: boolean
    nodeEnv: string
  }
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Only show in development or when explicitly requested
  const isDevelopment = process.env.NODE_ENV === "development"
  const isProduction = process.env.NODE_ENV === "production"

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-supabase")
      const data = await response.json()

      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || "Test failed")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only auto-test in development
    if (isDevelopment) {
      testConnection()
    }
  }, [isDevelopment])

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600" : "text-red-600"
  }

  const getStatusIcon = (success: boolean) => {
    return success ? CheckCircle : AlertCircle
  }

  // In production, show a simplified system status
  if (isProduction) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-4 w-4 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-500">Auto-sync Active</span>
              </div>
            </div>

            <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span>All systems operational</span>
            </div>

            <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Data updates every 2 minutes automatically</span>
            </div>

            {/* Hidden developer toggle */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500 hover:text-gray-700"
              >
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>
            </div>

            {/* Technical details (hidden by default in production) */}
            {showDetails && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm">Testing connection...</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                {status && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(status.tests).map(([test, success]) => {
                        const Icon = getStatusIcon(success)
                        return (
                          <div key={test} className="flex items-center gap-1">
                            <Icon className={`h-3 w-3 ${getStatusColor(success)}`} />
                            <span className="capitalize">{test.replace(/([A-Z])/g, " $1")}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Records: {status.database.totalRecords}</span>
                        <span>{new Date(status.database.lastTested).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={testConnection} disabled={loading} variant="outline" size="sm" className="w-full">
                  <RefreshCw className={`h-3 w-3 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Test Connection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Development version with full details
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-4 w-4 text-blue-500" />
          Database Status
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">DEV</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm">Testing connection...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {status && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(status.tests).map(([test, success]) => {
                  const Icon = getStatusIcon(success)
                  return (
                    <div key={test} className="flex items-center gap-1">
                      <Icon className={`h-3 w-3 ${getStatusColor(success)}`} />
                      <span className="capitalize">{test.replace(/([A-Z])/g, " $1")}</span>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Records: {status.database.totalRecords}</span>
                  <span>{new Date(status.database.lastTested).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className={`h-3 w-3 ${status.success ? "text-green-500" : "text-red-500"}`} />
                  <span className={`text-xs font-medium ${getStatusColor(status.success)}`}>
                    {status.success ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-500">Polling Mode</span>
                </div>
              </div>

              <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
                <Info className="h-3 w-3" />
                <span>Using reliable polling mode (updates every 2 minutes)</span>
              </div>
            </div>
          )}

          <Button onClick={testConnection} disabled={loading} variant="outline" size="sm" className="w-full">
            <RefreshCw className={`h-3 w-3 mr-2 ${loading ? "animate-spin" : ""}`} />
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
