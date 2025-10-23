// Simple test to check signup functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zlxbmtpuekcvtmqwfaie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseGJtdHB1ZWtjdnRtcXdmYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk4NzYsImV4cCI6MjA3MDg0NTg3Nn0.ajCrljPdh6OiP93GIl5BmV-howpKzTNpToN3ZqFfOOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log('Testing signup functionality...');
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log('Attempting signup with:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User',
        },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Signup successful!');
      console.log('User:', data.user);
      console.log('Session:', data.session);
      console.log('Email confirmation required:', !data.session);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSignup();
