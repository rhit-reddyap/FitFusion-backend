-- Restore missing memberships for team creators and ensure admin is a member of their team
-- Also safely backfill team_members after table recreation

-- 1) Ensure unique constraint exists (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'team_members_team_id_user_id_key'
  ) THEN
    ALTER TABLE public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);
  END IF;
END $$;

-- 2) Backfill: make every team admin a member of their own team
INSERT INTO public.team_members (team_id, user_id, role, permissions, is_active)
SELECT 
  t.id AS team_id,
  t.admin_id AS user_id,
  'Admin' AS role,
  ARRAY['admin','manage_members','create_challenges']::text[] AS permissions,
  true AS is_active
FROM public.teams t
JOIN auth.users u ON u.id = t.admin_id -- ensure admin exists and is not null
LEFT JOIN public.team_members tm
  ON tm.team_id = t.id AND tm.user_id = t.admin_id
WHERE t.admin_id IS NOT NULL
  AND tm.team_id IS NULL;

-- 3) Optional: if you want to restore YOUR memberships explicitly (replace with your auth.uid())
-- This ensures you see teams you created even if step 2 was restricted by RLS in your environment
INSERT INTO public.team_members (team_id, user_id, role, permissions, is_active)
SELECT 
  t.id AS team_id,
  '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid AS user_id,
  'Admin' AS role,
  ARRAY['admin','manage_members','create_challenges']::text[] AS permissions,
  true AS is_active
FROM public.teams t
LEFT JOIN public.team_members tm
  ON tm.team_id = t.id AND tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
WHERE t.admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid
  AND tm.team_id IS NULL
ON CONFLICT (team_id, user_id) DO NOTHING;

-- 4) Verify
SELECT 'total_memberships' AS label, COUNT(*) AS count FROM public.team_members
UNION ALL
SELECT 'your_memberships' AS label, COUNT(*) FROM public.team_members 
WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'::uuid;

-- 5) Report any teams with NULL admin_id so we can fix them explicitly
SELECT 'teams_with_null_admin' AS label, COUNT(*) AS count
FROM public.teams
WHERE admin_id IS NULL;


