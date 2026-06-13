'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LayoutTemplate, MousePointerClick, TrendingUp } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const PageNode = ({ data, selected }: any) => {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params?.tenant as string || 'default';

  const handleEdit = () => {
    // If this node has a linked page ID use it, otherwise open new builder
    const targetId = data.pageId || 'new';
    router.push(`/c/${tenantSlug}/lp/${targetId}`);
  };

  return (
    <div className={`relative flex flex-col w-[280px] bg-[#0a0d1a]/80 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl ${
      selected ? 'border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] scale-[1.02]' : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Top Handle (Input) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-4 !h-4 !bg-indigo-500 !border-2 !border-[#0a0d1a] transition-all hover:!scale-125"
      />

      {/* Header */}
      <div className="bg-[#02040A]/60 px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">{data.label || 'Landing Page'}</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          data.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {data.status || 'Draft'}
        </div>
      </div>

      {/* Body Preview */}
      <div className="p-4 flex flex-col gap-4">
        {/* Mock Thumbnail */}
        <div className="w-full h-[120px] rounded-xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/5 flex items-center justify-center relative overflow-hidden group">
          <LayoutTemplate className="w-8 h-8 text-white/10" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
             <button onClick={handleEdit} className="nodrag px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg cursor-pointer transition-transform active:scale-95">Edit in Studio</button>
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400" title="Page Views">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400/70" />
            <span className="font-mono">{data.views || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400" title="Conversions">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-400/70" />
            <span className="font-mono">{data.conversions || 0}</span>
          </div>
        </div>
      </div>

      {/* Bottom Handle (Output) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !bg-indigo-500 !border-2 !border-[#0a0d1a] transition-all hover:!scale-125"
      />
    </div>
  );
};

export default memo(PageNode);
