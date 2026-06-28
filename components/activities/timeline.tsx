'use client'
import { useState, useTransition } from 'react'
import { Home, Phone, Mail, FileText, FileCheck, ArrowRight, StickyNote } from 'lucide-react'
import { addActivity } from '@/lib/actions/activities'
import type { Activity } from '@/lib/types'
import { useToast } from '../toast-provider'
import { useRouter } from 'next/navigation'

const TYPE_ICONS: Record<string, React.ElementType> = {
  visita: Home, llamada: Phone, email: Mail,
  nota: StickyNote, propuesta: FileCheck, doc: FileText, movimiento: ArrowRight,
}

function timeAgoStr(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  return `Hace ${d} días`
}

interface Props {
  activities: Activity[]
  contactId: string
}

export default function ActivityTimeline({ activities, contactId }: Props) {
  const toast = useToast()
  const router = useRouter()
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!note.trim()) return
    startTransition(async () => {
      try {
        await addActivity({ contact_id: contactId, title: 'Nota', description: note.trim(), type: 'nota', gold: false })
        setNote('')
        toast('Nota añadida ✓')
        router.refresh()
      } catch {
        toast('Error al añadir nota')
      }
    })
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h2 className="text-[15px] font-semibold mb-4">Timeline de actividades</h2>

      {/* Add note */}
      <div className="flex gap-[10px] mb-[22px]">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Añadir una nota..."
          className="flex-1 px-[14px] py-[11px] rounded-[10px] text-sm text-white outline-none"
          style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(250,197,28,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !note.trim()}
          className="px-[18px] rounded-[10px] text-sm font-semibold text-bg disabled:opacity-50"
          style={{ background: '#FAC51C' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
        >
          Añadir
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[18px] top-[10px] bottom-[10px] w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {activities.map((act) => {
          const Icon = TYPE_ICONS[act.type] ?? StickyNote
          const gold = act.gold
          return (
            <div key={act.id} className="flex gap-4 pb-[22px] relative">
              <div
                className="relative z-10 flex-shrink-0 w-[37px] h-[37px] rounded-full flex items-center justify-center"
                style={{ background: '#111111', border: `1px solid ${gold ? 'rgba(250,197,28,0.5)' : 'rgba(255,255,255,0.12)'}` }}
              >
                <Icon size={16} strokeWidth={1.5} style={{ color: gold ? '#FAC51C' : 'rgba(245,245,245,0.55)' }} />
              </div>
              <div className="flex-1 min-w-0 pt-[1px]">
                <div className="flex items-baseline justify-between gap-[10px]">
                  <span className="text-[13.5px] font-semibold">{act.title}</span>
                  <span className="text-[11.5px] whitespace-nowrap flex-shrink-0" style={{ color: 'rgba(245,245,245,0.4)' }}>
                    {timeAgoStr(act.created_at)}
                  </span>
                </div>
                {act.description && (
                  <p className="text-[12.5px] mt-[3px] leading-[1.5]" style={{ color: 'rgba(245,245,245,0.55)' }}>
                    {act.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        {activities.length === 0 && (
          <p className="pl-12 text-sm" style={{ color: 'rgba(245,245,245,0.35)' }}>Sin actividades aún.</p>
        )}
      </div>
    </div>
  )
}
