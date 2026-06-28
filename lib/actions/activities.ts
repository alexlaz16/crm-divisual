'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import type { Activity, ActivityType } from '../types'

export async function getActivities(contactId?: string, dealId?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })

  if (contactId) q = q.eq('contact_id', contactId)
  if (dealId) q = q.eq('deal_id', dealId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Activity[]
}

export async function addActivity(payload: {
  contact_id?: string
  deal_id?: string
  title: string
  description?: string
  type?: ActivityType
  gold?: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('activities').insert({
    ...payload,
    user_id: user.id,
    type: payload.type ?? 'nota',
    gold: payload.gold ?? false,
  })
  if (error) throw error

  if (payload.contact_id) {
    revalidatePath(`/contacts/${payload.contact_id}`)
  }
}
