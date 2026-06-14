const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('LocalDbController.')) return;

  console.log(`Processing ${filePath}`);

  // Replace `LocalDbController.method(...)` with `await LocalDbController.method(...)`
  // But avoid `await await LocalDbController`
  let newContent = content.replace(/(?<!await\s+)LocalDbController\.([a-zA-Z0-9_]+)\(/g, 'await LocalDbController.$1(');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, '../apps/web'));
console.log('Done refactoring API routes.');
