import { createClient } from "@supabase/supabase-js"

// Check if environment variables are defined and valid
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Validate URL format to prevent URL construction errors
const isValidUrl = (url: string) => {
  try {
    // This will throw if the URL is invalid
    new URL(url)
    return url.startsWith("http") && url.length > 10
  } catch {
    return false
  }
}

// Check if we have valid credentials
const hasValidCredentials = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 10
const hasValidServiceCredentials = isValidUrl(supabaseUrl) && supabaseServiceKey.length > 10

// Create a dummy client for development if credentials are missing
const isDevelopment = process.env.NODE_ENV === "development"

// Client-side Supabase client
export const supabase = (() => {
  if (!hasValidCredentials) {
    console.warn("⚠️ Supabase credentials missing or invalid. Using mock client.")
    return createMockClient()
  }

  try {
    // Create the real client
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    // Return a mock client that won't break the app
    return createMockClient()
  }
})()

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  if (!hasValidServiceCredentials) {
    console.warn("⚠️ Supabase service credentials missing or invalid. Using mock client.")
    return createMockClient()
  }

  try {
    // Create the real client
    return createClient(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.error("Failed to initialize Supabase server client:", error)
    return createMockClient()
  }
}

// Create a mock client that won't break the app when credentials are missing
function createMockClient() {
  return {
    from: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        gte: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  }
}

// Database types
export interface SensorReading {
  id: number
  entry_id: number
  field1: number | null // Temperature
  field2: number | null // Humidity
  field3: number | null // Dust Level
  field4: number | null // Additional sensor
  field5: number | null // Additional sensor
  field6: number | null // Additional sensor
  field7: number | null // Additional sensor
  field8: number | null // Additional sensor
  created_at: string
  updated_at: string
}

export interface ChannelInfo {
  id: number
  name: string
  description: string
  latitude: number | null
  longitude: number | null
  field1: string | null
  field2: string | null
  field3: string | null
  field4: string | null
  field5: string | null
  field6: string | null
  field7: string | null
  field8: string | null
  created_at: string
  updated_at: string
}
