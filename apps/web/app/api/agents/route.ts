export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
    }

    const agents = await LocalDbController.getAgentsByTenant(tenantSlug);
    return NextResponse.json({ success: true, agents });
  } catch (err: any) {
    console.error("GET /api/agents error:", err);
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      tenantSlug, name, systemPrompt, avatarUrl, themeColor, templateStyle, 
      ragDocumentIds, activeSkills, mainModel, fallbackModel1, fallbackModel2, rateLimitConfig,
      metaTitle, metaDescription, metaImage
    } = body;

    if (!tenantSlug || !name) {
      return NextResponse.json({ error: "tenantSlug and name are required" }, { status: 400 });
    }

    const newAgent = await LocalDbController.addAgent({
      tenantSlug,
      name,
      systemPrompt: systemPrompt || "You are a helpful Aether assistant.",
      avatarUrl: avatarUrl || "",
      themeColor: themeColor || "#6366f1",
      templateStyle: templateStyle || "glass",
      ragDocumentIds: ragDocumentIds || [],
      activeSkills: activeSkills || [],
      mainModel,
      fallbackModel1,
      fallbackModel2,
      rateLimitConfig,
      metaTitle,
      metaDescription,
      metaImage
    });

    return NextResponse.json({ success: true, agent: newAgent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "id and updates are required" }, { status: 400 });
    }

    const updatedAgent = await LocalDbController.updateAgent(id, updates);
    if (!updatedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agent: updatedAgent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const success = await LocalDbController.deleteAgent(id);
    if (!success) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
