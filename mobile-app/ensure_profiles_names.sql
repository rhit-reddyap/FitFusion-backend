-- Ensure profiles table has proper name tracking for team leaderboard
-- This script ensures display_name and email are properly set up

-- Step 1: Check current profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Add display_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to profiles table';
    ELSE
        RAISE NOTICE 'display_name column already exists in profiles table';
    END IF;
END $$;

-- Step 3: Update display_name for existing users who don't have it set
UPDATE profiles 
SET display_name = COALESCE(
    CASE 
        WHEN email IS NOT NULL THEN split_part(email, '@', 1)
        ELSE 'User'
    END
)
WHERE display_name IS NULL OR display_name = '';

-- Step 4: Set display_name default for new users
ALTER TABLE profiles ALTER COLUMN display_name SET DEFAULT 'User';

-- Step 5: Verify the data
SELECT 
    id,
    email,
    display_name,
    updated_at
FROM profiles 
LIMIT 10;

-- Step 6: Check team_members with user data
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    p.email,
    p.display_name
FROM team_members tm
LEFT JOIN profiles p ON tm.user_id = p.id
LIMIT 10;
