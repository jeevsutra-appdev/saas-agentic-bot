import { createAetherClient } from "./packages/db/src/supabase.ts";
import "dotenv/config";

async function testSupabase() {
  const supabase = createAetherClient();
  const { data, error } = await supabase.from("local_db_store").select("*").limit(1);
  console.log("Supabase READ Error:", error?.message);
  console.log("Supabase READ Data:", data);
  
  if (!error) {
    const { error: writeError } = await supabase.from("local_db_store").upsert([{ key: "test", data: { hello: "world" } }]);
    console.log("Supabase WRITE Error:", writeError?.message);
  }
}

testSupabase();
