import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  async function signIn() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }
  return <button onClick={signIn}>Sign In with Google</button>;
}