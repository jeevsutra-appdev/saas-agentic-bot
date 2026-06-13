const fs = require('fs');
const path = 'c:/App developement/Demo apps for clients/saas Agentic bot/apps/web/app/b/[tenant]/scanner/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add Install Prompt & Auth State
if (!content.includes('const [installPrompt, setInstallPrompt] = useState<any>(null);')) {
  content = content.replace(
    /const \[scanStatus, setScanStatus\] = useState<"idle" \| "success" \| "error"\>\("idle"\);/,
    `const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");`
  );
}

// Add Auth + Install Prompt useEffects
if (!content.includes('window.addEventListener("beforeinstallprompt"')) {
  content = content.replace(
    /useEffect\(\(\) => \{/,
    `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(\`/api/ecom/pos-managers\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", tenantSlug, phone: loginPhone, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem(\`pos_mgr_\${tenantSlug}\`, JSON.stringify(data.manager));
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch(e) { setLoginError("Network error"); }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Auth check
    const stored = localStorage.getItem(\`pos_mgr_\${tenantSlug}\`);
    if (stored) setIsAuthenticated(true);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;`
  );
}

// Add conditional Auth Render
if (!content.includes('if (!isAuthenticated) {')) {
  content = content.replace(
    /const primaryColor = storeData\?\.primaryColor \|\| "#3b82f6";/,
    `const primaryColor = storeData?.primaryColor || "#3b82f6";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-emerald-900/20 to-black z-0"></div>
        <div className="w-full max-w-sm bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Scan className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">Scanner Login</h2>
          <p className="text-center text-gray-400 text-sm mb-8">Enter POS Manager credentials</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Phone Number</label>
              <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-gray-600" placeholder="e.g. +1234567890" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-gray-600" placeholder="••••••••" required />
            </div>
            {loginError && <p className="text-red-400 text-xs text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2 shadow-lg shadow-emerald-500/25">Login to Scanner</button>
          </form>
        </div>
      </div>
    );
  }`
  );
}

// Add Install App Button
if (!content.includes('installPrompt.prompt()')) {
  content = content.replace(
    /<div className="flex items-center gap-1\.5 bg-black\/20 px-3 py-1\.5 rounded-full text-xs font-bold tracking-wider">/,
    `{installPrompt && (
          <button onClick={() => { installPrompt.prompt(); installPrompt.userChoice.then(() => setInstallPrompt(null)); }} className="mr-2 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">
            Install App
          </button>
        )}
        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider">`
  );
}

fs.writeFileSync(path, content);
console.log("Scanner App updated with Auth and PWA prompt.");
