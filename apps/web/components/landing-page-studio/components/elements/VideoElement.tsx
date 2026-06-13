'use client';

import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Monitor, Tablet, Smartphone, EyeOff, Video, Play } from 'lucide-react';

export interface VideoElementProps {
  url: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  width: string | any;
  height: string | any;
  align: 'left' | 'center' | 'right' | any;
  borderRadius: string | any;
  shadow: string | any;
  frameStyle: 'none' | 'macos-window';
  backgroundColor: string;

  // White-label props
  whiteLabel: boolean;
  customThumbnail: string;
  playButtonColor: string;

  zIndex?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export const VideoElement = ({
  url,
  autoplay,
  controls,
  loop,
  muted,
  width,
  height,
  align,
  borderRadius,
  shadow,
  frameStyle,
  backgroundColor,
  whiteLabel,
  customThumbnail,
  playButtonColor,
  zIndex,
  hideOnDesktop,
  hideOnTablet,
  hideOnMobile
}: Partial<VideoElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { activeDevice } = usePageBuilderStore();

  const [hasStarted, setHasStarted] = useState(false); // Controls fake thumbnail state

  const getResponsiveProp = (propValue: any, defaultValue: string) => {
    if (typeof propValue === 'string' || typeof propValue === 'number') return propValue;
    if (propValue && typeof propValue === 'object') {
      return propValue[activeDevice] !== undefined ? propValue[activeDevice] : (propValue.desktop !== undefined ? propValue.desktop : defaultValue);
    }
    return defaultValue;
  };

  const currentBorderRadius = getResponsiveProp(borderRadius, '0px') as string;
  const currentShadow = getResponsiveProp(shadow, 'none') as string;
  const currentWidth = getResponsiveProp(width, '100%') as string;
  const currentHeight = getResponsiveProp(height, 'auto') as string;
  const currentAlign = getResponsiveProp(align, 'left') as string;
  const alignStyle = currentAlign === 'center'
    ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' }
    : currentAlign === 'right'
    ? { marginLeft: 'auto', marginRight: '0', display: 'block' }
    : { marginLeft: '0', marginRight: 'auto', display: 'block' };

  const isHidden = 
    (activeDevice === 'desktop' && hideOnDesktop) || 
    (activeDevice === 'tablet' && hideOnTablet) || 
    (activeDevice === 'mobile' && hideOnMobile);

  if (isHidden && !enabled) return null;

  const shadowClasses: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  // White-label flags — separated so branding hide works even without a custom thumbnail
  const hideYTBranding = !!whiteLabel;
  const showCustomThumbnail = !!(whiteLabel && customThumbnail);

  const getEmbedData = (videoUrl: string) => {
    if (!videoUrl) return null;

    // YouTube
    const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const ytAutoplay = (showCustomThumbnail && hasStarted) ? 1 : (autoplay ? 1 : 0);
      const ytControls = hideYTBranding ? 0 : (controls ? 1 : 0);
      const ytMute = (showCustomThumbnail && !hasStarted) ? 1 : (muted ? 1 : 0);
      const params = `autoplay=${ytAutoplay}&controls=${ytControls}&loop=${loop ? 1 : 0}&mute=${ytMute}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&showinfo=0&cc_load_policy=0`;
      return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?${params}` };
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const vAutoplay = (showCustomThumbnail && hasStarted) ? 1 : (autoplay ? 1 : 0);
      const vControls = hideYTBranding ? 0 : (controls ? 1 : 0);
      return {
        type: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${vAutoplay}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${vControls}&title=0&byline=0&portrait=0&dnt=1`,
      };
    }

