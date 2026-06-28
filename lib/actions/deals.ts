'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import type { Deal, Stage } from '../types'

export async function getDeals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('position')
  if (error) throw error
  return (data ?? []) as Deal[]
}

export async function createDeal(
  payload: Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('deals')
    .insert({ ...payload, user_id: user.id })
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/pipeline')
}

export async function updateDeal(
  id: string,
  payload: Partial<Omit<Deal, 'id' | 'user_id'>>,
) {
  const supabase = await createClient()
  const { error } = await supabase.from('deals').update(payload).eq('id', id)
  if (error) throw error
  revalidatePath('/pipeline')
  revalidatePath('/')
}

export async function moveDeal(id: string, etapa: Stage) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .update({ etapa })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/pipeline')
  revalidatePath('/')
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/pipeline')
  revalidatePath('/')
}
