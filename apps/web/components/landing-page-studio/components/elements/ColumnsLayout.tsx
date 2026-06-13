'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';

export interface ColumnsLayoutProps {
  columns: 2 | 3 | 4;
  gap: number;
  backgroundColor: string;
  padding: number;
  equalHeight: boolean;
}

export const ColumnsLayout = ({
  columns, gap, backgroundColor, padding, equalHeight,
}: Partial<ColumnsLayoutProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((n) => ({ hasSelectedNode: n.events.selected }));

  const cols = columns || 2;
  const gp = gap ?? 24;
  const bg = backgroundColor || 'transparent';
  const pt = padding ?? 0;

  const gridClass = cols === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : cols === 3
    ? 'grid-cols-1 md:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
      style={{ backgroundColor: bg, padding: `${pt}px` }}
    >
      <div className={`grid ${gridClass}`} style={{ gap: `${gp}px` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Element
            key={i}
            id={`col-${i}`}
            is="div"
            canvas
            className={`flex flex-col gap-4 min-h-[80px] rounded-xl border border-dashed border-white/10 p-4 ${equalHeight ? 'h-full' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export const ColumnsLayoutSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ColumnsLayoutProps }));
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Number of Columns</label>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 4].map((n) => (
            <button key={n}
              onClick={() => setProp((p: any) => p.columns = n)}
              className={`p-2 rounded-lg border text-xs font-bold transition-colors ${props.columns === n ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>
              {n} Col
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="text-gray-400 text-xs font-semibold">Column Gap</label>
          <span className="text-xs text-indigo-400">{props.gap ?? 24}px</span>
        </div>
        <input type="range" min="0" max="80" step="4" value={props.gap ?? 24}
          onChange={(e) => setProp((p: any) => p.gap = parseInt(e.target.value))} className="w-full accent-indigo-600" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="text-gray-400 text-xs font-semibold">Outer Padding</label>
          <span className="text-xs text-indigo-400">{props.padding ?? 0}px</span>
        </div>
        <input type="range" min="0" max="80" step="4" value={props.padding ?? 0}
          onChange={(e) => setProp((p: any) => p.padding = parseInt(e.target.value))} className="w-full accent-indigo-600" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background</label>
        <input type="color" value={props.backgroundColor || '#00000000'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="equalH" checked={props.equalHeight === true}
          onChange={(e) => setProp((p: any) => p.equalHeight = e.target.checked)} className="accent-indigo-500" />
        <label htmlFor="equalH" className="text-gray-400 text-xs font-semibold">Equal height columns</label>
      </div>
    </div>
  );
};

ColumnsLayout.craft = {
  name: 'Columns Layout',
  props: { columns: 2, gap: 24, backgroundColor: 'transparent', padding: 0, equalHeight: false },
  isCanvas: false,
  related: { settings: ColumnsLayoutSettings },
};
