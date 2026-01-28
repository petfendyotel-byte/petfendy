// Advanced Web Application Firewall (WAF) Service
// Anti-bot, anti-spam, and attack prevention system

interface WAFRule {
  id: string
  name: string
  pattern: RegExp
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'log' | 'block' | 'challenge'
  description: string
}

interface AttackPattern {
  ip: string
  attacks: number
  firstSeen: number
  lastSeen: number
  blocked: boolean
  patterns: string[]
}

interface BotSignature {
  userAgent: string
  isBot: boolean
  isMalicious: boolean
  confidence: number
  reason: string
}

export class WAFService {
  private attackPatterns: Map<string, AttackPattern> = new Map()
  private blockedIPs: Set<string> = new Set()
  private suspiciousIPs: Map<string, { count: number; lastSeen: number }> = new Map()

  // WAF Rules - Comprehensive attack detection
  private rules: WAFRule[] = [
    // SQL Injection Detection
    {
      id: 'sqli-001',
      name: 'SQL Injection - Union Select',
      pattern: /union[\s\+]+select/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects UNION SELECT SQL injection attempts'
    },
    {
      id: 'sqli-002',
      name: 'SQL Injection - Classic Patterns',
      pattern: /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects classic SQL injection patterns'
    },
    {
      id: 'sqli-003',
      name: 'SQL Injection - Comments',
      pattern: /((\%27)|(\')|(\-\-)|(\%23)|(#))/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects SQL comment injection'
    },
    {
      id: 'sqli-004',
      name: 'SQL Injection - Database Functions',
      pattern: /(exec|execute|sp_executesql|xp_cmdshell)/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects dangerous SQL functions'
    },

    // XSS Detection
    {
      id: 'xss-001',
      name: 'XSS - Script Tags',
      pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects script tag XSS attempts'
    },
    {
      id: 'xss-002',
      name: 'XSS - Event Handlers',
      pattern: /on\w+\s*=/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects event handler XSS'
    },
    {
      id: 'xss-003',
      name: 'XSS - JavaScript Protocol',
      pattern: /javascript:/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects javascript: protocol XSS'
    },
    {
      id: 'xss-004',
      name: 'XSS - Data URLs',
      pattern: /data:text\/html/gi,
      severity: 'medium',
      action: 'block',
      description: 'Detects data URL XSS'
    },

    // Path Traversal
    {
      id: 'path-001',
      name: 'Path Traversal - Directory Traversal',
      pattern: /\.\.\//g,
      severity: 'high',
      action: 'block',
      description: 'Detects directory traversal attempts'
    },
    {
      id: 'path-002',
      name: 'Path Traversal - Encoded',
      pattern: /(%2e%2e%2f|%2e%2e\/|\.\.%2f)/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects encoded path traversal'
    },
    {
      id: 'path-003',
      name: 'Path Traversal - System Files',
      pattern: /(etc\/passwd|etc\/shadow|windows\/system32)/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects system file access attempts'
    },

    // Command Injection
    {
      id: 'cmd-001',
      name: 'Command Injection - Shell Commands',
      pattern: /(;\s*(ls|cat|rm|wget|curl|nc|netcat|bash|sh))/gi,
      severity: 'critical',
      action: 'block',
      description: 'Detects shell command injection'
    },
    {
      id: 'cmd-002',
      name: 'Command Injection - Command Substitution',
      pattern: /(`.*`|\$\(.*\))/g,
      severity: 'critical',
      action: 'block',
      description: 'Detects command substitution'
    },

    // File Upload Attacks
    {
      id: 'upload-001',
      name: 'Malicious File Extensions',
      pattern: /\.(php|jsp|asp|aspx|exe|bat|cmd|sh|py|pl|rb)$/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects potentially malicious file uploads'
    },

    // LDAP Injection
    {
      id: 'ldap-001',
      name: 'LDAP Injection',
      pattern: /(\)\(\||\)\(\&|\*\)\()/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects LDAP injection attempts'
    },

    // NoSQL Injection
    {
      id: 'nosql-001',
      name: 'NoSQL Injection - MongoDB',
      pattern: /(\$where|\$ne|\$gt|\$lt|\$regex)/gi,
      severity: 'high',
      action: 'block',
      description: 'Detects MongoDB injection attempts'
    },

    // Server-Side Template Injection
    {
      id: 'ssti-001',
      name: 'Template Injection',
      pattern: /(\{\{.*\}\}|\{%.*%\}|\${.*})/g,
      severity: 'medium',
      action: 'log',
      description: 'Detects template injection attempts'
    }
  ]

  // Known malicious bot signatures
  private maliciousBots: RegExp[] = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /gobuster/i,
    /dirbuster/i,
    /wpscan/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /burpsuite/i,
    /w3af/i,
    /skipfish/i,
    /arachni/i,
    /vega/i,
    /zap/i,
    /paros/i,
    /webscarab/i,
    /havij/i,
    /pangolin/i,
    /jsql/i,
    /bsqlbf/i,
    /sqlninja/i,
    /sqlsus/i,
    /bbqsql/i,
    /NoSQLMap/i,
    /commix/i,
    /xsser/i,
    /beef/i,
    /metasploit/i,
    /msfconsole/i,
    /exploit/i,
    /payload/i,
    /shellshock/i,
    /heartbleed/i,
    /slowloris/i,
    /hulk/i,
    /goldeneye/i,
    /xerxes/i,
    /pyloris/i,
    /slowhttptest/i,
    /thc-ssl-dos/i,
    /siege/i,
    /ab\s/i, // Apache Bench
    /wrk/i,
    /bombardier/i,
    /vegeta/i,
    /artillery/i,
    /loadrunner/i,
    /jmeter/i
  ]

  // Suspicious bot patterns (not necessarily malicious but worth monitoring)
  private suspiciousBots: RegExp[] = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scanner/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /go-http-client/i,
    /java/i,
    /apache-httpclient/i,
    /okhttp/i,
    /node-fetch/i,
    /axios/i,
    /postman/i,
    /insomnia/i,
    /httpie/i,
    /rest-client/i,
    /test/i,
    /monitor/i,
    /check/i,
    /probe/i,
    /scan/i
  ]

