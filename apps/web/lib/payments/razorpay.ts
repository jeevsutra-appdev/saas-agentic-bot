import Razorpay from "razorpay";

export const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/**
 * Creates a Razorpay Order for a subscription/topup.
 * Since Razorpay Subscriptions API is complex, for this checkout phase we generate 
 * a standard Order and treat it as a prepaid billing cycle or top-up.
 */
export async function createRazorpayOrder(
  planId: string, 
  tenantSlug: string, 
  priceInr: number,
  creditsToAdd: number
) {
  if (!razorpay) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Use Developer Bypass.");
  }

  const options = {
    amount: priceInr * 100, // Razorpay expects paise (cents)
    currency: "INR",
    receipt: `rcpt_${tenantSlug}_${Date.now()}`,
    notes: {
      tenantSlug,
      planId,
      creditsToAdd: creditsToAdd.toString()
    }
  };

  const order = await razorpay.orders.create(options);
  return order;
}
