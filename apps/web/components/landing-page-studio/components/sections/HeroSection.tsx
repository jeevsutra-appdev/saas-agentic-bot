'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';
import { ButtonElement } from '../elements/ButtonElement';
import { ImageElement } from '../elements/ImageElement';

export interface HeroSectionProps {
  layout: 'image-right' | 'image-left' | 'centered';
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
}

export const HeroSection = ({
  layout,
  backgroundColor,
  paddingTop,
  paddingBottom
}: Partial<HeroSectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((node) => ({
    hasSelectedNode: node.events.selected,
  }));

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
        {layout === 'centered' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto gap-6"
          >
            <Element id="hero-badge" is="div" canvas className="flex flex-col items-center gap-2">
              <TextElement text="🚀 LIMITED TIME OFFER" fontSize="12px" color="#6366f1" fontWeight="bold" textAlign="center" />
            </Element>
            
            <Element id="hero-title" is="div" canvas className="w-full">
              <TextElement text="The Ultimate Funnel Builder" fontSize="48px" color="#ffffff" fontWeight="extrabold" textAlign="center" tagName="h1" />
            </Element>
            
            <Element id="hero-subtitle" is="div" canvas className="w-full">
              <TextElement text="Build high-converting pages in minutes and link them directly to your products." fontSize="20px" color="#94a3b8" textAlign="center" />
            </Element>
            
            <Element id="hero-cta" is="div" canvas className="mt-4 flex gap-4">
              <ButtonElement text="Get Started" size="lg" color="#4f46e5" />
            </Element>
          </motion.div>
        )}

        {(layout === 'image-right' || layout === 'image-left') && (
          <div className={`flex flex-col lg:flex-row items-center gap-12 ${layout === 'image-left' ? 'lg:flex-row-reverse' : ''}`}>
            
            <motion.div 
              initial={{ opacity: 0, x: layout === 'image-left' ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 flex flex-col items-start text-left gap-6"
            >
              <Element id="hero-badge" is="div" canvas className="flex flex-col items-start gap-2">
                <TextElement text="🚀 LIMITED TIME OFFER" fontSize="12px" color="#6366f1" fontWeight="bold" textAlign="left" />
              </Element>
              
              <Element id="hero-title" is="div" canvas className="w-full">
                <TextElement text="Scale Your Revenue" fontSize="48px" color="#ffffff" fontWeight="extrabold" textAlign="left" tagName="h1" />
              </Element>
              
              <Element id="hero-subtitle" is="div" canvas className="w-full">
                <TextElement text="Build high-converting pages in minutes and link them directly to your products." fontSize="20px" color="#94a3b8" textAlign="left" />
              </Element>
              
              <Element id="hero-cta" is="div" canvas className="mt-4 flex gap-4">
                <ButtonElement text="Buy Now" size="lg" color="#4f46e5" />
                <ButtonElement text="Learn More" variant="outline" size="lg" color="#ffffff" />
              </Element>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex-1 w-full"
            >
              <Element id="hero-image" is="div" canvas>
                <ImageElement borderRadius="16px" shadow="2xl" />
              </Element>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
};

export const HeroSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as HeroSectionProps,
  }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Layout</label>
        <select 
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500"
          value={props.layout}
          onChange={(e) => setProp((p: any) => p.layout = e.target.value)}
        >
          <option value="centered">Centered</option>
          <option value="image-right">Image Right</option>
          <option value="image-left">Image Left</option>
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

HeroSection.craft = {
  name: 'Hero Section',
  props: {
    layout: 'centered',
    backgroundColor: '#02040A',
    paddingTop: 80,
    paddingBottom: 80
  },
  related: {
    settings: HeroSectionSettings
  }
};
