-- Create a sample team invite for testing
-- This will create an invite that should show up in the pending invites

-- First, let's see what teams exist
SELECT id, name, privacy FROM teams WHERE privacy = 'Public' LIMIT 5;

-- Create a test invite (replace with your actual email)
-- You'll need to replace 'your-email@example.com' with your actual email
INSERT INTO team_invites (
  team_id,
  inviter_id,
  invitee_email,
  status
) VALUES (
  (SELECT id FROM teams WHERE privacy = 'Public' LIMIT 1), -- Use the first public team
  '4ac39c2d-0c72-416f-99df-914dae021d1b', -- Your user ID
  'your-email@example.com', -- Replace with your actual email from profiles
  'pending'
);

-- Check the created invite
SELECT 
  ti.id,
  ti.team_id,
  ti.invitee_email,
  ti.status,
  t.name as team_name
FROM team_invites ti
LEFT JOIN teams t ON ti.team_id = t.id
WHERE ti.invitee_email = 'your-email@example.com'; -- Replace with your email




