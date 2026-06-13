'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Monitor, Tablet, Smartphone, EyeOff, LayoutGrid, Columns2, Columns3, Columns4, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export interface ContainerElementProps {
  // Layout mode
  layoutMode: 'flex' | 'grid' | any;
  // Grid
  columns: number | any;           // 1 | 2 | 3 | 4
  columnGap: string | any;
  rowGap: string | any;
  // Flex
  flexDirection: string | any;
  alignItems: string | any;
  justifyContent: string | any;
  flexWrap: string | any;
  gap: string | any;
  // Common
  padding: string | any;
  width: string | any;
  minHeight: string | any;
  backgroundColor: string;
  borderRadius: string;
  border: string;
  backgroundType?: 'solid' | 'gradient';
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  zIndex?: number;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export const ContainerElement = ({
  layoutMode,
  columns,
  columnGap,
  rowGap,
  flexDirection,
  alignItems,
  justifyContent,
  flexWrap,
  gap,
  padding,
  width,
  minHeight,
  backgroundColor,
  borderRadius,
  border,
  backgroundType,
  gradientFrom,
  gradientTo,
  gradientDirection,
  zIndex,
  hideOnDesktop,
  hideOnTablet,
  hideOnMobile,
  children,
}: Partial<ContainerElementProps> & { children?: React.ReactNode }) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { activeDevice } = usePageBuilderStore();

  const getR = (val: any, def: string) => {
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (val && typeof val === 'object') return val[activeDevice] !== undefined ? val[activeDevice] : (val.desktop ?? def);
    return def;
  };

  const mode        = getR(layoutMode, 'flex');
  const cols        = Number(getR(columns, '2'));
  const colGap      = getR(columnGap, '16px');
  const rGap        = getR(rowGap, '16px');
  const flexDir     = getR(flexDirection, 'row');
  const alignI      = getR(alignItems, 'stretch');
  const justifyC    = getR(justifyContent, 'flex-start');
  const wrap        = getR(flexWrap, 'wrap');
  const flexGap     = getR(gap, '16px');
  const pad         = getR(padding, '16px');
  const cWidth      = getR(width, '100%');
  const minH        = getR(minHeight, '0px');

  const isHidden =
    (activeDevice === 'desktop' && hideOnDesktop) ||
    (activeDevice === 'tablet'  && hideOnTablet)  ||
    (activeDevice === 'mobile'  && hideOnMobile);

  if (isHidden && !enabled) return null;

  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  const layoutStyle: React.CSSProperties = mode === 'grid'
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${rGap} ${colGap}`,
      }
    : {
        display: 'flex',
        flexDirection: flexDir as any,
        alignItems: alignI,
        justifyContent: justifyC,
        flexWrap: wrap as any,
        gap: flexGap,
      };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full transition-all duration-200
        ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black rounded-lg z-10' : ''}
        ${isHidden ? 'opacity-30 border-2 border-red-500 border-dashed' : ''}
        ${(isEmpty && enabled) ? 'min-h-[100px] border-2 border-dashed border-white/20 bg-white/5' : ''}
      `}
      style={{
        ...layoutStyle,
        padding: pad,
        width: cWidth,
        minHeight: minH !== '0px' ? minH : undefined,
        background: backgroundType === 'gradient'
          ? `linear-gradient(${gradientDirection || '135deg'}, ${gradientFrom || '#4F46E5'}, ${gradientTo || '#7C3AED'})`
          : (backgroundColor || 'transparent'),
        borderRadius: borderRadius || '0px',
        border: border || 'none',
        ...(zIndex !== undefined ? { zIndex } : {}),
      }}
    >
      {isHidden && enabled && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1 shadow-lg">
          <EyeOff className="h-3 w-3" /> Hidden on {activeDevice}
        </div>
      )}
      {isEmpty && enabled && (
        <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none absolute inset-0">
          <LayoutGrid className="h-6 w-6 mb-1 opacity-50" />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {mode === 'grid' ? `${cols}-Column Grid` : 'Flex Container'}
          </span>
          <span className="text-[9px]">Drag elements here</span>
        </div>
      )}
      {children}
    </div>
  );
};

