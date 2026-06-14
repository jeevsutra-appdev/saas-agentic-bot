import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

// POST /api/delivery
// body: { action: "login", tenantSlug, id, password }
// body: { action: "get_dashboard", tenantSlug, id }
// body: { action: "update_status", tenantSlug, orderId, riderId, status }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, tenantSlug, id, password, orderId, status, riderId } = body;

    if (!tenantSlug) {
      return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
    }

    if (action === "login") {
      if (!id || !password) return NextResponse.json({ error: "id and password required" }, { status: 400 });
      const rider = await LocalDbController.loginDeliveryBoy(tenantSlug, id, password);
      if (!rider) return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
      return NextResponse.json({ success: true, rider });
    }

    if (action === "get_dashboard") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
      const rider = (await LocalDbController.getDeliveryBoys(tenantSlug)).find(r => r.id === id);
      if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

      // Calculate stats based on orders
      // Workaround: We'll fetch orders from LocalDbController manually if there's no helper
      const db = (LocalDbController as any).read();
      const allOrders = db.orders.filter((o: any) => o.tenantSlug === tenantSlug && o.deliveryBoyId === id);
      
      const pendingOrders = allOrders.filter((o: any) => ["assigned", "picked_up", "processing", "ready", "out_for_delivery"].includes(o.status || "") || ["assigned", "picked_up"].includes(o.deliveryStatus || ""));
      const completedOrders = allOrders.filter((o: any) => o.status === "delivered" || o.deliveryStatus === "delivered");
      const cancelledOrders = allOrders.filter((o: any) => o.status === "cancelled");
      
      const today = new Date().toISOString().split("T")[0];
      const todaysCompleted = completedOrders.filter((o: any) => o.createdAt.startsWith(today));
      const orderValue = todaysCompleted.reduce((acc: number, o: any) => acc + (o.amountCents || 0), 0) / 100;

      return NextResponse.json({ 
        success: true, 
        rider,
        stats: {
          pendingCount: pendingOrders.length,
          todaysDeliveries: todaysCompleted.length,
          cancelledCount: cancelledOrders.length,
          orderValueToday: orderValue
        },
        pendingOrders: pendingOrders
      });
    }

    if (action === "update_status") {
      if (!orderId || !status || !riderId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      
      const db = (LocalDbController as any).read();
      const orderIdx = db.orders.findIndex((o: any) => o.id === orderId && o.tenantSlug === tenantSlug);
      
      if (orderIdx === -1) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      
      const order = db.orders[orderIdx];
      if (order.deliveryBoyId !== riderId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

      order.deliveryStatus = status;
      if (status === "delivered") {
        order.status = "delivered";
        // update delivery boy stats
        const riderIdx = db.deliveryBoys.findIndex((d: any) => d.id === riderId);
        if (riderIdx > -1) {
          db.deliveryBoys[riderIdx].totalDeliveries = (db.deliveryBoys[riderIdx].totalDeliveries || 0) + 1;
        }
      } else if (status === "picked_up") {
        order.status = "out_for_delivery";
      }

      (LocalDbController as any).write(db);

      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
