'use client'
import { createContext, useContext, useState } from 'react'

interface CrmCtx {
  dealModalOpen: boolean
  openDealModal: () => void
  closeDealModal: () => void
}

const Ctx = createContext<CrmCtx>({
  dealModalOpen: false,
  openDealModal: () => {},
  closeDealModal: () => {},
})

export const useCrm = () => useContext(Ctx)

export default function CrmProvider({ children }: { children: React.ReactNode }) {
  const [dealModalOpen, setDealModalOpen] = useState(false)
  return (
    <Ctx.Provider value={{ dealModalOpen, openDealModal: () => setDealModalOpen(true), closeDealModal: () => setDealModalOpen(false) }}>
      {children}
    </Ctx.Provider>
  )
}
