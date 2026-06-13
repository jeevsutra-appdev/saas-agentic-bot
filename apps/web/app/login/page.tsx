"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, LogIn, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Dynamic route target determined by the authenticated user role
        if (data.role === "super_admin") {
          showToast("Welcome back Super Admin! Redirecting...", "success");
          router.push("/admin");
        } else {
          showToast(`Success! Logging into workspace "${data.tenantSlug}"`, "success");
          router.push(`/c/${data.tenantSlug}`);
        }
      } else {
        showToast(data.error || "Authentication failed.", "error");
      }
    } catch (err) {
      showToast("Error: Network failure calling /api/login.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-gray-100 flex flex-col justify-center items-center p-6 overflow-x-hidden relative">
      
      {/* Premium Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="premium-glass bg-[#0a0d1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-red-500/10'}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {toast.type === 'success' ? 'System Notice' : 'System Error'}
              </span>
              <span className="text-sm font-semibold text-white mt-0.5">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Background Blurs - using transform-gpu and will-change-transform to prevent typing lag on heavy paints */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none transform-gpu will-change-transform" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none transform-gpu will-change-transform" />

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl premium-glass border border-white/5 p-8 flex flex-col gap-6 shadow-2xl z-10 bg-[#0c0e1a]/80 backdrop-blur-md"
      >
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5.5 w-5.5 text-white pulse-indicator" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading mt-2">Sign in to Aether AI</h2>
          <p className="text-xs text-gray-400 max-w-[280px]">
            Access your multi-tenant dashboards, telemetry data, and custom bots.
          </p>
        </div>

        {/* Toggle between Credentials and Magic Link */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold select-none">
          <button 
            type="button"
            onClick={() => setIsMagicLink(false)}
            className={`py-2 rounded-lg cursor-pointer text-center transition ${!isMagicLink ? "bg-indigo-600/10 text-indigo-300" : "text-gray-400 hover:text-white"}`}
          >
            Password Sign In
          </button>
          <button 
            type="button"
            onClick={() => setIsMagicLink(true)}
            className={`py-2 rounded-lg cursor-pointer text-center transition ${isMagicLink ? "bg-indigo-600/10 text-indigo-300" : "text-gray-400 hover:text-white"}`}
          >
            Magic Link
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="flex items-center bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-white flex-grow placeholder:text-gray-600 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#0c0e1a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                autoComplete="email"
              />
            </div>
          </div>

          {!isMagicLink && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                <a href="#" className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline">Forgot password?</a>
              </div>
              <div className="flex items-center bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                <Lock className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-white flex-grow placeholder:text-gray-600 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#0c0e1a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  autoComplete="current-password"
                />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isMagicLink ? "Send Magic Link" : "Sign In to Console"}</span>
                <LogIn className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-1 select-none">
          <div className="h-px bg-white/5 flex-grow" />
          <span className="text-[10px] text-gray-500 mx-3 uppercase tracking-wider font-mono">Or Continue With</span>
          <div className="h-px bg-white/5 flex-grow" />
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
          <button 
            type="button"
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 p-3 border border-white/10 rounded-xl hover:bg-white/[0.05] transition cursor-pointer text-white"
          >
            <Github className="h-4 w-4 text-white" />
            <span>GitHub</span>
          </button>
          <button 
            type="button"
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 p-3 border border-white/10 rounded-xl hover:bg-white/[0.05] transition cursor-pointer text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-gray-500 select-none">
          New user? Registering will automatically walk you through the onboarding studio.
        </div>

      </motion.div>

    </div>
  );
}
