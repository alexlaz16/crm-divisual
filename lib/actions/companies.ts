'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import type { Company } from '../types'

export async function getCompanies() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as Company[]
}

export async function createCompany(
  payload: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('companies')
    .insert({ ...payload, user_id: user.id })
  if (error) throw error
  revalidatePath('/companies')
}

export async function updateCompany(
  id: string,
  payload: Partial<Omit<Company, 'id' | 'user_id'>>,
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/companies')
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/companies')
}
