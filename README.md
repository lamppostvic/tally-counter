# Tally

Ultimate frisbee stat tally. Next.js 16 + Supabase (auth + Postgres), deployed on Vercel.

## Setup

1. **Database** — in Supabase → SQL Editor, run `supabase/migrations/20261015000000_init.sql`.
   Creates `categories` (seeded with 8), `games`, `categories_tally`, RLS, a trigger that adds
   zeroed tally rows for every new game, and an `increment_tally` function for atomic +/-.
2. **Env** — copy `.env.example` to `.env.local` and fill in your project URL and publishable key
   (Supabase → Project Settings → API Keys).
3. **Auth** — Supabase → Authentication → URL Configuration: set Site URL to your Vercel URL and
   add `http://localhost:3000/**` and `https://<your-app>.vercel.app/**` to Redirect URLs.
   (Or turn off "Confirm email" under Auth → Providers → Email to skip confirmation.)
4. `npm install && npm run dev`

## Deploy

Push to GitHub, import into Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, deploy.

## Structure

- `src/proxy.ts` — refreshes the Supabase session and redirects signed-out users to `/login`
- `src/app/page.tsx` — create game + game list
- `src/app/games/[id]/page.tsx` — tally board for a game
- `src/components/tally-board.tsx` — +/- buttons, optimistic updates via `increment_tally` RPC
