"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle, Info, Clock, Zap } from "lucide-react"
import { useSensorData } from "@/hooks/use-sensor-data"
import { notificationSystem, type Notification } from "@/lib/notification-system"

export default function DashboardHeader() {
  const [systemActive, setSystemActive] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data } = useSensorData(24, true)

  // Update notifications when sensor data changes
  useEffect(() => {
    if (data?.currentValues) {
      const newNotifications = notificationSystem.getDisplayNotifications({
        temperature: data.currentValues.temperature,
        humidity: data.currentValues.humidity,
        smallDustParticles: data.currentValues.smallDustParticles,
        largeParticles: data.currentValues.largeParticles,
      })

      const actionableCount = notificationSystem.getActionableCount({
        temperature: data.currentValues.temperature,
        humidity: data.currentValues.humidity,
        smallDustParticles: data.currentValues.smallDustParticles,
        largeParticles: data.currentValues.largeParticles,
      })

      setNotifications(newNotifications)
      setNotificationCount(actionableCount)
    }
  }, [data])

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
      case "info":
      default:
        return <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-900/20"
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-900/20"
      case "info":
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#9b34f0] to-[#a84ce6] text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl lg:text-2xl">TDMS</span>
              <span className="text-xs sm:text-sm opacity-90 leading-tight hidden sm:block">
                Temperature and Dust Monitoring System
              </span>
              <span className="text-[10px] opacity-90 leading-tight sm:hidden">Temp & Dust Monitoring</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 xl:space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm">System {systemActive ? "Active" : "Inactive"}</span>
              <Switch
                checked={systemActive}
                onCheckedChange={setSystemActive}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white relative">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm sm:text-base">Smart Recommendations</h3>
                  <p className="text-xs text-gray-500">
                    {notificationCount > 0
                      ? `${notificationCount} item${notificationCount !== 1 ? "s" : ""} need${notificationCount === 1 ? "s" : ""} attention`
                      : "All systems operating normally"}
                  </p>
                </div>
                <ScrollArea className="h-48 sm:h-64">
                  <div className="p-3 space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-2 rounded-lg border-l-4 text-xs sm:text-sm ${getNotificationBgColor(notification.type)}`}
                        >
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1">
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                              {notification.recommendation && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                  💡 {notification.recommendation}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                                {notification.actionRequired && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                        <p className="text-xs text-gray-400">All systems operating normally</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white hover:text-purple-600 text-xs sm:text-sm"
            >
              Log In
            </Button>
            <Button size="sm" className="bg-white text-purple-600 hover:bg-gray-100 text-xs sm:text-sm">
              Sign Up
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white relative">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm">Smart Recommendations</h3>
                  <p className="text-xs text-gray-500">
                    {notificationCount > 0
                      ? `${notificationCount} item${notificationCount !== 1 ? "s" : ""} need attention`
                      : "All systems normal"}
                  </p>
                </div>
                <ScrollArea className="h-48">
                  <div className="p-3 space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 rounded-lg border-l-4 text-xs ${getNotificationBgColor(notification.type)}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-2 mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <ModeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-xs sm:max-w-sm">
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System {systemActive ? "Active" : "Inactive"}</span>
                    <Switch
                      checked={systemActive}
                      onCheckedChange={setSystemActive}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Navigation</h3>
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" size="sm" className="justify-start" asChild>
                        <Link href="/">Dashboard</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start" asChild>
                        <Link href="/thresholds">Thresholds</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start">
                        Analytics
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start">
                        Settings
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Log In
                    </Button>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
