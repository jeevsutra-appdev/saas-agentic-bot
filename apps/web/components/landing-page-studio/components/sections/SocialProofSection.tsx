'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { TextElement } from '../elements/TextElement';

export interface SocialProofSectionProps {
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  accentColor: string;
  sectionLabel: string;
}

const STATS = [
  { value: '12,000+', label: 'Active Customers' },
  { value: '$2.4B', label: 'Revenue Generated' },
  { value: '340%', label: 'Avg. ROI Increase' },
  { value: '4.9/5', label: 'Average Rating' },
];

const LOGOS = [
  'Shopify', 'HubSpot', 'Stripe', 'Salesforce', 'Notion', 'Figma',
];

export const SocialProofSection = ({
  backgroundColor, paddingTop, paddingBottom, accentColor, sectionLabel,
}: Partial<SocialProofSectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((n) => ({ hasSelectedNode: n.events.selected }));

  const bg = backgroundColor || '#070A13';
  const pt = paddingTop ?? 60;
  const pb = paddingBottom ?? 60;
  const ac = accentColor || '#6366f1';

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
      style={{ backgroundColor: bg, paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">

        {/* Section label */}
        <Element id="sproof-label" is="div" canvas className="flex flex-col items-center">
          <TextElement
            text={sectionLabel || 'TRUSTED BY INDUSTRY LEADERS WORLDWIDE'}
            fontSize="11px" color={ac} fontWeight="extrabold" textAlign="center"
          />
        </Element>

        {/* Logo Wall */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {LOGOS.map((logo, i) => (
            <div
              key={i}
              className="flex items-center justify-center px-5 py-2.5 rounded-xl border border-white/8 text-sm font-black tracking-wide"
              style={{ color: '#ffffff44', backgroundColor: '#ffffff06' }}
            >
              {logo}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/6" />

        {/* Stats Grid */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {STATS.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1 min-w-[140px]">
              <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SocialProofSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as SocialProofSectionProps }));
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Section Label</label>
        <input type="text" value={props.sectionLabel || ''} onChange={(e) => setProp((p: any) => p.sectionLabel = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Accent Color</label>
        <input type="color" value={props.accentColor || '#6366f1'} onChange={(e) => setProp((p: any) => p.accentColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background Color</label>
        <input type="color" value={props.backgroundColor || '#070A13'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      {[['paddingTop','Padding Top',60],['paddingBottom','Padding Bottom',60]].map(([k,l,d]) => (
        <div key={k as string} className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label className="text-gray-400 text-xs font-semibold">{l as string}</label>
            <span className="text-xs text-indigo-400">{(props as any)[k as string] ?? d}px</span>
          </div>
          <input type="range" min="0" max="200" step="10" value={(props as any)[k as string] ?? d}
            onChange={(e) => setProp((p: any) => p[k as string] = parseInt(e.target.value))} className="w-full accent-indigo-600" />
        </div>
      ))}
    </div>
  );
};

SocialProofSection.craft = {
  name: 'Social Proof Section',
  props: {
    backgroundColor: '#070A13',
    paddingTop: 60,
    paddingBottom: 60,
    accentColor: '#6366f1',
    sectionLabel: 'TRUSTED BY INDUSTRY LEADERS WORLDWIDE',
  },
  related: { settings: SocialProofSectionSettings },
};
