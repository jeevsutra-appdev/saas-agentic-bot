"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Bot, 
  Palette, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  MessageSquare,
  Play
} from "lucide-react";

type Step = 1 | 2 | 3;
type Preset = "nimbus" | "onyx" | "sakura" | "kiosk" | "concierge";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [companyName, setCompanyName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [botName, setBotName] = useState("");
  const [industry, setIndustry] = useState("ecommerce");
  const [selectedPreset, setSelectedPreset] = useState<Preset>("nimbus");

  const industries = [
    { id: "ecommerce", name: "E-Commerce / Retail", desc: "Plugs in cart, search, payments & order details" },
    { id: "kitchen", name: "Restaurants / Kitchens", desc: "Enables interactive menus, COD options & checkout" },
    { id: "clinics", name: "Clinics / Salons / Coaches", desc: "Hosts dynamic scheduling calendar & slot pickers" },
    { id: "saas", name: "SaaS / Agencies Support", desc: "Automates ticket triage & routes CRM webhooks" }
  ];

  const presets = [
    { id: "nimbus", name: "Nimbus", vibe: "SaaS / B2B Glassmorphic" },
    { id: "onyx", name: "Onyx", vibe: "Pure Dark Monospace" },
    { id: "sakura", name: "Sakura", vibe: "Warm Peach Wellness" },
    { id: "kiosk", name: "Kiosk", vibe: "High-Contrast Retail" },
    { id: "concierge", name: "Concierge", vibe: "Ivory Luxury Serif" }
  ];

  const handleSlugGen = (val: string) => {
    setCompanyName(val);
    setWorkspaceSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleNextStep = () => {
    if (step === 1 && !companyName.trim()) return;
    if (step === 2 && !botName.trim()) return;
    setStep((prev) => (prev + 1) as Step);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const initialTemp = industry === "kitchen" ? "food" : "retail";

    // Simulate database registration & onboarding setup
    setTimeout(() => {
      setLoading(false);
      // Redirect to the client workspace dashboard
      router.push(`/c/${workspaceSlug || "demo"}?template=${initialTemp}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-gray-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-600 selection:text-white" data-theme={selectedPreset}>
      
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Mini Header */}
      <header className="px-8 py-6 max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-tight font-heading">Aether AI</span>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          Wizard Progress: Step {step} of 3
        </div>
      </header>

      {/* Main Form Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        
        {/* Left Side: Onboarding Steps */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-indigo-400" : ""}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 1 ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-gray-700"}`}>1</span>
              <span>Workspace</span>
            </div>
            <div className="h-px bg-gray-800 flex-grow max-w-[40px]" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-indigo-400" : ""}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 2 ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-gray-700"}`}>2</span>
              <span>Bot Setup</span>
            </div>
            <div className="h-px bg-gray-800 flex-grow max-w-[40px]" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-indigo-400" : ""}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 3 ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-gray-700"}`}>3</span>
              <span>Theme Preset</span>
            </div>
          </div>

          <form onSubmit={handleSubmitOnboarding} className="flex flex-col gap-6">
            
            {/* STEP 1: Company Profile & Workspace Setup */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-indigo-400" />
                    <span>Create your workspace</span>
                  </h2>
                  <p className="text-sm text-gray-400 max-w-md">
                    Set up your business profile. This holds your plans, team credentials, and billing details.
                  </p>
                </div>

                <div className="flex flex-col gap-4 max-w-md">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-300">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lucky Film Studio"
                      value={companyName}
                      onChange={(e) => handleSlugGen(e.target.value)}
                      className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder:text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-300">Workspace Slug</label>
                    <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                      <span className="text-gray-600 mr-1 select-none font-mono">aether.ai/c/</span>
                      <input
                        type="text"
                        required
                        placeholder="lucky-films"
                        value={workspaceSlug}
                        onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                        className="bg-transparent border-none p-0 focus:outline-none text-white flex-grow font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">Your workspace web dashboard address.</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!companyName.trim()}
                  onClick={handleNextStep}
                  className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 w-fit cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Bot Configurations</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Bot Setup & Industry Template */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight flex items-center gap-3">
                    <Bot className="h-8 w-8 text-indigo-400" />
                    <span>Configure your first AI Bot</span>
                  </h2>
                  <p className="text-sm text-gray-400 max-w-md">
                    Choose the name of your agent and its target industry template.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 max-w-md">
                    <label className="text-xs font-semibold text-gray-300">Bot Persona Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aether Concierge"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder:text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-300">Select Industry Template</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                      {industries.map((ind) => (
                        <div
                          key={ind.id}
                          onClick={() => setIndustry(ind.id)}
                          className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-1.5 transition-all ${
                            industry === ind.id 
                              ? "border-indigo-500 bg-indigo-500/5" 
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="font-semibold text-sm text-white flex items-center justify-between">
                            <span>{ind.name}</span>
                            {industry === ind.id && <Check className="h-4 w-4 text-indigo-400" />}
                          </span>
                          <span className="text-xs text-gray-400 leading-relaxed">{ind.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="border border-white/10 hover:bg-white/[0.05] text-white font-semibold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!botName.trim()}
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Branding Preset</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Brand Identity Customizer */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight flex items-center gap-3">
                    <Palette className="h-8 w-8 text-indigo-400" />
                    <span>Choose Bot Visual Theme Preset</span>
                  </h2>
                  <p className="text-sm text-gray-400 max-w-md">
                    Choose a starting visual theme. You can fully customize specific CSS overrides later inside the designer dashboard.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-semibold text-gray-300">Preset Choices</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPreset(p.id as Preset)}
                        className={`p-3 rounded-xl border flex flex-col gap-1 items-center justify-center text-center cursor-pointer transition-all ${
                          selectedPreset === p.id 
                            ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" 
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tight">{p.vibe}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="border border-white/10 hover:bg-white/[0.05] text-white font-semibold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Initializing...</span>
                      </span>
                    ) : (
                      <>
                        <span>Finish & Launch Dashboard</span>
                        <Play className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

        </section>

        {/* Right Side: High Fidelity Visual Mockup */}
        <section className="lg:col-span-5 flex flex-col justify-center">
          <div className="text-xs uppercase tracking-widest font-mono text-indigo-400 mb-2 font-semibold">Live Bot Theme Preview</div>
          <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border bg-bg/95 flex flex-col h-[420px] transition-all duration-500">
            
            {/* Header */}
            <div className="p-3 bg-muted border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white relative shadow">
                  <MessageSquare className="h-4 w-4" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border border-muted" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-fg font-heading">{botName || "Aether Agent"}</h3>
                  <p className="text-[9px] text-muted-fg font-mono uppercase tracking-wider">Supports: {industry.toUpperCase()}</p>
                </div>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-fg/20" />
            </div>

            {/* Content stream */}
            <div className="flex-grow p-4 flex flex-col gap-3 justify-end overflow-hidden">
              <div className="self-start bg-muted border border-border text-fg rounded-2xl rounded-bl-none p-3 text-xs leading-relaxed max-w-[85%]">
                Hello! I am customized for <span className="font-semibold text-primary">{industry.replace("-", " ")}</span>. Once launched, you can start testing calendar schedulers, Stripe buttons, or webhook events live in this screen!
              </div>
              <div className="self-end bg-primary text-white rounded-2xl rounded-br-none p-3 text-xs leading-relaxed max-w-[85%]">
                How does this theme look?
              </div>
              <div className="self-start bg-muted border border-border text-fg rounded-2xl rounded-bl-none p-3 text-xs leading-relaxed max-w-[85%]">
                It looks like the premium <span className="font-bold text-primary">{selectedPreset.toUpperCase()}</span> design! Pick any other preset on the left to see the changes instantly.
              </div>
            </div>

            {/* Input Mock */}
            <div className="p-2 border-t border-border bg-muted/60 flex items-center gap-2">
              <div className="flex-grow bg-bg border border-border rounded-lg px-3 py-2 text-[10px] text-muted-fg font-mono select-none">
                Preview Mode - Typing locked...
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Mini Footer */}
      <footer className="px-8 py-6 text-center text-xs text-gray-600 max-w-6xl mx-auto w-full border-t border-white/5">
        Aether AI Enterprise Onboarding Pipeline. All telemetry is encrypted end-to-end.
      </footer>

    </div>
  );
}
