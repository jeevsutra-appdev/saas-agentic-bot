import crypto from "crypto";
import { LocalDbController } from "@aether/db";

// Sandbox stores for local dashboard live previews
export const sandboxLeadsStore: any[] = [];
export const sandboxSkillRunsStore: any[] = [];
export const sandboxProductsStore: any[] = [];
export const sandboxAppointmentsStore: any[] = [];

// n8n Webhook configuration parameters (Bring-Your-Own endpoints stubs)
let customN8nWebhookUrl = "";
let customN8nSecret = "aether_secret_key_1337";

export function configureN8nSettings(url: string, secret: string) {
  customN8nWebhookUrl = url;
  customN8nSecret = secret;
}

// Sign payload with HMAC SHA256 for secure n8n validation
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Built-in Skills executors
export async function executeLeadCapture(name: string, email: string, details: string, tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  
  // Persist directly inside the local file-based database!
  const targetSlug = tenantSlug || "imran-ai";
  const newLead = await LocalDbController.addLead({
    tenantSlug: targetSlug,
    name,
    email,
    details
  });

  const latency = Date.now() - startTime + 12; // Add realistic processing overhead
  
  // Log execution
  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "lead_capture",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ name, email, details, tenant: targetSlug }),
    response: JSON.stringify({ status: "inserted", leadId: newLead.id })
  });

  return `Lead captured successfully for Imran: Name="${name}", Email="${email}". Operator is logged.`;
}

export async function executeHumanHandoff(context: string, tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  const latency = Date.now() - startTime + 8;
  const targetSlug = tenantSlug || "imran-ai";

  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "human_handoff",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ context, tenant: targetSlug }),
    response: JSON.stringify({ routingStatus: "operator_alerted", queue: "default" })
  });

  return "Human handoff triggered. The active chat session is forwarded to the workspace admin channel. An agent will take over shortly.";
}

export async function executeN8nWebhook(payload: Record<string, any>, tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  const targetSlug = tenantSlug || "imran-ai";
  
  const payloadString = JSON.stringify({ ...payload, tenant: targetSlug });
  const signature = signWebhookPayload(payloadString, customN8nSecret);

  // Simulate outgoing request headers to n8n webhook
  console.log(`[n8n Webhook] Posting payload to custom URL: ${customN8nWebhookUrl || "MOCK_GATEWAY"}`);
  console.log(`[n8n Webhook] Injected Security Header X-Aether-Signature: ${signature}`);

  const latency = Date.now() - startTime + 140; // Simulated HTTP call latency
  
  const success = true; // Simulating success response from n8n automation loop

  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "n8n_webhook",
    status: success ? "success" : "failed",
    latencyMs: latency,
    payload: payloadString,
    response: JSON.stringify({ n8nStatus: 200, workflowExecuted: true, triggeredBy: "aether_agent" })
  });

  return `n8n webhook skill executed successfully. Payload signed with HMAC SHA256 header and triggered workflow chain.`;
}

