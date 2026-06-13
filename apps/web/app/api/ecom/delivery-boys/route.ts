import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug") || searchParams.get("tenant");
    if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });

    const riders = LocalDbController.getDeliveryBoys(tenantSlug);
    return NextResponse.json({ success: true, riders });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, name, phone, email, vehicle, password, avatarUrl } = body;

    if (!tenantSlug || !name || !phone) {
      return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
    }

    const rider = LocalDbController.createDeliveryBoy(tenantSlug, {
      name,
      phone,
      email: email || undefined,
      vehicle: vehicle || "bike",
      isActive: true,
      isOnline: false,
      totalDeliveries: 0,
      password: password || phone,
      avatarUrl: avatarUrl || undefined,
    });

    return NextResponse.json({ success: true, rider });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, riderId, ...updates } = body;

    if (!tenantSlug || !riderId) {
      return NextResponse.json({ error: "tenantSlug and riderId are required" }, { status: 400 });
    }

    const rider = LocalDbController.updateDeliveryBoy(tenantSlug, riderId, updates);
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    return NextResponse.json({ success: true, rider });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const riderId = searchParams.get("riderId");

    if (!tenantSlug || !riderId) {
      return NextResponse.json({ error: "tenantSlug and riderId are required" }, { status: 400 });
    }

    const ok = LocalDbController.deleteDeliveryBoy(tenantSlug, riderId);
    return NextResponse.json({ success: ok });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
