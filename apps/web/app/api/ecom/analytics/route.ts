import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const events = LocalDbController.getAnalytics(tenantSlug);
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, eventType, productId, country, region, userAgent } = body;

    if (!tenantSlug || !eventType) {
      return NextResponse.json({ error: "Missing tenantSlug or eventType" }, { status: 400 });
    }

    const event = LocalDbController.logAnalyticsEvent(tenantSlug, {
      eventType,
      productId,
      country,
      region,
      userAgent
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
