const fs = require('fs');

const original = fs.readFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/b/[tenant]/page.tsx', 'utf8');

// We need to find "const renderBuyerPortal = () => {"
const index1 = original.indexOf('const renderBuyerPortal = () => {');
if (index1 === -1) {
  console.log('Could not find renderBuyerPortal');
  process.exit(1);
}

const beforeBuyerPortal = original.substring(0, index1);
const fromBuyerPortal = original.substring(index1);

// Inside fromBuyerPortal, find where the first AnimatePresence ends (which is the Chat drawer)
// It ends with:
//         )}
//       </AnimatePresence>
// 
//       {/* PREMIUM LIVE ORDER ACCEPTED MODAL */}

const index2 = fromBuyerPortal.indexOf('{/* PREMIUM LIVE ORDER ACCEPTED MODAL */}');

let renderBuyerPortalCode = fromBuyerPortal.substring(0, index2);
let restOfFile = fromBuyerPortal.substring(index2); // this contains all the modals and ends with </div> ); }

// Fix renderBuyerPortalCode
renderBuyerPortalCode = renderBuyerPortalCode.replace('return (', 'return ( <>');
renderBuyerPortalCode += `\n      </>\n    );\n  };\n\n`;

// Now fix the rest of the file
// The rest of the file contains the modals, and ends with:
//     </div>
//   );
// }

// We need to inject the main return start before the modals!
const mainReturnStart = `
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
             <h2 className="text-xl font-black text-white mb-2 tracking-tight">Retail Store Upgrading</h2>
             <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">We are optimizing this storefront for a better experience. Check back soon!</p>
          </div>
        )}
      </div>

      {/* RETAIL / MAIN NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-6">
        <div className="max-w-md mx-auto flex justify-between items-center pb-2">
          {[
            { id: "home", label: "Home" },
            { id: "catalog", label: "Menu" },
            { id: "cart", label: "Cart", badge: cart.length },
            { id: "orders", label: "Orders" }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={\`flex flex-col items-center gap-1.5 p-2 \${activeTab === item.id ? "text-indigo-400" : "text-gray-500 hover:text-gray-400"}\`}
            >
              <div className="relative">
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
        <span className="text-white text-xs font-bold">Chat</span>
      </button>

      {/* MODALS */}
`;

const finalFile = beforeBuyerPortal + renderBuyerPortalCode + mainReturnStart + restOfFile;

fs.writeFileSync('c:/App developement/Demo apps for clients/saas Agentic bot/scratch/reconstructed_page.tsx', finalFile);
console.log('Reconstructed successfully!');
