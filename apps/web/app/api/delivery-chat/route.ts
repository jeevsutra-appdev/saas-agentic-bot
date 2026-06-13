import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenantSlug");
  const orderId = searchParams.get("orderId");
  if (!tenantSlug || !orderId)
    return NextResponse.json({ error: "tenantSlug and orderId required" }, { status: 400 });

  const messages = LocalDbController.getChatMessages(tenantSlug, orderId);
  return NextResponse.json({ success: true, messages });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { tenantSlug, orderId, from, fromRole, text } = body;
  if (!tenantSlug || !orderId || !from || !fromRole || !text)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const msg = LocalDbController.addChatMessage({ tenantSlug, orderId, from, fromRole, text });
  return NextResponse.json({ success: true, message: msg });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { tenantSlug, orderId, role } = body;
  if (!tenantSlug || !orderId || !role)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  LocalDbController.markChatRead(tenantSlug, orderId, role);
  return NextResponse.json({ success: true });
}
