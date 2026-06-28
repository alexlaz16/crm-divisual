'use client'
import { useDroppable } from '@dnd-kit/core'
import { fmt } from '@/lib/utils'
import DealCard from './deal-card'
import type { Deal, Stage } from '@/lib/types'

interface Props {
  stage: Stage
  deals: Deal[]
}

export default function KanbanColumn({ stage, deals }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const total = deals.reduce((a, c) => a + c.valor, 0)

  return (
    <div className="w-[288px] flex-shrink-0 flex flex-col max-h-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-[9px]">
          <span className="text-sm font-semibold">{stage}</span>
          <span
            className="inline-flex items-center justify-center min-w-5 h-5 px-[6px] rounded-full text-[11px] tabular-nums"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(245,245,245,0.6)' }}
          >
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: 'rgba(245,245,245,0.5)' }}>
          {fmt(total)}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto rounded-[14px] p-[10px] min-h-[120px] transition-[background,border-color]"
        style={{
          background: isOver ? 'rgba(250,197,28,0.05)' : 'transparent',
          border: `1px dashed ${isOver ? 'rgba(250,197,28,0.45)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  )
}
