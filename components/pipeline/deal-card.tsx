'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { fmt, initials } from '@/lib/utils'
import type { Deal } from '@/lib/types'

export default function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="rounded-xl p-[14px] mb-[10px] transition-[border-color] hover:[border-color:rgba(250,197,28,0.4)]"
      style={{
        background: '#1A1A1A',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: CSS.Translate.toString(transform),
      }}
    >
      <div className="flex items-center gap-[10px] mb-[10px]">
        <div
          className="w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,245,245,0.85)' }}
        >
          {initials(deal.cliente)}
        </div>
        <span className="text-sm font-semibold truncate">{deal.cliente}</span>
      </div>
      <div className="text-xs mb-3 truncate" style={{ color: 'rgba(245,245,245,0.5)' }}>{deal.propiedad}</div>
      <div className="flex items-center justify-between">
        <span className="text-[14.5px] font-semibold tabular-nums" style={{ color: '#FAC51C' }}>{fmt(deal.valor)}</span>
        <span
          className="text-[11px] px-2 py-[3px] rounded-full"
          style={{ color: 'rgba(245,245,245,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {deal.prob}%
        </span>
      </div>
    </div>
  )
}
