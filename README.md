# Farm ERP Platform

A cloud-based Farm Management Platform for commercial farms.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth)
- **Mobile**: React Native / Expo (future)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase project URL and anon key.

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  components/
    ui/           - Reusable UI components (shadcn/ui style)
    layout/       - Layout components (sidebar, navbar)
    auth/         - Authentication components
    farm/         - Farm management components
    workers/      - Worker management components
    tasks/        - Task management components
  lib/
    supabase.ts   - Supabase client configuration
    utils.ts      - Utility functions
  hooks/
    useAuth.ts    - Authentication hook
  pages/
    Login.tsx     - Login page
    Dashboard.tsx - Dashboard page
    Farms.tsx     - Farms list page
    Workers.tsx   - Workers list page
    Tasks.tsx     - Tasks list page
    TaskDetail.tsx - Task detail page
  types/
    index.ts      - TypeScript type definitions
  App.tsx         - Main app component with routing
  main.tsx        - Entry point
```

## License

MIT
