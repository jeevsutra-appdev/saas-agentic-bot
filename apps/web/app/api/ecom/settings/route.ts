export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db/src/localDb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      action, storeId, shopId, tenantSlug, companyName, storeLanguage, storeDescription, globalCurrency,
      brandLogo, brandLogoHeight, heroImage, primaryColor, accentColor, heroType, enableFooterNav, assignedAgentId,
      paymentProvider, stripePublicKey, stripeSecretKey, razorpayKeyId, razorpayKeySecret,
      shippingRate, freeShippingThreshold, estimatedDeliveryDays,
      featuredProductIds, promoBannerImage, promoBannerText, promoBannerLink, kitchenOffers, foodCombos, layoutSequence,
      template, themePreset, storeType, posEnabled, posThemeColor, posUpiId, posPrinterType, posPaperSize
    } = body;

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const activeStoreId = storeId || shopId || undefined;

    if (action === "create_store") {
      const storefront = await LocalDbController.createStorefront(tenantSlug, {
        companyName: companyName || "New Premium Shop",
        template: template || "retail",
        themePreset: themePreset || "nimbus",
        globalCurrency: globalCurrency || "USD",
        primaryColor: primaryColor || "#6366f1",
        accentColor: accentColor || "#10b981",
        layoutSequence: layoutSequence || ["categories", "hero", "sale", "featured", "products"],
        storeType: storeType || "ecom",
        posEnabled: posEnabled !== undefined ? posEnabled : false
      });
      return NextResponse.json({ success: true, storefront });
    }

    const rawUpdates: any = {
      companyName,
      storeLanguage,
      storeDescription,
      globalCurrency,
      brandLogo,
      brandLogoHeight,
      heroImage,
      primaryColor,
      accentColor,
      heroType,
      enableFooterNav,
      assignedAgentId,
      paymentProvider,
      stripePublicKey,
      stripeSecretKey,
      razorpayKeyId,
      razorpayKeySecret,
      shippingRate,
      freeShippingThreshold,
      estimatedDeliveryDays,
      featuredProductIds,
      promoBannerImage,
      promoBannerText,
      promoBannerLink,
      kitchenOffers,
      foodCombos,
      layoutSequence,
      template,
      themePreset,
      storeType,
      posEnabled,
      posThemeColor,
      posUpiId,
      posPrinterType,
      posPaperSize
    };

    // Remove undefined properties so they don't overwrite existing db fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(rawUpdates).filter(([_, v]) => v !== undefined)
    );

    const storefront = await LocalDbController.updateStorefront(tenantSlug, cleanUpdates, activeStoreId);

    return NextResponse.json({ success: true, storefront });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
