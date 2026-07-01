'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'lc_notified'
const CHECK_KEY = 'lc_last_check'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

async function sendNotification(title: string, body: string) {
  if (!('serviceWorker' in navigator)) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, tag: 'crm-followup' })
    }
    return
  }
  try {
    const reg = await navigator.serviceWorker.ready
    // Use SW to show notification (required on mobile browsers)
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body })
    } else {
      await reg.showNotification(title, {
        body,
        icon: '/logo-192.png',
        tag: 'crm-followup',
        data: { url: '/contacts' },
      })
    }
  } catch {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, tag: 'crm-followup' })
    }
  }
}

export default function NotificationChecker() {
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    // Only check once per day per session
    const lastCheck = Number(localStorage.getItem(CHECK_KEY) || '0')
    if (Date.now() - lastCheck < 24 * 60 * 60 * 1000) return
    localStorage.setItem(CHECK_KEY, String(Date.now()))

    const supabase = createClient()
    const sevenDaysAgo = new Date(Date.now() - WEEK_MS).toISOString()

    async function check() {
      // Contacts created more than 7 days ago
      const { data: oldContacts } = await supabase
        .from('contacts')
        .select('id, name')
        .lt('created_at', sevenDaysAgo)

      if (!oldContacts?.length) return

      // Contact IDs with at least one activity in the last 7 days
      const { data: recentActs } = await supabase
        .from('activities')
        .select('contact_id')
        .gt('created_at', sevenDaysAgo)
        .not('contact_id', 'is', null)
        .in('contact_id', oldContacts.map((c) => c.id))

      const activeIds = new Set((recentActs || []).map((a) => a.contact_id).filter(Boolean))
      const inactive = oldContacts.filter((c) => !activeIds.has(c.id))
      if (!inactive.length) return

      // Filter out contacts we already notified this week
      const stored: Record<string, number> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const now = Date.now()
      const toNotify = inactive.filter((c) => !stored[c.id] || now - stored[c.id] > WEEK_MS)
      if (!toNotify.length) return

      // Save notification timestamps
      toNotify.forEach((c) => { stored[c.id] = now })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

      // Build notification message
      const names = toNotify.map((c) => c.name)
      if (toNotify.length === 1) {
        await sendNotification(
          'Seguimiento pendiente 📋',
          `${names[0]} lleva más de 7 días sin actividad`,
        )
      } else {
        const preview = names.slice(0, 3).join(', ') + (names.length > 3 ? ` y ${names.length - 3} más` : '')
        await sendNotification(
          `${toNotify.length} contactos sin seguimiento 📋`,
          preview,
        )
      }
    }

    check()
  }, [])

  return null
}
