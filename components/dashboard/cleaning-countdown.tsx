"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Brush, AlertTriangle, CheckCircle } from "lucide-react"
import { useSensorData } from "@/hooks/use-sensor-data"

export default function CleaningCountdown() {
  const { data } = useSensorData(24, true)

  // Calculate cleaning schedule based on small dust particle accumulation (field1)
  const currentSmallDustLevel = data?.currentValues?.smallDustParticles || 15
  const maxDustBeforeCleaning = 45 // µg/m³
  const dustAccumulationRate = 3.5 // µg/m³ per day average

  // Calculate days until cleaning needed
  const dustRemaining = Math.max(0, maxDustBeforeCleaning - currentSmallDustLevel)
  const daysLeft = Math.max(0, Math.ceil(dustRemaining / dustAccumulationRate))

  // Calculate progress (how much dust has accumulated)
  const progress = Math.min(100, (currentSmallDustLevel / maxDustBeforeCleaning) * 100)

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (currentSmallDustLevel >= 45)
      return { level: "critical", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" }
    if (currentSmallDustLevel >= 35)
      return { level: "urgent", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" }
    if (currentSmallDustLevel >= 25)
      return { level: "soon", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" }
    return { level: "good", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" }
  }

  const urgency = getUrgencyLevel()

  const getCleaningMessage = () => {
    if (currentSmallDustLevel >= 45) return "Immediate cleaning required!"
    if (currentSmallDustLevel >= 35) return "Cleaning needed within 24 hours"
    if (currentSmallDustLevel >= 25) return "Schedule cleaning soon"
    return "Air quality excellent"
  }

  const getRecommendation = () => {
    if (currentSmallDustLevel >= 45) return "Stop operations and clean immediately to prevent contamination"
    if (currentSmallDustLevel >= 35) return "Schedule deep cleaning and check air filtration systems"
    if (currentSmallDustLevel >= 25) return "Plan routine cleaning and inspect dust sources"
    return "Continue monitoring. Next routine cleaning in 7 days"
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-1 xs:pb-2 space-y-0">
        <CardTitle className="text-sm xs:text-base font-medium">Cleaning Schedule</CardTitle>
        <div className="flex items-center gap-1 xs:gap-2">
          <Brush className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-orange-500" />
          {urgency.level === "good" ? (
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
          ) : (
            <AlertTriangle className={`h-3 w-3 xs:h-4 xs:w-4 ${urgency.color}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`p-2 xs:p-3 rounded-lg border mb-2 xs:mb-3 sm:mb-4 ${urgency.bgColor}`}>
          <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-2 xs:mb-3 gap-1 xs:gap-0">
            <div className="flex items-center">
              <Clock className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 xs:mr-2" />
              <div>
                <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold">
                  {daysLeft === 0 ? "Now" : `${daysLeft} Day${daysLeft !== 1 ? "s" : ""}`}
                </span>
                <p className={`text-xs xs:text-sm font-medium ${urgency.color}`}>{getCleaningMessage()}</p>
              </div>
            </div>
            <div className="text-right mt-1 xs:mt-0">
              <p className="text-xs xs:text-sm font-medium text-gray-600">Dust Particles (PM2.5)</p>
              <p className={`text-base xs:text-lg font-bold ${urgency.color}`}>
                {currentSmallDustLevel.toFixed(1)} µg/m³
              </p>
            </div>
          </div>

          <div className="space-y-1 xs:space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Dust Accumulation</span>
              <span>{progress.toFixed(0)}% of threshold</span>
            </div>
            <Progress
              value={progress}
              className={`h-1.5 xs:h-2 sm:h-3 ${
                progress >= 90
                  ? "bg-red-100"
                  : progress >= 70
                    ? "bg-orange-100"
                    : progress >= 50
                      ? "bg-yellow-100"
                      : "bg-green-100"
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Clean (0)</span>
              <span>Threshold (45 µg/m³)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">Recommendation:</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{getRecommendation()}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-gray-800 p-1.5 xs:p-2 rounded">
              <p className="font-medium">Last Cleaned</p>
              <p className="text-gray-500">
                {Math.floor((currentSmallDustLevel - 10) / dustAccumulationRate)} days ago
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-1.5 xs:p-2 rounded">
              <p className="font-medium">Accumulation Rate</p>
              <p className="text-gray-500">{dustAccumulationRate} µg/m³/day</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
