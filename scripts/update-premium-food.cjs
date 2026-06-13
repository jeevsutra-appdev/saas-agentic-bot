const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'apps', 'web', 'app', 'b', '[tenant]', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add isPremiumFood logic
content = content.replace(
  /const isRetail = storeData\.storefront\?\.template === "retail" \|\| storeData\.storefront\?\.template === "ecom";/,
  `const isRetail = storeData.storefront?.template === "retail" || storeData.storefront?.template === "ecom";\n  const isPremiumFood = storeData.storefront?.template === "food-v3";`
);

// 2. Add renderPremiumFood functions
const premiumFoodFunctions = `
  // --- PREMIUM FIGMA-STYLE FOOD UI (food-v3) ---
  const renderPremiumFoodHome = () => {
    const foodOffers = storeData.storefront?.kitchenOffers?.length ? storeData.storefront.kitchenOffers : [
      { id: "o1", title: "50% OFF", description: "Up to ₹100 on your first order", code: "WELCOME50", bg: "from-orange-500 to-red-500" },
      { id: "o2", title: "Free Delivery", description: "On orders above ₹199", code: "FREEDEL", bg: "from-blue-500 to-indigo-500" }
    ];

    const popularCategories = storeData.products
      .map(p => ({ tag: p.categoryId || "all", name: p.categoryId || "All" }))
      .filter((v, i, a) => a.findIndex(t => (t.tag === v.tag)) === i);
      
    // Default categories if store doesn't have them
    const displayCategories = popularCategories.length > 1 ? popularCategories : [
      { tag: "burger", name: "Burgers", icon: "🍔" },
      { tag: "pizza", name: "Pizza", icon: "🍕" },
      { tag: "sushi", name: "Sushi", icon: "🍣" },
      { tag: "healthy", name: "Healthy", icon: "🥗" },
      { tag: "dessert", name: "Desserts", icon: "🍩" },
    ];

    return (
      <div className="w-full pb-24 animate-fadeIn flex flex-col pt-4">
        {/* Figma Style Location Header */}
        <div className="px-4 flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-500" /> Deliver to
            </span>
            <div className="flex items-center gap-1 mt-0.5 cursor-pointer">
              <span className="text-sm font-black text-white truncate max-w-[200px]">Current Location, City...</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button onClick={() => setShowAuthDrawer(true)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer shadow-lg">
            <User className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Figma Style Modern Search Bar */}
        <div className="px-4 mb-6">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-12 flex items-center px-4 shadow-inner">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search for food, restaurants..." 
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                value={foodSearchQuery}
                onChange={e => {
                  setFoodSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) setActiveTab("catalog");
                }}
              />
            </div>
            <button className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 transition-all cursor-pointer">
              <Grid className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Horizontal Offer Carousel */}
        <div className="pl-4 mb-8 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 pr-4 snap-x hide-scrollbar">
            {foodOffers.map((offer: any, i: number) => (
              <div key={i} className={\`min-w-[280px] h-36 rounded-3xl bg-gradient-to-br \${offer.bg || 'from-orange-500 to-red-600'} p-5 flex flex-col justify-between shadow-lg snap-center relative overflow-hidden\`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{offer.title}</h3>
                  <p className="text-white/80 text-xs font-bold mt-1">{offer.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full">{offer.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Slider */}
        <div className="mb-8">
          <div className="px-4 flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-white">Categories</h3>
            <button onClick={() => setActiveTab("catalog")} className="text-xs font-bold text-orange-500">See All</button>
          </div>
          <div className="pl-4 flex gap-4 overflow-x-auto pb-2 pr-4 hide-scrollbar">
            {displayCategories.map((c: any, i: number) => (
              <button 
                key={i} 
                onClick={() => { setSelectedFoodCategory(c.tag); setActiveTab("catalog"); }} 
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-sm hover:bg-white/10 hover:border-orange-500/50 transition-all">
                  {c.icon || <Utensils className="w-6 h-6 text-gray-300" />}
                </div>
                <span className="text-[11px] font-bold text-gray-300 text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Near You (Figma Style Cards) */}
        <div className="px-4 mb-6">
          <h3 className="text-base font-black text-white mb-4">Popular Near You</h3>
          <div className="flex flex-col gap-5">
            {storeData.products.slice(0, 5).map((p, i) => (
              <div key={i} className="flex flex-col gap-3 group cursor-pointer" onClick={() => setSelectedProduct(p)}>
                <div className="w-full h-48 rounded-3xl bg-white/5 overflow-hidden relative shadow-md">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-8 h-8 text-white/10" /></div>
                  )}
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white text-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-black">4.8</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full shadow-lg group-hover:bg-orange-500 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black text-white">{p.name}</h4>
                    <span className="text-base font-black text-orange-500">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{p.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Clock className="w-3 h-3 text-gray-500" /> 20-30 min
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Bike className="w-3 h-3 text-gray-500" /> Free Delivery
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumFoodCatalog = () => {
    // We will reuse the same logic for filtering as regular food catalog
    let filteredList = [...storeData.products];
    if (selectedFoodCategory) {
      filteredList = filteredList.filter(p => p.categoryId === selectedFoodCategory || p.tags?.includes(selectedFoodCategory));
    }
    if (foodSearchQuery.trim()) {
      filteredList = filteredList.filter(p => p.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(foodSearchQuery.toLowerCase()));
    }
    if (foodTypeFilter === "veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("veg") && !p.tags?.includes("non-veg"));
    } else if (foodTypeFilter === "non-veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("non-veg"));
    }

    return (
      <div className="w-full pb-24 animate-fadeIn pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white">Menu</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setFoodTypeFilter("all")} className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase \${foodTypeFilter === "all" ? "bg-white text-black" : "bg-white/10 text-gray-400"}\`}>All</button>
            <button onClick={() => setFoodTypeFilter("veg")} className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 \${foodTypeFilter === "veg" ? "bg-green-500 text-white" : "bg-white/10 text-gray-400"}\`}><span className="w-2 h-2 rounded-full bg-green-400 border border-white/50" /> Veg</button>
            <button onClick={() => setFoodTypeFilter("non-veg")} className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 \${foodTypeFilter === "non-veg" ? "bg-red-500 text-white" : "bg-white/10 text-gray-400"}\`}><span className="w-2 h-2 rounded-full bg-red-400 border border-white/50" /> Non-Veg</button>
          </div>
        </div>
        
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-white/20 mb-4" />
            <p className="font-bold text-gray-400">No items match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredList.map((p, i) => (
              <div key={i} className="bg-white/5 rounded-3xl p-3 flex gap-4 cursor-pointer hover:bg-white/10 transition-colors border border-white/5" onClick={() => setSelectedProduct(p)}>
                <div className="w-28 h-28 rounded-2xl bg-black/40 overflow-hidden relative shrink-0">
                   {p.image ? (
                    <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-6 h-6 text-white/10" /></div>
                  )}
                  {p.tags?.includes("veg") && !p.tags?.includes("non-veg") && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5 shadow-sm"><div className="w-2 h-2 bg-green-500 rounded-full" /></div>}
                  {p.tags?.includes("non-veg") && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5 shadow-sm"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>}
                </div>
                <div className="flex-1 flex flex-col justify-center py-1">
                  <h4 className="text-sm font-black text-white leading-tight mb-1 line-clamp-2">{p.name}</h4>
                  <span className="text-sm font-black text-orange-500 mb-2">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
                    </div>
                    <button className="bg-white/10 hover:bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPremiumFoodCart = () => renderFoodCart(); // Clean cart is acceptable
  const renderPremiumFoodCheckout = () => renderFoodCheckout(); 

  const renderBuyerPortal = () => {`;

