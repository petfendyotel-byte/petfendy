"use client"

import { useState, useEffect } from "react"
import type { Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ReportsAnalytics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dateRange, setDateRange] = useState("month")

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    setOrders(storedOrders)
  }, [])

  const calculateStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
    const completedOrders = orders.filter((o) => o.status === "completed").length
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const paidOrders = orders.filter((o) => o.status === "paid").length

    const hotelOrders = orders.filter((o) => o.items.some((i) => i.type === "hotel"))
    const taxiOrders = orders.filter((o) => o.items.some((i) => i.type === "taxi"))

    const hotelRevenue = hotelOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    const taxiRevenue = taxiOrders.reduce((sum, order) => sum + order.totalPrice, 0)

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      paidOrders,
      hotelOrders: hotelOrders.length,
      taxiOrders: taxiOrders.length,
      hotelRevenue,
      taxiRevenue,
      avgOrderValue,
    }
  }

  const stats = calculateStats()

  const getMonthlyData = () => {
    const monthlyData: Record<string, number> = {}

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += order.totalPrice
    })

    return Object.entries(monthlyData)
      .sort()
      .map(([month, revenue]) => ({
        month,
        revenue,
      }))
  }

  const getServiceBreakdown = () => {
    const breakdown: Record<string, { count: number; revenue: number }> = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const serviceName = item.type === "hotel" ? item.details.roomName : item.details.serviceName

        if (!breakdown[serviceName]) {
          breakdown[serviceName] = { count: 0, revenue: 0 }
        }
        breakdown[serviceName].count += 1
        breakdown[serviceName].revenue += item.price
      })
    })

    return Object.entries(breakdown)
      .map(([service, data]) => ({
        service,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  const monthlyData = getMonthlyData()
  const serviceBreakdown = getServiceBreakdown()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Raporlar ve İstatistikler</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
          <option value="year">Bu Yıl</option>
          <option value="all">Tümü</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Sipariş</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₺{stats.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ort. Sipariş Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₺{stats.avgOrderValue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ortalama</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completedOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOrders > 0 ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(0)}%` : "0%"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hizmet Türü Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Pet Otel</span>
                  <span className="text-sm font-bold">₺{stats.hotelRevenue.toFixed(0)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${stats.totalRevenue > 0 ? (stats.hotelRevenue / stats.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.hotelOrders} sipariş</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Hayvan Taksi</span>
                  <span className="text-sm font-bold">₺{stats.taxiRevenue.toFixed(0)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${stats.totalRevenue > 0 ? (stats.taxiRevenue / stats.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.taxiOrders} sipariş</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sipariş Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tamamlanan</span>
                  <span className="text-sm font-bold">{stats.completedOrders}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Ödendi</span>
                  <span className="text-sm font-bold">{stats.paidOrders}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.paidOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Beklemede</span>
                  <span className="text-sm font-bold">{stats.pendingOrders}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Aylık Gelir</TabsTrigger>
          <TabsTrigger value="services">Hizmet Detayları</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Gelir Trendi</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Veri bulunmamaktadır</p>
              ) : (
                <div className="space-y-3">
                  {monthlyData.map((data) => (
                    <div key={data.month}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{data.month}</span>
                        <span className="text-sm font-bold">₺{data.revenue.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              Math.max(...monthlyData.map((d) => d.revenue)) > 0
                                ? (data.revenue / Math.max(...monthlyData.map((d) => d.revenue))) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Detaylı Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceBreakdown.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Veri bulunmamaktadır</p>
              ) : (
                <div className="space-y-4">
                  {serviceBreakdown.map((service) => (
                    <div key={service.service} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{service.service}</p>
                          <p className="text-sm text-muted-foreground">{service.count} sipariş</p>
                        </div>
                        <p className="font-bold text-primary">₺{service.revenue.toFixed(0)}</p>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              Math.max(...serviceBreakdown.map((s) => s.revenue)) > 0
                                ? (service.revenue / Math.max(...serviceBreakdown.map((s) => s.revenue))) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
