'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md animate-fadeUp">
      <div className="flex items-center gap-3 mb-10 justify-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl text-bg"
          style={{ background: '#FAC51C' }}
        >
          L
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">Laguna</div>
          <div className="text-[10px] tracking-widest uppercase text-white/40">Country Club CRM</div>
        </div>
      </div>

      <div
        className="rounded-2xl p-8"
        style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-xl font-semibold mb-1">Iniciar sesión</h1>
        <p className="text-sm mb-7" style={{ color: 'rgba(245,245,245,0.45)' }}>
          Accede a tu cuenta del CRM
        </p>

        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patricia@laguna.mx"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-colors"
              style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-colors"
              style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-bg transition-colors disabled:opacity-60"
            style={{ background: loading ? 'rgba(250,197,28,0.7)' : '#FAC51C' }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = '#FFD23F') }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = '#FAC51C') }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center" style={{ color: 'rgba(245,245,245,0.4)' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
