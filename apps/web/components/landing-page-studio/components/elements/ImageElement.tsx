'use client';

import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Monitor, Tablet, Smartphone, EyeOff, Image as ImageIcon, Link } from 'lucide-react';
import { MediaLibrary } from '../MediaLibrary';

export interface ImageElementProps {
  src: string;
  alt: string;
  fit: string | any;
  width: string | any;
  height: string | any;
  align: 'left' | 'center' | 'right' | any;
  borderRadius: string | any;
  shadow: string | any;
  opacity: number;
  frameStyle: 'none' | 'macos-window' | 'polaroid' | 'glassmorphism';
  zIndex?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export const ImageElement = ({
  src,
  alt,
  fit,
  width,
  height,
  align,
  borderRadius,
  shadow,
  opacity,
  frameStyle,
  zIndex,
  hideOnDesktop,
  hideOnTablet,
  hideOnMobile
}: Partial<ImageElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { activeDevice } = usePageBuilderStore();

  const getResponsiveProp = (propValue: any, defaultValue: string | number) => {
    if (typeof propValue === 'string' || typeof propValue === 'number') return propValue;
    if (propValue && typeof propValue === 'object') {
      return propValue[activeDevice] !== undefined ? propValue[activeDevice] : (propValue.desktop !== undefined ? propValue.desktop : defaultValue);
    }
    return defaultValue;
  };

  const currentFit = getResponsiveProp(fit, 'cover') as 'cover' | 'contain' | 'fill';
  const currentWidth = getResponsiveProp(width, '100%') as string;
  const currentHeight = getResponsiveProp(height, 'auto') as string;
  const currentAlign = getResponsiveProp(align, 'left') as 'left' | 'center' | 'right';

  const alignStyle = currentAlign === 'center'
    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
    : currentAlign === 'right'
    ? { marginLeft: 'auto', marginRight: '0', display: 'block' }
    : { marginLeft: '0', marginRight: 'auto', display: 'block' };
  const currentBorderRadius = getResponsiveProp(borderRadius, '0px') as string;
  const currentShadow = getResponsiveProp(shadow, 'none') as 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  const isHidden = 
    (activeDevice === 'desktop' && hideOnDesktop) || 
    (activeDevice === 'tablet' && hideOnTablet) || 
    (activeDevice === 'mobile' && hideOnMobile);

  if (isHidden && !enabled) return null;

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const imageEl = (
    <img
      src={src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'}
      alt={alt || 'Image'}
      className={`block ${frameStyle === 'none' ? shadowClasses[currentShadow] : ''}`}
      style={{
        width: currentWidth,
        height: currentHeight,
        objectFit: currentFit,
        borderRadius: frameStyle === 'none' ? currentBorderRadius : (frameStyle === 'glassmorphism' ? '8px' : '0px'),
      }}
    />
  );

  const renderFrame = () => {
    switch (frameStyle) {
      case 'macos-window':
        return (
          <div className={`rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/20 ${shadowClasses[currentShadow]}`}>
            <div className="h-8 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] flex items-center px-4 gap-2 border-b border-black/50">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
            {imageEl}
          </div>
        );
      case 'polaroid':
        return (
          <div className={`bg-white p-4 pb-16 rotate-1 hover:rotate-0 transition-transform ${shadowClasses[currentShadow]}`}>
            {imageEl}
          </div>
        );
      case 'glassmorphism':
        return (
          <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 ${shadowClasses[currentShadow]}`}>
            {imageEl}
          </div>
        );
      case 'none':
      default:
        return imageEl;
    }
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative max-w-full transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 rounded-lg ring-offset-2 ring-offset-black' : ''} ${isHidden ? 'opacity-30 border-2 border-red-500 border-dashed p-4' : ''}`}
      style={{ opacity: opacity !== undefined ? opacity : 1, width: currentWidth, ...alignStyle, ...(zIndex !== undefined ? { position: 'relative', zIndex } : {}) }}
    >
      {isHidden && enabled && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
          <EyeOff className="h-3 w-3" /> Hidden on {activeDevice}
        </div>
      )}
      {renderFrame()}
    </div>
  );
};

export const ImageElementSettings = () => {
  const { activeDevice } = usePageBuilderStore();
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ImageElementProps,
  }));
  const [showUrlOverride, setShowUrlOverride] = useState(false);

  const updateResponsiveProp = (propName: keyof ImageElementProps, value: any) => {
    setProp((p: any) => {
      if (typeof p[propName] === 'string' || typeof p[propName] === 'number' || p[propName] === undefined) {
        p[propName] = { desktop: p[propName], tablet: p[propName], mobile: p[propName] };
      }
      p[propName][activeDevice] = value;
    });
  };

  const getResponsiveProp = (propName: keyof ImageElementProps) => {
    const val = props[propName] as any;
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (val && typeof val === 'object') return val[activeDevice] !== undefined ? val[activeDevice] : val.desktop;
    return undefined;
  };

  return (
    <div className="flex flex-col gap-4 text-sm">

      {/* ── Media Library ───────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-gray-400 text-xs font-semibold flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Media Library
          </label>
          <button
            onClick={() => setShowUrlOverride(v => !v)}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors"
          >
            <Link className="h-3 w-3" />
            {showUrlOverride ? 'Hide URL' : 'Paste URL'}
          </button>
        </div>

        {showUrlOverride && (
          <input
            type="text"
            value={props.src}
            onChange={(e) => setProp((p: any) => p.src = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
            placeholder="https://... (direct image URL)"
          />
        )}

        <MediaLibrary
          selectedUrl={props.src}
          onSelect={(url) => {
            setProp((p: any) => p.src = url);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Alt Text</label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => setProp((p: any) => p.alt = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="Describe the image..."
        />
      </div>

      {/* Size Controls */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Size</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-[10px]">Width</label>
            <input
              type="text"
              value={getResponsiveProp('width') ?? '100%'}
              onChange={(e) => updateResponsiveProp('width', e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
              placeholder="100%, 400px…"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-[10px]">Height</label>
            <input
              type="text"
              value={getResponsiveProp('height') ?? 'auto'}
              onChange={(e) => updateResponsiveProp('height', e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
              placeholder="auto, 300px…"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {[['Full', '100%', 'auto'], ['Half', '50%', 'auto'], ['Square', '300px', '300px'], ['Portrait', '300px', '400px'], ['Wide', '100%', '250px'], ['Thumb', '120px', '120px']].map(([label, w, h]) => (
            <button
              key={label}
              onClick={() => { updateResponsiveProp('width', w); updateResponsiveProp('height', h); }}
              className="p-1.5 text-[10px] text-gray-400 bg-black/40 border border-white/10 rounded-md hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Alignment</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {[
            { val: 'left',   icon: '⬅ Left'   },
            { val: 'center', icon: '↔ Center' },
            { val: 'right',  icon: 'Right ➡'  },
          ].map(({ val, icon }) => (
            <button
              key={val}
              onClick={() => updateResponsiveProp('align', val)}
              className={`flex-1 p-2 text-[10px] ${(getResponsiveProp('align') ?? 'left') === val ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Object Fit</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['cover', 'contain', 'fill'].map(f => (
            <button 
              key={f}
              onClick={() => updateResponsiveProp('fit', f)}
              className={`flex-1 p-2 text-xs capitalize ${getResponsiveProp('fit') === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Border Radius</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <input 
          type="text" 
          value={getResponsiveProp('borderRadius')} 
          onChange={(e) => updateResponsiveProp('borderRadius', e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          placeholder="e.g. 12px, 50%"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Drop Shadow</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <select 
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          value={getResponsiveProp('shadow')}
          onChange={(e) => updateResponsiveProp('shadow', e.target.value)}
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
          <option value="xl">Extra Large</option>
          <option value="2xl">Massive (2XL)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Frame Style</label>
        <div className="grid grid-cols-2 gap-2">
          {['none', 'macos-window', 'polaroid', 'glassmorphism'].map(f => (
            <button 
              key={f}
              onClick={() => setProp((p: any) => p.frameStyle = f)}
              className={`p-2 text-xs capitalize rounded-md border ${props.frameStyle === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/5'}`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Opacity</label>
          <span className="text-xs text-indigo-400">{Math.round((props.opacity || 1) * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.05"
          value={props.opacity !== undefined ? props.opacity : 1} 
          onChange={(e) => setProp((p: any) => p.opacity = parseFloat(e.target.value))}
          className="w-full accent-indigo-600"
        />
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

ImageElement.craft = {
  name: 'Image',
  props: {
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    alt: 'Sample Image',
    fit: { desktop: 'cover', tablet: 'cover', mobile: 'cover' },
    width: { desktop: '100%', tablet: '100%', mobile: '100%' },
    height: { desktop: 'auto', tablet: 'auto', mobile: 'auto' },
    align: { desktop: 'left', tablet: 'left', mobile: 'left' },
    borderRadius: { desktop: '12px', tablet: '12px', mobile: '12px' },
    shadow: { desktop: 'lg', tablet: 'lg', mobile: 'lg' },
    opacity: 1,
    frameStyle: 'none',
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false
  },
  related: {
    settings: ImageElementSettings
  }
};
