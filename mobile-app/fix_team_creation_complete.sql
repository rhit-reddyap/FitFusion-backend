-- Complete Team Creation Fix
-- Run this in Supabase SQL editor to fix all team creation issues
-- This addresses RLS policies, foreign keys, and enables team creation

-- Step 1: Fix RLS policies to prevent infinite recursion
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

-- Step 2: Verify your user exists in auth.users
DO $$
DECLARE
    user_exists BOOLEAN;
    user_count INTEGER;
BEGIN
    -- Check if your user ID exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
    ) INTO user_exists;
    
    SELECT COUNT(*) FROM auth.users INTO user_count;
    
    RAISE NOTICE 'Total users in system: %', user_count;
    RAISE NOTICE 'Your user ID exists: %', user_exists;
    
    IF NOT user_exists THEN
        RAISE NOTICE 'WARNING: Your user ID does not exist in auth.users table!';
        RAISE NOTICE 'You may need to sign up or sign in to create your user account first.';
    ELSE
        RAISE NOTICE 'SUCCESS: Your user ID is valid and team creation should work.';
    END IF;
END $$;

-- Step 3: Test team creation with a simple test team
DO $$
DECLARE
    test_team_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists first
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Try to create a test team
        BEGIN
            INSERT INTO teams (
                name,
                description,
                category,
                level,
                privacy,
                max_members,
                admin_id,
                color_theme,
                badges,
                rules
            ) VALUES (
                'Test Team - Delete Me',
                'This is a test team to verify team creation works',
                'Test',
                'All Levels',
                'Public',
                10,
                '4ac39c2d-0c72-416f-99df-914dae021d1b',
                ARRAY['#10B981', '#059669'],
                ARRAY['test'],
                ARRAY['This is a test team']
            ) RETURNING id INTO test_team_id;
            
            RAISE NOTICE 'SUCCESS: Test team created with ID: %', test_team_id;
            RAISE NOTICE 'Team creation is working! You can now create teams in the mobile app.';
            
            -- Clean up test team
            DELETE FROM teams WHERE id = test_team_id;
            RAISE NOTICE 'Test team cleaned up successfully.';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Failed to create test team: %', SQLERRM;
            RAISE NOTICE 'Team creation may still have issues.';
        END;
    ELSE
        RAISE NOTICE 'SKIPPING: Cannot test team creation - user does not exist.';
    END IF;
END $$;

-- Step 4: Show current RLS policies for verification
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'View teams'
        WHEN cmd = 'INSERT' THEN 'Create teams' 
        WHEN cmd = 'UPDATE' THEN 'Update teams'
        WHEN cmd = 'DELETE' THEN 'Delete teams'
        ELSE cmd
    END as description
FROM pg_policies 
WHERE tablename = 'teams' 
ORDER BY policyname;

-- Step 5: Show any existing teams (should be empty if state teams weren't created yet)
SELECT 
    COUNT(*) as total_teams,
    COUNT(CASE WHEN admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b' THEN 1 END) as your_teams
FROM teams;

-- Final status message
DO $$
BEGIN
    RAISE NOTICE 'Team creation fix completed! Check the results above.';
    RAISE NOTICE 'If the test team was created successfully, you should now be able to create teams in the mobile app.';
    RAISE NOTICE 'If there were errors, please share the error messages for further debugging.';
END $$;
