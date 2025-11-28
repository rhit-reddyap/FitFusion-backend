// Development mode configuration
export const DEV_MODE = process.env.NODE_ENV === 'development';

// Mock admin user for development
export const MOCK_ADMIN_USER = {
  id: 'admin-123',
  email: 'admin@fitnesspro.com',
  user_metadata: {
    display_name: 'Admin User',
    avatar_url: null
  }
};

// Mock profile for admin
export const MOCK_ADMIN_PROFILE = {
  id: 'admin-123',
  email: 'admin@fitnesspro.com',
  display_name: 'Admin User',
  avatar_url: null,
  bio: 'Fit Fusion AI Admin',
  date_of_birth: '1990-01-01',
  height_cm: 180,
  weight_kg: 75,
  activity_level: 'active',
  fitness_goals: ['strength', 'muscle_gain'],
  preferred_units: 'metric',
  timezone: 'UTC',
  privacy_settings: {
    share_data: true,
    public_profile: true
  },
  subscription_tier: 'premium',
  xp_points: 10000,
  level: 10,
  streak_days: 30,
  last_activity_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
