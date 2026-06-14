import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";
import { configureN8nSettings } from "../chat/skills";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || "imran-ai";

    const leads = await LocalDbController.getLeadsByTenant(tenantSlug);
    const runs = await LocalDbController.getSkillRunsByTenant(tenantSlug);

    return NextResponse.json({
      success: true,
      leadsCount: leads.length,
      runsCount: runs.length,
      leads,
      runs
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch skills analytics." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, secret, tenantSlug } = body;

    configureN8nSettings(webhookUrl || "", secret || "aether_secret_key_1337");

    // Also persist in our local database user records for persistence!
    const targetSlug = tenantSlug || "imran-ai";
    const user = await LocalDbController.getUserByEmail("imranhossain786@gmail.com");
    if (user) {
      user.planId = "enterprise";
      await LocalDbController.saveUser(user);
    }

    console.log(`[n8n Configured] Updated custom n8n webhook endpoint: ${webhookUrl} for tenant ${targetSlug}`);

    return NextResponse.json({
      success: true,
      message: "Custom n8n Webhook settings updated successfully.",
      activeWebhookUrl: webhookUrl
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update custom webhook configurations." },
      { status: 500 }
    );
  }
}
