"use client"

import { useState, useEffect } from "react"
import type { Invoice, Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Mail } from "lucide-react"

export function InvoiceSystem() {
  const [orders, setOrders] = useState<Order[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    setOrders(storedOrders)

    const storedInvoices = JSON.parse(localStorage.getItem("petfendy_invoices") || "[]")
    setInvoices(storedInvoices)
  }, [])

  const generateInvoice = (order: Order): Invoice => {
    const taxRate = 0.18
    const subtotal = order.totalPrice / (1 + taxRate)
    const taxAmount = order.totalPrice - subtotal

    return {
      id: `inv-${Date.now()}`,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      userId: order.userId,
      totalAmount: order.totalPrice,
      taxAmount,
      items: order.items,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "sent",
    }
  }

  const handleDownloadInvoice = (order: Order) => {
    const invoice = generateInvoice(order)

    const invoiceContent = `
FATURA
=====================================
Fatura No: ${invoice.invoiceNumber}
Tarih: ${invoice.issueDate.toLocaleDateString("tr-TR")}
Vade: ${invoice.dueDate.toLocaleDateString("tr-TR")}

MÜŞTERİ BİLGİLERİ
=====================================
Müşteri ID: ${invoice.userId}

ÜRÜNLER
=====================================
${invoice.items
  .map(
    (item) => `
${item.type === "hotel" ? item.details.roomName : item.details.serviceName}
Miktar: ${item.quantity}
Fiyat: ₺${item.price.toFixed(2)}
`,
  )
  .join("")}

ÖZET
=====================================
Ara Toplam: ₺${(invoice.totalAmount - invoice.taxAmount).toFixed(2)}
KDV (%18): ₺${invoice.taxAmount.toFixed(2)}
TOPLAM: ₺${invoice.totalAmount.toFixed(2)}

Ödeme Yöntemi: ${order.paymentMethod}
Durum: ${order.status}

Petfendy Platformu
www.petfendy.com
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(invoiceContent))
    element.setAttribute("download", `${invoice.invoiceNumber}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSendEmail = (order: Order) => {
    // Mock email sending
    const invoice = generateInvoice(order)

    const emailContent = `
Sayın Müşteri,

Siparişinizin faturası ektedir.

Fatura No: ${invoice.invoiceNumber}
Toplam Tutar: ₺${invoice.totalAmount.toFixed(2)}

Sorularınız için bize ulaşabilirsiniz.

Saygılarımızla,
Petfendy Ekibi
    `

    console.log("[v0] Email sent to user:", emailContent)
    alert("Fatura e-posta ile gönderildi")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Faturalarım</h2>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Henüz sipariş bulunmamaktadır</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Fatura #{order.invoiceNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₺{order.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-green-600">{order.status}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.type === "hotel" ? item.details.roomName : item.details.serviceName}</span>
                      <span>₺{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleDownloadInvoice(order)} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    İndir
                  </Button>
                  <Button onClick={() => handleSendEmail(order)} variant="outline" className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    E-posta Gönder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
