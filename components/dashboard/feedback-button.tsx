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
import { Bot, User, Send, BarChart2 } from "lucide-react"

export default function FeedbackButton() {
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for warehouse monitoring. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ])

  // Predefined responses for demo purposes
  const predefinedResponses = {
    "when will i need to clean the warehouse": {
      text: "Based on current dust accumulation trends and historical data, I estimate you'll need to clean the warehouse in approximately 3 days. The PM2.5 levels have been increasing at a rate of 2.5 µg/m³ per day, and will likely reach the threshold of 45 µg/m³ by Friday.",
      chart: true,
    },
    "is the current humidity level harmful for coffee beans": {
      text: "The current humidity level of 65% is within the acceptable range for coffee bean storage, but it's approaching the upper limit. Ideally, coffee beans should be stored at 60-65% relative humidity. I recommend monitoring closely and considering slight dehumidification if levels continue to rise. Prolonged exposure to humidity above 70% can lead to mold growth and quality degradation.",
      chart: false,
    },
    "what is the current temperature": {
      text: "The current temperature is 24.5°C, which is within the optimal range for coffee storage (18-28°C). This temperature helps preserve the quality and flavor of your coffee beans.",
      chart: false,
    },
    "how is the humidity": {
      text: "Current humidity is at 65%. This is acceptable but approaching the upper limit. Monitor closely to ensure it doesn't exceed 70%.",
      chart: false,
    },
    "dust levels": {
      text: "Current PM2.5 dust level is 35 µg/m³. This is in the moderate range. Consider cleaning when it reaches 45 µg/m³.",
      chart: false,
    },
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

    // Find a matching predefined response or use default
    const lowerInput = input.toLowerCase()
    let responseContent =
      "I'll analyze that and get back to you shortly. Feel free to ask about temperature, humidity, dust levels, or cleaning schedules."
    let hasChart = false

    Object.entries(predefinedResponses).forEach(([key, value]) => {
      if (lowerInput.includes(key)) {
        responseContent = value.text
        hasChart = value.chart
      }
    })

    // Clear input immediately
    setInput("")

    // Add AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
        hasChart: hasChart,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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

                    {message.hasChart && (
                      <div className="mt-2 xs:mt-3 bg-white dark:bg-gray-700 p-2 rounded-md">
                        <div className="flex items-center gap-1 xs:gap-2 mb-2">
                          <BarChart2 className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                          <span className="text-xs font-medium">Dust Level Projection</span>
                        </div>
                        <div className="h-20 xs:h-24 sm:h-32 bg-gray-50 dark:bg-gray-600 rounded-md flex items-end p-2">
                          <div className="flex-1 flex items-end justify-around">
                            {[25, 30, 35, 40, 45, 50].map((value, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div
                                  className={`w-3 xs:w-4 sm:w-6 ${i < 3 ? "bg-green-500" : i < 5 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ height: `${value * 0.6}px` }}
                                ></div>
                                <span className="text-xs mt-1">Day {i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 xs:p-3 max-w-[85%] xs:max-w-[80%]">
                    <div className="flex items-center gap-1 xs:gap-2 mb-1">
                      <Bot className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
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
