// Test script to check database constraints
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zlxbmtpuekcvtmqwfaie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGJtdHB1ZWtjdnRtcXdmYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk4NzYsImV4cCI6MjA3MDg0NTg3Nn0.ajCrljPdh6OiP93GIl5BmV-howpKzTNpToN3ZqFfOOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConstraints() {
  console.log('Testing database constraints...');
  
  try {
    // Test 1: Check if we can query the profiles table
    console.log('\n1. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Error accessing profiles table:', profilesError);
    } else {
      console.log('Profiles table accessible:', profiles);
    }
    
    // Test 2: Check the table structure
    console.log('\n2. Testing table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('Table structure error:', tableError);
    } else {
      console.log('Table structure accessible');
    }
    
    // Test 3: Try to insert a test profile with a known user ID
    console.log('\n3. Testing profile insertion...');
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000', // Test UUID
      email: 'test@example.com',
      display_name: 'Test User',
      is_premium: false,
      is_admin: false,
      promo_codes_used: []
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile);
    
    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
    } else {
      console.log('Insert successful:', insertData);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testConstraints();
