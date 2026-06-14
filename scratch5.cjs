const fs = require('fs');
const db = JSON.parse(fs.readFileSync('apps/db/local_db.json', 'utf8'));
const products = db.products.filter(p => p.tenantSlug === 'imran-ai');
const categories = db.categories.filter(c => c.tenantSlug === 'imran-ai');
const storefronts = db.storefronts.filter(s => s.tenantSlug === 'imran-ai');
console.log(`Products: ${products.length}, Categories: ${categories.length}, Storefront: ${storefronts.length}`);
console.log('Storefront config:', JSON.stringify(storefronts[0], null, 2));
console.log('Sample product:', products.length > 0 ? JSON.stringify(products[0], null, 2) : 'None');
