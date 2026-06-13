const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/c/[tenant]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [newPosManagerAvatar, setNewPosManagerAvatar]')) {
  content = content.replace(
    /const \[newPosManagerPassword, setNewPosManagerPassword\] = useState\(""\);/,
    'const [newPosManagerPassword, setNewPosManagerPassword] = useState("");\n  const [newPosManagerAvatar, setNewPosManagerAvatar] = useState("");'
  );
}

content = content.replace(
  /body: JSON\.stringify\(\{ action: "create", tenantSlug, name: newPosManagerName, phone: newPosManagerPhone, password: newPosManagerPassword, storeId: newPosManagerStore \}\)/g,
  'body: JSON.stringify({ action: "create", tenantSlug, name: newPosManagerName, phone: newPosManagerPhone, password: newPosManagerPassword, storeId: newPosManagerStore, avatar: newPosManagerAvatar })'
);

content = content.replace(
  /setNewPosManagerName\(""\); setNewPosManagerPhone\(""\); setNewPosManagerPassword\(""\);/g,
  'setNewPosManagerName(""); setNewPosManagerPhone(""); setNewPosManagerPassword(""); setNewPosManagerAvatar("");'
);

fs.writeFileSync(path, content);
console.log('Admin states updated.');
