-- Comprehensive Fitness App Schema
-- This migration extends the existing schema with all required features

-- =============================================
-- USER PROFILES & AUTH EXTENSIONS
-- =============================================

-- Extend profiles table with additional fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  avatar_url text,
  bio text,
  date_of_birth date,
  height_cm numeric,
  weight_kg numeric,
  activity_level text CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  fitness_goals text[],
  preferred_units text DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  timezone text DEFAULT 'UTC',
  privacy_settings jsonb DEFAULT '{"share_data": false, "public_profile": false}',
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  xp_points integer DEFAULT 0,
  level integer DEFAULT 1,
  streak_days integer DEFAULT 0,
  last_activity_date date,
  updated_at timestamp with time zone DEFAULT now();

-- =============================================
-- EXERCISE LIBRARY & WORKOUT SYSTEM
-- =============================================

-- Exercise library with comprehensive data
CREATE TABLE IF NOT EXISTS public.exercises (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- 'strength', 'cardio', 'flexibility', 'sports'
  muscle_groups text[] NOT NULL, -- ['chest', 'shoulders', 'triceps']
  equipment text[], -- ['barbell', 'dumbbell', 'bodyweight']
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  video_url text,
  image_url text,
  instructions text[],
  tips text[],
  tags text[],
  is_compound boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Workout templates and programs
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes integer,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Template exercises (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id bigserial PRIMARY KEY,
  template_id bigint REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id bigint REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  sets integer NOT NULL,
  reps_min integer,
  reps_max integer,
  weight_kg numeric,
  rest_seconds integer,
  notes text
);

-- Enhanced workout sets with more data
ALTER TABLE public.workout_sets ADD COLUMN IF NOT EXISTS
  exercise_id bigint REFERENCES public.exercises(id),
  rest_seconds integer,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notes text,
  is_pr boolean DEFAULT false,
  pr_type text CHECK (pr_type IN ('all_time', '6_month', 'year')),
  estimated_1rm numeric;

-- Personal Records tracking
CREATE TABLE IF NOT EXISTS public.personal_records (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id bigint REFERENCES public.exercises(id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL,
  reps integer NOT NULL,
  date_achieved date NOT NULL,
  pr_type text NOT NULL CHECK (pr_type IN ('all_time', '6_month', 'year')),
  workout_id bigint REFERENCES public.workouts(id),
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- FOOD & NUTRITION SYSTEM
-- =============================================

-- Food database with comprehensive nutrition data
CREATE TABLE IF NOT EXISTS public.foods (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  brand text,
  barcode text UNIQUE,
  serving_size_g numeric NOT NULL,
  calories_per_100g numeric NOT NULL,
  protein_per_100g numeric NOT NULL DEFAULT 0,
  carbs_per_100g numeric NOT NULL DEFAULT 0,
  fat_per_100g numeric NOT NULL DEFAULT 0,
  fiber_per_100g numeric DEFAULT 0,
  sugar_per_100g numeric DEFAULT 0,
  sodium_mg_per_100g numeric DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Recipe system
CREATE TABLE IF NOT EXISTS public.recipes (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer DEFAULT 1,
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  cuisine_type text,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  is_public boolean DEFAULT false,
  image_url text,
  instructions text[],
  tags text[],
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Recipe ingredients
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id bigserial PRIMARY KEY,
  recipe_id bigint REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id bigint REFERENCES public.foods(id) ON DELETE CASCADE,
  amount_g numeric NOT NULL,
  notes text
);

-- User nutrition goals
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_calories integer NOT NULL,
  daily_protein_g numeric NOT NULL,
  daily_carbs_g numeric NOT NULL,
  daily_fat_g numeric NOT NULL,
  daily_fiber_g numeric DEFAULT 25,
  daily_sodium_mg numeric DEFAULT 2300,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- COMMUNITIES & SOCIAL FEATURES
-- =============================================

-- Communities
CREATE TABLE IF NOT EXISTS public.communities (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  member_count integer DEFAULT 0,
  rules text[],
  tags text[],
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Community memberships
CREATE TABLE IF NOT EXISTS public.community_members (
  id bigserial PRIMARY KEY,
  community_id bigint REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  share_data boolean DEFAULT false,
  UNIQUE(community_id, user_id)
);

-- Social feed events
CREATE TABLE IF NOT EXISTS public.social_events (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id bigint REFERENCES public.communities(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('pr', 'workout', 'streak', 'badge', 'achievement')),
  title text NOT NULL,
  description text,
  data jsonb, -- Flexible data storage for different event types
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id bigserial PRIMARY KEY,
  community_id bigint REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  reply_to_id bigint REFERENCES public.chat_messages(id),
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- GAMIFICATION SYSTEM
-- =============================================

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon_url text,
  category text NOT NULL, -- 'consistency', 'strength', 'endurance', 'social'
  requirements jsonb NOT NULL, -- Flexible requirements structure
  xp_reward integer DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id bigint REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Leaderboards (materialized view for performance)
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id bigserial PRIMARY KEY,
  community_id bigint REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metric text NOT NULL, -- 'xp', 'volume_lifted', 'streak_days', 'workouts_this_month'
  value numeric NOT NULL,
  rank_position integer,
  period text NOT NULL, -- 'all_time', 'monthly', 'weekly'
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(community_id, user_id, metric, period)
);

-- =============================================
-- ANALYTICS & TRACKING
-- =============================================

-- Body composition tracking
CREATE TABLE IF NOT EXISTS public.body_composition (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  weight_kg numeric,
  body_fat_percentage numeric,
  muscle_mass_kg numeric,
  measurements jsonb, -- Flexible measurements storage
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Workout analytics (aggregated data for performance)
CREATE TABLE IF NOT EXISTS public.workout_analytics (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_volume_kg numeric DEFAULT 0,
  total_sets integer DEFAULT 0,
  total_reps integer DEFAULT 0,
  workout_duration_minutes integer DEFAULT 0,
  muscle_groups_worked text[],
  calories_burned numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- =============================================
-- STRIPE & MONETIZATION
-- =============================================

-- Enhanced subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS
  subscription_id text,
  price_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamp with time zone,
  metadata jsonb;

-- Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- User promo code usage
CREATE TABLE IF NOT EXISTS public.user_promo_usage (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id bigint REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  used_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, promo_code_id)
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_usage ENABLE ROW LEVEL SECURITY;

-- Public read access for exercises, foods, and badges
CREATE POLICY "exercises are publicly readable" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "foods are publicly readable" ON public.foods FOR SELECT USING (true);
CREATE POLICY "badges are publicly readable" ON public.badges FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "personal_records owner" ON public.personal_records
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_goals owner" ON public.nutrition_goals
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "body_composition owner" ON public.body_composition
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_analytics owner" ON public.workout_analytics
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Community policies
CREATE POLICY "communities are publicly readable" ON public.communities FOR SELECT USING (is_public = true);
CREATE POLICY "communities owner can update" ON public.communities
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "community_members can read" ON public.community_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "community_members can insert" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social events policies
CREATE POLICY "social_events community members can read" ON public.social_events
  FOR SELECT USING (
    is_public = true OR
    EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "social_events owner can insert" ON public.social_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "chat_messages community members can read" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "chat_messages community members can insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Exercise library indexes
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON public.exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises USING GIN(equipment);

-- Workout indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_id, date_achieved DESC);

-- Food and nutrition indexes
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON public.foods(barcode);

-- Social and community indexes
CREATE INDEX IF NOT EXISTS idx_social_events_community_created ON public.social_events(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_community_created ON public.chat_messages(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_community_metric ON public.leaderboards(community_id, metric, rank_position);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_workout_analytics_user_date ON public.workout_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_body_composition_user_date ON public.body_composition(user_id, date DESC);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id uuid, p_xp_gained integer)
RETURNS void AS $$
DECLARE
  current_xp integer;
  current_level integer;
  new_level integer;
BEGIN
  -- Get current XP and level
  SELECT xp_points, level INTO current_xp, current_level
  FROM public.profiles WHERE id = p_user_id;
  
  -- Calculate new level (every 1000 XP = 1 level)
  new_level := (current_xp + p_xp_gained) / 1000 + 1;
  
  -- Update user XP and level
  UPDATE public.profiles 
  SET xp_points = xp_points + p_xp_gained,
      level = new_level,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- If level increased, create a social event
  IF new_level > current_level THEN
    INSERT INTO public.social_events (user_id, community_id, event_type, title, description)
    SELECT p_user_id, cm.community_id, 'achievement', 
           'Level Up!', 
           'Reached level ' || new_level || '!'
    FROM public.community_members cm 
    WHERE cm.user_id = p_user_id AND cm.share_data = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_badges(p_user_id uuid)
RETURNS void AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(DISTINCT w.date) as workout_days,
    COUNT(DISTINCT w.id) as total_workouts,
    COALESCE(SUM(ws.weight_kg * ws.reps), 0) as total_volume,
    MAX(p.streak_days) as current_streak
  INTO user_stats
  FROM public.profiles p
  LEFT JOIN public.workouts w ON w.user_id = p.id
  LEFT JOIN public.workout_sets ws ON ws.workout_id = w.id
  WHERE p.id = p_user_id;
  
  -- Check each badge
  FOR badge_record IN 
    SELECT * FROM public.badges WHERE is_hidden = false
  LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = badge_record.id) THEN
      -- Check badge requirements (simplified logic - extend as needed)
      IF badge_record.name = 'First Workout' AND user_stats.total_workouts >= 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        PERFORM update_user_xp(p_user_id, badge_record.xp_reward);
      ELSIF badge_record.name = 'Consistency King' AND user_stats.current_streak >= 30 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        PERFORM update_user_xp(p_user_id, badge_record.xp_reward);
      ELSIF badge_record.name = 'Iron Master' AND user_stats.total_volume >= 10000 THEN
        INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        PERFORM update_user_xp(p_user_id, badge_record.xp_reward);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics after workout
CREATE OR REPLACE FUNCTION update_workout_analytics()
RETURNS TRIGGER AS $$
DECLARE
  workout_date date;
  total_volume numeric;
  total_sets integer;
  total_reps integer;
  muscle_groups text[];
BEGIN
  -- Get workout date
  SELECT date INTO workout_date FROM public.workouts WHERE id = NEW.workout_id;
  
  -- Calculate totals for the day
  SELECT 
    COALESCE(SUM(weight_kg * reps), 0),
    COUNT(*),
    SUM(reps),
    ARRAY_AGG(DISTINCT e.muscle_groups)
  INTO total_volume, total_sets, total_reps, muscle_groups
  FROM public.workout_sets ws
  LEFT JOIN public.exercises e ON e.id = ws.exercise_id
  WHERE ws.workout_id = NEW.workout_id;
  
  -- Flatten muscle groups array
  muscle_groups := ARRAY(SELECT DISTINCT unnest(muscle_groups));
  
  -- Insert or update analytics
  INSERT INTO public.workout_analytics (user_id, date, total_volume_kg, total_sets, total_reps, muscle_groups_worked)
  SELECT user_id, workout_date, total_volume, total_sets, total_reps, muscle_groups
  FROM public.workouts WHERE id = NEW.workout_id
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_volume_kg = workout_analytics.total_volume_kg + total_volume,
    total_sets = workout_analytics.total_sets + total_sets,
    total_reps = workout_analytics.total_reps + total_reps,
    muscle_groups_worked = workout_analytics.muscle_groups_worked || muscle_groups;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_workout_analytics ON public.workout_sets;
CREATE TRIGGER trigger_update_workout_analytics
  AFTER INSERT ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION update_workout_analytics();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert some basic exercises with video URLs
INSERT INTO public.exercises (name, description, category, muscle_groups, equipment, difficulty_level, is_compound, video_url, instructions, tips) VALUES
('Bench Press', 'Classic chest exercise performed lying on a bench', 'strength', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'bench'], 'intermediate', true, 'https://www.youtube.com/embed/4Y2EjHCODUo', ARRAY['Lie flat on bench with feet firmly planted', 'Grip bar slightly wider than shoulders', 'Lower bar to chest with control', 'Press bar up explosively', 'Keep core tight throughout movement'], ARRAY['Keep your shoulder blades retracted', 'Don''t bounce the bar off your chest', 'Use a spotter for heavy weights', 'Focus on controlled movement']),
('Squat', 'Fundamental lower body exercise', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['barbell'], 'intermediate', true, 'https://www.youtube.com/embed/Dy28eq2PjcM', ARRAY['Stand with feet shoulder-width apart', 'Place bar on upper back', 'Lower down as if sitting back', 'Keep chest up and core tight', 'Drive through heels to stand up'], ARRAY['Keep knees tracking over toes', 'Don''t let knees cave inward', 'Go below parallel for full range', 'Maintain neutral spine throughout']),
('Deadlift', 'Full body compound movement', 'strength', ARRAY['hamstrings', 'glutes', 'back', 'traps'], ARRAY['barbell'], 'advanced', true, 'https://www.youtube.com/embed/op9kVnSso6Q', ARRAY['Stand with feet hip-width apart', 'Hinge at hips to lower bar', 'Keep bar close to body', 'Drive hips forward to stand', 'Squeeze glutes at the top'], ARRAY['Keep bar close to your body', 'Don''t round your back', 'Engage your lats before lifting', 'Use proper breathing technique']),
('Pull-ups', 'Upper body pulling exercise', 'strength', ARRAY['lats', 'biceps', 'rear_delts'], ARRAY['pull_up_bar'], 'intermediate', true, 'https://www.youtube.com/embed/eGo4IYlbE5g', ARRAY['Hang from bar with overhand grip', 'Engage your lats and core', 'Pull yourself up until chin clears bar', 'Lower with control', 'Keep shoulders down and back'], ARRAY['Start with assisted variations if needed', 'Focus on pulling with your back, not just arms', 'Keep your core engaged', 'Don''t swing or use momentum']),
('Push-ups', 'Bodyweight chest exercise', 'strength', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], 'beginner', true, 'https://www.youtube.com/embed/IODxDxX7oi4', ARRAY['Start in plank position', 'Hands slightly wider than shoulders', 'Lower chest to ground', 'Push back up to starting position', 'Keep body in straight line'], ARRAY['Keep your core tight', 'Don''t let hips sag or pike up', 'Full range of motion is key', 'Modify on knees if needed']),
('Plank', 'Core stability exercise', 'strength', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', false, 'https://www.youtube.com/embed/pSHjTRCQxIw', ARRAY['Start in push-up position', 'Lower to forearms', 'Keep body in straight line', 'Engage core and glutes', 'Hold position for desired time'], ARRAY['Don''t let hips sag or rise', 'Breathe normally while holding', 'Keep head in neutral position', 'Start with shorter holds and build up']),
('Running', 'Cardiovascular exercise', 'cardio', ARRAY['legs', 'core'], ARRAY['none'], 'beginner', false, 'https://www.youtube.com/embed/5bEPb4yQhY4', ARRAY['Start with proper running shoes', 'Warm up with light jogging', 'Maintain good posture', 'Land on forefoot, not heel', 'Keep arms at 90-degree angles'], ARRAY['Start slow and build endurance', 'Listen to your body', 'Stay hydrated', 'Include rest days for recovery']),
('Bicep Curls', 'Isolation exercise for biceps', 'strength', ARRAY['biceps'], ARRAY['dumbbell', 'barbell'], 'beginner', false, 'https://www.youtube.com/embed/ykJmrZ5v0Oo', ARRAY['Stand with feet hip-width apart', 'Hold weights with arms at sides', 'Curl weights up to shoulders', 'Squeeze biceps at the top', 'Lower with control'], ARRAY['Keep elbows at your sides', 'Don''t swing the weights', 'Focus on the bicep contraction', 'Use full range of motion']);

-- Insert some basic badges
INSERT INTO public.badges (name, description, category, xp_reward, requirements) VALUES
('First Workout', 'Completed your first workout!', 'consistency', 100, '{"workouts": 1}'),
('Consistency King', 'Worked out for 30 days straight', 'consistency', 500, '{"streak_days": 30}'),
('Iron Master', 'Lifted over 10,000 kg total volume', 'strength', 1000, '{"total_volume": 10000}'),
('Social Butterfly', 'Joined your first community', 'social', 50, '{"communities_joined": 1}'),
('Nutritionist', 'Logged 100 meals', 'nutrition', 300, '{"meals_logged": 100}');

-- Insert some basic foods
INSERT INTO public.foods (name, serving_size_g, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Chicken Breast', 100, 165, 31, 0, 3.6),
('Brown Rice', 100, 111, 2.6, 23, 0.9),
('Banana', 100, 89, 1.1, 23, 0.3),
('Eggs', 100, 155, 13, 1.1, 11),
('Oatmeal', 100, 68, 2.4, 12, 1.4),
('Greek Yogurt', 100, 59, 10, 3.6, 0.4),
('Almonds', 100, 579, 21, 22, 50),
('Salmon', 100, 208, 25, 0, 12),
('Quinoa', 100, 120, 4.4, 22, 1.9),
('Sweet Potato', 100, 86, 1.6, 20, 0.1),
('Broccoli', 100, 34, 2.8, 7, 0.4),
('Avocado', 100, 160, 2, 9, 15),
('Spinach', 100, 23, 2.9, 3.6, 0.4),
('Almond Butter', 100, 614, 21, 19, 56);

-- Insert some sample recipes
INSERT INTO public.recipes (name, description, prep_time_minutes, cook_time_minutes, servings, difficulty_level, cuisine_type, meal_type, is_public, instructions, tags, total_calories, total_protein, total_carbs, total_fat) VALUES
('High-Protein Chicken Bowl', 'A nutritious bowl packed with lean protein and complex carbs', 15, 30, 4, 'easy', 'american', 'lunch', true, ARRAY['Season chicken breast with salt and pepper', 'Cook chicken in a pan until golden brown', 'Prepare quinoa according to package instructions', 'Steam broccoli until tender', 'Slice avocado and prepare other toppings', 'Assemble bowls with quinoa, chicken, broccoli, and avocado'], ARRAY['high-protein', 'meal-prep', 'healthy'], 420, 35, 45, 12),
('Quinoa Power Salad', 'A refreshing salad with quinoa, vegetables, and a light dressing', 20, 5, 2, 'easy', 'mediterranean', 'lunch', true, ARRAY['Cook quinoa and let cool', 'Chop vegetables into bite-sized pieces', 'Mix quinoa with vegetables', 'Prepare lemon vinaigrette', 'Toss salad with dressing', 'Garnish with fresh herbs'], ARRAY['vegetarian', 'fresh', 'light'], 380, 12, 55, 15),
('Protein Smoothie Bowl', 'A thick smoothie bowl topped with fresh fruits and nuts', 10, 0, 1, 'easy', 'american', 'breakfast', true, ARRAY['Blend frozen banana with protein powder', 'Add Greek yogurt and almond milk', 'Blend until thick and creamy', 'Pour into bowl', 'Top with fresh berries and nuts', 'Drizzle with honey if desired'], ARRAY['quick', 'breakfast', 'protein'], 320, 25, 35, 8),
('Salmon with Roasted Vegetables', 'Baked salmon with a medley of roasted seasonal vegetables', 15, 25, 2, 'medium', 'american', 'dinner', true, ARRAY['Preheat oven to 400°F', 'Season salmon with herbs and lemon', 'Cut vegetables into uniform pieces', 'Toss vegetables with olive oil and seasonings', 'Place salmon and vegetables on baking sheet', 'Bake for 20-25 minutes until fish flakes easily'], ARRAY['omega-3', 'roasted', 'healthy'], 450, 30, 25, 28),
('Overnight Oats', 'Make-ahead breakfast oats that are ready in the morning', 10, 0, 1, 'easy', 'american', 'breakfast', true, ARRAY['Mix oats with Greek yogurt and milk', 'Add protein powder and sweetener', 'Stir in chia seeds', 'Refrigerate overnight', 'Top with fresh fruits in the morning', 'Enjoy cold or at room temperature'], ARRAY['make-ahead', 'fiber', 'breakfast'], 280, 20, 35, 6);

-- Insert recipe ingredients
INSERT INTO public.recipe_ingredients (recipe_id, food_id, amount_g) VALUES
(1, 1, 400), -- Chicken breast for chicken bowl
(1, 9, 200), -- Quinoa for chicken bowl
(1, 11, 300), -- Broccoli for chicken bowl
(1, 12, 100), -- Avocado for chicken bowl
(2, 9, 150), -- Quinoa for power salad
(2, 11, 200), -- Broccoli for power salad
(2, 13, 100), -- Spinach for power salad
(2, 12, 80), -- Avocado for power salad
(3, 4, 100), -- Eggs for smoothie bowl
(3, 6, 150), -- Greek yogurt for smoothie bowl
(3, 5, 50), -- Oatmeal for smoothie bowl
(4, 8, 300), -- Salmon for roasted vegetables
(4, 10, 200), -- Sweet potato for roasted vegetables
(4, 11, 150), -- Broccoli for roasted vegetables
(5, 5, 80), -- Oatmeal for overnight oats
(5, 6, 200), -- Greek yogurt for overnight oats
(5, 7, 20); -- Almonds for overnight oats
