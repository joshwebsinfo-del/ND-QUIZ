-- Run this in your Supabase project SQL Editor (Database → SQL Editor → New Query)

-- Profiles table
create table if not exists profiles (
  id text primary key,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Quiz scores table
create table if not exists quiz_scores (
  id uuid default gen_random_uuid() primary key,
  user_id text references profiles(id),
  display_name text,
  avatar_url text,
  quiz_id text,
  quiz_title text,
  score integer,
  total integer,
  percentage numeric,
  completed_at timestamp with time zone default now()
);

-- Enable real-time for quiz_scores
alter publication supabase_realtime add table quiz_scores;

-- Allow public read access (so everyone can see leaderboard)
create policy "Public read quiz_scores" on quiz_scores for select using (true);
create policy "Users insert own scores" on quiz_scores for insert with check (true);
create policy "Public read profiles" on profiles for select using (true);
create policy "Users upsert own profile" on profiles for all using (true);

-- Enable RLS
alter table quiz_scores enable row level security;
alter table profiles enable row level security;
