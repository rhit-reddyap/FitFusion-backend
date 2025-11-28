-- Create a test team invite for testing the invites functionality
-- Replace the email with your actual email address

-- First, let's check if the team_invites table exists and has data
SELECT 'Checking team_invites table...' as step;

SELECT COUNT(*) as invite_count FROM team_invites;

-- Create a test invite (replace with your email)
-- You'll need to replace 'your-email@example.com' with your actual email
-- and get a valid team_id from your teams table

-- Get a sample team ID
SELECT id, name FROM teams LIMIT 1;

-- Create a test invite (uncomment and modify the email below)
/*
INSERT INTO team_invites (
  team_id,
  inviter_id,
  invitee_email,
  status
) VALUES (
  (SELECT id FROM teams LIMIT 1), -- Use the first team
  '4ac39c2d-0c72-416f-99df-914dae021d1b', -- Your user ID
  'your-email@example.com', -- Replace with your actual email
  'pending'
);
*/

-- Check if invites exist
SELECT 
  ti.id,
  ti.team_id,
  ti.invitee_email,
  ti.status,
  t.name as team_name
FROM team_invites ti
LEFT JOIN teams t ON ti.team_id = t.id;




