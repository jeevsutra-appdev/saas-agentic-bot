import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const leads = await LocalDbController.getLeadsByTenant(tenantSlug);
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, name, email, phone, countryCode, type, details } = body;

    if (!tenantSlug || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields (tenantSlug, name, phone)" }, { status: 400 });
    }

    // Check if lead exists to update instead of duplicate
    let lead = null;
    const existingLeads = await LocalDbController.getLeadsByTenant(tenantSlug);
    const existing = existingLeads.find(l => l.phone === phone);
    
    if (existing) {
      lead = await LocalDbController.updateLead(tenantSlug, phone, {
        name,
        email: email || existing.email,
        countryCode: countryCode || existing.countryCode,
        type: type || existing.type,
        details: details || existing.details,
        status: existing.status === "new" ? "interested" : existing.status
      });
    } else {
      lead = await LocalDbController.addLead({
        tenantSlug,
        name,
        email: email || "",
        phone,
        countryCode: countryCode || "",
        type: type || "general",
        status: "new",
        details: details || "",
        inquiryDetails: ""
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
