export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tenantSlug = url.searchParams.get("tenantSlug");
  const storeId = url.searchParams.get("storeId");
  
  if (!tenantSlug) {
    return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
  }

  const orders = await LocalDbController.getOrders(tenantSlug, storeId || undefined);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, ...orderData } = body;
    
    if (!tenantSlug) {
      return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
    }

    const newOrder = await LocalDbController.createOrder(tenantSlug, orderData);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, orderId, ...updates } = body;
    
    if (!tenantSlug || !orderId) {
      return NextResponse.json({ error: "tenantSlug and orderId are required" }, { status: 400 });
    }

    const updatedOrder = await LocalDbController.updateOrder(tenantSlug, orderId, updates);
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
