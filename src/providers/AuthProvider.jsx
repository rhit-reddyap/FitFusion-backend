import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user) { setProfile(null); setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data || null);
      setLoading(false);
    })();
  }, [session]);

  return <AuthCtx.Provider value={{ session, profile, loading }}>{children}</AuthCtx.Provider>;
}