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

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
