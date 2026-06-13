'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface TrustBadgeStripProps {
  badges: string[];
  layout: 'horizontal' | 'grid';
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  padding: number;
  showBorder: boolean;
}

const BADGE_PRESETS = [
  { icon: '🔒', text: 'SSL Secured' },
  { icon: '✅', text: '30-Day Money Back' },
  { icon: '💳', text: 'Safe Checkout' },
  { icon: '⭐', text: '5-Star Rated' },
  { icon: '🚀', text: 'Instant Access' },
  { icon: '🛡️', text: 'No Questions Asked' },
];

export const TrustBadgeStrip = ({
  badges,
  layout,
  backgroundColor,
  textColor,
  iconColor,
  padding,
  showBorder,
}: Partial<TrustBadgeStripProps>) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
  } = useNode((node) => ({ hasSelectedNode: node.events.selected }));

  const selectedBadges = badges && badges.length > 0
    ? BADGE_PRESETS.filter((b) => badges.includes(b.text))
    : BADGE_PRESETS.slice(0, 4);

  const bg = backgroundColor || '#070A13';
  const tc = textColor || '#94a3b8';
  const ic = iconColor || '#4ade80';
  const pt = padding ?? 20;
  const isHorizontal = layout !== 'grid';

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`w-full transition-all duration-200 ${
        hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''
      }`}
      style={{
        backgroundColor: bg,
        padding: `${pt}px 16px`,
        ...(showBorder ? { borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}),
      }}
    >
      <div
        className={`max-w-4xl mx-auto flex flex-wrap items-center justify-center ${
          isHorizontal ? 'gap-6 md:gap-10' : 'grid grid-cols-2 md:grid-cols-4 gap-4'
        }`}
      >
        {selectedBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="text-lg w-7 h-7 flex items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: ic + '22' }}
            >
              {badge.icon}
            </span>
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: tc }}>
              {badge.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrustBadgeStripSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TrustBadgeStripProps }));

  const selectedBadges = props.badges || BADGE_PRESETS.slice(0, 4).map((b) => b.text);

  const toggleBadge = (text: string) => {
    const current = props.badges || BADGE_PRESETS.slice(0, 4).map((b) => b.text);
    const updated = current.includes(text)
      ? current.filter((b: string) => b !== text)
      : [...current, text];
    setProp((p: any) => (p.badges = updated));
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-xs font-semibold">Select Badges</label>
        <div className="grid grid-cols-2 gap-1.5">
          {BADGE_PRESETS.map((badge) => (
            <button
              key={badge.text}
              onClick={() => toggleBadge(badge.text)}
              className={`flex items-center gap-1.5 p-2 rounded-lg text-xs border transition-colors ${
                selectedBadges.includes(badge.text)
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Layout</label>
        <select
          value={props.layout || 'horizontal'}
          onChange={(e) => setProp((p: any) => (p.layout = e.target.value))}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
        >
          <option value="horizontal">Horizontal Row</option>
          <option value="grid">2x2 Grid</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Icon Glow Color</label>
        <input type="color" value={props.iconColor || '#4ade80'}
          onChange={(e) => setProp((p: any) => (p.iconColor = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background</label>
        <input type="color" value={props.backgroundColor || '#070A13'}
          onChange={(e) => setProp((p: any) => (p.backgroundColor = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showBorder" checked={props.showBorder !== false}
          onChange={(e) => setProp((p: any) => (p.showBorder = e.target.checked))} className="accent-indigo-500" />
        <label htmlFor="showBorder" className="text-gray-400 text-xs font-semibold">Show separator borders</label>
      </div>
    </div>
  );
};

TrustBadgeStrip.craft = {
  name: 'Trust Badge Strip',
  props: {
    badges: ['SSL Secured', '30-Day Money Back', 'Safe Checkout', '5-Star Rated'],
    layout: 'horizontal',
    backgroundColor: '#070A13',
    textColor: '#94a3b8',
    iconColor: '#4ade80',
    padding: 20,
    showBorder: true,
  },
  related: { settings: TrustBadgeStripSettings },
};
