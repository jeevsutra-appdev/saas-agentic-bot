export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "../../../../../../packages/db/src/localDb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const page = await LocalDbController.getLandingPage(id, tenantSlug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("GET Landing Page Error:", error);
    return NextResponse.json({ error: "Failed to fetch landing page" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenantSlug, pageTree, settings } = body;

    if (!tenantSlug || !pageTree) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let page = await LocalDbController.getLandingPage(id, tenantSlug);
    if (!page) {
      // Create new
      page = await LocalDbController.createLandingPage(tenantSlug, {
        name: `Funnel Page ${id}`,
        slug: id,
        status: "draft",
        pageTree,
        settings: settings || "{}",
        visits: 0,
        conversions: 0
      });
    } else {
      // Update existing
      page = await LocalDbController.updateLandingPage(id, tenantSlug, { 
        pageTree,
        ...(settings ? { settings } : {})
      }) as import('@aether/db').LocalLandingPage;
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("PUT Landing Page Error:", error);
    return NextResponse.json({ error: "Failed to update landing page" }, { status: 500 });
  }
}
