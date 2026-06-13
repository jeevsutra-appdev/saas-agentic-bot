'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Monitor, Tablet, Smartphone, EyeOff } from 'lucide-react';

export interface ButtonElementProps {
  text: string;
  linkType: 'url' | 'checkout';
  url: string;
  variant: 'solid' | 'outline' | 'ghost';
  size: string | any;
  align: string | any;
  color: string;
  textColor: string;
  borderRadius: string;
  fullWidth: boolean | any;
  animation: 'none' | 'pulse' | 'bounce' | 'glow';
  zIndex?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export const ButtonElement = ({
  text,
  linkType,
  url,
  variant,
  size,
  align,
  color,
  textColor,
  borderRadius,
  fullWidth,
  animation,
  zIndex,
  hideOnDesktop,
  hideOnTablet,
  hideOnMobile
}: Partial<ButtonElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { activeDevice } = usePageBuilderStore();

  const getResponsiveProp = (propValue: any, defaultValue: string | boolean) => {
    if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') return propValue;
    if (propValue && typeof propValue === 'object') {
      return propValue[activeDevice] !== undefined ? propValue[activeDevice] : (propValue.desktop !== undefined ? propValue.desktop : defaultValue);
    }
    return defaultValue;
  };

  const currentSize = getResponsiveProp(size, 'md') as 'sm'|'md'|'lg'|'xl';
  const currentAlign = getResponsiveProp(align, 'center');
  const currentFullWidth = getResponsiveProp(fullWidth, false);

  const isHidden = 
    (activeDevice === 'desktop' && hideOnDesktop) || 
    (activeDevice === 'tablet' && hideOnTablet) || 
    (activeDevice === 'mobile' && hideOnMobile);

  if (isHidden && !enabled) return null;

  const alignClass = currentAlign === 'left' ? 'justify-start' : (currentAlign === 'right' ? 'justify-end' : 'justify-center');

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl font-bold',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return { border: `2px solid ${color}`, color: color, backgroundColor: 'transparent' };
      case 'ghost':
        return { color: color, backgroundColor: 'transparent' };
      case 'solid':
      default:
        return { backgroundColor: color, color: textColor };
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse': return 'animate-pulse';
      case 'bounce': return 'animate-bounce';
      case 'glow': return 'shadow-[0_0_20px_rgba(255,255,255,0.5)]'; // simplistic glow, better with dynamic color
      default: return '';
    }
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`flex w-full ${alignClass} transition-all duration-200 relative ${isHidden ? 'opacity-30 border-2 border-red-500 border-dashed p-4' : ''}`}
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      {isHidden && enabled && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
          <EyeOff className="h-3 w-3" /> Hidden on {activeDevice}
        </div>
      )}
      <div className={`inline-block ${currentFullWidth ? 'w-full' : ''} ${hasSelectedNode ? 'ring-2 ring-indigo-500 rounded-lg ring-offset-2 ring-offset-black' : ''}`}>
        <button
        onClick={(e) => {
          e.preventDefault();
          if (!hasSelectedNode && linkType === 'url' && url) {
            window.location.href = url;
          } else if (!hasSelectedNode && linkType === 'checkout') {
            if (window.location.pathname.includes('/lp/')) {
              alert("Checkout Triggered! (Preview Mode inside Builder)");
            } else {
              window.dispatchEvent(new Event('lps:checkout'));
            }
          }
        }}
        className={`inline-flex items-center justify-center text-center transition-all duration-200 hover:opacity-90 ${sizeClasses[currentSize]} ${currentFullWidth ? 'w-full' : ''} ${getAnimationClass()}`}
        style={{
          ...getVariantStyles(),
          borderRadius: borderRadius || '8px',
          ...(animation === 'glow' ? { boxShadow: `0 0 20px ${color}80` } : {})
        }}
      >
        {text || 'Click Here'}
      </button>
      </div>
    </div>
  );
};

export const ButtonElementSettings = () => {
  const { activeDevice } = usePageBuilderStore();
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ButtonElementProps,
  }));

  const updateResponsiveProp = (propName: keyof ButtonElementProps, value: any) => {
    setProp((p: any) => {
      if (typeof p[propName] === 'string' || typeof p[propName] === 'boolean' || p[propName] === undefined) {
        p[propName] = { desktop: p[propName], tablet: p[propName], mobile: p[propName] };
      }
      p[propName][activeDevice] = value;
    });
  };

  const getResponsiveProp = (propName: keyof ButtonElementProps) => {
    const val = props[propName] as any;
    if (typeof val === 'string' || typeof val === 'boolean') return val;
    if (val && typeof val === 'object') return val[activeDevice] !== undefined ? val[activeDevice] : val.desktop;
    return undefined;
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Button Text</label>
        <input 
          type="text" 
          value={props.text} 
          onChange={(e) => setProp((p: any) => p.text = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Link Type</label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['url', 'checkout'].map(t => (
            <button 
              key={t}
              onClick={() => setProp((p: any) => p.linkType = t)}
              className={`flex-1 p-2 text-xs capitalize ${props.linkType === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {t === 'url' ? 'Custom URL' : 'Checkout Flow'}
            </button>
          ))}
        </div>
      </div>

      {props.linkType === 'url' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Link URL</label>
          <input 
            type="text" 
            value={props.url} 
            onChange={(e) => setProp((p: any) => p.url = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
            placeholder="https://..."
          />
        </div>
      )}

      {props.linkType === 'checkout' && (
        <div className="p-3 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
          This button will trigger the checkout flow for the Primary Product assigned in the Global Funnel Settings.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Background</label>
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
          <label className="text-gray-400 text-xs font-semibold">Text Color</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={props.textColor} 
              onChange={(e) => setProp((p: any) => p.textColor = e.target.value)}
              className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer shrink-0"
            />
            <input 
              type="text" 
              value={props.textColor} 
              onChange={(e) => setProp((p: any) => p.textColor = e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Button Alignment</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['left', 'center', 'right'].map(a => (
            <button 
              key={a}
              onClick={() => updateResponsiveProp('align', a)}
              className={`flex-1 p-2 text-xs uppercase ${getResponsiveProp('align') === a ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Size</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['sm', 'md', 'lg', 'xl'].map(s => (
            <button 
              key={s}
              onClick={() => updateResponsiveProp('size', s)}
              className={`flex-1 p-2 text-xs uppercase ${getResponsiveProp('size') === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Variant</label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {['solid', 'outline', 'ghost'].map(v => (
            <button 
              key={v}
              onClick={() => setProp((p: any) => p.variant = v)}
              className={`flex-1 p-2 text-xs capitalize ${props.variant === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border border-white/10 rounded-md p-3 bg-white/5">
        <label className="text-gray-300 text-xs font-semibold cursor-pointer select-none flex items-center justify-between w-full" htmlFor="fullWidthToggle">
          <span>Full Width Button</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <input 
          id="fullWidthToggle"
          type="checkbox" 
          checked={!!getResponsiveProp('fullWidth')} 
          onChange={(e) => updateResponsiveProp('fullWidth', e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-2"
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

ButtonElement.craft = {
  name: 'Button',
  props: {
    text: 'Click Here',
    linkType: 'checkout',
    url: '#',
    variant: 'solid',
    size: { desktop: 'lg', tablet: 'md', mobile: 'md' },
    align: { desktop: 'center', tablet: 'center', mobile: 'center' },
    color: '#FF6B35', // Premium Orange from spec
    textColor: '#ffffff',
    borderRadius: '8px',
    fullWidth: { desktop: false, tablet: false, mobile: false },
    animation: 'none',
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false
  },
  related: {
    settings: ButtonElementSettings
  }
};
