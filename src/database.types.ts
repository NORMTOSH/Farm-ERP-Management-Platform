export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          owner_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      farm_members: {
        Row: {
          id: string
          farm_id: string
          profile_id: string
          role: 'owner' | 'manager' | 'worker' | 'accountant' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          profile_id: string
          role: 'owner' | 'manager' | 'worker' | 'accountant' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          profile_id?: string
          role?: 'owner' | 'manager' | 'worker' | 'accountant' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
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
        Insert: {
          id?: string
          farm_id: string
          profile_id?: string | null
          employee_id: string
          full_name: string
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          farm_id?: string
          profile_id?: string | null
          employee_id?: string
          full_name?: string
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tasks: {
        Row: {
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
        Insert: {
          id?: string
          farm_id: string
          title: string
          description?: string | null
          status?: 'assigned' | 'in_progress' | 'submitted' | 'verified' | 'rejected' | 'resubmitted'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_by: string
          farm_section_id?: string | null
          crop_id?: string | null
          livestock_id?: string | null
          equipment_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          farm_id?: string
          title?: string
          description?: string | null
          status?: 'assigned' | 'in_progress' | 'submitted' | 'verified' | 'rejected' | 'resubmitted'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_by?: string
          farm_section_id?: string | null
          crop_id?: string | null
          livestock_id?: string | null
          equipment_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      task_assignments: {
        Row: {
          id: string
          task_id: string
          worker_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          task_id: string
          worker_id: string
          assigned_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          worker_id?: string
          assigned_at?: string
        }
      }
      task_evidence: {
        Row: {
          id: string
          task_id: string
          worker_id: string
          evidence_type: 'photo' | 'video' | 'document' | 'note'
          storage_path: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          worker_id: string
          evidence_type: 'photo' | 'video' | 'document' | 'note'
          storage_path?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          worker_id?: string
          evidence_type?: 'photo' | 'video' | 'document' | 'note'
          storage_path?: string | null
          note?: string | null
          created_at?: string
        }
      }
      task_verifications: {
        Row: {
          id: string
          task_id: string
          verifier_id: string
          action: 'approve' | 'reject'
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          verifier_id: string
          action: 'approve' | 'reject'
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          verifier_id?: string
          action?: 'approve' | 'reject'
          comment?: string | null
          created_at?: string
        }
      }
      task_audit_log: {
        Row: {
          id: string
          task_id: string
          user_id: string
          action: string
          old_status: string | null
          new_status: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          action: string
          old_status?: string | null
          new_status?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          action?: string
          old_status?: string | null
          new_status?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      task_gps_logs: {
        Row: {
          id: string
          task_id: string
          worker_id: string
          event_type: 'start' | 'end'
          latitude: number | null
          longitude: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          task_id: string
          worker_id: string
          event_type: 'start' | 'end'
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          task_id?: string
          worker_id?: string
          event_type?: 'start' | 'end'
          latitude?: number | null
          longitude?: number | null
          timestamp?: string
        }
      }
    }
  }
}
