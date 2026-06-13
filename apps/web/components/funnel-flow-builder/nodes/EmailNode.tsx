import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Send } from 'lucide-react';

const EmailNode = ({ data, selected }: any) => {
  return (
    <div className={`relative flex items-center w-[220px] bg-gradient-to-r from-teal-500/10 to-emerald-500/10 backdrop-blur-xl border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${
      selected ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)] scale-[1.02]' : 'border-teal-500/30 hover:border-teal-500/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-[#0a0d1a]" />
      <div className="flex items-center gap-3 w-full p-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-xs tracking-wide">{data.label || 'Send Email'}</span>
          <span className="text-[10px] text-teal-200/60 font-mono flex items-center gap-1">
             <Send className="w-2.5 h-2.5" /> Drip Sequence
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-[#0a0d1a]" />
    </div>
  );
};
export default memo(EmailNode);
