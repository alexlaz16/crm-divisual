'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Briefcase, Percent, Clock, Home, Phone, FileText, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import KpiCard from './kpi-card'
import PipelineSummary from './pipeline-summary'
import RecentDeals from './recent-deals'
import { fmt } from '@/lib/utils'
import type { Deal } from '@/lib/types'

const UPCOMING_STATIC = [
  { title: 'Visita · Penthouse Marina', who: 'Mariana Vega', time: 'Hoy 11:00', Icon: Home },
  { title: 'Llamada de cierre', who: 'Sofía Moreno', time: 'Hoy 15:30', Icon: Phone },
  { title: 'Firma de contrato', who: 'Lucía Herrera', time: 'Hoy 17:00', Icon: FileText },
  { title: 'Visita · Villa Premium', who: 'Valentina Ríos', time: 'Mañana 10:00', Icon: Home },
  { title: 'Enviar propuesta', who: 'Diego Fuentes', time: 'Mañana 12:00', Icon: Mail },
]

interface Props {
  initialDeals: Deal[]
}

export default function DashboardClient({ initialDeals }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime-deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        supabase
          .from('deals')
          .select('*')
          .order('position')
          .then(({ data }) => { if (data) setDeals(data as Deal[]) })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalRevenue = deals.filter((d) => d.etapa === 'Cerrado').reduce((a, c) => a + c.valor, 0)
  const activeDeals = deals.filter((d) => d.etapa !== 'Cerrado').length
  const closedDeals = deals.filter((d) => d.etapa === 'Cerrado').length
  const closeRate = deals.length > 0 ? Math.round((closedDeals / deals.length) * 100) : 0

  const kpis = [
    { label: 'Revenue Total', value: fmt(totalRevenue || 12400000), delta: '+18.2% este mes', sparkData: [4,5,4.5,6,5.5,7,6.5,8,9,8.5,10,11.5], Icon: DollarSign },
    { label: 'Deals Activos', value: String(activeDeals || 28), delta: '+4 nuevos', sparkData: [18,20,19,22,21,24,23,25,26,25,27,28], Icon: Briefcase },
    { label: 'Tasa de Cierre', value: `${closeRate || 34}%`, delta: '+2.1 pts', sparkData: [28,29,30,29,31,30,32,33,32,33,34,34], Icon: Percent },
    { label: 'Próx. Actividades', value: '7', delta: '3 para hoy', sparkData: [3,5,4,6,5,7,6,8,5,7,6,7], Icon: Clock },
  ]

  return (
    <div className="h-full overflow-y-auto px-11 py-[34px] pb-12">
      {/* Header */}
      <div className="flex items-end justify-between gap-5 mb-[30px]">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Buenos días, Patricia</h1>
          <p className="mt-[6px] text-[13.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} · resumen de tu cartera
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-[18px] mb-[18px]">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} sparkData={k.sparkData} Icon={k.Icon} />
        ))}
      </div>

      {/* Pipeline + Upcoming */}
      <div className="grid gap-[18px] mb-[18px]" style={{ gridTemplateColumns: '1.45fr 1fr' }}>
        <PipelineSummary deals={deals} />

        <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[15px] font-semibold mb-4">Próximas actividades</h2>
          {UPCOMING_STATIC.map((a, i) => (
            <div key={i} className="flex items-center gap-[13px] py-[10px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div
                className="w-[34px] h-[34px] rounded-[9px] flex-shrink-0 flex items-center justify-center"
                style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <a.Icon size={16} style={{ color: '#FAC51C' }} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{a.title}</div>
                <div className="text-[11.5px]" style={{ color: 'rgba(245,245,245,0.45)' }}>{a.who}</div>
              </div>
              <span className="text-[11.5px] whitespace-nowrap" style={{ color: 'rgba(245,245,245,0.5)' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent deals */}
      <RecentDeals deals={deals} />
    </div>
  )
}
