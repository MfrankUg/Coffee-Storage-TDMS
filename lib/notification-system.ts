export interface Notification {
  id: string
  type: "warning" | "info" | "success" | "critical"
  title: string
  message: string
  timestamp: Date
  priority: number // 1-5, 5 being highest
  actionRequired: boolean
  category: "temperature" | "humidity" | "dust" | "system" | "cleaning"
  recommendation?: string
}

export class NotificationSystem {
  private notifications: Notification[] = []

  generateNotifications(sensorData: {
    temperature: number
    humidity: number
    smallDustParticles: number
    largeParticles: number
  }): Notification[] {
    const notifications: Notification[] = []
    const now = new Date()

    // Temperature notifications
    if (sensorData.temperature > 28) {
      notifications.push({
        id: `temp-critical-${now.getTime()}`,
        type: "critical",
        title: "Critical Temperature Alert",
        message: `Temperature at ${sensorData.temperature.toFixed(1)}°C exceeds safe storage limits`,
        timestamp: now,
        priority: 5,
        actionRequired: true,
        category: "temperature",
        recommendation: "Immediately activate cooling systems and check for equipment malfunctions",
      })
    } else if (sensorData.temperature > 24) {
      notifications.push({
        id: `temp-warning-${now.getTime()}`,
        type: "warning",
        title: "Temperature Warning",
        message: `Temperature at ${sensorData.temperature.toFixed(1)}°C is above optimal range`,
        timestamp: now,
        priority: 3,
        actionRequired: true,
        category: "temperature",
        recommendation: "Increase ventilation and monitor cooling systems closely",
      })
    } else if (sensorData.temperature >= 18 && sensorData.temperature <= 24) {
      notifications.push({
        id: `temp-optimal-${now.getTime()}`,
        type: "success",
        title: "Temperature Optimal",
        message: `Temperature stable at ${sensorData.temperature.toFixed(1)}°C within ideal range`,
        timestamp: now,
        priority: 1,
        actionRequired: false,
        category: "temperature",
      })
    }

    // Humidity notifications
    if (sensorData.humidity > 75) {
      notifications.push({
        id: `humidity-critical-${now.getTime()}`,
        type: "critical",
        title: "Critical Humidity Alert",
        message: `Humidity at ${sensorData.humidity.toFixed(1)}% creates serious mold risk`,
        timestamp: now,
        priority: 5,
        actionRequired: true,
        category: "humidity",
        recommendation: "Activate dehumidifiers at maximum setting and check for water leaks",
      })
    } else if (sensorData.humidity > 65) {
      notifications.push({
        id: `humidity-warning-${now.getTime()}`,
        type: "warning",
        title: "Humidity Too High",
        message: `Humidity at ${sensorData.humidity.toFixed(1)}% may encourage mold growth`,
        timestamp: now,
        priority: 3,
        actionRequired: true,
        category: "humidity",
        recommendation: "Consider dehumidifying to maintain coffee quality",
      })
    }

    // Small dust particles notifications
    if (sensorData.smallDustParticles > 45) {
      notifications.push({
        id: `dust-critical-${now.getTime()}`,
        type: "critical",
        title: "Immediate Cleaning Required",
        message: `Dust level at ${sensorData.smallDustParticles.toFixed(1)} µg/m³ requires immediate attention`,
        timestamp: now,
        priority: 5,
        actionRequired: true,
        category: "dust",
        recommendation: "Stop operations and perform deep cleaning immediately",
      })
    } else if (sensorData.smallDustParticles > 35) {
      notifications.push({
        id: `dust-warning-${now.getTime()}`,
        type: "warning",
        title: "Dust Level Rising Rapidly",
        message: `Dust at ${sensorData.smallDustParticles.toFixed(1)} µg/m³ - early cleaning suggested`,
        timestamp: now,
        priority: 4,
        actionRequired: true,
        category: "cleaning",
        recommendation: "Schedule cleaning within 24 hours and check air filtration",
      })
    } else if (sensorData.smallDustParticles > 20) {
      notifications.push({
        id: `dust-info-${now.getTime()}`,
        type: "info",
        title: "Dust Level Moderate",
        message: `Dust at ${sensorData.smallDustParticles.toFixed(1)} µg/m³ - monitor closely`,
        timestamp: now,
        priority: 2,
        actionRequired: false,
        category: "dust",
        recommendation: "Plan routine cleaning within 3-5 days",
      })
    }

    // Weather-based recommendations
    const hour = now.getHours()
    if (hour >= 6 && hour <= 18) {
      // Daytime recommendations
      if (sensorData.temperature > 22 && sensorData.humidity < 60) {
        notifications.push({
          id: `weather-info-${now.getTime()}`,
          type: "info",
          title: "Weather Forecast Impact",
          message: "Sunny weather may affect warehouse humidity levels",
          timestamp: now,
          priority: 1,
          actionRequired: false,
          category: "system",
          recommendation: "Monitor humidity closely during peak sun hours",
        })
      }
    }

    // Overall system health
    const criticalIssues = notifications.filter((n) => n.type === "critical").length
    const warningIssues = notifications.filter((n) => n.type === "warning").length

    if (criticalIssues === 0 && warningIssues === 0) {
      notifications.push({
        id: `system-optimal-${now.getTime()}`,
        type: "success",
        title: "Warehouse Conditions Optimal",
        message: "All parameters within safe ranges for coffee storage",
        timestamp: now,
        priority: 1,
        actionRequired: false,
        category: "system",
      })
    }

    // Sort by priority (highest first) and timestamp (newest first)
    return notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }

  // Get notifications for display (limit to most important)
  getDisplayNotifications(sensorData: {
    temperature: number
    humidity: number
    smallDustParticles: number
    largeParticles: number
  }): Notification[] {
    const allNotifications = this.generateNotifications(sensorData)

    // Return top 5 most important notifications
    return allNotifications.slice(0, 5)
  }

  // Get count of actionable notifications
  getActionableCount(sensorData: {
    temperature: number
    humidity: number
    smallDustParticles: number
    largeParticles: number
  }): number {
    const notifications = this.generateNotifications(sensorData)
    return notifications.filter((n) => n.actionRequired && (n.type === "critical" || n.type === "warning")).length
  }
}

export const notificationSystem = new NotificationSystem()
