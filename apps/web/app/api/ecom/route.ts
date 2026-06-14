import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || "imran-ai";
    const storeId = searchParams.get("storeId") || searchParams.get("shopId") || undefined;

    const storefronts = await LocalDbController.getStorefrontsByTenant(tenantSlug);
    let activeStoreId = storeId;
    if (!activeStoreId && storefronts.length > 0) {
      if (storefronts.length === 1) {
        activeStoreId = storefronts[0].id;
      }
    }

    const categories = await LocalDbController.getCategoriesByTenant(tenantSlug, activeStoreId);
    const storefront = await LocalDbController.getStorefrontByTenant(tenantSlug, activeStoreId);
    const products = await LocalDbController.getProductsByTenant(tenantSlug, activeStoreId);

    let assignedAgent = null;
    if (storefront?.assignedAgentId) {
      const allAgents = await LocalDbController.getAgentsByTenant(tenantSlug);
      assignedAgent = allAgents.find(a => a.id === storefront.assignedAgentId) || null;
    }

    return NextResponse.json({
      success: true,
      categories,
      storefront,
      products,
      storefronts,
      assignedAgent
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch e-commerce records." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, tenantSlug = "imran-ai", ...data } = body;

    if (action === "create_category") {
      const category = await LocalDbController.addCategory({
        tenantSlug,
        storeId: data.storeId || undefined,
        name: data.name,
        description: data.description || "",
        tags: data.tags || [],
        image: data.image || ""
      });
      return NextResponse.json({ success: true, category });
    } 
    
    else if (action === "update_category") {
      const category = await LocalDbController.updateCategory(data.id, tenantSlug, {
        name: data.name,
        description: data.description || "",
        tags: data.tags || [],
        image: data.image || "",
        storeId: data.storeId || undefined
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, category });
    }

    else if (action === "delete_category") {
      const success = await LocalDbController.deleteCategory(data.id, tenantSlug);
      if (!success) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    
    else if (action === "update_storefront") {
      const storefront = await LocalDbController.upsertStorefront({
        tenantSlug,
        id: data.id || undefined,
        ...data
      });
      return NextResponse.json({ success: true, storefront });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save e-commerce data." },
      { status: 500 }
    );
  }
}
