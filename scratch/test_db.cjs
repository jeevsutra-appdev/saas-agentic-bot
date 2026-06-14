const { createClient } = require("@supabase/supabase-js");

const url = "https://ovxvatxiavgdfppjaccy.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eHZhdHhpYXZnZGZwcGphY2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTYxNjYsImV4cCI6MjA5NjkzMjE2Nn0.j0-x3DdwDwUUmExQRVz0B1p41yZHJE0_BI_cjIXHZYI";

const supabase = createClient(url, anonKey);

async function test() {
  console.log("Testing connection to Supabase...");
  const { data, error } = await supabase.from("tenants").select("id").limit(1);
  if (error) {
    console.error("Database table check failed:", error.message);
  } else {
    console.log("Database table check passed. tenants table exists and returned:", data);
  }
}

test();
