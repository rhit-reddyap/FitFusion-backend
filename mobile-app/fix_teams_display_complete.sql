-- Complete fix for teams display and browse functionality
-- This ensures all teams are properly set up and accessible

-- 1) First, let's check what we have
SELECT 'Current state check' as step;
SELECT 
    'Teams with your admin_id' as label,
    COUNT(*) as count
FROM public.teams 
WHERE admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

SELECT 
    'Your team memberships' as label,
    COUNT(*) as count
FROM public.team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 2) Ensure all teams have proper admin_id
UPDATE public.teams 
SET admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
WHERE admin_id IS NULL;

-- 3) Create team_members entries for ALL teams (both your created and state teams)
INSERT INTO public.team_members (team_id, user_id, role, permissions, is_active)
SELECT 
    t.id AS team_id,
    '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid AS user_id,
    CASE 
        WHEN t.admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid THEN 'Admin'
        ELSE 'Member'
    END AS role,
    CASE 
        WHEN t.admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid THEN ARRAY['admin','manage_members','create_challenges']::text[]
        ELSE ARRAY['view']::text[]
    END AS permissions,
    true AS is_active
FROM public.teams t
LEFT JOIN public.team_members tm
    ON tm.team_id = t.id AND tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
WHERE tm.team_id IS NULL
ON CONFLICT (team_id, user_id) DO NOTHING;

-- 4) Verify the fix
SELECT 'After fix verification' as step;
SELECT 
    'Total teams' as label,
    COUNT(*) as count
FROM public.teams;

SELECT 
    'Your team memberships' as label,
    COUNT(*) as count
FROM public.team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

SELECT 
    'Teams you admin' as label,
    COUNT(*) as count
FROM public.teams 
WHERE admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 5) Show sample of your teams
SELECT 
    'Sample of your teams' as info,
    t.id,
    t.name,
    t.description,
    tm.role,
    tm.permissions
FROM public.teams t
JOIN public.team_members tm ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
ORDER BY t.created_at DESC
LIMIT 5;





