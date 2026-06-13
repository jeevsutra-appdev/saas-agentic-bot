'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface SocialProofBarProps {
  count: string;
  unit: string;
  rating: string;
  reviewCount: string;
  badge: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  padding: number;
}

export const SocialProofBar = ({
  count,
  unit,
  rating,
  reviewCount,
  badge,
  backgroundColor,
  textColor,
  accentColor,
  padding,
}: Partial<SocialProofBarProps>) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
  } = useNode((node) => ({ hasSelectedNode: node.events.selected }));

  const bg = backgroundColor || '#070A13';
  const tc = textColor || '#94a3b8';
  const ac = accentColor || '#FBBF24';
  const pt = padding ?? 20;

  const avatarColors = ['#4f46e5', '#7c3aed', '#db2777', '#059669', '#0891b2'];

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`w-full transition-all duration-200 ${
        hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''
      }`}
      style={{ backgroundColor: bg, padding: `${pt}px 16px` }}
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {/* Avatar Stack + Count */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#070A13] flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: color }}
              >
                {['JD', 'SM', 'AR', 'KL', 'TW'][i]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-black leading-tight">
              {count || '12,000'}+
            </p>
            <p className="text-[10px]" style={{ color: tc }}>
              {unit || 'happy customers'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-white/10" />

        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={ac} stroke={ac} strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-black leading-tight">
              {rating || '4.9'}/5
            </p>
            <p className="text-[10px]" style={{ color: tc }}>
              {reviewCount || '2,847'} verified reviews
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-white/10" />

        {/* Badge */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: ac + '22', border: `1px solid ${ac}44` }}
          >
            🏆
          </div>
          <div>
            <p className="text-white text-sm font-black leading-tight">
              {badge || '#1 Rated'}
            </p>
            <p className="text-[10px]" style={{ color: tc }}>
              in its category
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SocialProofBarSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SocialProofBarProps }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Customer Count</label>
          <input type="text" value={props.count || ''} onChange={(e) => setProp((p: any) => p.count = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="12,000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Unit Label</label>
          <input type="text" value={props.unit || ''} onChange={(e) => setProp((p: any) => p.unit = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="happy customers" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Rating</label>
          <input type="text" value={props.rating || ''} onChange={(e) => setProp((p: any) => p.rating = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="4.9" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Review Count</label>
          <input type="text" value={props.reviewCount || ''} onChange={(e) => setProp((p: any) => p.reviewCount = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="2,847" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Award Badge Text</label>
        <input type="text" value={props.badge || ''} onChange={(e) => setProp((p: any) => p.badge = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="#1 Rated" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Star / Accent Color</label>
        <input type="color" value={props.accentColor || '#FBBF24'} onChange={(e) => setProp((p: any) => p.accentColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background</label>
        <input type="color" value={props.backgroundColor || '#070A13'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="text-gray-400 text-xs font-semibold">Padding</label>
          <span className="text-xs text-indigo-400">{props.padding ?? 20}px</span>
        </div>
        <input type="range" min="8" max="60" step="4" value={props.padding ?? 20}
          onChange={(e) => setProp((p: any) => p.padding = parseInt(e.target.value))}
          className="w-full accent-indigo-600" />
      </div>
    </div>
  );
};

SocialProofBar.craft = {
  name: 'Social Proof Bar',
  props: {
    count: '12,000',
    unit: 'happy customers',
    rating: '4.9',
    reviewCount: '2,847',
    badge: '#1 Rated',
    backgroundColor: '#070A13',
    textColor: '#94a3b8',
    accentColor: '#FBBF24',
    padding: 20,
  },
  related: { settings: SocialProofBarSettings },
};
