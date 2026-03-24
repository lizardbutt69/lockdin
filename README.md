# LOCKD IN — Personal Command Center

> Pentagon war room meets modern terminal UI. A personal ops center for tracking and leveling up across 6 life pillars.

---

## Stack

- **Vite + React + TypeScript** — frontend framework
- **Tailwind CSS v4** — utility-first styling
- **Supabase** — auth, database, real-time
- **Framer Motion** — animations
- **Lucide React** — icons

---

## Setup

### 1. Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # TopBar, BottomBar, ReadinessGauge
│   ├── pillars/         # 6 pillar cards (God, Finances, etc.)
│   └── ui/              # Reusable UI (TacticalCard, StatusLight, etc.)
├── contexts/            # AuthContext
├── hooks/               # useDailyLog, useProfile
├── lib/                 # Supabase client
├── pages/               # LoginPage, DashboardPage
└── types/               # Database type definitions
supabase/
└── schema.sql           # Full database schema + RLS policies
```

---

## 6 Life Pillars

| # | Pillar | Tracks |
|---|--------|--------|
| I | GOD | Bible reading, prayer, church attendance |
| II | FINANCES | Net worth, savings, investments, side income |
| III | WIFE & FAMILY | Quality time, date nights |
| IV | DIET & HEALTH | Water, meals, supplements, sleep |
| V | FITNESS | Workouts, weekly targets, type/duration/RPE |
| VI | TRIPS | Mission planning, countdowns, status tracking |

---

## Phases

- [x] **Phase 1** — Foundation, auth, dashboard + 6 pillars
- [ ] **Phase 2** — Journal + mood tracking
- [ ] **Phase 3** — Gamification engine (XP, ranks, leaderboard)
- [ ] **Phase 4** — Daily Bible verse + spiritual tools
- [ ] **Phase 5** — Custom habits + settings panel

---

## Design System

Military/Pentagon command center aesthetic:
- Dark base: `#0a0e17`
- Tactical green: `#00ff41`
- Amber warning: `#ff9500`
- Red alert: `#ff2d2d`
- Fonts: JetBrains Mono (data), Orbitron (headers)
- Scanlines, grid overlays, phosphor glow effects
