const fs = require('fs');
const path = require('path');

const localDbPath = path.join(__dirname, '../packages/db/src/localDb.ts');
let content = fs.readFileSync(localDbPath, 'utf-8');

// 1. Make all public static methods async
content = content.replace(/public static ([a-zA-Z0-9_]+)\(/g, (match, methodName) => {
  if (methodName === 'readFromDisk' || methodName === 'initDb' || methodName === 'triggerBackgroundFetch' || methodName === 'read' || methodName === 'write') {
    return match; // handle internal methods manually
  }
  return `public static async ${methodName}(`;
});

// 2. Change this.read() to await this.read()
content = content.replace(/const db = this\.read\(\);/g, 'const db = await this.read();');
content = content.replace(/const db = this\.read\((.*?)\);/g, 'const db = await this.read($1);');

// 3. Change this.write(db) to await this.write(db)
content = content.replace(/this\.write\((.*?)\);/g, 'await this.write($1);');

// 4. Rewrite the read and write methods completely.
// We will replace the entire block of `private static read()` and `private static write()` and `triggerBackgroundFetch()`.
const internalMethodsRegex = /private static triggerBackgroundFetch\(\) \{[\s\S]*?public static async getUserByEmail/m;

const newInternalMethods = `
  private static async read(): Promise<LocalDatabaseSchema> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || (!serviceKey && !anonKey)) {
      if (this.cachedDb) return this.cachedDb;
      return this.readFromDisk(); // Fallback for pure local dev without supabase
    }

    const now = Date.now();
    if (this.cachedDb && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cachedDb;
    }

    this.isFetching = true;
    const supabase = createAetherClient({ serviceRole: !!serviceKey });
    
    try {
      const { data, error } = await supabase.from("local_db_store").select("*");
      this.isFetching = false;
      
      if (error) {
        console.error("[Supabase Sync] Fetch error:", error.message);
        return this.cachedDb || this.readFromDisk();
      }
      
      if (data && data.length > 0) {
        const db = { ...(this.cachedDb || this.readFromDisk()) } as any;
        for (const row of data) {
          db[row.key] = row.data;
        }
        this.cachedDb = db;
        this.lastFetchTime = Date.now();
        
        // Try saving to local disk for local dev caching
        try {
          const fs = require('fs');
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
        } catch (e) {}
      }
      return this.cachedDb || this.readFromDisk();
    } catch (e) {
      this.isFetching = false;
      return this.cachedDb || this.readFromDisk();
    }
  }

  private static async write(schema: LocalDatabaseSchema) {
    this.cachedDb = schema;
    this.lastFetchTime = Date.now();
    
    try {
      const fs = require('fs');
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(schema, null, 2), "utf-8");
    } catch (e) {}

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && (serviceKey || anonKey)) {
      const supabase = createAetherClient({ serviceRole: !!serviceKey });
      for (const key of Object.keys(schema)) {
        try {
          const { error } = await supabase.from("local_db_store").upsert({ key, data: (schema as any)[key] });
          if (error) console.error(\`[Supabase Sync] Write error for key \${key}:\`, error.message);
        } catch (e) {
          console.error(\`[Supabase Sync] Write rejected for key \${key}:\`, e);
        }
      }
    }
  }

  public static async getUserByEmail`;

content = content.replace(internalMethodsRegex, newInternalMethods);

fs.writeFileSync(localDbPath, content, 'utf-8');
console.log('Done refactoring localDb.ts.');
