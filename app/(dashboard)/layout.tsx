'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'
import NewDealModal from '@/components/new-deal-modal'
import ToastProvider from '@/components/toast-provider'
import CrmProvider, { useCrm } from '@/components/crm-context'
import { createClient } from '@/lib/supabase/client'

function Inner({ children }: { children: React.ReactNode }) {
  const { dealModalOpen, openDealModal, closeDealModal } = useCrm()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-white">
      <Sidebar onOpenDeal={openDealModal} userEmail={email} />
      <main className="flex-1 min-w-0 h-screen overflow-hidden relative">
        {children}
      </main>
      <NewDealModal open={dealModalOpen} onClose={closeDealModal} />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CrmProvider>
        <Inner>{children}</Inner>
      </CrmProvider>
    </ToastProvider>
  )
}