content = content.replace(/const renderBuyerPortal = \(\) => {/, premiumFoodFunctions);

// 3. Inject into the main layout conditions
const conditionRegex = /\{isFood \? \([\s\S]*?\)\s*:\s*isRetail \? \([\s\S]*?\)\s*:\s*\([\s\S]*?<\/div>\s*\)\s*\}/;

const newCondition = `{isPremiumFood ? (
          <>
            {activeTab === "home" && renderPremiumFoodHome()}
            {activeTab === "catalog" && renderPremiumFoodCatalog()}
            {activeTab === "cart" && renderPremiumFoodCart()}
            {activeTab === "checkout" && renderPremiumFoodCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : isFood ? (
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
             <h2 className="text-xl font-black text-white mb-2 tracking-tight">Store Upgrading</h2>
             <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">We are optimizing this storefront for a better experience. Check back soon!</p>
          </div>
        )}`;

content = content.replace(conditionRegex, newCondition);

// 4. Update the bottom menu icon colors specifically for Premium Food UI
const bottomNavRegex = /<button key=\{item\.id\} onClick=\{\(\) => setActiveTab\(item\.id as any\)\} className=\{`flex flex-col items-center justify-center p-2 transition group relative \$\{activeTab === item\.id \? 'text-indigo-400' : 'text-white\/40 hover:text-white\/80'\}`\}>/;

const newBottomNav = `<button key={item.id} onClick={() => setActiveTab(item.id as any)} className={\`flex flex-col items-center justify-center p-2 transition group relative \${activeTab === item.id ? (isPremiumFood ? 'text-orange-500' : 'text-indigo-400') : 'text-white/40 hover:text-white/80'}\`}>`;

content = content.replace(bottomNavRegex, newBottomNav);

// 5. Update top nav bg style if it is premium food
const bgStyleRegex = /const bgStyle = \{ backgroundColor: isLightMode \? "\#f3f4f6" : \(isFood \? "\#05070e" : "\#04060c"\) \};/;
content = content.replace(bgStyleRegex, `const bgStyle = { backgroundColor: isLightMode ? "#f3f4f6" : ((isFood || isPremiumFood) ? "#05070e" : "#04060c") };`);


fs.writeFileSync(pagePath, content, 'utf8');
console.log('Update script for Premium Food UI finished successfully.');
