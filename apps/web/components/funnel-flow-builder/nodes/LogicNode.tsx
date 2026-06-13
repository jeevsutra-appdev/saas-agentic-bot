import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Split } from 'lucide-react';

const LogicNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex flex-col w-[200px] bg-[#02040A] backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${
      selected ? 'border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.3)] scale-[1.02]' : 'border-fuchsia-500/30 hover:border-fuchsia-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-fuchsia-500 !border-2 !border-[#0a0d1a]" />
      
      <div className="flex items-center justify-center p-3 border-b border-fuchsia-500/20 bg-fuchsia-500/5">
        <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-widest">
          <Split className="w-4 h-4" />
          <span>{data.label || 'Condition'}</span>
        </div>
      </div>
      <div className="flex divide-x divide-fuchsia-500/20 bg-[#0a0d1a]/50">
        <div className="flex-1 py-2 text-center text-[10px] font-bold text-emerald-400">TRUE</div>
        <div className="flex-1 py-2 text-center text-[10px] font-bold text-rose-400">FALSE</div>
      </div>

      {/* Custom Handles for branching */}
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[#0a0d1a]" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};

export default memo(LogicNode);
