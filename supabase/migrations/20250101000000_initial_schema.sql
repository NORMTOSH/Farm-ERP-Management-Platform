-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type public.user_role as enum ('owner', 'manager', 'worker', 'accountant', 'super_admin');
create type public.task_status as enum ('assigned', 'in_progress', 'submitted', 'verified', 'rejected', 'resubmitted');
create type public.task_priority as enum ('low', 'medium', 'high');
create type public.evidence_type as enum ('photo', 'video', 'document', 'note');
create type public.verification_action as enum ('approve', 'reject');
create type public.gps_event_type as enum ('start', 'end');
create type public.section_type as enum ('plot', 'field', 'greenhouse', 'livestock_zone', 'warehouse');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Farms table
create table public.farms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Farm members table
create table public.farm_members (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role public.user_role not null default 'worker',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(farm_id, profile_id)
);

-- Farm sections (plots, fields, greenhouses, zones)
create table public.farm_sections (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  parent_id uuid references public.farm_sections(id) on delete cascade,
  name text not null,
  type public.section_type not null,
  area_acres numeric,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Workers table
create table public.workers (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  employee_id text not null,
  full_name text not null,
  phone text,
  position text,
  hire_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz,
  unique(farm_id, employee_id)
);

-- Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  title text not null,
  description text,
  status public.task_status not null default 'assigned',
  priority public.task_priority not null default 'medium',
  due_date timestamptz,
  created_by uuid references public.profiles(id) not null,
  farm_section_id uuid references public.farm_sections(id) on delete set null,
  crop_id uuid,
  livestock_id uuid,
  equipment_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Task assignments table
create table public.task_assignments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete cascade not null,
  assigned_at timestamptz default now() not null,
  unique(task_id, worker_id)
);

-- Task evidence table
create table public.task_evidence (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete cascade not null,
  evidence_type public.evidence_type not null,
  storage_path text,
  note text,
  created_at timestamptz default now() not null
);

-- Task verifications table
create table public.task_verifications (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  verifier_id uuid references public.profiles(id) not null,
  action public.verification_action not null,
  comment text,
  created_at timestamptz default now() not null
);

-- Task audit log table
create table public.task_audit_log (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  action text not null,
  old_status public.task_status,
  new_status public.task_status,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Task GPS logs table
create table public.task_gps_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete cascade not null,
  event_type public.gps_event_type not null,
  latitude numeric,
  longitude numeric,
  timestamp timestamptz default now() not null
);

-- Indexes
create index idx_farms_owner_id on public.farms(owner_id);
create index idx_farms_deleted_at on public.farms(deleted_at) where deleted_at is null;
create index idx_farm_members_farm_id on public.farm_members(farm_id);
create index idx_farm_members_profile_id on public.farm_members(profile_id);
create index idx_farm_sections_farm_id on public.farm_sections(farm_id) where deleted_at is null;
create index idx_workers_farm_id on public.workers(farm_id) where deleted_at is null;
create index idx_tasks_farm_id on public.tasks(farm_id, status, created_at) where deleted_at is null;
create index idx_tasks_assigned_to on public.tasks(farm_id, status) where deleted_at is null;
create index idx_task_assignments_task_id on public.task_assignments(task_id);
create index idx_task_assignments_worker_id on public.task_assignments(worker_id);
create index idx_task_evidence_task_id on public.task_evidence(task_id);
create index idx_task_verifications_task_id on public.task_verifications(task_id);
create index idx_task_audit_log_task_id on public.task_audit_log(task_id, created_at);
create index idx_task_gps_logs_task_id on public.task_gps_logs(task_id);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_members enable row level security;
alter table public.farm_sections enable row level security;
alter table public.workers enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_evidence enable row level security;
alter table public.task_verifications enable row level security;
alter table public.task_audit_log enable row level security;
alter table public.task_gps_logs enable row level security;

-- Profiles policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Farms policies
create policy "Farm members can view farms" on public.farms
  for select using (
    id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
    )
    and deleted_at is null
  );

create policy "Farm owners can create farms" on public.farms
  for insert with check (
    owner_id = auth.uid()
  );

create policy "Farm owners can update farms" on public.farms
  for update using (
    owner_id = auth.uid()
  );

-- Farm members policies
create policy "Farm members can view members" on public.farm_members
  for select using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
    )
  );

create policy "Farm owners can manage members" on public.farm_members
  for all using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid() and role = 'owner'
    )
  );

-- Farm sections policies
create policy "Farm members can view sections" on public.farm_sections
  for select using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
    )
    and deleted_at is null
  );

create policy "Farm managers can manage sections" on public.farm_sections
  for all using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

-- Workers policies
create policy "Farm members can view workers" on public.workers
  for select using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
    )
    and deleted_at is null
  );

create policy "Farm managers can manage workers" on public.workers
  for all using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

-- Tasks policies
create policy "Farm members can view tasks" on public.tasks
  for select using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
    )
    and deleted_at is null
  );

create policy "Farm managers can create tasks" on public.tasks
  for insert with check (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
      and role in ('owner', 'manager')
    )
    and created_by = auth.uid()
  );

create policy "Farm managers can update tasks" on public.tasks
  for update using (
    farm_id in (
      select farm_id from public.farm_members
      where profile_id = auth.uid()
      and role in ('owner', 'manager')
    )
  );

-- Task assignments policies
create policy "Farm members can view task assignments" on public.task_assignments
  for select using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

create policy "Farm managers can manage task assignments" on public.task_assignments
  for all using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
        and role in ('owner', 'manager')
      )
    )
  );

-- Task evidence policies
create policy "Farm members can view task evidence" on public.task_evidence
  for select using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

create policy "Workers can upload evidence" on public.task_evidence
  for insert with check (
    worker_id in (
      select id from public.workers
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

-- Task verifications policies
create policy "Farm members can view verifications" on public.task_verifications
  for select using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

create policy "Farm managers can verify tasks" on public.task_verifications
  for insert with check (
    verifier_id = auth.uid()
    and task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
        and role in ('owner', 'manager')
      )
    )
  );

-- Task audit log policies
create policy "Farm members can view audit logs" on public.task_audit_log
  for select using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

create policy "System can insert audit logs" on public.task_audit_log
  for insert with check (true);

-- Task GPS logs policies
create policy "Farm members can view GPS logs" on public.task_gps_logs
  for select using (
    task_id in (
      select id from public.tasks
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

create policy "Workers can create GPS logs" on public.task_gps_logs
  for insert with check (
    worker_id in (
      select id from public.workers
      where farm_id in (
        select farm_id from public.farm_members
        where profile_id = auth.uid()
      )
    )
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_farms_updated_at before update on public.farms
  for each row execute procedure public.update_updated_at_column();

create trigger update_farm_members_updated_at before update on public.farm_members
  for each row execute procedure public.update_updated_at_column();

create trigger update_farm_sections_updated_at before update on public.farm_sections
  for each row execute procedure public.update_updated_at_column();

create trigger update_workers_updated_at before update on public.workers
  for each row execute procedure public.update_updated_at_column();

create trigger update_tasks_updated_at before update on public.tasks
  for each row execute procedure public.update_updated_at_column();
