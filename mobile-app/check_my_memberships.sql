-- Check if you are a member of any teams
-- This is the critical missing piece!

SELECT
    'Your Team Memberships' as check_type,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.joined_at,
    t.name as team_name,
    t.description as team_description
FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '4ac39c2d-0c72-416f-99df-914dae021d1b'
ORDER BY tm.joined_at DESC;





