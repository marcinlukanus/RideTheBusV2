# RideTheBus V2 — Claude Reference

## Stack
- React 18.3 + TypeScript + Vite
- Tailwind CSS v4 (`@tailwindcss/vite` plugin — no `tailwind.config.js`)
- React Router v7, Supabase, Radix UI, Recharts, React Helmet Async

## Project structure
```
src/
  components/        # reusable components
    ui/              # brand primitives (Button, Panel)
  pages/             # Layout, Login, SignUp, PartyBus, Beerdle, Stats, Profile
  contexts/          # AuthContext
  api/               # Supabase API helpers
  utils/             # utility functions
  types/             # TypeScript types
  index.css          # global styles + @theme token definitions
```

## Commands
```bash
npm run dev          # dev server → http://localhost:5173
npx tsc --noEmit     # type-check (run before every commit)
```

## Tailwind v4 custom tokens
Tokens live in the `@theme {}` block in `src/index.css` — not in a config file.
Each `--color-*` variable auto-generates utility classes:
```css
--color-brand: #dc2626;        →  bg-brand, text-brand, border-brand
--color-surface-raised: #1a2531; →  bg-surface-raised, etc.
```

Current brand tokens:
| Token | Value | Utility |
|---|---|---|
| `--color-surface` | `#22303f` | `bg-surface` |
| `--color-surface-raised` | `#1a2531` | `bg-surface-raised` |
| `--color-surface-input` | `#374151` | `bg-surface-input` |
| `--color-brand` | `#dc2626` | `bg-brand` |
| `--color-brand-hover` | `#b91c1c` | `bg-brand-hover` |

## UI primitives (`src/components/ui/`)

### Button
Variants: `primary` (brand red), `secondary` (amber), `ghost` (white), `dark` (black)
```tsx
<Button variant="primary">Create Room</Button>
<Button variant="secondary">Sign In</Button>
<Button variant="ghost">Redraw Cards</Button>
```

### Panel
Dark surface container (`bg-surface-raised` + border + shadow). Accepts `className` for extension.
```tsx
<Panel className="max-w-md">...</Panel>
```

### When to use primitives vs. raw Tailwind
**Use a primitive when:**
- The same pattern appears in 3+ places
- The styling carries brand/semantic meaning (CTAs, surface containers)

**Keep raw Tailwind when:**
- Styling is semantically tied to game state or content (e.g. red suit = red button)
- It's a one-off layout, spacing, or typography situation
- A component would need so many props it's harder to read than raw classes

### The game-mechanics exception
Buttons in `Game.tsx` tied to game state (Red/Black, Higher/Lower/Same, Inside/Outside, suits)
intentionally do **not** use the Button component. Their colors reflect game rules, not brand
theme, and should stay independent.

## Git & PR workflow
1. `npx tsc --noEmit` — must be clean
2. Stage specific files by name (never `git add -A`)
3. Commit message: imperative title + blank line + body explaining *why*
4. Push branch → `gh pr create --draft` with a test plan checklist in the body

## Claude-specific notes
- **Worktrees do not inherit `.env`** — if you see `supabaseUrl is required`, copy it over:
  ```bash
  cp /Users/marcinlukanus/Projects/RideTheBusV2/.env .
  ```
