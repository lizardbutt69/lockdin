-- ============================================================
-- LOCKD IN — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- User profile + gamification state
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  rank text default 'RECRUIT',
  level integer default 1,
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  created_at timestamptz default now()
);

-- Daily log (one row per user per day)
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  -- God
  bible_read boolean default false,
  prayed boolean default false,
  prayer_notes text,
  church_attended boolean,
  -- Diet
  water_glasses integer default 0,
  meal_rating integer,
  supplements_taken boolean default false,
  sleep_hours numeric(3,1),
  -- Fitness
  worked_out boolean default false,
  workout_type text,
  workout_duration integer,
  workout_rpe integer,
  weight numeric(4,1),
  -- Wife & Relationships
  quality_time boolean default false,
  date_night boolean default false,
  -- Finances
  tracked_spending boolean default false,
  -- Meta
  mood integer,
  xp_earned integer default 0,
  created_at timestamptz default now(),
  unique(user_id, log_date)
);

-- Custom habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  pillar text not null,
  name text not null,
  frequency text default 'daily',
  xp_value integer default 10,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Habit completions
create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz default now(),
  unique(habit_id, completed_date)
);

-- Trips
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  destination text not null,
  start_date date,
  end_date date,
  budget numeric(10,2),
  status text default 'planning',
  notes text,
  created_at timestamptz default now()
);

-- Financial snapshots (monthly)
create table if not exists financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  month date not null,
  net_worth numeric(12,2),
  savings_target numeric(10,2),
  savings_actual numeric(10,2),
  investment_contributions numeric(10,2),
  side_income numeric(10,2),
  created_at timestamptz default now(),
  unique(user_id, month)
);

-- Relationship goals
create table if not exists relationship_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  goal_text text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Fitness goals
create table if not exists fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  goal_text text not null,
  target_date date,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Journal entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  entry_date date not null,
  mood integer not null,
  title text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Saved Bible verses
create table if not exists saved_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  reference text not null,
  text text not null,
  saved_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table trips enable row level security;
alter table financial_snapshots enable row level security;
alter table relationship_goals enable row level security;
alter table fitness_goals enable row level security;
alter table journal_entries enable row level security;
alter table saved_verses enable row level security;

-- Profiles
create policy "Users can manage own profile" on profiles
  for all using (auth.uid() = id);

-- Daily logs
create policy "Users can manage own daily logs" on daily_logs
  for all using (auth.uid() = user_id);

-- Habits
create policy "Users can manage own habits" on habits
  for all using (auth.uid() = user_id);

-- Habit completions
create policy "Users can manage own habit completions" on habit_completions
  for all using (auth.uid() = user_id);

-- Trips
create policy "Users can manage own trips" on trips
  for all using (auth.uid() = user_id);

-- Financial snapshots
create policy "Users can manage own financial snapshots" on financial_snapshots
  for all using (auth.uid() = user_id);

-- Relationship goals
create policy "Users can manage own relationship goals" on relationship_goals
  for all using (auth.uid() = user_id);

-- Fitness goals
create policy "Users can manage own fitness goals" on fitness_goals
  for all using (auth.uid() = user_id);

-- Journal entries
create policy "Users can manage own journal entries" on journal_entries
  for all using (auth.uid() = user_id);

-- Saved verses
create policy "Users can manage own saved verses" on saved_verses
  for all using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup trigger
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
