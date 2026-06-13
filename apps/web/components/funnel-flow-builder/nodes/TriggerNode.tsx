import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MousePointerClick, Facebook, Search } from 'lucide-react';

const TriggerNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex items-center w-[200px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${
      selected ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]' : 'border-blue-500/30 hover:border-blue-500/50'
    }`}>
      <div className="flex items-center gap-3 w-full p-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
          <MousePointerClick className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-xs tracking-wide">{data.label || 'Traffic Source'}</span>
          <span className="text-[10px] text-blue-200/60 font-mono">Entry Point</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};
export default memo(TriggerNode);
