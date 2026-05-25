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
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'quiz_scores'
      AND p.polname = 'Public read quiz_scores'
  ) THEN
    CREATE POLICY "Public read quiz_scores" ON quiz_scores FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'quiz_scores'
      AND p.polname = 'Users insert own scores'
  ) THEN
    CREATE POLICY "Users insert own scores" ON quiz_scores FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'profiles'
      AND p.polname = 'Public read profiles'
  ) THEN
    CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'profiles'
      AND p.polname = 'Users upsert own profile'
  ) THEN
    CREATE POLICY "Users upsert own profile" ON profiles FOR ALL USING (true);
  END IF;
END
$$;

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
create unique index if not exists module_tutorials_module_quiz_ux on module_tutorials(module_id, quiz_id);

-- Public read access for tutorials
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'module_tutorials'
      AND p.polname = 'Public read module_tutorials'
  ) THEN
    CREATE POLICY "Public read module_tutorials" ON module_tutorials FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'module_tutorials'
      AND p.polname = 'Authenticated modify module_tutorials'
  ) THEN
    CREATE POLICY "Authenticated modify module_tutorials" ON module_tutorials FOR INSERT TO public WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'module_tutorials'
      AND p.polname = 'Authenticated update module_tutorials'
  ) THEN
    CREATE POLICY "Authenticated update module_tutorials" ON module_tutorials FOR UPDATE TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'module_tutorials'
      AND p.polname = 'Authenticated delete module_tutorials'
  ) THEN
    CREATE POLICY "Authenticated delete module_tutorials" ON module_tutorials FOR DELETE TO public USING (true);
  END IF;
END
$$;
alter table module_tutorials enable row level security;

-- Ensure the realtime publication exists and add tables when missing
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
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
