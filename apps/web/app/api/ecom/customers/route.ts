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

  const customers = await LocalDbController.getCustomers(tenantSlug, storeId || undefined);
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantSlug, storeId, name, phone, email, source } = body;
    
    if (!tenantSlug || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCustomer = await LocalDbController.addCustomer({
      tenantSlug,
      storeId,
      name,
      phone,
      email,
      source: source || "online"
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
