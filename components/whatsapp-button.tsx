"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  const phoneNumber = "905323073264" // +90 532 307 32 64 (without spaces and special chars)
  const whatsappUrl = `https://wa.me/${phoneNumber}`

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-500 p-0 shadow-lg transition-all hover:bg-green-600 hover:scale-110 z-50"
      aria-label="WhatsApp ile iletişime geç"
      title="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  )
}
