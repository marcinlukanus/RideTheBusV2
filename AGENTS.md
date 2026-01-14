# Project Agent Notes

Tailwind CSS rules live closer to the UI code at `src/components/AGENTS.md`.

## Initial Observations (2025-01-29)

- Vite + React 18 + TypeScript app (`vite.config.ts`, `src/main.tsx`), with React Router v7 and `react-helmet-async` for document head.
- Tailwind is integrated via `@import 'tailwindcss';` in `src/index.css`, with custom `@theme` breakpoints and color tokens defined.
- Tailwind dependency is now `v4.1+` via `tailwindcss` and `@tailwindcss/vite` in `package.json`.
- App routing is nested under `Layout` and includes pages like `PartyBus`, `Beerdle`, `Stats`, `Profile`, `Login`, and `SignUp`.
- Supabase is used (`src/utils/supabase.ts`, `src/types/database.types.ts`, and `supabase/`), with API helpers under `src/api/`.
- UI is componentized under `src/components/` (games, cards, header/footer, charts), with a custom hook and context layer under `src/hooks/` and `src/contexts/`.
- Static assets live in `public/` and `src/assets/`, and a `dist/` directory is present (likely build output).
