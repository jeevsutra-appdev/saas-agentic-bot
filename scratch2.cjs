const fs = require('fs');
const db = JSON.parse(fs.readFileSync('apps/db/local_db.json', 'utf8'));
console.log(JSON.stringify(db.storefronts.filter(s => s.tenantSlug === 'imran-ai'), null, 2));
