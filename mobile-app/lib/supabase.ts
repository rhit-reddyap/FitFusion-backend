import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlxbmtpuekcvtmqwfaie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGJtdHB1ZWtjdnRtcXdmYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk4NzYsImV4cCI6MjA3MDg0NTg3Nn0.ajCrljPdh6OiP93GIl5BmV-howpKzTNpToN3ZqFfOOM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  display_name: string;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  subscription_id?: string;
  promo_codes_used: string[];
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_name: string;
  exercises: any[];
  duration: number;
  calories_burned: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_end: string;
  plan_id: string;
  created_at: string;
  updated_at: string;
}


















