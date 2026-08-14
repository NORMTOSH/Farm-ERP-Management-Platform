# Farm ERP Platform — System Architecture Design

## 1. High-Level System Architecture

### 1.1 Architecture Overview
The platform follows a **cloud-native, multi-tenant SaaS architecture** with Supabase as the backend infrastructure. The system is designed for horizontal scalability, security, and offline-first mobile capability.

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web App     │  │ Mobile App   │  │  Future Integrations│ │
│  │  React/TS    │  │ Expo/RN      │  │  (IoT, GPS, etc)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼───────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Edge Layer                       │
│           (Static assets, caching, geo-routing)             │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Platform                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL │  │ Edge Funcs │  │ Realtime / Storage   │  │
│  │  (RLS)     │  │ (Deno TS)  │  │ Auth / Storage       │  │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬───────────┘  │
│        │               │                     │              │
│  ┌─────▼───────────────▼─────────────────────▼───────────┐  │
│  │                  PostgREST (auto-generated)            │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles
- **Multi-tenancy at database schema level**: Row-level security (RLS) isolates farm data.
- **Offline-first mobile**: Workers operate in low-connectivity rural environments.
- **Event-driven architecture**: All state changes emit events for notifications, audits, and integrations.
- **API-first**: Supabase REST + Edge Functions + Realtime subscriptions.
- **Scalable storage**: Supabase Storage with signed URLs for large media.
- **Extensible**: Modular design allows phasing features and future AI integration.

### 1.3 Core Abstractions
- **Organization (Farm)**: Top-level tenant container.
- **Profile**: Extends Supabase Auth user with role and farm linkage.
- **Module**: Functional domain (crops, livestock, finance, etc.).
- **Entity**: Business object within a module.
- **Workflow**: State machine for task lifecycle, approvals, etc.

---

## 2. Module Architecture

### 2.1 Module Dependency Graph
```
Farm Management
   ├── Crop Management
   ├── Livestock Management
   ├── Worker Management
   │     ├── Task Management & Verification
   │     ├── Attendance
   │     └── Payroll References
   ├── Equipment Management
   ├── Inventory Management
   │     └── Equipment (spare parts linkage)
   ├── Financial Management
   │     ├── Crop Sales
   │     ├── Livestock Sales
   │     └── Inventory Valuation
   └── Reporting & Analytics
         └── All modules
```

### 2.2 Module Interfaces
Each module exposes:
- **Entity CRUD**: Standardized create, read, update, delete (soft delete).
- **State Transitions**: For workflow-based entities (tasks, orders).
- **Reports**: Module-specific analytical endpoints.
- **Events**: Publishes domain events for other modules and notifications.

---

## 3. Database Architecture

### 3.1 Schema Strategy
- **Single Supabase project** with one database.
- **Shared schema** with `farm_id` as the tenancy discriminator.
- **RLS policies** enforce row isolation per farm.
- **Soft deletes** via `deleted_at` for auditability.
- **Timestamps**: `created_at`, `updated_at` on all tables.

### 3.2 Entity Relationship Diagram (Textual)

```
┌──────────────┐       ┌─────────────────┐
│   profiles   │──────<│  farm_members   │
│ (extends auth)│      │  (farm + role)  │
└──────┬───────┘       └─────────────────┘
       │ 1
       │
       │ *                     1
       │                       │
       ▼                       ▼
┌──────────────┐       ┌─────────────────┐
│   farms      │──────<│    tasks        │
│  (tenants)   │       │  (workflow)     │
└──────┬───────┘       └────────┬────────┘
       │                        │ *
       │                        │
       │ *                      │ *
       ▼                        ▼
┌──────────────┐       ┌─────────────────┐
│ farm_sections│       │  task_evidence  │
│  (plots,     │       │  (photos/docs)  │
│  fields, etc)│       └─────────────────┘
└──────┬───────┘
       │ *
       ▼
┌──────────────┐       ┌─────────────────┐
│    crops     │       │ task_verifications│
│ (records,    │       │ (approvals)     │
│  schedules)  │       └─────────────────┘
└──────────────┘

┌──────────────┐       ┌─────────────────┐
│ livestock    │       │   attendance    │
│ (animals,    │       │ (daily records) │
│  medical)    │       └─────────────────┘
└──────────────┘

┌──────────────┐       ┌─────────────────┐
│  equipment   │       │  inventory      │
│  (assets,    │──────<│  (stock,        │
│  service)    │       │   transfers)    │
└──────────────┘       └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  finance_journal │
                        │  (double-entry)  │
                        └─────────────────┘
```

