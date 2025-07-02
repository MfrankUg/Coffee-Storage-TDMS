"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, BarChart2, ThermometerIcon, Droplets, Wind } from "lucide-react"
import { useSensorData } from "@/hooks/use-sensor-data"

// Define message types
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
  hasChart?: boolean
  chartType?: "temperature" | "humidity" | "dust" | "prediction"
  chartData?: any
}

export default function AIAssistantChat() {
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for warehouse monitoring. Ask me about temperature, humidity, dust levels, or predictions for your coffee storage conditions.",
      timestamp: new Date().toISOString(),
    },
  ])

  // Get sensor data
  const { data } = useSensorData(24, true)
  const chartData = data?.chartData || []
  const currentValues = data?.currentValues || {
    temperature: 22.5,
    humidity: 60,
    smallDustParticles: 15,
    largeParticles: 10,
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Simple prediction function using linear regression
  const predictValue = (dataPoints: any[], field: string, minutesAhead = 20) => {
    if (!dataPoints || dataPoints.length < 2) return null

    // Get the last few data points for prediction (more recent is better)
    const recentPoints = dataPoints.slice(-6)

    // Calculate time differences and value differences
    const xValues: number[] = []
    const yValues: number[] = []

    recentPoints.forEach((point, index) => {
      if (index > 0) {
        // Convert time difference to minutes
        const prevTime = new Date(recentPoints[index - 1].timestamp).getTime()
        const currTime = new Date(point.timestamp).getTime()
        const timeDiff = (currTime - prevTime) / (1000 * 60) // minutes

        xValues.push(timeDiff)
        yValues.push(point[field] - recentPoints[index - 1][field])
      }
    })

    // Calculate average rate of change per minute
    let totalRate = 0
    let count = 0

    for (let i = 0; i < xValues.length; i++) {
      if (xValues[i] > 0) {
        totalRate += yValues[i] / xValues[i]
        count++
      }
    }

    const avgRatePerMinute = count > 0 ? totalRate / count : 0

    // Get the most recent value
    const lastValue = recentPoints[recentPoints.length - 1][field]

    // Predict future value
    const predictedValue = lastValue + avgRatePerMinute * minutesAhead

    return {
      current: lastValue,
      predicted: predictedValue,
      change: avgRatePerMinute * minutesAhead,
      ratePerMinute: avgRatePerMinute,
    }
  }

  // Function to analyze if conditions are safe for coffee storage
  const analyzeStorageConditions = () => {
    const { temperature, humidity, smallDustParticles } = currentValues

    const tempStatus =
      temperature >= 18 && temperature <= 24
        ? "optimal"
        : temperature > 24 && temperature <= 28
          ? "acceptable but not ideal"
          : "outside safe range"

    const humidityStatus =
      humidity >= 50 && humidity <= 65
        ? "optimal"
        : humidity > 65 && humidity <= 75
          ? "acceptable but not ideal"
          : "outside safe range"

    const dustStatus = smallDustParticles <= 20 ? "good" : smallDustParticles <= 35 ? "moderate" : "poor"

    const isAllSafe = tempStatus === "optimal" && humidityStatus === "optimal" && dustStatus === "good"
    const isMostlySafe =
      (tempStatus === "optimal" || tempStatus === "acceptable but not ideal") &&
      (humidityStatus === "optimal" || humidityStatus === "acceptable but not ideal") &&
      (dustStatus === "good" || dustStatus === "moderate")

    let overallStatus
    let recommendation

    if (isAllSafe) {
      overallStatus = "All conditions are optimal for coffee storage."
      recommendation = "Continue monitoring to maintain these ideal conditions."
    } else if (isMostlySafe) {
      overallStatus = "Conditions are acceptable but not optimal for coffee storage."

      if (tempStatus !== "optimal") {
        recommendation =
          temperature > 24
            ? "Consider lowering the temperature slightly for optimal coffee preservation."
            : "Consider raising the temperature slightly for optimal coffee preservation."
      } else if (humidityStatus !== "optimal") {
        recommendation =
          humidity > 65
            ? "Consider reducing humidity to prevent potential mold growth."
            : "Consider increasing humidity slightly to prevent beans from drying out."
      } else {
        recommendation = "Consider cleaning to reduce dust levels for better air quality."
      }
    } else {
      overallStatus = "One or more conditions are outside safe ranges for coffee storage."

      if (tempStatus === "outside safe range") {
        recommendation =
          temperature > 28
            ? "Urgent: Reduce temperature immediately to prevent coffee quality degradation."
            : "Urgent: Increase temperature to prevent moisture absorption by coffee beans."
      } else if (humidityStatus === "outside safe range") {
        recommendation =
          humidity > 75
            ? "Urgent: Reduce humidity immediately to prevent mold growth on coffee beans."
            : "Urgent: Increase humidity to prevent coffee beans from becoming too dry and losing flavor."
      } else {
        recommendation = "Urgent: Clean the warehouse to reduce dust levels that may contaminate coffee."
      }
    }

    return {
      temperature: { value: temperature, status: tempStatus },
      humidity: { value: humidity, status: humidityStatus },
      dust: { value: smallDustParticles, status: dustStatus },
      overallStatus,
      recommendation,
      isSafe: isAllSafe || isMostlySafe,
    }
  }

  // Function to compare current values with historical data
  const compareWithPast = (field: string, timeFrame: string) => {
    if (!chartData || chartData.length < 2) return null

    let comparisonPoint
    const lastPoint = chartData[chartData.length - 1]

    switch (timeFrame) {
      case "hour":
        comparisonPoint = chartData.find((point) => {
          const timeDiff = new Date(lastPoint.timestamp).getTime() - new Date(point.timestamp).getTime()
          return timeDiff >= 60 * 60 * 1000 // 1 hour in milliseconds
        })
        break
      case "day":
        comparisonPoint = chartData.find((point) => {
          const timeDiff = new Date(lastPoint.timestamp).getTime() - new Date(point.timestamp).getTime()
          return timeDiff >= 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        })
        break
      default:
        comparisonPoint = chartData[0] // Default to first point
    }

    if (!comparisonPoint) return null

    const currentValue = lastPoint[field]
    const pastValue = comparisonPoint[field]
    const difference = currentValue - pastValue
    const percentChange = (difference / pastValue) * 100

    return {
      current: currentValue,
      past: pastValue,
      difference,
      percentChange,
      increased: difference > 0,
    }
  }

  // Process user questions and generate responses
  const processQuestion = (question: string) => {
    question = question.toLowerCase().trim()

    // Check for temperature questions
    if (
      question.includes("temperature") ||
      question.includes("hot") ||
      question.includes("cold") ||
      question.includes("warm")
    ) {
      if (
        question.includes("next") ||
        question.includes("future") ||
        question.includes("predict") ||
        question.includes("will")
      ) {
        // Predictive temperature question
        const minutesMatch = question.match(/(\d+)\s*minutes?/)
        const minutesAhead = minutesMatch ? Number.parseInt(minutesMatch[1]) : 20

        const prediction = predictValue(chartData, "temperature", minutesAhead)

        if (prediction) {
          const direction = prediction.change > 0 ? "rise" : prediction.change < 0 ? "fall" : "stay stable"
          return {
            content: `In the next ${minutesAhead} minutes, the temperature is likely to ${direction} to around ${prediction.predicted.toFixed(1)}°C from the current ${prediction.current.toFixed(1)}°C. ${
              prediction.predicted > 28
                ? "⚠️ This will exceed the safe range for coffee storage."
                : prediction.predicted > 24
                  ? "This is acceptable but not ideal for coffee storage."
                  : prediction.predicted >= 18
                    ? "This is within the optimal range for coffee storage."
                    : "⚠️ This will be below the recommended minimum temperature."
            }`,
            hasChart: true,
            chartType: "prediction",
          }
        }
      } else if (
        question.includes("compare") ||
        question.includes("yesterday") ||
        question.includes("last hour") ||
        question.includes("previous")
      ) {
        // Comparison temperature question
        const timeFrame = question.includes("hour") ? "hour" : "day"
        const comparison = compareWithPast("temperature", timeFrame)

        if (comparison) {
          return {
            content: `The current temperature is ${comparison.current.toFixed(1)}°C. This is ${Math.abs(comparison.difference).toFixed(1)}°C ${comparison.increased ? "higher" : "lower"} than ${timeFrame === "hour" ? "an hour ago" : "yesterday"} (${comparison.percentChange.toFixed(1)}% ${comparison.increased ? "increase" : "decrease"}). ${
              comparison.current > 28
                ? "⚠️ Current temperature exceeds the safe range for coffee storage."
                : comparison.current > 24
                  ? "Current temperature is acceptable but not ideal for coffee storage."
                  : comparison.current >= 18
                    ? "Current temperature is within the optimal range for coffee storage."
                    : "⚠️ Current temperature is below the recommended minimum."
            }`,
            hasChart: true,
            chartType: "temperature",
          }
        }
      } else {
        // Current temperature question
        return {
          content: `The current temperature is ${currentValues.temperature.toFixed(1)}°C. ${
            currentValues.temperature > 28
              ? "⚠️ This exceeds the safe range for coffee storage."
              : currentValues.temperature > 24
                ? "This is acceptable but not ideal for coffee storage."
                : currentValues.temperature >= 18
                  ? "This is within the optimal range for coffee storage."
                  : "⚠️ This is below the recommended minimum temperature."
          }`,
          hasChart: true,
          chartType: "temperature",
        }
      }
    }

    // Check for humidity questions
    else if (
      question.includes("humidity") ||
      question.includes("moist") ||
      question.includes("damp") ||
      question.includes("wet") ||
      question.includes("dry")
    ) {
      if (
        question.includes("next") ||
        question.includes("future") ||
        question.includes("predict") ||
        question.includes("will")
      ) {
        // Predictive humidity question
        const minutesMatch = question.match(/(\d+)\s*minutes?/)
        const minutesAhead = minutesMatch ? Number.parseInt(minutesMatch[1]) : 20

        const prediction = predictValue(chartData, "humidity", minutesAhead)

        if (prediction) {
          const direction = prediction.change > 0 ? "rise" : prediction.change < 0 ? "fall" : "stay stable"
          return {
            content: `In the next ${minutesAhead} minutes, the humidity is likely to ${direction} to around ${prediction.predicted.toFixed(1)}% from the current ${prediction.current.toFixed(1)}%. ${
              prediction.predicted > 75
                ? "⚠️ This will exceed the safe range and may encourage mold growth."
                : prediction.predicted > 65
                  ? "This is acceptable but approaching the upper limit for coffee storage."
                  : prediction.predicted >= 50
                    ? "This is within the optimal range for coffee storage."
                    : "⚠️ This will be below the recommended minimum humidity."
            }`,
            hasChart: true,
            chartType: "prediction",
          }
        }
      } else if (
        question.includes("compare") ||
        question.includes("yesterday") ||
        question.includes("last hour") ||
        question.includes("previous")
      ) {
        // Comparison humidity question
        const timeFrame = question.includes("hour") ? "hour" : "day"
        const comparison = compareWithPast("humidity", timeFrame)

        if (comparison) {
          return {
            content: `The current humidity is ${comparison.current.toFixed(1)}%. This is ${Math.abs(comparison.difference).toFixed(1)}% ${comparison.increased ? "higher" : "lower"} than ${timeFrame === "hour" ? "an hour ago" : "yesterday"} (${comparison.percentChange.toFixed(1)}% ${comparison.increased ? "increase" : "decrease"}). ${
              comparison.current > 75
                ? "⚠️ Current humidity exceeds the safe range for coffee storage."
                : comparison.current > 65
                  ? "Current humidity is acceptable but approaching the upper limit."
                  : comparison.current >= 50
                    ? "Current humidity is within the optimal range for coffee storage."
                    : "⚠️ Current humidity is below the recommended minimum."
            }`,
            hasChart: true,
            chartType: "humidity",
          }
        }
      } else {
        // Current humidity question
        return {
          content: `The current humidity is ${currentValues.humidity.toFixed(1)}%. ${
            currentValues.humidity > 75
              ? "⚠️ This exceeds the safe range and may encourage mold growth."
              : currentValues.humidity > 65
                ? "This is acceptable but approaching the upper limit for coffee storage."
                : currentValues.humidity >= 50
                  ? "This is within the optimal range for coffee storage."
                  : "⚠️ This is below the recommended minimum humidity."
          }`,
          hasChart: true,
          chartType: "humidity",
        }
      }
    }

    // Check for dust questions
    else if (
      question.includes("dust") ||
      question.includes("particles") ||
      question.includes("air quality") ||
      question.includes("pm2.5") ||
      question.includes("clean")
    ) {
      if (
        question.includes("next") ||
        question.includes("future") ||
        question.includes("predict") ||
        question.includes("will")
      ) {
        // Predictive dust question
        const minutesMatch = question.match(/(\d+)\s*minutes?/)
        const minutesAhead = minutesMatch ? Number.parseInt(minutesMatch[1]) : 20

        const prediction = predictValue(chartData, "smallDust", minutesAhead)

        if (prediction) {
          const direction = prediction.change > 0 ? "rise" : prediction.change < 0 ? "fall" : "stay stable"
          return {
            content: `In the next ${minutesAhead} minutes, the dust level is likely to ${direction} to around ${prediction.predicted.toFixed(1)} µg/m³ from the current ${prediction.current.toFixed(1)} µg/m³. ${
              prediction.predicted > 45
                ? "⚠️ This will exceed the critical threshold and require immediate cleaning."
                : prediction.predicted > 35
                  ? "⚠️ This will reach concerning levels. Consider scheduling cleaning soon."
                  : prediction.predicted > 20
                    ? "This is moderate but acceptable for short periods."
                    : "This is within the good air quality range for coffee storage."
            }`,
            hasChart: true,
            chartType: "prediction",
          }
        }
      } else if (
        question.includes("compare") ||
        question.includes("yesterday") ||
        question.includes("last hour") ||
        question.includes("previous")
      ) {
        // Comparison dust question
        const timeFrame = question.includes("hour") ? "hour" : "day"
        const comparison = compareWithPast("smallDust", timeFrame)

        if (comparison) {
          return {
            content: `The current dust level is ${comparison.current.toFixed(1)} µg/m³. This is ${Math.abs(comparison.difference).toFixed(1)} µg/m³ ${comparison.increased ? "higher" : "lower"} than ${timeFrame === "hour" ? "an hour ago" : "yesterday"} (${comparison.percentChange.toFixed(1)}% ${comparison.increased ? "increase" : "decrease"}). ${
              comparison.current > 45
                ? "⚠️ Current dust level exceeds the critical threshold. Immediate cleaning required."
                : comparison.current > 35
                  ? "⚠️ Current dust level is concerning. Consider scheduling cleaning soon."
                  : comparison.current > 20
                    ? "Current dust level is moderate but acceptable for short periods."
                    : "Current dust level indicates good air quality for coffee storage."
            }`,
            hasChart: true,
            chartType: "dust",
          }
        }
      } else {
        // Current dust question
        return {
          content: `The current dust level is ${currentValues.smallDustParticles.toFixed(1)} µg/m³. ${
            currentValues.smallDustParticles > 45
              ? "⚠️ This exceeds the critical threshold. Immediate cleaning required."
              : currentValues.smallDustParticles > 35
                ? "⚠️ This is concerning. Consider scheduling cleaning soon."
                : currentValues.smallDustParticles > 20
                  ? "This is moderate but acceptable for short periods."
                  : "This indicates good air quality for coffee storage."
          }`,
          hasChart: true,
          chartType: "dust",
        }
      }
    }

    // Check for general safety/condition questions
    else if (
      question.includes("safe") ||
      question.includes("condition") ||
      question.includes("storage") ||
      question.includes("environment") ||
      question.includes("range") ||
      question.includes("optimal")
    ) {
      const analysis = analyzeStorageConditions()

      return {
        content: `${analysis.overallStatus}\n\n• Temperature: ${analysis.temperature.value.toFixed(1)}°C (${analysis.temperature.status})\n• Humidity: ${analysis.humidity.value.toFixed(1)}% (${analysis.humidity.status})\n• Dust Level: ${analysis.dust.value.toFixed(1)} µg/m³ (${analysis.dust.status})\n\n${analysis.recommendation}`,
        hasChart: false,
      }
    }

    // Expand the processQuestion function to handle all 100 sample questions

    // Add new question processing patterns after the existing ones:

    // Check for specific temperature questions
    else if (
      question.includes("highest temperature") ||
      question.includes("peak temperature") ||
      question.includes("maximum temperature") ||
      question.includes("hottest")
    ) {
      // Find highest temperature in recent data
      const maxTemp = Math.max(...chartData.map((point) => point.temperature))
      const maxTempPoint = chartData.find((point) => point.temperature === maxTemp)
      const timeOfMax = maxTempPoint ? new Date(maxTempPoint.timestamp).toLocaleTimeString() : "unknown"

      return {
        content: `The highest temperature recorded was ${maxTemp.toFixed(1)}°C at ${timeOfMax}. ${
          maxTemp > 35
            ? "⚠️ This exceeded safe storage limits."
            : maxTemp > 28
              ? "This was above optimal range for coffee storage."
              : "This was within acceptable limits for coffee storage."
        }`,
        hasChart: true,
        chartType: "temperature",
      }
    }

    // Check for humidity trend questions
    else if (
      question.includes("humidity trend") ||
      question.includes("humidity stable") ||
      question.includes("humidity increasing") ||
      question.includes("humidity decreasing")
    ) {
      if (chartData.length >= 3) {
        const recent = chartData.slice(-3)
        const trend = recent[2].humidity - recent[0].humidity
        const isStable = Math.abs(trend) < 2

        return {
          content: `Humidity has been ${
            isStable
              ? "relatively stable"
              : trend > 0
                ? `increasing by ${trend.toFixed(1)}%`
                : `decreasing by ${Math.abs(trend).toFixed(1)}%`
          } over the recent period. Current level is ${currentValues.humidity.toFixed(1)}%. ${
            currentValues.humidity > 70
              ? "⚠️ This is approaching concerning levels for coffee storage."
              : currentValues.humidity > 60
                ? "Monitor closely to prevent mold growth."
                : "This is within acceptable range for coffee storage."
          }`,
          hasChart: true,
          chartType: "humidity",
        }
      }
    }

    // Check for dust spike questions
    else if (
      question.includes("dust spike") ||
      question.includes("dust increased") ||
      question.includes("dust peak") ||
      question.includes("highest dust")
    ) {
      const maxDust = Math.max(...chartData.map((point) => point.smallDust))
      const maxDustPoint = chartData.find((point) => point.smallDust === maxDust)
      const timeOfMax = maxDustPoint ? new Date(maxDustPoint.timestamp).toLocaleTimeString() : "unknown"

      return {
        content: `The highest dust level recorded was ${maxDust.toFixed(1)} µg/m³ at ${timeOfMax}. ${
          maxDust > 45
            ? "⚠️ This exceeded critical thresholds and required immediate cleaning."
            : maxDust > 35
              ? "⚠️ This was concerning and cleaning should have been scheduled."
              : maxDust > 20
                ? "This was moderate but acceptable for short periods."
                : "This was within good air quality range."
        }`,
        hasChart: true,
        chartType: "dust",
      }
    }

    // Check for ventilation questions
    else if (
      question.includes("ventilate") ||
      question.includes("ventilation") ||
      question.includes("fans") ||
      question.includes("air circulation")
    ) {
      const analysis = analyzeStorageConditions()
      const needsVentilation =
        currentValues.temperature > 26 || currentValues.humidity > 65 || currentValues.smallDustParticles > 25

      return {
        content: `${needsVentilation ? "Yes, ventilation is recommended" : "Ventilation is not urgently needed"} based on current conditions:\n\n• Temperature: ${currentValues.temperature.toFixed(1)}°C ${currentValues.temperature > 26 ? "(warm - ventilation helps)" : "(acceptable)"}\n• Humidity: ${currentValues.humidity.toFixed(1)}% ${currentValues.humidity > 65 ? "(high - ventilation helps)" : "(acceptable)"}\n• Dust: ${currentValues.smallDustParticles.toFixed(1)} µg/m³ ${currentValues.smallDustParticles > 25 ? "(elevated - ventilation helps)" : "(acceptable)"}\n\n${needsVentilation ? "💨 Use fans or open vents to improve air circulation and reduce temperature/humidity." : "Current air quality is acceptable, but ventilation is always beneficial for coffee storage."}`,
        hasChart: false,
      }
    }

    // Check for time-based questions
    else if (
      question.includes("time of day") ||
      question.includes("when") ||
      question.includes("what time") ||
      question.includes("usually")
    ) {
      if (question.includes("hottest") || question.includes("warmest")) {
        return {
          content:
            "Based on typical patterns, the warehouse is usually hottest between 1:00 PM and 3:00 PM when external temperatures peak and solar heating is strongest. Current temperature is ${currentValues.temperature.toFixed(1)}°C. Consider scheduling sensitive operations during cooler morning hours (6:00 AM - 9:00 AM) for optimal coffee storage conditions.",
          hasChart: true,
          chartType: "temperature",
        }
      } else if (question.includes("humidity") && (question.includes("worst") || question.includes("highest"))) {
        return {
          content:
            "Humidity typically peaks between 11:00 AM and 2:00 PM when temperature rises and moisture evaporates from surfaces. Current humidity is ${currentValues.humidity.toFixed(1)}%. Early morning (5:00 AM - 8:00 AM) usually offers the most stable humidity conditions for coffee handling.",
          hasChart: true,
          chartType: "humidity",
        }
      }
    }

    // Check for coffee quality impact questions
    else if (
      question.includes("coffee quality") ||
      question.includes("coffee aroma") ||
      question.includes("coffee flavor") ||
      question.includes("spoil coffee") ||
      question.includes("damage coffee") ||
      question.includes("affect coffee")
    ) {
      const { temperature, humidity, smallDustParticles } = currentValues

      let qualityImpact = "minimal"
      const concerns = []

      if (temperature > 28) {
        qualityImpact = "significant"
        concerns.push("High temperature accelerates staling and degrades aromatic compounds")
      } else if (temperature > 25) {
        qualityImpact = "moderate"
        concerns.push("Elevated temperature may gradually affect flavor development")
      }

      if (humidity > 70) {
        qualityImpact = "significant"
        concerns.push("High humidity promotes mold growth and moisture absorption")
      } else if (humidity > 65) {
        qualityImpact = qualityImpact === "significant" ? "significant" : "moderate"
        concerns.push("Elevated humidity may cause beans to absorb moisture")
      }

      if (smallDustParticles > 35) {
        qualityImpact = "significant"
        concerns.push("High dust levels can contaminate coffee and affect taste")
      } else if (smallDustParticles > 20) {
        qualityImpact = qualityImpact === "significant" ? "significant" : "moderate"
        concerns.push("Moderate dust may gradually affect coffee cleanliness")
      }

      return {
        content: `Current conditions have ${qualityImpact} impact on coffee quality:\n\n• Temperature: ${temperature.toFixed(1)}°C\n• Humidity: ${humidity.toFixed(1)}%\n• Dust: ${smallDustParticles.toFixed(1)} µg/m³\n\n${concerns.length > 0 ? "⚠️ Quality concerns:\n" + concerns.map((c) => `• ${c}`).join("\n") : "✅ Current conditions are favorable for maintaining coffee quality."}\n\n💡 Recommendation: ${qualityImpact === "significant" ? "Take immediate action to improve conditions" : qualityImpact === "moderate" ? "Monitor closely and consider adjustments" : "Continue current storage practices"}`,
        hasChart: false,
      }
    }

    // Check for action/alert questions
    else if (
      question.includes("take action") ||
      question.includes("do something") ||
      question.includes("alerts") ||
      question.includes("warnings") ||
      question.includes("should i worry") ||
      question.includes("need to")
    ) {
      const analysis = analyzeStorageConditions()
      const urgentActions = []
      const recommendedActions = []

      if (currentValues.temperature > 30) {
        urgentActions.push("🌡️ Activate cooling systems - temperature is too high")
      } else if (currentValues.temperature > 26) {
        recommendedActions.push("🌡️ Consider increasing ventilation to reduce temperature")
      }

      if (currentValues.humidity > 75) {
        urgentActions.push("💧 Activate dehumidifiers - humidity is critical")
      } else if (currentValues.humidity > 65) {
        recommendedActions.push("💧 Monitor humidity closely and consider dehumidification")
      }

      if (currentValues.smallDustParticles > 45) {
        urgentActions.push("🧹 Immediate cleaning required - dust levels are critical")
      } else if (currentValues.smallDustParticles > 25) {
        recommendedActions.push("🧹 Schedule cleaning within 24 hours")
      }

      const hasUrgentActions = urgentActions.length > 0
      const hasRecommendedActions = recommendedActions.length > 0

      return {
        content: `${hasUrgentActions ? "⚠️ URGENT ACTIONS NEEDED:" : hasRecommendedActions ? "📋 RECOMMENDED ACTIONS:" : "✅ NO IMMEDIATE ACTIONS REQUIRED"}\n\n${
          hasUrgentActions ? urgentActions.join("\n") + "\n\n" : ""
        }${hasRecommendedActions ? "Recommended:\n" + recommendedActions.join("\n") + "\n\n" : ""}${
          !hasUrgentActions && !hasRecommendedActions
            ? "Current conditions are within acceptable ranges. Continue monitoring.\n\n"
            : ""
        }Current status: ${analysis.overallStatus}`,
        hasChart: false,
      }
    }

    // Check for summary/overview questions
    else if (
      question.includes("summary") ||
      question.includes("overview") ||
      question.includes("tell me about") ||
      question.includes("current conditions") ||
      question.includes("warehouse conditions")
    ) {
      const analysis = analyzeStorageConditions()
      const recentTrend =
        chartData.length >= 3
          ? chartData.slice(-3).map((point) => ({
              temp: point.temperature,
              humidity: point.humidity,
              dust: point.smallDust,
            }))
          : []

      let trendAnalysis = ""
      if (recentTrend.length >= 3) {
        const tempTrend = recentTrend[2].temp - recentTrend[0].temp
        const humidityTrend = recentTrend[2].humidity - recentTrend[0].humidity
        const dustTrend = recentTrend[2].dust - recentTrend[0].dust

        trendAnalysis = `\n\n📈 Recent trends:\n• Temperature: ${tempTrend > 1 ? "Rising" : tempTrend < -1 ? "Falling" : "Stable"}\n• Humidity: ${humidityTrend > 2 ? "Rising" : humidityTrend < -2 ? "Falling" : "Stable"}\n• Dust: ${dustTrend > 2 ? "Rising" : dustTrend < -2 ? "Falling" : "Stable"}`
      }

      return {
        content: `📊 WAREHOUSE CONDITIONS SUMMARY\n\n🌡️ Temperature: ${currentValues.temperature.toFixed(1)}°C (${analysis.temperature.status})\n💧 Humidity: ${currentValues.humidity.toFixed(1)}% (${analysis.humidity.status})\n🌪️ Dust Level: ${currentValues.smallDustParticles.toFixed(1)} µg/m³ (${analysis.dust.status})\n\n${analysis.overallStatus}${trendAnalysis}\n\n💡 ${analysis.recommendation}`,
        hasChart: false,
      }
    }

    // Check for average/statistical questions
    else if (
      question.includes("average") ||
      question.includes("typical") ||
      question.includes("usually") ||
      question.includes("normal")
    ) {
      if (chartData.length >= 6) {
        const recent6Hours = chartData.slice(-6)
        const avgTemp = recent6Hours.reduce((sum, point) => sum + point.temperature, 0) / recent6Hours.length
        const avgHumidity = recent6Hours.reduce((sum, point) => sum + point.humidity, 0) / recent6Hours.length
        const avgDust = recent6Hours.reduce((sum, point) => sum + point.smallDust, 0) / recent6Hours.length

        return {
          content: `📊 RECENT AVERAGES (last 6 hours):\n\n• Temperature: ${avgTemp.toFixed(1)}°C\n• Humidity: ${avgHumidity.toFixed(1)}%\n• Dust Level: ${avgDust.toFixed(1)} µg/m³\n\nCurrent vs Average:\n• Temperature: ${(currentValues.temperature - avgTemp).toFixed(1)}°C ${currentValues.temperature > avgTemp ? "above" : "below"} average\n• Humidity: ${(currentValues.humidity - avgHumidity).toFixed(1)}% ${currentValues.humidity > avgHumidity ? "above" : "below"} average\n• Dust: ${(currentValues.smallDustParticles - avgDust).toFixed(1)} µg/m³ ${currentValues.smallDustParticles > avgDust ? "above" : "below"} average`,
          hasChart: true,
          chartType: "temperature",
        }
      }
    }

    // Check for frequency questions
    else if (
      question.includes("how often") ||
      question.includes("frequency") ||
      question.includes("times") ||
      question.includes("exceed")
    ) {
      if (chartData.length >= 10) {
        const exceedances = {
          temperature: chartData.filter((point) => point.temperature > 30).length,
          humidity: chartData.filter((point) => point.humidity > 65).length,
          dust: chartData.filter((point) => point.smallDust > 35).length,
        }

        const totalPoints = chartData.length
        const timeSpan = chartData.length // Assuming hourly data

        return {
          content: `📈 EXCEEDANCE FREQUENCY (last ${timeSpan} hours):\n\n• Temperature >30°C: ${exceedances.temperature} times (${((exceedances.temperature / totalPoints) * 100).toFixed(1)}%)\n• Humidity >65%: ${exceedances.humidity} times (${((exceedances.humidity / totalPoints) * 100).toFixed(1)}%)\n• Dust >35 µg/m³: ${exceedances.dust} times (${((exceedances.dust / totalPoints) * 100).toFixed(1)}%)\n\n${exceedances.temperature + exceedances.humidity + exceedances.dust === 0 ? "✅ No exceedances detected - conditions have been stable" : "⚠️ Monitor conditions closely when exceedances occur"}`,
          hasChart: true,
          chartType: "temperature",
        }
      }
    }

    // Check for improvement questions
    else if (
      question.includes("improve") ||
      question.includes("better") ||
      question.includes("optimize") ||
      question.includes("enhance")
    ) {
      const improvements = []

      if (currentValues.temperature > 25) {
        improvements.push("🌡️ Install additional cooling/ventilation systems")
        improvements.push("🌡️ Use thermal insulation to reduce heat gain")
      }

      if (currentValues.humidity > 60) {
        improvements.push("💧 Install dehumidifiers or improve drainage")
        improvements.push("💧 Ensure proper air circulation")
      }

      if (currentValues.smallDustParticles > 15) {
        improvements.push("🧹 Implement regular cleaning schedules")
        improvements.push("🧹 Install air filtration systems")
        improvements.push("🧹 Seal entry points to reduce dust infiltration")
      }

      if (improvements.length === 0) {
        improvements.push("✅ Current conditions are already quite good")
        improvements.push("📊 Continue regular monitoring")
        improvements.push("🔧 Maintain existing equipment")
      }

      return {
        content: `💡 IMPROVEMENT RECOMMENDATIONS:\n\n${improvements.join("\n")}\n\nCurrent conditions:\n• Temperature: ${currentValues.temperature.toFixed(1)}°C\n• Humidity: ${currentValues.humidity.toFixed(1)}%\n• Dust: ${currentValues.smallDustParticles.toFixed(1)} µg/m³\n\n🎯 Target ranges:\n• Temperature: 18-25°C\n• Humidity: 50-65%\n• Dust: <20 µg/m³`,
        hasChart: false,
      }
    }

    // Check for advice/recommendation questions
    else if (
      question.includes("advice") ||
      question.includes("recommend") ||
      question.includes("suggest") ||
      question.includes("what should i do") ||
      question.includes("help me") ||
      question.includes("guidance") ||
      question.includes("best practice") ||
      question.includes("tips")
    ) {
      const analysis = analyzeStorageConditions()
      const { temperature, humidity, smallDustParticles } = currentValues

      // Generate comprehensive advice based on current conditions
      const advice = []
      const immediateActions = []
      const preventiveActions = []
      const longTermRecommendations = []

      // Temperature advice
      if (temperature > 30) {
        immediateActions.push("🚨 URGENT: Activate all cooling systems immediately")
        immediateActions.push("🌡️ Open all ventilation to reduce heat buildup")
        immediateActions.push("☀️ Block direct sunlight if possible")
        advice.push("High temperature can rapidly degrade coffee quality and promote rancidity")
      } else if (temperature > 26) {
        immediateActions.push("🌡️ Increase ventilation and air circulation")
        immediateActions.push("🔄 Consider portable fans for better airflow")
        preventiveActions.push("📅 Schedule cooling system maintenance")
      } else if (temperature < 18) {
        immediateActions.push("🌡️ Reduce excessive cooling to prevent condensation")
        advice.push("Very low temperatures can cause condensation when coffee is moved to warmer areas")
      } else {
        advice.push("✅ Temperature is well-controlled - maintain current practices")
      }

      // Humidity advice
      if (humidity > 75) {
        immediateActions.push("🚨 URGENT: Activate dehumidifiers immediately")
        immediateActions.push("💨 Increase air circulation to reduce moisture")
        immediateActions.push("🔍 Check for water leaks or moisture sources")
        advice.push("Critical humidity levels can cause mold growth within 24-48 hours")
      } else if (humidity > 65) {
        immediateActions.push("💧 Monitor humidity closely and prepare dehumidifiers")
        preventiveActions.push("🔧 Service HVAC systems to improve moisture control")
        advice.push("Elevated humidity increases risk of mold and moisture absorption")
      } else if (humidity < 45) {
        advice.push("⚠️ Low humidity may cause coffee beans to lose moisture and become brittle")
        preventiveActions.push("💨 Consider slight humidification during very dry periods")
      } else {
        advice.push("✅ Humidity is well-managed - continue current monitoring")
      }

      // Dust advice
      if (smallDustParticles > 45) {
        immediateActions.push("🚨 URGENT: Stop all operations and clean immediately")
        immediateActions.push("🧹 Deep clean all surfaces and equipment")
        immediateActions.push("🔍 Identify and eliminate dust sources")
        advice.push("Critical dust levels can contaminate coffee and affect taste quality")
      } else if (smallDustParticles > 25) {
        immediateActions.push("🧹 Schedule thorough cleaning within 4 hours")
        preventiveActions.push("🌪️ Install or upgrade air filtration systems")
        advice.push("Elevated dust can gradually affect coffee cleanliness and storage quality")
      } else if (smallDustParticles > 15) {
        preventiveActions.push("🧹 Increase cleaning frequency to twice daily")
        preventiveActions.push("🚪 Check door seals to prevent dust infiltration")
      } else {
        advice.push("✅ Dust levels are well-controlled - maintain cleaning schedule")
      }

      // General operational advice
      longTermRecommendations.push("📊 Implement continuous monitoring with automated alerts")
      longTermRecommendations.push("📋 Create standard operating procedures for different weather conditions")
      longTermRecommendations.push("👥 Train staff on optimal coffee storage practices")
      longTermRecommendations.push("🔄 Establish regular equipment maintenance schedules")

      // Seasonal advice
      const currentMonth = new Date().getMonth()
      if (currentMonth >= 5 && currentMonth <= 8) {
        // Summer months
        longTermRecommendations.push("☀️ Summer: Focus on cooling and humidity control")
        longTermRecommendations.push("🌡️ Consider upgrading cooling capacity for hot weather")
      } else if (currentMonth >= 11 || currentMonth <= 2) {
        // Winter months
        longTermRecommendations.push("❄️ Winter: Monitor for condensation and heating efficiency")
        longTermRecommendations.push("💨 Ensure adequate ventilation despite cold weather")
      }

      // Coffee-specific storage advice
      const coffeeAdvice = [
        "☕ Store coffee in breathable containers to prevent moisture buildup",
        "📦 Keep coffee away from walls and direct floor contact",
        "🔄 Rotate stock using FIFO (First In, First Out) method",
        "🌡️ Allow coffee to acclimate gradually when moving between temperature zones",
        "📏 Maintain at least 18 inches clearance from walls for air circulation",
        "🚫 Never store coffee directly under air conditioning vents",
        "📱 Use data loggers to track conditions in different storage areas",
      ]

      let responseContent = `💡 COMPREHENSIVE STORAGE ADVICE\n\n`

      if (immediateActions.length > 0) {
        responseContent += `🚨 IMMEDIATE ACTIONS REQUIRED:\n${immediateActions.map((action) => `• ${action}`).join("\n")}\n\n`
      }

      if (preventiveActions.length > 0) {
        responseContent += `🛡️ PREVENTIVE MEASURES:\n${preventiveActions.map((action) => `• ${action}`).join("\n")}\n\n`
      }

      responseContent += `📚 EXPERT INSIGHTS:\n${advice.map((tip) => `• ${tip}`).join("\n")}\n\n`

      responseContent += `☕ COFFEE STORAGE BEST PRACTICES:\n${coffeeAdvice
        .slice(0, 4)
        .map((tip) => `• ${tip}`)
        .join("\n")}\n\n`

      responseContent += `🎯 LONG-TERM RECOMMENDATIONS:\n${longTermRecommendations
        .slice(0, 3)
        .map((rec) => `• ${rec}`)
        .join("\n")}\n\n`

      responseContent += `📊 Current Status: ${analysis.overallStatus}`

      return {
        content: responseContent,
        hasChart: false,
      }
    }

    // Check for specific operational advice questions
    else if (
      question.includes("cleaning") ||
      question.includes("maintenance") ||
      question.includes("equipment") ||
      question.includes("schedule")
    ) {
      const maintenanceAdvice = {
        daily: [
          "🧹 Visual inspection of storage areas for dust accumulation",
          "📊 Check and record temperature/humidity readings",
          "🚪 Inspect door seals and ventilation systems",
          "📦 Verify coffee storage containers are properly sealed",
        ],
        weekly: [
          "🧽 Deep clean floors, walls, and storage surfaces",
          "🔧 Check HVAC filters and replace if necessary",
          "📏 Calibrate monitoring equipment",
          "🔍 Inspect for signs of pest activity or moisture damage",
        ],
        monthly: [
          "⚙️ Professional HVAC system maintenance",
          "🧪 Test air quality and dust levels",
          "📋 Review and update storage procedures",
          "🔄 Rotate and inspect monitoring equipment",
        ],
        seasonal: [
          "🌡️ Adjust climate control settings for weather changes",
          "🔧 Comprehensive equipment servicing",
          "📊 Analyze historical data for optimization opportunities",
          "👥 Staff training updates on best practices",
        ],
      }

      return {
        content: `🛠️ MAINTENANCE & CLEANING SCHEDULE\n\n📅 DAILY TASKS:\n${maintenanceAdvice.daily.map((task) => `• ${task}`).join("\n")}\n\n📅 WEEKLY TASKS:\n${maintenanceAdvice.weekly.map((task) => `• ${task}`).join("\n")}\n\n📅 MONTHLY TASKS:\n${maintenanceAdvice.monthly.map((task) => `• ${task}`).join("\n")}\n\n📅 SEASONAL TASKS:\n${maintenanceAdvice.seasonal.map((task) => `• ${task}`).join("\n")}\n\n💡 Pro Tip: Create checklists and assign responsibilities to ensure consistent execution of these tasks.`,
        hasChart: false,
      }
    }

    // Check for emergency response advice
    else if (
      question.includes("emergency") ||
      question.includes("problem") ||
      question.includes("issue") ||
      question.includes("crisis") ||
      question.includes("urgent")
    ) {
      const emergencyProtocols = {
        highTemperature: [
          "🚨 Immediately activate all cooling systems",
          "🌪️ Open all ventilation and use emergency fans",
          "📦 Move most valuable coffee to cooler areas",
          "☀️ Block heat sources (sunlight, equipment)",
          "📞 Contact HVAC technician if temperature exceeds 35°C",
        ],
        highHumidity: [
          "🚨 Activate all dehumidifiers immediately",
          "💨 Maximize air circulation",
          "🔍 Check for water leaks or moisture sources",
          "📦 Ensure coffee containers are tightly sealed",
          "🧪 Test for mold growth if humidity was >80% for >6 hours",
        ],
        highDust: [
          "🛑 Stop all operations immediately",
          "🧹 Begin emergency cleaning procedures",
          "😷 Ensure staff wear protective equipment",
          "🔍 Identify and eliminate dust source",
          "📦 Inspect coffee for contamination",
        ],
        powerOutage: [
          "🔋 Activate backup power for critical systems",
          "🌡️ Monitor temperature rise carefully",
          "📦 Prepare to relocate coffee if necessary",
          "📞 Contact utility company and backup suppliers",
          "📊 Document conditions for insurance purposes",
        ],
      }

      const currentIssues = []
      if (currentValues.temperature > 32) currentIssues.push("highTemperature")
      if (currentValues.humidity > 75) currentIssues.push("highHumidity")
      if (currentValues.smallDustParticles > 45) currentIssues.push("highDust")

      let emergencyContent = `🚨 EMERGENCY RESPONSE PROTOCOLS\n\n`

      if (currentIssues.length > 0) {
        emergencyContent += `⚠️ CURRENT CRITICAL ISSUES DETECTED:\n\n`
        currentIssues.forEach((issue) => {
          const protocolName = issue.replace(/([A-Z])/g, " $1").toLowerCase()
          emergencyContent += `🔴 ${protocolName.toUpperCase()} PROTOCOL:\n${emergencyProtocols[issue].map((step) => `• ${step}`).join("\n")}\n\n`
        })
      } else {
        emergencyContent += `✅ No current emergencies detected. Here are the protocols to follow if issues arise:\n\n`
      }

      emergencyContent += `📋 GENERAL EMERGENCY PROCEDURES:\n`
      emergencyContent += `• 📞 Contact emergency response team immediately\n`
      emergencyContent += `• 📊 Document all readings and actions taken\n`
      emergencyContent += `• 📦 Prioritize protecting highest-value coffee inventory\n`
      emergencyContent += `• 👥 Ensure staff safety first, then product protection\n`
      emergencyContent += `• 📱 Use mobile monitoring if main systems fail\n\n`

      emergencyContent += `🎯 PREVENTION IS KEY:\n`
      emergencyContent += `• Set up automated alerts for all critical thresholds\n`
      emergencyContent += `• Maintain emergency equipment in ready condition\n`
      emergencyContent += `• Train all staff on emergency procedures\n`
      emergencyContent += `• Keep emergency contact list easily accessible`

      return {
        content: emergencyContent,
        hasChart: false,
      }
    }

    // Check for optimization advice
    else if (
      question.includes("optimize") ||
      question.includes("efficiency") ||
      question.includes("cost") ||
      question.includes("energy") ||
      question.includes("performance")
    ) {
      const optimizationTips = {
        energy: [
          "🌡️ Use programmable thermostats with setback schedules",
          "💡 Install LED lighting with motion sensors",
          "🌪️ Optimize fan speeds based on actual conditions",
          "🏠 Improve insulation to reduce heating/cooling loads",
          "⚡ Consider variable-speed HVAC equipment",
        ],
        operational: [
          "📊 Implement predictive maintenance schedules",
          "🤖 Use automated monitoring to reduce manual checks",
          "📦 Optimize storage layout for better air circulation",
          "🔄 Implement zone-based climate control",
          "📱 Use mobile apps for real-time monitoring",
        ],
        quality: [
          "🌡️ Maintain tighter temperature control (±1°C)",
          "💧 Keep humidity in optimal 55-60% range",
          "🧹 Implement continuous air filtration",
          "📏 Use data analytics to predict quality issues",
          "🔍 Regular quality testing of stored coffee",
        ],
      }

      return {
        content: `⚡ OPTIMIZATION STRATEGIES\n\n💰 ENERGY EFFICIENCY:\n${optimizationTips.energy.map((tip) => `• ${tip}`).join("\n")}\n\n🔧 OPERATIONAL EFFICIENCY:\n${optimizationTips.operational.map((tip) => `• ${tip}`).join("\n")}\n\n☕ QUALITY OPTIMIZATION:\n${optimizationTips.quality.map((tip) => `• ${tip}`).join("\n")}\n\n📈 EXPECTED BENEFITS:\n• 15-25% reduction in energy costs\n• 30% reduction in manual monitoring time\n• 20% improvement in coffee quality consistency\n• 50% faster response to environmental changes\n\n💡 Start with the highest-impact, lowest-cost improvements first!`,
        hasChart: false,
      }
    }

    // Check for troubleshooting advice
    else if (
      question.includes("troubleshoot") ||
      question.includes("fix") ||
      question.includes("repair") ||
      question.includes("not working") ||
      question.includes("malfunction")
    ) {
      const troubleshooting = {
        temperature: [
          "🌡️ Check if HVAC system is running properly",
          "🔌 Verify power supply to cooling/heating equipment",
          "🌪️ Ensure vents and filters are not blocked",
          "🚪 Check for air leaks around doors and windows",
          "📊 Calibrate temperature sensors",
        ],
        humidity: [
          "💧 Check dehumidifier water collection and drainage",
          "🔌 Verify dehumidifier power and settings",
          "🌪️ Ensure adequate air circulation",
          "🔍 Look for hidden moisture sources (leaks, condensation)",
          "📊 Calibrate humidity sensors",
        ],
        dust: [
          "🧹 Check if cleaning schedule is being followed",
          "🌪️ Inspect air filtration system operation",
          "🚪 Verify door seals are intact",
          "🔍 Identify external dust sources",
          "📊 Calibrate dust monitoring equipment",
        ],
      }

      return {
        content: `🔧 TROUBLESHOOTING GUIDE\n\n🌡️ TEMPERATURE ISSUES:\n${troubleshooting.temperature.map((step) => `• ${step}`).join("\n")}\n\n💧 HUMIDITY PROBLEMS:\n${troubleshooting.humidity.map((step) => `• ${step}`).join("\n")}\n\n🌪️ DUST CONTROL ISSUES:\n${troubleshooting.dust.map((step) => `• ${step}`).join("\n")}\n\n🆘 WHEN TO CALL PROFESSIONALS:\n• Equipment not responding to basic troubleshooting\n• Electrical issues or unusual noises\n• Persistent problems despite following procedures\n• Safety concerns with any equipment\n\n📞 Keep contact information for HVAC, electrical, and monitoring system technicians readily available.`,
        hasChart: false,
      }
    }

    // Unknown question
    else {
      return {
        content:
          "I'm not sure how to answer that. I can help with questions about temperature, humidity, dust levels, or predictions for your coffee storage conditions. For example, you can ask 'What is the current temperature?' or 'Is it safe to store coffee right now?'",
        hasChart: false,
      }
    }

    // Fallback response
    return {
      content:
        "I'm not sure how to answer that. Can you rephrase your question? I focus on coffee storage conditions like temperature, humidity, and dust levels.",
      hasChart: false,
    }
  }

  const handleSend = () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)

    // Add user message
    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("") // Clear input immediately

    // Process the question and generate a response
    setTimeout(() => {
      const response = processQuestion(userMessage.content)

      const aiResponse = {
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        hasChart: response.hasChart,
        chartType: response.chartType,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Render a simple chart visualization based on the message type
  const renderChart = (chartType: string) => {
    if (!chartData || chartData.length === 0) return null

    // Get the last 6 data points for visualization
    const recentData = chartData.slice(-6)

    let dataField = "temperature"
    let color = "#f97316" // orange
    let icon = <ThermometerIcon className="h-3 w-3 xs:h-4 xs:w-4" />
    let label = "Temperature (°C)"

    if (chartType === "humidity") {
      dataField = "humidity"
      color = "#0ea5e9" // blue
      icon = <Droplets className="h-3 w-3 xs:h-4 xs:w-4" />
      label = "Humidity (%)"
    } else if (chartType === "dust") {
      dataField = "smallDust"
      color = "#8b5cf6" // purple
      icon = <Wind className="h-3 w-3 xs:h-4 xs:w-4" />
      label = "Dust (µg/m³)"
    } else if (chartType === "prediction") {
      // For prediction, we'll show the trend line
      const lastValue = recentData[recentData.length - 1][dataField]
      const prediction = predictValue(chartData, dataField, 20)

      if (prediction) {
        return (
          <div className="mt-2 xs:mt-3 bg-white dark:bg-gray-700 p-2 rounded-md">
            <div className="flex items-center gap-1 xs:gap-2 mb-2">
              <BarChart2 className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
              <span className="text-xs font-medium">Prediction (next 20 min)</span>
            </div>
            <div className="h-20 xs:h-24 sm:h-32 bg-gray-50 dark:bg-gray-600 rounded-md flex items-end p-2">
              <div className="flex-1 flex items-end justify-around">
                {[0, 5, 10, 15, 20].map((minutes, i) => {
                  const value = lastValue + prediction.ratePerMinute * minutes
                  const height = Math.max(10, Math.min(100, value * 2))

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-3 xs:w-4 sm:w-6 ${i === 0 ? "bg-blue-500" : "bg-purple-500"}`}
                        style={{ height: `${height}px` }}
                      ></div>
                      <span className="text-xs mt-1">{i === 0 ? "Now" : `+${minutes}m`}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }
    }

    // Simple bar chart for historical data
    return (
      <div className="mt-2 xs:mt-3 bg-white dark:bg-gray-700 p-2 rounded-md">
        <div className="flex items-center gap-1 xs:gap-2 mb-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="h-20 xs:h-24 sm:h-32 bg-gray-50 dark:bg-gray-600 rounded-md flex items-end p-2">
          <div className="flex-1 flex items-end justify-around">
            {recentData.map((point, i) => {
              const value = point[dataField]
              const height = Math.max(10, Math.min(100, value * 2))

              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-3 xs:w-4 sm:w-6`}
                    style={{
                      height: `${height}px`,
                      backgroundColor: color,
                    }}
                  ></div>
                  <span className="text-xs mt-1">
                    {new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 xs:bottom-6 xs:right-6 sm:bottom-8 sm:right-8 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 z-50 h-16 w-16 xs:h-18 xs:w-18 sm:h-20 sm:w-20"
          size="icon"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl h-[85vh] xs:h-[90vh] sm:h-[80vh] max-h-[600px] p-0 flex flex-col">
        <DialogHeader className="p-3 xs:p-4 sm:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm xs:text-base">
            <Bot className="h-4 w-4 xs:h-5 xs:w-5 text-purple-500" />
            AI Predictive Analysis Assistant
          </DialogTitle>
          <DialogDescription className="text-xs xs:text-sm">
            Ask questions about warehouse conditions and get AI-powered insights.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 p-3 xs:p-4 sm:p-6 pt-2 xs:pt-4 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 xs:pr-4 mb-3 xs:mb-4 min-h-0">
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`
                      max-w-[85%] xs:max-w-[80%] rounded-lg p-2 xs:p-3 
                      ${
                        message.role === "user"
                          ? "bg-purple-100 dark:bg-purple-900 text-gray-800 dark:text-gray-100"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-1 xs:gap-2 mb-1">
                      {message.role === "user" ? (
                        <User className="h-3 w-3 xs:h-4 xs:w-4" />
                      ) : (
                        <Bot className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs xs:text-sm whitespace-pre-wrap">{message.content}</p>

                    {message.hasChart && message.chartType && renderChart(message.chartType)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 xs:p-3 max-w-[85%] xs:max-w-[80%]">
                    <div className="flex items-center gap-1 xs:gap-2 mb-1">
                      <Bot className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Analyzing data...</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 border-t pt-2 xs:pt-3 sm:pt-4 flex-shrink-0">
            <Input
              placeholder="Ask about warehouse conditions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-xs xs:text-sm h-8 xs:h-9 sm:h-10"
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={isLoading || !input.trim()}
              className="shrink-0 h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10"
            >
              <Send className="h-3 w-3 xs:h-4 xs:w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