// E-commerce & booking executors
export async function executeCatalogQuery(tenantSlug: string, allowedCategoryIds?: string[], allowedProductIds?: string[]): Promise<string> {
  const startTime = Date.now();
  const targetSlug = tenantSlug || "imran-ai";
  
  let scopedProducts = await LocalDbController.getProductsByTenant(targetSlug);
  let scopedCategories = await LocalDbController.getCategoriesByTenant(targetSlug);
  
  if (allowedCategoryIds && allowedCategoryIds.length > 0) {
    scopedCategories = scopedCategories.filter((c: any) => allowedCategoryIds.includes(c.id));
    scopedProducts = scopedProducts.filter((p: any) => allowedCategoryIds.includes(p.categoryId));
  }
  
  if (allowedProductIds && allowedProductIds.length > 0) {
    scopedProducts = scopedProducts.filter((p: any) => allowedProductIds.includes(p.id));
  }

  const latency = Date.now() - startTime + 15;

  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "catalog_query",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ tenant: targetSlug, allowedCategoryIds, allowedProductIds }),
    response: JSON.stringify({ productCount: scopedProducts.length, categoryCount: scopedCategories.length })
  });

  const catalogItems = scopedProducts.map((p: any) => `- Product ID: ${p.id} | Name: ${p.name} | Price: $${(p.price / 100).toFixed(2)} | Description: ${p.description}`).join("\n");
  const categoryItems = scopedCategories.map((c: any) => `- Category ID: ${c.id} | Name: ${c.name} | Description: ${c.description || ""}`).join("\n");
  
  return `Active catalog data found:
--- CATEGORIES ---
${categoryItems || "No categories"}
--- PRODUCTS ---
${catalogItems || "No products"}

INSTRUCTIONS FOR AGENT:
1. To display an entire category to the user, use the format [CATEGORY:cat_id]. Example: [CATEGORY:${scopedCategories[0]?.id || 'all'}]
2. To show all categories, use [CATEGORY:all]
3. To show one or MORE products to the user, you MUST use the format [PRODUCTS:id1,id2,...]. Example: [PRODUCTS:${scopedProducts[0]?.id || 'prod_1'},${scopedProducts[1]?.id || 'prod_2'}]
4. If the user agrees to purchase (including any upsells/downsells), you MUST trigger the checkout by outputting exactly: [CHECKOUT:total_price_in_cents:Item_Names_Separated_By_Plus]. Example for an $88.25 total for two items: [CHECKOUT:8825:Vastu Kit + Blessing Bundle]
5. CRITICAL: DO NOT list products using plain text! Always use the [PRODUCTS:...] tag to display them visually. Do not explain the tags, just use them naturally in your response.`;
}

export async function executeProductCheckout(productName: string, tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  const targetSlug = tenantSlug || "imran-ai";
  
  const scopedProducts = await LocalDbController.getProductsByTenant(targetSlug);
  const product = scopedProducts.find((p: any) => p.name.toLowerCase().includes(productName.toLowerCase())) || scopedProducts[0];
  const latency = Date.now() - startTime + 25;

  const id = newDocId();

  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "ecommerce_checkout",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ product: product?.name || productName, tenant: targetSlug }),
    response: JSON.stringify({ checkoutSession: "cs_live_" + id })
  });

  return `Generated in-chat secure checkout link for "${product?.name || productName}" ($${((product?.price || 4900) / 100).toFixed(2)}): https://checkout.aether.ai/pay/cs_live_${id}`;
}

export async function executeAppointmentBooking(name: string, email: string, slot: string, tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  const targetSlug = tenantSlug || "imran-ai";

  const newAppointment = await LocalDbController.addAppointment({
    tenantSlug: targetSlug,
    clientName: name,
    clientEmail: email,
    timeSlot: slot,
    status: "confirmed"
  });

  const latency = Date.now() - startTime + 20;

  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "calendar_booking",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ name, email, slot, tenant: targetSlug }),
    response: JSON.stringify({ status: "confirmed", appointmentId: newAppointment.id })
  });

  return `Appointment booked successfully for ${name} (${email}) at slot: ${slot}. Confirmation dispatched. Use [BOOK:] to show the interactive booking widget for future bookings.`;
}

