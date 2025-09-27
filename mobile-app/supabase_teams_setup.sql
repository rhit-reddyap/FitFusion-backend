-- Teams and Communities Database Setup
-- Run this in your Supabase SQL editor

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  level TEXT DEFAULT 'All Levels' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  privacy TEXT DEFAULT 'Public' CHECK (privacy IN ('Public', 'Private')),
  max_members INTEGER DEFAULT 10,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_image TEXT,
  color_theme TEXT[] DEFAULT ARRAY['#10B981', '#059669'],
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  rules TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Moderator', 'Member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  UNIQUE(team_id, user_id)
);

-- Create team_stats table
CREATE TABLE IF NOT EXISTS team_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  total_members INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  avg_workouts_per_week DECIMAL DEFAULT 0,
  team_streak INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id)
);

-- Create team_activities table
CREATE TABLE IF NOT EXISTS team_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN ('workout', 'achievement', 'challenge', 'post')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_challenges table
CREATE TABLE IF NOT EXISTS team_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('workout', 'calorie', 'streak', 'custom')),
  target_value INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create join_requests table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Team admins can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Team admins can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = admin_id);

-- Create RLS policies for team_members
CREATE POLICY "Team members are viewable by team members" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams" ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams" ON team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for team_stats
CREATE POLICY "Team stats are viewable by team members" ON team_stats
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for team_activities
CREATE POLICY "Team activities are viewable by team members" ON team_activities
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create activities" ON team_activities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for team_challenges
CREATE POLICY "Team challenges are viewable by team members" ON team_challenges
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can create challenges" ON team_challenges
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Create RLS policies for join_requests
CREATE POLICY "Join requests are viewable by team admins and requester" ON join_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Users can create join requests" ON join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team admins can update join requests" ON join_requests
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_admin_id ON teams(admin_id);
CREATE INDEX IF NOT EXISTS idx_teams_category ON teams(category);
CREATE INDEX IF NOT EXISTS idx_teams_privacy ON teams(privacy);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_team_id ON team_activities(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_user_id ON team_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_team_id ON team_challenges(team_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_team_id ON join_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON join_requests(user_id);

-- Insert default state teams
INSERT INTO teams (name, description, category, level, privacy, max_members, admin_id, color_theme) VALUES
('Alabama Fitness Warriors', 'Join Alabama''s premier fitness community!', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FF6B6B', '#4ECDC4']),
('Alaska Strong', 'Alaska''s toughest fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#45B7D1', '#96CEB4']),
('Arizona Desert Fitness', 'Arizona''s fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FECA57', '#FF9FF3']),
('Arkansas Razorback Fitness', 'Arkansas fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#54A0FF', '#5F27CD']),
('California Golden State Fitness', 'California''s premier fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00D2D3', '#FF9F43']),
('Colorado Rocky Mountain Fitness', 'Colorado''s mountain fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A55EEA', '#26DE81']),
('Connecticut Constitution Fitness', 'Connecticut fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#FDCB6E']),
('Delaware First State Fitness', 'Delaware''s fitness pioneers', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#6C5CE7', '#A29BFE']),
('Florida Sunshine Fitness', 'Florida''s sunny fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#FDCB6E']),
('Georgia Peach State Fitness', 'Georgia''s sweet fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Hawaii Aloha Fitness', 'Hawaii''s island fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Idaho Gem State Fitness', 'Idaho''s precious fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Illinois Prairie State Fitness', 'Illinois fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Indiana Hoosier Fitness', 'Indiana''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Iowa Hawkeye Fitness', 'Iowa''s fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Kansas Sunflower State Fitness', 'Kansas fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Kentucky Bluegrass Fitness', 'Kentucky''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Louisiana Pelican State Fitness', 'Louisiana fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Maine Pine Tree State Fitness', 'Maine''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Maryland Old Line State Fitness', 'Maryland fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Massachusetts Bay State Fitness', 'Massachusetts fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Michigan Great Lakes Fitness', 'Michigan''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Minnesota North Star Fitness', 'Minnesota fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Mississippi Magnolia State Fitness', 'Mississippi fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Missouri Show Me State Fitness', 'Missouri fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Montana Treasure State Fitness', 'Montana fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Nebraska Cornhusker Fitness', 'Nebraska''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Nevada Silver State Fitness', 'Nevada fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('New Hampshire Granite State Fitness', 'New Hampshire fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('New Jersey Garden State Fitness', 'New Jersey fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('New Mexico Land of Enchantment Fitness', 'New Mexico fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('New York Empire State Fitness', 'New York''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('North Carolina Tar Heel Fitness', 'North Carolina fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('North Dakota Peace Garden Fitness', 'North Dakota fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Ohio Buckeye State Fitness', 'Ohio fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Oklahoma Sooner State Fitness', 'Oklahoma fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Oregon Beaver State Fitness', 'Oregon''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Pennsylvania Keystone State Fitness', 'Pennsylvania fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Rhode Island Ocean State Fitness', 'Rhode Island fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('South Carolina Palmetto State Fitness', 'South Carolina fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('South Dakota Mount Rushmore Fitness', 'South Dakota fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Tennessee Volunteer State Fitness', 'Tennessee''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('Texas Lone Star Fitness', 'Texas fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Utah Beehive State Fitness', 'Utah fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Vermont Green Mountain Fitness', 'Vermont fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']),
('Virginia Old Dominion Fitness', 'Virginia fitness warriors', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FDCB6E', '#E17055']),
('Washington Evergreen State Fitness', 'Washington''s fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#74B9FF', '#0984E3']),
('West Virginia Mountain State Fitness', 'West Virginia fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#A29BFE', '#6C5CE7']),
('Wisconsin Badger State Fitness', 'Wisconsin fitness team', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#FD79A8', '#E84393']),
('Wyoming Equality State Fitness', 'Wyoming fitness community', 'State', 'All Levels', 'Public', 100, '00000000-0000-0000-0000-000000000000', ARRAY['#00B894', '#00CEC9']);

-- Create a function to automatically create team stats when a team is created
CREATE OR REPLACE FUNCTION create_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_stats (team_id, total_members, total_workouts, avg_workouts_per_week, team_streak, total_calories_burned)
  VALUES (NEW.id, 0, 0, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create team stats
DROP TRIGGER IF EXISTS trigger_create_team_stats ON teams;
CREATE TRIGGER trigger_create_team_stats
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION create_team_stats();




