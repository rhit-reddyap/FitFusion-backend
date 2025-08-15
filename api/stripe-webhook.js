import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Vercel Node serverless fn: read raw body for Stripe signature verification
async function readBuffer(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export const config = {
  // This hint is mainly for Next.js API routes. Vercel plain functions ignore it,
  // but keeping it does no harm and clarifies intent.
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    const buf = await readBuffer(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.user_id;
        if (userId) await supa.from('profiles').update({ role: 'pro' }).eq('id', userId);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.user_id;
        if (userId) {
          const nextRole = sub.status === 'active' ? 'pro' : 'free';
          await supa.from('profiles').update({ role: nextRole }).eq('id', userId);
        }
        break;
      }
      default:
        // ignore other events
        break;
    }

    return res.json({ received: true });
  } catch (e) {
    console.error('Webhook handler error:', e);
    return res.status(500).send('Server error');
  }
}
