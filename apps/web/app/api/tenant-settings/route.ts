import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

// Mask key for safety when sending to client
function maskKey(key?: string) {
  if (!key) return "";
  if (key.length <= 8) return "*".repeat(key.length);
  return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const settings = await LocalDbController.getTenantSettings(tenantSlug);

    // Auto-detect embedding provider from configured API keys if not explicitly set.
    // Priority: openrouter > openai > gemini > local
    let embeddingProvider = settings?.embeddingProvider;
    let embeddingModel = settings?.embeddingModel;
    if (!embeddingProvider) {
      if (settings?.openRouterApiKey) {
        embeddingProvider = "openrouter";
        embeddingModel = embeddingModel || "nomic-ai/nomic-embed-text-v1.5";
      } else if (settings?.openAIApiKey) {
        embeddingProvider = "openai";
        embeddingModel = embeddingModel || "text-embedding-3-small";
      } else if (settings?.geminiApiKey) {
        embeddingProvider = "gemini";
        embeddingModel = embeddingModel || "text-embedding-004";
      } else {
        embeddingProvider = "local";
        embeddingModel = embeddingModel || "Xenova/all-MiniLM-L6-v2";
      }
    }

    // Mask keys before returning them
    const maskedSettings = {
      openRouterApiKey: maskKey(settings?.openRouterApiKey),
      geminiApiKey: maskKey(settings?.geminiApiKey),
      openAIApiKey: maskKey(settings?.openAIApiKey),
      claudeApiKey: maskKey(settings?.claudeApiKey),
      groqApiKey: maskKey(settings?.groqApiKey),
      embeddingProvider,
      embeddingModel,
      // Tool integrations
      telegramBotToken: maskKey(settings?.telegramBotToken),
      telegramChatId: settings?.telegramChatId || "",
      telegramToolName: settings?.telegramToolName || "notify_admin",
      googleSheetsWebhookUrl: settings?.googleSheetsWebhookUrl || "",
      googleSheetsToolName: settings?.googleSheetsToolName || "save_to_sheet",
      // Booking integrations
      zoomAccountId: settings?.zoomAccountId || "",
      zoomClientId: settings?.zoomClientId || "",
      zoomClientSecret: maskKey(settings?.zoomClientSecret),
      smtpHost: settings?.smtpHost || "",
      smtpUser: settings?.smtpUser || "",
      smtpPass: maskKey(settings?.smtpPass),
      smtpFrom: settings?.smtpFrom || "",
      // Google Calendar (never return the full JSON to client)
      gcalCalendarId: settings?.gcalCalendarId || "",
      gcalConfigured: !!(settings?.gcalServiceAccountJson),
      // Booking storefront config
      bookingStorefrontConfig: settings?.bookingStorefrontConfig || "",
      // Subscription Data
      planId: settings?.planId || "free",
      unlockedFeatures: settings?.unlockedFeatures || [],
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error("Error fetching tenant settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, ...keys } = body;

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    // Filter out masked keys so we don't accidentally save 'sk-a***1234'
    const updateData: any = {};
    for (const [key, value] of Object.entries(keys)) {
      if (typeof value === "number") {
        updateData[key] = value;
      } else if (typeof value === "string" && value && !value.includes("*")) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await LocalDbController.upsertTenantSettings(tenantSlug, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tenant settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
