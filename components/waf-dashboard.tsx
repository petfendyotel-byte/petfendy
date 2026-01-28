"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Activity, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from "lucide-react"

interface WAFStats {
  totalAttacks: number
  uniqueIPs: number
  blockedIPs: number
  topAttackers: Array<{ ip: string; attacks: number }>
}

interface BlockedIP {
  ip: string
  reason?: string
  blockedAt?: string
}

export function WAFDashboard() {
  const [stats, setStats] = useState<WAFStats | null>(null)
  const [blockedIPs, setBlockedIPs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBlockIP, setNewBlockIP] = useState('')
  const [unblockIP, setUnblockIP] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/waf?action=stats')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
        setBlockedIPs(data.data.blockedIPs || [])
      } else {
        throw new Error(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch WAF stats')
    } finally {
      setLoading(false)
    }
  }

  const blockIPAddress = async () => {
    if (!newBlockIP.trim()) return

    try {
      const response = await fetch('/api/admin/waf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', ip: newBlockIP.trim() })
      })

      const data = await response.json()
      if (data.success) {
        setNewBlockIP('')
        fetchStats() // Refresh stats
      } else {
        setError(data.error || 'Failed to block IP')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block IP')
    }
  }

  const unblockIPAddress = async () => {
    if (!unblockIP.trim()) return

    try {
      const response = await fetch('/api/admin/waf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', ip: unblockIP.trim() })
      })

      const data = await response.json()
      if (data.success) {
        setUnblockIP('')
        fetchStats() // Refresh stats
      } else {
        setError(data.error || 'Failed to unblock IP')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock IP')
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (attacks: number) => {
    if (attacks >= 10) return 'destructive'
    if (attacks >= 5) return 'secondary'
    return 'default'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            WAF Dashboard
          </h2>
          <p className="text-muted-foreground">
            Web Application Firewall monitoring and management
          </p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attacks</CardTitle>
            <Zap className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.totalAttacks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Detected attack attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Attackers</CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.uniqueIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different IP addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.blockedIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ACTIVE
            </div>
            <p className="text-xs text-muted-foreground">
              WAF is protecting your site
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attackers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attackers">Top Attackers</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
          <TabsTrigger value="manage">Manage IPs</TabsTrigger>
        </TabsList>

        <TabsContent value="attackers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Attackers
              </CardTitle>
              <CardDescription>
                IP addresses with the most attack attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topAttackers && stats.topAttackers.length > 0 ? (
                <div className="space-y-3">
                  {stats.topAttackers.map((attacker, index) => (
                    <div key={attacker.ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <code className="font-mono text-sm">{attacker.ip}</code>
                      </div>
                      <Badge variant={getSeverityColor(attacker.attacks)}>
                        {attacker.attacks} attacks
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No attack attempts detected</p>
                  <p className="text-sm">Your site is secure!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Blocked IP Addresses
              </CardTitle>
              <CardDescription>
                Currently blocked IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedIPs && blockedIPs.length > 0 ? (
                <div className="space-y-2">
                  {blockedIPs.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <code className="font-mono text-sm">{ip}</code>
                      <Badge variant="destructive">BLOCKED</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No IP addresses are currently blocked</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Block IP Address</CardTitle>
                <CardDescription>
                  Manually block an IP address from accessing your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="192.168.1.1"
                  value={newBlockIP}
                  onChange={(e) => setNewBlockIP(e.target.value)}
                />
                <Button 
                  onClick={blockIPAddress} 
                  variant="destructive" 
                  className="w-full"
                  disabled={!newBlockIP.trim()}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Block IP
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Unblock IP Address</CardTitle>
                <CardDescription>
                  Remove an IP address from the blocked list
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="192.168.1.1"
                  value={unblockIP}
                  onChange={(e) => setUnblockIP(e.target.value)}
                />
                <Button 
                  onClick={unblockIPAddress} 
                  variant="outline" 
                  className="w-full"
                  disabled={!unblockIP.trim()}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Unblock IP
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}