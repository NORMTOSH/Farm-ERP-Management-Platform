import { supabase } from '@/lib/supabase'
import type { Farm } from '@/types'

export async function getFarms(): Promise<Farm[]> {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getFarm(id: string): Promise<Farm | null> {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function createFarm(farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm> {
  const { data, error } = await supabase
    .from('farms')
    .insert(farm)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFarm(id: string, updates: Partial<Farm>): Promise<Farm> {
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFarm(id: string): Promise<void> {
  const { error } = await supabase
    .from('farms')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
