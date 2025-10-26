-- Debug Team Display Issue
-- Comprehensive debugging to understand why teams aren't showing in mobile app

-- Step 1: Check if your user exists in auth.users
SELECT 
    'User Check' as check_type,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- Step 2: Check all teams in the database
SELECT 
    'All Teams' as check_type,
    id,
    name,
    admin_id,
    created_at,
    privacy
FROM teams 
ORDER BY created_at DESC;

-- Step 3: Check all team_members entries
SELECT 
    'All Team Members' as check_type,
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    t.name as team_name
FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
ORDER BY tm.joined_at DESC;

-- Step 4: Check specifically for your user's team memberships
SELECT 
    'Your Team Memberships' as check_type,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.permissions,
    tm.is_active,
    t.name as team_name,
    t.description
FROM team_members tm
INNER JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- Step 5: Test the exact query that getUserTeams uses
-- This simulates: .from('team_members').select('team:teams(*)').eq('user_id', userId)
SELECT 
    'getUserTeams Simulation' as check_type,
    jsonb_build_object(
        'team', to_jsonb(t.*)
    ) as result_structure
FROM team_members tm
INNER JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- Step 6: Check for any RLS issues by testing with different approaches
-- Test 1: Direct teams query (should work with our basic RLS)
SELECT 
    'Direct Teams Query' as check_type,
    COUNT(*) as total_teams
FROM teams;

-- Test 2: Direct team_members query
SELECT 
    'Direct Team Members Query' as check_type,
    COUNT(*) as total_members
FROM team_members;

-- Step 7: Check current RLS policies
SELECT 
    'Current RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('teams', 'team_members')
ORDER BY tablename, policyname;

-- Step 8: Test creating a simple team membership manually
DO $$
DECLARE
    test_team_id UUID;
    existing_team_id UUID;
    membership_exists BOOLEAN;
BEGIN
    -- Get the first team that exists
    SELECT id INTO existing_team_id FROM teams LIMIT 1;
    
    IF existing_team_id IS NOT NULL THEN
        -- Check if membership already exists
        SELECT EXISTS(
            SELECT 1 FROM team_members 
            WHERE team_id = existing_team_id AND user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
        ) INTO membership_exists;
        
        IF NOT membership_exists THEN
            -- Try to add membership
            BEGIN
                INSERT INTO team_members (
                    team_id,
                    user_id,
                    role,
                    permissions,
                    joined_at,
                    is_active
                ) VALUES (
                    existing_team_id,
                    '4ac39c2d-0c72-416f-99df-914dae021d1b',
                    'Member',
                    ARRAY['view_team'],
                    NOW(),
                    true
                );
                RAISE NOTICE 'Successfully added test membership';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to add test membership: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Membership already exists for first team';
        END IF;
    ELSE
        RAISE NOTICE 'No teams exist to test membership';
    END IF;
END $$;

-- Step 9: Final verification - show what getUserTeams should return
SELECT 
    'Final Verification' as check_type,
    t.id,
    t.name,
    t.description,
    t.category,
    t.privacy,
    tm.role,
    tm.joined_at
FROM team_members tm
INNER JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
ORDER BY tm.joined_at DESC;

-- Summary message
DO $$
BEGIN
    RAISE NOTICE 'Debug complete! Check the results above to identify the issue.';
    RAISE NOTICE 'Look for:';
    RAISE NOTICE '1. Does your user exist in auth.users?';
    RAISE NOTICE '2. Are there teams in the teams table?';
    RAISE NOTICE '3. Are there team_members entries for your user?';
    RAISE NOTICE '4. Do the RLS policies allow the queries?';
END $$;








