// Bildirim Servisi
// SMS, Email ve Admin Panel bildirimleri
// Retry mekanizması ile güvenilir gönderim

import type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationTemplate,
  AdminNotification,
} from './types'
import { createSMSService, type SMSSendRequest } from './sms-service'
import { emailService } from './email-service'
import type { SMSServiceConfig } from './types'

export class NotificationService {
  private notifications: Notification[] = []
  private adminNotifications: AdminNotification[] = []
  private templates: Map<string, NotificationTemplate> = new Map()
  private smsService: ReturnType<typeof createSMSService> | null = null

  /**
   * SMS servisini yapılandır
   */
  configureSMS(config: SMSServiceConfig): void {
    this.smsService = createSMSService(config)
  }

  /**
   * Template ekle
   */
  addTemplate(template: NotificationTemplate): void {
    const key = `${template.type}_${template.channel}_${template.language}`
    this.templates.set(key, template)
  }

  /**
   * Template'ten mesaj oluştur
   */
  private renderTemplate(
    template: NotificationTemplate,
    variables: Record<string, any>
  ): { subject?: string; message: string } {
    let message = template.body
    let subject = template.subject

    // Variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      message = message.replace(new RegExp(placeholder, 'g'), String(value))
      if (subject) {
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      }
    }

