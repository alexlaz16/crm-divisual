import { getDeals } from '@/lib/actions/deals'
import DashboardClient from '@/components/dashboard/dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const deals = await getDeals()
  return <DashboardClient initialDeals={deals} />
}
