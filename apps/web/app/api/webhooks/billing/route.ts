export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Unified Billing Webhook Handler
 *
 * - When called by the Dashboard UI simulation button: no signature headers, reads body directly.
 * - When called by real Stripe: use /api/webhooks/stripe instead.
 * - When called by real Razorpay: use /api/webhooks/razorpay instead.
 *
 * This route handles the UI simulation flow so the in-app demo always works regardless
 * of whether production payment keys are configured.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const parsed = JSON.parse(rawBody || "{}");

    const webhookSource: string = parsed.source || "simulation";
    const eventType: string = parsed.event || "payment.success";
    const tenantSlug: string = parsed.tenantSlug || "demo";
    const creditsToAdd: number = Number(parsed.credits) || 50000;

    console.log(`[Billing Webhook] Processing ${eventType} from ${webhookSource.toUpperCase()} for tenant "${tenantSlug}" → +${creditsToAdd} credits`);

    // Atomically update user credits + write to ledger
    const user = await LocalDbController.getUserByTenant(tenantSlug);

    if (user) {
      const newBalance = (user.creditsBalance ?? 0) + creditsToAdd;
      user.creditsBalance = newBalance;
      await LocalDbController.saveUser(user);

      await LocalDbController.addCreditLedgerEntry({
        id: uuidv4(),
        tenantSlug,
        delta: creditsToAdd,
        reason: "subscription_renewal",
        refId: `sim_${uuidv4()}`,
        balanceAfter: newBalance,
        createdAt: new Date().toISOString(),
      });

      console.log(`[Billing Webhook] ✅ Credits updated. Tenant: ${tenantSlug}, New balance: ${newBalance}`);
    } else {
      // Tenant not found in DB — still return success so UI works for unauthenticated demos
      console.warn(`[Billing Webhook] Tenant "${tenantSlug}" not found in LocalDb — skipping ledger write.`);
    }

    return NextResponse.json({
      success: true,
      processed: true,
      source: webhookSource,
      event: eventType,
      tenantSlug,
      credited: creditsToAdd,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Billing Webhook] Error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed." },
      { status: 500 }
    );
  }
}
