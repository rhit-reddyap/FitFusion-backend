-- Find Your User ID
-- Run this first to get your user ID, then use it in the state teams script

-- Show all users in the system
SELECT 
    id as user_id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- If you want to use a specific user, copy their ID and replace it in the create_state_teams_with_real_admin.sql script








