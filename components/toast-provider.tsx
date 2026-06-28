'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { Check } from 'lucide-react'

type ToastFn = (message: string) => void

const ToastCtx = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastCtx)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string) => {
    if (timer) clearTimeout(timer)
    setMsg(message)
    const t = setTimeout(() => setMsg(null), 2600)
    setTimer(t)
  }, [timer])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div
          className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-[9px] px-5 py-3 rounded-full text-sm font-medium animate-fadeUp"
          style={{ background: '#1A1A1A', border: '1px solid rgba(250,197,28,0.4)', color: '#FAC51C', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
        >
          <Check size={16} strokeWidth={2} />
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
