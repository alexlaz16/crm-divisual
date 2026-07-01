// Service worker for Laguna CRM notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Show notification sent from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SHOW_NOTIFICATION') return
  const { title, body, url } = event.data
  self.registration.showNotification(title, {
    body,
    icon: '/logo-192.png',
    badge: '/logo-72.png',
    tag: 'crm-followup',
    renotify: true,
    data: { url: url || '/contacts' },
  })
})

// Handle push events (for future server-push support)
self.addEventListener('push', (event) => {
  if (!event.data) return
  const { title, body, url } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title || 'Laguna CRM', {
      body: body || 'Tienes contactos pendientes de seguimiento',
      icon: '/logo-192.png',
      badge: '/logo-72.png',
      tag: 'crm-followup',
      data: { url: url || '/contacts' },
    })
  )
})

// Open contacts page when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/contacts'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