### 3.3 Core Tables

#### Profiles & Auth
| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users with full_name, phone, avatar_url |
| `farm_members` | Links profiles to farms with role assignment |
| `farm_member_permissions` | Granular module permissions per member |

#### Farm Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `farms` | `id` (uuid) | `owner_id` → profiles.id | name, created_at |
| `farm_sections` | `id` (uuid) | `farm_id` → farms.id, `parent_id` → farm_sections.id | farm_id, type |
| `plots` | `id` (uuid) | `farm_section_id` → farm_sections.id | farm_section_id |
| `fields` | `id` (uuid) | `farm_section_id` → farm_sections.id | farm_section_id |
| `greenhouses` | `id` (uuid) | `farm_section_id` → farm_sections.id | farm_section_id |
| `livestock_zones` | `id` (uuid) | `farm_section_id` → farm_sections.id | farm_section_id |

#### Crop Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `crops` | `id` (uuid) | `farm_id` → farms.id | farm_id, name |
| `planting_records` | `id` (uuid) | `farm_id`, `crop_id`, `plot_id`, `worker_id` | farm_id, crop_id, planting_date |
| `irrigation_records` | `id` (uuid) | `planting_record_id`, `worker_id` | planting_record_id, recorded_at |
| `fertilizer_applications` | `id` (uuid) | `planting_record_id`, `inventory_item_id` | planting_record_id |
| `pesticide_applications` | `id` (uuid) | `planting_record_id`, `inventory_item_id` | planting_record_id |
| `harvest_records` | `id` (uuid) | `planting_record_id`, `worker_id` | planting_record_id, harvest_date |
| `crop_varieties` | `id` (uuid) | `crop_id` | crop_id |

#### Livestock Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `livestock_categories` | `id` (uuid) | `farm_id` | farm_id |
| `animals` | `id` (uuid) | `farm_id`, `category_id`, `zone_id` | farm_id, tag_number |
| `breeding_records` | `id` (uuid) | `animal_id`, `sire_id`, `dam_id` | animal_id |
| `vaccination_records` | `id` (uuid) | `animal_id` | animal_id, due_date |
| `medical_records` | `id` (uuid) | `animal_id` | animal_id, record_date |
| `milk_production_records` | `id` (uuid) | `animal_id`, `worker_id` | animal_id, production_date |
| `feed_consumption_records` | `id` (uuid) | `animal_id`, `inventory_item_id` | animal_id, recorded_at |
| `mortality_records` | `id` (uuid) | `animal_id` | animal_id |
| `livestock_sales` | `id` (uuid) | `animal_id`, `finance_transaction_id` | animal_id |

#### Worker Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `workers` | `id` (uuid) | `farm_id`, `profile_id` | farm_id, employee_id |
| `worker_shifts` | `id` (uuid) | `worker_id`, `farm_section_id` | worker_id |
| `payroll_entries` | `id` (uuid) | `worker_id`, `finance_transaction_id` | worker_id, period_start |

#### Task Management & Verification
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `tasks` | `id` (uuid) | `farm_id`, `created_by`, `assigned_to` | farm_id, status, assigned_to |
| `task_assignments` | `id` (uuid) | `task_id`, `worker_id` | task_id |
| `task_evidence` | `id` (uuid) | `task_id`, `worker_id`, `storage_path` | task_id |
| `task_verifications` | `id` (uuid) | `task_id`, `verifier_id` | task_id |
| `task_audit_log` | `id` (uuid) | `task_id`, `user_id` | task_id, created_at |
| `task_gps_logs` | `id` (uuid) | `task_id`, `worker_id` | task_id |

#### Equipment Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `equipment` | `id` (uuid) | `farm_id` | farm_id, serial_number |
| `equipment_service_schedules` | `id` (uuid) | `equipment_id` | equipment_id, due_date |
| `fuel_logs` | `id` (uuid) | `equipment_id`, `worker_id` | equipment_id |
| `repair_history` | `id` (uuid) | `equipment_id`, `worker_id` | equipment_id |

#### Inventory Management
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `inventory_items` | `id` (uuid) | `farm_id` | farm_id, name |
| `inventory_categories` | `id` (uuid) | `farm_id` | farm_id |
| `warehouses` | `id` (uuid) | `farm_id`, `farm_section_id` | farm_id |
| `stock_levels` | `id` (uuid) | `inventory_item_id`, `warehouse_id` | inventory_item_id, warehouse_id |
| `stock_transfers` | `id` (uuid) | `item_id`, `from_warehouse_id`, `to_warehouse_id` | item_id, transfer_date |
| `purchase_orders` | `id` (uuid) | `farm_id`, `supplier_id` | farm_id |
| `purchase_order_items` | `id` (uuid) | `purchase_order_id`, `inventory_item_id` | purchase_order_id |

