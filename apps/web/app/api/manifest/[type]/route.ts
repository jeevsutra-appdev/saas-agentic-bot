export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(request: Request, { params }: { params: { type: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant");
    const storeId = searchParams.get("storeId");
    
    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenant slug" }, { status: 400 });
    }

    const type = params.type; // 'delivery' or 'scanner'
    let storeName = "Aether";
    let storeLogo = "/aether-logo.png";
    let primaryColor = "#4f46e5"; // default indigo
    let bgColor = "#1e1e2d";

    const storefronts = await LocalDbController.getStorefrontsByTenant(tenantSlug);
    let activeStoreId = storeId;
    if (!activeStoreId && storefronts.length > 0) {
      activeStoreId = storefronts[0].id;
    }

    if (activeStoreId) {
      const storefront = await LocalDbController.getStorefrontByTenant(tenantSlug, activeStoreId);
      if (storefront) {
        storeName = storefront.companyName || storeName;
        storeLogo = storefront.brandLogo || storeLogo;
        primaryColor = storefront.primaryColor || primaryColor;
      }
    }

    let appName = "";
    let startUrl = "";
    
    if (type === "delivery") {
      appName = `${storeName} - Delivery`;
      startUrl = `/b/${tenantSlug}/delivery`;
    } else if (type === "scanner") {
      appName = `${storeName} - Scanner`;
      startUrl = `/b/${tenantSlug}/scanner`;
    } else {
      return NextResponse.json({ error: "Invalid manifest type" }, { status: 400 });
    }

    const manifest = {
      name: appName,
      short_name: appName,
      description: `Standalone ${type} app for ${storeName}`,
      start_url: startUrl,
      display: "standalone",
      background_color: bgColor,
      theme_color: primaryColor,
      icons: [
        {
          src: storeLogo,
          sizes: "192x192 512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    return NextResponse.json(manifest);
  } catch (err: any) {
    console.error("Manifest generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
