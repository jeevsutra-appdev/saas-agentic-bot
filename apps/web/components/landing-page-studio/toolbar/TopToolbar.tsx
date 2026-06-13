'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { 
  Save, 
  Send, 
  Undo, 
  Redo, 
  Monitor, 
  Tablet, 
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import { usePageBuilderStore } from '../store/pageBuilderStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export const TopToolbar = () => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history ? query.history.canUndo() : false,
    canRedo: query.history ? query.history.canRedo() : false,
  }));
  
  const { activeDevice, setActiveDevice, pageSettings, pageSlug } = usePageBuilderStore();
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const pageId = params.pageId as string;

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const json = query.serialize();
      
      const res = await fetch(`/api/landing-pages/${pageId}?tenantSlug=${tenantSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          pageTree: json,
          settings: JSON.stringify(pageSettings)
        })
      });

      if (!res.ok) throw new Error("Failed to save");
      console.log("Saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-14 border-b border-white/10 bg-[#0B0F19] flex items-center justify-between px-4 sticky top-0 z-50">
      
      {/* Left: Back & Status */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/c/${tenantSlug}?tab=landing-pages`} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs font-semibold">Exit Builder</span>
        </Link>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-gray-400 font-mono">Draft</span>
        </div>
      </div>

      {/* Center: Device Toggles */}
      <div className="hidden md:flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
        <button 
          onClick={() => setActiveDevice('desktop')}
          className={`p-1.5 rounded-md transition-all ${activeDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          title="Desktop (1440px)"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setActiveDevice('tablet')}
          className={`p-1.5 rounded-md transition-all ${activeDevice === 'tablet' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          title="Tablet (768px)"
        >
          <Tablet className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setActiveDevice('mobile')}
          className={`p-1.5 rounded-md transition-all ${activeDevice === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          title="Mobile (375px)"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>

      {/* Right: History & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-4">
          <button 
            disabled={!canUndo}
            onClick={() => actions.history.undo()}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button 
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-50 text-xs font-semibold transition"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isSaving ? "Saving..." : "Save Draft"}</span>
        </button>
        <Link 
          href={`/f/${tenantSlug}/${pageSlug || pageId}`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Publish & View</span>
        </Link>
      </div>
    </div>
  );
};
