const fs = require('fs');
let lines = fs.readFileSync('apps/web/app/c/[tenant]/page.tsx', 'utf-8').split('\n');

const tabButton = `            <button 
              onClick={() => { setActiveTab("landing-pages"); setIsMobileMenuOpen(false); }}
              className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer \${activeTab === "landing-pages" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}\`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              <span>Funnels & Pages</span>
            </button>`;

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('E-Commerce Setup')) {
    // Found the Ecom tab. Skip down past the closing </button>
    lines.splice(i+3, 0, tabButton);
    break;
  }
}

const listView = `        {/* FUNNELS & LANDING PAGES TAB */}
        {activeTab === "landing-pages" && (
          <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 text-gray-200 h-full overflow-y-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                  <span>Landing Page Studio</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Build high-converting sales funnels, link them to products, and maximize AOV.
                </p>
              </div>
              <a href={\`/c/\${tenantSlug}/lp/new\`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                + Create New Funnel
              </a>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-500"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              <h3 className="text-lg font-bold text-white mb-2">No landing pages yet</h3>
              <p className="text-sm text-gray-400 max-w-sm">Create your first highly-optimized landing page funnel and link it to an existing product to start generating sales.</p>
            </div>
            
          </div>
        )}`;

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('{/* BILLING & CREDITS TAB */}')) {
    lines.splice(i, 0, listView);
    break;
  }
}

fs.writeFileSync('apps/web/app/c/[tenant]/page.tsx', lines.join('\n'));
