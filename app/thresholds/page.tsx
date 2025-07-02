"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, Download, FileText, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSensorData } from "@/hooks/use-sensor-data"

// Get current sensor values (in a real app, this would come from your data source)

const thresholdData = [
  {
    metric: "Temperature",
    warningLevel: "> 24°C",
    criticalLevel: "> 28°C",
    justification:
      "Coffee beans should be stored between 18-24°C. Above 24°C accelerates staling, above 28°C causes rapid quality degradation.",
    unit: "°C",
    warningValue: 24,
    criticalValue: 28,
  },
  {
    metric: "Humidity",
    warningLevel: "> 65% RH",
    criticalLevel: "> 75% RH",
    justification:
      "Optimal humidity for coffee storage is 50-65%. Above 65% encourages mold growth, above 75% creates serious contamination risk.",
    unit: "%",
    warningValue: 65,
    criticalValue: 75,
  },
  {
    metric: "PM2.5 Dust",
    warningLevel: "> 20 µg/m³",
    criticalLevel: "> 35 µg/m³",
    justification:
      "Clean air is essential for coffee quality. Above 20 µg/m³ affects taste, above 35 µg/m³ requires immediate cleaning.",
    unit: "µg/m³",
    warningValue: 20,
    criticalValue: 35,
  },
]

