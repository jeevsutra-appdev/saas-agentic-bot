import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const serviceId = searchParams.get("serviceId") || undefined;
  if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
  const schedules = await LocalDbController.getBookingSchedules(tenantSlug, serviceId);
  return NextResponse.json({ success: true, schedules });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, schedules } = body;
    if (!tenantSlug || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Missing tenantSlug or schedules array" }, { status: 400 });
    }
    const saved = await LocalDbController.upsertBookingSchedules(tenantSlug, schedules);
    return NextResponse.json({ success: true, schedules: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
