'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PageNode from './nodes/PageNode';
import AutomationNode from './nodes/AutomationNode';
import LogicNode from './nodes/LogicNode';
import TriggerNode from './nodes/TriggerNode';
import DelayNode from './nodes/DelayNode';
import EmailNode from './nodes/EmailNode';
import SplitTestNode from './nodes/SplitTestNode';
import { Save, Plus, ArrowLeft, MousePointerClick, Clock, Mail, GitMerge } from 'lucide-react';
import Link from 'next/link';

const nodeTypes = {
  page: PageNode,
  automation: AutomationNode,
  logic: LogicNode,
  trigger: TriggerNode,
  delay: DelayNode,
  email: EmailNode,
  split: SplitTestNode,
};

const initialNodes = [
  {
    id: 'trigger-1',
    type: 'page',
    position: { x: 250, y: 100 },
    data: { label: 'Opt-in Landing Page', status: 'published', views: 1250, conversions: 432 },
  },
  {
    id: 'logic-1',
    type: 'logic',
    position: { x: 290, y: 350 },
    data: { label: 'Purchased Up-sell?' },
  },
  {
    id: 'automation-1',
    type: 'automation',
    position: { x: 550, y: 350 },
    data: { label: 'n8n Welcome Email' },
  },
  {
    id: 'page-upsell',
    type: 'page',
    position: { x: 100, y: 550 },
    data: { label: 'High-Ticket Upsell', status: 'draft', views: 0, conversions: 0 },
  }
];

const initialEdges = [
  { id: 'e1-logic', source: 'trigger-1', target: 'logic-1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e1-auto', source: 'trigger-1', target: 'automation-1', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
  { id: 'elogic-upsell', source: 'logic-1', sourceHandle: 'true', target: 'page-upsell', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
];

export default function FunnelFlowCanvas({ tenantSlug, funnelId }: { tenantSlug: string, funnelId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff', strokeWidth: 2, opacity: 0.5 } } as any, eds)),
    [setEdges],
  );

  const addNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 400 + Math.random() * 50, y: 200 + Math.random() * 50 },
      data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Funnel Architecture Saved Successfully!');
    }, 800);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#02040A] text-white flex flex-col font-sans">
      
      {/* Top Navbar */}
      <div className="h-16 border-b border-white/10 bg-[#0a0d1a]/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/c/${tenantSlug}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-wide">Master Conversion Funnel</h1>
            <span className="text-[10px] text-gray-500 font-mono">ID: {funnelId}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <span className="animate-pulse">Saving...</span> : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Architecture</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
        >
          <Background color="#ffffff" gap={24} size={1} style={{ opacity: 0.05 }} />
          <Controls className="!bg-[#0a0d1a] !border-white/10 !fill-white" />
          <MiniMap 
            className="!bg-[#0a0d1a] !border-white/10 rounded-xl overflow-hidden" 
            maskColor="rgba(2, 4, 10, 0.7)"
            nodeColor={(n) => {
              if (n.type === 'automation') return '#f97316';
              if (n.type === 'logic') return '#d946ef';
              return '#6366f1';
            }}
          />

          <Panel position="top-left" className="!m-6 bg-[#0a0d1a]/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col gap-1 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 border-b border-white/5 mb-2 sticky top-0 bg-[#0a0d1a]">
              Nodes Library
            </div>
            <button onClick={() => addNode('trigger')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition border border-transparent hover:border-blue-500/30">
              <MousePointerClick className="w-3.5 h-3.5" /> Traffic Source
            </button>
            <button onClick={() => addNode('page')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg transition border border-transparent hover:border-indigo-500/30">
              <Plus className="w-3.5 h-3.5" /> Landing Page
            </button>
            <button onClick={() => addNode('split')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-pink-500/20 hover:text-pink-300 rounded-lg transition border border-transparent hover:border-pink-500/30">
              <GitMerge className="w-3.5 h-3.5" /> A/B Split Test
            </button>
            <button onClick={() => addNode('logic')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-fuchsia-500/20 hover:text-fuchsia-300 rounded-lg transition border border-transparent hover:border-fuchsia-500/30">
              <Plus className="w-3.5 h-3.5" /> Logic Condition
            </button>
            <button onClick={() => addNode('delay')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-gray-500/20 hover:text-gray-300 rounded-lg transition border border-transparent hover:border-gray-500/30">
              <Clock className="w-3.5 h-3.5" /> Time Delay
            </button>
            <button onClick={() => addNode('email')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-teal-500/20 hover:text-teal-300 rounded-lg transition border border-transparent hover:border-teal-500/30">
              <Mail className="w-3.5 h-3.5" /> Send Email
            </button>
            <button onClick={() => addNode('automation')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 rounded-lg transition border border-transparent hover:border-orange-500/30">
              <Plus className="w-3.5 h-3.5" /> n8n Webhook
            </button>
          </Panel>
        </ReactFlow>
      </div>

    </div>
  );
}
