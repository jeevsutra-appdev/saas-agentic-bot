'use client';

import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { LayoutTemplate, Zap, ShoppingBag, Sparkles, CheckCircle, X, ChevronRight } from 'lucide-react';
import { LANDING_PAGE_TEMPLATES, TemplateDefinition } from '../templates/templateData';

const TACTIC_COLORS: Record<string, string> = {
  'Authority': '#6366f1',
  'ROI Framing': '#8b5cf6',
  'Social Proof': '#06b6d4',
  'Risk Reversal': '#10b981',
  'Scarcity': '#ef4444',
  'FOMO': '#ef4444',
  'Urgency': '#f97316',
  'Price Anchoring': '#f59e0b',
  'Impulse Buying': '#ec4899',
  'Empathy': '#10b981',
  'Aspiration': '#14b8a6',
  'Transformation Story': '#8b5cf6',
  'Pain-Dream-Fix': '#6366f1',
};

const TemplatePreviewCard = ({
  template,
  onUse,
}: {
  template: TemplateDefinition;
  onUse: (t: TemplateDefinition) => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-white/25 hover:shadow-2xl"
      style={{ boxShadow: hovered ? `0 0 30px ${template.accentColor}22` : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview Thumbnail */}
      <div
        className="relative h-36 overflow-hidden flex flex-col items-center justify-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${template.gradientFrom} 0%, ${template.gradientTo} 100%)`,
        }}
      >
        {/* Fake wireframe lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="h-2 w-20 rounded-full" style={{ backgroundColor: template.accentColor + '60' }} />
          </div>
          <div className="absolute top-8 left-0 right-0 flex justify-center">
            <div className="h-5 w-36 rounded-lg" style={{ backgroundColor: template.accentColor + '30' }} />
          </div>
          <div className="absolute top-16 left-0 right-0 flex justify-center">
            <div className="h-2 w-24 rounded-full" style={{ backgroundColor: '#ffffff20' }} />
          </div>
          <div className="absolute top-20 left-0 right-0 flex justify-center gap-2">
            <div className="h-6 w-20 rounded-lg" style={{ backgroundColor: template.accentColor + '40' }} />
            <div className="h-6 w-16 rounded-lg" style={{ backgroundColor: '#ffffff15' }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 w-16 rounded-lg" style={{ backgroundColor: '#ffffff08', border: '1px solid rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>

        {/* Center emoji badge */}
        <div
          className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-white/15"
          style={{ backgroundColor: template.accentColor + '22', backdropFilter: 'blur(8px)' }}
        >
          {template.emoji}
        </div>

        {/* Glow orb */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: template.accentColor }}
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3 bg-[#080B14]">
        <div>
          <h4 className="text-sm font-black text-white leading-tight">{template.name}</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">{template.targetAudience}</p>
        </div>

        {/* Psychology tactics */}
        <div className="flex flex-wrap gap-1">
          {template.psychologyTactics.slice(0, 4).map((tactic) => (
            <span
              key={tactic}
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: (TACTIC_COLORS[tactic] || '#6366f1') + '20',
                color: TACTIC_COLORS[tactic] || '#6366f1',
                border: `1px solid ${(TACTIC_COLORS[tactic] || '#6366f1')}30`,
              }}
            >
              {tactic}
            </span>
          ))}
        </div>

        {/* Use template button */}
        <button
          onClick={(e) => { e.stopPropagation(); onUse(template); }}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 group/btn hover:gap-3"
          style={{
            background: `linear-gradient(135deg, ${template.accentColor} 0%, ${template.accentColor}cc 100%)`,
            boxShadow: `0 0 20px ${template.accentColor}33`,
          }}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Use This Template
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  template,
  onConfirm,
  onCancel,
}: {
  template: TemplateDefinition;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
    <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#0A0D1A] p-6 flex flex-col gap-5 shadow-2xl">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: template.accentColor + '22' }}>
          {template.emoji}
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h3 className="text-white font-black text-lg">Load "{template.name}"?</h3>
        <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
          This will <span className="text-amber-400 font-bold">replace</span> your current canvas with the template. 
          Any unsaved changes will be lost.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-xs">
        {template.psychologyTactics.map((t) => (
          <div key={t} className="flex items-center gap-2 text-gray-400">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: template.accentColor }} />
            {t} psychology built in
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/8 text-gray-300 hover:bg-white/12 transition-colors border border-white/10">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition-all duration-200 hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${template.accentColor} 0%, ${template.accentColor}bb 100%)` }}
        >
          ✓ Load Template
        </button>
      </div>
    </div>
  </div>
);

export const TemplatesPanel = () => {
  const { actions } = useEditor();
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateDefinition | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);

  const handleUse = (template: TemplateDefinition) => {
    setConfirmTemplate(template);
  };

  const handleConfirm = () => {
    if (!confirmTemplate) return;
    try {
      (actions as any).history?.ignore?.()?.deserialize?.(confirmTemplate.json)
        ?? (actions as any).deserialize?.(confirmTemplate.json);
      setLoaded(confirmTemplate.id);
    } catch (e) {
      console.error('Template load error:', e);
    }
    setConfirmTemplate(null);
  };

  return (
    <>
      {confirmTemplate && (
        <ConfirmModal
          template={confirmTemplate}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTemplate(null)}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Page Templates</h3>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Choose a psychology-engineered template and load it instantly onto your canvas.
          </p>
        </div>

        {/* Template Cards */}
        <div className="flex flex-col gap-4">
          {LANDING_PAGE_TEMPLATES.map((template) => (
            <div key={template.id} className="relative">
              {loaded === template.id && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black bg-emerald-500 text-white">
                    <CheckCircle className="w-2.5 h-2.5" /> Active
                  </div>
                </div>
              )}
              <TemplatePreviewCard template={template} onUse={handleUse} />
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            💡 <strong className="text-amber-400">Pro tip:</strong> After loading, customize text, colors, and images using the element properties panel.
          </p>
        </div>
      </div>
    </>
  );
};
