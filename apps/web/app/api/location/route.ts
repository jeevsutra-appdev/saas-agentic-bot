export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { tenantSlug, riderId, orderId, lat, lng, accuracy } = body;
  if (!tenantSlug || !riderId || lat == null || lng == null)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await LocalDbController.updateRiderLocation({
    riderId,
    tenantSlug,
    orderId,
    lat,
    lng,
    accuracy,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const riderId = searchParams.get("riderId");
  if (!tenantSlug)
    return NextResponse.json({ error: "tenantSlug required" }, { status: 400 });

  if (riderId) {
    const loc = await LocalDbController.getRiderLocation(tenantSlug, riderId);
    return NextResponse.json({ success: true, location: loc });
  }

  const locations = await LocalDbController.getAllRiderLocations(tenantSlug);
  return NextResponse.json({ success: true, locations });
}
