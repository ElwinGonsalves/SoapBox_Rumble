/*
  # Fix sessions table RLS policies

  1. Security Updates
    - Update sessions table INSERT policy to allow anonymous users
    - This fixes the 401 error when creating new sessions
    - Maintains security while allowing session creation

  2. Changes
    - Modify existing INSERT policy to include anon role
    - Ensure anonymous users can create sessions for the soapbox app
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert sessions" ON sessions;

-- Create a new policy that allows both authenticated and anonymous users to insert sessions
CREATE POLICY "Anyone can insert sessions"
  ON sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure the policy for anonymous users to read sessions exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Anyone can read sessions'
    AND roles @> ARRAY['anon']
  ) THEN
    DROP POLICY IF EXISTS "Anyone can read sessions" ON sessions;
    CREATE POLICY "Anyone can read sessions"
      ON sessions
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Ensure the policy for anonymous users to update sessions exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Anyone can update sessions'
    AND roles @> ARRAY['anon']
  ) THEN
    DROP POLICY IF EXISTS "Anyone can update sessions" ON sessions;
    CREATE POLICY "Anyone can update sessions"
      ON sessions
      FOR UPDATE
      TO anon, authenticated
      USING (true);
  END IF;
END $$;