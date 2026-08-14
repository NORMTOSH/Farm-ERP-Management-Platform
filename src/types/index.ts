export type Farm = {
  id: string
  name: string
  description: string | null
  location: string | null
  owner_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type FarmMember = {
  id: string
  farm_id: string
  profile_id: string
  role: 'owner' | 'manager' | 'worker' | 'accountant' | 'super_admin'
  created_at: string
  updated_at: string
}

export type Worker = {
  id: string
  farm_id: string
  profile_id: string | null
  employee_id: string
  full_name: string
  phone: string | null
  position: string | null
  hire_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Task = {
  id: string
  farm_id: string
  title: string
  description: string | null
  status: 'assigned' | 'in_progress' | 'submitted' | 'verified' | 'rejected' | 'resubmitted'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_by: string
  farm_section_id: string | null
  crop_id: string | null
  livestock_id: string | null
  equipment_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type TaskAssignment = {
  id: string
  task_id: string
  worker_id: string
  assigned_at: string
}

export type TaskEvidence = {
  id: string
  task_id: string
  worker_id: string
  evidence_type: 'photo' | 'video' | 'document' | 'note'
  storage_path: string | null
  note: string | null
  created_at: string
}

export type TaskVerification = {
  id: string
  task_id: string
  verifier_id: string
  action: 'approve' | 'reject'
  comment: string | null
  created_at: string
}

export type TaskAuditLog = {
  id: string
  task_id: string
  user_id: string
  action: string
  old_status: string | null
  new_status: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type TaskGpsLog = {
  id: string
  task_id: string
  worker_id: string
  event_type: 'start' | 'end'
  latitude: number | null
  longitude: number | null
  timestamp: string
}
