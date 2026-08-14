import { supabase } from '@/lib/supabase'
import type { Task, TaskAssignment, TaskEvidence, TaskVerification, TaskAuditLog, TaskGpsLog } from '@/types'

export async function getTasks(farmId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('farm_id', farmId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function getTaskAssignments(taskId: string): Promise<TaskAssignment[]> {
  const { data, error } = await supabase
    .from('task_assignments')
    .select('*, workers(*)')
    .eq('task_id', taskId)

  if (error) throw error
  return data || []
}

export async function assignTask(taskId: string, workerId: string): Promise<TaskAssignment> {
  const { data, error } = await supabase
    .from('task_assignments')
    .insert({ task_id: taskId, worker_id: workerId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTaskEvidence(taskId: string): Promise<TaskEvidence[]> {
  const { data, error } = await supabase
    .from('task_evidence')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function uploadTaskEvidence(evidence: Omit<TaskEvidence, 'id' | 'created_at'>): Promise<TaskEvidence> {
  const { data, error } = await supabase
    .from('task_evidence')
    .insert(evidence)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verifyTask(
  taskId: string,
  verifierId: string,
  action: 'approve' | 'reject',
  comment?: string
): Promise<TaskVerification> {
  const { data, error } = await supabase
    .from('task_verifications')
    .insert({
      task_id: taskId,
      verifier_id: verifierId,
      action,
      comment: comment || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTaskVerifications(taskId: string): Promise<TaskVerification[]> {
  const { data, error } = await supabase
    .from('task_verifications')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTaskAuditLog(taskId: string): Promise<TaskAuditLog[]> {
  const { data, error } = await supabase
    .from('task_audit_log')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function logTaskAudit(
  taskId: string,
  userId: string,
  action: string,
  oldStatus?: string,
  newStatus?: string,
  metadata?: Record<string, unknown>
): Promise<TaskAuditLog> {
  const { data, error } = await supabase
    .from('task_audit_log')
    .insert({
      task_id: taskId,
      user_id: userId,
      action,
      old_status: oldStatus || null,
      new_status: newStatus || null,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createGpsLog(
  taskId: string,
  workerId: string,
  eventType: 'start' | 'end',
  latitude?: number,
  longitude?: number
): Promise<TaskGpsLog> {
  const { data, error } = await supabase
    .from('task_gps_logs')
    .insert({
      task_id: taskId,
      worker_id: workerId,
      event_type: eventType,
      latitude: latitude || null,
      longitude: longitude || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
