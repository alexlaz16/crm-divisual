'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import type { Contact } from '../types'

export async function getContacts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('recency', { ascending: true })
  if (error) throw error
  return (data ?? []) as Contact[]
}

export async function getContact(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Contact
}

export async function createContact(
  payload: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('contacts')
    .insert({ ...payload, user_id: user.id })
  if (error) throw error
  revalidatePath('/contacts')
}

export async function updateContact(
  id: string,
  payload: Partial<Omit<Contact, 'id' | 'user_id'>>,
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contacts')
    .update(payload)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/contacts')
}
