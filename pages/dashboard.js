import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);
  return <div>{user ? `Hello, ${user.email}` : 'Not logged in'}</div>;
}