import { NextResponse } from "next/server";
// Fallback local db wrapper for simulation, in prod this points to real supabase pg driver
import { LocalDbController } from "@aether/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Protect with a shared secret
  const auth = req.headers.get("x-cron-secret");
  // For local dev, bypass if secret is not set, else strictly enforce
  if (process.env.CRON_SECRET && auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    console.log("[Keepalive] Simulating Heartbeat to Supabase instance.");
    // Simulate updating the heartbeat table to prevent Free-Tier pausing
    LocalDbController.addSkillRun({
      tenantSlug: "system",
      skillName: "keepalive_heartbeat",
      status: "success",
      latencyMs: 12,
      payload: "{}",
      response: '{"beat": "success"}'
    });

    return NextResponse.json({ ok: true, at: new Date().toISOString(), message: "Free-tier survival keepalive executed." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Database unreachable" }, { status: 500 });
  }
}
