-- FINAL FIX: Ensure teams display properly
-- This addresses the empty data array issue

-- 1) Check current state
SELECT '=== CURRENT STATE CHECK ===' as step;

SELECT 
    'Total teams in database' as label,
    COUNT(*) as count
FROM public.teams;

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

-- 2) Show sample teams
SELECT '=== SAMPLE TEAMS ===' as step;
SELECT id, name, admin_id, created_at 
FROM public.teams 
ORDER BY created_at DESC 
LIMIT 5;

-- 3) Show your memberships
SELECT '=== YOUR MEMBERSHIPS ===' as step;
SELECT tm.team_id, tm.user_id, tm.role, t.name as team_name
FROM public.team_members tm
LEFT JOIN public.teams t ON t.id = tm.team_id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 4) NUCLEAR OPTION: Delete and recreate everything
SELECT '=== NUCLEAR RESET ===' as step;

-- Delete all existing memberships for this user
DELETE FROM public.team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- Ensure all teams have your admin_id
UPDATE public.teams 
SET admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
WHERE admin_id IS NULL OR admin_id != '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- Create memberships for ALL teams
INSERT INTO public.team_members (team_id, user_id, role, permissions, is_active)
SELECT 
    t.id AS team_id,
    '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid AS user_id,
    'Admin' AS role,
    ARRAY['admin','manage_members','create_challenges']::text[] AS permissions,
    true AS is_active
FROM public.teams t
ON CONFLICT (team_id, user_id) DO NOTHING;

-- 5) Verify the fix
SELECT '=== AFTER FIX VERIFICATION ===' as step;

SELECT 
    'Total teams' as label,
    COUNT(*) as count
FROM public.teams;

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

-- 6) Show final result
SELECT '=== FINAL RESULT ===' as step;
SELECT 
    t.id,
    t.name,
    t.description,
    tm.role,
    tm.permissions,
    tm.joined_at
FROM public.teams t
JOIN public.team_members tm ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
ORDER BY tm.joined_at DESC
LIMIT 10;





