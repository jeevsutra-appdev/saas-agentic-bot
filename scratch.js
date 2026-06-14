const fs = require('fs');
const db = JSON.parse(fs.readFileSync('packages/db/local_db_store.json', 'utf8'));
console.log(JSON.stringify(db.storefronts.filter(s => s.tenantSlug === 'imran-ai'), null, 2));
