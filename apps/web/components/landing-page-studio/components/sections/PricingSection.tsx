'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';
import { ButtonElement } from '../elements/ButtonElement';

export interface PricingSectionProps {
  layout: 'single' | 'value-stack';
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  hasOfferPrice: boolean;
}

export const PricingSection = ({
  layout,
  backgroundColor,
  paddingTop,
  paddingBottom,
  hasOfferPrice
}: Partial<PricingSectionProps>) => {
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
        
        {layout === 'single' ? (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8 bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <Element id="pricing-header" is="div" canvas className="flex flex-col items-center gap-2 relative z-10 w-full">
              <TextElement text="Special Offer" fontSize="14px" color="#6366f1" fontWeight="bold" textAlign="center" />
              <TextElement text="Get Lifetime Access" fontSize="40px" color="#ffffff" fontWeight="extrabold" textAlign="center" tagName="h2" />
            </Element>

            <Element id="pricing-amount" is="div" canvas className="flex flex-col items-center gap-1 relative z-10 w-full">
              {hasOfferPrice && (
                <div className="line-through text-gray-500 font-bold text-2xl">
                  $199.00
                </div>
              )}
              <div className="flex items-end justify-center gap-1">
                <span className="text-3xl text-white font-bold">$</span>
                <TextElement text={hasOfferPrice ? "97.00" : "199.00"} fontSize="64px" color="#ffffff" fontWeight="extrabold" textAlign="center" />
              </div>
              <TextElement text="One-time payment, yours forever." fontSize="14px" color="#94a3b8" textAlign="center" />
            </Element>

            <Element id="pricing-features" is="div" canvas className="w-full max-w-sm flex flex-col gap-4 relative z-10 text-left my-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">✓</div>
                  <TextElement text={`High-value feature number ${i}`} fontSize="16px" color="#cbd5e1" />
                </div>
              ))}
            </Element>

            <Element id="pricing-cta" is="div" canvas className="w-full max-w-sm relative z-10">
              <ButtonElement text="Add to Cart" size="xl" color="#4f46e5" fullWidth animation="glow" />
            </Element>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            {/* Value Stack */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 flex flex-col gap-6"
            >
              <Element id="value-stack-header" is="div" canvas>
                <TextElement text="Here is what you get today:" fontSize="28px" color="#ffffff" fontWeight="bold" />
              </Element>
              
              <Element id="value-stack-items" is="div" canvas className="flex flex-col gap-4">
                {[
                  { name: 'Core Product Module', val: '$297' },
                  { name: 'Bonus 1: Expert Consultation', val: '$197' },
                  { name: 'Bonus 2: Premium Templates', val: '$97' },
                  { name: 'Bonus 3: VIP Community Access', val: '$497' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                    <TextElement text={`✅ ${item.name}`} fontSize="16px" color="#e2e8f0" />
                    <TextElement text={`Value: ${item.val}`} fontSize="16px" color="#94a3b8" />
                  </div>
                ))}
                <div className="flex justify-between items-center py-4 mt-2 bg-white/5 px-4 rounded-xl">
                  <TextElement text="Total Real World Value:" fontSize="20px" color="#ffffff" fontWeight="bold" />
                  <TextElement text="$1,088" fontSize="20px" color="#ef4444" fontWeight="bold" />
                </div>
              </Element>
            </motion.div>

            {/* Offer Box */}
            <motion.div 
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="w-full lg:w-[400px] shrink-0 bg-gradient-to-b from-[#0F172A] to-[#02040A] border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <Element id="stack-offer-header" is="div" canvas className="text-center">
                <TextElement text="YOUR PRICE TODAY" fontSize="14px" color="#94a3b8" fontWeight="bold" textAlign="center" />
              </Element>

              <Element id="stack-pricing" is="div" canvas className="flex flex-col items-center gap-1 w-full">
                {hasOfferPrice && (
                  <div className="line-through text-gray-500 font-bold text-xl">$1,088</div>
                )}
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl text-white font-bold">$</span>
                  <TextElement text={hasOfferPrice ? "47.00" : "1,088"} fontSize="56px" color="#ffffff" fontWeight="extrabold" textAlign="center" />
                </div>
              </Element>

              <Element id="stack-cta" is="div" canvas className="w-full mt-4">
                <ButtonElement text="Claim This Offer Now" size="xl" color="#f97316" fullWidth animation="pulse" />
              </Element>

              <Element id="stack-guarantee" is="div" canvas className="flex items-center gap-3 mt-4 opacity-80">
                <div className="text-2xl">🛡️</div>
                <TextElement text="30-Day 100% Money Back Guarantee" fontSize="13px" color="#cbd5e1" />
              </Element>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};

export const PricingSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as PricingSectionProps,
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
          <option value="single">Single Card</option>
          <option value="value-stack">Value Stack</option>
        </select>
      </div>

      <div className="flex items-center justify-between border border-white/10 rounded-md p-3 bg-white/5">
        <label className="text-gray-300 text-xs font-semibold cursor-pointer select-none" htmlFor="offerToggle">
          Enable Offer Price (Strikethrough)
        </label>
        <input 
          id="offerToggle"
          type="checkbox" 
          checked={props.hasOfferPrice} 
          onChange={(e) => setProp((p: any) => p.hasOfferPrice = e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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

PricingSection.craft = {
  name: 'Pricing Section',
  props: {
    layout: 'single',
    hasOfferPrice: true,
    backgroundColor: '#02040A',
    paddingTop: 80,
    paddingBottom: 80
  },
  related: {
    settings: PricingSectionSettings
  }
};
