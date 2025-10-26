-- Fix RLS Policies for Teams
-- Run this in your Supabase SQL editor to fix the infinite recursion error

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can delete their teams" ON teams;

-- Create corrected RLS policies for teams
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Team admins can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Team admins can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = admin_id);

-- Also fix team_members policies to avoid recursion
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;

-- Create simplified team_members policies (with IF NOT EXISTS handling)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Team members are viewable by authenticated users') THEN
        CREATE POLICY "Team members are viewable by authenticated users" ON team_members
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Users can join teams') THEN
        CREATE POLICY "Users can join teams" ON team_members
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Users can leave teams') THEN
        CREATE POLICY "Users can leave teams" ON team_members
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Team admins can manage members') THEN
        CREATE POLICY "Team admins can manage members" ON team_members
          FOR ALL USING (
            team_id IN (
              SELECT id FROM teams WHERE admin_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Fix team_stats policies
DROP POLICY IF EXISTS "Team stats are viewable by team members" ON team_stats;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_stats' AND policyname = 'Team stats are viewable by authenticated users') THEN
        CREATE POLICY "Team stats are viewable by authenticated users" ON team_stats
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Fix team_activities policies  
DROP POLICY IF EXISTS "Team activities are viewable by team members" ON team_activities;
DROP POLICY IF EXISTS "Team members can create activities" ON team_activities;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_activities' AND policyname = 'Team activities are viewable by authenticated users') THEN
        CREATE POLICY "Team activities are viewable by authenticated users" ON team_activities
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_activities' AND policyname = 'Authenticated users can create activities') THEN
        CREATE POLICY "Authenticated users can create activities" ON team_activities
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
