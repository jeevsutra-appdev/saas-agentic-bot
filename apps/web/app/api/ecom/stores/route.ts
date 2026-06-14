import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug") || searchParams.get("tenant");
    const storeSlug = searchParams.get("storeSlug");
    if (!tenantSlug) return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });

    if (storeSlug) {
      const store = await LocalDbController.getStoreBySlug(tenantSlug, storeSlug);
      if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
      return NextResponse.json({ success: true, store });
    }

    const stores = await LocalDbController.getStores(tenantSlug);
    return NextResponse.json({ success: true, stores });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, storeSlug, name, description, image, storeType, primaryColor, currency, settings } = body;

    if (!tenantSlug || !name || !storeType) {
      return NextResponse.json({ error: "tenantSlug, name, and storeType are required" }, { status: 400 });
    }

    const slug = storeSlug || name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40);

    const store = await LocalDbController.createStore({
      tenantSlug,
      storeSlug: slug,
      name,
      description: description || "",
      image: image || "",
      storeType,
      isActive: true,
      primaryColor: primaryColor || "#6366f1",
      currency: currency || "USD",
      settings: settings || {}
    });

    return NextResponse.json({ success: true, store });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, storeId, ...updates } = body;

    if (!tenantSlug || !storeId) {
      return NextResponse.json({ error: "tenantSlug and storeId are required" }, { status: 400 });
    }

    const store = await LocalDbController.updateStore(tenantSlug, storeId, updates);
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    return NextResponse.json({ success: true, store });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const storeId = searchParams.get("storeId");

    if (!tenantSlug || !storeId) {
      return NextResponse.json({ error: "tenantSlug and storeId are required" }, { status: 400 });
    }

    const ok = await LocalDbController.deleteStore(tenantSlug, storeId);
    return NextResponse.json({ success: ok });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
