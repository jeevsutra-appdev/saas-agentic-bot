'use client';

import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Monitor, Tablet, Smartphone, EyeOff } from 'lucide-react';

export interface TextElementProps {
  text: string;
  fontSize: string | any;
  textAlign: string | any;
  color: string;
  fontWeight: 'normal' | 'medium' | 'bold' | 'extrabold';
  tagName: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  zIndex?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export const TextElement = ({
  text,
  fontSize,
  textAlign,
  color,
  fontWeight,
  tagName,
  zIndex,
  hideOnDesktop,
  hideOnTablet,
  hideOnMobile
}: Partial<TextElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode, hasDraggedNode, actions: { setProp } } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
    hasDraggedNode: node.events.dragged,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (hasSelectedNode) return;
    setEditable(false);
  }, [hasSelectedNode]);

  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { activeDevice } = usePageBuilderStore();

  const getResponsiveProp = (propValue: any, defaultValue: string) => {
    if (typeof propValue === 'string' || typeof propValue === 'number') {
      const valStr = String(propValue);
      if (valStr.endsWith('px')) {
        const valNum = parseFloat(valStr);
        if (activeDevice === 'mobile') {
          if (valNum >= 40) return `${Math.round(valNum * 0.6)}px`;
          if (valNum >= 24) return `${Math.round(valNum * 0.75)}px`;
          if (valNum >= 18) return `${Math.round(valNum * 0.85)}px`;
        } else if (activeDevice === 'tablet') {
          if (valNum >= 40) return `${Math.round(valNum * 0.8)}px`;
          if (valNum >= 24) return `${Math.round(valNum * 0.9)}px`;
        }
      }
      return propValue;
    }
    if (propValue && typeof propValue === 'object') {
      return propValue[activeDevice] || propValue.desktop || defaultValue;
    }
    return defaultValue;
  };

  const currentFontSize = getResponsiveProp(fontSize, '16px');
  const currentTextAlign = getResponsiveProp(textAlign, 'left');

  const isHidden = 
    (activeDevice === 'desktop' && hideOnDesktop) || 
    (activeDevice === 'tablet' && hideOnTablet) || 
    (activeDevice === 'mobile' && hideOnMobile);

  if (isHidden && !enabled) return null;

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      onClick={() => hasSelectedNode && setEditable(true)}
      className={`transition-all duration-200 relative ${hasSelectedNode ? 'ring-2 ring-indigo-500 rounded-sm ring-offset-1 ring-offset-black' : ''} ${isHidden ? 'opacity-30 border-2 border-red-500 border-dashed' : ''}`}
      style={zIndex !== undefined ? { position: 'relative', zIndex } : undefined}
    >
      {isHidden && enabled && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
          <EyeOff className="h-3 w-3" /> Hidden on {activeDevice}
        </div>
      )}
      <ContentEditable
        html={text || ''}
        disabled={!editable}
        onChange={(e) => 
          setProp((props: any) => (props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")))
        }
        tagName={tagName || 'p'}
        className="outline-none"
        style={{ 
          fontSize: currentFontSize, 
          textAlign: currentTextAlign as any, 
          color: color || '#333333', 
          fontWeight: fontWeight || 'normal' 
        }}
      />
    </div>
  );
};

export const TextElementSettings = () => {
  const { activeDevice } = usePageBuilderStore();
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TextElementProps,
  }));

  const updateResponsiveProp = (propName: keyof TextElementProps, value: string) => {
    setProp((p: any) => {
      if (typeof p[propName] === 'string' || p[propName] === undefined) {
        p[propName] = { desktop: p[propName] || '', tablet: p[propName] || '', mobile: p[propName] || '' };
      }
      p[propName][activeDevice] = value;
    });
  };

  const getResponsiveProp = (propName: keyof TextElementProps) => {
    const val = props[propName] as any;
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') return val[activeDevice] || val.desktop || '';
    return '';
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Element Type</label>
        <select 
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          value={props.tagName}
          onChange={(e) => setProp((p: any) => p.tagName = e.target.value)}
        >
          <option value="h1">Heading 1 (H1)</option>
          <option value="h2">Heading 2 (H2)</option>
          <option value="h3">Heading 3 (H3)</option>
          <option value="p">Paragraph (p)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Font Size</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <input 
          type="text" 
          value={getResponsiveProp('fontSize')} 
          onChange={(e) => updateResponsiveProp('fontSize', e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          placeholder="e.g. 24px, 2rem"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Text Align</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['left', 'center', 'right'].map(align => (
            <button 
              key={align}
              onClick={() => updateResponsiveProp('textAlign', align)}
              className={`flex-1 p-2 text-xs capitalize ${getResponsiveProp('textAlign') === align ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Font Weight</label>
        <select 
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          value={props.fontWeight}
          onChange={(e) => setProp((p: any) => p.fontWeight = e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="bold">Bold</option>
          <option value="extrabold">Extra Bold</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Text Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={props.color} 
            onChange={(e) => setProp((p: any) => p.color = e.target.value)}
            className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
          />
          <input 
            type="text" 
            value={props.color} 
            onChange={(e) => setProp((p: any) => p.color = e.target.value)}
            className="flex-1 bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Z-Index */}
      <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
        <label className="text-xs text-gray-300">Z-Index (Layer)</label>
        <input
          type="number"
          value={props.zIndex ?? ''}
          onChange={(e) => setProp((p: any) => p.zIndex = e.target.value === '' ? undefined : parseInt(e.target.value))}
          className="w-20 bg-[#02040A] border border-white/10 rounded p-1 text-white outline-none focus:border-indigo-500 text-xs text-center"
          placeholder="auto"
        />
      </div>

      {/* Device Visibility Toggles */}
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Device Visibility</span>
        </label>
        
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Monitor className="h-4 w-4" /> Desktop
          </div>
          <input 
            type="checkbox" 
            checked={!props.hideOnDesktop} 
            onChange={(e) => setProp((p: any) => p.hideOnDesktop = !e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Tablet className="h-4 w-4" /> Tablet
          </div>
          <input 
            type="checkbox" 
            checked={!props.hideOnTablet} 
            onChange={(e) => setProp((p: any) => p.hideOnTablet = !e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Smartphone className="h-4 w-4" /> Mobile
          </div>
          <input 
            type="checkbox" 
            checked={!props.hideOnMobile} 
            onChange={(e) => setProp((p: any) => p.hideOnMobile = !e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

TextElement.craft = {
  name: 'Text',
  props: {
    text: 'Edit me...',
    fontSize: { desktop: '16px', tablet: '16px', mobile: '16px' },
    textAlign: { desktop: 'left', tablet: 'left', mobile: 'left' },
    color: '#1a202c',
    fontWeight: 'normal',
    tagName: 'p',
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false
  },
  related: {
    settings: TextElementSettings
  }
};
