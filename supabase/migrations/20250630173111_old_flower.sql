/*
  # Fix Sessions RLS Policies for Anonymous Users

  1. Policy Updates
    - Update INSERT policy to allow both authenticated and anonymous users
    - Update SELECT policy to allow both authenticated and anonymous users  
    - Update UPDATE policy to allow both authenticated and anonymous users

  2. Changes
    - Drop existing restrictive policies
    - Create new policies that include both 'anon' and 'authenticated' roles
    - This fixes the 401 error when anonymous users try to interact with sessions
*/

-- Drop the existing policies
DROP POLICY IF EXISTS "Anyone can insert sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON sessions;

-- Create new policies that allow both authenticated and anonymous users

-- Allow both authenticated and anonymous users to read sessions
CREATE POLICY "Anyone can read sessions"
  ON sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow both authenticated and anonymous users to insert sessions
CREATE POLICY "Anyone can insert sessions"
  ON sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow both authenticated and anonymous users to update sessions
CREATE POLICY "Anyone can update sessions"
  ON sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true);