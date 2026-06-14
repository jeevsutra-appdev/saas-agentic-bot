const fs = require('fs');

const replacement = `  const renderRetailHome = () => {
    // Categories for pill swiper
    let categories: any[] = [];
    if (storeData.categories && storeData.categories.length > 0) {
       categories = storeData.categories.map((c: any) => ({ tag: c.id, name: c.name, image: c.image || null })).slice(0, 8);
    } else {
       categories = storeData.products
         .map(p => ({ tag: p.categoryId || "all", name: p.categoryId || "All" }))
         .filter((v, i, a) => a.findIndex(t => (t.tag === v.tag)) === i)
         .slice(0, 6);
    }

    const displayCategories = categories.length > 1 ? categories : [
      { tag: "new", name: "New In" },
      { tag: "bestsellers", name: "Best Sellers" },
      { tag: "accessories", name: "Accessories" },
      { tag: "clothing", name: "Clothing" },
      { tag: "shoes", name: "Footwear" },
    ];

    const layoutSequence = storeData.storefront?.layoutSequence || ["categories", "hero", "sale", "featured", "products"];

    const renderHeader = () => (
      <div className="w-full px-5 pt-6 pb-2 flex justify-between items-center z-30 sticky top-0 bg-[#04060c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] overflow-hidden">
              {storeData.storefront?.brandLogo ? (
                <img src={storeData.storefront.brandLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
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
    );

    const renderHero = (key: string) => (
      <div key={key} className="px-4 md:px-8">
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
    );

    const renderCategoriesSwiper = (key: string) => (
      <div key={key} className="pl-4 md:pl-8 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-6 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button onClick={() => setActiveTab("catalog")} className="relative overflow-hidden whitespace-nowrap px-8 py-4 rounded-3xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center min-w-[120px] shrink-0">
              <Grid className="w-4 h-4 mr-2" /> All
          </button>
          {displayCategories.map((c: any, i: number) => (
            <button 
              key={i} 
              onClick={() => { setSelectedFoodCategory(c.tag); setActiveTab("catalog"); }} 
              className="relative overflow-hidden whitespace-nowrap px-8 py-4 rounded-3xl bg-[#0a0c16] border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center min-w-[140px] shrink-0 group"
            >
              {c.image ? (
                <>
                  <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              )}
              <span className="relative z-10 drop-shadow-md">{c.name.replace(/^CAT_.*$/, 'Category')}</span>
            </button>
          ))}
        </div>
      </div>
    );

    const renderSale = (key: string) => {
      if (!storeData.storefront?.promoBannerImage) return null;
      return (
        <div key={key} className="px-4 md:px-8 cursor-pointer" onClick={() => setActiveTab("catalog")}>
          <div className="relative w-full aspect-[21/9] md:aspect-[32/9] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-rose-500/20 bg-rose-900/20">
            <img src={storeData.storefront.promoBannerImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" alt="Promo" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
              <span className="text-rose-400 font-black tracking-widest text-xs uppercase mb-2">Limited Time Offer</span>
              <h3 className="text-2xl md:text-4xl font-black text-white">{storeData.storefront.promoBannerText || "Special Flash Sale!"}</h3>
            </div>
          </div>
        </div>
      );
    };

    const renderProductRow = (key: string, title: string, productsList: any[]) => {
      if (!productsList || productsList.length === 0) return null;
      return (
        <div key={key} className="pl-4 md:pl-8">
          <div className="flex justify-between items-end mb-6 pr-4 md:pr-8">
            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">{title}</h3>
            <button onClick={() => setActiveTab("catalog")} className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">See All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-8 pr-4 md:pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
            {productsList.map((p, i) => (
              <div key={i} className="min-w-[220px] md:min-w-[280px] snap-start group cursor-pointer bg-[#0c0e14] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col" onClick={() => setSelectedProduct(p)}>
                <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/50 to-transparent h-[60%] mt-auto"></div>
                  
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_5px_rgba(255,59,48,0.8)] animate-pulse"></div>
                      SPECIAL OFFER
                    </div>
                  )}
                </div>
                
                <div className="p-4 pt-2 flex flex-col gap-1 flex-1 justify-between">
                  <h4 className="text-sm md:text-base font-black text-white leading-tight line-clamp-2">{p.name}</h4>
                  
                  <div className="flex flex-col mt-2">
                    {p.compareAtPrice && p.compareAtPrice > p.price ? (
                      <span className="text-[10px] font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-transparent opacity-0 line-through">0</span>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg md:text-xl font-black text-[#ffc107]">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <div className="flex items-center gap-1.5 border border-[#ffc107]/20 bg-[#ffc107]/5 rounded-[4px] px-1.5 py-0.5">
                           <div className="w-1 h-1 rounded-full bg-[#ffc107]"></div>
                           <span className="text-[9px] font-black text-[#ffc107] tracking-widest">14:59</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="w-10 h-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <ExternalLink className="w-4 h-4 text-white/70" />
                    </button>
                    <button 
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#ffd000] to-[#ffb300] hover:from-[#ffdf33] hover:to-[#ffc020] text-black text-[11px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(255,193,7,0.2)] hover:shadow-[0_4px_20px_rgba(255,193,7,0.4)] transition-all active:scale-95"
                      onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderFooter = () => (
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
    );

    return (
      <div className="w-full pb-32 animate-fadeIn flex flex-col gap-10">
        {renderHeader()}
        {layoutSequence.map((section: string, idx: number) => {
          const key = \`section-\${idx}-\${section}\`;
          switch (section) {
            case "hero": return renderHero(key);
            case "categories": return renderCategoriesSwiper(key);
            case "sale": return renderSale(key);
            case "featured": 
              const featuredIds = storeData.storefront?.featuredProductIds || [];
              const featuredProds = storeData.products.filter(p => featuredIds.includes(p.id));
              return renderProductRow(key, "Featured Spotlight", featuredProds);
            case "products": 
              return renderProductRow(key, "New Arrivals", storeData.products.slice(0, 6));
            default: return null;
          }
        })}
        {renderFooter()}
      </div>
    );
  };`;

const file = 'apps/web/app/b/[tenant]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('const renderRetailHome = () => {');
const endIdx = content.indexOf('const renderRetailCatalog = () => (');

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start or end index.");
} else {
  const newContent = content.substring(0, startIdx) + replacement + '\n\n  ' + content.substring(endIdx);
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("Successfully replaced renderRetailHome!");
}
