-- Simple fix for team_members foreign key issue
-- This addresses the PGRST200 error

-- Drop and recreate team_members table with proper foreign keys
DROP TABLE IF EXISTS team_members CASCADE;

CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure uniqueness of a user within a team (needed for ON CONFLICT)
ALTER TABLE team_members
ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);

-- Add foreign key constraints
ALTER TABLE team_members 
ADD CONSTRAINT team_members_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE team_members 
ADD CONSTRAINT team_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own memberships" ON team_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team members can view other members" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Add your memberships back
INSERT INTO team_members (team_id, user_id, role, permissions, is_active)
SELECT 
    t.id as team_id,
    '4ac39c2d-0c72-416f-99df-914dae021d1b' as user_id,
    'Admin' as role,
    ARRAY['admin', 'manage_members'] as permissions,
    true as is_active
FROM teams t
WHERE t.admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Verify it works
SELECT 
    tm.team_id,
    tm.user_id,
    tm.role,
    t.name as team_name
FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b';