/* ─── Settings Panel ─── */
export const ContainerElementSettings = () => {
  const { activeDevice } = usePageBuilderStore();
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ContainerElementProps,
  }));

  const setR = (key: keyof ContainerElementProps, value: any) => {
    setProp((p: any) => {
      if (typeof p[key] === 'string' || typeof p[key] === 'number' || p[key] === undefined) {
        p[key] = { desktop: p[key], tablet: p[key], mobile: p[key] };
      }
      p[key][activeDevice] = value;
    });
  };

  const getR = (key: keyof ContainerElementProps) => {
    const v = props[key] as any;
    if (typeof v === 'string' || typeof v === 'number') return v;
    if (v && typeof v === 'object') return v[activeDevice] !== undefined ? v[activeDevice] : v.desktop;
    return undefined;
  };

  const mode = (getR('layoutMode') as string) ?? 'flex';
  const cols = Number(getR('columns') ?? 2);

  const badge = (
    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded capitalize">{activeDevice}</span>
  );

  return (
    <div className="flex flex-col gap-4 text-sm">

      {/* Layout Mode */}
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
          <span>Layout Mode</span>{badge}
        </label>
        <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
          {[{ v: 'flex', label: '⇄ Flex' }, { v: 'grid', label: '▦ Grid' }].map(({ v, label }) => (
            <button key={v} onClick={() => setR('layoutMode', v)}
              className={`flex-1 p-2 text-xs ${mode === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GRID MODE ─── */}
      {mode === 'grid' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Columns</span>{badge}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setR('columns', n)}
                  className={`p-2 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all
                    ${cols === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}>
                  <span className="flex gap-0.5">
                    {Array.from({ length: n }).map((_, i) => (
                      <span key={i} className="w-3 h-4 rounded-sm bg-current opacity-70" />
                    ))}
                  </span>
                  {n} Col{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-[10px]">Column Gap</label>
              <input type="text" value={getR('columnGap') ?? '16px'} onChange={e => setR('columnGap', e.target.value)}
                className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="16px" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-[10px]">Row Gap</label>
              <input type="text" value={getR('rowGap') ?? '16px'} onChange={e => setR('rowGap', e.target.value)}
                className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="16px" />
            </div>
          </div>
        </>
      )}

      {/* ─── FLEX MODE ─── */}
      {mode === 'flex' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Direction</span>{badge}
            </label>
            <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
              {[['row', '→ Row'], ['column', '↓ Column'], ['row-reverse', '← Row Rev'], ['column-reverse', '↑ Col Rev']].map(([v, label]) => (
                <button key={v} onClick={() => setR('flexDirection', v)}
                  className={`flex-1 p-1.5 text-[10px] ${getR('flexDirection') === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Align Items</span>{badge}
            </label>
            <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
              {[['flex-start', 'Start'], ['center', 'Center'], ['flex-end', 'End'], ['stretch', 'Stretch']].map(([v, label]) => (
                <button key={v} onClick={() => setR('alignItems', v)}
                  className={`flex-1 p-2 text-[10px] ${getR('alignItems') === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Justify Content</span>{badge}
            </label>
            <select value={getR('justifyContent') ?? 'flex-start'} onChange={e => setR('justifyContent', e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs">
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Wrap</span>{badge}
            </label>
            <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
              {[['wrap', 'Wrap'], ['nowrap', 'No Wrap']].map(([v, label]) => (
                <button key={v} onClick={() => setR('flexWrap', v)}
                  className={`flex-1 p-2 text-xs ${getR('flexWrap') === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-xs font-semibold flex items-center justify-between">
              <span>Gap</span>{badge}
            </label>
            <input type="text" value={getR('gap') ?? '16px'} onChange={e => setR('gap', e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="16px" />
          </div>
        </>
      )}

      {/* ─── COMMON ─── */}
      <div className="h-px bg-white/5 my-1" />

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[10px] flex items-center justify-between">Width {badge}</label>
          <input type="text" value={getR('width') ?? '100%'} onChange={e => setR('width', e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="100%" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[10px] flex items-center justify-between">Min Height {badge}</label>
          <input type="text" value={getR('minHeight') ?? '0px'} onChange={e => setR('minHeight', e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="200px" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-[10px] flex items-center justify-between">Inner Padding {badge}</label>
        <input type="text" value={getR('padding') ?? '16px'} onChange={e => setR('padding', e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="16px" />
      </div>

      {/* Background — solid or gradient */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-gray-400 text-xs font-semibold">Background</label>
          <div className="flex bg-[#0B0F19] border border-white/10 rounded-md overflow-hidden">
            {[['solid', '⬛ Solid'], ['gradient', '🌈 Gradient']].map(([v, lbl]) => (
              <button key={v} onClick={() => setProp((p: any) => p.backgroundType = v)}
                className={`px-2 py-1 text-[10px] ${(props.backgroundType ?? 'solid') === v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {(props.backgroundType ?? 'solid') !== 'gradient' ? (
          <div className="flex items-center gap-2">
            <input type="color" value={props.backgroundColor || '#000000'}
              onChange={e => setProp((p: any) => p.backgroundColor = e.target.value)}
              className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer" />
            <input type="text" value={props.backgroundColor || 'transparent'}
              onChange={e => setProp((p: any) => p.backgroundColor = e.target.value)}
              className="flex-1 bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-[10px]">From</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={props.gradientFrom || '#4F46E5'}
                    onChange={e => setProp((p: any) => p.gradientFrom = e.target.value)}
                    className="h-7 w-7 rounded bg-transparent border-0 cursor-pointer shrink-0" />
                  <input type="text" value={props.gradientFrom || '#4F46E5'}
                    onChange={e => setProp((p: any) => p.gradientFrom = e.target.value)}
                    className="flex-1 bg-[#0B0F19] border border-white/10 rounded-md p-1.5 text-white outline-none focus:border-indigo-500 text-xs" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-[10px]">To</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={props.gradientTo || '#7C3AED'}
                    onChange={e => setProp((p: any) => p.gradientTo = e.target.value)}
                    className="h-7 w-7 rounded bg-transparent border-0 cursor-pointer shrink-0" />
                  <input type="text" value={props.gradientTo || '#7C3AED'}
                    onChange={e => setProp((p: any) => p.gradientTo = e.target.value)}
                    className="flex-1 bg-[#0B0F19] border border-white/10 rounded-md p-1.5 text-white outline-none focus:border-indigo-500 text-xs" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-[10px]">Direction</label>
              <select value={props.gradientDirection || '135deg'}
                onChange={e => setProp((p: any) => p.gradientDirection = e.target.value)}
                className="bg-[#0B0F19] border border-white/10 rounded-md p-1.5 text-white outline-none focus:border-indigo-500 text-xs">
                <option value="to right">→ Left to Right</option>
                <option value="to left">← Right to Left</option>
                <option value="to bottom">↓ Top to Bottom</option>
                <option value="to top">↑ Bottom to Top</option>
                <option value="to bottom right">↘ Diagonal ↘</option>
                <option value="to bottom left">↙ Diagonal ↙</option>
                <option value="135deg">135°</option>
                <option value="45deg">45°</option>
                <option value="180deg">180°</option>
              </select>
            </div>
            {/* Preview */}
            <div className="h-6 rounded-md border border-white/10"
              style={{ background: `linear-gradient(${props.gradientDirection || '135deg'}, ${props.gradientFrom || '#4F46E5'}, ${props.gradientTo || '#7C3AED'})` }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[10px]">Border Radius</label>
          <input type="text" value={props.borderRadius || '0px'}
            onChange={e => setProp((p: any) => p.borderRadius = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="0px" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[10px]">Border</label>
          <input type="text" value={props.border || 'none'}
            onChange={e => setProp((p: any) => p.border = e.target.value)}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="1px solid #fff" />
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

      {/* Device Visibility */}
      <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/10">
        <label className="text-gray-400 text-xs font-semibold">Device Visibility</label>
        {[
          { label: 'Desktop', icon: <Monitor className="h-4 w-4" />, key: 'hideOnDesktop' as const },
          { label: 'Tablet',  icon: <Tablet  className="h-4 w-4" />, key: 'hideOnTablet'  as const },
          { label: 'Mobile',  icon: <Smartphone className="h-4 w-4" />, key: 'hideOnMobile' as const },
        ].map(({ label, icon, key }) => (
          <div key={key} className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
            <div className="flex items-center gap-2 text-xs text-gray-300">{icon} {label}</div>
            <input type="checkbox" checked={!props[key]}
              onChange={e => setProp((p: any) => p[key] = !e.target.checked)}
              className="rounded border-white/10 bg-black/50 text-indigo-500 focus:ring-indigo-500 cursor-pointer" />
          </div>
        ))}
      </div>

    </div>
  );
};

ContainerElement.craft = {
  name: 'Layout Box',
  isCanvas: true,
  props: {
    layoutMode:   { desktop: 'flex',      tablet: 'flex',      mobile: 'flex'   },
    columns:      { desktop: 2,           tablet: 2,           mobile: 1        },
    columnGap:    { desktop: '16px',      tablet: '16px',      mobile: '12px'   },
    rowGap:       { desktop: '16px',      tablet: '16px',      mobile: '12px'   },
    flexDirection:{ desktop: 'row',       tablet: 'row',       mobile: 'column' },
    alignItems:   { desktop: 'stretch',   tablet: 'stretch',   mobile: 'stretch'},
    justifyContent:{ desktop:'flex-start',tablet:'flex-start', mobile:'flex-start'},
    flexWrap:     { desktop: 'wrap',      tablet: 'wrap',      mobile: 'wrap'   },
    gap:          { desktop: '16px',      tablet: '16px',      mobile: '12px'   },
    padding:      { desktop: '16px',      tablet: '16px',      mobile: '12px'   },
    width:        { desktop: '100%',      tablet: '100%',      mobile: '100%'   },
    minHeight:    { desktop: '0px',       tablet: '0px',       mobile: '0px'    },
    backgroundColor: 'transparent',
    backgroundType: 'solid',
    gradientFrom: '#4F46E5',
    gradientTo: '#7C3AED',
    gradientDirection: '135deg',
    borderRadius: '0px',
    border: 'none',
    hideOnDesktop: false,
    hideOnTablet:  false,
    hideOnMobile:  false,
  },
  rules: {
    canDrag:   () => true,
    canMoveIn: () => true,
  },
  related: {
    settings: ContainerElementSettings,
  },
};
