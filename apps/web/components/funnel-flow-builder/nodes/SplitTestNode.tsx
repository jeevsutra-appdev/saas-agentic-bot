import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

const SplitTestNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex flex-col w-[200px] bg-[#02040A] backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${
      selected ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.02]' : 'border-pink-500/30 hover:border-pink-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-[#0a0d1a]" />
      
      <div className="flex items-center justify-center p-3 border-b border-pink-500/20 bg-pink-500/5">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-widest">
          <GitMerge className="w-4 h-4" />
          <span>{data.label || 'A/B Test'}</span>
        </div>
      </div>
      <div className="flex divide-x divide-pink-500/20 bg-[#0a0d1a]/50">
        <div className="flex-1 py-2 text-center text-[10px] font-bold text-pink-300">50% A</div>
        <div className="flex-1 py-2 text-center text-[10px] font-bold text-pink-300">50% B</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="a" style={{ left: '25%' }} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-[#0a0d1a]" />
      <Handle type="source" position={Position.Bottom} id="b" style={{ left: '75%' }} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};
export default memo(SplitTestNode);
