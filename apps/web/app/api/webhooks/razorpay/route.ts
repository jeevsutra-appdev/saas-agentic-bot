import { NextResponse } from "next/server";
import crypto from "crypto";
import { LocalDbController } from "@aether/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "No Razorpay signature found" }, { status: 400 });
  }

  // Developer Bypass Mode: If no Razorpay secret, simulate processing.
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn("[Developer Bypass] Mocking Razorpay Webhook success because RAZORPAY_WEBHOOK_SECRET is missing.");
    return NextResponse.json({ status: "ok", bypassed: true });
  }

  // Verify Razorpay HMAC Signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(bodyText)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Razorpay webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(bodyText);

    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const payment = event.payload.payment.entity;
        
        // Extract metadata from the notes field (passed during order creation)
        const notes = payment.notes || {};
        const tenantSlug = notes.tenantSlug;
        const creditsToAdd = parseInt(notes.creditsToAdd || "0", 10);
        const planId = notes.planId;

        if (tenantSlug && creditsToAdd > 0) {
          const user = LocalDbController.getUserByTenant(tenantSlug);
          
          if (user) {
            // Update User Credits
            const newBalance = (user.creditsBalance || 0) + creditsToAdd;
            user.creditsBalance = newBalance;
            user.planId = planId;
            LocalDbController.saveUser(user);

            // Record to Ledger
            LocalDbController.addCreditLedgerEntry({
              id: uuidv4(),
              tenantSlug,
              delta: creditsToAdd,
              reason: "subscription_renewal",
              refId: payment.id,
              balanceAfter: newBalance,
              createdAt: new Date().toISOString()
            });

            console.log(`[Razorpay Webhook] Successfully added ${creditsToAdd} credits to tenant ${tenantSlug}. New balance: ${newBalance}`);
          }
        }
        break;
      }
      
      case "subscription.charged": {
        // Handle recurring subscriptions
        console.log(`[Razorpay Webhook] Subscription charged for ${event.payload.subscription.entity.id}`);
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error(`Razorpay webhook processing error: ${error.message}`);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
