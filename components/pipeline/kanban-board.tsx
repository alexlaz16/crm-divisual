'use client'
import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { moveDeal } from '@/lib/actions/deals'
import KanbanColumn from './kanban-column'
import DealCard from './deal-card'
import { STAGES } from '@/lib/types'
import { fmt } from '@/lib/utils'
import type { Deal, Stage } from '@/lib/types'
import { useToast } from '../toast-provider'
import { useRole } from '../role-provider'

interface Props {
  initialDeals: Deal[]
  onOpenDeal: () => void
}

export default function KanbanBoard({ initialDeals, onOpenDeal }: Props) {
  const toast = useToast()
  const role = useRole()
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime-pipeline')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        supabase.from('deals').select('*').order('position').then(({ data }) => {
          if (data) setDeals(data as Deal[])
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null
  const totalPipeline = deals.reduce((a, c) => a + c.valor, 0)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    if (role !== 'admin') return

    const newStage = String(over.id) as Stage
    if (!STAGES.includes(newStage)) return

    setDeals((prev) =>
      prev.map((d) => (d.id === String(active.id) ? { ...d, etapa: newStage } : d)),
    )
    try {
      await moveDeal(String(active.id), newStage)
    } catch {
      setDeals(initialDeals)
      toast('Error al mover deal')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-end justify-between gap-5 px-4 pt-6 pb-4 sm:px-11 sm:pt-[34px] sm:pb-[22px]">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-semibold tracking-[-0.02em]">Pipeline</h1>
          <p className="text-[13.5px] mt-[6px]" style={{ color: 'rgba(245,245,245,0.45)' }}>
            {deals.length} deals · {fmt(totalPipeline)} en pipeline
            <span className="hidden sm:inline"> · arrastra las tarjetas entre etapas</span>
          </p>
        </div>
        {role === 'admin' && (
          <button
            onClick={onOpenDeal}
            className="flex items-center gap-2 px-3 sm:px-[18px] py-[11px] rounded-[10px] text-sm font-semibold text-bg"
            style={{ background: '#FAC51C' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFD23F')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FAC51C')}
          >
            <Plus size={16} strokeWidth={2} /> Nuevo Deal
          </button>
        )}
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto px-3 pb-4 sm:px-11 sm:pb-[34px] pt-1 items-start">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={deals.filter((d) => d.etapa === stage)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
