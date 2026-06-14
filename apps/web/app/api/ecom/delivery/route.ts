import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const action = searchParams.get("action");
    const riderId = searchParams.get("riderId");

    if (!tenantSlug || !riderId) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const orders = await LocalDbController.getOrders(tenantSlug);
    const riderOrders = orders.filter((o: any) => o.deliveryBoyId === riderId);

    if (action === "get_history") {
      const delivered = riderOrders.filter((o: any) => o.deliveryStatus === "delivered" || o.status === "delivered" || o.deliveryStatus === "Delivered");
      return NextResponse.json({ success: true, orders: delivered });
    }

    // Default: active orders (not yet delivered)
    const active = riderOrders.filter((o: any) => o.deliveryStatus !== "delivered" && o.deliveryStatus !== "Delivered");
    return NextResponse.json({ success: true, orders: active });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, tenantSlug } = body;

    if (!tenantSlug) {
      return NextResponse.json({ success: false, error: "Missing tenant slug" }, { status: 400 });
    }

    if (action === "login") {
      const { phone, password } = body;
      const riders = await LocalDbController.getDeliveryBoys(tenantSlug);
      const rider = riders.find(
        (s: any) => s.phone === phone || s.id === phone || s.email === phone
      );

      if (rider && rider.password === password) {
        if (!rider.isActive) {
          return NextResponse.json({ success: false, error: "Account is inactive." });
        }
        const { password: _, ...safeRider } = rider;
        return NextResponse.json({ success: true, rider: safeRider });
      } else {
        return NextResponse.json({ success: false, error: "Invalid credentials or not a delivery rider" });
      }
    }

    if (action === "update_status") {
      const { orderId, status } = body;
      const orders = await LocalDbController.getOrders(tenantSlug);
      const order = orders.find((o: any) => o.id === orderId);

      if (order) {
        const updates: any = { deliveryStatus: status };
        if (status === "Delivered" || status === "delivered") {
          updates.status = "delivered";
          updates.deliveredAt = new Date().toISOString();
        }
        await LocalDbController.updateOrder(tenantSlug, orderId, updates);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    if (action === "extend_time") {
      const { orderId, extraMinutes } = body;
      if (!orderId || !extraMinutes) {
        return NextResponse.json({ success: false, error: "Missing orderId or extraMinutes" });
      }
      const orders = await LocalDbController.getOrders(tenantSlug);
      const order = orders.find((o: any) => o.id === orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found" });
      }
      const currentDeadline = order.deliveryDeadlineMinutes || order.prepTimeMinutes || 30;
      const newDeadline = currentDeadline + extraMinutes;
      await LocalDbController.updateOrder(tenantSlug, orderId, {
        deliveryDeadlineMinutes: newDeadline
      });
      return NextResponse.json({ success: true, newDeadlineMinutes: newDeadline });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
