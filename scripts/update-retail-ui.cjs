const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'apps', 'web', 'app', 'b', '[tenant]', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update isFood and add isRetail
content = content.replace(
  /const isFood = storeData\.storefront\?\.template === "food" \|\| storeData\.storefront\?\.template === "restaurant-v2-dark" \|\| storeData\.storefront\?\.template === "restaurant-v2-light" \|\| storeData\.storefront\?\.template === "retail" \|\| storeData\.storefront\?\.template === "ecom";/,
  `const isFood = storeData.storefront?.template === "food" || storeData.storefront?.template === "restaurant-v2-dark" || storeData.storefront?.template === "restaurant-v2-light";\n  const isRetail = storeData.storefront?.template === "retail" || storeData.storefront?.template === "ecom";`
);

// 2. Add renderRetail functions right before renderBuyerPortal
const retailFunctions = `
  // --- RETAIL TEMPLATE RENDER FUNCTIONS ---
  const renderRetailHome = () => (
    <div className="w-full pb-24 animate-fadeIn flex flex-col gap-8 md:gap-12 mt-4 md:mt-8">
      {/* Hero Section */}
      <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group border border-white/10">
        <img src={storeData.storefront?.heroImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-3 tracking-tighter leading-tight">{storeData.storefront?.heroText || storeData.storefront?.companyName || "Welcome to our store"}</h2>
            <p className="text-sm md:text-lg text-gray-300 font-medium max-w-lg mb-6 leading-relaxed">{storeData.storefront?.storeDescription || "Discover the best products curated just for you."}</p>
            <button onClick={() => setActiveTab("catalog")} className="bg-white text-black px-8 py-3.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest w-max hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">Shop Now</button>
          </motion.div>
        </div>
      </div>

      {/* Featured Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
          <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-400" /> Featured Products</h3>
          <button onClick={() => setActiveTab("catalog")} className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {storeData.products.slice(0, 8).map((p, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="group flex flex-col gap-3 cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="w-full aspect-[4/5] bg-white/[0.02] rounded-3xl overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all shadow-lg backdrop-blur-sm flex items-center justify-center">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-white/10" />
                )}
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-xl">Sale</div>
                )}
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="px-2">
                <h4 className="text-sm md:text-base font-bold text-white line-clamp-1">{p.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm md:text-base font-black text-indigo-400">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <span className="text-xs font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRetailCatalog = () => (
    <div className="w-full pb-24 animate-fadeIn mt-4 md:mt-8">
      <div className="flex justify-between items-end mb-8 px-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">All Products</h2>
          <p className="text-sm text-gray-400 font-medium">Showing {storeData.products.length} items</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {storeData.products.map((p, i) => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={i} className="group flex flex-col gap-3 cursor-pointer" onClick={() => setSelectedProduct(p)}>
            <div className="w-full aspect-[4/5] bg-white/[0.02] rounded-3xl overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all shadow-lg flex items-center justify-center">
              {p.image ? (
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
              ) : (
                <ShoppingBag className="w-8 h-8 text-white/10" />
              )}
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-xl">Sale</div>
              )}
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-sm md:text-base font-bold text-white line-clamp-1">{p.name}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm md:text-base font-black text-indigo-400">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderRetailCart = () => renderFoodCart(); 
  const renderRetailCheckout = () => renderFoodCheckout(); 

  const renderBuyerPortal = () => {`;

