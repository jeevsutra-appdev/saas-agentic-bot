'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface ScarcityBarProps {
  label: string;
  spotsTotal: number;
  spotsTaken: number;
  showNumbers: boolean;
  urgencyText: string;
  backgroundColor: string;
  fillColor: string;
  textColor: string;
  padding: number;
}

export const ScarcityBar = ({
  label,
  spotsTotal,
  spotsTaken,
  showNumbers,
  urgencyText,
  backgroundColor,
  fillColor,
  textColor,
  padding,
}: Partial<ScarcityBarProps>) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
  } = useNode((node) => ({ hasSelectedNode: node.events.selected }));

  const total = spotsTotal ?? 100;
  const taken = spotsTaken ?? 73;
  const remaining = Math.max(0, total - taken);
  const pct = Math.min(100, Math.round((taken / total) * 100));

  const bg = backgroundColor || '#0A0205';
  const fill = fillColor || '#EF4444';
  const tc = textColor || '#ffffff';
  const pt = padding ?? 24;

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
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {/* Label row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: fill }}>
            {label || '🔥 SPOTS FILLING FAST'}
          </span>
          {showNumbers !== false && (
            <span className="text-xs font-bold" style={{ color: tc }}>
              <span className="font-black" style={{ color: fill }}>{remaining}</span> of {total} left
            </span>
          )}
        </div>

        {/* Progress track */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: fill + '22' }}>
          <div
            className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${fill}cc 0%, ${fill} 100%)`,
            }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Urgency text */}
        {urgencyText && (
          <p className="text-center text-xs font-bold" style={{ color: tc + 'aa' }}>
            {urgencyText}
          </p>
        )}
      </div>
    </div>
  );
};

export const ScarcityBarSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ScarcityBarProps }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Label Text</label>
        <input type="text" value={props.label || ''} onChange={(e) => setProp((p: any) => p.label = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="🔥 SPOTS FILLING FAST" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Urgency Sub-text</label>
        <input type="text" value={props.urgencyText || ''} onChange={(e) => setProp((p: any) => p.urgencyText = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="Price increases when spots run out" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Total Spots</label>
          <input type="number" value={props.spotsTotal ?? 100} onChange={(e) => setProp((p: any) => p.spotsTotal = parseInt(e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Spots Taken</label>
          <input type="number" value={props.spotsTaken ?? 73} onChange={(e) => setProp((p: any) => p.spotsTaken = parseInt(e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Fill / Urgency Color</label>
        <input type="color" value={props.fillColor || '#EF4444'} onChange={(e) => setProp((p: any) => p.fillColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background</label>
        <input type="color" value={props.backgroundColor || '#0A0205'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showNums" checked={props.showNumbers !== false}
          onChange={(e) => setProp((p: any) => p.showNumbers = e.target.checked)} className="accent-indigo-500" />
        <label htmlFor="showNums" className="text-gray-400 text-xs font-semibold">Show remaining count</label>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="text-gray-400 text-xs font-semibold">Padding</label>
          <span className="text-xs text-indigo-400">{props.padding ?? 24}px</span>
        </div>
        <input type="range" min="8" max="60" step="4" value={props.padding ?? 24}
          onChange={(e) => setProp((p: any) => p.padding = parseInt(e.target.value))} className="w-full accent-indigo-600" />
      </div>
    </div>
  );
};

ScarcityBar.craft = {
  name: 'Scarcity Bar',
  props: {
    label: '🔥 SPOTS FILLING FAST',
    spotsTotal: 100,
    spotsTaken: 73,
    showNumbers: true,
    urgencyText: 'Price increases when all spots are claimed',
    backgroundColor: '#0A0205',
    fillColor: '#EF4444',
    textColor: '#ffffff',
    padding: 24,
  },
  related: { settings: ScarcityBarSettings },
};
