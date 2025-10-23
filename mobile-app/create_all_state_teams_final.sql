-- Complete State Teams Creation Script
-- Run this in Supabase SQL editor to create all 50 US state teams
-- Uses your actual user ID: 4ac39c2d-0c72-416f-99df-914dae021d1b

-- Temporarily disable RLS for teams table
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Create all 50 US state teams with existence checks
DO $$
DECLARE
    state_name TEXT;
    team_exists BOOLEAN;
    admin_user_id UUID := '4ac39c2d-0c72-416f-99df-914dae021d1b';
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
    RAISE NOTICE 'Creating state teams with admin_user_id: %', admin_user_id;
    
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
                admin_user_id,
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
    
    RAISE NOTICE 'State teams creation completed!';
    RAISE NOTICE 'All done! Check the results below to see your state teams.';
END $$;

-- Re-enable RLS for teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Show all created state teams
SELECT 
    name,
    category,
    privacy,
    max_members,
    admin_id,
    created_at,
    array_length(badges, 1) as badge_count
FROM teams 
WHERE badges @> ARRAY['state_team'] 
ORDER BY name;

-- Show summary
SELECT 
    COUNT(*) as total_state_teams,
    COUNT(CASE WHEN admin_id = '4ac39c2d-0c72-416f-99df-914dae021d1b' THEN 1 END) as teams_with_your_admin
FROM teams 
WHERE badges @> ARRAY['state_team'];
