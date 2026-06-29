'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, User, BarChart2, Plus, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { key: 'dashboard', href: '/', label: 'Dashboard', Icon: LayoutGrid },
  { key: 'contacts', href: '/contacts', label: 'Contactos', Icon: User },
  { key: 'pipeline', href: '/pipeline', label: 'Pipeline', Icon: BarChart2 },
]

interface Props {
  onOpenDeal: () => void
  userEmail?: string | null
}

export default function Sidebar({ onOpenDeal, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const name = userEmail?.split('@')[0] ?? 'Usuario'
  const ini = name.slice(0, 2).toUpperCase()

  return (
    <aside
      className="w-[250px] flex-shrink-0 h-screen flex flex-col py-5 px-4"
      style={{ background: '#0B0B0B', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center font-bold text-[17px] flex-shrink-0 text-bg"
          style={{ background: '#FAC51C' }}
        >
          L
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-[0.01em]">Laguna</div>
          <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
            Country Club
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ key, href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'flex items-center gap-[13px] w-full px-[13px] py-[11px] rounded-[10px] text-[13.5px] font-medium transition-colors',
                active ? 'text-accent' : 'hover:bg-white/[0.04]',
              )}
              style={{
                background: active ? 'rgba(250,197,28,0.06)' : undefined,
                color: active ? '#FAC51C' : 'rgba(245,245,245,0.55)',
                borderLeft: `2px solid ${active ? '#FAC51C' : 'transparent'}`,
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* New Deal CTA */}
      <button
        onClick={onOpenDeal}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-[10px] font-semibold text-[13.5px] text-bg mb-4 transition-colors"
        style={{ background: '#FAC51C' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
      >
        <Plus size={17} strokeWidth={2} />
        Nuevo Deal
      </button>

      {/* User */}
      <div
        className="flex items-center gap-[11px] p-[9px] rounded-[11px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-[34px] h-[34px] rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-accent"
          style={{ background: '#1A1A1A', border: '1px solid rgba(250,197,28,0.5)' }}
        >
          {ini}
        </div>
        <div className="leading-[1.3] min-w-0 flex-1">
          <div className="text-[12.5px] font-medium truncate capitalize">{name}</div>
          <div className="text-[10.5px] truncate" style={{ color: 'rgba(245,245,245,0.4)' }}>
            {userEmail}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex-shrink-0 p-1 rounded transition-colors hover:text-white"
          style={{ color: 'rgba(245,245,245,0.4)' }}
          title="Cerrar sesión"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
