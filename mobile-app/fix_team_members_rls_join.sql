-- Fix RLS policies for team_members table to allow joining teams
-- This script addresses the "42501" error when trying to join teams

DO $$ 
BEGIN
    -- Drop existing problematic policies
    DROP POLICY IF EXISTS "Team members are viewable by authenticated users" ON team_members;
    DROP POLICY IF EXISTS "Team members can be inserted by authenticated users" ON team_members;
    DROP POLICY IF EXISTS "Team members can be updated by authenticated users" ON team_members;
    DROP POLICY IF EXISTS "Team members can be deleted by authenticated users" ON team_members;
    
    -- Drop any other existing policies
    DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
    DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
    DROP POLICY IF EXISTS "team_members_update_policy" ON team_members;
    DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;
    
    RAISE NOTICE 'Dropped existing team_members policies';
END $$;

-- Create new, simpler RLS policies for team_members
DO $$ 
BEGIN
    -- Allow authenticated users to view team members
    CREATE POLICY "team_members_select_policy" ON team_members
        FOR SELECT
        TO authenticated
        USING (true);
    
    RAISE NOTICE 'Created team_members SELECT policy';
END $$;

DO $$ 
BEGIN
    -- Allow authenticated users to insert team members (join teams)
    CREATE POLICY "team_members_insert_policy" ON team_members
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'Created team_members INSERT policy';
END $$;

DO $$ 
BEGIN
    -- Allow users to update their own team membership
    CREATE POLICY "team_members_update_policy" ON team_members
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'Created team_members UPDATE policy';
END $$;

DO $$ 
BEGIN
    -- Allow users to delete their own team membership (leave teams)
    CREATE POLICY "team_members_delete_policy" ON team_members
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created team_members DELETE policy';
END $$;

-- Verify RLS is enabled
DO $$ 
BEGIN
    -- Ensure RLS is enabled on team_members table
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on team_members table';
END $$;

-- Test the policies by checking if we can see existing team members
DO $$ 
DECLARE
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO member_count FROM team_members LIMIT 1;
    RAISE NOTICE 'Successfully queried team_members table. Found % members (limited to 1 for test)', member_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing team_members query: %', SQLERRM;
END $$;

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'team_members'
ORDER BY policyname;




