'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Briefcase, Percent, Clock, Home, Phone, FileText, Mail, StickyNote, ArrowLeftRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import KpiCard from './kpi-card'
import PipelineSummary from './pipeline-summary'
import RecentDeals from './recent-deals'
import { fmt } from '@/lib/utils'
import type { Deal, ActivityType } from '@/lib/types'

interface ActivityRow {
  id: string
  title: string
  type: ActivityType
  created_at: string
  contacts: { name: string } | null
}

const TYPE_ICON: Record<ActivityType, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  visita:      Home,
  llamada:     Phone,
  email:       Mail,
  nota:        StickyNote,
  propuesta:   FileText,
  movimiento:  ArrowLeftRight,
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'Hace un momento'
  const m = Math.floor(diff / 60)
  if (m < 60) return `Hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  if (d < 7) return `Hace ${d}d`
  return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

interface Props {
  initialDeals: Deal[]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardClient({ initialDeals }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [userName, setUserName] = useState('')
  const [activities, setActivities] = useState<ActivityRow[]>([])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata
      const name = meta?.full_name || meta?.name || data.user?.email?.split('@')[0] || ''
      setUserName(name)
    })

    supabase
      .from('activities')
      .select('id, title, type, created_at, contacts(name)')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setActivities(data as ActivityRow[]) })

    const channel = supabase
      .channel('realtime-deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        supabase
          .from('deals')
          .select('*')
          .order('position')
          .then(({ data }) => { if (data) setDeals(data as Deal[]) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        supabase
          .from('activities')
          .select('id, title, type, created_at, contacts(name)')
          .order('created_at', { ascending: false })
          .limit(5)
          .then(({ data }) => { if (data) setActivities(data as ActivityRow[]) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalRevenue = deals.filter((d) => d.etapa === 'Cerrado').reduce((a, c) => a + c.valor, 0)
  const activeDeals = deals.filter((d) => d.etapa !== 'Cerrado').length
  const closedDeals = deals.filter((d) => d.etapa === 'Cerrado').length
  const closeRate = deals.length > 0 ? Math.round((closedDeals / deals.length) * 100) : 0

  const kpis = [
    { label: 'Revenue Total', value: fmt(totalRevenue), delta: 'deals cerrados', sparkData: [4,5,4.5,6,5.5,7,6.5,8,9,8.5,10,11.5], Icon: DollarSign },
    { label: 'Deals Activos', value: String(activeDeals), delta: 'en el pipeline', sparkData: [18,20,19,22,21,24,23,25,26,25,27,28], Icon: Briefcase },
    { label: 'Tasa de Cierre', value: `${closeRate}%`, delta: 'sobre total de deals', sparkData: [28,29,30,29,31,30,32,33,32,33,34,34], Icon: Percent },
    { label: 'Total de Deals', value: String(deals.length), delta: 'en tu cartera', sparkData: [3,5,4,6,5,7,6,8,5,7,6,7], Icon: Clock },
  ]

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-8 sm:px-11 sm:py-[34px] sm:pb-12">
      {/* Header */}
      <div className="flex items-end justify-between gap-5 mb-6 sm:mb-[30px]">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-semibold tracking-[-0.02em]">
            {greeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="mt-[6px] text-[13.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} · resumen de tu cartera
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-[18px] mb-4 sm:mb-[18px]">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} sparkData={k.sparkData} Icon={k.Icon} />
        ))}
      </div>

      {/* Pipeline + Actividades */}
      <div className="grid gap-4 sm:gap-[18px] mb-4 sm:mb-[18px] grid-cols-1 lg:grid-cols-[1.45fr_1fr]">
        <PipelineSummary deals={deals} />

        <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[15px] font-semibold mb-4">Actividad reciente</h2>
          {activities.length === 0 ? (
            <p className="text-[13px] py-6 text-center" style={{ color: 'rgba(245,245,245,0.3)' }}>
              Sin actividades aún. Crea tu primer registro.
            </p>
          ) : activities.map((a) => {
            const Icon = TYPE_ICON[a.type] ?? FileText
            const contactName = a.contacts?.name ?? null
            return (
              <div key={a.id} className="flex items-center gap-[13px] py-[10px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div
                  className="w-[34px] h-[34px] rounded-[9px] flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Icon size={16} style={{ color: '#FAC51C' }} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  {contactName && (
                    <div className="text-[11.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>{contactName}</div>
                  )}
                </div>
                <span className="text-[11.5px] whitespace-nowrap" style={{ color: 'rgba(245,245,245,0.5)' }}>{timeAgo(a.created_at)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent deals */}
      <RecentDeals deals={deals} />
    </div>
  )
}
