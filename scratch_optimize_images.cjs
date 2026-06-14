const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace <img ...> with <img loading="lazy" ...> if it doesn't already have loading=
      // We look for <img followed by space, not containing loading= before the >
      const newContent = content.replace(/<img\s+(?![^>]*\bloading=["'])/g, '<img loading="lazy" ');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Optimized images in:', fullPath);
      }
    }
  }
}

processDir('apps/web/app');
processDir('apps/web/components');
console.log('Optimization complete!');
