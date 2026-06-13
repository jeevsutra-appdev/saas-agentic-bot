'use client';

import React from 'react';
import { Editor, Frame, useNode, useEditor } from '@craftjs/core';
import { TopToolbar } from '../toolbar/TopToolbar';
import { LeftSidebar } from '../sidebar/LeftSidebar';
import { RightSidebar } from '../sidebar/RightSidebar';
import { usePageBuilderStore } from '../store/pageBuilderStore';

// ── Basic Elements ────────────────────────────────────────────────────────────
import { TextElement } from '../components/elements/TextElement';
import { ButtonElement } from '../components/elements/ButtonElement';
import { ImageElement } from '../components/elements/ImageElement';
import { VideoElement } from '../components/elements/VideoElement';
import { FormElement } from '../components/elements/FormElement';
import { ContainerElement } from '../components/elements/ContainerElement';
import { SpacerElement, DividerElement } from '../components/elements/SpacerDivider';
import { ColumnsLayout } from '../components/elements/ColumnsLayout';

// ── Conversion Elements ───────────────────────────────────────────────────────
import { CountdownTimer } from '../components/elements/CountdownTimer';
import { TestimonialCard } from '../components/elements/TestimonialCard';
import { SocialProofBar } from '../components/elements/SocialProofBar';
import { ScarcityBar } from '../components/elements/ScarcityBar';
import { TrustBadgeStrip } from '../components/elements/TrustBadgeStrip';
import { IconBlock } from '../components/elements/IconBlock';

// ── Sections ──────────────────────────────────────────────────────────────────
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { PricingSection } from '../components/sections/PricingSection';
import { FAQSection } from '../components/sections/FAQSection';
import { LeadGenSection } from '../components/sections/LeadGenSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { SocialProofSection } from '../components/sections/SocialProofSection';

// ── Root Canvas Container ─────────────────────────────────────────────────────
const Container = ({ children }: { children?: React.ReactNode }) => {
  const { connectors: { connect } } = useNode();
  return (
    <div ref={(ref) => { if (ref) connect(ref); }} className="min-h-screen bg-white w-full">
      {children}
    </div>
  );
};

Container.craft = {
  name: 'Container',
  isCanvas: true,
  rules: { canDrag: () => false },
};

// ── Empty Canvas Placeholder ──────────────────────────────────────────────────
const EmptyCanvasPlaceholder = () => {
  const { isEmpty } = useEditor((state) => ({
    isEmpty: Object.keys(state.nodes).length <= 1,
  }));
  if (!isEmpty) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 select-none">
      <div className="border-2 border-dashed border-gray-200 rounded-2xl px-10 py-14 flex flex-col items-center gap-4 mx-8 bg-white/60 max-w-sm text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <div>
          <p className="text-gray-500 font-semibold text-sm">Start building your page</p>
          <p className="text-gray-400 text-xs mt-1">Drag sections or elements from the left panel, or load a template to get started instantly.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-500 font-semibold border border-indigo-100">← Templates</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 font-semibold border border-gray-100">← Drag Blocks</span>
        </div>
      </div>
    </div>
  );
};

// ── Full Resolver Map (all components CraftJS needs to know about) ─────────────
const RESOLVER = {
  // Root
  Container,
  // Basic elements
  TextElement,
  ButtonElement,
  ImageElement,
  VideoElement,
  FormElement,
  ContainerElement,
  SpacerElement,
  DividerElement,
  ColumnsLayout,
  // Conversion elements
  CountdownTimer,
  TestimonialCard,
  SocialProofBar,
  ScarcityBar,
  TrustBadgeStrip,
  IconBlock,
  // Sections
  HeroSection,
  FeaturesSection,
  PricingSection,
  FAQSection,
  LeadGenSection,
  TestimonialsSection,
  CTASection,
  SocialProofSection,
  // craft.name aliases — sections embed these by craft.name, not resolver key
  Text: TextElement,
  Button: ButtonElement,
  Image: ImageElement,
  Video: VideoElement,
  Form: FormElement,
  Container2: ContainerElement,
  Spacer: SpacerElement,
  Divider: DividerElement,
  Columns: ColumnsLayout,
  'Countdown Timer': CountdownTimer,
  'Testimonial Card': TestimonialCard,
  'Social Proof Bar': SocialProofBar,
  'Scarcity Bar': ScarcityBar,
  'Trust Badges': TrustBadgeStrip,
  'Icon Block': IconBlock,
  'Hero Section': HeroSection,
  'Features Section': FeaturesSection,
  'Pricing Section': PricingSection,
  'FAQ Section': FAQSection,
  'Lead Gen Section': LeadGenSection,
  'Testimonials Section': TestimonialsSection,
  'CTA Section': CTASection,
  'Social Proof Section': SocialProofSection,
};

// ── Canvas Wrapper ────────────────────────────────────────────────────────────
export const CanvasWrapper = ({ initialPageTree }: { initialPageTree?: string }) => {
  const { activeDevice, pageSettings } = usePageBuilderStore();
  const canvasBg = pageSettings?.themeColors?.background || '#ffffff';

  const getCanvasWidth = () => {
    switch (activeDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const defaultTree = JSON.stringify({
    ROOT: {
      type: { resolvedName: 'Container' },
      isCanvas: true,
      props: {},
      displayName: 'Container',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  });

  return (
    <Editor resolver={RESOLVER}>
      <div className="h-screen w-full flex flex-col bg-[#02040A] text-gray-100 overflow-hidden font-sans">

        {/* Top Navbar */}
        <TopToolbar />

        {/* 3-Panel Main Layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Palette */}
          <LeftSidebar />

          {/* Center Canvas Area */}
          <div className="flex-1 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/40 relative">
            <div
              className="shadow-2xl transition-all duration-300 ease-in-out relative origin-top"
              style={{
                width: getCanvasWidth(),
                minHeight: '100%',
                maxWidth: '100%',
                backgroundColor: canvasBg,
              }}
            >
              <EmptyCanvasPlaceholder />
              <Frame data={initialPageTree ?? defaultTree} />
            </div>
          </div>

          {/* Right Properties */}
          <RightSidebar />
        </div>
      </div>
    </Editor>
  );
};