#### Financial Management (Double-Entry)
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `finance_accounts` | `id` (uuid) | `farm_id` | farm_id, code, type |
| `finance_journal_entries` | `id` (uuid) | `farm_id`, `created_by` | farm_id, entry_date |
| `finance_journal_lines` | `id` (uuid) | `journal_entry_id`, `account_id` | journal_entry_id, account_id |
| `finance_transactions` | `id` (uuid) | `farm_id`, `account_id` | farm_id, transaction_date |
| `finance_categories` | `id` (uuid) | `farm_id`, `type` (income/expense) | farm_id, type |

#### Notifications
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `notifications` | `id` (uuid) | `farm_id`, `user_id` | user_id, read, created_at |
| `notification_templates` | `id` (uuid) | | event_type |

#### Audit Logging
| Table | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| `audit_logs` | `id` (uuid) | `farm_id`, `user_id` | farm_id, entity_type, entity_id, created_at |
| `audit_log_metadata` | `id` (uuid) | `audit_log_id` | audit_log_id |

### 3.4 Indexing Strategy
- **B-tree indexes** on foreign keys and frequently filtered columns (`farm_id`, `status`, `date` columns).
- **Composite indexes** for common query patterns (e.g., `(farm_id, status, created_at)` on tasks).
- **Partial indexes** for soft-deleted records: `CREATE INDEX ON tasks (farm_id) WHERE deleted_at IS NULL;`
- **GIN indexes** on JSONB columns (metadata, audit payloads).

### 3.5 Row-Level Security (RLS)
Every table has `farm_id`. Policies enforce:
```sql
CREATE POLICY farm_isolation ON tasks
  FOR ALL
  USING (
    farm_id IN (
      SELECT farm_id FROM farm_members
      WHERE profile_id = auth.uid()
    )
  );
```
- **SELECT**: Member can read farm data.
- **INSERT**: Member can create within farm.
- **UPDATE/DELETE**: Restricted by role (owners/managers can modify; workers limited).

### 3.6 Partitioning Strategy (Future Scale)
When `task_audit_log` exceeds 10M rows:
- Range partition by `created_at` (monthly).
- Archive partitions to cold storage.

---

## 4. Entity Relationship Design

### 4.1 Farm Entity
```
Farm
 ├── Sections (Plots, Fields, Greenhouses, Livestock Zones)
 │    └── Linked to: Crops, Livestock, Tasks, Inventory
 ├── Members (Owners, Managers, Workers, Accountants)
 ├── Crops & Planting Records
 ├── Livestock & Health Records
 ├── Tasks & Verifications
 ├── Equipment
 ├── Inventory & Warehouses
 ├── Financial Accounts & Journal
 ├── Notifications
 └── Audit Logs
```

### 4.2 Task Entity
```
Task
 ├── Assignments (1:N workers/teams)
 ├── Evidence (photos, videos, documents)
 ├── GPS Logs (start/end locations)
 ├── Verifications (approval/rejection history)
 ├── Audit Log (state transitions)
 └── Linked to: Farm Section, Crop, Livestock, Equipment
```

### 4.3 Financial Entity (Double-Entry)
```
FinanceAccount (Chart of Accounts)
 ├── JournalEntry
 │    └── JournalLines (debits + credits, must balance)
 ├── Transactions (categorized income/expense)
 └── Linked to: Crops, Livestock, Tasks, Equipment, Inventory
```

---

## 5. User Role Matrix

| Permission Area | Super Admin | Farm Owner | Farm Manager | Farm Worker | Accountant |
|-----------------|-------------|------------|--------------|-------------|------------|
| Manage platform | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create/Edit farm | ✅ | Owner only | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage roles/permissions | ✅ | ✅ | ❌ | ❌ | ❌ |
| View financials | ✅ | ✅ | Read-only | ❌ | ✅ |
| Manage inventory | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage crops | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage livestock | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage equipment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Verify tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Execute tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| Upload evidence | ✅ | ✅ | ✅ | ✅ | ❌ |
| View attendance | ✅ | ✅ | ✅ | Own only | ❌ |
| Manage payroll | ✅ | ✅ | ❌ | ❌ | ✅ |
| View reports | ✅ | ✅ | ✅ | Summary | Financial only |
| System analytics | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit logs | ✅ | ✅ | ✅ | ❌ | ❌ |