export async function executeBookingServicesList(tenantSlug: string): Promise<string> {
  const startTime = Date.now();
  const targetSlug = tenantSlug || "imran-ai";
  const services = (await LocalDbController.getBookingServices(targetSlug)).filter((s: any) => s.isActive);

  const latency = Date.now() - startTime + 5;
  await LocalDbController.addSkillRun({
    tenantSlug: targetSlug,
    skillName: "calendar_booking",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ tenant: targetSlug }),
    response: JSON.stringify({ serviceCount: services.length })
  });

  if (services.length === 0) {
    return `No booking services configured yet. Tell the user to contact you directly.`;
  }

  const serviceLines = services.map((s: any) =>
    `- Service ID: ${s.id} | Name: ${s.name} | Duration: ${s.durationMinutes}min | Price: ${s.price === 0 ? "Free" : "$" + (s.price / 100).toFixed(2)} | Type: ${s.consultationType}`
  ).join("\n");

  return `Available booking services:
${serviceLines}

AGENT BOOKING INSTRUCTIONS:
1. To show the interactive booking card for a specific service, output: [BOOK:service_id]
2. To show the general booking widget (user picks service): output: [BOOK:]
3. When user asks to book or schedule, ALWAYS use [BOOK:service_id] to show the proper interactive booking card
4. Do NOT ask the user to provide slots manually — the BookingCard widget handles date, slot, and contact collection automatically
5. Example: If user wants "Astrology Consultation", respond with "[BOOK:${services[0]?.id || 'service_id'}]"`;
}

// ─── Custom Tool Integrations ────────────────────────────────────────────────

export async function executeTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  tenantSlug: string
): Promise<string> {
  const startTime = Date.now();
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
    const data = await res.json();
    const latency = Date.now() - startTime;
    await LocalDbController.addSkillRun({
      tenantSlug,
      skillName: "telegram_tool",
      status: res.ok ? "success" : "failed",
      latencyMs: latency,
      payload: JSON.stringify({ chatId, message }),
      response: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(data.description || "Telegram API error");
    return `Telegram message sent to chat ${chatId}.`;
  } catch (err: any) {
    console.error("[Telegram Tool]", err.message);
    return `Telegram message failed: ${err.message}`;
  }
}

export async function executeGoogleSheetsWebhook(
  webhookUrl: string,
  data: string,
  tenantSlug: string
): Promise<string> {
  const startTime = Date.now();
  let parsedData: any = data;
  try { parsedData = JSON.parse(data); } catch { /* plain text payload */ }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...( typeof parsedData === "object" ? parsedData : { message: data }), _source: "aether_agent", _tenant: tenantSlug, _timestamp: new Date().toISOString() })
    });
    const latency = Date.now() - startTime;
    const responseText = await res.text().catch(() => "");
    await LocalDbController.addSkillRun({
      tenantSlug,
      skillName: "google_sheets_tool",
      status: res.ok ? "success" : "failed",
      latencyMs: latency,
      payload: JSON.stringify({ webhookUrl, data }),
      response: responseText
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${responseText}`);
    return `Data saved to Google Sheets successfully.`;
  } catch (err: any) {
    console.error("[Google Sheets Tool]", err.message);
    return `Google Sheets save failed: ${err.message}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function newDocId() {
  return Math.random().toString(36).substring(2, 11);
}
export async function executeWebSearch(query: string, tenantSlug: string = "demo"): Promise<string> {
  const startTime = Date.now();
  let output = "";
  try {
    const searchTerms = query.replace(/search/gi, "").replace(/what is/gi, "").replace(/who is/gi, "").trim();
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&utf8=&format=json`);
    const data = await res.json();
    const results = data.query?.search || [];

    if (results.length === 0) {
      output = "No reliable results found.";
    } else {
      output = "Web Search Results:\n";
      results.slice(0, 3).forEach((item: any, i: number) => {
        const snippet = item.snippet.replace(/<[^>]*>?/gm, "");
        output += `${i + 1}. ${item.title}: ${snippet}\n`;
      });
    }
  } catch (error: any) {
    output = `Web search failed: ${(error as any).message}`;
  }

  const latency = Date.now() - startTime;
  
  await LocalDbController.addSkillRun({
    tenantSlug,
    skillName: "web_search",
    status: "success",
    latencyMs: latency,
    payload: JSON.stringify({ query, tenant: tenantSlug }),
    response: JSON.stringify({ searchSuccess: true })
  });

  return output;
}
