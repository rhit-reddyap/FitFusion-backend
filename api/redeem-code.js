import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const { code, token } = req.body || {};
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: { user }, error } = await supa.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    if ((code || '').trim().toLowerCase() !== 'freshmanfriday')
      return res.status(400).json({ ok: false, message: 'Invalid code' });

    await supa.from('profiles').update({ role: 'pro', comp_code: 'freshmanfriday' }).eq('id', user.id);
    return res.json({ ok: true, message: 'Code redeemed — you now have Pro!' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}