export default function ThresholdsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { data } = useSensorData(24, true)
  const getCurrentValues = () => ({
    temperature: data?.currentValues?.temperature || 22.5,
    humidity: data?.currentValues?.humidity || 58,
    dust: data?.currentValues?.dustLevel || 18,
  })
  const currentValues = getCurrentValues()

  const getStatus = (metric: string, currentValue: number, warningValue: number, criticalValue: number) => {
    if (currentValue >= criticalValue) {
      return { status: "Critical", color: "text-red-600", icon: AlertCircle, bgColor: "bg-red-50 dark:bg-red-900/20" }
    } else if (currentValue >= warningValue) {
      return {
        status: "Warning",
        color: "text-yellow-600",
        icon: AlertTriangle,
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      }
    } else {
      return { status: "Safe", color: "text-green-600", icon: CheckCircle, bgColor: "bg-green-50 dark:bg-green-900/20" }
    }
  }

  const getCurrentValue = (metric: string) => {
    switch (metric) {
      case "Temperature":
        return currentValues.temperature
      case "Humidity":
        return currentValues.humidity
      case "PM2.5 Dust":
        return currentValues.dust
      default:
        return 0
    }
  }

  const generateCSVData = () => {
    const headers = ["Metric", "Current Value", "Coffee Safe Range", "Warning Level", "Critical Level", "Justification"]

    const rows = thresholdData.map((item) => {
      const currentValue = getCurrentValue(item.metric)
      const safeRange =
        item.metric === "Temperature" ? "18°C - 24°C" : item.metric === "Humidity" ? "50% - 65%" : "0 - 20 µg/m³"

      return [
        item.metric,
        `${currentValue.toFixed(1)}${item.unit}`,
        safeRange,
        item.warningLevel,
        item.criticalLevel,
        item.justification,
      ]
    })

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  const downloadCSV = () => {
    const csvData = generateCSVData()
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `TDMS_Thresholds_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDFContent = () => {
    const currentTime = new Date().toLocaleString()
    let content = `TDMS Threshold Report\nGenerated: ${currentTime}\n\n`

    content += "THRESHOLD COMPARISON\n"
    content += "=".repeat(50) + "\n\n"

    thresholdData.forEach((item) => {
      const currentValue = getCurrentValue(item.metric)
      const safeRange =
        item.metric === "Temperature" ? "18°C - 24°C" : item.metric === "Humidity" ? "50% - 65%" : "0 - 20 µg/m³"

      content += `${item.metric}:\n`
      content += `  Current Value: ${currentValue.toFixed(1)}${item.unit}\n`
      content += `  Safe Range: ${safeRange}\n`
      content += `  Warning Level: ${item.warningLevel}\n`
      content += `  Critical Level: ${item.criticalLevel}\n`
      content += `  Justification: ${item.justification}\n\n`
    })

    content += "\nNote: Thresholds are calibrated for sensor capabilities and optimized for coffee storage."

    return content
  }

  const downloadPDF = () => {
    const pdfContent = generatePDFContent()
    const blob = new Blob([pdfContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `TDMS_Thresholds_${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Count alerts
  const alertCount = thresholdData.filter((item) => {
    const currentValue = getCurrentValue(item.metric)
    return currentValue >= item.warningValue
  }).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#9b34f0] to-[#a84ce6] text-white shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Left Section - Navigation & Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 transition-colors duration-200 rounded-lg"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl lg:text-2xl text-white truncate">TDMS Thresholds</h1>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-3">
              {/* Review Schedule - Hidden on mobile */}
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-xs text-white/80 font-medium">Next Review</span>
                <span className="text-xs text-white/60">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>

              {/* Export Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center gap-1.5 px-2 sm:px-3"
                  onClick={downloadCSV}
                  aria-label="Export data as CSV"
                >
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">CSV</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center gap-1.5 px-2 sm:px-3"
                  onClick={downloadPDF}
                  aria-label="Export data as PDF"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">PDF</span>
                </Button>
              </div>

              {/* Mobile Menu - Only show on very small screens */}
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 transition-colors duration-200"
                  aria-label="More options"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Status Bar - Only visible on small screens */}
          <div className="sm:hidden border-t border-white/20 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-white/60" />
                <span className="text-white/70">
                  Updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/70">Next review:</span>
                <span className="text-white/80 font-medium">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Alert Summary */}
        <div className="mb-6">
          <div
            className={`p-4 rounded-lg border ${
              alertCount > 0
                ? alertCount > 1
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {alertCount > 0 ? (
                  alertCount > 1 ? (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  )
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {alertCount > 0
                      ? alertCount > 1
                        ? `${alertCount} Critical Thresholds Exceeded`
                        : "Warning Threshold Exceeded"
                      : "All Parameters Within Safe Ranges"}
                  </h2>
                  <p
                    className={`text-sm ${
                      alertCount > 0
                        ? alertCount > 1
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {alertCount > 0
                      ? "Immediate attention required to maintain optimal coffee storage conditions"
                      : "Coffee storage conditions are optimal"}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <Badge
                  variant="outline"
                  className={`${
                    alertCount > 0
                      ? alertCount > 1
                        ? "border-red-500 text-red-600 dark:text-red-400"
                        : "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                      : "border-green-500 text-green-600 dark:text-green-400"
                  }`}
                >
                  Last checked: {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Thresholds</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold">Threshold Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {thresholdData.map((item) => {
                    const currentValue = getCurrentValue(item.metric)
                    const status = getStatus(item.metric, currentValue, item.warningValue, item.criticalValue)
                    const StatusIcon = status.icon
                    const safeRange =
                      item.metric === "Temperature"
                        ? "18°C - 24°C"
                        : item.metric === "Humidity"
                          ? "50% - 65%"
                          : "0 - 20 µg/m³"

                    return (
                      <Card key={item.metric} className="overflow-hidden">
                        <div
                          className={`h-2 w-full ${
                            status.status === "Critical"
                              ? "bg-red-500"
                              : status.status === "Warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        ></div>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{item.metric}</h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bgColor}`}>
                              <StatusIcon className={`h-3 w-3 ${status.color}`} />
                              <span className={`text-xs font-medium ${status.color}`}>{status.status}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm text-gray-500">Current</span>
                            <span className="text-2xl font-bold">
                              {currentValue.toFixed(1)}
                              {item.unit}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Safe Range</span>
                              <span>{safeRange}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-600">Warning</span>
                              <span className="text-yellow-600">{item.warningLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-600">Critical</span>
                              <span className="text-red-600">{item.criticalLevel}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Note: Thresholds are calibrated for sensor capabilities and optimized for coffee storage.
              </p>
            </div>
          </TabsContent>

          {/* Detailed Thresholds Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Detailed Threshold Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Metric</TableHead>
                        <TableHead className="font-semibold">Warning Level</TableHead>
                        <TableHead className="font-semibold">Critical Level</TableHead>
                        <TableHead className="font-semibold">Justification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {thresholdData.map((item) => (
                        <TableRow key={item.metric}>
                          <TableCell className="font-medium">{item.metric}</TableCell>
                          <TableCell className="text-yellow-600 font-medium">{item.warningLevel}</TableCell>
                          <TableCell className="text-red-600 font-medium">{item.criticalLevel}</TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                            {item.justification}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Note: Thresholds are calibrated for sensor capabilities and optimized for coffee storage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Current Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const alerts = thresholdData
                    .map((item) => {
                      const currentValue = getCurrentValue(item.metric)
                      const status = getStatus(item.metric, currentValue, item.warningValue, item.criticalValue)
                      return { ...item, currentValue, status: status.status }
                    })
                    .filter((item) => item.status !== "Safe")

                  if (alerts.length === 0) {
                    return (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                          All parameters within safe ranges
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          No action required. Continue monitoring.
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div
                          key={alert.metric}
                          className={`p-4 rounded-lg border ${
                            alert.status === "Critical"
                              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                              : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {alert.status === "Critical" ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            )}
                            <span
                              className={`font-semibold ${
                                alert.status === "Critical"
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-yellow-700 dark:text-yellow-300"
                              }`}
                            >
                              {alert.status}: {alert.metric}
                            </span>
                          </div>
                          <div
                            className={`text-sm ${
                              alert.status === "Critical"
                                ? "text-red-600 dark:text-red-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }`}
                          >
                            <p className="mb-1">
                              Current: {alert.currentValue.toFixed(1)}
                              {alert.unit} | Threshold:{" "}
                              {alert.status === "Critical" ? alert.criticalLevel : alert.warningLevel}
                            </p>
                            <p>{alert.justification}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700">
                            <h4
                              className={`text-sm font-medium mb-1 ${
                                alert.status === "Critical"
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-yellow-700 dark:text-yellow-300"
                              }`}
                            >
                              Recommended Action:
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {alert.metric === "Temperature" &&
                                (alert.status === "Critical"
                                  ? "Immediately adjust cooling systems. Check for equipment malfunctions."
                                  : "Increase ventilation and monitor cooling systems.")}
                              {alert.metric === "Humidity" &&
                                (alert.status === "Critical"
                                  ? "Activate dehumidifiers at maximum setting. Check for water leaks."
                                  : "Activate dehumidifiers and monitor closely.")}
                              {alert.metric === "PM2.5 Dust" &&
                                (alert.status === "Critical"
                                  ? "Immediate cleaning required. Check filtration systems for failures."
                                  : "Schedule cleaning within 24 hours. Check air filtration.")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
