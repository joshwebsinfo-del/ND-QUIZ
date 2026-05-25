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

-- Allow public read access (so everyone can see leaderboard)
create policy "Public read quiz_scores" on quiz_scores for select using (true);
create policy "Users insert own scores" on quiz_scores for insert with check (true);
create policy "Public read profiles" on profiles for select using (true);
create policy "Users upsert own profile" on profiles for all using (true);

-- Enable RLS
alter table quiz_scores enable row level security;
alter table profiles enable row level security;

-- Module tutorials table
create table if not exists module_tutorials (
  id uuid default gen_random_uuid() primary key,
  module_id text not null,
  quiz_id text not null,
  source_url text not null,
  video_embed_url text not null,
  saved_at timestamp with time zone default now()
);

-- Public read access for tutorials
create policy "Public read module_tutorials" on module_tutorials for select using (true);
create policy "Authenticated modify module_tutorials" on module_tutorials for insert using (auth.role() = 'authenticated');
create policy "Authenticated update module_tutorials" on module_tutorials for update using (auth.role() = 'authenticated');
create policy "Authenticated delete module_tutorials" on module_tutorials for delete using (auth.role() = 'authenticated');
alter table module_tutorials enable row level security;

-- Enable real-time for quiz_scores and module_tutorials only if not already added
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'quiz_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_scores;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'module_tutorials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.module_tutorials;
  END IF;
END
$$;
