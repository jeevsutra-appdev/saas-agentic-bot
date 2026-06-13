'use client';

import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export interface FormElementProps {
  buttonText: string;
  listId: string;
  themeColor: string;
  showNameField: boolean;
  showPhoneField: boolean;
  buttonRadius: string;
  inputRadius: string;
}

export const FormElement = ({
  buttonText,
  listId,
  themeColor,
  showNameField,
  showPhoneField,
  buttonRadius,
  inputRadius
}: Partial<FormElementProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const { tenantSlug } = usePageBuilderStore() as any;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled) {
      alert("Form submissions are disabled inside the editor.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: tenantSlug || 'imran-ai',
          listId: listId || 'list_default',
          ...formData
        })
      });
      if (res.ok) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '' });
      }
    } catch (err) {
      console.error("Failed to capture lead", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div 
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className="w-full max-w-md mx-auto p-8 rounded-2xl border border-gray-100 shadow-xl flex flex-col items-center justify-center gap-4 text-center bg-white"
      >
        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Thank you!</h3>
        <p className="text-sm text-gray-500">Your details have been successfully submitted.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`w-full max-w-md mx-auto relative ${hasSelectedNode ? 'ring-2 ring-indigo-500 rounded-2xl ring-offset-4 ring-offset-white' : ''}`}
    >
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 text-center mb-2">
          <h3 className="text-xl font-bold text-gray-900">Join the Waitlist</h3>
          <p className="text-sm text-gray-500">Sign up to get notified when we launch.</p>
        </div>

        {showNameField && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Full Name</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ borderRadius: inputRadius }}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:bg-white transition-all"
              placeholder="John Doe"
              disabled={enabled || isLoading}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email Address
          </label>
          <input 
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            style={{ borderRadius: inputRadius }}
            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:bg-white transition-all"
            placeholder="john@example.com"
            disabled={enabled || isLoading}
          />
        </div>

        {showPhoneField && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Phone Number (Optional)</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ borderRadius: inputRadius }}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:bg-white transition-all"
              placeholder="+1 (555) 000-0000"
              disabled={enabled || isLoading}
            />
          </div>
        )}

        <button 
          type="submit"
          disabled={enabled || isLoading}
          style={{ backgroundColor: themeColor, borderRadius: buttonRadius }}
          className="w-full mt-2 text-white font-bold py-3.5 px-6 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <>
              {buttonText || 'Subscribe Now'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      
      {enabled && (
         <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 z-10 pointer-events-none">
           Builder Preview
         </div>
      )}
    </div>
  );
};

export const FormElementSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as FormElementProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-indigo-300 text-xs">
        Leads captured here are routed directly to the Tenant's Lead CRM dashboard.
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Target List ID</label>
        <input 
          type="text" 
          value={props.listId} 
          onChange={(e) => setProp((p: any) => p.listId = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          placeholder="list_default"
        />
        <span className="text-[10px] text-gray-500">Matches the ID in the Lead Management tab.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Submit Button Text</label>
        <input 
          type="text" 
          value={props.buttonText} 
          onChange={(e) => setProp((p: any) => p.buttonText = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Theme Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={props.themeColor} 
            onChange={(e) => setProp((p: any) => p.themeColor = e.target.value)}
            className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer shrink-0"
          />
          <input 
            type="text" 
            value={props.themeColor} 
            onChange={(e) => setProp((p: any) => p.themeColor = e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4 mt-2">
        <label className="text-gray-400 text-xs font-semibold">Form Fields</label>
        
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Name Field</span>
          <input 
            type="checkbox" 
            checked={props.showNameField} 
            onChange={(e) => setProp((p: any) => p.showNameField = e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 rounded-md p-2">
          <span className="text-xs text-gray-300">Phone Field</span>
          <input 
            type="checkbox" 
            checked={props.showPhoneField} 
            onChange={(e) => setProp((p: any) => p.showPhoneField = e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
};

FormElement.craft = {
  name: 'LeadCaptureForm',
  props: {
    buttonText: 'Subscribe Now',
    listId: 'list_default',
    themeColor: '#4f46e5',
    showNameField: true,
    showPhoneField: false,
    buttonRadius: '8px',
    inputRadius: '8px'
  },
  related: {
    settings: FormElementSettings
  }
};
