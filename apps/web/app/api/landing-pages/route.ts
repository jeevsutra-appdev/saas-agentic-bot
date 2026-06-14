export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "../../../../../packages/db/src/localDb";
import { LANDING_PAGE_TEMPLATES } from "../../../components/landing-page-studio/templates/templateData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const pages = await LocalDbController.getLandingPages(tenantSlug);
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET Landing Pages Error:", error);
    return NextResponse.json({ error: "Failed to fetch landing pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenantSlug, name, slug, productId, status, pageTree, settings, templateId } = await req.json();

    if (!tenantSlug || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pageSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    // Initialize content from template or default to a blank page structure
    let initialPageTree = pageTree;
    let initialSettings = settings;

    if (!initialPageTree) {
      const template = templateId ? LANDING_PAGE_TEMPLATES.find(t => t.id === templateId) : null;
      if (template) {
        initialPageTree = template.json;
        if (!initialSettings) {
          initialSettings = JSON.stringify({
            themeColors: {
              primary: template.accentColor || "#6366f1",
              background: template.gradientFrom || "#02040A",
            }
          });
        }
      } else {
        // Standard blank page container structure for CraftJS to load cleanly
        initialPageTree = JSON.stringify({
          ROOT: {
            type: { resolvedName: "Container" },
            isCanvas: true,
            props: {},
            displayName: "Container",
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {}
          }
        });
        if (!initialSettings) {
          initialSettings = "{}";
        }
      }
    }

    const newPage = await LocalDbController.createLandingPage(tenantSlug, {
      name,
      slug: pageSlug,
      productId,
      status: status || "draft",
      pageTree: initialPageTree,
      settings: initialSettings,
      templateId,
      visits: 0,
      conversions: 0
    });

    return NextResponse.json({ page: newPage });
  } catch (error) {
    console.error("POST Landing Page Error:", error);
    return NextResponse.json({ error: "Failed to create landing page" }, { status: 500 });
  }
}
