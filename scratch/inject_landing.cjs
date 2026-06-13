const fs = require('fs');
let lines = fs.readFileSync('apps/web/app/c/[tenant]/page.tsx', 'utf-8').split('\n');

// 1. Update the state declaration for activeTab
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useState<"overview" | "playground"')) {
    lines[i] = lines[i].replace('"ecom"', '"ecom" | "landing"');
    break;
  }
}

// 2. Inject the sidebar button right after "E-Commerce Setup"
const buttonHtml = `            <button 
              onClick={() => { setActiveTab("landing"); setIsMobileMenuOpen(false); }}
              className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer \${activeTab === "landing" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}\`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Landing Page Studio</span>
            </button>`;

let injected = false;
for (let i = 0; i < lines.length; i++) {
  // We look for the "E-Commerce Setup" button which spans a few lines. We can look for the closing button tag after finding "E-Commerce Setup"
  if (lines[i].includes('E-Commerce Setup')) {
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('</button>')) {
        lines.splice(j + 1, 0, buttonHtml);
        injected = true;
        break;
      }
    }
    break;
  }
}

// Ensure the icon LayoutDashboard is imported
let layoutDashboardImported = false;
let importLucideIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('import {') && lines[i].includes('lucide-react')) {
    importLucideIdx = i;
    if (lines[i].includes('LayoutDashboard')) {
      layoutDashboardImported = true;
    }
    break;
  }
}

if (!layoutDashboardImported && importLucideIdx !== -1) {
  lines[importLucideIdx] = lines[importLucideIdx].replace('import {', 'import { LayoutDashboard, LayoutTemplate, Smartphone, Monitor, MousePointer2, Type, Image as ImageIcon, Box, Rows, Columns, ArrowLeft, Eye, Save, Plus, Palette, Settings2, Trash2, Copy, Play, Undo2, Redo2, CheckCircle2, AlertCircle, ShoppingCart as ShoppingCartIcon, UploadCloud, ChevronRight, CornerDownRight, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Link as LinkIcon, Component, Layers, Zap, MousePointerClick, MessageSquare, ChevronDown, Check, Loader2, Sparkles, Move, SplitSquareHorizontal, PanelLeft, PanelRight, Type as TypeIcon, Image as ImageIcon2, PlayCircle, Star, CheckSquare, Phone, List, MoreVertical, Search, Menu, X, Code, ExternalLink, Globe, Layout, Lock, Server, Shield, Activity, CreditCard, Key, Database, Workflow, ShoppingBag, Terminal, Video,')
}

// 3. Inject the early return structure for the Full-Screen Dashboard
// We can inject it right before the "E-COMMERCE OS" block
const landingPageOS = `
  // ==========================================
  // DEDICATED FULL-SCREEN LANDING PAGE STUDIO
  // ==========================================
  if (activeTab === "landing") {
    return (
      <div className="min-h-screen bg-[#02040a] text-gray-100 flex overflow-hidden w-full relative selection:bg-indigo-500/30">
        
        {/* Dynamic Background Blurs */}
        <div className="absolute top-1/4 right-1/3 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Sidebar */}
        <aside 
          className={\`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0d18] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col \${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }\`}
        >
          {/* Header: Back to main OS */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
            <button 
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Exit Builder</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Logo Brand Header */}
          <div className="p-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutTemplate className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white font-heading leading-tight">Funnel Studio</h2>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wide">{tenantSlug?.toUpperCase()}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 flex flex-col gap-1.5 text-sm font-medium flex-grow overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-2">Builder Tools</div>
            
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500">
              <Component className="h-4 w-4" />
              <span>UI Components</span>
            </button>
            
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Layers className="h-4 w-4" />
              <span>Page Layers</span>
            </button>

            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Layout className="h-4 w-4" />
              <span>Templates</span>
            </button>
            
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-6">Funnel Config</div>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Sparkles className="h-4 w-4" />
              <span>AI Copy Writer</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Activity className="h-4 w-4" />
              <span>A/B Testing</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area (Canvas + Header) */}
        <main className="flex-grow flex flex-col overflow-hidden z-10 relative bg-[#070913]">
          
          {/* Builder Toolbar */}
          <header className="h-16 border-b border-white/5 bg-[#0a0d18] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer">
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white font-heading">High-Converting Checkout Funnel</h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">Draft</span>
                </div>
                <p className="text-[10px] text-gray-500">Unsaved changes • Last edited 2m ago</p>
              </div>
            </div>

            {/* Device Toggles */}
            <div className="hidden md:flex items-center bg-black/40 p-1 rounded-lg border border-white/5">
              <button className="p-1.5 px-3 rounded-md bg-white/10 text-white shadow-sm flex items-center justify-center">
                <Monitor className="h-4 w-4" />
              </button>
              <button className="p-1.5 px-3 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition">
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
                <button className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Undo2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition">
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20">
                <Save className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </header>

          {/* Canvas Wrapper */}
          <div className="flex-grow overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDIwVjAuNWgyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')]">
             
             {/* Stub Page Frame */}
             <div className="w-full max-w-4xl min-h-[800px] bg-white rounded-xl shadow-2xl flex flex-col relative group">
                <div className="absolute -top-3 -left-3 -right-3 -bottom-3 border-2 border-indigo-500/0 group-hover:border-indigo-500/50 rounded-2xl pointer-events-none transition duration-300 border-dashed" />
                
                {/* Visual Placeholder for Studio */}
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <MousePointerClick className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-gray-800">Drag components here</h3>
                  <p className="text-sm">Select from the UI Components panel to start building.</p>
                </div>

             </div>
          </div>

        </main>

        {/* Right Sidebar (Settings) */}
        <aside className="hidden xl:flex w-80 bg-[#0a0d18] border-l border-white/5 flex-col shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center px-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Component Settings</h3>
          </div>
          <div className="flex-grow p-6 flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <Settings2 className="h-8 w-8 text-gray-500" />
            <p className="text-xs text-gray-500">Select an element on the canvas to edit its properties.</p>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

      </div>
    );
  }
`;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (activeTab === "ecom") {')) {
    lines.splice(i, 0, landingPageOS);
    break;
  }
}

fs.writeFileSync('apps/web/app/c/[tenant]/page.tsx', lines.join('\n'));
console.log('Sidebar injected and Fullscreen landing page OS returned.');
