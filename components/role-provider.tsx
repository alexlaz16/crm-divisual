'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Role = 'admin' | 'vendedor'

const RoleContext = createContext<Role>('vendedor')

export function useRole() {
  return useContext(RoleContext)
}

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('vendedor')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        if (profile?.role === 'admin') setRole('admin')
      } catch {
        // profiles table may not exist yet — default stays 'vendedor'
      }
    })
  }, [])

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}
