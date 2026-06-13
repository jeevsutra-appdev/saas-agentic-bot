import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Star, Play } from 'lucide-react';
import { ContainerElement } from '../elements/ContainerElement';

export const LeadGenSection = () => {
  const { connectors: { connect, drag } } = useNode();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="relative w-full overflow-hidden bg-[#030407] border-y border-white/5 py-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-[800px]"
    >
      {/* 2026 Grade Dynamic Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-indigo-500/10 to-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-emerald-500/10 to-teal-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: High-Impact Copy & Trust */}
        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider uppercase w-fit shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Voted #1 Conversion Engine 2026</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-sans">
            Transform Traffic into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
              Revenue Instantly.
            </span>
          </h1>

          <p className="text-base text-gray-400 leading-relaxed max-w-lg">
            Stop losing 90% of your visitors. Deploy our agentic lead capture system and watch your conversion rates double overnight. Seamless integration with n8n and CRM routing.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {[
              "Instant AI Lead Qualification",
              "Automated CRM Webhook Injection",
              "Dual-Region Secure Checkouts"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-6 border-t border-white/10">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#030407] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-[10px] text-white font-bold">U{i}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5"><span className="text-white font-bold">4.9/5</span> from 2,000+ founders</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Lead Form */}
        <div className="w-full max-w-md mx-auto relative group" 
             onMouseEnter={() => setIsHovered(true)} 
             onMouseLeave={() => setIsHovered(false)}>
          
          {/* Reactive Glow behind the form */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 ${isHovered ? 'animate-pulse' : ''}`}></div>
          
          <div className="relative w-full rounded-3xl premium-glass bg-[#0a0d1a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl flex flex-col gap-6">
            
            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-2xl font-bold text-white tracking-tight">Claim Your Early Access</h3>
              <p className="text-xs text-gray-400">Join 10,000+ beta testers today.</p>
            </div>

            <form className="flex flex-col gap-4 mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="elon@spacex.com" 
                  className="w-full bg-[#030407] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Company Size</label>
                <select className="w-full bg-[#030407] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition shadow-inner appearance-none">
                  <option>1-10 Employees</option>
                  <option>11-50 Employees</option>
                  <option>50+ Employees</option>
                </select>
              </div>

              <button className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all flex items-center justify-center gap-2 group/btn">
                <span>Deploy Workspace Now</span>
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-gray-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>SSL Secured & GDPR Compliant</span>
            </div>
            
          </div>
          
          {/* Floating Action Video Teaser */}
          <div className="absolute -bottom-6 -left-6 bg-white/[0.05] border border-white/10 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 shadow-xl hover:scale-105 transition cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Play className="h-4 w-4 text-white ml-0.5" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Watch Demo</span>
              <span className="text-xs text-white font-medium">2 mins overview</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

LeadGenSection.craft = {
  displayName: 'Lead Gen / Hero',
  props: {},
  rules: {
    canDrag: () => true,
  }
};
