-- Fix Team Display Issue
-- Ensure team creators are properly added as team members and teams display correctly

-- Step 1: Check if there are teams without corresponding team_members entries
SELECT 
    t.id,
    t.name,
    t.admin_id,
    COUNT(tm.id) as member_count,
    CASE WHEN COUNT(tm.id) = 0 THEN 'NO MEMBERS' ELSE 'HAS MEMBERS' END as status
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name, t.admin_id
ORDER BY t.created_at DESC;

-- Step 2: Add missing team_members entries for team creators
DO $$
DECLARE
    team_record RECORD;
    member_exists BOOLEAN;
BEGIN
    -- Loop through all teams
    FOR team_record IN 
        SELECT id, admin_id, name FROM teams 
        WHERE admin_id IS NOT NULL
    LOOP
        -- Check if admin is already a member
        SELECT EXISTS(
            SELECT 1 FROM team_members 
            WHERE team_id = team_record.id AND user_id = team_record.admin_id
        ) INTO member_exists;
        
        -- If admin is not a member, add them
        IF NOT member_exists THEN
            BEGIN
                INSERT INTO team_members (
                    team_id,
                    user_id,
                    role,
                    permissions,
                    joined_at,
                    is_active
                ) VALUES (
                    team_record.id,
                    team_record.admin_id,
                    'Admin',
                    ARRAY['manage_team', 'manage_members', 'create_challenges'],
                    NOW(),
                    true
                );
                
                RAISE NOTICE 'Added admin as member for team: %', team_record.name;
                
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to add admin for team %: %', team_record.name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Admin already member of team: %', team_record.name;
        END IF;
    END LOOP;
END $$;

-- Step 3: Verify the fix - show teams with their member counts
SELECT 
    t.id,
    t.name,
    t.admin_id,
    COUNT(tm.id) as member_count,
    string_agg(tm.role, ', ') as member_roles
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name, t.admin_id
ORDER BY t.created_at DESC;

-- Step 4: Show teams for your specific user ID
SELECT 
    t.id,
    t.name,
    t.description,
    t.category,
    tm.role,
    tm.joined_at
FROM teams t
INNER JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
ORDER BY tm.joined_at DESC;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Team display fix completed!';
    RAISE NOTICE 'All team creators should now be members of their teams.';
    RAISE NOTICE 'Teams should now display correctly in the mobile app.';
END $$;








