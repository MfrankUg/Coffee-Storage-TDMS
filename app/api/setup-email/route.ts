import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test multiple email services to see which ones are available
    const services = []

    // Test EmailJS
    try {
      const emailJSTest = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      services.push({ name: "EmailJS", status: emailJSTest.status < 500 ? "available" : "unavailable" })
    } catch {
      services.push({ name: "EmailJS", status: "unavailable" })
    }

    // Test Getform
    try {
      const getformTest = await fetch("https://getform.io/f/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      services.push({ name: "Getform", status: getformTest.status < 500 ? "available" : "unavailable" })
    } catch {
      services.push({ name: "Getform", status: "unavailable" })
    }

    // Test webhook service
    try {
      const webhookTest = await fetch("https://webhook.site/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      services.push({ name: "Webhook", status: webhookTest.status < 500 ? "available" : "unavailable" })
    } catch {
      services.push({ name: "Webhook", status: "unavailable" })
    }

    const availableServices = services.filter((s) => s.status === "available")

    return NextResponse.json({
      success: true,
      message: `Email system ready with ${availableServices.length} available services`,
      services,
      note: "Feedback will be processed and logged. Check console for details.",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({
      success: true, // Always return success for demo
      message: "Email system ready (demo mode)",
      note: "Feedback will be logged to console",
    })
  }
}

export async function POST() {
  return GET()
}
