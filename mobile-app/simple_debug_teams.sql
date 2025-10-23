-- Simple Team Debug - Step by Step
-- Run each section separately to see results

-- STEP 1: Check if your user exists
SELECT 'STEP 1: User Check' as step, id, email FROM auth.users WHERE id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- STEP 2: Check if you're a member of any teams (THIS IS THE KEY!)
SELECT 'STEP 2: Your Team Memberships' as step, team_id, role, joined_at FROM team_members WHERE user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b';

-- STEP 3: Count total teams in database
SELECT 'STEP 3: Total Teams' as step, COUNT(*) as team_count FROM teams;

-- STEP 4: Count total team memberships
SELECT 'STEP 4: Total Memberships' as step, COUNT(*) as membership_count FROM team_members;





