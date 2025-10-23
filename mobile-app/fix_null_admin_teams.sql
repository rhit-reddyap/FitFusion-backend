-- Fix teams with null admin_id by assigning a valid admin
-- This addresses the 50 teams with null admin_id

-- 1) Find a valid user to assign as admin (use your user ID)
SELECT 
    'Available admin user' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- 2) Update teams with null admin_id to use your user ID
UPDATE public.teams 
SET admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
WHERE admin_id IS NULL;

-- 3) Verify the fix
SELECT 
    'Teams with null admin_id' as label,
    COUNT(*) as count
FROM public.teams 
WHERE admin_id IS NULL;

SELECT 
    'Teams now with your admin_id' as label,
    COUNT(*) as count
FROM public.teams 
WHERE admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 4) Now run the memberships restore script again
-- This will create team_members entries for all teams
INSERT INTO public.team_members (team_id, user_id, role, permissions, is_active)
SELECT 
    t.id AS team_id,
    t.admin_id AS user_id,
    'Admin' AS role,
    ARRAY['admin','manage_members','create_challenges']::text[] AS permissions,
    true AS is_active
FROM public.teams t
JOIN auth.users u ON u.id = t.admin_id
LEFT JOIN public.team_members tm
    ON tm.team_id = t.id AND tm.user_id = t.admin_id
WHERE t.admin_id IS NOT NULL
    AND tm.team_id IS NULL
ON CONFLICT (team_id, user_id) DO NOTHING;

-- 5) Final verification
SELECT 
    'Total team memberships' as label,
    COUNT(*) as count
FROM public.team_members;

SELECT 
    'Your team memberships' as label,
    COUNT(*) as count
FROM public.team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;





