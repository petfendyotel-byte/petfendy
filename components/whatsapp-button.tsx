"use client"

import { useState, useEffect } from "react"
import { MessageCircle, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppButton() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const phoneNumber = "905323073264" // +90 532 307 32 64 (without spaces and special chars)
  const whatsappUrl = `https://wa.me/${phoneNumber}`

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* WhatsApp Button - Sol Alt */}
      <Button
        onClick={handleWhatsAppClick}
        size="lg"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-green-500 p-0 shadow-lg transition-all hover:bg-green-600 hover:scale-110 z-50"
        aria-label="WhatsApp ile iletişime geç"
        title="WhatsApp ile iletişime geç"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>

      {/* Scroll to Top Button - Sağ Alt */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-cyan-500 p-0 shadow-lg transition-all hover:bg-cyan-600 hover:scale-110 z-50 animate-in fade-in duration-300"
          aria-label="Yukarı çık"
          title="Yukarı çık"
        >
          <ArrowUp className="h-7 w-7 text-white" />
        </Button>
      )}
    </>
  )
}
