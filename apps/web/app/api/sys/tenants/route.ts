import { NextResponse } from "next/server";
import { LocalDbController } from "../../../../../../packages/db/src/localDb";

export async function GET(req: Request) {
  try {
    const tenants = await LocalDbController.getAllTenantSettings();
    return NextResponse.json({ success: true, tenants });
  } catch (error: any) {
    console.error("GET sys tenants error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, planId, unlockedFeatures } = body;

    if (!tenantSlug) {
      return NextResponse.json({ success: false, error: "Missing tenantSlug" }, { status: 400 });
    }

    const updates: any = {};
    if (planId !== undefined) updates.planId = planId;
    if (unlockedFeatures !== undefined) updates.unlockedFeatures = unlockedFeatures;

    await LocalDbController.upsertTenantSettings(tenantSlug, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT sys tenants error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
