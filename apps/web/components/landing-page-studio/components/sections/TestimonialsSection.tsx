'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { motion } from 'framer-motion';
import { TextElement } from '../elements/TextElement';

export interface TestimonialsSectionProps {
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  accentColor: string;
  sectionLabel: string;
  sectionTitle: string;
}

const TESTIMONIALS = [
  {
    quote: 'I was skeptical at first — I\'d tried 3 other tools that wasted my money. Within 14 days, I had my first $10k month. This is the real deal.',
    name: 'Marcus Thompson',
    title: 'Agency Owner',
    company: 'GrowthLab',
    result: '$10k month in 14 days',
    initials: 'MT',
    color: '#4f46e5',
    rating: 5,
  },
  {
    quote: 'As a 15-year marketing veteran, I\'ve seen hundreds of tools. This one actually delivers. Our client acquisition rate went up 340% in 60 days.',
    name: 'Jennifer Walsh',
    title: 'CMO',
    company: 'Apex Digital',
    result: '340% more client acquisition',
    initials: 'JW',
    color: '#7c3aed',
    rating: 5,
  },
  {
    quote: 'The ROI calculator didn\'t lie. We 4x\'d our ad spend returns and cut our cost-per-acquisition by 67%. My team calls it our secret weapon.',
    name: 'David Chen',
    title: 'Founder',
    company: 'ScaleForce',
    result: '4x ROAS + 67% lower CAC',
    initials: 'DC',
    color: '#059669',
    rating: 5,
  },
];

const StarRow = ({ color }: { color: string }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export const TestimonialsSection = ({
  backgroundColor, paddingTop, paddingBottom, accentColor, sectionLabel, sectionTitle,
}: Partial<TestimonialsSectionProps>) => {
  const { connectors: { connect, drag }, hasSelectedNode } = useNode((n) => ({ hasSelectedNode: n.events.selected }));

  const bg = backgroundColor || '#030712';
  const pt = paddingTop ?? 80;
  const pb = paddingBottom ?? 80;
  const ac = accentColor || '#FBBF24';

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative w-full transition-all duration-200 overflow-hidden ${hasSelectedNode ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
      style={{ backgroundColor: bg, paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Element id="testimonials-header" is="div" canvas className="flex flex-col items-center gap-3">
            <TextElement
              text={sectionLabel || 'REAL RESULTS FROM REAL PEOPLE'}
              fontSize="11px" color={ac} fontWeight="extrabold" textAlign="center"
            />
            <TextElement
              text={sectionTitle || 'Don\'t Just Take Our Word For It'}
              fontSize="36px" color="#ffffff" fontWeight="extrabold" textAlign="center" tagName="h2"
            />
          </Element>
        </motion.div>

        {/* Testimonial Cards Grid */}
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="flex flex-col gap-4 p-6 rounded-2xl border border-white/8 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${t.color}0f 0%, #0d111a 100%)` }}
            >
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ backgroundColor: t.color }} />

              {/* Result badge */}
              <div className="inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/12 text-emerald-400 border border-emerald-500/25">
                🚀 {t.result}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-300 leading-relaxed flex-1">"{t.quote}"</p>

              {/* Stars */}
              <StarRow color={ac} />

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ backgroundColor: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-gray-500">{t.title} @ {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Overall rating strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-center"
        >
          <StarRow color={ac} />
          <span className="text-white font-black">4.9/5</span>
          <span className="text-gray-500 text-sm">from 2,847 verified reviews</span>
        </motion.div>
      </div>
    </div>
  );
};

export const TestimonialsSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as TestimonialsSectionProps }));
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Section Label</label>
        <input type="text" value={props.sectionLabel || ''} onChange={(e) => setProp((p: any) => p.sectionLabel = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="REAL RESULTS FROM REAL PEOPLE" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Section Title</label>
        <input type="text" value={props.sectionTitle || ''} onChange={(e) => setProp((p: any) => p.sectionTitle = e.target.value)}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs" placeholder="Don't Just Take Our Word For It" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Star / Accent Color</label>
        <input type="color" value={props.accentColor || '#FBBF24'} onChange={(e) => setProp((p: any) => p.accentColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Background Color</label>
        <input type="color" value={props.backgroundColor || '#030712'} onChange={(e) => setProp((p: any) => p.backgroundColor = e.target.value)}
          className="h-8 w-full rounded cursor-pointer border border-white/10" />
      </div>
      {[['paddingTop','Padding Top',80],['paddingBottom','Padding Bottom',80]].map(([k,l,d]) => (
        <div key={k as string} className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label className="text-gray-400 text-xs font-semibold">{l as string}</label>
            <span className="text-xs text-indigo-400">{(props as any)[k as string] ?? d}px</span>
          </div>
          <input type="range" min="0" max="200" step="10" value={(props as any)[k as string] ?? d}
            onChange={(e) => setProp((p: any) => p[k as string] = parseInt(e.target.value))} className="w-full accent-indigo-600" />
        </div>
      ))}
    </div>
  );
};

TestimonialsSection.craft = {
  name: 'Testimonials Section',
  props: {
    backgroundColor: '#030712',
    paddingTop: 80,
    paddingBottom: 80,
    accentColor: '#FBBF24',
    sectionLabel: 'REAL RESULTS FROM REAL PEOPLE',
    sectionTitle: "Don't Just Take Our Word For It",
  },
  related: { settings: TestimonialsSectionSettings },
};
