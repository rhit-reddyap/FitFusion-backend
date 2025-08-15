import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../providers/AuthProvider';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
  const { session } = useAuth();

  const goCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ token: session?.access_token })
    });
    const { id, error } = await res.json();
    if (error) return alert(error);
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: id });
  };

  return (
    <div className="mx-auto max-w-md p-6 space-y-4 text-gray-100">
      <h1 className="text-3xl font-extrabold text-emerald-400">Fusion Pro — $5/month</h1>
      <ul className="list-disc list-inside text-sm opacity-90">
        <li>AI Coach + weekly metabolism</li>
        <li>Advanced analytics</li>
        <li>Unlimited tracking</li>
      </ul>
      <button onClick={goCheckout} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold">Continue to checkout</button>

      <RedeemCode />
    </div>
  );
}

function RedeemCode() {
  const { session } = useAuth();
  const redeem = async (e) => {
    e.preventDefault();
    const code = new FormData(e.currentTarget).get('code');
    const r = await fetch('/api/redeem-code', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ code, token: session?.access_token })
    });
    const out = await r.json();
    alert(out.message || 'Done');
    if (out.ok) window.location.href = '/';
  };
  return (
    <form onSubmit={redeem} className="mt-6 space-x-2">
      <input name="code" placeholder="Have a code?" className="px-3 py-2 rounded-lg text-slate-900" />
      <button className="rounded-lg bg-slate-200 text-slate-900 px-3 py-2 font-semibold">Redeem</button>
    </form>
  );
}
