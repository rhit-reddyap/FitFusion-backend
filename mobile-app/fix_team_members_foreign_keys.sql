-- Fix foreign key relationship between team_members and profiles
-- First, let's check if the foreign key exists and drop it if it does
DO $$
BEGIN
    -- Drop existing foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_members_user_id_fkey' 
        AND table_name = 'team_members'
    ) THEN
        ALTER TABLE team_members DROP CONSTRAINT team_members_user_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint';
    END IF;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure we have the correct foreign key to teams
DO $$
BEGIN
    -- Drop existing team foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_members_team_id_fkey' 
        AND table_name = 'team_members'
    ) THEN
        ALTER TABLE team_members DROP CONSTRAINT team_members_team_id_fkey;
        RAISE NOTICE 'Dropped existing team foreign key constraint';
    END IF;
END $$;

ALTER TABLE team_members 
ADD CONSTRAINT team_members_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Update RLS policies for team_members to be more permissive
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be inserted by team admins" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by team admins" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by team admins" ON team_members;

-- Create new, simpler RLS policies
CREATE POLICY "Team members are viewable by authenticated users" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be inserted by authenticated users" ON team_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be updated by authenticated users" ON team_members
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be deleted by authenticated users" ON team_members
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON team_members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test the relationship
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    p.email,
    p.full_name
FROM team_members tm
LEFT JOIN profiles p ON tm.user_id = p.id
LIMIT 5;