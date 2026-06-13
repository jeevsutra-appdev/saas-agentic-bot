const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/c/[tenant]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject Handlers
if (!content.includes('const handleRiderAvatarUpload')) {
  content = content.replace(
    /const handleAvatarUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{/,
    `const handleRiderAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewRiderAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePosManagerAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPosManagerAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {`
  );
}

// Inject Rider Avatar Input
if (!content.includes('onChange={handleRiderAvatarUpload}')) {
  content = content.replace(
    /(<div className="flex flex-col gap-1\.5">\s*<label className="text-\[10px\] text-gray-400 font-semibold uppercase tracking-wide">Vehicle<\/label>)/,
    `<div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Avatar Image</label>
                      <input type="file" accept="image/*" onChange={handleRiderAvatarUpload} className="text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer" />
                    </div>\n                    $1`
  );
}

// Inject POS Manager Avatar Input
if (!content.includes('onChange={handlePosManagerAvatarUpload}')) {
  content = content.replace(
    /(<div className="flex flex-col gap-1\.5">\s*<label className="text-\[10px\] text-gray-400 font-semibold uppercase tracking-wide">Assigned Store<\/label>)/,
    `<div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Avatar Image</label>
                      <input type="file" accept="image/*" onChange={handlePosManagerAvatarUpload} className="text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer" />
                    </div>\n                    $1`
  );
}

// Update UI to display avatars for POS Managers
content = content.replace(
  /<div className="h-12 w-12 rounded-2xl bg-emerald-500\/10 border border-emerald-500\/20 flex items-center justify-center">.*?<\/div>/s,
  `<div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                          {mgr.avatar ? <img src={mgr.avatar} className="w-full h-full object-cover" /> : (tenantInfo?.brandLogo || storefrontsList[0]?.brandLogo) ? <img src={tenantInfo?.brandLogo || storefrontsList[0]?.brandLogo} className="w-full h-full object-cover" /> : <Store className="h-6 w-6 text-emerald-400" />}
                        </div>`
);

// Update UI to display avatars for Riders
content = content.replace(
  /<div className="h-12 w-12 rounded-2xl bg-white\/5 border border-white\/10 flex items-center justify-center">.*?<\/div>/s,
  `<div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          {boy.avatarUrl ? <img src={boy.avatarUrl} className="w-full h-full object-cover" /> : (tenantInfo?.brandLogo || storefrontsList[0]?.brandLogo) ? <img src={tenantInfo?.brandLogo || storefrontsList[0]?.brandLogo} className="w-full h-full object-cover opacity-50" /> : <Bike className="h-5 w-5 text-gray-400" />}
                        </div>`
);

fs.writeFileSync(path, content);
console.log("Admin Dashboard avatar forms injected.");
