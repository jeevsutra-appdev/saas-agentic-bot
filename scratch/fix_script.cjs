const fs = require('fs');
const content = fs.readFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/scratch/broken_end.tsx', 'utf8');

// The content starts with:
//   const renderBuyerPortal = () => {
//     return (
//       <AnimatePresence>
//         {showAuthDrawer && ( ... )}
//       </AnimatePresence>

// Then it continues with other modals like {showAcceptedModal ... }
// We want to rewrite the end of the file.

const fixedCode = `
  const renderBuyerPortal = () => {
    return (
      <AnimatePresence>
        {showAuthDrawer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
            <div className="absolute inset-0" onClick={() => setShowAuthDrawer(false)} />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 22 }}
              className="w-full bg-[#0a0c16] border-t border-white/10 rounded-t-[2.5rem] p-6 pb-12 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex-1 w-full relative h-full flex flex-col">
                <div className="absolute top-4 right-4 z-50">
                  <button type="button" onClick={() => setShowAuthDrawer(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition shadow-md cursor-pointer">
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
      </AnimatePresence>
    );
  };

  // MAIN RENDER
  return (
    <div className="w-full min-h-screen bg-[#04060c] relative text-white pb-24 font-sans overflow-x-hidden">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen pb-32 shadow-2xl bg-[#0a0c16]/50">
        {isFoodTemplate ? (
          <>
            {activeTab === "home" && renderFoodHome()}
            {activeTab === "catalog" && renderFoodCatalog()}
            {activeTab === "cart" && renderFoodCart()}
            {activeTab === "checkout" && renderFoodCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
             <div className="p-4 bg-indigo-500/20 rounded-full mb-4">
                <Settings2 className="h-8 w-8 text-indigo-400 animate-spin-slow" />
             </div>
             <h2 className="text-xl font-black text-white mb-2 tracking-tight">Retail Store Upgrading</h2>
             <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">We are optimizing this storefront for a better experience. Check back soon!</p>
          </div>
        )}
      </div>

      {/* RETAIL / MAIN NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-6">
        <div className="max-w-md mx-auto flex justify-between items-center pb-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "catalog", icon: Grid, label: "Menu" },
            { id: "cart", icon: ShoppingBag, label: "Cart", badge: cart.length },
            { id: "orders", icon: Clock, label: "Orders" }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={\`flex flex-col items-center gap-1.5 p-2 \${activeTab === item.id ? "text-indigo-400" : "text-gray-500 hover:text-gray-400"}\`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-indigo-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-black">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAB FOR CHAT */}
      <button 
        onClick={() => setShowAuthDrawer(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {/* MODALS */}
      {renderBuyerPortal()}
    </div>
  );
}
`;

fs.writeFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/scratch/fixed_end.tsx', fixedCode);
