# LOCKD IN — Claude Code Project Guide

## Project Overview

Personal command center dashboard for Danny — tracking and leveling up across 6 life pillars. Military/Pentagon aesthetic. Not a habit tracker — an ops center.

## Stack

- **Vite + React + TypeScript** (frontend)
- **Tailwind CSS v4** (styling — uses `@tailwindcss/vite` plugin, NOT the old PostCSS approach)
- **Supabase** (auth + database + RLS)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Design System — CRITICAL

Do NOT deviate from this aesthetic:
- Background: `#0a0e17` (near-black)
- Tactical green: `#00ff41` (primary accent, phosphor glow)
- Amber: `#ff9500` (warnings)
- Red: `#ff2d2d` (alerts)
- Fonts: `JetBrains Mono` for data/body, `Orbitron` for headers/titles
- Sharp edges only. No rounded corners. No bubbly UI.
- Scanlines, grid overlays, pulsing status lights
- Think: DoD login portal, Pentagon war room

CSS custom properties are defined in `src/index.css`.
Utility classes like `.glow-green`, `.scanlines`, `.tactical-grid`, `.status-pulse-green` are defined there.

## File Structure

```
src/
├── components/
│   ├── dashboard/    # TopBar, BottomBar, ReadinessGauge
│   ├── pillars/      # GodPillar, FinancesPillar, etc.
│   └── ui/           # TacticalCard, StatusLight (reusable)
├── contexts/         # AuthContext (Supabase auth)
├── hooks/            # useDailyLog, useProfile
├── lib/              # supabase.ts (client singleton)
├── pages/            # LoginPage, DashboardPage
└── types/            # database.ts (full Supabase type definitions)
supabase/
└── schema.sql        # Full schema + RLS — run in Supabase SQL Editor
```

## Key Conventions

- **One component per file** — always
- **All Supabase tables use RLS** — users only see their own data
- **daily_logs** — one row per user per day, auto-created on first fetch
- **profiles** — auto-created on signup via Supabase trigger (see schema.sql)
- Use `maybeSingle()` not `single()` when a row might not exist
- All pillar cards receive `log` (today's DailyLog) + `onUpdate` callback
- Readiness score is calculated client-side in `DashboardPage`

## Build Phases

Building phase by phase — confirm with Danny before moving to next phase:

- [x] **Phase 1A** — Project setup, auth (login/signup), Supabase
- [x] **Phase 1B** — Pentagon dashboard, 6 pillar cards, readiness gauge
- [ ] **Phase 2** — Journal + mood tracking
- [ ] **Phase 3** — Gamification engine (XP, streaks, ranks, leaderboard)
- [ ] **Phase 4** — Daily Bible verse (ESV API) + spiritual tools
- [ ] **Phase 5** — Custom habits manager + settings panel

## Environment

Requires `.env.local` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## User Preferences

- Danny checks this daily, including on mobile — mobile responsiveness matters
- Every interaction should feel tactile: transitions, hover states, micro-animations
- Military time format: `23 MAR 2026 | 14:32:07`
- Operator name displayed as: `OPERATOR: DANNY`
- Tone: serious, tactical, not playful