    return { type: 'video', src: videoUrl };
  };

  const embedData = getEmbedData(url || '');

  const renderPlayer = () => {
    if (!embedData) {
      return (
        <div className="w-full aspect-video bg-[#1a1a1a] flex flex-col items-center justify-center text-gray-500 rounded-lg">
          <Video className="h-10 w-10 mb-2 opacity-50" />
          <span className="text-sm font-semibold">No Video URL Provided</span>
        </div>
      );
    }

    // GHOST MODE / WHITE LABEL: Render Custom Thumbnail instead of iframe until clicked
    if (showCustomThumbnail && !hasStarted) {
      return (
        <div 
          className="relative w-full aspect-video bg-black cursor-pointer group flex items-center justify-center overflow-hidden"
          style={{ borderRadius: frameStyle === 'none' ? currentBorderRadius : '0px' }}
          onClick={() => setHasStarted(true)}
        >
          <img 
            src={customThumbnail} 
            alt="Video Cover" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
          />
          {/* Custom Play Button */}
          <div 
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300 backdrop-blur-md border border-white/20"
            style={{ backgroundColor: playButtonColor || '#4F46E5' }}
          >
            <Play className="h-8 w-8 text-white ml-1 fill-white" />
          </div>
        </div>
      );
    }

    if (embedData.type === 'youtube' || embedData.type === 'vimeo') {
      return (
        <div className="relative w-full aspect-video">
          <iframe
            src={embedData.src}
            className={`w-full h-full outline-none border-none ${enabled ? 'pointer-events-none' : ''}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: frameStyle === 'none' ? currentBorderRadius : '0px' }}
          />
          
          {/* GHOST MODE: gradient overlays hide YouTube title/logo + block redirect clicks */}
          {hideYTBranding && (
            <>
              {/* Top: covers YouTube title + channel overlay */}
              <div
                className="absolute top-0 left-0 right-0 z-20 pointer-events-auto"
                style={{ height: '72px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, transparent 100%)' }}
              />
              {/* Bottom: covers YouTube logo + end screen */}
              <div
                className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto"
                style={{ height: '56px', background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }}
              />
            </>
          )}
        </div>
      );
    }

    return (
      <video
        src={embedData.src}
        className={`w-full aspect-video object-cover ${enabled ? 'pointer-events-none' : ''}`}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        style={{ borderRadius: frameStyle === 'none' ? currentBorderRadius : '0px' }}
      />
    );
  };

  const renderFrame = () => {
    if (frameStyle === 'macos-window') {
      return (
        <div className={`rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/20 ${shadowClasses[currentShadow]}`}>
          <div className="h-8 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] flex items-center px-4 gap-2 border-b border-black/50">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          {renderPlayer()}
        </div>
      );
    }
    return (
      <div className={shadowClasses[currentShadow]}>
        {renderPlayer()}
      </div>
    );
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative max-w-full transition-all duration-200 ${hasSelectedNode ? 'ring-2 ring-indigo-500 rounded-lg ring-offset-2 ring-offset-black' : ''} ${isHidden ? 'opacity-30 border-2 border-red-500 border-dashed p-4' : ''}`}
      style={{ width: currentWidth, ...alignStyle, backgroundColor: backgroundColor || 'transparent', ...(zIndex !== undefined ? { position: 'relative', zIndex } : {}) }}
    >
      {isHidden && enabled && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-lg">
          <EyeOff className="h-3 w-3" /> Hidden on {activeDevice}
        </div>
      )}
      {/* Overlay to prevent iframe capturing clicks in builder */}
      {enabled && <div className="absolute inset-0 z-10 cursor-pointer" />}
      {renderFrame()}
    </div>
  );
};

