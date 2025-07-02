// Realistic sensor data generator for coffee warehouse monitoring
export interface SensorReading {
  smallDustParticles: number // field1
  largeParticles: number // field2
  humidity: number // field4
  temperature: number // field5
  timestamp: string
  quality: "excellent" | "good" | "moderate" | "poor" | "hazardous"
}

export class CoffeeWarehouseSensorGenerator {
  private baseTemperature = 22 // Ideal coffee storage temperature
  private baseHumidity = 60 // Ideal coffee storage humidity
  private baseSmallDust = 15 // Normal small dust level in µg/m³
  private baseLargeDust = 10 // Normal large dust level in µg/m³

  // Seasonal and daily patterns
  private getTimeOfDayFactor(hour: number): number {
    // Temperature varies throughout the day
    // Cooler in early morning, warmer in afternoon
    return Math.sin(((hour - 6) * Math.PI) / 12) * 0.3
  }

  private getSeasonalFactor(): number {
    const month = new Date().getMonth()
    // Simulate seasonal temperature variation
    return Math.sin(((month - 3) * Math.PI) / 6) * 0.2
  }

  private getWeatherInfluence(): number {
    // Simulate weather patterns affecting warehouse conditions
    return (Math.random() - 0.5) * 0.4
  }

  private getDustAccumulation(hoursAgo: number): number {
    // Dust accumulates over time, with periodic cleaning
    const daysSinceLastClean = (hoursAgo / 24) % 7 // Clean every 7 days
    const accumulation = Math.min(daysSinceLastClean * 3, 25) // Max 25 µg/m³ accumulation
    const randomVariation = (Math.random() - 0.5) * 5
    return Math.max(5, this.baseSmallDust + accumulation + randomVariation)
  }

  generateReading(hoursAgo = 0): SensorReading {
    const timestamp = new Date(Date.now() - hoursAgo * 3600000)
    const hour = timestamp.getHours()

    // Generate realistic temperature (18-28°C range for coffee storage)
    const timeOfDayEffect = this.getTimeOfDayFactor(hour) * 3
    const seasonalEffect = this.getSeasonalFactor() * 2
    const weatherEffect = this.getWeatherInfluence() * 2
    const randomVariation = (Math.random() - 0.5) * 1.5

    const temperature =
      Math.round((this.baseTemperature + timeOfDayEffect + seasonalEffect + weatherEffect + randomVariation) * 10) / 10

    // Generate realistic humidity (40-80% range)
    const humidityVariation = (Math.random() - 0.5) * 15
    const temperatureInfluence = (temperature - this.baseTemperature) * -0.8 // Higher temp = lower humidity
    const humidity = Math.round(
      Math.max(35, Math.min(85, this.baseHumidity + humidityVariation + temperatureInfluence)),
    )

    // Generate realistic dust levels
    const smallDustParticles = Math.round(this.getDustAccumulation(hoursAgo) * 10) / 10
    const largeParticles = Math.round((smallDustParticles * 0.6 + (Math.random() - 0.5) * 3) * 10) / 10

    // Determine overall quality based on all factors
    const quality = this.determineQuality(temperature, humidity, smallDustParticles)

    return {
      temperature,
      humidity,
      smallDustParticles,
      largeParticles,
      timestamp: timestamp.toISOString(),
      quality,
    }
  }

  private determineQuality(temp: number, humidity: number, smallDust: number): SensorReading["quality"] {
    let score = 100

    // Temperature scoring (optimal: 18-24°C)
    if (temp < 18 || temp > 24) score -= 20
    if (temp < 15 || temp > 28) score -= 30

    // Humidity scoring (optimal: 50-65%)
    if (humidity < 50 || humidity > 65) score -= 15
    if (humidity < 40 || humidity > 75) score -= 25

    // Small dust scoring (optimal: <20 µg/m³)
    if (smallDust > 20) score -= 15
    if (smallDust > 35) score -= 25
    if (smallDust > 50) score -= 40

    if (score >= 85) return "excellent"
    if (score >= 70) return "good"
    if (score >= 50) return "moderate"
    if (score >= 30) return "poor"
    return "hazardous"
  }

  generateHistoricalData(hours: number): SensorReading[] {
    const readings: SensorReading[] = []
    for (let i = hours - 1; i >= 0; i--) {
      readings.push(this.generateReading(i))
    }
    return readings
  }

  // Generate data with specific conditions for testing
  generateTestScenario(scenario: "normal" | "high_temp" | "high_humidity" | "high_dust" | "critical"): SensorReading {
    const baseReading = this.generateReading(0)

    switch (scenario) {
      case "high_temp":
        return { ...baseReading, temperature: 26.5, quality: "moderate" }
      case "high_humidity":
        return { ...baseReading, humidity: 78, quality: "moderate" }
      case "high_dust":
        return { ...baseReading, smallDustParticles: 42.3, quality: "poor" }
      case "critical":
        return {
          ...baseReading,
          temperature: 29.2,
          humidity: 82,
          smallDustParticles: 55.7,
          quality: "hazardous",
        }
      default:
        return baseReading
    }
  }
}

// Utility functions for formatting and analysis
export const formatTemperature = (temp: number): string => `${temp.toFixed(1)}°C`
export const formatHumidity = (humidity: number): string => `${humidity.toFixed(1)}%`
export const formatSmallDustLevel = (dust: number): string => `${dust.toFixed(1)} µg/m³`
export const formatLargeParticles = (particles: number): string => `${particles.toFixed(1)} µg/m³`

export const getTemperatureStatus = (temp: number): { status: string; color: string; icon: string } => {
  if (temp >= 18 && temp <= 24) return { status: "Optimal", color: "text-green-600", icon: "✓" }
  if (temp >= 15 && temp <= 28) return { status: "Acceptable", color: "text-yellow-600", icon: "⚠" }
  return { status: "Critical", color: "text-red-600", icon: "⚠" }
}

export const getHumidityStatus = (humidity: number): { status: string; color: string; icon: string } => {
  if (humidity >= 50 && humidity <= 65) return { status: "Optimal", color: "text-green-600", icon: "✓" }
  if (humidity >= 40 && humidity <= 75) return { status: "Acceptable", color: "text-yellow-600", icon: "⚠" }
  return { status: "Critical", color: "text-red-600", icon: "⚠" }
}

export const getSmallDustStatus = (dust: number): { status: string; color: string; icon: string } => {
  if (dust <= 20) return { status: "Good", color: "text-green-600", icon: "✓" }
  if (dust <= 35) return { status: "Moderate", color: "text-yellow-600", icon: "⚠" }
  if (dust <= 50) return { status: "Poor", color: "text-orange-600", icon: "⚠" }
  return { status: "Hazardous", color: "text-red-600", icon: "⚠" }
}

export const getLargeParticlesStatus = (particles: number): { status: string; color: string; icon: string } => {
  if (particles <= 15) return { status: "Good", color: "text-green-600", icon: "✓" }
  if (particles <= 25) return { status: "Moderate", color: "text-yellow-600", icon: "⚠" }
  if (particles <= 35) return { status: "Poor", color: "text-orange-600", icon: "⚠" }
  return { status: "Hazardous", color: "text-red-600", icon: "⚠" }
}

export const getOverallQualityColor = (quality: SensorReading["quality"]): string => {
  switch (quality) {
    case "excellent":
      return "text-green-600"
    case "good":
      return "text-green-500"
    case "moderate":
      return "text-yellow-600"
    case "poor":
      return "text-orange-600"
    case "hazardous":
      return "text-red-600"
  }
}
