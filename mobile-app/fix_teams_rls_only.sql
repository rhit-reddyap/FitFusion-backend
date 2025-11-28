-- Fix Teams RLS Only (Minimal Fix)
-- Run this in Supabase SQL editor to fix just the teams table RLS recursion issue
-- This is a minimal fix that only addresses the core problem

-- Drop and recreate only the problematic teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can delete their teams" ON teams;

-- Create corrected RLS policies for teams (non-recursive)
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Team admins can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Team admins can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = admin_id);

-- Show current policies for verification
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'teams' 
ORDER BY policyname;








