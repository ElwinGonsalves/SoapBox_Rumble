/*
  # r/Soapbox Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `nickname` (text, not null)
      - `avatar` (text, optional)
      - `auth_method` (text, not null - 'google' or 'anonymous')
      - `created_at` (timestamp)
    - `sessions`
      - `id` (text, primary key)
      - `current_speaker` (uuid, foreign key to users)
      - `speaker_queue` (jsonb array of user ids)
      - `start_time` (timestamp)
      - `cringe_level` (integer, default 0)
      - `active` (boolean, default true)
      - `created_at` (timestamp)
    - `rants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `nickname` (text, not null)
      - `text` (text, optional)
      - `audio_url` (text, optional)
      - `transcript` (text, optional)
      - `reactions` (jsonb with reaction counts)
      - `duration` (integer, seconds)
      - `survived` (boolean, default false)
      - `created_at` (timestamp)
    - `reactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_id` (text, foreign key to sessions)
      - `emoji` (text, not null)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  avatar text,
  auth_method text NOT NULL CHECK (auth_method IN ('google', 'anonymous')),
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  current_speaker uuid REFERENCES users(id),
  speaker_queue jsonb DEFAULT '[]'::jsonb,
  start_time timestamptz,
  cringe_level integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create rants table
CREATE TABLE IF NOT EXISTS rants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  nickname text NOT NULL,
  text text,
  audio_url text,
  transcript text,
  reactions jsonb DEFAULT '{"tomato": 0, "explain": 0, "plus_one": 0, "cringe": 0}'::jsonb,
  duration integer DEFAULT 0,
  survived boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  session_id text REFERENCES sessions(id) NOT NULL,
  emoji text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Anyone can read sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Rants policies
CREATE POLICY "Anyone can read rants"
  ON rants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own rants"
  ON rants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rants"
  ON rants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Anyone can read reactions"
  ON reactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rants_survived ON rants(survived);
CREATE INDEX IF NOT EXISTS idx_rants_created_at ON rants(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_session_id ON reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_reactions_timestamp ON reactions(timestamp);

-- Insert a default session
INSERT INTO sessions (id, active) 
VALUES ('main-session', true)
ON CONFLICT (id) DO NOTHING;