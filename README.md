# Ride The Bus

The classic drinking card game, free in your browser — [ridethebus.party](https://ridethebus.party)

## What it is

Single-player card game where you survive four rounds of guesses: **Red or Black → Higher or Lower → Inside or Outside → Suit**. Get one wrong and you ride the bus (drink and start over).

Also includes:
- **Party Bus** — multiplayer room-based mode where everyone plays together
- **Beerdle** — daily Wordle-style beer guessing game
- **Stats** — track your win rate, streaks, and game history
- **Profiles** — user accounts with optional premium card backs

## Stack

- **React 18.3 + TypeScript** — frontend
- **Vite 7 + TanStack Start v1** — SSR, file-based routing
- **TanStack Router v1 + TanStack Query v5** — routing and data fetching
- **Tailwind CSS v4** — styling (tokens in `src/index.css`, no config file)
- **Supabase** — auth, database, realtime (Party Bus), edge functions (Stripe checkout)
- **Netlify** — deployment via `@netlify/vite-plugin-tanstack-start`

## Dev setup

```bash
nvm use 22          # Node 22.12+ required
npm install
cp .env.example .env  # fill in Supabase credentials
npm run dev         # http://localhost:5173
```

## Commands

```bash
npm run dev          # dev server with HMR
npx tsc --noEmit     # type-check (run before committing)
npm run lint         # ESLint
npm run start        # production SSR server
```

## Project structure

```
src/
  routes/       # TanStack Router file-based routes
  pages/        # page components (imported by routes)
  components/   # reusable components (Game, ui/)
  api/          # Supabase data-fetching helpers
  contexts/     # AuthContext
  lib/          # queryClient, queryKeys
  utils/        # supabase singleton, misc utils
  types/
  index.css     # global styles + Tailwind @theme tokens
supabase/
  functions/    # edge functions (Stripe checkout, etc.)
  migrations/   # database migrations
```

## Deploy

```bash
netlify deploy --prod
```

Builds via `vite build`, outputs to `dist/client`. The Netlify SSR function handles all routing.
