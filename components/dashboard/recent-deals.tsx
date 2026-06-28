import { fmt, initials } from '@/lib/utils'
import type { Deal } from '@/lib/types'

export default function RecentDeals({ deals }: { deals: Deal[] }) {
  const recent = deals.slice(0, 5)
  return (
    <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h2 className="text-[15px] font-semibold mb-1">Deals recientes</h2>
      {recent.map((d) => {
        const highlight = d.etapa === 'Cerrado' || d.etapa === 'Negociación'
        return (
          <div
            key={d.id}
            className="grid items-center gap-[14px] py-[13px]"
            style={{ gridTemplateColumns: '1.6fr 1.4fr 1fr 110px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-[11px] min-w-0">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold"
                style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,245,245,0.85)' }}
              >
                {initials(d.cliente)}
              </div>
              <span className="text-[13.5px] font-medium truncate">{d.cliente}</span>
            </div>
            <span className="text-sm truncate" style={{ color: 'rgba(245,245,245,0.55)' }}>{d.propiedad}</span>
            <span className="text-[12.5px] font-medium" style={{ color: highlight ? '#FAC51C' : 'rgba(245,245,245,0.6)' }}>
              {d.etapa}
            </span>
            <span className="text-sm font-semibold text-right tabular-nums">{fmt(d.valor)}</span>
          </div>
        )
      })}
    </div>
  )
}
