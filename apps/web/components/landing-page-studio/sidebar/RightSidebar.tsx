'use client';

import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Settings, X, Palette } from 'lucide-react';
import { usePageBuilderStore, DEFAULT_THEME_COLORS, ThemeColors } from '../store/pageBuilderStore';

const THEME_SWATCHES = [
  { key: 'primary',    label: 'Primary',     desc: 'CTAs, buttons, links' },
  { key: 'secondary',  label: 'Secondary',   desc: 'Supporting accents' },
  { key: 'accent',     label: 'Accent',      desc: 'Badges, highlights' },
  { key: 'text',       label: 'Text',        desc: 'Default body text' },
  { key: 'background', label: 'Page BG',     desc: 'Canvas background' },
] as const;

const PRESET_PALETTES = [
  { name: 'Indigo',   primary: '#4F46E5', secondary: '#7C3AED', accent: '#EC4899', text: '#1a202c', background: '#ffffff' },
  { name: 'Teal',     primary: '#0D9488', secondary: '#0891B2', accent: '#F59E0B', text: '#1a202c', background: '#f0fdfa' },
  { name: 'Rose',     primary: '#E11D48', secondary: '#DB2777', accent: '#7C3AED', text: '#1a202c', background: '#fff1f2' },
  { name: 'Dark',     primary: '#6366F1', secondary: '#8B5CF6', accent: '#F472B6', text: '#f1f5f9', background: '#0f172a' },
  { name: 'Orange',   primary: '#EA580C', secondary: '#D97706', accent: '#16A34A', text: '#1a202c', background: '#ffffff' },
  { name: 'Emerald',  primary: '#059669', secondary: '#0D9488', accent: '#8B5CF6', text: '#1a202c', background: '#ecfdf5' },
];

const ThemePanel = () => {
  const { pageSettings, setThemeColor, setPageSettings } = usePageBuilderStore();
  const themeColors: ThemeColors = { ...DEFAULT_THEME_COLORS, ...(pageSettings.themeColors ?? {}) };

  const applyPreset = (preset: typeof PRESET_PALETTES[number]) => {
    setPageSettings({ themeColors: { primary: preset.primary, secondary: preset.secondary, accent: preset.accent, text: preset.text, background: preset.background } });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[11px] text-gray-400 leading-relaxed">
        Global color palette saved with this page. Use these colors for brand consistency across all elements.
      </p>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Presets</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
              </div>
              <span className="text-[9px] text-gray-400">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Individual color pickers */}
      <div className="flex flex-col gap-3">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Colors</label>
        {THEME_SWATCHES.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center gap-3 bg-[#0B0F19] border border-white/10 rounded-lg p-2.5">
            <input
              type="color"
              value={themeColors[key]}
              onChange={(e) => setThemeColor(key, e.target.value)}
              className="h-8 w-8 rounded-md bg-transparent border-0 cursor-pointer shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-gray-200">{label}</span>
              <span className="text-[10px] text-gray-500">{desc}</span>
            </div>
            <input
              type="text"
              value={themeColors[key]}
              onChange={(e) => setThemeColor(key, e.target.value)}
              className="w-20 bg-[#02040A] border border-white/10 rounded p-1.5 text-white outline-none focus:border-indigo-500 text-xs text-center font-mono"
            />
          </div>
        ))}
      </div>

      {/* Live preview strip */}
      <div className="flex rounded-lg overflow-hidden h-8 border border-white/10">
        {THEME_SWATCHES.map(({ key }) => (
          <div key={key} className="flex-1" style={{ backgroundColor: themeColors[key] }} title={key} />
        ))}
      </div>
      <p className="text-[10px] text-gray-500 text-center -mt-3">Live preview — changes save with the page</p>
    </div>
  );
};

export const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<'element' | 'theme'>('element');

  const { actions, active } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    let selected: { id: string; name: string; settings: any; isDeletable: boolean } | undefined;

    if (selectedSet && selectedSet.size > 0) {
      const nodeId = selectedSet.values().next().value;
      if (nodeId && state.nodes[nodeId]) {
        selected = {
          id: nodeId,
          name: state.nodes[nodeId].data.name,
          settings: state.nodes[nodeId].related?.settings,
          isDeletable: query.node(nodeId).isDeletable(),
        };
      }
    }

    return { active: selected };
  });

  return (
    <div className="w-[300px] h-full bg-[#070A13] border-l border-white/10 flex flex-col shrink-0">
      {/* Tab header */}
      <div className="h-14 border-b border-white/10 flex items-center bg-[#0A0D18] shrink-0">
        <button
          onClick={() => setActiveTab('element')}
          className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors border-b-2 ${activeTab === 'element' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          <Settings className="h-3.5 w-3.5" />
          Element
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors border-b-2 ${activeTab === 'theme' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          <Palette className="h-3.5 w-3.5" />
          Theme
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'theme' ? (
          <ThemePanel />
        ) : active ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-gray-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                {active.name}
              </span>
              {active.isDeletable && (
                <button
                  onClick={() => actions.delete(active.id)}
                  className="p-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors border border-transparent hover:border-red-500/30 flex items-center justify-center bg-red-500/10"
                  title="Delete Element"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {active.settings ? React.createElement(active.settings) : (
              <div className="text-sm text-gray-500 italic">No settings available for this component.</div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-6 opacity-60">
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">Select any component on the canvas to edit its properties.</p>
            <button
              onClick={() => setActiveTab('theme')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
            >
              <Palette className="h-3 w-3" /> Set page theme colors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
