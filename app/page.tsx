"use client"

import { Suspense } from "react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MonitoringCards from "@/components/dashboard/monitoring-cards"
import GraphicalTrends from "@/components/dashboard/graphical-trends"
import AIAssistant from "@/components/dashboard/ai-assistant"
import CleaningCountdown from "@/components/dashboard/cleaning-countdown"
import WarehouseSelector from "@/components/dashboard/warehouse-selector"
import AIAssistantChat from "@/components/dashboard/ai-assistant-chat"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw } from "lucide-react"
import Link from "next/link"
import DatabaseStatus from "@/components/dashboard/database-status"
import SystemStatus from "@/components/dashboard/system-status"

export default function Dashboard() {
  // Use different status components based on environment
  const isDevelopment = process.env.NODE_ENV === "development"
  const StatusComponent = isDevelopment ? DatabaseStatus : SystemStatus

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <main className="container mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 py-3 xs:py-4 sm:py-6">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-3 xs:mb-4 sm:mb-6 gap-2 xs:gap-0">
          <div className="flex flex-wrap items-center gap-2 xs:gap-3 w-full xs:w-auto mb-2 xs:mb-0">
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Dashboard
            </h1>
            <Link href="/thresholds" className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm relative h-8 px-2 xs:px-3"
              >
                <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
                <span className="hidden xs:inline">View</span> Thresholds
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center animate-pulse font-bold">
                  2
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm h-8 px-2 xs:px-3"
              onClick={async () => {
                try {
                  const response = await fetch("/api/sync-thingspeak", { method: "POST" })
                  const result = await response.json()
                  if (result.success) {
                    window.location.reload()
                  }
                } catch (error) {
                  console.error("Sync failed:", error)
                }
              }}
            >
              <RefreshCw className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="hidden xs:inline">Sync</span> Data
            </Button>
          </div>
          <div className="w-full xs:w-auto">
            <WarehouseSelector />
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 lg:gap-6 mb-3 xs:mb-4 sm:mb-6">
          <Suspense fallback={<Skeleton className="h-24 sm:h-32 w-full" />}>
            <MonitoringCards />
          </Suspense>
        </div>

        <div className="mb-3 xs:mb-4 sm:mb-6">
          <Suspense fallback={<Skeleton className="h-32 sm:h-40 w-full" />}>
            <CleaningCountdown />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 xs:mb-4 sm:mb-6">
          <div className="lg:col-span-3">
            <Suspense fallback={<Skeleton className="h-64 sm:h-80 lg:h-96 w-full" />}>
              <GraphicalTrends />
            </Suspense>
          </div>
          <div className="lg:col-span-1 space-y-3 xs:space-y-4">
            <Suspense fallback={<Skeleton className="h-48 sm:h-64 w-full" />}>
              <AIAssistant />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <StatusComponent />
            </Suspense>
          </div>
        </div>
      </main>

      <AIAssistantChat />
    </div>
  )
}