### 5.1 Role Implementation
- Stored in `farm_members.role` as enum: `owner`, `manager`, `worker`, `accountant`, `super_admin`.
- Fine-grained permissions in `farm_member_permissions` (module + action).
- Middleware / Edge Functions validate roles before operations.
- Supabase RLS uses role checks for row-level restrictions.

---

## 6. API Architecture

### 6.1 API Layers
1. **Supabase REST (PostgREST)**: Auto-generated CRUD for all tables.
2. **Supabase Edge Functions**: Business logic, workflows, integrations, webhooks.
3. **Realtime**: Live task updates, notifications, GPS tracking.
4. **Supabase Storage**: Signed URLs for photos, videos, documents.

### 6.2 REST Endpoint Conventions
```
Base URL: https://<project>.supabase.co/rest/v1
```

**Farm Management**
- `GET /farms` — List user's farms
- `POST /farms` — Create farm
- `GET /farms/{id}/sections` — List sections
- `POST /farms/{id}/sections` — Create section

**Crop Management**
- `GET /crops?farm_id=eq.{id}`
- `POST /planting_records`
- `GET /planting_records/{id}/harvest_records`

**Livestock Management**
- `GET /animals?farm_id=eq.{id}`
- `POST /medical_records`
- `GET /animals/{id}/vaccination_records`

**Task Management**
- `GET /tasks?status=eq.assigned&farm_id=eq.{id}`
- `POST /tasks` — Create task
- `POST /task_evidence` — Upload evidence
- `POST /tasks/{id}/verify` — Approve/Reject
- `PATCH /tasks/{id}` — Update status (state machine)

**Equipment Management**
- `GET /equipment`
- `POST /fuel_logs`
- `GET /equipment/{id}/service_schedules`

**Inventory Management**
- `GET /inventory_items`
- `POST /stock_transfers`
- `GET /warehouses/{id}/stock_levels`

**Financial Management**
- `GET /finance_journal_entries`
- `POST /finance_journal_lines`
- `GET /finance_transactions`

**Notifications**
- `GET /notifications?read=eq.false`
- `PATCH /notifications/{id}` — Mark as read

### 6.3 Edge Functions
| Function | Purpose |
|----------|---------|
| `create-task` | Validate input, create task + audit log + notifications |
| `verify-task` | Approve/reject task, update state, emit events |
| `process-payroll` | Calculate wages, generate journal entries |
| `generate-reports` | Aggregation queries for dashboards |
| `send-notifications` | Dispatch SMS/Email/WhatsApp via integrations |
| `upload-evidence` | Handle signed URL generation for Storage |
| `sync-offline` | Mobile app batch sync endpoint |

### 6.4 Realtime Subscriptions
- `tasks` — Workers receive live task updates.
- `notifications` — Real-time notification delivery.
- `task_verifications` — Managers see submissions instantly.
- `inventory_stock_levels` — Low stock alerts.

### 6.5 Storage Strategy
- Bucket: `task-evidence` (photos, videos)
- Bucket: `farm-documents` (PDFs, reports)
- Path: `{farm_id}/{entity_type}/{entity_id}/{uuid}.{ext}`
- Signed URLs with 1-hour expiry.
- RLS restricts access to farm members only.

---

## 7. Security Architecture

### 7.1 Authentication
- **Supabase Auth** with email/password.
- Phone auth (OTP) for worker onboarding.
- Social login (Google) deferred to Phase 2.
- Session management via JWT (refresh tokens).
- Password reset via email.

### 7.2 Authorization Model
```
Request
   → Supabase Auth validates JWT
   → RLS checks farm membership
   → Edge Function checks role permissions
   → Business logic validates action
   → Response
```

### 7.3 Permission Matrix (Granular)
Each role has permissions per module:
```json
{
  "manager": {
    "tasks": ["create", "read", "update", "verify"],
    "crops": ["read", "update"],
    "livestock": ["read", "update"],
    "inventory": ["read", "update"],
    "finance": ["read"],
    "workers": ["read"]
  },
  "worker": {
    "tasks": ["read", "update_own"],
    "attendance": ["read_own", "create_own"],
    "notifications": ["read_own"]
  }
}
```

