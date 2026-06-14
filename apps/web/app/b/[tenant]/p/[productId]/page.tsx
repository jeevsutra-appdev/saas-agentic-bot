"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Package,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Star,
  Flame,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Percent,
  Gift,
  HelpCircle,
  Eye,
  CreditCard,
  Building,
  Smartphone,
  ChevronDown,
  Loader2
} from "lucide-react";

export default function SingleProductLandingPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenant as string;
  const productId = params.productId as string;

  const [storeData, setStoreData] = useState<{ products: any[], storefront: any }>({ products: [], storefront: null });
  const [loading, setLoading] = useState(true);
  
  // Funnel & Product States
  const [product, setProduct] = useState<any>(null);
  const [bumpProduct, setBumpProduct] = useState<any>(null);
  const [upsellProduct, setUpsellProduct] = useState<any>(null);
  const [downsellProduct, setDownsellProduct] = useState<any>(null);
  
  const [isBumpSelected, setIsBumpSelected] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"view" | "processing" | "upsell" | "downsell" | "success">("view");
  const [finalOrderTotal, setFinalOrderTotal] = useState(0);

  // Swatch States
  const [selectedColor, setSelectedColor] = useState("Vastu Gold");
  const [selectedEdition, setSelectedEdition] = useState("Pooja Special");
  
  // Active Viewer Urgency State
  const [viewerCount, setViewerCount] = useState(14);
  const [stockLevel, setStockLevel] = useState(5);

  // Gamified Wheel States
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [wheelCountdown, setWheelCountdown] = useState<number>(300); // 5 mins countdown

  // Fast Checkout Form States
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  
  // Interactive reviews state
  const [reviews, setReviews] = useState([
    { name: "Rahul S.", rating: 5, comment: "Brought positive energy immediately. The packaging was beautiful and brass metal looks pure.", date: "2 days ago", helpful: 14 },
    { name: "Meera Patel", rating: 5, comment: "Very heavy and high quality detailing. Highly recommended for office desks.", date: "1 week ago", helpful: 9 },
    { name: "Amit Sharma", rating: 4, comment: "Excellent Vastu product. Packing could be a bit faster but overall very satisfied.", date: "2 weeks ago", helpful: 3 }
  ]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Synthesize Wheel Ticking Sounds (Web Audio API)
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  };

  const playWinSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.35); // C6
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  };

  // Pure JavaScript/DOM lightweight confetti particles
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

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // FIXED Parameter naming: passing 'tenant' instead of 'tenantSlug'
        const res = await fetch(`/api/ecom?tenant=${tenantSlug}`);
        const data = await res.json();
        if (data.success) {
          setStoreData({ products: data.products, storefront: data.storefront });
          
          const mainProd = data.products.find((p: any) => p.id === productId);
          if (mainProd) {
            setProduct(mainProd);
            if (mainProd.orderBumpProductId) {
              setBumpProduct(data.products.find((p: any) => p.id === mainProd.orderBumpProductId));
            }
            if (mainProd.upsellProductId) {
              setUpsellProduct(data.products.find((p: any) => p.id === mainProd.upsellProductId));
            }
            if (mainProd.downsellProductId) {
              setDownsellProduct(data.products.find((p: any) => p.id === mainProd.downsellProductId));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantSlug, productId]);

  // Load Coupon from localStorage on mount
  useEffect(() => {
    try {
      const storedCoupon = localStorage.getItem("aether-coupon-code");
      const storedDiscount = localStorage.getItem("aether-discount-percentage");
      if (storedCoupon) setCouponCode(storedCoupon);
      if (storedDiscount) setDiscountPercentage(Number(storedDiscount));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save Coupon to localStorage on change
  useEffect(() => {
    try {
      if (couponCode) {
        localStorage.setItem("aether-coupon-code", couponCode);
        localStorage.setItem("aether-discount-percentage", String(discountPercentage));
      } else {
        localStorage.removeItem("aether-coupon-code");
        localStorage.removeItem("aether-discount-percentage");
      }
    } catch (e) {
      console.error(e);
    }
  }, [couponCode, discountPercentage]);

  // Urgency Simulated Indicators
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      // Small viewer variance
      setViewerCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + delta;
        return newVal > 4 ? (newVal < 25 ? newVal : 20) : 5;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  // Exit Intent and Inactivity Listeners for Spin the Wheel
  useEffect(() => {
    if (loading || couponCode) return;

    // Exit intent trigger for desktop
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) {
        setShowWheel(true);
      }
    };

    // Inactivity trigger for mobile/desktop (18 seconds)
    const inactivityTimeout = setTimeout(() => {
      setShowWheel(true);
    }, 18000);

    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(inactivityTimeout);
    };
  }, [loading, couponCode]);

  // Coupon countdown timer
  useEffect(() => {
    if (!couponCode || wheelCountdown <= 0) return;
    const t = setInterval(() => {
      setWheelCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [couponCode, wheelCountdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-white font-mono gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <span>Synthesizing Premium Storefront...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Product not found</h2>
          <button onClick={() => router.push(`/b/${tenantSlug}`)} className="mt-4 px-6 py-2.5 bg-indigo-600 rounded-xl font-bold text-sm">Back to Store</button>
        </div>
      </div>
    );
  }

  const primaryHex = storeData.storefront?.primaryColor || "#6366f1";

  const getCurrencySymbol = (code: string | undefined) => {
    if (!code) return "$";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";
    if (code === "INR") return "₹";
    if (code === "BDT") return "৳";
    return "$";
  };
  const currencySymbol = getCurrencySymbol(product.currency || storeData.storefront?.globalCurrency);

  // Prices calculations
  const basePrice = product.price / 100;
  const bumpPrice = product.orderBumpPrice ? (product.orderBumpPrice / 100) : (bumpProduct ? bumpProduct.price / 100 : 0);
  
  // Math calculations with Coupon Discount
  const preDiscountTotal = basePrice + (isBumpSelected ? bumpPrice : 0);
  const discountAmount = preDiscountTotal * (discountPercentage / 100);
  const currentTotal = preDiscountTotal - discountAmount;

  // Wheel configuration
  const wheelSectors = [
    { label: "10% OFF", percentage: 10, code: "WELCOME10" },
    { label: "Try Again", percentage: 0, code: null },
    { label: "15% OFF", percentage: 15, code: "VIP15" },
    { label: "Free Gift", percentage: 0, code: "MYSTERYGIFT" },
    { label: "20% OFF", percentage: 20, code: "SECRET20" },
    { label: "Try Again", percentage: 0, code: null }
  ];

  const spinTheWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Choose sector index (prefer index 2, 4 or 0 to give them a real discount)
    const winningIndex = [0, 2, 4][Math.floor(Math.random() * 3)]; 
    const sectorAngle = 360 / wheelSectors.length;
    const extraSpins = 5 * 360; // 5 full rotations
    // Center point of winning sector
    const targetAngle = extraSpins + (360 - (winningIndex * sectorAngle) - (sectorAngle / 2));

    let currentAngle = 0;
    const duration = 4000;
    const start = Date.now();

    const animateWheel = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setWheelAngle(targetAngle % 360);
        setIsSpinning(false);
        const win = wheelSectors[winningIndex];
        if (win.code) {
          setCouponCode(win.code);
          setDiscountPercentage(win.percentage);
          playWinSound();
          triggerConfetti();
        } else {
          setCouponCode("VIP10");
          setDiscountPercentage(10);
          playWinSound();
        }
        setTimeout(() => setShowWheel(false), 2000);
        return;
      }

      // Easing out cubic
      const progress = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentAngle = targetAngle * easeOut;
      setWheelAngle(currentAngle);

      // Play tick sounds as it passes sectors
      if (Math.floor(currentAngle / sectorAngle) > Math.floor((targetAngle * progress) / sectorAngle)) {
        playTickSound();
      }

      requestAnimationFrame(animateWheel);
    };

    requestAnimationFrame(animateWheel);
  };

  // Checkout process submit
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;

    setCheckoutStep("processing");

    // Simulate PCI Authorizing Network Gateway (1.8s)
    setTimeout(async () => {
      try {
        const orderRes = await fetch("/api/ecom/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            productId: product.id,
            buyerName,
            buyerEmail,
            amountCents: Math.round(currentTotal * 100),
            status: "paid",
            shippingAddress: shippingAddress || "Digital Handoff",
            paymentMethod: paymentMethod
          })
        });

        if (orderRes.ok) {
          triggerConfetti();
          setFinalOrderTotal(currentTotal);
          
          if (upsellProduct) {
            setCheckoutStep("upsell");
          } else {
            setCheckoutStep("success");
          }
        } else {
          setCheckoutStep("view");
          alert("Order compilation failed. Please verify details.");
        }
      } catch (err) {
        setCheckoutStep("view");
        alert("Payment gateway failed to connect.");
      }
    }, 1800);
  };

  const handleAcceptUpsell = () => {
    setFinalOrderTotal(prev => prev + (upsellProduct.price / 100));
    triggerConfetti();
    setCheckoutStep("success");
  };

  const handleDeclineUpsell = () => {
    if (downsellProduct) {
      setCheckoutStep("downsell");
    } else {
      setCheckoutStep("success");
    }
  };

  const handleAcceptDownsell = () => {
    setFinalOrderTotal(prev => prev + (downsellProduct.price / 100));
    triggerConfetti();
    setCheckoutStep("success");
  };

  const handleDeclineDownsell = () => {
    setCheckoutStep("success");
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}`;
  };

  // Add review logic
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;
    const newRev = {
      name: userName,
      rating: userRating,
      comment: userComment,
      date: "Just now",
      helpful: 0
    };
    setReviews([newRev, ...reviews]);
    setUserName("");
    setUserComment("");
    setShowReviewForm(false);
    triggerConfetti();
  };

  return (
    <div className="min-h-screen bg-[#070913] text-gray-200 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-x-hidden custom-scrollbar">
      
      {/* Brand Theme Spotlight */}
      <div className="absolute top-0 inset-x-0 h-[65vh] opacity-25 pointer-events-none" style={{ background: `radial-gradient(circle at top, ${primaryHex}, transparent 70%)` }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Ticker urgency countdown */}
      {couponCode && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full py-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-[11px] font-black tracking-widest text-center uppercase z-50 flex items-center justify-center gap-2 select-none shadow-lg shrink-0"
        >
          <Flame className="h-4 w-4 text-white animate-pulse" />
          <span>Coupon Code {couponCode} Applied! {discountPercentage}% discount lock expires in {formatCountdown(wheelCountdown)} mins!</span>
        </motion.div>
      )}

      {/* Navigation Header */}
      <header className="p-6 lg:px-12 flex justify-between items-center z-10 relative max-w-[1400px] mx-auto w-full">
        {!product.isStandaloneLandingPage ? (
          <button onClick={() => router.push(`/b/${tenantSlug}`)} className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition group border border-white/5 bg-white/2 hover:border-white/20 rounded-full px-4 py-2.5 backdrop-blur-md">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Store
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {storeData.storefront?.brandLogo ? (
              <img loading="lazy" src={storeData.storefront.brandLogo} className="h-9 w-9 rounded-full object-cover border border-white/10 shadow" />
            ) : (
              <ShoppingBag className="h-5 w-5 text-white" />
            )}
            <span className="font-bold text-white tracking-tight text-sm font-heading">{storeData.storefront?.companyName || "Store"}</span>
          </div>
        )}
        <div className="flex items-center gap-2 border border-white/10 bg-[#0a0d1a]/80 backdrop-blur-xl px-4 py-2 rounded-full text-xs select-none">
          <Eye className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="font-bold text-white font-mono">{viewerCount}</span>
          <span className="text-gray-400 font-medium">shopping right now</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-[1300px] mx-auto w-full p-4 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 z-10 relative">
        
        {/* Left Column: Media Gallery & Trust Badges */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full aspect-square rounded-[2.5rem] bg-white border border-white/10 overflow-hidden flex items-center justify-center relative shadow-2xl group cursor-crosshair"
          >
            {product.image ? (
              <img loading="lazy" src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            ) : (
              <Package className="h-32 w-32 text-gray-200" />
            )}
            
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.isDigital && (
                <span className="px-3.5 py-1.5 text-[9px] font-black tracking-widest text-white bg-blue-600/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 uppercase font-mono">
                  Instant Download
                </span>
              )}
              {product.isService && (
                <span className="px-3.5 py-1.5 text-[9px] font-black tracking-widest text-white bg-emerald-500/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 uppercase font-mono">
                  Premium Service
                </span>
              )}
            </div>
          </motion.div>

          {/* ScarcityUrgency Stock Level Progress Gauge */}
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3 shadow-lg relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-red-500 animate-bounce" /> Demand Urgency
              </span>
              <span className="text-xs font-black text-red-400 uppercase font-mono">ONLY {stockLevel} ITEMS LEFT IN WAREHOUSE</span>
            </div>
            
            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ width: "95%" }} 
                animate={{ width: "20%" }} 
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
              />
            </div>
            <p className="text-[11px] text-gray-500 leading-normal">
              High volume of sales detected. Items are reserved in user carts for 10 minutes maximum before release.
            </p>
          </div>

          {/* Premium Trust Seals */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "100% Secured", desc: "PCI Encrypted Checkout" },
              { icon: Truck, title: "Free Shipping", desc: "Express Dispatch" },
              { icon: RotateCcw, title: "Satisfaction", desc: "Easy Returns" }
            ].map((seal, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col items-center text-center gap-2 shadow backdrop-blur-sm hover:bg-white/2 hover:border-white/10 transition-all duration-300">
                <seal.icon className="h-6 w-6 text-indigo-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">{seal.title}</span>
                <span className="text-[9px] text-gray-500 leading-tight">{seal.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Copy, Swatches & Fast Checkout Page Form */}
        <div className="lg:col-span-6 flex flex-col justify-center gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Title / Badges */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold select-none">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <span>4.9 (148 reviews)</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight font-heading tracking-tight">{product.name}</h1>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-2 border-b border-white/5">
              <span className="text-4xl font-black" style={{ color: primaryHex }}>
                {currencySymbol}{currentTotal.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-gray-500 line-through font-mono">
                  {currencySymbol}{(product.compareAtPrice / 100).toFixed(2)}
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono">
                  SAVED {discountPercentage}%
                </span>
              )}
            </div>

            {/* Product description */}
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              {product.description || "Indulge in unmatched quality and craftsmanship. This exclusive piece is designed to enhance your surroundings with traditional beauty and Vastu compliance."}
            </p>

            {/* Color Swatch Selectors */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Select Finish: <strong className="text-white font-mono">{selectedColor}</strong></span>
              <div className="flex gap-3">
                {[
                  { name: "Vastu Gold", hex: "#D4AF37" },
                  { name: "Obsidian Black", hex: "#1e1e1e" },
                  { name: "Premium Silver", hex: "#C0C0C0" }
                ].map(c => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-9 px-4 rounded-full border text-xs font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                        isSelected 
                          ? "bg-white text-black border-white shadow-lg scale-95" 
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edition Swatches */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Choose Pack Edition: <strong className="text-white font-mono">{selectedEdition}</strong></span>
              <div className="flex gap-3">
                {["Pooja Special", "Double Weight Plus", "Pure Copper Blend"].map(ed => {
                  const isSelected = selectedEdition === ed;
                  return (
                    <button
                      key={ed}
                      type="button"
                      onClick={() => setSelectedEdition(ed)}
                      className={`h-9 px-4 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-95" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {ed}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ORDER BUMP SECTION */}
            {bumpProduct && (
              <div className="p-1 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shadow-xl shadow-orange-500/5 relative overflow-hidden group">
                <div className="bg-[#0c101a] rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow shadow-red-600/30">Limited Deal</div>
                  
                  <label className="flex gap-4 cursor-pointer pt-2 select-none">
                    <div className="pt-1">
                      <div className={`h-6.5 w-6.5 rounded-lg border-2 flex items-center justify-center transition-all ${isBumpSelected ? "border-emerald-500 bg-emerald-500" : "border-white/20 group-hover:border-white/40"}`}>
                        {isBumpSelected && <Check className="h-4.5 w-4.5 stroke-[3px] text-white" />}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 pr-8">
                      <span className="font-extrabold text-white text-md">Yes, add {bumpProduct.name} to my order!</span>
                      <span className="text-xs text-gray-400 leading-normal">
                        Normally {currencySymbol}{(bumpProduct.price/100).toFixed(2)}, but add it now for just <span className="font-black text-emerald-400">{currencySymbol}{bumpPrice.toFixed(2)}</span>.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Embedded Secure Fast Checkout Form */}
            {checkoutStep === "view" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-6 rounded-3xl bg-white/2 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2 mb-1">
                  <CreditCard className="h-4.5 w-4.5 text-indigo-400" /> Secure Fast Checkout
                </h3>

                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Imran Hossain" 
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="imran@example.com" 
                        value={buyerEmail}
                        onChange={e => setBuyerEmail(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+91 XXXXX XXXXX" 
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Shipping Destination</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Flat, Road, City, Zipcode" 
                        value={shippingAddress}
                        onChange={e => setShippingAddress(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                      />
                    </div>
                  </div>

                  {/* Payment selection cards */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Select Payment Gateway</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "upi", icon: Smartphone, label: "UPI / QR Code" },
                        { id: "card", icon: CreditCard, label: "Credit Card" },
                        { id: "cod", icon: Building, label: "COD (Cash)" }
                      ].map(method => {
                        const isSelected = paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/5"
                                : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10 hover:bg-black/40"
                            }`}
                          >
                            <method.icon className="h-4.5 w-4.5" />
                            <span className="text-[10px] font-bold font-mono tracking-tight leading-none">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complete Purchase Button */}
                  <button 
                    type="submit" 
                    className="w-full py-4.5 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl hover:shadow-indigo-600/30 border border-white/10 mt-3 cursor-pointer" 
                    style={{ backgroundColor: primaryHex }}
                  >
                    <span>Authorize & Buy Now — {currencySymbol}{currentTotal.toFixed(2)}</span>
                  </button>
                </form>

                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono select-none">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secured by 256-Bit SSL AES Encrypted Network Layer
                </div>
              </motion.div>
            )}

            {/* PCI gateway loading loader state */}
            {checkoutStep === "processing" && (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <h4 className="text-white font-black text-base">Securing PCI Bank Gateway...</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Processing payment tokens and reserving inventory stock. Please do not close this window.</p>
              </div>
            )}
          </motion.div>
        </div>

      </main>

      {/* Accordion / Customer Reviews */}
      <section className="max-w-[1300px] mx-auto w-full px-4 lg:px-12 py-12 relative z-10 select-text">
        <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 flex flex-col gap-8 shadow backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-black text-white font-heading uppercase tracking-wider flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" /> Customer Reviews ({reviews.length})
            </h3>
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl transition"
            >
              Write Review
            </button>
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddReview}
                className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-bold uppercase">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setUserRating(star)} 
                        className="text-yellow-500 hover:scale-110 transition cursor-pointer"
                      >
                        <Star className={`h-5 w-5 ${star <= userRating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    required 
                    placeholder="Your Name" 
                    value={userName} 
                    onChange={e => setUserName(e.target.value)} 
                    className="bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" 
                  />
                  <input 
                    type="text" 
                    required 
                    placeholder="Review comments..." 
                    value={userComment} 
                    onChange={e => setUserComment(e.target.value)} 
                    className="bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl self-end text-white">Post Review</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-6">
            {reviews.map((rev, idx) => (
              <div key={idx} className="flex flex-col gap-2.5 pb-6 border-b border-white/5 last:border-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                      {rev.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white text-xs">{rev.name}</span>
                      <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase font-mono">Verified Purchaser</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{rev.date}</span>
                </div>
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                  {[...Array(5 - rev.rating)].map((_, i) => <Star key={i} className="h-3 w-3" />)}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL SCREEN FUNNEL OVERLAYS */}
      <AnimatePresence>
        
        {/* 1. UPSELL MODAL */}
        {checkoutStep === "upsell" && upsellProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050711]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-xl w-full flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 font-heading tracking-tight">Wait! VIP Package Upgrade Available</h2>
              <p className="text-gray-400 text-xs mb-10 tracking-wide uppercase">ADD COMPATIBLE BUNDLE AND LOCK 50% SAVINGS IMMEDIATELY</p>
              
              <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 mb-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {upsellProduct.image ? (
                  <img loading="lazy" src={upsellProduct.image} className="h-44 w-44 object-cover rounded-3xl mb-6 shadow-2xl" />
                ) : (
                  <Package className="h-32 w-32 text-white/10 mb-6" />
                )}
                <h3 className="text-lg font-extrabold text-white">{upsellProduct.name}</h3>
                <span className="text-2xl font-black text-emerald-400 mt-2">+{currencySymbol}{(upsellProduct.price/100).toFixed(2)}</span>
              </div>

              <div className="w-full flex flex-col gap-4">
                <button onClick={handleAcceptUpsell} className="w-full py-5 rounded-2xl text-black font-black text-base bg-white hover:bg-gray-100 hover:scale-[1.01] transition-all active:scale-[0.99] cursor-pointer">
                  Yes, Upgrade My Order!
                </button>
                <button onClick={handleDeclineUpsell} className="text-xs font-bold text-gray-500 hover:text-white transition uppercase tracking-widest underline underline-offset-4 decoration-white/20">
                  No thanks, decline special bundle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. DOWNSELL MODAL */}
        {checkoutStep === "downsell" && downsellProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050711]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-xl w-full flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-bounce">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 font-heading tracking-tight">Try Lite Pack Edition</h2>
              <p className="text-gray-400 text-xs mb-10 tracking-wide">WE PREFER TO EXCLUDE EXTRA ACCORDION AND SAVE YOUR BUDGET</p>
              
              <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 mb-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {downsellProduct.image ? (
                  <img loading="lazy" src={downsellProduct.image} className="h-32 w-32 object-cover rounded-3xl mb-6 shadow-2xl" />
                ) : (
                  <Package className="h-24 w-24 text-white/10 mb-6" />
                )}
                <h3 className="text-lg font-extrabold text-white">{downsellProduct.name}</h3>
                <span className="text-2xl font-black text-emerald-400 mt-2">+{currencySymbol}{(downsellProduct.price/100).toFixed(2)}</span>
              </div>

              <div className="w-full flex flex-col gap-4">
                <button onClick={handleAcceptDownsell} className="w-full py-5 rounded-2xl text-white font-black text-base bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] transition-all active:scale-[0.99] cursor-pointer">
                  Yes, Add Lite Package instead
                </button>
                <button onClick={handleDeclineDownsell} className="text-xs font-bold text-gray-500 hover:text-white transition uppercase tracking-widest underline underline-offset-4 decoration-white/20">
                  No thanks, check out basic items
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. SUCCESS / RECEIPT CHECKOUT */}
        {checkoutStep === "success" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-[#050711] flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
            <div className="max-w-md w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6 mx-auto drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
              <h2 className="text-2xl font-black text-white mb-2 font-heading tracking-tight">Order Confirmed!</h2>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-8 font-mono">Invoice Reference: #AETH-{Math.floor(100000 + Math.random() * 900000)}</p>
              
              <div className="bg-black/40 rounded-2xl border border-white/5 p-4 text-left flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Buyer Name:</span>
                  <span className="text-white font-bold">{buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact Email:</span>
                  <span className="text-white font-bold">{buyerEmail}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5 mt-1 font-bold text-emerald-400 text-sm">
                  <span>Grand Total Paid:</span>
                  <span>{currencySymbol}{finalOrderTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-normal mt-6">
                Receipt sent to email inbox. Tracking numbers will be dispatched dynamically once packages pass dispatch gateways.
              </p>

              <button 
                onClick={() => { 
                  setCheckoutStep("view"); 
                  setIsBumpSelected(false); 
                  setBuyerName("");
                  setBuyerEmail("");
                  setBuyerPhone("");
                  setShippingAddress("");
                  setCouponCode(null);
                  setDiscountPercentage(0);
                }} 
                className="w-full py-4.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black transition uppercase tracking-widest border border-white/10 mt-8 cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* SPIN THE WHEEL SLIDE-UP DRAWER */}
      <AnimatePresence>
        {showWheel && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 bottom-0 bg-[#070913] border-t border-white/10 rounded-t-[3rem] z-[150] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] pb-safe select-none"
          >
            {/* Handle Drag bar */}
            <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setShowWheel(false)}>
              <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors" />
            </div>

            <div className="max-w-md mx-auto px-6 pb-8 pt-4 flex flex-col items-center gap-6">
              
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-amber-500 tracking-[0.25em] uppercase flex items-center justify-center gap-1.5">
                  <Gift className="h-4 w-4 text-amber-500 animate-bounce" /> Gamified Rewards
                </span>
                <h3 className="text-xl font-extrabold text-white font-heading">Spin For Instant VIP Discount!</h3>
                <p className="text-[11px] text-gray-500">Wait! Spin the wheel to unlock up to 20% off your purchase. Limited to 1 spin per customer session.</p>
              </div>

              {/* Graphical SVG Wheel */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Pointer indicator */}
                <div className="absolute top-0 z-30 flex flex-col items-center -translate-y-2">
                  <div className="w-4 h-4 bg-red-500 rotate-45 rounded-tl shadow-lg border-l border-t border-white/20" />
                </div>
                
                {/* Spinning Wheel */}
                <motion.div 
                  style={{ rotate: wheelAngle }}
                  className="w-full h-full rounded-full border-4 border-white/10 bg-[#0f1225] overflow-hidden relative shadow-2xl"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Circle sectors mapping */}
                    {wheelSectors.map((sec, idx) => {
                      const angle = 360 / wheelSectors.length;
                      const sectorRad = (angle * Math.PI) / 180;
                      const rotateStr = `rotate(${idx * angle} 50 50)`;
                      
                      // Coordinates of arc segment
                      const r = 50;
                      const x1 = 50;
                      const y1 = 50;
                      const x2 = 50 + r * Math.sin(sectorRad);
                      const y2 = 50 - r * Math.cos(sectorRad);
                      const dStr = `M ${x1} ${y1} L 50 0 A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                      const fillVal = idx % 2 === 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)";
                      
                      return (
                        <g key={idx} transform={rotateStr}>
                          <path d={dStr} fill={fillVal} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                          <text 
                            x="50" 
                            y="18" 
                            fill={idx % 2 === 0 ? "#818cf8" : "#9ca3af"} 
                            fontSize="5.5" 
                            fontWeight="black"
                            fontFamily="monospace"
                            textAnchor="middle" 
                            transform={`rotate(${angle/2} 50 50)`}
                          >
                            {sec.label}
                          </text>
                        </g>
                      );
                    })}
                    {/* Outer frame nodes */}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="50" cy="50" r="6" fill="#070913" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  </svg>
                </motion.div>
              </div>

              {/* Action trigger button */}
              <button 
                type="button"
                onClick={spinTheWheel}
                disabled={isSpinning}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-black font-black text-sm uppercase tracking-widest transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-amber-600/25"
              >
                {isSpinning ? "SPINNING INERTIA..." : "⚡ SPIN NOW"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