    return { subject, message }
  }

  /**
   * Bildirim gönder
   */
  async sendNotification(params: {
    userId?: string
    type: NotificationType
    channel: NotificationChannel
    recipient: string
    language?: 'tr' | 'en'
    variables?: Record<string, any>
    customSubject?: string
    customMessage?: string
  }): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      userId: params.userId,
      type: params.type,
      channel: params.channel,
      recipient: params.recipient,
      status: 'pending',
      message: '',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
    }

    // Template kullan veya custom mesaj
    if (params.customMessage) {
      notification.message = params.customMessage
      notification.subject = params.customSubject
    } else {
      const templateKey = `${params.type}_${params.channel}_${params.language || 'tr'}`
      const template = this.templates.get(templateKey)

      if (template) {
        const rendered = this.renderTemplate(template, params.variables || {})
        notification.message = rendered.message
        notification.subject = rendered.subject
      } else {
        notification.message = this.getDefaultMessage(params.type, params.channel)
      }
    }

    // Kuyruğa ekle
    this.notifications.push(notification)

    // Gönderimi başlat (async)
    this.processNotification(notification).catch(error => {
      console.error('[Notification] Failed to send:', error)
    })

    return notification
  }

  /**
   * Bildirimi işle (retry mekanizması ile)
   */
  private async processNotification(notification: Notification): Promise<void> {
    const delays = [1000, 5000, 15000] // 1s, 5s, 15s

    while (notification.retryCount < notification.maxRetries) {
      try {
        let success = false

        switch (notification.channel) {
          case 'sms':
            success = await this.sendSMS(notification)
            break
          case 'email':
            success = await this.sendEmail(notification)
            break
          case 'admin_panel':
            success = await this.sendAdminNotification(notification)
            break
        }

        if (success) {
          notification.status = 'sent'
          notification.sentAt = new Date()
          return
        }
      } catch (error: any) {
        console.error(`[Notification] Error on attempt ${notification.retryCount + 1}:`, error)
      }

      notification.retryCount++

      if (notification.retryCount < notification.maxRetries) {
        const delay = delays[notification.retryCount - 1] || 15000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // Tüm denemeler başarısız
    notification.status = 'failed'
    notification.failedAt = new Date()
    notification.errorMessage = 'Tüm gönderim denemeleri başarısız oldu'
  }

  /**
   * SMS gönder
   */
  private async sendSMS(notification: Notification): Promise<boolean> {
    if (!this.smsService) {
      console.warn('[Notification] SMS service not configured')
      return false
    }

    const request: SMSSendRequest = {
      to: notification.recipient,
      message: notification.message,
      metadata: {
        notificationId: notification.id,
        type: notification.type,
      },
    }

    const response = await this.smsService.sendSMS(request)
    return response.success
  }

  /**
   * Email gönder
   */
  private async sendEmail(notification: Notification): Promise<boolean> {
    try {
      return await emailService.sendEmail({
        to: notification.recipient,
        subject: notification.subject || this.getDefaultSubject(notification.type),
        html: notification.message,
        text: notification.message.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
      })
    } catch (error) {
      console.error('[Notification] Email send error:', error)
      return false
    }
  }

  /**
   * Admin panel bildirimi gönder
   */
  private async sendAdminNotification(notification: Notification): Promise<boolean> {
    const adminNotif: AdminNotification = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      type: notification.type,
      severity: this.getSeverity(notification.type),
      title: this.getAdminTitle(notification.type),
      message: notification.message,
      metadata: notification.metadata || {},
      read: false,
      createdAt: new Date(),
    }

    this.adminNotifications.push(adminNotif)
    return true
  }

  /**
   * Varsayılan mesaj
   */
  private getDefaultMessage(type: NotificationType, channel: NotificationChannel): string {
    const messages: Record<NotificationType, Record<NotificationChannel, string>> = {
      payment_success: {
        email: 'Ödemeniz başarıyla tamamlandı.',
        sms: 'Ödemeniz başarıyla tamamlandı.',
        push: 'Ödemeniz başarıyla tamamlandı.',
        admin_panel: 'Yeni başarılı ödeme işlemi',
      },
      payment_failed: {
        email: 'Ödeme işleminiz başarısız oldu.',
        sms: 'Ödeme işleminiz başarısız oldu.',
        push: 'Ödeme işleminiz başarısız oldu.',
        admin_panel: 'Başarısız ödeme işlemi',
      },
      payment_refund: {
        email: 'İadeniz işleme alındı.',
        sms: 'İadeniz işleme alındı.',
        push: 'İadeniz işleme alındı.',
        admin_panel: 'Yeni iade işlemi',
      },
      payment_chargeback: {
        email: 'Chargeback bildirimi alındı.',
        sms: 'Chargeback bildirimi alındı.',
        push: 'Chargeback bildirimi alındı.',
        admin_panel: 'Yeni chargeback bildirimi',
      },
      payment_preauth: {
        email: 'Ön provizyon alındı.',
        sms: 'Ön provizyon alındı.',
        push: 'Ön provizyon alındı.',
        admin_panel: 'Yeni ön provizyon',
      },
      payment_capture: {
        email: 'Ödeme tahsil edildi.',
        sms: 'Ödeme tahsil edildi.',
        push: 'Ödeme tahsil edildi.',
        admin_panel: 'Ödeme tahsilatı',
      },
      payment_void: {
        email: 'Ödeme iptal edildi.',
        sms: 'Ödeme iptal edildi.',
        push: 'Ödeme iptal edildi.',
        admin_panel: 'Ödeme iptali',
      },
      order_created: {
        email: 'Siparişiniz oluşturuldu.',
        sms: 'Siparişiniz oluşturuldu.',
        push: 'Siparişiniz oluşturuldu.',
        admin_panel: 'Yeni sipariş',
      },
      order_cancelled: {
        email: 'Siparişiniz iptal edildi.',
        sms: 'Siparişiniz iptal edildi.',
        push: 'Siparişiniz iptal edildi.',
        admin_panel: 'Sipariş iptali',
      },
    }

    return messages[type]?.[channel] || 'Bildirim'
  }

  /**
   * Varsayılan başlık
   */
  private getDefaultSubject(type: NotificationType): string {
    const subjects: Record<NotificationType, string> = {
      payment_success: 'Ödeme Başarılı - Petfendy',
      payment_failed: 'Ödeme Başarısız - Petfendy',
      payment_refund: 'İade İşlemi - Petfendy',
      payment_chargeback: 'Chargeback Bildirimi - Petfendy',
      payment_preauth: 'Ön Provizyon - Petfendy',
      payment_capture: 'Ödeme Tahsilatı - Petfendy',
      payment_void: 'Ödeme İptali - Petfendy',
      order_created: 'Sipariş Oluşturuldu - Petfendy',
      order_cancelled: 'Sipariş İptal Edildi - Petfendy',
    }

    return subjects[type] || 'Petfendy Bildirimi'
  }

  /**
   * Severity belirleme
   */
  private getSeverity(type: NotificationType): 'info' | 'warning' | 'error' | 'success' {
    const severityMap: Record<NotificationType, 'info' | 'warning' | 'error' | 'success'> = {
      payment_success: 'success',
      payment_failed: 'error',
      payment_refund: 'warning',
      payment_chargeback: 'error',
      payment_preauth: 'info',
      payment_capture: 'success',
      payment_void: 'warning',
      order_created: 'info',
      order_cancelled: 'warning',
    }

    return severityMap[type] || 'info'
  }

  /**
   * Admin başlığı
   */
  private getAdminTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string> = {
      payment_success: 'Başarılı Ödeme',
      payment_failed: 'Başarısız Ödeme',
      payment_refund: 'İade İşlemi',
      payment_chargeback: 'Chargeback Bildirimi',
      payment_preauth: 'Ön Provizyon',
      payment_capture: 'Ödeme Tahsilatı',
      payment_void: 'Ödeme İptali',
      order_created: 'Yeni Sipariş',
      order_cancelled: 'Sipariş İptali',
    }

    return titles[type] || 'Bildirim'
  }

  /**
   * Admin bildirimlerini getir
   */
  getAdminNotifications(filters?: {
    read?: boolean
    type?: NotificationType
    limit?: number
  }): AdminNotification[] {
    let notifications = [...this.adminNotifications]

    if (filters?.read !== undefined) {
      notifications = notifications.filter(n => n.read === filters.read)
    }

    if (filters?.type) {
      notifications = notifications.filter(n => n.type === filters.type)
    }

    // Yeniden eskiye sırala
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (filters?.limit) {
      notifications = notifications.slice(0, filters.limit)
    }

    return notifications
  }

  /**
   * Admin bildirimi okundu olarak işaretle
   */
  markAdminNotificationAsRead(id: string, readBy: string): void {
    const notification = this.adminNotifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      notification.readAt = new Date()
      notification.readBy = readBy
    }
  }
}

export const notificationService = new NotificationService()

