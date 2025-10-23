// Test Supabase connection and profile table structure
import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('📊 Sample profile data:', data);
    
    // Check if we have any profiles
    if (data && data.length > 0) {
      const profile = data[0];
      console.log('📋 Available columns in profiles table:');
      Object.keys(profile).forEach(key => {
        console.log(`  - ${key}: ${typeof profile[key]} = ${profile[key]}`);
      });
    } else {
      console.log('⚠️ No profiles found in database');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
};

export const testProfileUpdate = async (userId) => {
  console.log(`🔍 Testing profile update for user: ${userId}`);
  
  try {
    // Try to update is_premium to true
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('❌ Profile update error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Profile update successful!', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Profile update failed:', err);
    return { success: false, error: err };
  }
};


















