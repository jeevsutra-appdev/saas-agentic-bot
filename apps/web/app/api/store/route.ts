export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || "imran-ai";

    const storeId = searchParams.get("storeId") || searchParams.get("shopId") || undefined;
    const products = await LocalDbController.getProductsByTenant(tenantSlug, storeId);
    const appointments = await LocalDbController.getAppointmentsByTenant(tenantSlug);

    return NextResponse.json({
      success: true,
      products,
      appointments
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch store dashboard records." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, priceUSD, stock, sku, barcode, description, image, tenantSlug, storeId, shopId, categoryId, isService, isDigital, digitalFileLink, currency, upsellProductId, downsellProductId, orderBumpProductId, orderBumpPrice, isStandaloneLandingPage, compareAtPriceUSD, tags } = body;

    if (!name || !priceUSD) {
      return NextResponse.json(
        { error: "Missing required 'name' or 'priceUSD' fields." },
        { status: 400 }
      );
    }

    const targetSlug = tenantSlug || "imran-ai";
    const priceCents = Math.round(parseFloat(priceUSD) * 100);

    const product = await LocalDbController.addProduct({
      tenantSlug: targetSlug,
      storeId: storeId || shopId || undefined,
      name,
      price: priceCents,
      description: description || "",
      image: image || "",
      categoryId: categoryId || undefined,
      isService: isService === true,
      isDigital: isDigital === true,
      digitalFileLink: digitalFileLink || undefined,
      currency: currency || "USD",
      stock: stock !== undefined ? parseInt(stock) : undefined,
      sku: sku || undefined,
      upsellProductId: upsellProductId || undefined,
      downsellProductId: downsellProductId || undefined,
      orderBumpProductId: orderBumpProductId || undefined,
      orderBumpPrice: orderBumpPrice ? Math.round(parseFloat(orderBumpPrice) * 100) : undefined,
      compareAtPrice: compareAtPriceUSD ? Math.round(parseFloat(compareAtPriceUSD) * 100) : undefined,
      isStandaloneLandingPage: isStandaloneLandingPage === true,
      tags: tags || []
    });

    console.log(`[Store] Created new product: "${name}" ($${priceUSD})`);

    return NextResponse.json({
      success: true,
      message: "Product added to tenant catalog successfully.",
      product
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save product in store catalog." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, tenantSlug, storeId, shopId, name, priceUSD, stock, sku, barcode, description, image, categoryId, isService, isDigital, digitalFileLink, currency, upsellProductId, downsellProductId, orderBumpProductId, orderBumpPrice, isStandaloneLandingPage, compareAtPriceUSD, tags } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required for update." }, { status: 400 });
    }

    const targetSlug = tenantSlug || "imran-ai";
    const updates: any = {};

    if (storeId !== undefined) updates.storeId = storeId;
    if (shopId !== undefined) updates.storeId = shopId;
    if (name) updates.name = name;
    if (priceUSD) updates.price = Math.round(parseFloat(priceUSD) * 100);
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (isService !== undefined) updates.isService = isService;
    if (isDigital !== undefined) updates.isDigital = isDigital;
    if (digitalFileLink !== undefined) updates.digitalFileLink = digitalFileLink;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (sku !== undefined) updates.sku = sku;
    if (barcode !== undefined) updates.barcode = barcode;
    if (currency) updates.currency = currency;
    if (upsellProductId !== undefined) updates.upsellProductId = upsellProductId;
    if (downsellProductId !== undefined) updates.downsellProductId = downsellProductId;
    if (orderBumpProductId !== undefined) updates.orderBumpProductId = orderBumpProductId;
    if (orderBumpPrice !== undefined) updates.orderBumpPrice = orderBumpPrice ? Math.round(parseFloat(orderBumpPrice) * 100) : undefined;
    if (compareAtPriceUSD !== undefined) updates.compareAtPrice = compareAtPriceUSD ? Math.round(parseFloat(compareAtPriceUSD) * 100) : undefined;
    if (isStandaloneLandingPage !== undefined) updates.isStandaloneLandingPage = isStandaloneLandingPage;
    if (tags !== undefined) updates.tags = tags;

    const updatedProduct = await LocalDbController.updateProduct(id, targetSlug, updates);

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found or unauthorized." }, { status: 404 });
    }

    console.log(`[Store] Updated product: "${name || id}"`);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = searchParams.get("tenantSlug") || "imran-ai";

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const deleted = await LocalDbController.deleteProduct(id, tenantSlug);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully." });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete product." },
      { status: 500 }
    );
  }
}
