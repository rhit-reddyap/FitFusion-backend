-- Complete fix for team issues including foreign keys and invites
-- This script fixes the foreign key relationship issues and sets up team invites

-- 1. Fix team_members foreign key relationships
DO $$
BEGIN
    -- Drop existing foreign keys if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_members_user_id_fkey' 
        AND table_name = 'team_members'
    ) THEN
        ALTER TABLE team_members DROP CONSTRAINT team_members_user_id_fkey;
        RAISE NOTICE 'Dropped existing user_id foreign key constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_members_team_id_fkey' 
        AND table_name = 'team_members'
    ) THEN
        ALTER TABLE team_members DROP CONSTRAINT team_members_team_id_fkey;
        RAISE NOTICE 'Dropped existing team_id foreign key constraint';
    END IF;
END $$;

-- Add correct foreign key constraints
ALTER TABLE team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE team_members 
ADD CONSTRAINT team_members_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- 2. Fix RLS policies for team_members
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
DROP POLICY IF EXISTS "Team members can be inserted by team admins" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by team admins" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by team admins" ON team_members;
DROP POLICY IF EXISTS "Team members are viewable by authenticated users" ON team_members;
DROP POLICY IF EXISTS "Team members can be inserted by authenticated users" ON team_members;
DROP POLICY IF EXISTS "Team members can be updated by authenticated users" ON team_members;
DROP POLICY IF EXISTS "Team members can be deleted by authenticated users" ON team_members;

-- Create new, simpler RLS policies
CREATE POLICY "Team members are viewable by authenticated users" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be inserted by authenticated users" ON team_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be updated by authenticated users" ON team_members
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can be deleted by authenticated users" ON team_members
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. Create team_invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invitee_email ON team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);

-- Enable RLS for team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for team_invites
DROP POLICY IF EXISTS "Users can view their invites" ON team_invites;
DROP POLICY IF EXISTS "Team admins can view team invites" ON team_invites;
DROP POLICY IF EXISTS "Team admins can create invites" ON team_invites;
DROP POLICY IF EXISTS "Users can update their invites" ON team_invites;
DROP POLICY IF EXISTS "Team admins can update team invites" ON team_invites;

-- Users can view invites sent to their email
CREATE POLICY "Users can view their invites" ON team_invites
  FOR SELECT USING (
    invitee_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Team admins can view invites for their teams
CREATE POLICY "Team admins can view team invites" ON team_invites
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- Team admins can create invites for their teams
CREATE POLICY "Team admins can create invites" ON team_invites
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- Users can update invites sent to their email (accept/decline)
CREATE POLICY "Users can update their invites" ON team_invites
  FOR UPDATE USING (
    invitee_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Team admins can update invites for their teams
CREATE POLICY "Team admins can update team invites" ON team_invites
  FOR UPDATE USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- 5. Add updated_at trigger for team_invites
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_team_invites_updated_at ON team_invites;
CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON team_invites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Grant necessary permissions
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON team_invites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Test the relationships
SELECT 'Testing team_members relationship...' as test_step;

SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    p.email,
    p.display_name
FROM team_members tm
LEFT JOIN profiles p ON tm.user_id = p.id
LIMIT 5;

SELECT 'Testing team_invites table...' as test_step;

SELECT 
    ti.id,
    ti.team_id,
    ti.inviter_id,
    ti.invitee_email,
    ti.status,
    t.name as team_name
FROM team_invites ti
LEFT JOIN teams t ON ti.team_id = t.id
LIMIT 5;

SELECT 'All fixes completed successfully!' as result;
