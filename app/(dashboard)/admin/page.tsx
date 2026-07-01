'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, User2, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/role-provider'
import { initials } from '@/lib/utils'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
}

export default function AdminPage() {
  const role = useRole()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (role === 'vendedor') { router.push('/'); return }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[])
        setLoading(false)
      })
  }, [role, router])

  async function toggleRole(profile: Profile) {
    if (profile.id === currentUserId) return
    const newRole = profile.role === 'admin' ? 'vendedor' : 'admin'
    setUpdating(profile.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)
    if (!error) {
      setProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, role: newRole } : p))
    }
    setUpdating(null)
  }

  if (role === 'vendedor') return null

  const name = (p: Profile) => p.full_name || p.email?.split('@')[0] || 'Usuario'

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-8 sm:px-11 sm:py-[34px] sm:pb-12">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-[7px] mb-6 text-sm transition-colors hover:text-white"
        style={{ background: 'none', border: 'none', color: 'rgba(245,245,245,0.55)', cursor: 'pointer', padding: '6px 0' }}
      >
        <ChevronLeft size={16} strokeWidth={1.6} />
        Dashboard
      </button>

      <h1 className="text-2xl sm:text-[26px] font-semibold tracking-[-0.02em] mb-1">Gestión de usuarios</h1>
      <p className="text-[13.5px] mb-8" style={{ color: 'rgba(245,245,245,0.45)' }}>
        {profiles.length} usuario{profiles.length !== 1 ? 's' : ''} registrado{profiles.length !== 1 ? 's' : ''}
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          { label: 'Administrador', desc: 'Acceso completo: crear, editar y eliminar', color: '#FAC51C', Icon: Shield },
          { label: 'Vendedor', desc: 'Solo puede crear nuevos contactos', color: 'rgba(245,245,245,0.6)', Icon: User2 },
        ].map(({ label, desc, color, Icon }) => (
          <div
            key={label}
            className="flex items-start gap-3 flex-1 min-w-[220px] p-4 rounded-xl"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Icon size={18} style={{ color, marginTop: 1 }} strokeWidth={1.5} />
            <div>
              <div className="text-sm font-semibold" style={{ color }}>{label}</div>
              <div className="text-[12px] mt-[3px]" style={{ color: 'rgba(245,245,245,0.45)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div
          className="grid gap-4 px-6 py-[13px]"
          style={{ gridTemplateColumns: '1fr auto', background: 'rgba(255,255,255,0.015)' }}
        >
          <span className="text-[10.5px] uppercase tracking-[0.1em] font-semibold" style={{ color: 'rgba(245,245,245,0.45)' }}>Usuario</span>
          <span className="text-[10.5px] uppercase tracking-[0.1em] font-semibold" style={{ color: 'rgba(245,245,245,0.45)' }}>Rol</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(245,245,245,0.4)' }}>Cargando usuarios...</div>
        )}

        {!loading && profiles.map((p) => {
          const isMe = p.id === currentUserId
          const isAdmin = p.role === 'admin'

          return (
            <div
              key={p.id}
              className="flex items-center gap-4 px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              {/* Avatar + info */}
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-semibold"
                style={{
                  background: '#1A1A1A',
                  border: `1px solid ${isAdmin ? 'rgba(250,197,28,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: isAdmin ? '#FAC51C' : 'rgba(245,245,245,0.85)',
                }}
              >
                {initials(name(p))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-medium truncate">{name(p)}</span>
                  {isMe && (
                    <span
                      className="text-[10px] px-[7px] py-[2px] rounded-full font-medium flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(245,245,245,0.45)' }}
                    >
                      Tú
                    </span>
                  )}
                </div>
                <div className="text-[12px] truncate" style={{ color: 'rgba(245,245,245,0.45)' }}>{p.email}</div>
              </div>

              {/* Role toggle */}
              <button
                onClick={() => toggleRole(p)}
                disabled={isMe || updating === p.id}
                title={isMe ? 'No puedes cambiar tu propio rol' : `Cambiar a ${isAdmin ? 'Vendedor' : 'Admin'}`}
                className="flex items-center gap-[7px] px-4 py-[9px] rounded-xl text-[12.5px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isAdmin ? 'rgba(250,197,28,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isAdmin ? 'rgba(250,197,28,0.35)' : 'rgba(255,255,255,0.12)'}`,
                  color: isAdmin ? '#FAC51C' : 'rgba(245,245,245,0.65)',
                }}
                onMouseEnter={(e) => {
                  if (!isMe) e.currentTarget.style.borderColor = isAdmin ? '#FAC51C' : 'rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isAdmin ? 'rgba(250,197,28,0.35)' : 'rgba(255,255,255,0.12)'
                }}
              >
                {updating === p.id ? '...' : isAdmin ? <><Shield size={13} strokeWidth={1.5} /> Admin</> : <><User2 size={13} strokeWidth={1.5} /> Vendedor</>}
              </button>
            </div>
          )
        })}

        {!loading && profiles.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(245,245,245,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            No hay usuarios registrados aún.
          </div>
        )}
      </div>

      <p className="mt-4 text-[12px]" style={{ color: 'rgba(245,245,245,0.3)' }}>
        Haz clic en el rol para cambiarlo. No puedes cambiar tu propio rol.
      </p>
    </div>
  )
}
