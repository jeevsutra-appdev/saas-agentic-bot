'use client';

import React, { useState, useEffect } from 'react';
import { Editor, Frame } from '@craftjs/core';
import { Loader2, CheckCircle2 } from 'lucide-react';

// We must import ALL components that the editor might need to resolve
import { TextElement } from '../components/elements/TextElement';
import { ButtonElement } from '../components/elements/ButtonElement';
import { ImageElement } from '../components/elements/ImageElement';
import { VideoElement } from '../components/elements/VideoElement';
import { FormElement } from '../components/elements/FormElement';
import { ContainerElement } from '../components/elements/ContainerElement';
import { SpacerElement, DividerElement } from '../components/elements/SpacerDivider';
import { ColumnsLayout } from '../components/elements/ColumnsLayout';

// Conversion elements
import { CountdownTimer } from '../components/elements/CountdownTimer';
import { TestimonialCard } from '../components/elements/TestimonialCard';
import { SocialProofBar } from '../components/elements/SocialProofBar';
import { ScarcityBar } from '../components/elements/ScarcityBar';
import { TrustBadgeStrip } from '../components/elements/TrustBadgeStrip';
import { IconBlock } from '../components/elements/IconBlock';

// Sections
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { PricingSection } from '../components/sections/PricingSection';
import { FAQSection } from '../components/sections/FAQSection';
import { LeadGenSection } from '../components/sections/LeadGenSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { CTASection } from '../components/sections/CTASection';
import { SocialProofSection } from '../components/sections/SocialProofSection';

const Container = ({ children }: { children?: React.ReactNode }) => {
  return <div className="w-full min-h-screen bg-[#02040A] text-white">{children}</div>;
};

export default function PublicRender({ pageTree }: { pageTree: string }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'initializing' | 'redirecting'>('initializing');

  useEffect(() => {
    const handleCheckout = () => {
      setIsCheckingOut(true);
      setCheckoutStatus('initializing');
      
      // Simulate ultra-premium gateway handshake
      setTimeout(() => {
        setCheckoutStatus('redirecting');
        // In real app, this redirects to Stripe/Razorpay
        setTimeout(() => setIsCheckingOut(false), 2000); 
      }, 1500);
    };

    window.addEventListener('lps:checkout', handleCheckout);
    return () => window.removeEventListener('lps:checkout', handleCheckout);
  }, []);

  if (!pageTree) return null;

  return (
    <>
      <Editor 
        enabled={false} // READ-ONLY MODE for public viewing
        resolver={{ 
          Container, 
          TextElement, 
          ButtonElement, 
          ImageElement, 
          VideoElement,
          FormElement,
          ContainerElement,
          SpacerElement, 
          DividerElement, 
          ColumnsLayout,
          CountdownTimer,
          TestimonialCard,
          SocialProofBar,
          ScarcityBar,
          TrustBadgeStrip,
          IconBlock,
          HeroSection, 
          FeaturesSection, 
          PricingSection, 
          FAQSection,
          LeadGenSection,
          TestimonialsSection,
          CTASection,
          SocialProofSection
        }}
      >
      <div className="w-full h-full font-sans antialiased bg-[#02040A] text-gray-100 selection:bg-indigo-500/30">
        <Frame data={pageTree} />
      </div>
    </Editor>

    {/* Ultra Premium Checkout Overlay */}
    {isCheckingOut && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
        <div className="relative bg-[#070A13]/90 border border-indigo-500/30 p-10 rounded-3xl shadow-[0_0_80px_rgba(79,70,229,0.2)] flex flex-col items-center max-w-sm w-full mx-4 overflow-hidden">
          
          {/* Animated Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />

          {checkoutStatus === 'initializing' ? (
            <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-6 relative z-10" />
          ) : (
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-6 relative z-10" />
          )}

          <h3 className="text-xl font-extrabold text-white mb-2 text-center relative z-10">
            {checkoutStatus === 'initializing' ? 'Secure Checkout' : 'Redirecting...'}
          </h3>
          <p className="text-gray-400 text-sm text-center relative z-10">
            {checkoutStatus === 'initializing' 
              ? 'Establishing 256-bit encrypted connection to our payment gateway.' 
              : 'Taking you to the secure payment portal.'}
          </p>

          <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest relative z-10 font-bold">
            <span>Powered by</span>
            <span className="text-gray-300">Aether Commerce</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
