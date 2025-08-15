import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } }; // Vercel

function readBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const buf = await readBuffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerId = session.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    if (userId) await supa.from('profiles').update({ role: 'pro' }).eq('id', userId);
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object;
    const customerId = sub.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    if (userId) {
      const nextRole = sub.status === 'active' ? 'pro' : 'free';
      await supa.from('profiles').update({ role: nextRole }).eq('id', userId);
    }
  }

  res.json({ received: true });
}
