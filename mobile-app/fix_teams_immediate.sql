-- IMMEDIATE FIX: Force create team memberships
-- This ensures you have team memberships that will show up

-- 1) First, let's see what we actually have
SELECT '=== CURRENT STATE ===' as step;

-- Check if you have any team memberships
SELECT 
    'Your current memberships' as label,
    COUNT(*) as count
FROM team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- Check total teams
SELECT 
    'Total teams' as label,
    COUNT(*) as count
FROM teams;

-- 2) FORCE CREATE memberships for ALL teams
-- This will ensure you have memberships in every team
INSERT INTO team_members (team_id, user_id, role, permissions, is_active, joined_at)
SELECT 
    t.id,
    '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid,
    'Admin',
    ARRAY['admin', 'manage_members', 'create_challenges'],
    true,
    NOW()
FROM teams t
WHERE NOT EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = t.id 
    AND tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
);

-- 3) Verify the insert worked
SELECT '=== AFTER INSERT ===' as step;

SELECT 
    'Your memberships after insert' as label,
    COUNT(*) as count
FROM team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 4) Test the exact query that the app uses
SELECT '=== TESTING APP QUERY ===' as step;

-- This is the exact query the app runs
SELECT 
    tm.team_id,
    tm.user_id,
    tm.role,
    t.id as team_id_from_teams,
    t.name as team_name,
    t.description,
    t.admin_id
FROM team_members tm
LEFT JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 5) Show the JSON format that Supabase returns
SELECT '=== SUPABASE JSON FORMAT ===' as step;

SELECT 
    json_build_object(
        'team', json_build_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'admin_id', t.admin_id,
            'created_at', t.created_at,
            'level', t.level,
            'privacy', t.privacy,
            'max_members', t.max_members
        )
    ) as team_data
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
LIMIT 3;





