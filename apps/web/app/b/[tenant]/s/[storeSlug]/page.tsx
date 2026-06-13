"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const FoodEcomStore = dynamic(() => import("./templates/FoodEcomStore"), { ssr: false });
const ServiceStore = dynamic(() => import("./templates/ServiceStore"), { ssr: false });
const SingleProductStore = dynamic(() => import("./templates/SingleProductStore"), { ssr: false });
const PremiumRetailStore = dynamic(() => import("./templates/PremiumRetailStore"), { ssr: false });

export default function StorePage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const storeSlug = params.storeSlug as string;

  const [store, setStore] = useState<any | null>(null);
  const [storefront, setStorefront] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!tenantSlug || !storeSlug) return;
    Promise.all([
      fetch(`/api/ecom/stores?tenantSlug=${tenantSlug}&storeSlug=${storeSlug}`).then(r => r.json()),
      fetch(`/api/ecom/settings?tenantSlug=${tenantSlug}`).then(r => r.json())
    ]).then(([storeData, settingsData]) => {
      if (storeData.success && storeData.store) {
        setStore(storeData.store);
      } else {
        setNotFound(true);
      }
      if (settingsData.storefront) {
        setStorefront(settingsData.storefront);
      }
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [tenantSlug, storeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="min-h-screen bg-[#02040A] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">🏪</div>
        <h1 className="text-white font-black text-2xl">Store Not Found</h1>
        <p className="text-gray-500 text-sm">
          The store <span className="text-indigo-400 font-mono">{storeSlug}</span> doesn't exist for this tenant.
        </p>
        <a href={`/b/${tenantSlug}`} className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm">
          ← Go to Default Store
        </a>
      </div>
    );
  }

  const template = storefront?.template || store.template || "retail";

  if (store.storeType === "service") {
    return <ServiceStore store={store} tenantSlug={tenantSlug} />;
  }

  if (store.storeType === "single_product") {
    return <SingleProductStore store={store} tenantSlug={tenantSlug} />;
  }

  // Premium retail template
  if (template === "retail_premium") {
    return <PremiumRetailStore store={store} storefront={storefront} tenantSlug={tenantSlug} />;
  }

  // Default: food + ecom unified
  return <FoodEcomStore store={store} tenantSlug={tenantSlug} />;
}
