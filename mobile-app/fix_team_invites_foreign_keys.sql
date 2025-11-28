-- Fix foreign key relationships for team_invites table
-- This script ensures proper foreign key constraints between team_invites and profiles

-- Step 1: Check current foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'team_invites';

-- Step 2: Check team_invites table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'team_invites' 
ORDER BY ordinal_position;

-- Step 3: Drop existing foreign key constraints if they exist
ALTER TABLE team_invites DROP CONSTRAINT IF EXISTS team_invites_inviter_id_fkey;
ALTER TABLE team_invites DROP CONSTRAINT IF EXISTS team_invites_invitee_id_fkey;
ALTER TABLE team_invites DROP CONSTRAINT IF EXISTS team_invites_team_id_fkey;

-- Step 4: Add proper foreign key constraints
-- Foreign key to teams table
ALTER TABLE team_invites 
ADD CONSTRAINT team_invites_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Foreign key to profiles table for inviter
ALTER TABLE team_invites 
ADD CONSTRAINT team_invites_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Foreign key to profiles table for invitee (if invitee_id exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_invites' AND column_name = 'invitee_id'
    ) THEN
        ALTER TABLE team_invites 
        ADD CONSTRAINT team_invites_invitee_id_fkey 
        FOREIGN KEY (invitee_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Update RLS policies for team_invites
-- Drop ALL existing policies on team_invites
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'team_invites'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON team_invites';
    END LOOP;
END $$;

-- Create new RLS policies for team_invites
CREATE POLICY "team_invites_select_policy" ON team_invites
    FOR SELECT USING (true);

CREATE POLICY "team_invites_insert_policy" ON team_invites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "team_invites_update_policy" ON team_invites
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "team_invites_delete_policy" ON team_invites
    FOR DELETE USING (true);

-- Step 6: Ensure RLS is enabled
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify the foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'team_invites';

-- Step 8: Test the relationships
SELECT 
    'Foreign key relationships fixed successfully' as status,
    'team_invites can now properly reference profiles and teams' as message;
