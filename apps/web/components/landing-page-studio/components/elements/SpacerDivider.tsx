'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

// ----------------------------------------------------
// SPACER ELEMENT
// ----------------------------------------------------

export interface SpacerElementProps {
  height: number;
}

export const SpacerElement = ({ height }: Partial<SpacerElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full transition-all duration-200 ${hasSelectedNode ? 'bg-indigo-500/10 border border-indigo-500/30 border-dashed rounded' : ''}`}
      style={{ height: `${height || 32}px` }}
    />
  );
};

export const SpacerElementSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as SpacerElementProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Height (px)</label>
          <span className="text-xs text-indigo-400">{props.height}px</span>
        </div>
        <input 
          type="range" 
          min="4" max="200" step="4"
          value={props.height || 32} 
          onChange={(e) => setProp((p: any) => p.height = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>
    </div>
  );
};

SpacerElement.craft = {
  name: 'Spacer',
  props: { height: 32 },
  related: { settings: SpacerElementSettings }
};

// ----------------------------------------------------
// DIVIDER ELEMENT
// ----------------------------------------------------

export interface DividerElementProps {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  thickness: number;
  width: number; // percentage
  marginTop: number;
  marginBottom: number;
}

export const DividerElement = ({
  style, color, thickness, width, marginTop, marginBottom
}: Partial<DividerElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full flex justify-center transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black rounded' : ''}`}
      style={{ marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` }}
    >
      <div 
        style={{
          width: `${width}%`,
          borderTopStyle: style || 'solid',
          borderTopColor: color || '#E5E7EB',
          borderTopWidth: `${thickness || 1}px`
        }}
      />
    </div>
  );
};

export const DividerElementSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as DividerElementProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Line Style</label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['solid', 'dashed', 'dotted'].map(s => (
            <button 
              key={s}
              onClick={() => setProp((p: any) => p.style = s)}
              className={`flex-1 p-2 text-xs capitalize ${props.style === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={props.color} 
            onChange={(e) => setProp((p: any) => p.color = e.target.value)}
            className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer shrink-0"
          />
          <input 
            type="text" 
            value={props.color} 
            onChange={(e) => setProp((p: any) => p.color = e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Thickness</label>
          <span className="text-xs text-indigo-400">{props.thickness}px</span>
        </div>
        <input 
          type="range" min="1" max="10" step="1"
          value={props.thickness} 
          onChange={(e) => setProp((p: any) => p.thickness = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Width</label>
          <span className="text-xs text-indigo-400">{props.width}%</span>
        </div>
        <input 
          type="range" min="10" max="100" step="5"
          value={props.width} 
          onChange={(e) => setProp((p: any) => p.width = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

    </div>
  );
};

DividerElement.craft = {
  name: 'Divider',
  props: {
    style: 'solid',
    color: '#334155', // Tailwind slate-700
    thickness: 1,
    width: 100,
    marginTop: 24,
    marginBottom: 24
  },
  related: { settings: DividerElementSettings }
};
