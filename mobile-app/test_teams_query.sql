-- Test the exact query that getUserTeams uses
-- This will help us debug why no teams are returned

-- 1) Test the exact query from getUserTeams
SELECT '=== TESTING getUserTeams QUERY ===' as step;

SELECT 
    tm.user_id,
    tm.team_id,
    t.id as team_id_from_join,
    t.name as team_name,
    t.admin_id
FROM team_members tm
LEFT JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 2) Test if the user exists in team_members at all
SELECT '=== CHECKING team_members TABLE ===' as step;

SELECT 
    'Total team_members entries' as label,
    COUNT(*) as count
FROM team_members;

SELECT 
    'Entries for your user' as label,
    COUNT(*) as count
FROM team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 3) Show all team_members entries
SELECT '=== ALL team_members ENTRIES ===' as step;
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    t.name as team_name
FROM team_members tm
LEFT JOIN teams t ON t.id = tm.team_id
ORDER BY tm.created_at DESC
LIMIT 10;

-- 4) Test the Supabase query format
SELECT '=== SUPABASE QUERY FORMAT ===' as step;
SELECT 
    json_build_object(
        'team', json_build_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'admin_id', t.admin_id,
            'created_at', t.created_at
        )
    ) as team_data
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
LIMIT 5;





