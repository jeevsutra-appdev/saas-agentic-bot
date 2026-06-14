'use client';

import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureGateProps {
  tenantSlug: string;
  featureKey: string;
  children: React.ReactNode;
}

export function FeatureGate({ tenantSlug, featureKey, children }: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant-settings?tenantSlug=${tenantSlug}`)
      .then(res => res.json())
      .then(data => {
        // If plan is 'enterprise', give access to everything.
        if (data.planId === 'enterprise' || data.planId === 'scale') {
          setHasAccess(true);
        } else if (data.unlockedFeatures && data.unlockedFeatures.includes(featureKey)) {
          setHasAccess(true);
        } else {
          setHasAccess(false); // Default to locked if not found
        }
      })
      .catch(() => setHasAccess(true)) // Fallback to allow on network error for UX
      .finally(() => setLoading(false));
  }, [tenantSlug, featureKey]);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!hasAccess) {
    return (
      <div className="w-full flex items-center justify-center p-12 relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Premium Feature</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            This feature is locked on your current subscription plan. Upgrade your plan to unlock powerful tools and accelerate your business growth.
          </p>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all">
            Upgrade Plan
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