  /**
   * Analyze request for attacks and bot behavior
   */
  analyzeRequest(request: {
    ip: string
    userAgent: string
    url: string
    method: string
    headers: Record<string, string>
    body?: string
  }): {
    blocked: boolean
    suspicious: boolean
    attacks: string[]
    botAnalysis: BotSignature
    reason: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  } {
    const attacks: string[] = []
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let blocked = false
    let suspicious = false

    // Check if IP is already blocked
    if (this.blockedIPs.has(request.ip)) {
      return {
        blocked: true,
        suspicious: true,
        attacks: ['IP_BLOCKED'],
        botAnalysis: this.analyzeBotSignature(request.userAgent),
        reason: 'IP address is blocked due to previous attacks',
        severity: 'critical'
      }
    }

    // Analyze bot signature
    const botAnalysis = this.analyzeBotSignature(request.userAgent)
    if (botAnalysis.isMalicious) {
      blocked = true
      attacks.push('MALICIOUS_BOT')
      maxSeverity = 'critical'
    }

    // Check all WAF rules
    const fullRequest = `${request.url} ${request.userAgent} ${JSON.stringify(request.headers)} ${request.body || ''}`
    
    for (const rule of this.rules) {
      if (rule.pattern.test(fullRequest)) {
        attacks.push(rule.id)
        
        if (this.getSeverityLevel(rule.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = rule.severity
        }

        if (rule.action === 'block') {
          blocked = true
        }
      }
    }

    // Update attack patterns
    if (attacks.length > 0) {
      this.updateAttackPattern(request.ip, attacks)
      suspicious = true
    }

    // Check for rapid requests (potential DDoS)
    if (this.checkRapidRequests(request.ip)) {
      attacks.push('RAPID_REQUESTS')
      suspicious = true
      if (maxSeverity === 'low') maxSeverity = 'medium'
    }

    // Auto-block IPs with multiple attacks
    if (this.shouldBlockIP(request.ip)) {
      this.blockedIPs.add(request.ip)
      blocked = true
      maxSeverity = 'critical'
    }

    return {
      blocked,
      suspicious,
      attacks,
      botAnalysis,
      reason: this.generateReason(attacks, botAnalysis),
      severity: maxSeverity
    }
  }

  /**
   * Analyze bot signature from User-Agent
   */
  private analyzeBotSignature(userAgent: string): BotSignature {
    if (!userAgent || userAgent.length < 5) {
      return {
        userAgent,
        isBot: true,
        isMalicious: true,
        confidence: 0.9,
        reason: 'Missing or invalid User-Agent'
      }
    }

    // Check for malicious bots
    for (const pattern of this.maliciousBots) {
      if (pattern.test(userAgent)) {
        return {
          userAgent,
          isBot: true,
          isMalicious: true,
          confidence: 0.95,
          reason: 'Known malicious bot signature'
        }
      }
    }

    // Check for suspicious bots
    for (const pattern of this.suspiciousBots) {
      if (pattern.test(userAgent)) {
        return {
          userAgent,
          isBot: true,
          isMalicious: false,
          confidence: 0.8,
          reason: 'Suspicious bot pattern detected'
        }
      }
    }

    // Check for legitimate search engine bots
    const legitimateBots = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i, // Yahoo
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /telegrambot/i
    ]

    for (const pattern of legitimateBots) {
      if (pattern.test(userAgent)) {
        return {
          userAgent,
          isBot: true,
          isMalicious: false,
          confidence: 0.9,
          reason: 'Legitimate search engine or social media bot'
        }
      }
    }

    return {
      userAgent,
      isBot: false,
      isMalicious: false,
      confidence: 0.1,
      reason: 'Appears to be legitimate user agent'
    }
  }

