export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { executeProviderMesh } from "../../../api/chat/mesh";

export async function POST(req: Request) {
  try {
    const { prompt, tone = "professional", type = "headline", tenantSlug } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let systemInstruction = "You are an elite direct-response copywriter.";
    if (type === "headline") {
      systemInstruction += " Write a single, high-converting headline. Keep it under 10 words. Do not use quotes.";
    } else if (type === "subheadline") {
      systemInstruction += " Write a compelling subheadline that supports a main offer. Keep it under 2 sentences. Focus on benefits and clarity.";
    } else if (type === "bullets") {
      systemInstruction += " Write 3 short, punchy benefit-driven bullet points. Separate them by newlines.";
    }

    systemInstruction += ` Tone: ${tone}.`;

    const response = await executeProviderMesh({
      provider: "openrouter",
      model: "openrouter/free", // Defaulting to free for demo stability
      messages: [{ role: "user", content: prompt }],
      systemPrompt: systemInstruction,
      temperature: 0.8
    });

    return NextResponse.json({ 
      success: true, 
      text: response.text.replace(/^["']|["']$/g, '').trim() // Clean up quotes if the LLM adds them
    });
  } catch (error: any) {
    console.error("AI Copy Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate copy" }, { status: 500 });
  }
}
