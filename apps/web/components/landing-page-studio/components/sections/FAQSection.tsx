'use client';

import React, { useState } from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FAQSectionProps {
  itemCount: number;
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
}

export const FAQSection = ({
  itemCount,
  backgroundColor,
  paddingTop,
  paddingBottom
}: Partial<FAQSectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

  // Local state for expanding/collapsing FAQ items in builder
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full transition-all duration-200 overflow-hidden ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
      style={{
        backgroundColor: backgroundColor || '#02040A',
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Element id="faq-header" is="div" canvas className="flex flex-col items-center gap-4">
            <TextElement text="GOT QUESTIONS?" fontSize="12px" color="#6366f1" fontWeight="bold" textAlign="center" />
            <TextElement text="Frequently Asked Questions" fontSize="36px" color="#ffffff" fontWeight="extrabold" textAlign="center" tagName="h2" />
          </Element>
        </motion.div>

        {/* Accordions */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="flex flex-col gap-4"
        >
          {Array.from({ length: itemCount || 4 }).map((_, i) => {
            const isOpen = openItems[i];
            
            return (
              <motion.div 
                key={i} 
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <div 
                  className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => toggleItem(i)}
                >
                  <div className="flex-1 mr-4 pointer-events-none">
                    <Element id={`faq-q-${i}`} is="div" canvas>
                      <TextElement text={`What is question number ${i + 1}?`} fontSize="18px" color="#ffffff" fontWeight="medium" />
                    </Element>
                  </div>
                  <div className="shrink-0 text-gray-400">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
                
                {/* Answer Area (Expandable) */}
                <div 
                  className={`border-t border-white/10 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-5 md:p-6">
                    <Element id={`faq-a-${i}`} is="div" canvas>
                      <TextElement text="This is the answer to the question. It can be fully customized and expanded using the visual builder. Address any objections your potential buyer might have right here." fontSize="16px" color="#94a3b8" />
                    </Element>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export const FAQSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as FAQSectionProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Number of FAQs</label>
          <span className="text-xs text-indigo-400">{props.itemCount}</span>
        </div>
        <input 
          type="range" min="1" max="12" step="1"
          value={props.itemCount} 
          onChange={(e) => setProp((p: any) => p.itemCount = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background Color</label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={props.backgroundColor} 
            onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
            className="h-8 w-8 rounded bg-transparent border-0 cursor-pointer shrink-0"
          />
          <input 
            type="text" 
            value={props.backgroundColor} 
            onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Padding Top</label>
          <span className="text-xs text-indigo-400">{props.paddingTop}px</span>
        </div>
        <input 
          type="range" min="0" max="200" step="10"
          value={props.paddingTop} 
          onChange={(e) => setProp((p: any) => p.paddingTop = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 text-xs font-semibold">Padding Bottom</label>
          <span className="text-xs text-indigo-400">{props.paddingBottom}px</span>
        </div>
        <input 
          type="range" min="0" max="200" step="10"
          value={props.paddingBottom} 
          onChange={(e) => setProp((p: any) => p.paddingBottom = parseInt(e.target.value))}
          className="w-full accent-indigo-600"
        />
      </div>
    </div>
  );
};

FAQSection.craft = {
  name: 'FAQ Section',
  props: {
    itemCount: 4,
    backgroundColor: '#02040A',
    paddingTop: 80,
    paddingBottom: 80
  },
  related: {
    settings: FAQSectionSettings
  }
};
