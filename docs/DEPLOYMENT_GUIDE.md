# Deployment Guide

## Local Install

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Supabase

1. Create a Supabase project.
2. Copy project URL and anon key into `.env.local`.
3. Keep the service role key server-only.
4. Run migrations in order from `supabase/migrations`.
5. Run seed data from `supabase/seed.sql`.
6. Confirm RLS is enabled on all tenant tables.

## Vercel

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set root directory to `apps/web` if deploying the app package directly.
4. Add environment variables.
5. Deploy.

## Test Checklist

- Sign in works.
- Farmstead organization is visible only to authorized users.
- Four properties render.
- Bookings render.
- iCal feeds render.
- Tasks can be filtered.
- Reviews show draft response state.
- Brain entries separate guest-visible and private knowledge.
- Locked strategic modules cannot trigger live workflows.
- Mobile layout remains usable.

