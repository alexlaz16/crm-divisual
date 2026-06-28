'use client'
import { useEffect, useState } from 'react'
import KanbanBoard from '@/components/pipeline/kanban-board'
import { useCrm } from '@/components/crm-context'
import { getDeals } from '@/lib/actions/deals'
import type { Deal } from '@/lib/types'

export default function PipelinePage() {
  const { openDealModal } = useCrm()
  const [deals, setDeals] = useState<Deal[]>([])

  useEffect(() => {
    getDeals().then(setDeals).catch(() => {})
  }, [])

  return <KanbanBoard initialDeals={deals} onOpenDeal={openDealModal} />
}
