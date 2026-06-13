'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface IconBlockProps {
  icon: string;
  heading: string;
  description: string;
  align: 'left' | 'center' | 'right';
  headingColor: string;
  descColor: string;
  backgroundColor: string;
  iconBg: string;
  iconSize: number;
  padding: number;
  showIconBg: boolean;
}

export const IconBlock = ({
  icon, heading, description, align, headingColor, descColor,
  backgroundColor, iconBg, iconSize, padding, showIconBg,
}: Partial<IconBlockProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((n) => ({ hasSelectedNode: n.events.selected }));

  const al = align || 'left';
  const bg = backgroundColor || 'transparent';
  const hc = headingColor || '#ffffff';
  const dc = descColor || '#94a3b8';
  const iBg = iconBg || '#4f46e522';
  const iSize = iconSize ?? 40;
  const pt = padding ?? 16;

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset rounded-xl' : ''}`}
      style={{ backgroundColor: bg, padding: `${pt}px` }}
    >
      <div className={`flex flex-col gap-3 items-${al === 'center' ? 'center' : al === 'right' ? 'end' : 'start'} text-${al}`}>
        {showIconBg !== false ? (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iBg }}>
            <span style={{ fontSize: `${Math.round(iSize * 0.55)}px` }}>{icon || '⚡'}</span>
          </div>
        ) : (
          <span style={{ fontSize: `${iSize}px` }}>{icon || '⚡'}</span>
        )}
        <div className={`flex flex-col gap-1.5 text-${al}`}>
          <h3 className="text-lg font-bold leading-snug" style={{ color: hc, textAlign: al }}>
            {heading || 'Powerful Feature'}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: dc, textAlign: al }}>
            {description || 'Describe how this specific feature delivers real value and solves a pain point your customers face every day.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const IconBlockSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as IconBlockProps }));
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Icon (emoji)</label>
          <input type="text" value={props.icon || ''} onChange={(e) => setProp((p: any) => p.icon = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs text-center text-lg" placeholder="⚡" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Icon Size</label>
          <input type="number" value={props.iconSize ?? 40} onChange={(e) => setProp((p: any) => p.iconSize = parseInt(e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Heading</label>
        <input type="text" value={props.heading || ''} onChange={(e) => setProp((p: any) => p.heading = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Description</label>
        <textarea value={props.description || ''} onChange={(e) => setProp((p: any) => p.description = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs h-16 resize-none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Alignment</label>
        <select value={props.align || 'left'} onChange={(e) => setProp((p: any) => p.align = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Heading Color</label>
          <input type="color" value={props.headingColor || '#ffffff'} onChange={(e) => setProp((p: any) => p.headingColor = e.target.value)}
            className="h-8 w-full rounded cursor-pointer border border-white/10" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Icon Bg Color</label>
          <input type="color" value={(props.iconBg || '#4f46e5')} onChange={(e) => setProp((p: any) => p.iconBg = e.target.value + '33')}
            className="h-8 w-full rounded cursor-pointer border border-white/10" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="showIconBg" checked={props.showIconBg !== false}
          onChange={(e) => setProp((p: any) => p.showIconBg = e.target.checked)} className="accent-indigo-500" />
        <label htmlFor="showIconBg" className="text-gray-400 text-xs font-semibold">Show icon background</label>
      </div>
    </div>
  );
};

IconBlock.craft = {
  name: 'Icon Block',
  props: {
    icon: '⚡',
    heading: 'Powerful Feature',
    description: 'Describe how this specific feature delivers real value and solves a pain point your customers face every day.',
    align: 'left',
    headingColor: '#ffffff',
    descColor: '#94a3b8',
    backgroundColor: 'transparent',
    iconBg: '#4f46e522',
    iconSize: 40,
    padding: 16,
    showIconBg: true,
  },
  related: { settings: IconBlockSettings },
};
