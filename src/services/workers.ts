import { supabase } from '@/lib/supabase'
import type { Worker } from '@/types'

export async function getWorkers(farmId: string): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('farm_id', farmId)
    .is('deleted_at', null)
    .order('full_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getWorker(id: string): Promise<Worker | null> {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function createWorker(worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>): Promise<Worker> {
  const { data, error } = await supabase
    .from('workers')
    .insert(worker)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
  const { data, error } = await supabase
    .from('workers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWorker(id: string): Promise<void> {
  const { error } = await supabase
    .from('workers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
