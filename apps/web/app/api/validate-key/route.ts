export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "API key is required" }, { status: 400 });
    }

    // Skip masked keys
    if (apiKey.includes('*')) {
      return NextResponse.json({ valid: true, masked: true });
    }

    let isValid = false;

    switch (provider) {
      case "openrouter":
        // Test OpenRouter key by fetching auth/key
        const orRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        isValid = orRes.ok;
        break;
      
      case "openai":
        const oaRes = await fetch("https://api.openai.com/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        isValid = oaRes.ok;
        break;

      case "anthropic":
      case "claude":
        // Anthropic requires x-api-key
        // Simple test call, we might get a 400 if body missing, but 401 if key invalid
        const antRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { 
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{role: "user", content: "hi"}] })
        });
        // 200 is ok, 400 is also ok (key is valid but bad request), 401 is invalid
        isValid = antRes.status !== 401 && antRes.status !== 403;
        break;

      case "gemini":
        // Gemini URL includes key
        const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        isValid = gemRes.ok;
        break;

      case "groq":
        const groqRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        isValid = groqRes.ok;
        break;

      default:
        isValid = true; // For unknown providers, assume valid
    }

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("API Validation error:", error);
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
