'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';

export interface FeaturesSectionProps {
  layout: 'grid-3' | 'grid-4' | 'zigzag' | 'cards';
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
}

export const FeaturesSection = ({
  layout,
  backgroundColor,
  paddingTop,
  paddingBottom
}: Partial<FeaturesSectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

  const getGridClass = () => {
    switch (layout) {
      case 'grid-3': return 'grid-cols-1 md:grid-cols-3';
      case 'grid-4': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'cards': return 'grid-cols-1 md:grid-cols-3 gap-8';
      default: return 'grid-cols-1 md:grid-cols-3';
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Element id="features-header" is="div" canvas className="flex flex-col items-center gap-4">
            <TextElement text="WHY CHOOSE US" fontSize="12px" color="#6366f1" fontWeight="bold" textAlign="center" />
            <TextElement text="Everything you need to succeed" fontSize="36px" color="#ffffff" fontWeight="extrabold" textAlign="center" tagName="h2" />
          </Element>
        </motion.div>

        {layout === 'zigzag' ? (
          <div className="flex flex-col gap-20">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex-1 w-full"
              >
                <Element id="zz-img-1" is="div" canvas className="w-full min-h-[300px] bg-white/5 rounded-2xl border border-white/10" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex-1 flex flex-col items-start text-left gap-4"
              >
                <Element id="zz-text-1" is="div" canvas className="w-full">
                  <TextElement text="Feature Number One" fontSize="24px" color="#ffffff" fontWeight="bold" />
                  <TextElement text="A highly detailed description of why this specific feature matters and how it will transform their business." fontSize="16px" color="#94a3b8" />
                </Element>
              </motion.div>
            </div>
            {/* Row 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex-1 w-full"
              >
                <Element id="zz-img-2" is="div" canvas className="w-full min-h-[300px] bg-white/5 rounded-2xl border border-white/10" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex-1 flex flex-col items-start text-left gap-4"
              >
                <Element id="zz-text-2" is="div" canvas className="w-full">
                  <TextElement text="Feature Number Two" fontSize="24px" color="#ffffff" fontWeight="bold" />
                  <TextElement text="Another great description that aligns perfectly with the visual representation next to it." fontSize="16px" color="#94a3b8" />
                </Element>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className={`grid gap-x-8 gap-y-12 ${getGridClass()}`}
          >
            {/* We render 3 or 4 feature dropzones based on layout */}
            {[1, 2, 3, ...(layout === 'grid-4' ? [4] : [])].map(num => (
              <motion.div
                key={num}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
              >
                <Element id={`feature-card-${num}`} is="div" canvas className={`flex flex-col ${layout === 'cards' ? 'bg-white/5 p-6 rounded-2xl border border-white/10' : 'items-center text-center'} gap-4`}>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${layout === 'cards' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-300'}`}>
                    🌟
                  </div>
                  <TextElement text={`Feature ${num}`} fontSize="20px" color="#ffffff" fontWeight="bold" textAlign={layout === 'cards' ? 'left' : 'center'} />
                  <TextElement text="Lorem ipsum dolor sit amet, consectetur adipiscing elit." fontSize="14px" color="#94a3b8" textAlign={layout === 'cards' ? 'left' : 'center'} />
                </Element>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export const FeaturesSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as FeaturesSectionProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Grid Layout</label>
        <select 
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          value={props.layout}
          onChange={(e) => setProp((p: any) => p.layout = e.target.value)}
        >
          <option value="grid-3">3 Columns</option>
          <option value="grid-4">4 Columns</option>
          <option value="cards">Card Grid</option>
          <option value="zigzag">Zig-Zag</option>
        </select>
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

FeaturesSection.craft = {
  name: 'Features Section',
  props: {
    layout: 'grid-3',
    backgroundColor: '#02040A',
    paddingTop: 80,
    paddingBottom: 80
  },
  related: {
    settings: FeaturesSectionSettings
  }
};
