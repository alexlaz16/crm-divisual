'use client'
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

async function registerSW() {
  if (!('serviceWorker' in navigator)) return
  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch {}
}

export default function PushPermission() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      registerSW()
      return
    }
    if (Notification.permission === 'default') {
      const t = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  async function allow() {
    setShow(false)
    const result = await Notification.requestPermission()
    if (result === 'granted') await registerSW()
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-[100] w-[calc(100vw-32px)] max-w-sm rounded-2xl p-5 animate-fadeUp"
      style={{
        background: '#1A1A1A',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
      }}
    >
      <button
        onClick={() => setShow(false)}
        className="absolute top-3 right-3 p-1 rounded"
        style={{ color: 'rgba(245,245,245,0.4)' }}
      >
        <X size={15} />
      </button>

      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(250,197,28,0.12)', border: '1px solid rgba(250,197,28,0.25)' }}
        >
          <Bell size={18} style={{ color: '#FAC51C' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-[5px]">Recordatorios de seguimiento</p>
          <p className="text-[12.5px] leading-[1.55] mb-4" style={{ color: 'rgba(245,245,245,0.55)' }}>
            Recibe una alerta cuando un contacto lleve más de 7 días sin actividad.
          </p>
          <div className="flex gap-2">
            <button
              onClick={allow}
              className="flex-1 py-[9px] rounded-xl text-[13px] font-semibold text-bg"
              style={{ background: '#FAC51C' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
            >
              Activar notificaciones
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-4 py-[9px] rounded-xl text-[13px]"
              style={{ color: 'rgba(245,245,245,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
