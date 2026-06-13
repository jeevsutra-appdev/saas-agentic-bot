import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Workflow, Zap } from 'lucide-react';

const AutomationNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex items-center w-[220px] bg-gradient-to-r from-orange-500/10 to-rose-500/10 backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${
      selected ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-[1.02]' : 'border-orange-500/30 hover:border-orange-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-[#0a0d1a]" />
      
      <div className="flex items-center gap-3 w-full p-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg">
          <Workflow className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-xs tracking-wide">{data.label || 'n8n Webhook'}</span>
          <span className="text-[10px] text-orange-200/60 font-mono flex items-center gap-1">
             <Zap className="w-3 h-3 text-amber-400" /> Action
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};

export default memo(AutomationNode);
