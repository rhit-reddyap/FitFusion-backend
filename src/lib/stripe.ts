import Stripe from "stripe";

// Match the version that the installed `stripe` types expect.
// (You can bump the package later if you want a newer API surface.)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});
