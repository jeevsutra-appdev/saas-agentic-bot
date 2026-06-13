import Stripe from "stripe";

// Initialize Stripe with the secret key from env
// If not present, we will gracefully fallback in the caller using "Developer Bypass Mode"
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia", // Latest Stripe API version
      typescript: true,
    })
  : null;

/**
 * Creates a Stripe Checkout Session for a subscription plan.
 */
export async function createStripeCheckout(
  planId: string, 
  tenantSlug: string, 
  priceUsd: number,
  creditsToAdd: number
) {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is missing. Use Developer Bypass.");
  }

  // We use the Tenant Slug as the client reference ID so we can match it in the webhook
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    client_reference_id: tenantSlug,
    metadata: {
      tenantSlug,
      planId,
      creditsToAdd: creditsToAdd.toString()
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Aether AI - ${planId.toUpperCase()} Plan`,
            description: `${creditsToAdd.toLocaleString()} AI Credits / month`,
          },
          unit_amount: priceUsd * 100, // Stripe expects cents
          recurring: {
            interval: "month"
          }
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4022'}/c/${tenantSlug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4022'}/c/${tenantSlug}?payment=canceled`,
  });

  return session.url;
}