  /**
   * Update attack pattern for IP
   */
  private updateAttackPattern(ip: string, attacks: string[]): void {
    const now = Date.now()
    const existing = this.attackPatterns.get(ip)

    if (existing) {
      existing.attacks += attacks.length
      existing.lastSeen = now
      existing.patterns.push(...attacks)
    } else {
      this.attackPatterns.set(ip, {
        ip,
        attacks: attacks.length,
        firstSeen: now,
        lastSeen: now,
        blocked: false,
        patterns: [...attacks]
      })
    }
  }

  /**
   * Check for rapid requests (potential DDoS)
   */
  private checkRapidRequests(ip: string): boolean {
    const now = Date.now()
    const windowMs = 10 * 1000 // 10 seconds
    const maxRequests = 50 // 50 requests in 10 seconds

    const existing = this.suspiciousIPs.get(ip)
    
    if (!existing || now - existing.lastSeen > windowMs) {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: now })
      return false
    }

    existing.count++
    existing.lastSeen = now

    return existing.count > maxRequests
  }

  /**
   * Determine if IP should be blocked
   */
  private shouldBlockIP(ip: string): boolean {
    const pattern = this.attackPatterns.get(ip)
    if (!pattern) return false

    // Block after 5 attacks in 1 hour
    const oneHour = 60 * 60 * 1000
    const now = Date.now()
    
    return pattern.attacks >= 5 && (now - pattern.firstSeen) < oneHour
  }

  /**
   * Get severity level as number for comparison
   */
  private getSeverityLevel(severity: string): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 }
    return levels[severity as keyof typeof levels] || 1
  }

  /**
   * Generate human-readable reason
   */
  private generateReason(attacks: string[], botAnalysis: BotSignature): string {
    if (attacks.includes('IP_BLOCKED')) {
      return 'IP address blocked due to previous malicious activity'
    }

    if (attacks.includes('MALICIOUS_BOT')) {
      return `Malicious bot detected: ${botAnalysis.reason}`
    }

    if (attacks.length > 0) {
      const attackTypes = attacks.map(attack => {
        const rule = this.rules.find(r => r.id === attack)
        return rule ? rule.name : attack
      }).join(', ')
      
      return `Attack patterns detected: ${attackTypes}`
    }

    if (botAnalysis.isBot && !botAnalysis.isMalicious) {
      return `Bot detected: ${botAnalysis.reason}`
    }

    return 'Request appears legitimate'
  }

  /**
   * Get blocked IPs list
   */
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs)
  }

  /**
   * Get attack statistics
   */
  getAttackStats(): {
    totalAttacks: number
    uniqueIPs: number
    blockedIPs: number
    topAttackers: Array<{ ip: string; attacks: number }>
  } {
    const patterns = Array.from(this.attackPatterns.values())
    const totalAttacks = patterns.reduce((sum, p) => sum + p.attacks, 0)
    const topAttackers = patterns
      .sort((a, b) => b.attacks - a.attacks)
      .slice(0, 10)
      .map(p => ({ ip: p.ip, attacks: p.attacks }))

    return {
      totalAttacks,
      uniqueIPs: patterns.length,
      blockedIPs: this.blockedIPs.size,
      topAttackers
    }
  }

  /**
   * Manually block IP
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip)
  }

  /**
   * Manually unblock IP
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
  }

  /**
   * Clear old attack patterns (cleanup)
   */
  cleanup(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    // Clean attack patterns
    for (const [ip, pattern] of this.attackPatterns.entries()) {
      if (now - pattern.lastSeen > maxAge) {
        this.attackPatterns.delete(ip)
      }
    }

    // Clean suspicious IPs
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip)
      }
    }
  }
}

// Singleton instance
export const wafService = new WAFService()

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    wafService.cleanup()
  }, 60 * 60 * 1000) // 1 hour
}