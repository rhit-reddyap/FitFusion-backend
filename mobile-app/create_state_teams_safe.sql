-- Create State Teams Script (Safe Version)
-- Run this in Supabase SQL editor to create all US state teams
-- This version checks for existing teams to avoid duplicates

-- Temporarily disable RLS for teams table
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Create state teams one by one with existence checks
DO $$
DECLARE
    state_name TEXT;
    team_exists BOOLEAN;
    states TEXT[] := ARRAY[
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
        'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
        'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
        'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
        'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
BEGIN
    FOREACH state_name IN ARRAY states
    LOOP
        -- Check if team already exists
        SELECT EXISTS(
            SELECT 1 FROM teams 
            WHERE name = state_name || ' Fitness Community'
        ) INTO team_exists;
        
        -- Only insert if team doesn't exist
        IF NOT team_exists THEN
            INSERT INTO teams (
                name, 
                description, 
                category, 
                level, 
                privacy, 
                max_members, 
                admin_id, 
                color_theme, 
                badges, 
                rules
            ) VALUES (
                state_name || ' Fitness Community',
                'Official fitness community for ' || state_name || ' residents and fitness enthusiasts. Connect with local members, share workouts, and compete in state-wide challenges!',
                'Regional Community',
                'All Levels',
                'Public',
                1000,
                '00000000-0000-0000-0000-000000000000',
                ARRAY['#10B981', '#059669'],
                ARRAY['state_team', 'official'],
                ARRAY[
                    'Be respectful to all community members',
                    'Share your fitness journey and progress',
                    'Support and encourage fellow state members',
                    'Keep discussions fitness and health related',
                    'Follow community guidelines and terms of service'
                ]
            );
            
            RAISE NOTICE 'Created team for %', state_name;
        ELSE
            RAISE NOTICE 'Team for % already exists', state_name;
        END IF;
    END LOOP;
END $$;

-- Re-enable RLS for teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Show created teams
SELECT name, category, privacy, max_members, created_at 
FROM teams 
WHERE badges @> ARRAY['state_team'] 
ORDER BY name;