### 7.4 Audit Logging
- Immutable `audit_logs` table (no UPDATE/DELETE allowed).
- Logs: user_id, farm_id, entity_type, entity_id, action, old_values, new_values, ip_address, user_agent.
- Triggered by database triggers or application code.
- Retention: 7 years for financial entries, 3 years for operational.

### 7.5 Data Protection
- Encryption at rest (Supabase default).
- TLS in transit.
- Secrets stored in Supabase Vault / environment variables.
- Input validation on all Edge Functions.
- Rate limiting via Supabase or Cloudflare.

---

## 8. Mobile Architecture

### 8.1 Tech Stack
- **React Native + Expo** for cross-platform iOS/Android.
- **Expo Router** for file-based navigation.
- **TanStack Query** for server state.
- **Supabase JS client** for auth and data.
- **Expo Image Picker / Camera** for evidence upload.
- **Expo Location** for GPS verification.
- **Expo Notifications** for push notifications.
- **NetInfo** for offline detection.

### 8.2 Screens & Navigation
```
App
 ├── (auth)
 │    ├── Login
 │    └── Onboarding
 └── (app)
      ├── (tabs)
      │    ├── Dashboard
      │    ├── Tasks
      │    ├── Attendance
      │    └── Profile
      ├── Tasks
      │    ├── TaskList
      │    ├── TaskDetail
      │    └── TaskEvidenceUpload
      └── Profile
           ├── EditProfile
           └── Settings
```

### 8.3 Offline-First Strategy
- **Local persistence**: AsyncStorage or MMKV for cached tasks and forms.
- **Queue-based sync**: Actions stored locally when offline, synced on reconnect.
- **Conflict resolution**: Last-write-wins with server timestamp; manual merge for critical data.
- **Optimistic UI**: Immediate local updates, background sync.

### 8.4 Mobile-Specific Features
- **GPS verification**: Capture coordinates on task start/end.
- **Camera/Media**: Compress images before upload to conserve bandwidth.
- **Push notifications**: Task assignments, reminders.
- **Biometric auth**: Optional fingerprint/Face ID for login.

---

## 9. Scalability Architecture

### 9.1 Target Scale
- 100 farms
- 10,000 workers
- 5M task records
- 10M audit log entries
- 50TB media storage

### 9.2 Database Scaling
- **Connection pooling**: Supabase PgBouncer handles connection limits.
- **Read replicas**: Supabase read replicas for reporting queries (deferred).
- **Index tuning**: Regular ANALYZE and index optimization.
- **Query optimization**: Avoid N+1, use proper joins, paginate.

### 9.3 Caching Strategy
- **Edge caching**: Static assets and public APIs via CDN.
- **Supabase Realtime**: Pushes updates instead of polling.
- **Application cache**: TanStack Query caches API responses (5-minute stale time).
- **Redis (future)**: Session store and rate limiting.

### 9.4 Storage Scaling
- **Supabase Storage** with lifecycle policies.
- **CDN** for media delivery.
- **Image optimization**: Thumbnail generation on upload via Edge Function.

### 9.5 Compute Scaling
- **Supabase Edge Functions**: Auto-scaling serverless.
- **Background jobs**: Supabase pg_cron for scheduled reports and reminders.
- **Queue-based processing**: Future: dedicated job queue for bulk operations.

---

## 10. Notification System Architecture

### 10.1 Notification Types
- **In-app**: `notifications` table, realtime push.
- **Email**: Via Supabase / SendGrid / Resend.
- **SMS**: Via Twilio / Africa's Talking (M-Pesa region).
- **WhatsApp**: Via Twilio / WhatsApp Business API.

### 10.2 Event-Driven Design
All modules emit events:
```typescript
type AppEvent =
  | { type: 'task.assigned'; taskId: string; workerId: string }
  | { type: 'task.approved'; taskId: string }
  | { type: 'task.rejected'; taskId: string; reason: string }
  | { type: 'inventory.low_stock'; itemId: string }
  | { type: 'livestock.vaccination_due'; animalId: string }
  | { type: 'equipment.service_due'; equipmentId: string };
```

Edge Function `send-notifications` listens to events and dispatches:
- In-app: INSERT into `notifications` + Realtime broadcast.
- SMS/Email/WhatsApp: Call external APIs.

### 10.3 Notification Templates
Stored in `notification_templates`:
- Subject, body (text + variables), channel preferences.
- User preferences: opt-in/out per channel.

---

## 11. AI Roadmap (Future Phase)