export const VideoElementSettings = () => {
  const { activeDevice } = usePageBuilderStore();
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as VideoElementProps,
  }));

  const updateResponsiveProp = (propName: keyof VideoElementProps, value: any) => {
    setProp((p: any) => {
      if (typeof p[propName] === 'string' || typeof p[propName] === 'number' || p[propName] === undefined) {
        p[propName] = { desktop: p[propName], tablet: p[propName], mobile: p[propName] };
      }
      p[propName][activeDevice] = value;
    });
  };

  const getResponsiveProp = (propName: keyof VideoElementProps) => {
    const val = props[propName] as any;
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (val && typeof val === 'object') return val[activeDevice] !== undefined ? val[activeDevice] : val.desktop;
    return undefined;
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Video URL</label>
        <input 
          type="text" 
          value={props.url} 
          onChange={(e) => setProp((p: any) => p.url = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="YouTube, Vimeo, or MP4 URL..."
        />
        <span className="text-[10px] text-gray-500">Supports YouTube, Vimeo, or direct .mp4/.webm links.</span>
      </div>

      {/* Size */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Size</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-[10px]">Width</label>
            <input type="text" value={getResponsiveProp('width') ?? '100%'} onChange={(e) => updateResponsiveProp('width', e.target.value)} className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="100%, 640px…" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-[10px]">Max Height</label>
            <input type="text" value={getResponsiveProp('height') ?? 'auto'} onChange={(e) => updateResponsiveProp('height', e.target.value)} className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="auto, 400px…" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[['Full', '100%'], ['75%', '75%'], ['50%', '50%'], ['640px', '640px'], ['480px', '480px'], ['360px', '360px']].map(([label, w]) => (
            <button key={label} onClick={() => updateResponsiveProp('width', w)} className="p-1.5 text-[10px] text-gray-400 bg-black/40 border border-white/10 rounded-md hover:bg-indigo-600/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors">{label}</button>
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
          {[{ val: 'left', icon: '⬅ Left' }, { val: 'center', icon: '↔ Center' }, { val: 'right', icon: 'Right ➡' }].map(({ val, icon }) => (
            <button key={val} onClick={() => updateResponsiveProp('align', val)} className={`flex-1 p-2 text-[10px] ${(getResponsiveProp('align') ?? 'left') === val ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Extreme White-Label Settings */}
      <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-lg p-3 flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-bold uppercase rounded-bl-lg">Pro</div>
        
        <div className="flex items-center justify-between">
          <label className="text-indigo-300 text-xs font-semibold">Ghost Mode (White-Label)</label>
          <input 
            type="checkbox" 
            checked={props.whiteLabel} 
            onChange={(e) => setProp((p: any) => p.whiteLabel = e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500"
          />
        </div>
        <p className="text-[9px] text-gray-400 leading-tight">
          Hides YouTube/Vimeo branding entirely. Prevents clicks from redirecting to YouTube. Disables related videos at the end.
        </p>

        {props.whiteLabel && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[10px] font-semibold uppercase">Custom Thumbnail Cover</label>
              <input 
                type="text" 
                value={props.customThumbnail} 
                onChange={(e) => setProp((p: any) => p.customThumbnail = e.target.value)}
                className="bg-[#0B0F19] border border-indigo-500/30 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
                placeholder="https://... (Image URL)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-400 text-[10px] font-semibold uppercase">Play Button Theme Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={props.playButtonColor} 
                  onChange={(e) => setProp((p: any) => p.playButtonColor = e.target.value)}
                  className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={props.playButtonColor} 
                  onChange={(e) => setProp((p: any) => p.playButtonColor = e.target.value)}
                  className="flex-1 bg-[#0B0F19] border border-indigo-500/30 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs uppercase"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Autoplay</span>
          <input 
            type="checkbox" 
            checked={props.autoplay} 
            onChange={(e) => setProp((p: any) => p.autoplay = e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500"
            disabled={props.whiteLabel}
          />
        </div>
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Controls</span>
          <input 
            type="checkbox" 
            checked={props.controls} 
            onChange={(e) => setProp((p: any) => p.controls = e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500"
            disabled={props.whiteLabel}
          />
        </div>
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Loop</span>
          <input 
            type="checkbox" 
            checked={props.loop} 
            onChange={(e) => setProp((p: any) => p.loop = e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500"
          />
        </div>
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Muted</span>
          <input 
            type="checkbox" 
            checked={props.muted} 
            onChange={(e) => setProp((p: any) => p.muted = e.target.checked)}
            className="rounded border-white/10 bg-black/50 text-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Border Radius</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
        </label>
        <input 
          type="text" 
          value={getResponsiveProp('borderRadius')} 
          onChange={(e) => updateResponsiveProp('borderRadius', e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          placeholder="e.g. 12px"
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

      {/* Background Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.backgroundColor || '#000000'}
            onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
            className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={props.backgroundColor || 'transparent'}
            onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
            className="flex-1 bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
            placeholder="transparent"
          />
          <button
            onClick={() => setProp((p: any) => p.backgroundColor = 'transparent')}
            className="text-[10px] text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Frame Style</label>
        <div className="grid grid-cols-2 gap-2">
          {['none', 'macos-window'].map(f => (
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

VideoElement.craft = {
  name: 'Video',
  props: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
    width: { desktop: '100%', tablet: '100%', mobile: '100%' },
    height: { desktop: 'auto', tablet: 'auto', mobile: 'auto' },
    align: { desktop: 'left', tablet: 'left', mobile: 'left' },
    borderRadius: { desktop: '12px', tablet: '12px', mobile: '12px' },
    shadow: { desktop: 'xl', tablet: 'xl', mobile: 'xl' },
    frameStyle: 'macos-window',
    backgroundColor: 'transparent',
    whiteLabel: true,
    customThumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    playButtonColor: '#4F46E5',
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false
  },
  related: {
    settings: VideoElementSettings
  }
};
