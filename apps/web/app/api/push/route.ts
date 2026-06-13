import { NextResponse } from "next/server";
import webpush from "web-push";
import { LocalDbController } from "@aether/db";

// VAPID keys — generated once, stored globally in this process.
// On first request these get set via web-push; stable for lifetime of the process.
let vapidInitialized = false;

function ensureVapid() {
  if (vapidInitialized) return;
  const stored = process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY;
  if (stored) {
    webpush.setVapidDetails(
      "mailto:admin@aether.local",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  } else {
    // Generate keys at runtime and keep in memory for the lifetime of this process.
    // In production you would persist these to env or DB.
    const keys = webpush.generateVAPIDKeys();
    (global as any).__vapidPublic = (global as any).__vapidPublic || keys.publicKey;
    (global as any).__vapidPrivate = (global as any).__vapidPrivate || keys.privateKey;
    webpush.setVapidDetails(
      "mailto:admin@aether.local",
      (global as any).__vapidPublic,
      (global as any).__vapidPrivate
    );
  }
  vapidInitialized = true;
}

// GET — return public VAPID key so clients can subscribe
export async function GET() {
  ensureVapid();
  const publicKey =
    process.env.VAPID_PUBLIC_KEY || (global as any).__vapidPublic || "";
  return NextResponse.json({ publicKey });
}

// POST — actions: "subscribe" | "send"
export async function POST(request: Request) {
  ensureVapid();
  const body = await request.json();
  const { action, tenantSlug } = body;

  if (action === "subscribe") {
    const { subscription, role, riderId } = body;
    if (!tenantSlug || !subscription || !role)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    LocalDbController.savePushSubscription({ tenantSlug, role, riderId, subscription });
    return NextResponse.json({ success: true });
  }

  if (action === "send") {
    const { role, riderId, title, body: msgBody, data } = body;
    if (!tenantSlug || !title)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const subs = LocalDbController.getPushSubscriptions(tenantSlug, role, riderId);
    const payload = JSON.stringify({ title, body: msgBody || "", data: data || {} });

    const results = await Promise.allSettled(
      subs.map(rec =>
        webpush.sendNotification(rec.subscription as any, payload).catch(err => {
          // Remove invalid subscriptions (410 Gone)
          if (err.statusCode === 410) {
            LocalDbController.deletePushSubscription(tenantSlug, rec.id);
          }
          throw err;
        })
      )
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent, total: subs.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
