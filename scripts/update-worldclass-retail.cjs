const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'apps', 'web', 'app', 'b', '[tenant]', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Replace the Retail Render Functions entirely
const oldRetailRegex = /\/\/ --- RETAIL TEMPLATE RENDER FUNCTIONS ---[\s\S]*?const renderRetailCheckout = \(\) => renderFoodCheckout\(\);\s*/;

const newRetailFunctions = `// --- WORLD-CLASS RETAIL TEMPLATE RENDER FUNCTIONS ---
  const renderRetailHome = () => {
    // Categories for pill swiper
    const categories = storeData.products
      .map(p => ({ tag: p.categoryId || "all", name: p.categoryId || "All" }))
      .filter((v, i, a) => a.findIndex(t => (t.tag === v.tag)) === i)
      .slice(0, 6);

    const displayCategories = categories.length > 1 ? categories : [
      { tag: "new", name: "New In" },
      { tag: "bestsellers", name: "Best Sellers" },
      { tag: "accessories", name: "Accessories" },
      { tag: "clothing", name: "Clothing" },
      { tag: "shoes", name: "Footwear" },
    ];

    return (
      <div className="w-full pb-32 animate-fadeIn flex flex-col gap-10">
        {/* PREMIUM NATIVE HEADER (Mobile & Desktop) */}
        <div className="w-full px-5 pt-6 pb-2 flex justify-between items-center z-30 sticky top-0 bg-[#04060c]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
               <Sparkles className="w-5 h-5" />
             </div>
             <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white">
               {storeData.storefront?.companyName || "Store"}
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab("catalog")} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
               <Search className="w-5 h-5 text-white" />
             </button>
             <button onClick={() => setShowAuthDrawer(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
               <User className="w-5 h-5 text-white" />
             </button>
          </div>
        </div>

        {/* EDGE-TO-EDGE IMMERSIVE HERO */}
        <div className="px-4 md:px-8">
          <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10 bg-black">
            <img src={storeData.storefront?.heroImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4 inline-block shadow-lg border border-white/20">New Collection</span>
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-[1.1]">{storeData.storefront?.heroText || "Discover True Elegance"}</h2>
                <button onClick={() => setActiveTab("catalog")} className="mt-4 bg-white text-black px-8 py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* SWIPABLE CATEGORY PILLS */}
        <div className="pl-4 md:pl-8 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 pr-4 hide-scrollbar">
            <button onClick={() => setActiveTab("catalog")} className="whitespace-nowrap px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-2">
               <Grid className="w-4 h-4" /> All
            </button>
            {displayCategories.map((c: any, i: number) => (
              <button 
                key={i} 
                onClick={() => { setSelectedFoodCategory(c.tag); setActiveTab("catalog"); }} 
                className="whitespace-nowrap px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* NEW ARRIVALS HORIZONTAL FEED */}
        <div className="pl-4 md:pl-8">
          <div className="flex justify-between items-end mb-6 pr-4 md:pr-8">
            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">New Arrivals</h3>
            <button onClick={() => setActiveTab("catalog")} className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">See All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-8 pr-4 md:pr-8 hide-scrollbar snap-x">
            {storeData.products.slice(0, 6).map((p, i) => (
              <div key={i} className="min-w-[220px] md:min-w-[280px] snap-start group cursor-pointer" onClick={() => setSelectedProduct(p)}>
                <div className="w-full aspect-[3/4] rounded-3xl bg-[#0a0c16] overflow-hidden relative shadow-2xl border border-white/5 group-hover:border-white/20 transition-all">
                  {p.image ? (
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-white/10" /></div>
                  )}
                  {/* Premium Badge */}
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shadow-xl">Sale</div>
                  )}
                  {/* Glassmorphic Add Button */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex justify-between items-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-black text-white">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                  </div>
                </div>
                <div className="mt-4 px-1">
                  <h4 className="text-sm md:text-base font-bold text-white/90 line-clamp-1">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs md:text-sm font-black text-white">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                    {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <span className="text-[10px] font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREMIUM FOOTER */}
        <div className="mt-12 mx-4 md:mx-8 bg-[#0a0c16] rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col items-center text-center shadow-xl">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
             <Sparkles className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">{storeData.storefront?.companyName || "Premium Store"}</h2>
           <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">Experience world-class quality and exceptional service. Designed with passion for the modern lifestyle.</p>
           
           <div className="flex gap-6 mb-8">
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Star className="w-4 h-4 text-white" /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Heart className="w-4 h-4 text-white" /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Mail className="w-4 h-4 text-white" /></a>
           </div>

           <div className="w-full h-[1px] bg-white/5 mb-8"></div>
           
           <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <span>•</span>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
             <span>•</span>
             <a href="#" className="hover:text-white transition-colors">Contact Us</a>
           </div>
        </div>
      </div>
    );
  };

  const renderRetailCatalog = () => (
    <div className="w-full pb-32 animate-fadeIn mt-4 md:mt-8 px-4 md:px-8">
      {/* PREMIUM HEADER FOR CATALOG */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#04060c]/90 backdrop-blur-xl z-20 pt-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">Collection</h2>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">{storeData.products.length} Products Available</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-95">
           <Grid className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {storeData.products.map((p, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="group cursor-pointer flex flex-col" onClick={() => setSelectedProduct(p)}>
            <div className="w-full aspect-[3/4] bg-[#0a0c16] rounded-[2rem] overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all shadow-lg flex items-center justify-center">
              {p.image ? (
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" alt={p.name} />
              ) : (
                <ShoppingBag className="w-8 h-8 text-white/10" />
              )}
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shadow-xl border border-white/10">Sale</div>
              )}
              {/* Pill shaped add to bag */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-2.5 px-4 flex justify-between items-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-xs font-black text-white uppercase tracking-widest">Add</span>
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4 px-2 text-center">
              <h4 className="text-sm md:text-base font-bold text-white/90 line-clamp-1">{p.name}</h4>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className="text-sm md:text-base font-black text-white">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <span className="text-[10px] font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderRetailCart = () => renderFoodCart(); 
  const renderRetailCheckout = () => renderFoodCheckout(); 
`;

content = content.replace(oldRetailRegex, newRetailFunctions);


// 2. Remove the old Desktop Top Nav that was floating around because we integrated it directly into renderRetailHome and renderRetailCatalog.
// The old Desktop nav looked like: {/* DESKTOP NAV FOR RETAIL */} {isRetail && (<div className="hidden md:flex... </div>)}
const oldDesktopNavRegex = /\{\/\* DESKTOP NAV FOR RETAIL \*\/\}\s*\{isRetail && \([\s\S]*?<\/div>\s*\)\}/;
content = content.replace(oldDesktopNavRegex, '');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Update script finished successfully.');