content = content.replace(/const renderBuyerPortal = \(\) => {/, retailFunctions);

// 3. Fix the Retail Store Upgrading fallback and inject the Desktop Top Nav
const fallbackRegex = /\{\s*isFood \? \([\s\S]*?\) : \([\s\S]*?<h2 className="text-xl font-black text-white mb-2 tracking-tight">Retail Store Upgrading<\/h2>[\s\S]*?We are optimizing this storefront for a better experience\. Check back soon!<\/p>\s*<\/div>\s*\)\s*\}/;

const newFallback = `{/* DESKTOP NAV FOR RETAIL */}
        {isRetail && (
          <div className="hidden md:flex items-center justify-between py-6 px-4 mb-8 border-b border-white/5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight">{storeData.storefront?.companyName || "Store"}</h1>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => setActiveTab("home")} className={\`text-sm font-bold uppercase tracking-widest transition-colors \${activeTab === "home" ? "text-indigo-400" : "text-gray-400 hover:text-white"}\`}>Home</button>
              <button onClick={() => setActiveTab("catalog")} className={\`text-sm font-bold uppercase tracking-widest transition-colors \${activeTab === "catalog" ? "text-indigo-400" : "text-gray-400 hover:text-white"}\`}>Shop</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab("cart")} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                {cart.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              <button onClick={() => setShowAuthDrawer(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition">
                <User className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {isFood ? (
          <>
            {activeTab === "home" && renderFoodHome()}
            {activeTab === "catalog" && renderFoodCatalog()}
            {activeTab === "cart" && renderFoodCart()}
            {activeTab === "checkout" && renderFoodCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : isRetail ? (
          <>
            {activeTab === "home" && renderRetailHome()}
            {activeTab === "catalog" && renderRetailCatalog()}
            {activeTab === "cart" && renderRetailCart()}
            {activeTab === "checkout" && renderRetailCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
             <h2 className="text-xl font-black text-white mb-2 tracking-tight">Retail Store Upgrading</h2>
             <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">We are optimizing this storefront for a better experience. Check back soon!</p>
          </div>
        )}`;

content = content.replace(fallbackRegex, newFallback);

// 4. Update Bottom Navigation Bar with lucide icons
const bottomNavRegex = /<div className="max-w-md md:max-w-5xl lg:max-w-7xl mx-auto flex justify-between items-center pb-2">[\s\S]*?\[[\s\S]*?\{ id: "home", label: "Home" \},[\s\S]*?\{ id: "catalog", label: "Menu" \},[\s\S]*?\{ id: "cart", label: "Cart" \},[\s\S]*?\{ id: "orders", label: "Orders" \},[\s\S]*?\]\.map\(\(item\) => \([\s\S]*?<button key=\{item\.id\} onClick=\{.*?\} className="flex flex-col items-center justify-center p-2 text-white\/50 hover:text-white transition group relative">[\s\S]*?<span className="text-\[10px\] font-black uppercase tracking-widest mt-1 group-hover:-translate-y-1 transition-transform">\{item\.label\}<\/span>[\s\S]*?\{activeTab === item\.id && <div className="absolute -bottom-1 left-1\/2 -translate-x-1\/2 w-1 h-1 rounded-full bg-white shadow-\[0_0_10px_rgba\(255,255,255,1\)\]" \/>\}[\s\S]*?<\/button>[\s\S]*?\)\)[\s\S]*?<\/div>/;

const newBottomNav = `<div className="max-w-md md:max-w-5xl lg:max-w-7xl mx-auto flex justify-between items-center pb-2">
          {[
            { id: "home", label: "Home", icon: <Home className="w-5 h-5 mb-1" /> },
            { id: "catalog", label: isRetail ? "Shop" : "Menu", icon: isRetail ? <Grid className="w-5 h-5 mb-1" /> : <Utensils className="w-5 h-5 mb-1" /> },
            { id: "cart", label: "Cart", icon: <ShoppingBag className="w-5 h-5 mb-1" /> },
            { id: "orders", label: "Orders", icon: <History className="w-5 h-5 mb-1" /> },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={\`flex flex-col items-center justify-center p-2 transition group relative \${activeTab === item.id ? 'text-indigo-400' : 'text-white/40 hover:text-white/80'}\`}>
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>`;

content = content.replace(bottomNavRegex, newBottomNav);


// 5. Fix ChatWidgetUI so it opens via isChatOpen instead of showAuthDrawer
// Find where showAuthDrawer conditionally renders ChatWidgetUI and fix it to use isChatOpen
const chatDrawerRegex = /\{showAuthDrawer && \([\s\S]*?<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\} exit=\{\{ opacity: 0 \}\} className="fixed inset-0 z-50 bg-black\/80 backdrop-blur-md flex flex-col justify-end">[\s\S]*?\{\/\* Sheet backdrop closer \*\/\}[\s\S]*?<div className="absolute inset-0" onClick=\{.*?\} \/>[\s\S]*?\{\/\* Native Sheet Drawer \*\/\}[\s\S]*?<motion\.div[\s\S]*?className="w-full bg-\[\#0a0c16\] border-t border-white\/10 rounded-t-\[2\.5rem\] p-6 pb-12 flex flex-col gap-6 max-h-\[90vh\] overflow-y-auto relative z-10 shadow-\[0_-20px_50px_rgba\(0,0,0,0\.5\)\]"[\s\S]*?>[\s\S]*?<div className="flex-1 w-full relative h-full flex flex-col">[\s\S]*?<div className="absolute top-4 right-4 z-50">[\s\S]*?<button type="button" onClick=\{.*?\} className="p-2 bg-white\/10 hover:bg-white\/20 rounded-full backdrop-blur transition shadow-md cursor-pointer">[\s\S]*?<X className="h-5 w-5 text-white" \/>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<ChatWidgetUI[\s\S]*?\/>[\s\S]*?<\/div>[\s\S]*?<\/motion\.div>[\s\S]*?<\/motion\.div>[\s\S]*?\)\}[\s\S]*?<\/AnimatePresence>/;

const newChatDrawer = `<AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
            {/* Sheet backdrop closer */}
            <div className="absolute inset-0" onClick={() => setIsChatOpen(false)} />
            
            {/* Native Sheet Drawer */}
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 22 }}
              className="w-full bg-[#0a0c16] border-t border-white/10 rounded-t-[2.5rem] p-6 pb-12 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
                        <div className="flex-1 w-full relative h-full flex flex-col">
             <div className="absolute top-4 right-4 z-50">
               <button type="button" onClick={() => setIsChatOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition shadow-md cursor-pointer">
                 <X className="h-5 w-5 text-white" />
               </button>
             </div>
             <ChatWidgetUI 
                tenantSlug={tenantSlug} 
                agentConfig={storeData.assignedAgent} 
                isPreviewMode={false} 
                overrideAgentId={storeData.assignedAgent?.id || storeData.storefront?.assignedAgentId} 
              />
           </div>
           </motion.div>
          </motion.div>
        )}
      </AnimatePresence>`;

content = content.replace(chatDrawerRegex, newChatDrawer);

// 6. Fix FAB chat button design and logic
const chatFabRegex = /\{\/\* FAB FOR CHAT \*\/\}\s*<button\s*onClick=\{\(\) => setShowAuthDrawer\(true\)\}\s*className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600\/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"\s*>\s*<span className="text-white text-xs font-bold">Chat<\/span>\s*<\/button>/;

const newChatFab = `{/* FAB FOR CHAT */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20 group"
      >
        <Sparkles className="text-white w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0c16] animate-pulse"></span>
      </button>`;

content = content.replace(chatFabRegex, newChatFab);


fs.writeFileSync(pagePath, content, 'utf8');
console.log('Update script finished successfully.');