### 11.1 Extensible Architecture
- **ML feature store**: Tables for computed features (soil data, weather history, yield history).
- **Prediction endpoints**: Edge Functions wrap AI models.
- **Model registry**: Track model versions and training data.

### 11.2 Planned AI Modules
| Module | Input | Output | Integration Point |
|--------|-------|--------|-------------------|
| Crop Disease Detection | Photos from task evidence | Disease classification + treatment | Task Evidence + Crops |
| Yield Forecasting | Historical yield, weather, soil | Predicted yield per crop/plot | Crops + Weather API |
| Livestock Health Prediction | Medical records, milk production | Health risk score | Livestock + Medical Records |
| Expense Forecasting | Historical expenses, season | Budget predictions | Finance + Crops |
| AI Farm Assistant | Chat interface | Recommendations, alerts | All modules |

### 11.3 Implementation Notes
- Host models on separate AI service (Supabase Edge Function or external API).
- Use OpenAI-compatible API for LLM features (chat assistant).
- Image models via dedicated inference endpoints.
- Feature pipeline scheduled via pg_cron or external ETL.

---

## 12. Development Phases

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Auth, farm setup, worker management, task management.

Deliverables:
- Supabase project setup + RLS policies.
- Auth (email/password).
- Farm + member management.
- Worker profiles.
- Task CRUD + assignment.
- Basic web dashboard (farm list, task list).

### Phase 2: Core Operations (Weeks 5-8)
**Goal**: Crops, livestock, inventory, equipment.

Deliverables:
- Crop planting records + harvest.
- Livestock registration + medical records.
- Inventory CRUD + stock transfers.
- Equipment registry + service scheduling.
- Web UI for all modules.

### Phase 3: Verification & Mobile (Weeks 9-12)
**Goal**: Task verification workflow + worker mobile app.

Deliverables:
- Task evidence upload (photos).
- GPS verification.
- Approval/rejection workflow + audit trail.
- React Native worker app (tasks, attendance, evidence upload).
- Real-time notifications (in-app).

### Phase 4: Finance & Reporting (Weeks 13-16)
**Goal**: Accounting, financial reports, analytics dashboard.

Deliverables:
- Double-entry journal system.
- Income/expense recording.
- P&L, Balance Sheet, Cash Flow reports.
- Executive dashboard with KPIs.
- Export to CSV/PDF.

### Phase 5: Notifications & Integrations (Weeks 17-20)
**Goal**: SMS, email, WhatsApp notifications.

Deliverables:
- Notification templates + preferences.
- SMS gateway integration.
- Email integration.
- WhatsApp integration.
- Event-driven dispatch.

### Phase 6: Scale & Polish (Weeks 21-24)
**Goal**: Performance, security audit, production readiness.

Deliverables:
- Performance testing + optimization.
- Security audit (RLS, input validation).
- Load testing (10K workers simulation).
- CI/CD pipeline.
- Documentation.
- Beta launch.

---

## 13. Recommended Implementation Order

1. **Database + RLS** — Foundation for everything.
2. **Auth + Profiles** — Identity layer.
3. **Farm + Member Management** — Tenancy model.
4. **Task Management** — Mission-critical workflow.
5. **Worker Management** — Link workers to tasks.
6. **Crop + Livestock** — Core farm operations.
7. **Inventory + Equipment** — Asset tracking.
8. **Finance** — Accounting engine.
9. **Reporting** — Analytics layer.
10. **Mobile App** — Worker portal.
11. **Notifications** — Communication layer.
12. **Integrations** — SMS, email, WhatsApp.
13. **AI Features** — Post-launch enhancements.

---

## 14. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Uptime | 99.5% (Supabase SLA) |
| Response time | P95 < 300ms for API, P95 < 1s for page load |
| Data retention | 7 years financial, 3 years operational |
| Backup | Supabase automated daily backups |
| Disaster recovery | Point-in-time recovery (7 days) |
| Compliance | GDPR-ready (data export, deletion) |
| Accessibility | WCAG 2.1 AA for web app |

---

## 15. Risk Register

| Risk | Mitigation |
|------|-----------|
| Rural connectivity | Offline-first mobile, sync queues |
| Data volume growth | Partitioning, archiving, read replicas |
| Security breach | RLS, audit logs, input validation, rate limiting |
| Vendor lock-in (Supabase) | Use standard PostgreSQL, portable Edge Functions |
| Worker adoption | Simple mobile UI, minimal training |
| Financial accuracy | Double-entry, immutable audit trail, reconciliation |

---

*Document Version: 1.0*
*Last Updated: 2026-08-14*
