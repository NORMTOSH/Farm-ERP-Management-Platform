# Farm ERP Platform - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account

## 1. Clone and Install

```bash
# Clone the repository (if applicable)
cd farm-erp-platform

# Install dependencies
npm install
```

## 2. Supabase Setup

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Run the setup script
./scripts/setup-supabase.sh
```

### Option B: Manual Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Update `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Run migrations:
   ```bash
   npx supabase db push
   ```

## 3. Seed Database (Optional)

To populate the database with sample data:

```bash
npx tsx scripts/seed.ts
```

This creates:
- A demo farm owner account
- A sample farm
- 3 workers
- 3 sample tasks

## 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 5. Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:push` | Push migrations to Supabase |
| `npm run db:reset` | Reset local database |

## 6. Project Structure

```
src/
  components/
    ui/           - Reusable UI components
    layout/       - Layout components
    farm/         - Farm management components
    workers/      - Worker management components
    tasks/        - Task management components
  lib/
    supabase.ts   - Supabase client
    utils.ts      - Utility functions
  hooks/
    useAuth.ts    - Authentication hook
  pages/          - Page components
  services/       - API service layer
  types/          - TypeScript types
```

## 7. Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 8. Supabase Studio

To view your database in Supabase Studio:

```bash
supabase studio
```

## Troubleshooting

### "Module not found" errors
Make sure you ran `npm install` successfully.

### Supabase connection errors
Verify your `.env` file has the correct URL and anon key.

### RLS policy errors
Make sure you ran `supabase db push` to apply migrations.

## Next Steps

- Explore the code in `src/pages/` and `src/components/`
- Check `ARCHITECTURE.md` for the full system design
- Review `scripts/seed.ts` to understand the data model
