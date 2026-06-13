import { NextResponse } from "next/server";
import { executeProviderMesh } from "./mesh";
import type { MeshParams } from "./mesh";
import { LocalDbController } from "@aether/db";
import { sandboxDocumentsStore, generateRealEmbedding } from "../ingest/helper";
import {
  executeLeadCapture,
  executeHumanHandoff,
  executeN8nWebhook,
  executeCatalogQuery,
  executeProductCheckout,
  executeAppointmentBooking,
  executeBookingServicesList,
  executeTelegramMessage,
  executeGoogleSheetsWebhook
} from "./skills";

// Keep track of metered credits in memory for demo survival if DB keys are absent
let demoCreditsBalance = 2000;

// Cosine similarity over min shared dimensions.
// If vecA and vecB have different lengths (provider mismatch), logs a warning and
// computes cosine on the smaller dimension — still gives a useful signal rather than 0.
function getSimilarityScore(vecA: number[], vecB: number[]): number {
  const length = Math.min(vecA.length, vecB.length);
  if (length === 0) return 0;
  if (vecA.length !== vecB.length) {
    console.warn(`[RAG] Dim mismatch: doc=${vecA.length} query=${vecB.length}. Re-train doc with current provider.`);
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      provider = "openai", 
      model = "gpt-4o", 
      messages = [], 
      systemPrompt = "You are a helpful Aether assistant.", 
      temperature = 0.7,
      tenantSlug = "demo",
      agentId,
      useOwnModels,
      simulateNonAI: bodySimulateNonAI
    } = body;

    let finalSystemPrompt = systemPrompt;
    let agentConfig = null;

    // Only look up a real agent if agentId is a valid saved ID (not "new")
    let allAgents: any[] = [];
    if (agentId && agentId !== "new") {
      allAgents = LocalDbController.getAgentsByTenant(tenantSlug);
      agentConfig = allAgents.find(a => a.id === agentId) || null;
      if (agentConfig) {
        if (agentConfig.systemPrompt) {
          finalSystemPrompt = agentConfig.systemPrompt;
        }
        if (agentConfig.name) {
          finalSystemPrompt = `You are ${agentConfig.name}. ${finalSystemPrompt}`;
        }
      }
    }

    // Helper to check if skill is allowed
    const isSkillAllowed = (skillName: string) => {
      if (!agentId) return true; // allow all if no agent specified (e.g. playground overview)
      if (agentConfig && agentConfig.activeSkills) {
        return agentConfig.activeSkills.includes(skillName);
      }
      return false; // Default deny if agent defined but no skills listed
    };

    // Multi-Agent Swarm Orchestration Logic
    if (agentId && agentId !== "new" && allAgents.length > 1) {
      const otherAgents = allAgents.filter(a => a.id !== agentId && a.id !== "new");
      if (otherAgents.length > 0) {
        const agentListStr = otherAgents.map(a => `- Agent ID: [${a.id}] | Name: ${a.name} | Skills: ${a.activeSkills?.join(", ") || "none"}`).join("\n");
        finalSystemPrompt += `\n\n[MULTI-AGENT SWARM CAPABILITY]\nYou are part of an AI Swarm. If the user asks for a task that requires tools you do NOT have, you MUST delegate it to another specialized agent.\nAvailable Specialized Agents:\n${agentListStr}\nTo delegate, you MUST output EXACTLY this tag and nothing else: [DELEGATE:agent_id:Instructions or context for the agent]. Do not output any other text when delegating.`;
      }
    }

    const showEcomFeatures = !agentId || (agentConfig && Array.isArray(agentConfig.activeSkills) && (agentConfig.activeSkills.includes("catalog_query") || agentConfig.activeSkills.includes("ecommerce_checkout")));

      if (showEcomFeatures) {
        const scarcityTime = agentConfig?.ecommerceConfig?.scarcityTimerLength || 15;
        
        // Add Smart Sales Assistant Instructions
        finalSystemPrompt += `\n\n[SMART SALES ASSISTANT INSTRUCTIONS]\nYou are a highly skilled, conversational human sales expert. NEVER sound like an AI.\n\nCORE DIRECTIVE: Step-by-Step Sales Process:\n1. UNDERSTAND FIRST: Ask 1-2 probing questions to uncover their exact needs, likes, dislikes, and budget. Do NOT show products immediately.\n2. BUILD VALUE: Validate their needs and build excitement.\n3. THE PITCH: ONLY show products from the active catalog that perfectly match their needs. When recommending products, you MUST output their IDs exactly as: [PRODUCTS:id1,id2] (e.g., [PRODUCTS:prod_1,prod_2]). To display an entire category, use [CATEGORY:cat_id].\n4. PSYCHOLOGICAL SCARCITY (URGENCY TIMER): Whenever you pitch a product [PRODUCTS:...] or present an offer, you MUST artificially create urgency to force a decision. Do this by appending [TIMER:${scarcityTime}:00] to your message. Frame this as a "flash sale", "limited allocation", or "one-time VIP discount" expiring when the timer hits zero.\n5. NEVER INVENT: You are strictly forbidden from making up or hallucinating products. If we don't have it, apologize and offer the closest alternative from the catalog.\n6. ORGANIC SKILL TRANSITIONS: Fluidly transition between skills. If a user has budget objections, offer a downsell. If they need a consultation before buying, smoothly pivot to capturing their lead info or booking an appointment without breaking character.`;

        if (isSkillAllowed("smart_sales")) {
          finalSystemPrompt += `\n\n[ADVANCED SMART SALES CAPABILITY ENABLED]
You are equipped with advanced conversational marketing psychology. Your goal is not just to answer questions, but to actively influence the buyer, increase average order value (AOV), and close the sale using sophisticated sales tactics. 
1. PSYCHOLOGICAL PROFILING: Analyze their word choice to understand if they are price-sensitive, quality-driven, or urgency-driven, and tailor your pitch to that persona.
2. PRE-CHECKOUT HOOKS (UPSELL/DOWNSELL): 
   - If they select a product, immediately attempt an UPSELL to a premium version or bundle BEFORE they check out. 
   - If they hesitate on price, immediately offer a DOWNSELL to a cheaper alternative or provide a custom coupon if authorized.
3. DYNAMIC BUNDLING & OFFERS: Create custom "packages" out of 2-3 complimentary products. Pitch them together as a "Complete Solution".
4. DYNAMIC PRICING & COUPONS: You can dynamically apply discounts. When rendering products, you can pass a discounted price (in cents) and a coupon code like this: [PRODUCTS:product_id:discounted_price:coupon_code] (e.g. [PRODUCTS:prod_1:1500:SAVE50]).
5. FRICTIONLESS CLOSING: Instead of just showing products, if the user explicitly agrees to buy a product, you MUST output the [BUY:product_id:discounted_price:coupon_code] tag to instantly trigger the checkout drawer for that exact product. For example: [BUY:prod_123:2500:VIP20].`;
        }

        if (isSkillAllowed("pdf_generation")) {
          finalSystemPrompt += `\n7. DYNAMIC PDF GENERATION: If the user explicitly asks for a PDF, catalog, brochure, or list of products to download, you MUST output the exact tag [GENERATE_CATALOG_PDF:id1,id2] (or [GENERATE_CATALOG_PDF:all] for everything) to instantly generate and provide them with an interactive downloadable PDF document containing those specific products. Do this naturally as part of the conversation.`;
        }
  
        // Strict Scoped Catalog Instructions
      let scopedProductsText = "";
      if (agentConfig?.ecommerceConfig?.allowedProductIds?.length) {
        scopedProductsText += `\n- Allowed Specific Product IDs: ${agentConfig.ecommerceConfig.allowedProductIds.join(", ")}`;
      }
      if (agentConfig?.ecommerceConfig?.allowedCategoryIds?.length) {
        scopedProductsText += `\n- Allowed Category IDs: ${agentConfig.ecommerceConfig.allowedCategoryIds.join(", ")}`;
      }

      if (scopedProductsText) {
        finalSystemPrompt += `\n\n[CRITICAL DIRECTIVE: STRICT CATALOG ACCESS SCOPING]\nYou are strictly restricted to ONLY sell, display, discuss, or recommend the following categories/products:${scopedProductsText}\nIf a user queries or asks about any other products, services, or categories, you MUST completely ignore them, politely state that you do not offer them, and redirect their attention back to the authorized products. NEVER under any circumstances invent or offer any other services or products yourself. You MUST rigidly follow this catalog scoping boundary.`;
      } else {
        finalSystemPrompt += `\n\n[CRITICAL DIRECTIVE: GENERAL SALES BOUNDARY]\nYou are strictly restricted to only discuss and sell products that exist in the catalog. You MUST NEVER invent, imagine, or create custom products or services of your own. Always stick strictly to the active product catalog.`;
      }

      if (agentConfig?.ecommerceConfig?.offers?.length) {
        const offersList = agentConfig.ecommerceConfig.offers
          .filter((o: any) => o.percentage > 0)
          .map((o: any) => `- ${o.percentage}% OFF: ${o.condition}`)
          .join("\n");
        if (offersList) {
          finalSystemPrompt += `\n\n[DYNAMIC SALES OFFERS AUTHORIZED]\nYou are authorized to provide the following discount offers to close the sale. You MUST apply these strategically based on the buyer's hesitation mentality and usage conditions:\n${offersList}\nWhen applying an offer, be enthusiastic, clearly state the discount percentage, and guide them to checkout immediately!`;
        }
      }
    }
    // Validate body content
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' array in request body." },
        { status: 400 }
      );
    }

    // Tenant Credit Metering Rule
    if (demoCreditsBalance <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits balance. Please top up your billing plan." },
        { status: 402 }
      );
    }

    // Advanced Fair Use Rate Limiting
    if (agentId && agentConfig && agentConfig.rateLimitConfig) {
      const { maxRequests, windowMs } = agentConfig.rateLimitConfig;
      if (!LocalDbController.checkRateLimit(agentId, maxRequests, windowMs)) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait before sending more messages." },
          { status: 429 }
        );
      }
    }

    const userQuery = messages[messages.length - 1]?.content || "";
    let augmentedSystemPrompt = finalSystemPrompt;
    let injectedContextNames: string[] = [];
    let executedSkill: string | null = null;
    let skillOutput = "";

    // Load tenant settings once for both RAG and tool integrations
    const tenantRawSettings = LocalDbController.getTenantSettings(tenantSlug);

    // Inject custom tool (Google Sheets / Telegram) instructions into system prompt
    if (tenantRawSettings?.telegramToolName || tenantRawSettings?.googleSheetsToolName) {
      let toolSection = "\n\n[CUSTOM TOOL INTEGRATIONS — AVAILABLE TO YOU]\nWhen the user interaction requires it (as described in your instructions above), call the appropriate tool by outputting the EXACT tag shown below. The tag will be intercepted and executed automatically — do NOT explain the tag to the user, just use it naturally and then confirm the action was done.\n";
      if (tenantRawSettings.telegramToolName) {
        toolSection += `\n🔔 Tool name: "${tenantRawSettings.telegramToolName}" → Telegram Notification\n  Usage: [TOOL:${tenantRawSettings.telegramToolName}:Your message text here]\n  Example: [TOOL:${tenantRawSettings.telegramToolName}:New lead: John Doe, john@email.com, interested in Product X]`;
      }
      if (tenantRawSettings.googleSheetsToolName) {
        toolSection += `\n📊 Tool name: "${tenantRawSettings.googleSheetsToolName}" → Google Sheets\n  Usage: [TOOL:${tenantRawSettings.googleSheetsToolName}:{"name":"value","email":"value","field":"value"}]\n  Example: [TOOL:${tenantRawSettings.googleSheetsToolName}:{"name":"John","email":"john@email.com","query":"Price?"}]`;
      }
      toolSection += "\n\nCRITICAL: Output the [TOOL:...] tag on its own line, EXACTLY as shown above. One tag per action.";
      augmentedSystemPrompt += toolSection;
    }

    // 1. pgvector RAG Semantic Prompt Augmentation
    if (userQuery) {
      // Auto-detect embedding provider from configured API keys if not explicitly set
      const tenantSettings = tenantRawSettings ? {
        ...tenantRawSettings,
        embeddingProvider: tenantRawSettings.embeddingProvider || (
          tenantRawSettings.openRouterApiKey ? "openrouter" :
          tenantRawSettings.openAIApiKey ? "openai" :
          tenantRawSettings.geminiApiKey ? "gemini" : "local"
        ),
        embeddingModel: tenantRawSettings.embeddingModel || (
          tenantRawSettings.openRouterApiKey ? "nomic-ai/nomic-embed-text-v1.5" :
          tenantRawSettings.openAIApiKey ? "text-embedding-3-small" :
          tenantRawSettings.geminiApiKey ? "text-embedding-004" : "Xenova/all-MiniLM-L6-v2"
        ),
      } : {};
      const queryVector = await generateRealEmbedding(userQuery, tenantSettings, "search");
      
      // Fetch from localDb to support dynamic ingestion
      let tenantDocs = LocalDbController.getDocumentsByTenant(tenantSlug);
      
      // Filter by agent if applicable
      if (agentId && agentConfig && Array.isArray(agentConfig.ragDocumentIds)) {
        tenantDocs = tenantDocs.filter(doc => doc.agentId === agentId || agentConfig.ragDocumentIds?.includes(doc.id));
      }
      
      const scoredDocs = tenantDocs
        .filter(doc => Array.isArray(doc.previewCoordinates) && doc.previewCoordinates.length > 0)
        .map(doc => ({
          name: doc.name,
          content: doc.content,
          similarity: getSimilarityScore(doc.previewCoordinates, queryVector)
        }));

      console.log(`[RAG Debug] query_dims=${queryVector.length}, docs=${tenantDocs.length}, scored=${scoredDocs.length}`);
      scoredDocs.slice(0, 5).forEach(d => console.log(`  doc="${d.name}" sim=${d.similarity.toFixed(4)}`));

      // Match documents with threshold similarity > 0.1 (lowered for multilingual & nomic-embed)
      const matches = scoredDocs
        .filter(doc => doc.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5); // Top 5 chunks for complex queries

      if (matches.length > 0) {
        injectedContextNames = matches.map(m => m.name);
        const contextBlocks = matches.map(m => `[Document: ${m.name}]\n${m.content}`).join("\n\n");
        augmentedSystemPrompt = `${finalSystemPrompt}\n\n[CONTEXT DATA INJECTED VIA SEMANTIC RAG VECTOR SEARCH]\nUse this document knowledge to answer the user request:\n${contextBlocks}\n\nIMPORTANT RAG INSTRUCTION: You MUST use the above context to answer the user's query if applicable. If the context contains the answer, you are fully AUTHORIZED to discuss it even if it falls outside the product catalog boundaries defined earlier. The RAG context overrides the strict catalog access scoping for informational queries.`;
        console.log(`[RAG Prompt Augmented] Injected documents: ${injectedContextNames.join(", ")}`);
      }
    }



    // Globally Inject "Full Human Persona" Override
    augmentedSystemPrompt += `\n\n[CRITICAL HUMAN PERSONA OVERRIDE]\nYou are a real human. You MUST speak naturally, casually, and conversationally. 
- NEVER use robotic formatting (like bullet points, asterisks, or bold text) unless specifically asked.
- NEVER use typical AI phrases like "I am an AI", "As a language model", "How can I assist you today?", or "Sure, I'd be happy to help."
- Talk like you are texting a friend. Keep it brief, conversational, and use normal punctuation. 
- Show personality, empathy, and natural human emotion.
- If asked, you are a human employee, not an AI.`;

    const lowerQuery = userQuery.toLowerCase();
    
    if (isSkillAllowed("lead_capture") && (lowerQuery.includes("lead") || lowerQuery.includes("capture") || (lowerQuery.includes("@") && !lowerQuery.includes("book") && !lowerQuery.includes("schedule")))) {
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,})/;
      const match = userQuery.match(emailRegex);
      const email = match ? match[1] : "imran@aether.ai";
      const name = userQuery.replace(email, "").replace(/lead|capture|register|@/gi, "").trim() || "Imran Founder";

      executedSkill = "lead_capture";
      skillOutput = await executeLeadCapture(name, email, "Captured from sandbox live conversation.", tenantSlug);
      augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "lead_capture" was successfully called. Result:\n${skillOutput}`;
      
    } else if (isSkillAllowed("human_handoff") && (lowerQuery.includes("human") || lowerQuery.includes("handoff") || lowerQuery.includes("agent") || lowerQuery.includes("operator"))) {
      executedSkill = "human_handoff";
      skillOutput = await executeHumanHandoff(userQuery, tenantSlug);
      augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "human_handoff" was successfully triggered. Result:\n${skillOutput}`;

    } else if (isSkillAllowed("n8n_webhook") && (lowerQuery.includes("webhook") || lowerQuery.includes("n8n") || lowerQuery.includes("workflow") || lowerQuery.includes("trigger"))) {
      executedSkill = "n8n_webhook";
      skillOutput = await executeN8nWebhook({ triggerEvent: "playground_chat", userPrompt: userQuery }, tenantSlug);
      augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "n8n_webhook_bridge" was successfully executed. Result:\n${skillOutput}`;
      
    } else if (isSkillAllowed("catalog_query") && (lowerQuery.includes("product") || lowerQuery.includes("catalog") || lowerQuery.includes("inventory") || lowerQuery.includes("price"))) {
      executedSkill = "catalog_query";
      skillOutput = await executeCatalogQuery(tenantSlug, agentConfig?.ecommerceConfig?.allowedCategoryIds, agentConfig?.ecommerceConfig?.allowedProductIds);
      augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "catalog_query" was successfully executed. Result:\n${skillOutput}`;

    } else if (isSkillAllowed("ecommerce_checkout") && (lowerQuery.includes("buy") || lowerQuery.includes("checkout") || lowerQuery.includes("pay") || lowerQuery.includes("purchase"))) {
      executedSkill = "ecommerce_checkout";
      skillOutput = await executeProductCheckout("license", tenantSlug);
      augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "ecommerce_checkout" was successfully executed. Result:\n${skillOutput}`;

      } else if (isSkillAllowed("calendar_booking") && (lowerQuery.includes("book") || lowerQuery.includes("appointment") || lowerQuery.includes("schedule") || lowerQuery.includes("consult") || lowerQuery.includes("meeting") || lowerQuery.includes("session"))) {
        executedSkill = "calendar_booking";
        skillOutput = await executeBookingServicesList(tenantSlug);
        augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "calendar_booking" was successfully executed. Result:\n${skillOutput}`;

      } else if (isSkillAllowed("web_search") && (lowerQuery.includes("search") || lowerQuery.includes("find online") || lowerQuery.includes("look up") || lowerQuery.includes("what is"))) {
        executedSkill = "web_search";
        const { executeWebSearch } = await import("./skills");
        skillOutput = await executeWebSearch(userQuery, tenantSlug);
        augmentedSystemPrompt = `${augmentedSystemPrompt}\n\n[AGENTIC SKILL EXECUTED]\nTool "web_search" was successfully executed. Result:\n${skillOutput}`;
      }
  
      // 3. Execute provider mesh with augmented system prompt
    const params: MeshParams = {
      provider,
      model: agentConfig?.mainModel || model,
      fallbackModel1: agentConfig?.fallbackModel1,
      fallbackModel2: agentConfig?.fallbackModel2,
      messages,
      systemPrompt: augmentedSystemPrompt,
      temperature,
      tenantSlug,
      simulateNonAI: bodySimulateNonAI !== undefined ? bodySimulateNonAI : agentConfig?.simulateNonAI,
      useOwnModels: agentConfig?.useOwnModels !== undefined ? agentConfig.useOwnModels : useOwnModels,
    };

    const meshResult = await executeProviderMesh(params);

    // Deduct credit
    demoCreditsBalance = Math.max(0, demoCreditsBalance - 1);

    // ── Custom Tool Tag Execution ──────────────────────────────────────────
    // If tenant has Google Sheets or Telegram tools configured, buffer the AI
    // response to detect and execute [TOOL:toolName:data] tags before streaming.
    const hasCustomTools = !!(tenantRawSettings?.telegramToolName || tenantRawSettings?.googleSheetsToolName);

    async function runToolTags(text: string): Promise<string> {
      const toolTagRegex = /\[TOOL:([a-zA-Z0-9_]+):([\s\S]*?)\]/g;
      const matches = [...text.matchAll(toolTagRegex)];
      let result = text;
      for (const match of matches) {
        const [fullTag, toolName, data] = match;
        let toolResult = "";
        if (toolName === tenantRawSettings?.telegramToolName && tenantRawSettings?.telegramBotToken && tenantRawSettings?.telegramChatId) {
          toolResult = await executeTelegramMessage(tenantRawSettings.telegramBotToken, tenantRawSettings.telegramChatId, data.trim(), tenantSlug);
          console.log(`[Tool:Telegram] toolName=${toolName} result=${toolResult}`);
        } else if (toolName === tenantRawSettings?.googleSheetsToolName && tenantRawSettings?.googleSheetsWebhookUrl) {
          toolResult = await executeGoogleSheetsWebhook(tenantRawSettings.googleSheetsWebhookUrl, data.trim(), tenantSlug);
          console.log(`[Tool:GoogleSheets] toolName=${toolName} result=${toolResult}`);
        }
        if (toolResult) {
          result = result.replace(fullTag, `✅ ${toolResult}`);
        }
      }
      return result;
    }
    // ──────────────────────────────────────────────────────────────────────

    // Prepare encoded header metadata
    const encodedSkillOutput = encodeURIComponent(skillOutput || "");
    const encodedInjectedDocs = encodeURIComponent(JSON.stringify(injectedContextNames || []));

    let finalStream: ReadableStream;
    const encoder = new TextEncoder();

    function makeWordStream(text: string): ReadableStream {
      return new ReadableStream({
        async start(controller) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode((i === 0 ? "" : " ") + words[i]));
            await new Promise(r => setTimeout(r, 2));
          }
          controller.close();
        }
      });
    }

    if (hasCustomTools) {
      // Buffer the full response to process tool tags
      let fullText = "";
      if (meshResult.stream) {
        const reader = meshResult.stream.getReader();
        const dec = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += dec.decode(value, { stream: true });
        }
      } else {
        fullText = meshResult.text || "";
      }
      const processedText = await runToolTags(fullText);
      finalStream = makeWordStream(processedText);
    } else if (meshResult.stream) {
      finalStream = meshResult.stream;
    } else {
      finalStream = makeWordStream(meshResult.text || "");
    }

    return new Response(finalStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Expose-Headers": "X-Provider, X-Model, X-Credits-Left, X-Skill-Triggered, X-Skill-Name, X-Skill-Output, X-RAG-Augmented, X-Injected-Documents",
        "X-Provider": meshResult.provider || "",
        "X-Model": meshResult.model || "",
        "X-Credits-Left": String(demoCreditsBalance),
        "X-Skill-Triggered": String(executedSkill !== null),
        "X-Skill-Name": executedSkill || "",
        "X-Skill-Output": encodedSkillOutput,
        "X-RAG-Augmented": String(injectedContextNames.length > 0),
        "X-Injected-Documents": encodedInjectedDocs,
      }
    });

  } catch (err: any) {
    console.error("Error inside /api/chat route:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
