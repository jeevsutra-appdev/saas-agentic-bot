'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, Element } from '@craftjs/core';
import {
  Layers, Blocks, Palette, Wand2, LayoutTemplate, Search,
  Type, MousePointerClick, Image as ImageIcon, Video, Box, Minus,
  SeparatorHorizontal, Timer, Star, Users, BarChart3, Shield,
  Zap, Columns3, AlignLeft
} from 'lucide-react';

// Elements
import { TextElement } from '../components/elements/TextElement';
import { ButtonElement } from '../components/elements/ButtonElement';
import { ImageElement } from '../components/elements/ImageElement';
import { VideoElement } from '../components/elements/VideoElement';
import { FormElement } from '../components/elements/FormElement';
import { ContainerElement } from '../components/elements/ContainerElement';
import { SpacerElement, DividerElement } from '../components/elements/SpacerDivider';
import { CountdownTimer } from '../components/elements/CountdownTimer';
import { TestimonialCard } from '../components/elements/TestimonialCard';
import { SocialProofBar } from '../components/elements/SocialProofBar';
import { ScarcityBar } from '../components/elements/ScarcityBar';
import { TrustBadgeStrip } from '../components/elements/TrustBadgeStrip';
import { IconBlock } from '../components/elements/IconBlock';
import { ColumnsLayout } from '../components/elements/ColumnsLayout';

// Sections
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { PricingSection } from '../components/sections/PricingSection';
import { FAQSection } from '../components/sections/FAQSection';
import { LeadGenSection } from '../components/sections/LeadGenSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { SocialProofSection } from '../components/sections/SocialProofSection';

// Templates Panel
import { TemplatesPanel } from './TemplatesPanel';

// Store
import { usePageBuilderStore } from '../store/pageBuilderStore';

type Tab = 'templates' | 'blocks' | 'layers' | 'seo' | 'settings' | 'ai';

// ─── Draggable Element Tile ───────────────────────────────────────────────────
const ElementTile = ({
  refCb, label, icon, color = 'indigo', badge,
}: {
  refCb: (ref: HTMLDivElement | null) => void;
  label: string;
  icon: React.ReactNode;
  color?: string;
  badge?: string;
}) => {
  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-500/25 bg-indigo-500/8 text-indigo-400 hover:bg-indigo-500/15',
    emerald: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15',
    red:     'border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15',
    amber:   'border-amber-500/25 bg-amber-500/8 text-amber-400 hover:bg-amber-500/15',
    violet:  'border-violet-500/25 bg-violet-500/8 text-violet-400 hover:bg-violet-500/15',
    cyan:    'border-cyan-500/25 bg-cyan-500/8 text-cyan-400 hover:bg-cyan-500/15',
    gray:    'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10',
  };
  return (
    <div
      ref={refCb}
      className={`relative h-14 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${colorMap[color] || colorMap.gray}`}
    >
      {badge && (
        <div className="absolute -top-1 -right-1 bg-emerald-500 text-[7px] text-black font-black px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </div>
      )}
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{label}</span>
    </div>
  );
};

