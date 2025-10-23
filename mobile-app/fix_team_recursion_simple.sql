-- Simple Team RLS Fix - Remove All Recursion
-- This completely removes all team policies and creates the most basic ones possible

-- Step 1: Completely disable RLS temporarily
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can delete their teams" ON teams;
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Team creators can update teams" ON teams;
DROP POLICY IF EXISTS "Team creators can delete teams" ON teams;

-- Drop team_members policies too
DROP POLICY IF EXISTS "Team members are viewable by authenticated users" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Step 3: Create the simplest possible policies (no recursion)
CREATE POLICY "allow_all_select" ON teams FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert" ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "allow_admin_update" ON teams FOR UPDATE USING (admin_id = auth.uid());
CREATE POLICY "allow_admin_delete" ON teams FOR DELETE USING (admin_id = auth.uid());

-- Simple team_members policies
CREATE POLICY "allow_all_select_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_members" ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "allow_user_delete_members" ON team_members FOR DELETE USING (user_id = auth.uid());

-- Step 4: Re-enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Step 5: Test team creation
DO $$
DECLARE
    test_team_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Try to create a test team
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
            'RLS Test Team',
            'Testing if RLS recursion is fixed',
            'Test',
            'All Levels',
            'Public',
            5,
            '4ac39c2d-0c72-416f-99df-914dae021d1b',
            ARRAY['#10B981', '#059669'],
            ARRAY['test'],
            ARRAY['Test team']
        ) RETURNING id INTO test_team_id;
        
        RAISE NOTICE 'SUCCESS: Test team created with ID: %', test_team_id;
        
        -- Clean up
        DELETE FROM teams WHERE id = test_team_id;
        RAISE NOTICE 'Test team deleted. RLS recursion is FIXED!';
        
    ELSE
        RAISE NOTICE 'User does not exist - cannot test team creation';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'RLS recursion may still exist';
END $$;

-- Show final policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'teams' ORDER BY policyname;








