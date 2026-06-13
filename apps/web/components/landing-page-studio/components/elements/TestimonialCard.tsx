'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  company: string;
  rating: number;
  avatarBg: string;
  avatarInitials: string;
  result: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

const StarRating = ({ rating, color }: { rating: number; color: string }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={star <= rating ? color : 'none'}
        stroke={color}
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export const TestimonialCard = ({
  quote,
  name,
  title,
  company,
  rating,
  avatarBg,
  avatarInitials,
  result,
  backgroundColor,
  borderColor,
  textColor,
}: Partial<TestimonialCardProps>) => {
  const {
    connectors: { connect, drag },
    hasSelectedNode,
  } = useNode((node) => ({ hasSelectedNode: node.events.selected }));

  const bg = backgroundColor || '#0D1117';
  const bc = borderColor || '#ffffff18';
  const tc = textColor || '#e2e8f0';
  const avBg = avatarBg || '#4f46e5';
  const avInitials = avatarInitials || 'JD';
  const stars = rating ?? 5;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`relative flex flex-col gap-4 p-6 rounded-2xl transition-all duration-200 ${
        hasSelectedNode ? 'ring-2 ring-indigo-500' : ''
      }`}
      style={{ backgroundColor: bg, border: `1px solid ${bc}` }}
    >
      {/* Quote mark */}
      <div className="text-4xl font-black leading-none opacity-20" style={{ color: tc }}>
        "
      </div>

      {/* Result badge */}
      {result && (
        <div className="inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          🚀 {result}
        </div>
      )}

      {/* Quote text */}
      <p className="text-sm leading-relaxed -mt-2" style={{ color: tc }}>
        {quote || '"This product completely transformed our business. We saw results within the first week and haven\'t looked back since."'}
      </p>

      {/* Star rating */}
      <StarRating rating={stars} color="#FBBF24" />

      {/* Attribution */}
      <div className="flex items-center gap-3 pt-2 mt-auto border-t border-white/8">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
          style={{ backgroundColor: avBg }}
        >
          {avInitials}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: tc }}>
            {name || 'Sarah Johnson'}
          </p>
          <p className="text-xs opacity-60" style={{ color: tc }}>
            {title || 'CEO'} {company ? `@ ${company}` : '@ TechCorp'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const TestimonialCardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TestimonialCardProps }));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Power Result (Badge)</label>
        <input
          type="text"
          value={props.result || ''}
          onChange={(e) => setProp((p: any) => (p.result = e.target.value))}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          placeholder="e.g. Grew revenue 3x in 60 days"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Quote</label>
        <textarea
          value={props.quote || ''}
          onChange={(e) => setProp((p: any) => (p.quote = e.target.value))}
          className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs h-20 resize-none"
          placeholder="Customer testimonial quote..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Name</label>
          <input
            type="text"
            value={props.name || ''}
            onChange={(e) => setProp((p: any) => (p.name = e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Initials</label>
          <input
            type="text"
            value={props.avatarInitials || ''}
            onChange={(e) => setProp((p: any) => (p.avatarInitials = e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
            maxLength={2}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Title</label>
          <input
            type="text"
            value={props.title || ''}
            onChange={(e) => setProp((p: any) => (p.title = e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-gray-400 text-xs font-semibold">Company</label>
          <input
            type="text"
            value={props.company || ''}
            onChange={(e) => setProp((p: any) => (p.company = e.target.value))}
            className="bg-[#0B0F19] border border-white/10 rounded-md p-2 text-white outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Star Rating (1-5)</label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={props.rating ?? 5}
          onChange={(e) => setProp((p: any) => (p.rating = parseInt(e.target.value)))}
          className="w-full accent-yellow-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Avatar Color</label>
        <input
          type="color"
          value={props.avatarBg || '#4f46e5'}
          onChange={(e) => setProp((p: any) => (p.avatarBg = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-400 text-xs font-semibold">Card Background</label>
        <input
          type="color"
          value={props.backgroundColor || '#0D1117'}
          onChange={(e) => setProp((p: any) => (p.backgroundColor = e.target.value))}
          className="h-8 w-full rounded cursor-pointer border border-white/10"
        />
      </div>
    </div>
  );
};

TestimonialCard.craft = {
  name: 'Testimonial Card',
  props: {
    quote:
      'This completely transformed how we work. Within 30 days, we 3x\'d our conversion rate and couldn\'t be happier.',
    name: 'Sarah Johnson',
    title: 'CEO',
    company: 'TechCorp',
    rating: 5,
    avatarBg: '#4f46e5',
    avatarInitials: 'SJ',
    result: 'Revenue grew 3x in 30 days',
    backgroundColor: '#0D1117',
    borderColor: '#ffffff18',
    textColor: '#e2e8f0',
  },
  related: {
    settings: TestimonialCardSettings,
  },
};
