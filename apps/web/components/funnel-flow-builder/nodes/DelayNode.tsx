import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

const DelayNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex items-center w-[160px] bg-[#0a0d1a]/80 backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 ${
      selected ? 'border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.3)] scale-[1.02]' : 'border-white/10 hover:border-white/20'
    }`}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-[#0a0d1a]" />
      <div className="flex items-center gap-2 w-full p-2.5 justify-center">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="font-bold text-gray-200 text-xs tracking-wide">{data.label || 'Wait 1 Hour'}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};
export default memo(DelayNode);
