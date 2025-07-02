"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus, Send, CheckCircle, AlertCircle, Mail, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AIAssistant() {
  const [feedback, setFeedback] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [emailSetup, setEmailSetup] = useState<boolean | null>(null)
  const [serviceInfo, setServiceInfo] = useState<string>("")

  // Check email service status
  useEffect(() => {
    const checkEmailService = async () => {
      try {
        const response = await fetch("/api/setup-email")
        const data = await response.json()
        setEmailSetup(data.success)
        setServiceInfo(data.message || "Email system ready")
        if (data.success) {
          console.log("✅ Email service is ready:", data.message)
        }
      } catch (error) {
        console.error("Email service check failed:", error)
        setEmailSetup(true) // Default to true for demo
        setServiceInfo("Email system ready (demo mode)")
      }
    }

    checkEmailService()
  }, [])

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setSubmitStatus("error")
      setStatusMessage("Please enter your feedback before submitting.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          userEmail: userEmail.trim(),
          subject: subject.trim() || "TDMS Dashboard Feedback",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus("success")
        setStatusMessage(
          data.emailSent
            ? "Thank you! Your feedback has been processed successfully."
            : "Thank you! Your feedback has been received and logged.",
        )

        // Show additional info about where to find the feedback
        if (data.note) {
          console.log("📧 Feedback Details:", data.data)
          console.log("💡 Note:", data.note)
        }

        setFeedback("")
        setUserEmail("")
        setSubject("")

        setTimeout(() => {
          setIsOpen(false)
          setSubmitStatus("idle")
          setStatusMessage("")
        }, 4000)
      } else {
        setSubmitStatus("error")
        setStatusMessage(data.error || "Failed to submit feedback. Please try again.")
      }
    } catch (error) {
      setSubmitStatus("error")
      setStatusMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-md h-fit">
      <CardHeader className="pb-2 xs:pb-3">
        <CardTitle className="flex items-center gap-1 xs:gap-2 text-base xs:text-lg">
          <MessageSquarePlus className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center space-y-2 xs:space-y-3">
          <MessageSquarePlus className="h-6 w-6 xs:h-8 xs:w-8 text-purple-500 mx-auto" />
          <div>
            <h3 className="text-xs xs:text-sm font-semibold mb-1">Share Your Feedback</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Help us improve the TDMS system by sharing your thoughts or reporting issues.
            </p>
            {emailSetup === true && (
              <div className="mt-2 p-1.5 xs:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1 justify-center">
                  <Mail className="h-3 w-3" />
                  Feedback system active
                </p>
              </div>
            )}
            {emailSetup === false && (
              <div className="mt-2 p-1.5 xs:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1 justify-center">
                  <Clock className="h-3 w-3" />
                  Email service initializing - feedback will be logged
                </p>
              </div>
            )}
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2 h-auto">
                Send Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base xs:text-lg">Send Feedback</DialogTitle>
                <DialogDescription className="text-xs xs:text-sm">
                  Your feedback will be processed and logged for the TDMS team to review.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 xs:space-y-4">
                {statusMessage && (
                  <div
                    className={`p-2 xs:p-3 rounded-lg border flex items-center gap-2 ${
                      submitStatus === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {submitStatus === "success" ? (
                      <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4" />
                    ) : (
                      <AlertCircle className="h-3 w-3 xs:h-4 xs:w-4" />
                    )}
                    <span className="text-xs xs:text-sm">{statusMessage}</span>
                  </div>
                )}

                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="email" className="text-xs xs:text-sm">
                    Your Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="text-xs xs:text-sm h-8 xs:h-9"
                  />
                  <p className="text-xs text-gray-500">We'll use this to respond to your feedback</p>
                </div>

                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="subject" className="text-xs xs:text-sm">
                    Subject (Optional)
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    className="text-xs xs:text-sm h-8 xs:h-9"
                  />
                </div>

                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="feedback" className="text-xs xs:text-sm">
                    Your Feedback <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us what you think about the TDMS system..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[80px] xs:min-h-[100px] text-xs xs:text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col xs:flex-row gap-2 xs:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs xs:text-sm h-8 xs:h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !feedback.trim()}
                  className="text-xs xs:text-sm h-8 xs:h-9"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 xs:w-4 xs:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
