const fs = require('fs');
const path = require('path');

const jsPath = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/.next/server/app/b/[tenant]/page.js';

if (!fs.existsSync(jsPath)) {
  console.log('page.js not found!');
  process.exit(1);
}

const content = fs.readFileSync(jsPath, 'utf8');
const match = content.match(/sourceMappingURL=data:application\/json;charset=utf-8;base64,([A-Za-z0-9+/=]+)/);

if (match && match[1]) {
  try {
    const base64 = match[1];
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    const sourceMap = JSON.parse(jsonStr);
    
    // Find the source content for page.tsx
    const index = sourceMap.sources.findIndex(s => s.includes('page.tsx'));
    if (index !== -1) {
      const originalCode = sourceMap.sourcesContent[index];
      fs.writeFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/scratch/recovered_page.tsx', originalCode);
      console.log('Successfully recovered page.tsx!');
      
      // Let's also restore it!
      fs.writeFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/b/[tenant]/page.tsx', originalCode);
      console.log('Restored to original location.');
    } else {
      console.log('page.tsx not found in source map sources.');
    }
  } catch (err) {
    console.error('Error parsing source map:', err);
  }
} else {
  console.log('Source map not found in file!');
}
