"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Scan, CheckCircle2, Box, Store } from "lucide-react";

export default function PosScannerApp() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = params.tenant as string;
  const storeId = searchParams.get("storeId"); // Important: bind scanner to a specific store

  const [storeData, setStoreData] = useState<any>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/ecom/pos-managers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", tenantSlug, phone: loginPhone, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem(`pos_mgr_${tenantSlug}`, JSON.stringify(data.manager));
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
    const stored = localStorage.getItem(`pos_mgr_${tenantSlug}`);
    if (stored) setIsAuthenticated(true);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`/api/ecom?tenant=${tenantSlug}${storeId ? `&shopId=${storeId}` : ""}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStoreData(data.storefront);
        }
      });

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false
    );
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      try {
        scanner.clear();
      } catch (e) {}
    };
  }, []);

  const playBeep = () => {
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
  };

  const onScanSuccess = async (decodedText: string) => {
    if (decodedText === lastScanned) return; // Prevent rapid double scans
    setLastScanned(decodedText);
    setScanStatus("success");
    playBeep();
    
    // Briefly show success state, then reset
    setTimeout(() => {
      setScanStatus("idle");
      setLastScanned(null);
    }, 2500);

    // Send to backend
    try {
      await fetch(`/api/ecom/scanner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, storeId, barcode: decodedText })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onScanFailure = (error: any) => {
    // Ignore routine failures (like no code found)
  };

  const primaryColor = storeData?.primaryColor || "#3b82f6";

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
  }
  const storeName = storeData?.name || "Store";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans max-w-md mx-auto relative overflow-hidden">
      <head>
        <title>{storeName} - POS Scanner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href={`/api/manifest/scanner?tenant=${tenantSlug}`} />
      </head>

      <header className="px-5 py-4 flex items-center justify-between text-white shadow-xl z-20" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6" />
          <span className="font-bold text-lg tracking-wide">{storeName} POS</span>
        </div>
        {installPrompt && (
          <button onClick={() => { installPrompt.prompt(); installPrompt.userChoice.then(() => setInstallPrompt(null)); }} className="mr-2 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors">
            Install App
          </button>
        )}
        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider">
          <Scan className="w-4 h-4" /> Scanner
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative p-4 bg-gray-900">
        <div className="w-full max-w-sm relative">
          
          <div className={`absolute -inset-4 bg-gradient-to-r rounded-3xl blur-xl opacity-20 transition-all duration-500 ${scanStatus === 'success' ? 'from-green-500 to-green-400 opacity-50' : `from-[${primaryColor}] to-blue-500`}`} />
          
          <div className="relative bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <div id="reader" className="w-full min-h-[300px]" style={{ border: 'none' }} />
          </div>

          <div className="mt-8 text-center space-y-2">
            {scanStatus === "success" ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-400">Scanned Successfully</h3>
                <p className="text-sm font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-lg mt-2 inline-block border border-white/10">{lastScanned}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Box className="w-8 h-8 mb-2 opacity-50" />
                <h3 className="text-lg font-medium text-white/80">Ready to Scan</h3>
                <p className="text-sm">Point your camera at a product barcode</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        #reader button {
          background-color: ${primaryColor} !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: bold !important;
          margin: 10px !important;
        }
        #reader select {
          padding: 8px !important;
          border-radius: 8px !important;
          background: #1f2937 !important;
          color: white !important;
          border: 1px solid #374151 !important;
          margin: 10px !important;
        }
        #reader a { display: none !important; }
        #reader img { display: none !important; }
      `}} />
    </div>
  );
}
