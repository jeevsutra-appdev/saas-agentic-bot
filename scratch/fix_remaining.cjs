const fs = require('fs');
const path = require('path');

function wrapAwaitParentheses(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // `await LocalDbController.method(args).find` -> `(await LocalDbController.method(args)).find`
  const newContent = content.replace(/await\s+(LocalDbController\.[a-zA-Z0-9_]+\([^)]*\))\.(find|filter|map)/g, '(await $1).$2');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Wrapped awaits in ${filePath}`);
  }
}

['app/api/booking/appointments/route.ts', 'app/api/booking/slots/route.ts', 'app/api/chat/skills.ts', 'app/api/delivery/route.ts', 'app/api/ingest/route.ts', 'app/b/[tenant]/[agentId]/page.tsx'].forEach(rel => {
  wrapAwaitParentheses(path.join(__dirname, '../apps/web', rel));
});

// For localDb.ts missing await this.read()
const localDbPath = path.join(__dirname, '../packages/db/src/localDb.ts');
let localDbContent = fs.readFileSync(localDbPath, 'utf-8');
localDbContent = localDbContent.replace(/const db = this\.read\(\);/g, 'const db = await this.read();');
localDbContent = localDbContent.replace(/const \{ data, error \} = await supabase\.from\("local_db_store"\)\.select\("\*"\);/g, 'const { data, error } = await supabase.from("local_db_store").select("*") as any;');
localDbContent = localDbContent.replace(/upsert\(\{ key, data: \(schema as any\)\[key\] \}\)/g, 'upsert({ key, data: (schema as any)[key] } as any)');
fs.writeFileSync(localDbPath, localDbContent, 'utf-8');
console.log('Fixed remaining type errors in localDb.ts');
