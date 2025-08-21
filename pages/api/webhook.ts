
import { buffer } from "micro";
import Stripe from "stripe";
import { supabase } from "../../lib/supabaseClient";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      await supabase.from("users").update({
        is_pro: true,
        stripe_customer_id: session.customer,
      }).eq("id", session.client_reference_id);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      await supabase.from("users").update({
        is_pro: false,
      }).eq("stripe_customer_id", subscription.customer);
      break;
    }
  }

  res.status(200).end();
}
