"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, CheckCircle2, Star, Zap, Shield, Truck,
  Phone, Mail, ChevronDown, Plus, Minus, X, Loader2,
  ArrowRight, Gift, Clock, TrendingUp
} from "lucide-react";

interface Props {
  store: any;
  tenantSlug: string;
}

export default function SingleProductStore({ store, tenantSlug }: Props) {
  const primary = store.primaryColor || "#8b5cf6";

  const [product, setProduct] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [orderStep, setOrderStep] = useState<"form" | "done">("form");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ h: 2, m: 47, s: 33 });

  // Countdown timer (urgency)
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Load the product linked to this store
  useEffect(() => {
    fetch(`/api/ecom/settings?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.products) {
          const products = d.products.filter((p: any) => p.isActive !== false);
          if (store.settings?.productId) {
            const linked = products.find((p: any) => p.id === store.settings.productId);
            if (linked) { setProduct(linked); return; }
          }
          if (products.length > 0) setProduct(products[0]);
        }
      })
      .catch(() => {});
  }, [tenantSlug, store]);

  const price = product?.price || 0;
  const comparePrice = product?.comparePrice || (price * 1.4);
  const discount = Math.round((1 - price / comparePrice) * 100);
  const currency = "৳";

  const handleOrder = async () => {
    if (!buyerName || !buyerPhone || !product) return;
    setIsOrdering(true);
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: store.id,
          buyerName,
          buyerPhone,
          deliveryAddress: buyerAddress,
          amountCents: Math.round(price * qty * 100),
          paymentMethod: "cod",
          itemsJson: JSON.stringify([{ id: product.id, name: product.name, price: product.price, quantity: qty, image: product.image }]),
          status: "pending"
        })
      });
      const data = await res.json();
      if (data.success) {
        const channel = new BroadcastChannel("aether-live-order-processing");
        channel.postMessage({ type: "NEW_ORDER", data: { ...data.order, buyerName, buyerPhone } });
        channel.close();
        setOrderId(data.order.id);
        setOrderStep("done");
      }
    } catch (e) {}
    finally { setIsOrdering(false); }
  };

  const faqs = [
    { q: "How long does delivery take?", a: "We deliver within 3–5 business days across Bangladesh." },
    { q: "Can I return the product?", a: "Yes, we have a 7-day hassle-free return policy." },
    { q: "Is cash on delivery available?", a: "Yes! COD is available nationwide." },
    { q: "How do I track my order?", a: "You'll receive an SMS with tracking details once your order ships." },
  ];

  const features = [
    { icon: "✅", text: "100% Authentic Product" },
    { icon: "🚚", text: "Free Delivery Nationwide" },
    { icon: "🔄", text: "7-Day Easy Returns" },
    { icon: "💳", text: "Cash on Delivery" },
  ];

  return (
    <div className="min-h-screen bg-[#02040A] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Urgency bar */}
      <div className="sticky top-0 z-50 py-2 px-4 text-center text-sm font-bold flex items-center justify-center gap-3" style={{ background: primary }}>
        <Clock className="h-4 w-4 shrink-0" />
        <span>Limited Offer Ends In:</span>
        <span className="font-black font-mono bg-black/20 px-2 py-0.5 rounded-lg">
          {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
        </span>
      </div>

      {/* Brand header */}
      <header className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {(store.brandLogo || store.image) && (
            <img
              src={store.brandLogo || store.image}
              alt={store.name}
              className="rounded-xl object-contain"
              style={{ height: store.brandLogoHeight || 32, width: "auto", maxWidth: 80 }}
            />
          )}
          <span className="text-white font-black text-sm">{store.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold">
          {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400" />)}
          <span className="text-gray-300 ml-1">4.9</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-32">

        {!product ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-gray-500 text-sm">Loading product...</p>
          </div>
        ) : (
          <>
            {/* Product image */}
            <div className="relative rounded-3xl overflow-hidden mb-6" style={{ aspectRatio: "1/1", background: primary + "10" }}>
              {product.image ? (
                <img src={product.image} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">📦</div>
              )}
              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-white font-black text-sm" style={{ background: primary }}>
                  -{discount}% OFF
                </div>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/90 px-2.5 py-1 rounded-lg">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-black">IN STOCK</span>
              </div>
            </div>

            {/* Product info */}
            <div className="flex flex-col gap-4 mb-6">
              <h1 className="text-white font-black text-2xl leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3">
                <span className="text-3xl font-black" style={{ color: primary }}>{currency}{price}</span>
                {comparePrice > price && (
                  <span className="text-gray-500 text-lg line-through">{currency}{Math.round(comparePrice)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-xs font-black px-2.5 py-1 rounded-lg">Save {currency}{Math.round((comparePrice - price) * qty)}</span>
                )}
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-gray-400 text-xs">(1,240+ happy customers)</span>
              </div>

              {product.description && (
                <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Feature chips */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2.5">
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="text-xs text-gray-300 font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-4">
              <span className="text-gray-400 text-sm font-bold">Quantity</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-white font-black text-lg w-8 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer text-white transition" style={{ background: primary }}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/8 rounded-2xl px-4 py-3 mb-6">
              <span className="text-gray-400 text-sm">Total ({qty} item{qty !== 1 ? "s" : ""})</span>
              <span className="font-black text-xl" style={{ color: primary }}>{currency}{price * qty}</span>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 mb-6">
              <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-xs font-bold">🔥 <span className="font-black">47 people</span> ordered this in the last 24 hours</p>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowOrder(true); setOrderStep("form"); }}
              className="w-full py-5 rounded-2xl text-white font-black text-lg cursor-pointer flex items-center justify-center gap-3 mb-3"
              style={{ background: `linear-gradient(135deg, ${primary}, ${primary}bb)`, boxShadow: `0 0 50px ${primary}40` }}
              animate={{ boxShadow: [`0 0 30px ${primary}30`, `0 0 60px ${primary}50`, `0 0 30px ${primary}30`] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ShoppingCart className="h-6 w-6" />
              Order Now — {currency}{price * qty}
            </motion.button>

            <p className="text-center text-gray-600 text-xs">🔒 Secure Checkout · Cash on Delivery Available</p>

            {/* FAQ */}
            <div className="mt-8 flex flex-col gap-2">
              <h2 className="text-white font-black text-lg mb-2">Frequently Asked</h2>
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left cursor-pointer hover:bg-white/[0.03] transition"
                  >
                    <span className="text-white font-bold text-sm pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Contact */}
            {(store.settings?.phone || store.settings?.email) && (
              <div className="mt-8 flex flex-col gap-3">
                <h2 className="text-white font-black text-lg">Need Help?</h2>
                <div className="flex gap-3">
                  {store.settings.phone && (
                    <a href={`tel:${store.settings.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 font-bold text-sm hover:bg-white/10 transition cursor-pointer">
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  )}
                  {store.settings.email && (
                    <a href={`mailto:${store.settings.email}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 font-bold text-sm hover:bg-white/10 transition cursor-pointer">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed bottom CTA */}
      {product && (
        <div className="fixed bottom-0 inset-x-0 px-5 pb-6 pt-3 bg-gradient-to-t from-[#02040A] via-[#02040A]/95 to-transparent z-40">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowOrder(true); setOrderStep("form"); }}
            className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer flex items-center justify-center gap-2"
            style={{ background: primary, boxShadow: `0 0 30px ${primary}50` }}
          >
            <Zap className="h-5 w-5" /> Order Now · {currency}{price * qty}
          </motion.button>
        </div>
      )}

      {/* Order modal */}
      <AnimatePresence>
        {showOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(2,4,10,0.90)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="bg-[#0a0d18] border-t border-white/10 rounded-t-[2rem] max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8 shrink-0">
                <h2 className="text-white font-black text-lg">
                  {orderStep === "form" ? "Complete Your Order" : "🎉 Order Confirmed!"}
                </h2>
                <button onClick={() => setShowOrder(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-5">
                {orderStep === "form" ? (
                  <div className="flex flex-col gap-5">
                    {/* Order summary */}
                    {product && (
                      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3">
                        {product.image && <img src={product.image} className="h-14 w-14 rounded-xl object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{product.name}</p>
                          <p className="text-xs font-black mt-0.5" style={{ color: primary }}>Qty: {qty} × {currency}{price} = {currency}{price * qty}</p>
                        </div>
                      </div>
                    )}

                    {[
                      { label: "Your Name *", value: buyerName, setter: setBuyerName, placeholder: "Full name", type: "text" },
                      { label: "Phone Number *", value: buyerPhone, setter: setBuyerPhone, placeholder: "+880 1234 567890", type: "tel" },
                      { label: "Delivery Address", value: buyerAddress, setter: setBuyerAddress, placeholder: "House, street, city...", type: "text" },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">{field.label}</label>
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
                        />
                      </div>
                    ))}

                    <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                      <p className="text-emerald-300 text-xs">Cash on delivery · No advance payment needed</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-5 py-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-6xl">✅</motion.div>
                    <div>
                      <h3 className="text-white font-black text-xl">Thank You, {buyerName}!</h3>
                      <p className="text-gray-400 text-sm mt-1">Order #{orderId?.substring(6, 14).toUpperCase()} placed</p>
                    </div>
                    <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-left flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Product</span>
                        <span className="text-white font-bold">{product?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Quantity</span>
                        <span className="text-white font-bold">{qty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="font-black" style={{ color: primary }}>{currency}{price * qty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-white font-bold">{buyerPhone}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">We'll call you to confirm delivery details</p>
                    <button onClick={() => setShowOrder(false)} className="w-full py-3 rounded-2xl bg-white/10 text-white font-bold text-sm cursor-pointer hover:bg-white/15 transition">
                      Close
                    </button>
                  </div>
                )}
              </div>

              {orderStep === "form" && (
                <div className="px-5 pb-6 pt-3 border-t border-white/8 shrink-0">
                  <button
                    disabled={!buyerName || !buyerPhone || isOrdering}
                    onClick={handleOrder}
                    className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: primary }}
                  >
                    {isOrdering ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Zap className="h-5 w-5" /> Confirm Order · {currency}{price * qty}</>}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
