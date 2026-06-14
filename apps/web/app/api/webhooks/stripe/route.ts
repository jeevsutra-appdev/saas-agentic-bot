export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/payments/stripe";
import { LocalDbController } from "@aether/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No stripe signature found" }, { status: 400 });
  }

  // Developer Bypass Mode: If no Stripe keys, we simulate processing but log a warning.
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("[Developer Bypass] Mocking Stripe Webhook success because STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.");
    return NextResponse.json({ received: true, bypassed: true });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      bodyText,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const tenantSlug = session.client_reference_id || session.metadata?.tenantSlug;
        const creditsToAdd = parseInt(session.metadata?.creditsToAdd || "0", 10);
        const planId = session.metadata?.planId;

        if (tenantSlug && creditsToAdd > 0) {
          const user = await LocalDbController.getUserByTenant(tenantSlug);
          
          if (user) {
            // Update User Credits
            const newBalance = (user.creditsBalance || 0) + creditsToAdd;
            user.creditsBalance = newBalance;
            user.planId = planId;
            await LocalDbController.saveUser(user);

            // Record to Ledger
            await LocalDbController.addCreditLedgerEntry({
              id: uuidv4(),
              tenantSlug,
              delta: creditsToAdd,
              reason: "subscription_renewal",
              refId: session.id,
              balanceAfter: newBalance,
              createdAt: new Date().toISOString()
            });

            // Record Subscription
            if (session.subscription) {
              await LocalDbController.addSubscription({
                id: uuidv4(),
                tenantSlug,
                planId: planId || "unknown",
                provider: "stripe",
                providerSubId: session.subscription,
                status: "active",
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cancelAtPeriodEnd: false
              });
            }

            console.log(`[Stripe Webhook] Successfully added ${creditsToAdd} credits to tenant ${tenantSlug}. New balance: ${newBalance}`);
          }
        }
        break;
      }
      
      case "invoice.payment_succeeded": {
        // Handle recurring subscription renewals
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        // Lookup subscription in LocalDb
        // In a real DB, we'd lookup the tenantSlug by subscriptionId, then grant credits
        console.log(`[Stripe Webhook] Invoice paid for subscription ${subscriptionId}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook processing error: ${error.message}`);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
