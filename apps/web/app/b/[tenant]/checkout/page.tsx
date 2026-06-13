"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Smartphone, 
  Building, 
  ShoppingBag, 
  Package, 
  Trash2, 
  Flame, 
  Gift, 
  ArrowRight, 
  Plus, 
  Minus, 
  Percent,
  Check
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number; // in cents
  image?: string;
  isDigital?: boolean;
  quantity?: number;
}

export default function StandaloneFastCheckout() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenant as string;

  const [storeData, setStoreData] = useState<{ products: any[]; storefront: any }>({ products: [], storefront: null });
  const [loading, setLoading] = useState(true);
  
  // Checkout items
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directProduct, setDirectProduct] = useState<any | null>(null);
  
  // Checkout Form States
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  
  // Coupon state
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // Order states
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  const [orderInvoiceRef, setOrderInvoiceRef] = useState("");
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);
  const [reservedTimeLeft, setReservedTimeLeft] = useState(599); // 9 mins 59s countdown

  // Synthesis for sounds
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.35); // C6
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  };

  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const colors = ["#6366f1", "#a5b4fc", "#10b981", "#ec4899", "#f59e0b"];

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }

      for (let i = 0; i < 6; i++) {
        const p = document.createElement("div");
        p.style.position = "fixed";
        p.style.left = (Math.random() * 80 + 10) + "vw";
        p.style.top = "-5vh";
        p.style.width = (Math.random() * 7 + 6) + "px";
        p.style.height = (Math.random() * 7 + 6) + "px";
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = Math.random() > 0.5 ? "50%" : "0px";
        p.style.zIndex = "9999";
        p.style.pointerEvents = "none";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(p);

        const durationSec = Math.random() * 1.5 + 1.2;
        p.style.transition = `transform ${durationSec}s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${durationSec}s ease`;
        
        requestAnimationFrame(() => {
          p.style.transform = `translateY(105vh) rotate(${Math.random() * 720}deg)`;
          p.style.opacity = "0";
        });

        setTimeout(() => p.remove(), durationSec * 1000);
      }
    }, 150);
  };

  // Load catalog and items
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/ecom?tenant=${tenantSlug}`);
        const data = await res.json();
        if (data.success) {
          setStoreData({ products: data.products, storefront: data.storefront });
          
          // Parse query parameter
          const searchParams = new URLSearchParams(window.location.search);
          const pId = searchParams.get("productId") || searchParams.get("product");
          if (pId) {
            const prod = data.products.find((p: any) => p.id === pId);
            if (prod) {
              setDirectProduct(prod);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Retrieve active cart from localStorage
    try {
      const stored = localStorage.getItem("aether-ecom-cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
      
      const storedCoupon = localStorage.getItem("aether-coupon-code");
      const storedDiscount = localStorage.getItem("aether-discount-percentage");
      if (storedCoupon) {
        setCouponCode(storedCoupon);
        setDiscountPercentage(Number(storedDiscount));
      }
    } catch (e) {
      console.error(e);
    }
  }, [tenantSlug]);

  // Reservation countdown timer
  useEffect(() => {
    if (reservedTimeLeft <= 0 || checkoutStep !== "form") return;
    const interval = setInterval(() => {
      setReservedTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [reservedTimeLeft, checkoutStep]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("processing");

    // Gather checkout items
    const itemsToPurchase = directProduct ? [directProduct] : cart;
    if (itemsToPurchase.length === 0) {
      setCheckoutStep("form");
      alert("Checkout items are missing.");
      return;
    }

    const orderAmountCents = Math.round(finalTotal * 100);

    setTimeout(async () => {
      try {
        const orderRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            productId: itemsToPurchase[0].id, // primary product id
            buyerName,
            buyerEmail,
            buyerPhone,
            shippingAddress: itemsToPurchase[0].isDigital ? "Digital Download" : shippingAddress,
            paymentMethod,
            amountCents: orderAmountCents
          })
        });

        if (orderRes.ok) {
          const data = await orderRes.json();
          if (data.success) {
            playSuccessSound();
            triggerConfetti();
            setOrderInvoiceRef(data.order.id || `#AETH-${Math.floor(100000 + Math.random() * 900000)}`);
            setCheckoutStep("success");
            
            // Clear checkout context
            localStorage.removeItem("aether-ecom-cart");
            localStorage.removeItem("aether-coupon-code");
            localStorage.removeItem("aether-discount-percentage");
          } else {
            setCheckoutStep("form");
            alert("Error: " + (data.error || "Order validation failed"));
          }
        } else {
          setCheckoutStep("form");
          alert("Payment gate compilation error.");
        }
      } catch (err) {
        setCheckoutStep("form");
        alert("Checkout submission error.");
      }
    }, 2000);
  };

  const applyManualCoupon = () => {
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === "WELCOME10" || code === "VIP10") {
      setCouponCode(code);
      setDiscountPercentage(10);
      playSuccessSound();
    } else if (code === "VIP15" || code === "SECRET15") {
      setCouponCode(code);
      setDiscountPercentage(15);
      playSuccessSound();
    } else if (code === "SECRET20" || code === "MYSTERY20") {
      setCouponCode(code);
      setDiscountPercentage(20);
      playSuccessSound();
    } else {
      setCouponError("Invalid or expired coupon code");
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountPercentage(0);
    setCouponInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04060c] flex flex-col items-center justify-center text-white font-mono gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <span>Synthesizing Premium Gateway...</span>
      </div>
    );
  }

  const primaryHex = storeData.storefront?.primaryColor || "#6366f1";
  const currencySymbol = storeData.storefront?.globalCurrency === "INR" ? "₹" : "$";

  // Calculations
  const checkoutItems = directProduct ? [directProduct] : cart;
  const isCartEmpty = checkoutItems.length === 0;

  const subtotal = checkoutItems.reduce((acc, item) => {
    const qty = item.quantity || 1;
    return acc + ((item.price || 0) * qty);
  }, 0) / 100;

  const orderBumpPrice = 5.99; // $5.99 warranty
  const preDiscountTotal = subtotal + (orderBumpSelected ? orderBumpPrice : 0);
  const discountAmount = preDiscountTotal * (discountPercentage / 100);
  const discountedSubtotal = preDiscountTotal - discountAmount;

  const shippingRate = storeData.storefront?.shippingRate || 0;
  const freeThreshold = storeData.storefront?.freeShippingThreshold || 100;
  const isAllDigital = checkoutItems.every(i => i.isDigital);
  
  let appliedShipping = isAllDigital ? 0 : shippingRate / 100;
  if (freeThreshold > 0 && discountedSubtotal >= freeThreshold) {
    appliedShipping = 0;
  }

  const finalTotal = discountedSubtotal + appliedShipping;

  return (
    <div className="min-h-screen bg-[#04060c] text-gray-100 font-sans selection:bg-white/30 relative">
      
      {/* Ambient backgrounds */}
      <div className="absolute top-0 inset-x-0 h-96 opacity-15 pointer-events-none" style={{ background: `radial-gradient(circle at top, ${primaryHex}, transparent 70%)` }} />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#04060c]/85 backdrop-blur-xl border-b border-white/5 w-full">
        <div className="max-w-[1200px] mx-auto w-full px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.push(`/b/${tenantSlug}`)} 
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/10 bg-white/5 px-3 py-1.5 rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> <span>Store</span>
          </button>
          
          <div className="flex items-center gap-3">
            {storeData.storefront?.brandLogo ? (
              <img src={storeData.storefront.brandLogo} className="h-8 w-8 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-indigo-400" />
              </div>
            )}
            <h1 className="text-sm font-black text-white">{storeData.storefront?.companyName || "Aether Store"}</h1>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] text-emerald-400 font-mono font-bold select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> SECURE 256-BIT SSL
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-8 relative z-10">
        
        {/* Urgent countdown banner */}
        {checkoutStep === "form" && !isCartEmpty && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 p-3 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg select-none"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Flame className="h-4.5 w-4.5 text-red-500 animate-pulse" />
              <span>Items reserved! High checkout volume — your reservation expires in:</span>
            </div>
            <div className="text-sm font-black font-mono text-red-400 bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-xl">
              {formatTimer(reservedTimeLeft)}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {checkoutStep === "form" && (
            <motion.div 
              key="form" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Column: Form Details */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {isCartEmpty ? (
                  <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4">
                    <ShoppingBag className="h-16 w-16 text-gray-600" />
                    <h2 className="text-xl font-bold text-white">Your checkout is empty</h2>
                    <p className="text-sm text-gray-400 max-w-sm">No items were found in your cart. Add some products from our catalog to get started.</p>
                    <button 
                      onClick={() => router.push(`/b/${tenantSlug}`)} 
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-extrabold text-sm hover:bg-indigo-500 transition-colors shadow-lg cursor-pointer mt-2"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-6 select-text">
                    
                    {/* Customer Info Card */}
                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">1. Delivery Contact Information</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Your Full Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Imran Hossain" 
                            value={buyerName}
                            onChange={e => setBuyerName(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium" 
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Email Address</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="imran@example.com" 
                            value={buyerEmail}
                            onChange={e => setBuyerEmail(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Phone Number</label>
                          <input 
                            type="tel" 
                            required 
                            placeholder="+91 XXXXX XXXXX" 
                            value={buyerPhone}
                            onChange={e => setBuyerPhone(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium" 
                          />
                        </div>
                        {!isAllDigital && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Shipping Destination</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Flat, Road, City, Zipcode" 
                              value={shippingAddress}
                              onChange={e => setShippingAddress(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium" 
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Gate Selection Card */}
                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">2. Secure Payment Gateway</h3>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "upi", icon: Smartphone, label: "UPI / QR code" },
                          { id: "card", icon: CreditCard, label: "Credit Card" },
                          { id: "cod", icon: Building, label: "Cash (COD)" }
                        ].map(method => {
                          const isSelected = paymentMethod === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => {
                                playTickSound();
                                setPaymentMethod(method.id as any);
                              }}
                              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                                isSelected
                                  ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/5"
                                  : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10 hover:bg-black/40"
                              }`}
                            >
                              <method.icon className="h-5 w-5" />
                              <span className="text-[10px] font-black tracking-tight leading-none text-center">{method.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit checkout CTA */}
                    <button 
                      type="submit" 
                      className="w-full text-white font-black py-4.5 rounded-[1.8rem] text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-600/20 border border-white/10 cursor-pointer"
                      style={{ backgroundColor: primaryHex }}
                    >
                      Authorize & Pay Securely — {currencySymbol}{finalTotal.toFixed(2)}
                    </button>

                  </form>
                )}

              </div>

              {/* Right Column: Order Items Review */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Summary Card */}
                {!isCartEmpty && (
                  <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-2">Order Summary</h3>

                    {/* Products List */}
                    <div className="flex flex-col gap-4">
                      {checkoutItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                          {item.image ? (
                            <img src={item.image} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <Package className="h-6 w-6 text-white/30" />
                            </div>
                          )}
                          <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-xs font-black text-white truncate leading-tight">{item.name}</span>
                            <span className="text-[9px] text-gray-500 uppercase font-mono mt-0.5">{item.isDigital ? "Digital File" : "Physical Product"}</span>
                            <span className="text-xs font-black text-indigo-400 mt-1 font-mono">{currencySymbol}{(item.price / 100).toFixed(2)}</span>
                          </div>
                          {!directProduct && (
                            <button 
                              onClick={() => {
                                playTickSound();
                                const newCart = cart.filter((_, i) => i !== idx);
                                setCart(newCart);
                                localStorage.setItem("aether-ecom-cart", JSON.stringify(newCart));
                              }} 
                              className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer border border-white/5 bg-white/5 rounded-full"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Free shipping banner check */}
                    {freeThreshold > 0 && !isAllDigital && (
                      <div className="p-4.5 rounded-2xl bg-white/2 border border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-indigo-300 flex items-center gap-1.5">
                            <Gift className="h-4 w-4 text-indigo-400 animate-bounce" /> Shipping Goal Progress
                          </span>
                          {discountedSubtotal >= freeThreshold ? (
                            <span className="text-emerald-400">FREE EXPRESS DELIVERY UNLOCKED!</span>
                          ) : (
                            <span className="text-gray-400">Add {currencySymbol}{(freeThreshold - discountedSubtotal).toFixed(2)} more for Free Shipping</span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (discountedSubtotal / freeThreshold) * 100)}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Order bump selection */}
                    <div className="p-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 shadow relative overflow-hidden">
                      <div className="bg-[#0c101a] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-600 text-white text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">Exclusive Add-on</div>
                        
                        <label className="flex gap-3 cursor-pointer pt-1.5 select-none">
                          <div className="pt-0.5">
                            <div 
                              onClick={() => {
                                playTickSound();
                                setOrderBumpSelected(!orderBumpSelected);
                              }}
                              className={`h-5.5 w-5.5 rounded border-2 flex items-center justify-center transition-all ${orderBumpSelected ? "border-emerald-500 bg-emerald-500" : "border-white/20 hover:border-white/40"}`}
                            >
                              {orderBumpSelected && <Check className="h-3.5 w-3.5 stroke-[3px] text-white" />}
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5 pr-6">
                            <span className="font-extrabold text-white text-xs">Add Extended Protection Shield Warranty</span>
                            <span className="text-[10px] text-gray-400 leading-normal">
                              1-Year absolute replacements & priority support for just <span className="font-black text-emerald-400">{currencySymbol}{orderBumpPrice.toFixed(2)}</span>
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Coupon Input Area */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Coupon Discount Code</label>
                      {couponCode ? (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4.5 w-4.5 text-emerald-400" />
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-white">{couponCode} APPLIED</span>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">{discountPercentage}% Discount Applied</span>
                            </div>
                          </div>
                          <button onClick={removeCoupon} className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5 bg-white/5 rounded-lg px-2.5 py-1">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="e.g. WELCOME10" 
                            value={couponInput}
                            onChange={e => {
                              setCouponInput(e.target.value);
                              setCouponError("");
                            }}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 flex-grow uppercase font-mono font-extrabold" 
                          />
                          <button 
                            type="button" 
                            onClick={applyManualCoupon}
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl px-4 py-2 text-xs font-black cursor-pointer transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {couponError && <p className="text-[10px] font-bold text-red-500 px-1 font-mono">{couponError}</p>}
                    </div>

                    {/* Mathematical Pricing Breakdown */}
                    <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5 text-xs font-bold text-gray-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="text-white font-mono">{currencySymbol}{subtotal.toFixed(2)}</span>
                      </div>
                      {orderBumpSelected && (
                        <div className="flex justify-between">
                          <span>Warranty Shield Add-on:</span>
                          <span className="text-white font-mono">+{currencySymbol}{orderBumpPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {discountPercentage > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>VIP Coupon ({discountPercentage}%):</span>
                          <span className="font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping Courier Delivery:</span>
                        <span className="text-white font-mono">{appliedShipping === 0 ? "FREE" : `${currencySymbol}${appliedShipping.toFixed(2)}`}</span>
                      </div>
                      <hr className="border-white/5 my-1" />
                      <div className="flex justify-between text-base text-white">
                        <span className="font-black">Total Price:</span>
                        <span className="font-black font-mono text-emerald-400">{currencySymbol}{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Badges footer */}
                    <div className="flex flex-col gap-2 mt-2 select-none">
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Secured 256-Bit SSL AES Encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <ShieldCheck className="h-4 w-4 text-indigo-400" />
                        <span>PCI DSS Certified Compliant Portal</span>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </motion.div>
          )}

          {/* Processing screen */}
          {checkoutStep === "processing" && (
            <motion.div 
              key="processing" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto py-16 text-center select-none"
            >
              <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <div className="h-12 w-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin flex items-center justify-center mb-2" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Securing PCI Bank Gateway...</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Processing payment tokens and reserving stock. Please do not close or reload this window.</p>
              </div>
            </motion.div>
          )}

          {/* Confirmation/Success screen */}
          {checkoutStep === "success" && (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="max-w-md mx-auto py-8"
            >
              <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-center flex flex-col items-center justify-center gap-5 relative overflow-hidden shadow-2xl select-text">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow shadow-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black text-white font-heading uppercase tracking-wider">Order Confirmed!</h3>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest font-mono">Invoice Ref: {orderInvoiceRef}</p>
                </div>

                <p className="text-xs text-gray-400 leading-normal px-4">
                  Thank you for your purchase! A confirmation email along with shipping tracking information has been sent to <strong className="text-white">{buyerEmail}</strong>.
                </p>

                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 text-left flex flex-col gap-2.5 text-xs w-full">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer Name:</span>
                    <span className="text-white font-bold">{buyerName}</span>
                  </div>
                  {buyerPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone Number:</span>
                      <span className="text-white font-bold">{buyerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/5 pt-2.5 mt-1 font-bold text-emerald-400 text-sm">
                    <span>Total Paid:</span>
                    <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/b/${tenantSlug}`)} 
                  className="mt-3 w-full bg-white hover:bg-gray-100 text-black font-extrabold py-4 rounded-2xl text-xs transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Return to Storefront <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
