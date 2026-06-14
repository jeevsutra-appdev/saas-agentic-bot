import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
  const services = await LocalDbController.getBookingServices(tenantSlug);
  return NextResponse.json({ success: true, services });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, ...data } = body;
    if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    const service = await LocalDbController.createBookingService(tenantSlug, {
      name: data.name || "New Service",
      description: data.description || "",
      durationMinutes: data.durationMinutes || 60,
      price: data.price ?? 0,
      offerPrice: data.offerPrice != null && data.offerPrice >= 0 ? data.offerPrice : undefined,
      currency: data.currency || "USD",
      image: data.image || "",
      consultationType: data.consultationType || "online",
      isActive: data.isActive !== false,
      categoryId: data.categoryId || undefined,
      maxAdvanceBookingDays: data.maxAdvanceBookingDays || 30,
      bufferMinutes: data.bufferMinutes || 0
    });
    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, id, ...updates } = body;
    if (!tenantSlug || !id) return NextResponse.json({ error: "Missing tenantSlug or id" }, { status: 400 });
    const service = await LocalDbController.updateBookingService(tenantSlug, id, updates);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const id = searchParams.get("id");
  if (!tenantSlug || !id) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const deleted = await LocalDbController.deleteBookingService(tenantSlug, id);
  return NextResponse.json({ success: deleted });
}
