"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { saveContactMessage } from "@/lib/storage"
import { emailService } from "@/lib/email-service"
import type { ContactMessage } from "@/lib/types"
import { Phone, Mail, Send, MapPin } from "lucide-react"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save to localStorage
      const message: ContactMessage = {
        id: `contact-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: 'new',
        createdAt: new Date()
      }
      
      saveContactMessage(message)

      // Send email notification
      await emailService.sendContactFormEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      })

      toast({
        title: "Mesajınız Gönderildi!",
        description: "En kısa sürede size dönüş yapacağız.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      })
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bize Ulaşın</h1>
          <p className="text-lg opacity-90">
            Sorularınız veya önerileriniz için lütfen bize yazın
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Telefon</h3>
                      <a href="tel:+905323073264" className="text-gray-600 hover:text-primary">
                        +90 532 307 32 64
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">E-posta</h3>
                      <a href="mailto:petfendyotel@gmail.com" className="text-gray-600 hover:text-primary">
                        petfendyotel@gmail.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Adres</h3>
                      <p className="text-gray-600">
                        Bağlıca, Şehit Hikmet Özer Cd. No:101<br />
                        Etimesgut/Ankara
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Mesaj Gönderin</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">İsim *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mesaj *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Gönderiliyor..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gönder
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Bizi Ziyaret Edin</h2>
            <p className="text-gray-600 mb-4">
              Bağlıca, Şehit Hikmet Özer Cd. No:101, Etimesgut/Ankara
            </p>
          </div>
          
          {/* Map Container */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white relative">
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Harita yükleniyor...</p>
                </div>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <p className="text-gray-600 mb-4">Harita yüklenemedi</p>
                  <Button
                    onClick={() => {
                      setMapError(false)
                      setMapLoaded(false)
                    }}
                    variant="outline"
                  >
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            )}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.285312221125!2d32.654489!3d39.935014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d33d243489a9c1%3A0x7de56ccc70ce972!2sPetfendy%20%7C%20Pet%20Otel%20%26%20E%C4%9Fitim%20Ankara!5e0!3m2!1str!2str!4v1735689600000!5m2!1str!2str"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Petfendy | Pet Otel & Eğitim Ankara"
                onLoad={() => setMapLoaded(true)}
                onError={() => {
                  setMapError(true)
                  setMapLoaded(false)
                }}
              />
          </div>

          {/* Map Link Fallback */}
          <div className="text-center mt-6">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Bağlıca+Şehit+Hikmet+Özer+Cd+No+101+Etimesgut+Ankara', '_blank')}
            >
              <MapPin className="w-5 h-5" />
              Google Maps'te Aç
            </Button>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

