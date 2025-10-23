-- Fix infinite recursion (42P17) in RLS policies for team_members

-- 1) Ensure table exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='team_members'
  ) THEN
    RAISE EXCEPTION 'team_members table does not exist';
  END IF;
END $$;

-- 2) Enable RLS (safe if already enabled)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3) Drop problematic/recursive policies if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='Team members can view other members'
  ) THEN
    DROP POLICY "Team members can view other members" ON public.team_members;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='Users can view their own team memberships'
  ) THEN
    DROP POLICY "Users can view their own team memberships" ON public.team_members;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_members' AND policyname='Team admins can manage team members'
  ) THEN
    DROP POLICY "Team admins can manage team members" ON public.team_members;
  END IF;
END $$;

-- 4) Recreate NON-RECURSIVE, SAFE policies

-- a) Users can read their own membership rows
CREATE POLICY "tm_select_self" ON public.team_members
  FOR SELECT USING (user_id = auth.uid());

-- b) Team admins can read all team members (no recursion; relies only on teams)
CREATE POLICY "tm_select_admin" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
        AND t.admin_id = auth.uid()
    )
  );

-- c) Team admins can insert/update/delete team members (non-recursive)
CREATE POLICY "tm_modify_admin" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
        AND t.admin_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
        AND t.admin_id = auth.uid()
    )
  );

-- Optional: allow any member to read all members of their team WITHOUT recursion
-- This variant joins only to teams and checks existence of the viewer's own row via user_id match
-- which we cannot do here without referencing team_members again. To avoid recursion, we skip this.

-- 5) Verify policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='team_members';







