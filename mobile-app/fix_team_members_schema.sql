-- Fix team_members table schema
-- Add missing columns that the mobile app expects

-- Step 1: Check current team_members table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add permissions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE team_members ADD COLUMN permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added permissions column to team_members';
    ELSE
        RAISE NOTICE 'permissions column already exists';
    END IF;

    -- Add is_active column if it doesn't exist (mobile app interface expects it)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE team_members ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to team_members';
    ELSE
        RAISE NOTICE 'is_active column already exists';
    END IF;

    -- Ensure role column has correct type and constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'role'
    ) THEN
        -- Update role column to match expected values
        ALTER TABLE team_members ALTER COLUMN role TYPE TEXT;
        RAISE NOTICE 'Updated role column type';
    END IF;

END $$;

-- Step 3: Show updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;

-- Step 4: Test team creation now that schema is fixed
DO $$
DECLARE
    test_team_id UUID;
    test_member_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Create a test team
        INSERT INTO teams (
            name,
            description,
            category,
            level,
            privacy,
            max_members,
            admin_id
        ) VALUES (
            'Schema Test Team',
            'Testing team_members schema fix',
            'Test',
            'All Levels',
            'Public',
            10,
            '4ac39c2d-0c72-416f-99df-914dae021d1b'
        ) RETURNING id INTO test_team_id;
        
        RAISE NOTICE '✅ Test team created: %', test_team_id;
        
        -- Test adding team member with permissions
        INSERT INTO team_members (
            team_id,
            user_id,
            role,
            permissions,
            joined_at,
            is_active
        ) VALUES (
            test_team_id,
            '4ac39c2d-0c72-416f-99df-914dae021d1b',
            'Admin',
            ARRAY['manage_team', 'invite_members'],
            NOW(),
            true
        ) RETURNING id INTO test_member_id;
        
        RAISE NOTICE '✅ Team member added successfully: %', test_member_id;
        
        -- Clean up test data
        DELETE FROM team_members WHERE id = test_member_id;
        DELETE FROM teams WHERE id = test_team_id;
        
        RAISE NOTICE '✅ Schema fix successful! Team creation should now work in mobile app.';
        
    ELSE
        RAISE NOTICE '❌ User does not exist - cannot test team member creation';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error testing schema fix: %', SQLERRM;
    RAISE NOTICE '❌ Code: %', SQLSTATE;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'team_members schema fix completed!';
END $$;