// ─── Section Tile ─────────────────────────────────────────────────────────────
const SectionTile = ({
  refCb, label, sublabel, color = '#6366f1', badge,
}: {
  refCb: (ref: HTMLDivElement | null) => void;
  label: string;
  sublabel?: string;
  color?: string;
  badge?: string;
}) => (
  <div
    ref={refCb}
    className="relative h-16 rounded-xl border border-white/10 bg-white/4 flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing hover:bg-white/8 hover:border-white/20 transition-all duration-150 select-none group px-2"
  >
    {badge && (
      <div className="absolute -top-1 -right-1 text-[7px] font-black px-1.5 py-0.5 rounded-full leading-none" style={{ backgroundColor: color, color: '#fff' }}>
        {badge}
      </div>
    )}
    <span className="text-xs font-bold text-white group-hover:text-white transition-colors">{label}</span>
    {sublabel && <span className="text-[9px] text-gray-600 group-hover:text-gray-400 transition-colors">{sublabel}</span>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const LeftSidebar = () => {
  const { connectors } = useEditor();
  const [activeTab, setActiveTab] = useState<Tab>('blocks');
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const { pageSettings, setPageSettings } = usePageBuilderStore();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // AI Copy State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState('headline');
  const [aiTone, setAiTone] = useState('professional');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCopy = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/landing-pages/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, type: aiType, tone: aiTone, tenantSlug }),
      });
      const data = await res.json();
      if (data.success) setAiResult(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings' && products.length === 0) {
      setIsLoadingProducts(true);
      fetch(`/api/ecom?tenant=${tenantSlug}`)
        .then((res) => res.json())
        .then((data) => { if (data.success && data.products) setProducts(data.products); })
        .catch(console.error)
        .finally(() => setIsLoadingProducts(false));
    }
  }, [activeTab, tenantSlug]);

  // ─── Tab definitions ─────────────────────────────────────────────────────
  const row1Tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'templates', icon: <LayoutTemplate className="h-3.5 w-3.5" />, label: 'Templates' },
    { id: 'blocks',    icon: <Blocks className="h-3.5 w-3.5" />,         label: 'Blocks' },
    { id: 'layers',    icon: <Layers className="h-3.5 w-3.5" />,         label: 'Layers' },
  ];
  const row2Tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'seo',      icon: <Search className="h-3.5 w-3.5" />,    label: 'SEO' },
    { id: 'settings', icon: <Palette className="h-3.5 w-3.5" />,   label: 'Settings' },
    { id: 'ai',       icon: <Wand2 className="h-3.5 w-3.5" />,     label: 'AI Copy' },
  ];

  const tabClass = (id: Tab) => {
    const isActive = activeTab === id;
    if (id === 'templates') return `flex-1 p-2 flex flex-col items-center gap-0.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/25 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`;
    if (id === 'ai') return `flex-1 p-2 flex flex-col items-center gap-0.5 rounded-lg transition-colors ${isActive ? 'bg-purple-600/25 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`;
    if (id === 'seo') return `flex-1 p-2 flex flex-col items-center gap-0.5 rounded-lg transition-colors ${isActive ? 'bg-cyan-600/25 text-cyan-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`;
    return `flex-1 p-2 flex flex-col items-center gap-0.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`;
  };

  return (
    <div className="w-[280px] h-full bg-[#070A13] border-r border-white/10 flex flex-col shrink-0">

      {/* Tabs — 2 rows of 3 */}
      <div className="flex flex-col border-b border-white/10 bg-[#0A0D18] p-2 gap-1">
        <div className="flex items-center gap-1">
          {row1Tabs.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={tabClass(id)}>
              {icon}
              <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {row2Tabs.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={tabClass(id)}>
              {icon}
              <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

        {/* ── TEMPLATES ── */}
        {activeTab === 'templates' && <TemplatesPanel />}

        {/* ── BLOCKS ── */}
        {activeTab === 'blocks' && (
          <div className="flex flex-col gap-6">

            {/* Sections */}
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <AlignLeft className="w-3 h-3 text-indigo-400" /> Sections
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <HeroSection />); }} label="Hero" sublabel="Full-Width" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <LeadGenSection />); }} label="Lead Gen" sublabel="High Conv." color="#10b981" badge="HOT" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <FeaturesSection />); }} label="Features" sublabel="Benefit Grid" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <TestimonialsSection />); }} label="Testimonials" sublabel="Social Proof" color="#FBBF24" badge="NEW" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <PricingSection />); }} label="Pricing" sublabel="Plans" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <FAQSection />); }} label="FAQs" sublabel="Objections" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <SocialProofSection />); }} label="Social Proof" sublabel="Logos + Stats" color="#06b6d4" badge="NEW" />
                <SectionTile refCb={(ref) => { if (ref) connectors.create(ref, <CTASection />); }} label="CTA" sublabel="Conversion" color="#ef4444" badge="NEW" />
              </div>
            </div>

            {/* Basic Elements */}
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Box className="w-3 h-3 text-indigo-400" /> Basic Elements
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <TextElement />); }} label="Text" icon={<Type className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <ButtonElement />); }} label="Button" icon={<MousePointerClick className="w-3.5 h-3.5" />} color="indigo" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <ImageElement />); }} label="Image" icon={<ImageIcon className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <VideoElement />); }} label="Video" icon={<Video className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <Element is={ContainerElement} canvas />); }} label="Container" icon={<Box className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <FormElement />); }} label="Form" icon={<AlignLeft className="w-3.5 h-3.5" />} color="violet" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <SpacerElement />); }} label="Spacer" icon={<Minus className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <DividerElement />); }} label="Divider" icon={<SeparatorHorizontal className="w-3.5 h-3.5" />} color="gray" />
                <ElementTile refCb={(ref) => { if (ref) connectors.create(ref, <ColumnsLayout />); }} label="Columns" icon={<Columns3 className="w-3.5 h-3.5" />} color="violet" />
              </div>
            </div>

            {/* Conversion Elements */}
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Conversion <span className="text-amber-400">Elements</span></span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <CountdownTimer />); }}
                  label="Countdown" icon={<Timer className="w-3.5 h-3.5" />} color="red" badge="FOMO"
                />
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <TestimonialCard />); }}
                  label="Testimonial" icon={<Star className="w-3.5 h-3.5" />} color="amber"
                />
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <SocialProofBar />); }}
                  label="Proof Bar" icon={<Users className="w-3.5 h-3.5" />} color="cyan"
                />
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <ScarcityBar />); }}
                  label="Scarcity" icon={<BarChart3 className="w-3.5 h-3.5" />} color="red" badge="FOMO"
                />
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <TrustBadgeStrip />); }}
                  label="Trust Badges" icon={<Shield className="w-3.5 h-3.5" />} color="emerald"
                />
                <ElementTile
                  refCb={(ref) => { if (ref) connectors.create(ref, <IconBlock />); }}
                  label="Icon Block" icon={<Zap className="w-3.5 h-3.5" />} color="violet"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── LAYERS ── */}
        {activeTab === 'layers' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Layers className="w-8 h-8 text-gray-700" />
            <p className="text-xs text-gray-500">Layer tree panel coming soon</p>
            <p className="text-[10px] text-gray-700">Select elements on canvas to inspect hierarchy</p>
          </div>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-1 border-b border-white/8">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">SEO Settings</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold">Page Title</label>
                <input
                  type="text"
                  value={pageSettings.seoTitle || ''}
                  onChange={(e) => setPageSettings({ seoTitle: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-cyan-500 text-xs"
                  placeholder="e.g. Best Landing Page Builder..."
                />
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-600">Recommended: 50–60 characters</p>
                  <span className={`text-[9px] font-bold ${(pageSettings.seoTitle || '').length > 60 ? 'text-red-400' : 'text-gray-600'}`}>
                    {(pageSettings.seoTitle || '').length}/60
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold">Meta Description</label>
                <textarea
                  value={pageSettings.seoDescription || ''}
                  onChange={(e) => setPageSettings({ seoDescription: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-cyan-500 text-xs h-24 resize-none"
                  placeholder="Describe your page for search engines..."
                />
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-600">Recommended: 150–160 characters</p>
                  <span className={`text-[9px] font-bold ${(pageSettings.seoDescription || '').length > 160 ? 'text-red-400' : 'text-gray-600'}`}>
                    {(pageSettings.seoDescription || '').length}/160
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold">OG Image URL</label>
                <input
                  type="url"
                  value={pageSettings.ogImage || ''}
                  onChange={(e) => setPageSettings({ ogImage: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-cyan-500 text-xs"
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold">Canonical URL (optional)</label>
                <input
                  type="url"
                  value={pageSettings.canonicalUrl || ''}
                  onChange={(e) => setPageSettings({ canonicalUrl: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-cyan-500 text-xs"
                  placeholder="https://yourdomain.com/page"
                />
              </div>
              {/* SEO Score */}
              <div className="mt-2 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                <p className="text-[10px] text-cyan-400/80 font-semibold mb-2">SEO Checklist</p>
                {[
                  { label: 'Title set', done: !!pageSettings.seoTitle },
                  { label: 'Description set', done: !!pageSettings.seoDescription },
                  { label: 'Title length OK', done: (pageSettings.seoTitle || '').length <= 60 && (pageSettings.seoTitle || '').length > 0 },
                  { label: 'Description length OK', done: (pageSettings.seoDescription || '').length <= 160 && (pageSettings.seoDescription || '').length > 0 },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px]">
                    <span className={done ? 'text-emerald-400' : 'text-gray-600'}>{done ? '✓' : '○'}</span>
                    <span className={done ? 'text-gray-400' : 'text-gray-700'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-1 border-b border-white/8">
              <Palette className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Funnel Settings</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold">Primary Product (Checkout)</label>
                {isLoadingProducts ? (
                  <div className="text-xs text-gray-500">Loading products...</div>
                ) : (
                  <select
                    className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
                    value={pageSettings.productId || ''}
                    onChange={(e) => setPageSettings({ productId: e.target.value })}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (${(p.price / 100).toFixed(2)})</option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-gray-600 mt-1">
                  Select the main product this funnel sells. Buttons with "Checkout" action will route here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── AI COPY ── */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-1 border-b border-white/8">
              <Wand2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">AI Copywriter</h3>
            </div>
            <p className="text-[10px] text-gray-400 -mt-2">Generate high-converting sales copy in seconds.</p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] font-semibold uppercase">What do you need?</label>
                <select value={aiType} onChange={(e) => setAiType(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-purple-500 text-xs">
                  <option value="headline">Punchy Headline</option>
                  <option value="subheadline">Supporting Subheadline</option>
                  <option value="bullets">3 Benefit Bullets</option>
                  <option value="cta">CTA Button Text</option>
                  <option value="urgency">Urgency / FOMO Line</option>
                  <option value="guarantee">Money-Back Guarantee</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] font-semibold uppercase">Tone</label>
                <select value={aiTone} onChange={(e) => setAiTone(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-purple-500 text-xs">
                  <option value="professional">Professional & Direct</option>
                  <option value="urgent">Urgent (FOMO)</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="aggressive">Aggressive / Hard Sell</option>
                  <option value="empathetic">Empathetic / Coaching</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-[10px] font-semibold uppercase">Product / Offer Details</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-purple-500 text-xs h-24 resize-none"
                  placeholder="E.g. A B2B SaaS tool that automates cold email outreach for agencies..."
                />
              </div>
              <button
                onClick={generateCopy}
                disabled={isGenerating || !aiPrompt}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md p-2.5 text-xs font-black transition flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isGenerating ? 'Generating...' : '✨ Generate Copy'}
              </button>
            </div>

            {aiResult && (
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <label className="text-purple-400 text-[10px] font-black uppercase tracking-wider text-center">Generated Copy</label>
                <div className="bg-[#0B0F19] border border-purple-500/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-200">{aiResult}</p>
                </div>
                <div
                  ref={(ref) => {
                    if (ref) connectors.create(ref,
                      <TextElement
                        text={aiResult}
                        fontSize={aiType === 'headline' ? '48px' : '16px'}
                        fontWeight={aiType === 'headline' ? 'extrabold' : 'normal'}
                      />
                    );
                  }}
                  className="h-10 w-full rounded-md border border-purple-500/50 bg-purple-500/10 flex items-center justify-center text-xs text-purple-300 font-bold cursor-grab hover:bg-purple-500/20 transition group"
                >
                  <span className="group-hover:hidden">Drag To Canvas</span>
                  <span className="hidden group-hover:inline">✊ Grab & Drop</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
