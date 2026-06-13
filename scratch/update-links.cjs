const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/c/[tenant]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert localIp state
if (!content.includes('const [localIp, setLocalIp] = useState')) {
  content = content.replace(
    /const \[agentsList, setAgentsList\] = useState<any\[\]>\(\[\]\);/,
    'const [agentsList, setAgentsList] = useState<any[]>([]);\n  const [localIp, setLocalIp] = useState("localhost");\n  useEffect(() => {\n    fetch("/api/sys/ip").then(r => r.json()).then(data => { if (data.ip) setLocalIp(data.ip); }).catch(() => {});\n  }, []);'
  );
}

// 1. E-Commerce Store
content = content.replace(
  /(<a href=\{\`\/b\/\$\{tenantSlug\}\`\} target="_blank" className="bg-indigo-500\/20.*?<\/a>\n\s*<\/div>)/,
  `$1\n                      {localIp !== "localhost" && (\n                        <div className="flex items-center gap-2 mt-2">\n                          <input type="text" readOnly value={\`http://\${localIp}:4022/b/\${tenantSlug}\`} className="flex-grow bg-black/60 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-[11px] text-indigo-300 font-mono" />\n                          <button type="button" onClick={() => { navigator.clipboard.writeText(\`http://\${localIp}:4022/b/\${tenantSlug}\`); showToast("Mobile Link Copied!"); }} className="bg-indigo-600/20 hover:bg-indigo-500/40 border border-indigo-500/30 px-3.5 py-2.5 rounded-xl text-indigo-300 flex items-center justify-center cursor-pointer transition">\n                            <Copy className="h-4 w-4" />\n                          </button>\n                        </div>\n                      )}`
);

// 2. AI Agent App
content = content.replace(
  /(<a href=\{\`\/b\/\$\{tenantSlug\}\/agent_default\`\} target="_blank" className="bg-purple-500\/20.*?<\/a>\n\s*<\/div>)/,
  `$1\n                      {localIp !== "localhost" && (\n                        <div className="flex items-center gap-2 mt-2">\n                          <input type="text" readOnly value={\`http://\${localIp}:4022/b/\${tenantSlug}/agent_default\`} className="flex-grow bg-black/60 border border-purple-500/30 rounded-xl px-3 py-2.5 text-[11px] text-purple-300 font-mono" />\n                          <button type="button" onClick={() => { navigator.clipboard.writeText(\`http://\${localIp}:4022/b/\${tenantSlug}/agent_default\`); showToast("Mobile Link Copied!"); }} className="bg-purple-600/20 hover:bg-purple-500/40 border border-purple-500/30 px-3.5 py-2.5 rounded-xl text-purple-300 flex items-center justify-center cursor-pointer transition">\n                            <Copy className="h-4 w-4" />\n                          </button>\n                        </div>\n                      )}`
);

// 3. POS Terminal
content = content.replace(
  /(<a href=\{\`\/b\/\$\{tenantSlug\}\/pos\`\} target="_blank" className="bg-emerald-500\/20.*?<\/a>\n\s*<\/div>)/,
  `$1\n                      {localIp !== "localhost" && (\n                        <div className="flex items-center gap-2 mt-2">\n                          <input type="text" readOnly value={\`http://\${localIp}:4022/b/\${tenantSlug}/pos\`} className="flex-grow bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-[11px] text-emerald-300 font-mono" />\n                          <button type="button" onClick={() => { navigator.clipboard.writeText(\`http://\${localIp}:4022/b/\${tenantSlug}/pos\`); showToast("Mobile Link Copied!"); }} className="bg-emerald-600/20 hover:bg-emerald-500/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-emerald-300 flex items-center justify-center cursor-pointer transition">\n                            <Copy className="h-4 w-4" />\n                          </button>\n                        </div>\n                      )}`
);

// 4. Delivery App
content = content.replace(
  /(<a href=\{\`\/b\/\$\{tenantSlug\}\/delivery\`\} target="_blank" className="bg-blue-500\/20.*?<\/a>\n\s*<\/div>)/,
  `$1\n                      {localIp !== "localhost" && (\n                        <div className="flex items-center gap-2 mt-2">\n                          <input type="text" readOnly value={\`http://\${localIp}:4022/b/\${tenantSlug}/delivery\`} className="flex-grow bg-black/60 border border-blue-500/30 rounded-xl px-3 py-2.5 text-[11px] text-blue-300 font-mono" />\n                          <button type="button" onClick={() => { navigator.clipboard.writeText(\`http://\${localIp}:4022/b/\${tenantSlug}/delivery\`); showToast("Mobile Link Copied!"); }} className="bg-blue-600/20 hover:bg-blue-500/40 border border-blue-500/30 px-3.5 py-2.5 rounded-xl text-blue-300 flex items-center justify-center cursor-pointer transition">\n                            <Copy className="h-4 w-4" />\n                          </button>\n                        </div>\n                      )}`
);

fs.writeFileSync(path, content);
console.log("Done updating Links.");
