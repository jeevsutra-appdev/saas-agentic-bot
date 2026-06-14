import { NextResponse } from "next/server";
import { LocalDbController, createAetherClient } from "@aether/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const xCronSecret = req.headers.get("x-cron-secret");
  
  // For local dev, bypass if secret is not set, else strictly enforce
  if (process.env.CRON_SECRET) {
    const expectedBearer = `Bearer ${process.env.CRON_SECRET}`;
    const isValidBearer = authHeader === expectedBearer;
    const isValidXCron = xCronSecret === process.env.CRON_SECRET;
    
    if (!isValidBearer && !isValidXCron) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  // If Supabase URL is configured, run query on Supabase database to keep it active
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      console.log("[Keepalive] Querying Supabase instance to prevent Free-Tier pausing.");
      const supabase = createAetherClient();
      const { data, error } = await supabase.from("tenants").select("id").limit(1);
      
      if (error) throw error;
      
      return NextResponse.json({
        ok: true,
        at: new Date().toISOString(),
        target: "supabase",
        message: "Supabase free-tier survival keepalive executed successfully."
      });
    } catch (error: any) {
      console.error("[Keepalive] Supabase query failed:", error.message || error);
      return NextResponse.json({ ok: false, error: "Supabase unreachable" }, { status: 500 });
    }
  }

  try {
    console.log("[Keepalive] Simulating Heartbeat to Local Database instance.");
    // Simulate updating the heartbeat table to prevent Free-Tier pausing
    await LocalDbController.addSkillRun({
      tenantSlug: "system",
      skillName: "keepalive_heartbeat",
      status: "success",
      latencyMs: 12,
      payload: "{}",
      response: '{"beat": "success"}'
    });

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      target: "local_db",
      message: "Free-tier survival keepalive executed (simulation)."
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Database unreachable" }, { status: 500 });
  }
}
