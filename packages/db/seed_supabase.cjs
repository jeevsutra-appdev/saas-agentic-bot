const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const url = "https://ovxvatxiavgdfppjaccy.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eHZhdHhpYXZnZGZwcGphY2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM1NjE2NiwiZXhwIjoyMDk2OTMyMTY2fQ.VYi5rROQ8JsTU4TT4LYDCQSJLRs7U4TMk_woXvXKNKI";

const supabase = createClient(url, serviceKey);

const dbPath = path.join(__dirname, "../../apps/db/local_db.json");
const localDb = JSON.parse(fs.readFileSync(dbPath, "utf8"));

async function seed() {
  console.log("Starting Supabase database seeding...");

  // 1. Seed the local_db_store key-value table
  for (const key of Object.keys(localDb)) {
    console.log(`Uploading key "${key}" (${localDb[key].length} items)...`);
    const { error } = await supabase
      .from("local_db_store")
      .upsert({ key, data: localDb[key] });
    
    if (error) {
      console.error(`Error uploading key ${key}:`, error.message);
    }
  }

  // 2. Seed a default tenant in public.tenants table to support keepalive query
  console.log("Inserting seed tenant for keepalive...");
  const { data: existingTenants } = await supabase.from("tenants").select("id").limit(1);
  if (existingTenants && existingTenants.length === 0) {
    const { error: tenantErr } = await supabase
      .from("tenants")
      .insert({
        name: "Imran AI",
        slug: "imran-ai",
        plan_id: "enterprise",
        credits_balance: 500000,
        status: "active"
      });
    if (tenantErr) {
      console.warn("Could not insert seed tenant (migration tables might not be ready yet):", tenantErr.message);
    } else {
      console.log("Seed tenant successfully created.");
    }
  } else {
    console.log("Tenant already exists or checked.");
  }

  console.log("Supabase seeding completed successfully!");
}

seed().catch(err => {
  console.error("Seeding failed with error:", err);
});
