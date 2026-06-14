const fs = require('fs');
const path = require('path');

const localDbPath = path.join(__dirname, '../packages/db/src/localDb.ts');
let content = fs.readFileSync(localDbPath, 'utf-8');

// Fix return types: `public static async name(args): Type {` -> `public static async name(args): Promise<Type> {`
// Match: public static async MethodName(args): ReturnType {
// We exclude already Promise<...> with negative lookahead or simple replace
content = content.replace(/public static async ([a-zA-Z0-9_]+)\(([^)]*)\)\s*:\s*([^P{][^{]+?)\s*\{/g, (match, name, args, type) => {
  return `public static async ${name}(${args}): Promise<${type.trim()}> {`;
});

fs.writeFileSync(localDbPath, content, 'utf-8');
console.log('Fixed return types in localDb.ts');
