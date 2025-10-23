-- Simple Test: Try to create a team to verify RLS recursion is fixed
-- Run this to test if team creation works after the RLS fix

DO $$
DECLARE
    test_team_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if your user exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
    ) INTO user_exists;
    
    RAISE NOTICE 'User exists: %', user_exists;
    
    IF user_exists THEN
        -- Try to create a simple test team
        BEGIN
            INSERT INTO teams (
                name,
                description,
                category,
                level,
                privacy,
                max_members,
                admin_id
            ) VALUES (
                'Quick Test Team',
                'Testing team creation',
                'Fitness',
                'All Levels',
                'Public',
                10,
                '4ac39c2d-0c72-416f-99df-914dae021d1b'
            ) RETURNING id INTO test_team_id;
            
            RAISE NOTICE '✅ SUCCESS: Team created successfully with ID: %', test_team_id;
            RAISE NOTICE '✅ Team creation is working! You can now create teams in the mobile app.';
            
            -- Clean up the test team
            DELETE FROM teams WHERE id = test_team_id;
            RAISE NOTICE '✅ Test team cleaned up.';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: Failed to create team: %', SQLERRM;
            RAISE NOTICE '❌ Code: %', SQLSTATE;
            
            -- Check if it's still the recursion error
            IF SQLSTATE = '42P17' THEN
                RAISE NOTICE '❌ This is still the infinite recursion error (42P17)';
                RAISE NOTICE '❌ The RLS policies may not have been fixed properly';
            ELSE
                RAISE NOTICE '❌ This is a different error - not recursion';
            END IF;
        END;
    ELSE
        RAISE NOTICE '❌ Your user ID does not exist in the auth.users table';
        RAISE NOTICE '❌ You may need to sign up or sign in first';
    END IF;
END $$;








