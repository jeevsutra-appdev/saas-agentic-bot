import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

// Hardcoded list of working 2026 models to ensure high-quality, relevant results.
// In a fully dynamic setup, we could call each provider's models endpoint, 
// but this ensures a clean UI with only the best models.
const PROVIDER_MODELS = {
  openai: [
    { id: "openai/gpt-4.5", name: "GPT-4.5 - Next Gen" },
    { id: "openai/gpt-4o", name: "GPT-4o (Omni) - Fast & Multimodal" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo - Fast" },
    { id: "openai/o1-mini", name: "o1 Mini - Reasoning" },
    { id: "openai/o1-preview", name: "o1 Preview - Reasoning" },
  ],
  claude: [
    { id: "anthropic/claude-4.6", name: "Claude 4.6 - Next Gen" },
    { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet - Latest" },
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet - Fast & Intelligent" },
    { id: "anthropic/claude-3-opus", name: "Claude 3 Opus - Powerful" },
    { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku - Super Fast" },
  ],
  gemini: [
    { id: "google/gemini-3.1-pro", name: "Gemini 3.1 Pro - Advanced" },
    { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro - Advanced" },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash - Super Fast" },
    { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "google/gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ],
  groq: [
    { id: "groq/llama-3-70b-8192", name: "Llama 3 70B (Groq) - Ultra Fast" },
    { id: "groq/llama-3-8b-8192", name: "Llama 3 8B (Groq) - Ultra Fast" },
    { id: "groq/mixtral-8x7b-32768", name: "Mixtral 8x7B (Groq) - Fast" },
  ],
  openrouter: [
    { id: "openrouter/free", name: "OpenRouter Free Models (Auto)" },
    { id: "openrouter/deepseek/deepseek-r1", name: "DeepSeek R1 (Reasoning)" },
    { id: "openrouter/deepseek/deepseek-chat", name: "DeepSeek V3 (Chat)" },
    { id: "openrouter/meta-llama/llama-3-70b-instruct", name: "Meta Llama 3 70B Instruct" },
    { id: "openrouter/mistralai/mixtral-8x22b-instruct", name: "Mixtral 8x22B Instruct" },
  ]
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const useOwn = searchParams.get("useOwn") !== "false"; // Default true, but can be forced false

    if (!tenantSlug) {
      return NextResponse.json({ error: "Missing tenantSlug" }, { status: 400 });
    }

    const settings = LocalDbController.getTenantSettings(tenantSlug);
    const availableGroups: { provider: string; label: string; models: { id: string; name: string }[] }[] = [];

    let openRouterModels = [...PROVIDER_MODELS.openrouter];
    try {
      // Dynamically fetch all models from OpenRouter
      const orRes = await fetch("https://openrouter.ai/api/v1/models");
      if (orRes.ok) {
        const data = await orRes.json();
        if (data.data && Array.isArray(data.data)) {
          openRouterModels = data.data.map((m: any) => {
            const isFree = m.pricing?.prompt === "0" && m.pricing?.completion === "0";
            return {
              id: m.id,
              name: `${m.name || m.id} ${isFree ? "(Free)" : ""}`.trim()
            };
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch OpenRouter models:", e);
    }

    if (settings?.openRouterApiKey && useOwn) {
      availableGroups.push({ provider: "openrouter", label: "OpenRouter (Custom)", models: openRouterModels });
    } else {
      availableGroups.push({ provider: "openrouter", label: "OpenRouter (Free & OSS Fallbacks)", models: openRouterModels });
    }

    // Unconditionally show all native provider models as requested by user
    availableGroups.push({ provider: "openai", label: "OpenAI", models: PROVIDER_MODELS.openai });
    availableGroups.push({ provider: "claude", label: "Anthropic Claude", models: PROVIDER_MODELS.claude });
    availableGroups.push({ provider: "gemini", label: "Google Gemini", models: PROVIDER_MODELS.gemini });
    availableGroups.push({ provider: "groq", label: "Groq", models: PROVIDER_MODELS.groq });

    return NextResponse.json({ groups: availableGroups });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
