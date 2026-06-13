'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';
import { ButtonElement } from '../elements/ButtonElement';

export interface CTASectionProps {
  urgencyText: string;
  backgroundColor: string;
  accentColor: string;
  paddingTop: number;
  paddingBottom: number;
  showUrgency: boolean;
  gradientOverlay: boolean;
}

export const CTASection = ({
  urgencyText, backgroundColor, accentColor, paddingTop, paddingBottom, showUrgency, gradientOverlay,
}: Partial<CTASectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((n) => ({ hasSelectedNode: n.events.selected }));

  const bg = backgroundColor || '#0F0B2A';
  const ac = accentColor || '#6366f1';
  const pt = paddingTop ?? 100;
  const pb = paddingBottom ?? 100;

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full overflow-hidden transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
      style={{ backgroundColor: bg, paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}
    >
      {/* Gradient glow backdrop */}
      {gradientOverlay !== false && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${ac}22 0%, transparent 70%)`,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 50% 40% at 50% 0%, ${ac}15 0%, transparent 70%)`,
          }} />
        </>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6"
      >
        {/* Urgency label */}
        {showUrgency !== false && (
          <Element id="cta-urgency" is="div" canvas className="flex flex-col items-center">
            <TextElement
              text={urgencyText || '⚡ LIMITED TIME — ACT NOW'}
              fontSize="11px"
              color={ac}
              fontWeight="extrabold"
              textAlign="center"
            />
          </Element>
        )}

        {/* Headline */}
        <Element id="cta-headline" is="div" canvas className="w-full">
          <TextElement
            text="Ready to 10x Your Results?"
            fontSize="48px"
            color="#ffffff"
            fontWeight="extrabold"
            textAlign="center"
            tagName="h2"
          />
        </Element>

        {/* Subheadline */}
        <Element id="cta-sub" is="div" canvas className="w-full max-w-2xl">
          <TextElement
            text="Join 12,000+ businesses already seeing massive results. Your transformation starts with one click."
            fontSize="18px"
            color="#94a3b8"
            textAlign="center"
          />
        </Element>

        {/* CTA Button */}
        <Element id="cta-button" is="div" canvas className="mt-4 flex flex-col items-center gap-3">
          <ButtonElement text="🚀 Start My Free Trial Today" size="xl" color={ac} />
          <TextElement text="No credit card required · Cancel anytime · Results guaranteed" fontSize="12px" color="#64748b" textAlign="center" />
        </Element>
      </motion.div>
    </div>
  );
};

export const CTASectionSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as CTASectionProps }));
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Urgency Label Text</label>
        <input type="text" value={props.urgencyText || ''} onChange={(e) => setProp((p: any) => p.urgencyText = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="⚡ LIMITED TIME — ACT NOW" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background Color</label>
        <input type="color" value={props.backgroundColor || '#0F0B2A'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Accent / Glow Color</label>
        <input type="color" value={props.accentColor || '#6366f1'} onChange={(e) => setProp((p: any) => p.accentColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      {[['paddingTop', 'Padding Top', 100], ['paddingBottom', 'Padding Bottom', 100]].map(([key, label, def]) => (
        <div key={key as string} className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label className="text-gray-400 text-xs font-semibold">{label as string}</label>
            <span className="text-xs text-indigo-400">{(props as any)[key as string] ?? def}px</span>
          </div>
          <input type="range" min="0" max="200" step="10" value={(props as any)[key as string] ?? def}
            onChange={(e) => setProp((p: any) => p[key as string] = parseInt(e.target.value))} className="w-full accent-indigo-600" />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showUrg" checked={props.showUrgency !== false}
          onChange={(e) => setProp((p: any) => p.showUrgency = e.target.checked)} className="accent-indigo-500" />
        <label htmlFor="showUrg" className="text-gray-400 text-xs font-semibold">Show urgency label</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showGrad" checked={props.gradientOverlay !== false}
          onChange={(e) => setProp((p: any) => p.gradientOverlay = e.target.checked)} className="accent-indigo-500" />
        <label htmlFor="showGrad" className="text-gray-400 text-xs font-semibold">Show gradient glow overlay</label>
      </div>
    </div>
  );
};

CTASection.craft = {
  name: 'CTA Section',
  props: {
    urgencyText: '⚡ LIMITED TIME — ACT NOW',
    backgroundColor: '#0F0B2A',
    accentColor: '#6366f1',
    paddingTop: 100,
    paddingBottom: 100,
    showUrgency: true,
    gradientOverlay: true,
  },
  related: { settings: CTASectionSettings },
};
