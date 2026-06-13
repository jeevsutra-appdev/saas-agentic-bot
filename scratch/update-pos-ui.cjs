const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/b/[tenant]/pos/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Scanner state
if (!content.includes('const [isScannerActive, setIsScannerActive] = useState(false);')) {
  content = content.replace(
    /const \[loggedInManager, setLoggedInManager\] = useState<any>\(null\);/,
    'const [loggedInManager, setLoggedInManager] = useState<any>(null);\n  const [isScannerActive, setIsScannerActive] = useState(false);\n  const scannerRef = useRef<any>(null);'
  );
}

// Add Html5QrcodeScanner import
if (!content.includes('Html5QrcodeScanner')) {
  content = content.replace(
    /import \{ .*?\} from "lucide-react";/,
    `$& \nimport { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";`
  );
}

// Add scanner effect
if (!content.includes('useEffect(() => {\n    if (isScannerActive) {')) {
  content = content.replace(
    /const handlePosLogout = \(\) => \{/s,
    `const handleScanSuccess = (decodedText: string) => {
    const product = products.find(p => p.id === decodedText || p.id.includes(decodedText));
    if (product) {
      addToCart(product);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (isScannerActive) {
      const scanner = new Html5QrcodeScanner(
        "pos-reader",
        { fps: 10, qrbox: { width: 250, height: 150 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
        false
      );
      scannerRef.current = scanner;
      scanner.render(handleScanSuccess, () => {});
    } else {
      if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch(e) {}
        scannerRef.current = null;
      }
    }
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch(e) {}
      }
    };
  }, [isScannerActive, products]);\n\n  const handlePosLogout = () => {`
  );
}

// Replace header profile
content = content.replace(
  /<div className="hidden md:flex items-center gap-2\.5 bg-white pr-3 pl-1\.5 py-1\.5 rounded-full border border-gray-200 shadow-sm shrink-0">.*?<\/div>\s*<\/header>/s,
  `<div className="hidden md:flex items-center gap-2.5 bg-white pr-3 pl-1.5 py-1.5 rounded-full border border-gray-200 shadow-sm shrink-0">
            {loggedInManager?.avatar ? (
               <img src={loggedInManager.avatar} alt="Cashier" className="h-8 w-8 rounded-full object-cover" />
            ) : (
               <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">{loggedInManager?.name?.[0] || 'A'}</div>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-800 leading-tight">{loggedInManager?.name || 'Cashier'}</span>
              <span className="text-[9px] text-gray-400 font-medium">POS Manager</span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
          </div>
        </header>`
);

// Add scanner button and container to header
content = content.replace(
  /<div className="relative flex-grow max-w-xl">/,
  `<button onClick={() => setIsScannerActive(!isScannerActive)} className={\`mr-3 p-2 rounded-xl transition \${isScannerActive ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}\`}>
             <Scan className="h-5 w-5" />
          </button>
          <div className="relative flex-grow max-w-xl">`
);

// Add scanner div overlay
if (!content.includes('id="pos-reader"')) {
  content = content.replace(
    /\{isScannerActive && \(\s*<div className="fixed inset-0.*?<\/div>\s*\)\}/s,
    '' // remove if exists just in case
  );
  
  content = content.replace(
    /<div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl md:rounded-r-3xl z-10 relative">/s,
    `<div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl md:rounded-r-3xl z-10 relative">
        {isScannerActive && (
          <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-4 rounded-3xl w-full max-w-md relative">
               <button onClick={() => setIsScannerActive(false)} className="absolute -top-12 right-0 bg-white/20 p-2 rounded-full text-white hover:bg-white/40">
                 <X className="h-6 w-6" />
               </button>
               <h3 className="text-center font-bold text-lg mb-4 text-gray-800">Scan Product Barcode</h3>
               <div id="pos-reader" className="w-full overflow-hidden rounded-xl border-2 border-emerald-500"></div>
             </div>
          </div>
        )}`
  );
}

fs.writeFileSync(path, content);
console.log("POS UI updated with scanner and avatar.");
