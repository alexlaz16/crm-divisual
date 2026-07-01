'use client'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import NewDealModal from '@/components/new-deal-modal'
import ToastProvider from '@/components/toast-provider'
import CrmProvider, { useCrm } from '@/components/crm-context'
import PushPermission from '@/components/push-permission'
import NotificationChecker from '@/components/notification-checker'
import RoleProvider from '@/components/role-provider'
import { createClient } from '@/lib/supabase/client'

function Inner({ children }: { children: React.ReactNode }) {
  const { dealModalOpen, openDealModal, closeDealModal } = useCrm()
  const [email, setEmail] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-white">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — overlay on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <Sidebar
          onOpenDeal={() => { openDealModal(); setSidebarOpen(false) }}
          userEmail={email}
        />
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 h-screen overflow-hidden relative flex flex-col">
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0 md:hidden"
          style={{ background: '#0B0B0B', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded"
            style={{ color: 'rgba(245,245,245,0.7)' }}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: '#FAC51C', color: '#080808' }}
            >
              L
            </div>
            <span className="text-sm font-semibold">Laguna CRM</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {children}
        </div>
      </main>

      <NewDealModal open={dealModalOpen} onClose={closeDealModal} />
      <PushPermission />
      <NotificationChecker />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CrmProvider>
        <RoleProvider>
          <Inner>{children}</Inner>
        </RoleProvider>
      </CrmProvider>
    </ToastProvider>
  )
}
