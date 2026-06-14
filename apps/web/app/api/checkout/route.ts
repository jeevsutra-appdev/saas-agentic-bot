export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      tenantSlug = "imran-ai", 
      productId, 
      buyerName, 
      buyerEmail, 
      buyerPhone,
      shippingAddress,
      paymentMethod,
      amountCents 
    } = body;

    if (!productId || !buyerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine initial order status
    // If it's Cash on Delivery, it's pending. If it was card, we assume the frontend
    // processed it via Stripe (or we mock it as 'paid' here for demo purposes).
    const status = paymentMethod === "cod" ? "pending" : "paid";

    // Create the order in the database
    const order = await LocalDbController.createOrder(tenantSlug, {
      buyerName: buyerName || "Guest",
      buyerEmail,
      buyerPhone,
      productId,
      amountCents,
      status,
      shippingAddress,
      paymentMethod
    });

    // We can also trigger an email or Webhook here if needed

    return NextResponse.json({ 
      success: true, 
      order 
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
