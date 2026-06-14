export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug") || searchParams.get("tenant");
    if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });

    const posManagers = await LocalDbController.getPosManagers(tenantSlug);
    // Return full manager objects including password for Admin view/edit
    return NextResponse.json({ success: true, managers: posManagers });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, tenantSlug, storeId, name, phone, password, id, avatar } = body;

    if (!tenantSlug) return NextResponse.json({ success: false, error: "Missing tenantSlug" }, { status: 400 });

    if (action === "login") {
      if (!phone || !password) return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 400 });
      const posManagers = await LocalDbController.getPosManagers(tenantSlug);
      const matched = posManagers.find(m => m.phone === phone && m.password === password && m.isActive);
      
      if (matched) {
        const { password: _, ...safeManager } = matched;
        return NextResponse.json({ success: true, manager: safeManager });
      }
      return NextResponse.json({ success: false, error: "Invalid credentials or inactive account." }, { status: 401 });
    }

    if (action === "create") {
      const newManager = await LocalDbController.createPosManager(tenantSlug, {
        name,
        phone,
        password,
        storeId,
        avatar,
        isActive: true
      });
      return NextResponse.json({ success: true, manager: newManager });
    }

    if (action === "update") {
      if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
      const updated = await LocalDbController.updatePosManager(tenantSlug, id, body);
      return NextResponse.json({ success: true, manager: updated });
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
      const deleted = await LocalDbController.deletePosManager(tenantSlug, id);
      return NextResponse.json({ success: deleted });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
