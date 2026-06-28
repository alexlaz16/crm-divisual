'use client'
import Link from 'next/link'
import { fmt } from '@/lib/utils'
import { STAGES } from '@/lib/types'
import type { Deal } from '@/lib/types'

export default function PipelineSummary({ deals }: { deals: Deal[] }) {
  const rows = STAGES.map((st) => {
    const cards = deals.filter((d) => d.etapa === st)
    const total = cards.reduce((a, c) => a + c.valor, 0)
    return { name: st, count: cards.length, total }
  })
  const maxT = Math.max(1, ...rows.map((r) => r.total))

  return (
    <div className="rounded-2xl p-6" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[15px] font-semibold">Resumen del Pipeline</h2>
        <Link href="/pipeline" className="text-[12.5px] font-medium" style={{ color: '#FAC51C' }}>
          Ver pipeline →
        </Link>
      </div>
      {rows.map((s) => (
        <div key={s.name} className="flex items-center gap-4 py-[11px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="w-32 flex-shrink-0 text-sm" style={{ color: 'rgba(245,245,245,0.7)' }}>{s.name}</span>
          <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.round((s.total / maxT) * 100)}%`, background: 'linear-gradient(90deg,rgba(250,197,28,0.45),#FAC51C)' }}
            />
          </div>
          <span className="w-7 text-center text-[12.5px] tabular-nums" style={{ color: 'rgba(245,245,245,0.45)' }}>{s.count}</span>
          <span className="w-16 text-right text-sm font-semibold tabular-nums">{fmt(s.total)}</span>
        </div>
      ))}
    </div>
  )
}
