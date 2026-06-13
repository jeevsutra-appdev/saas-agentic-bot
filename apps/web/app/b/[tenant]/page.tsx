"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  ShoppingBag, 
  X, 
  MessageCircle, 
  ArrowRight, 
  Home, 
  Grid, 
  CreditCard, 
  ChevronRight, 
  Download, 
  Package, 
  Sparkles,
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
  User,
  Heart,
  TrendingUp,
  FolderTree,
  ShieldCheck,
  Smartphone,
  Building,
  CheckCircle2,
  Search,
  Bike,
  Utensils,
  Mail,
  History,
  Star,
  Clock,
  Lock,
  Phone,
  MapPin,
  Navigation,
  Zap,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidgetUI from "@/components/ChatWidgetUI";
import dynamic from "next/dynamic";
const PremiumRetailStoreDynamic = dynamic(
  () => import("./s/[storeSlug]/templates/PremiumRetailStore"),
  { ssr: false, loading: () => <div className="min-h-screen bg-[#080a10] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div> }
);

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function NativeStorefront() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenant as string;

  const [activeTab, setActiveTab] = useState<"home" | "catalog" | "cart" | "checkout" | "orders">("home");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [storeData, setStoreData] = useState<{ products: any[], categories: any[], storefront: any, assignedAgent?: any }>({ products: [], categories: [], storefront: null });
  const [cart, setCart] = useState<any[]>([]);
  
  // Multi-Shop States
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [storefrontsList, setStorefrontsList] = useState<any[]>([]);
  
  // Checkout Form States
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  const [orderInvoiceRef, setOrderInvoiceRef] = useState("");

  // Gamified Wheel States
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [wheelCountdown, setWheelCountdown] = useState<number>(300); // 5 mins countdown

  // Social Proof Toast Ticker State
  const [socialToast, setSocialToast] = useState<{ name: string; city: string; item: string } | null>(null);

  // Chat States
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: `Hi there! I'm your AI Sales Agent. How can I help you find the perfect item today?` }
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- NEW BUYER PORTAL & FOOD CUSTOMIZER STATES ---
  const [buyerUser, setBuyerUser] = useState<any>(null);
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authMethod, setAuthMethod] = useState<"otp_phone" | "otp_email" | "password">("otp_phone");
  const [authPhone, setAuthPhone] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInputCode, setOtpInputCode] = useState("");
  const [simulatedCodeReceived, setSimulatedCodeReceived] = useState("");
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);

  // Active tracking state
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [trackingStep, setTrackingStep] = useState<1 | 2 | 3 | 4>(1);

  const [prepCountdownSec, setPrepCountdownSec] = useState<number | null>(null);
  const [incomingStoreMessage, setIncomingStoreMessage] = useState<string | null>(null);
  const [activeRiderInfo, setActiveRiderInfo] = useState<{ name: string; phone: string } | null>(null);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);

  // Food specific filters
  const [foodTypeFilter, setFoodTypeFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string | null>(null);
  const [simulatedAddress, setSimulatedAddress] = useState("Mumbai, Maharashtra, India");

  // Load Cart, Coupon, and Buyer from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aether-ecom-cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem("aether-coupon-code");
      const storedDiscount = localStorage.getItem("aether-discount-percentage");
      if (storedCoupon) setCouponCode(storedCoupon);
      if (storedDiscount) setDiscountPercentage(Number(storedDiscount));

      const storedBuyer = localStorage.getItem("aether-buyer-user");
      if (storedBuyer) {
        const parsed = JSON.parse(storedBuyer);
        setBuyerUser(parsed);
        // Autofill checkout details
        setCheckoutName(parsed.name || "");
        setCheckoutEmail(parsed.email || "");
        setCheckoutPhone(parsed.phone || "");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save Cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("aether-ecom-cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

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

  // Load Ecom catalog settings
  useEffect(() => {
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const shopIdFromUrl = urlParams?.get("shopId") || urlParams?.get("storeId") || null;
    
    const fetchUrl = `/api/ecom?tenant=${tenantSlug}${shopIdFromUrl ? `&shopId=${shopIdFromUrl}` : ""}`;
    fetch(fetchUrl).then(r => r.json()).then(data => {
      if (data.success) {
        setStorefrontsList(data.storefronts || []);
        if (shopIdFromUrl) {
          setSelectedShopId(shopIdFromUrl);
          setStoreData({ products: data.products, categories: data.categories, storefront: data.storefront, assignedAgent: data.assignedAgent });
        } else if (data.storefronts && data.storefronts.length === 1) {
          setSelectedShopId(data.storefronts[0].id);
          setStoreData({ products: data.products, categories: data.categories, storefront: data.storefront, assignedAgent: data.assignedAgent });
        } else if (data.storefronts && data.storefronts.length > 0) {
          // Multiple stores, render select shop portal screen
        } else {
          setStoreData({ products: data.products, categories: data.categories, storefront: data.storefront, assignedAgent: data.assignedAgent });
        }
      }
    });
  }, [tenantSlug]);

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}?shopId=${shopId}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
    
    fetch(`/api/ecom?tenant=${tenantSlug}&shopId=${shopId}`).then(r => r.json()).then(data => {
      if (data.success) {
        setStoreData({ products: data.products, categories: data.categories, storefront: data.storefront, assignedAgent: data.assignedAgent });
      }
    });
  };

  // Fetch buyer orders if logged in
  useEffect(() => {
    if (buyerUser) {
      fetch(`/api/ecom/buyers?tenantSlug=${tenantSlug}&email=${buyerUser.email}&phone=${buyerUser.phone || ""}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setBuyerOrders(data.orders || []);
          }
        });
    }
  }, [buyerUser, tenantSlug]);

  // Premium buyer notification chime — ascending 3-note melody
  const playNotificationAlert = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [[880, 0], [1108, 0.13], [1318, 0.26]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq as number;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      });
    } catch (e) {}
  };

  const formatPrepTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (prepCountdownSec === null || prepCountdownSec <= 0) return;
    const interval = setInterval(() => {
      setPrepCountdownSec(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [prepCountdownSec]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel("aether-live-order-processing");

    channel.onmessage = (event) => {
      const { type, data } = event.data;

      if (data?.orderId === activeTrackingOrderId) {
        // Play notification alert chime
        playNotificationAlert();

        if (type === "ORDER_ACCEPTED") {
          setShowAcceptedModal(true);
          setPrepCountdownSec((data.prepTimeMinutes || 20) * 60);
          setTrackingStep(2);
          if (data.deliveryBoyName) {
            setActiveRiderInfo({ name: data.deliveryBoyName, phone: data.deliveryBoyPhone || "", vehicle: data.deliveryBoyVehicle || "bike" } as any);
          }
        }
        
        else if (type === "DELIVERY_PICKED_UP") {
          setActiveRiderInfo({ name: data.deliveryBoyName, phone: data.deliveryBoyPhone });
          setTrackingStep(3);
          setPrepCountdownSec(null);
        } 
        
        else if (type === "DELIVERY_COMPLETED") {
          setTrackingStep(4);
          setActiveRiderInfo(null);
        } 
        
        else if (type === "ORDER_IN_PROCESSING") {
          setIncomingStoreMessage("Your order is now being prepared! Our kitchen is working on it. 🍳");
        }

        else if (type === "ORDER_CANCELLED") {
          setIncomingStoreMessage("We're sorry — your order has been cancelled by the shop. Please contact us for support.");
          setActiveTrackingOrderId(null);
          setActiveRiderInfo(null);
        }

        else if (type === "BUYER_MESSAGE") {
          setIncomingStoreMessage(data.message);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [activeTrackingOrderId]);

  // Live order status simulation loop
  useEffect(() => {
    if (!activeTrackingOrderId) return;
    
    setTrackingStep(1);
    
    const t2 = setTimeout(() => {
      setTrackingStep(2);
    }, 6000); // 6s -> Kitchen preparing

    const t3 = setTimeout(() => {
      setTrackingStep(3);
    }, 14000); // 14s -> Driver cruising

    const t4 = setTimeout(() => {
      setTrackingStep(4);
      // Automatically update order status in backend to fulfilled
      fetch("/api/ecom/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderId: activeTrackingOrderId, status: "fulfilled" })
      });
      // Refresh buyer orders
      if (buyerUser) {
        fetch(`/api/ecom/buyers?tenantSlug=${tenantSlug}&email=${buyerUser.email}&phone=${buyerUser.phone || ""}`)
          .then(r => r.json())
          .then(data => {
            if (data.success) setBuyerOrders(data.orders || []);
          });
      }
    }, 24000); // 24s -> Delivered

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeTrackingOrderId]);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Coupon countdown timer
  useEffect(() => {
    if (!couponCode || wheelCountdown <= 0) return;
    const t = setInterval(() => {
      setWheelCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [couponCode, wheelCountdown]);

  // Social Proof notification cycle
  useEffect(() => {
    const names = ["Rahul", "Priya", "Amit", "Anjali", "Suresh", "Sneha", "Karan"];
    const cities = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Pune", "Hyderabad", "Chennai"];
    
    const cycleToast = () => {
      if (storeData.products.length === 0) return;
      const randomProduct = storeData.products[Math.floor(Math.random() * storeData.products.length)];
      setSocialToast({
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        item: randomProduct.name
      });
      
      // Clear toast after 4 seconds
      setTimeout(() => setSocialToast(null), 4000);
    };

    const interval = setInterval(cycleToast, 16000);
    const firstTimeout = setTimeout(cycleToast, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, [storeData.products]);

  // Exit intent & inactivity for Spin the wheel
  useEffect(() => {
    if (storeData.products.length === 0 || couponCode) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) setShowWheel(true);
    };

    const inactivity = setTimeout(() => setShowWheel(true), 25000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(inactivity);
    };
  }, [storeData.products, couponCode]);

  // Synthesize Ticking & Winning sounds
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

  const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const colors = ["#FF385C", "#00D26A", "#FFB800", "#6366f1", "#ec4899"];

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

  // --- DYNAMIC THEME SELECTION ---
  const isFood = storeData.storefront?.template === "food" || storeData.storefront?.template === "restaurant-v2-dark" || storeData.storefront?.template === "restaurant-v2-light";
  const isRetail = storeData.storefront?.template === "retail" || storeData.storefront?.template === "ecom";
  const isPremiumFood = storeData.storefront?.template === "food-v3";
  const isPremiumRetail = storeData.storefront?.template === "retail_premium";
  const isLightMode = storeData.storefront?.template === "restaurant-v2-light";
  
  const getThemeColors = () => {
    const preset = storeData.storefront?.themePreset || (isFood ? "crimson" : "nimbus");
    switch (preset) {
      case "crimson":
        return { hex: "#E23744", gradient: "from-[#E23744] to-[#C82333]", glow: "rgba(226, 55, 68, 0.25)" };
      case "citrus":
        return { hex: "#FC8019", gradient: "from-[#FC8019] to-[#E56F0E]", glow: "rgba(252, 128, 25, 0.25)" };
      case "emerald":
        return { hex: "#06C167", gradient: "from-[#06C167] to-[#05A357]", glow: "rgba(6, 193, 103, 0.25)" };
      case "flamingo":
        return { hex: "#D00078", gradient: "from-[#D00078] to-[#B30067]", glow: "rgba(208, 0, 120, 0.25)" };
      case "starbucks":
        return { hex: "#00704A", gradient: "from-[#00704A] to-[#005C3D]", glow: "rgba(0, 112, 74, 0.25)" };
      case "caviar":
        return { hex: "#E5A93C", gradient: "from-[#E5A93C] to-[#C9912E]", glow: "rgba(229, 169, 60, 0.25)" };
      case "deliveroo":
        return { hex: "#00CDBC", gradient: "from-[#00CDBC] to-[#00B4A5]", glow: "rgba(0, 205, 188, 0.25)" };
      case "chipotle":
        return { hex: "#A81F26", gradient: "from-[#A81F26] to-[#91181E]", glow: "rgba(168, 31, 38, 0.25)" };
      case "gopuff":
        return { hex: "#5C00FF", gradient: "from-[#5C00FF] to-[#4B00D1]", glow: "rgba(92, 0, 255, 0.25)" };
      case "dominos":
        return { hex: "#006494", gradient: "from-[#006494] to-[#004b70]", glow: "rgba(0, 100, 148, 0.25)" };
      case "lime":
        return { hex: "#00D26A", gradient: "from-[#00D26A] to-[#00B359]", glow: "rgba(0, 210, 106, 0.25)" };
      case "gold":
        return { hex: "#FFB800", gradient: "from-[#FFB800] to-[#E6A100]", glow: "rgba(255, 184, 0, 0.25)" };
      case "indigo":
        return { hex: "#6366F1", gradient: "from-[#6366F1] to-[#4F46E5]", glow: "rgba(99, 102, 241, 0.25)" };
      case "neon":
        return { hex: "#A855F7", gradient: "from-[#A855F7] to-[#9333EA]", glow: "rgba(168, 85, 247, 0.25)" };
      case "nimbus":
      default:
        return { hex: storeData.storefront?.primaryColor || "#6366f1", gradient: "from-indigo-600 to-indigo-500", glow: "rgba(99, 102, 241, 0.2)" };
    }
  };

  const themeColors = getThemeColors();
  const primaryHex = themeColors.hex;
  const bgStyle = { backgroundColor: isLightMode ? "#f3f4f6" : ((isFood || isPremiumFood) ? "#05070e" : "#04060c") };

  // --- CART OPERATIONS ---
  const addToCart = (product: any) => {
    setCart([...cart, product]);
    triggerConfetti();
    fetch("/api/ecom/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, eventType: "add_to_cart", productId: product.id })
    });
  };

  const decreaseQuantity = (productId: string) => {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx !== -1) {
      setCart(cart.filter((_, i) => i !== idx));
    }
  };

  const getProductQty = (productId: string) => {
    return cart.filter(item => item.id === productId).length;
  };

  // --- CHAT FORM SUBMIT ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: storeData.assignedAgent?.provider || "openrouter",
          model: storeData.assignedAgent?.mainModel || storeData.assignedAgent?.model || "openrouter/free",
          messages: updated,
          tenantSlug,
          agentId: storeData.assignedAgent?.id || storeData.storefront?.assignedAgentId,
          useOwnModels: storeData.assignedAgent?.useOwnModels,
          simulateNonAI: storeData.assignedAgent?.simulateNonAI
        })
      });

      if (!response.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: "Connection failed." }]);
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      if (reader) {
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            accumulatedText += chunk;
            
            setMessages(prev => {
              const next = [...prev];
              if (next.length > 0) {
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  content: accumulatedText
                };
              }
              return next;
            });
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection failed." }]);
    } finally {
      setIsSending(false);
    }
  };

  // --- CHECKOUT SUBMISSION ---
  const handleSimulatedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setCheckoutStep("processing");
    const totalCents = Math.round(finalTotal * 100);

    setTimeout(async () => {
      try {
        const orderRes = await fetch("/api/ecom/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            storeId: selectedShopId || undefined,
            productId: cart[0].id, // Simulates main checkout product linkage
            buyerName: checkoutName || buyerUser?.name || "Guest Buyer",
            buyerEmail: checkoutEmail || buyerUser?.email || "guest@temp.com",
            buyerPhone: checkoutPhone || buyerUser?.phone || "",
            amountCents: totalCents,
            status: "paid",
            shippingAddress: checkoutAddress || simulatedAddress || "Doorstep Delivery",
            paymentMethod: paymentMethod,
            itemsJson: JSON.stringify(cart) // Full cart items
          })
        });
        const data = await orderRes.json();
        if (orderRes.ok && data.success) {
          triggerConfetti();
          const invoiceRef = `#AETH-${Math.floor(100000 + Math.random() * 900000)}`;
          setOrderInvoiceRef(invoiceRef);
          setCheckoutStep("success");
          
          // Broadcast the new order to the admin dashboard instantly!
          try {
            const channel = new BroadcastChannel("aether-live-order-processing");
            channel.postMessage({ type: "NEW_ORDER", data: data.order });
            channel.close();
          } catch (e) {
            console.error("Broadcast failed:", e);
          }

          if (isFood) {
            // Instantly start live delivery tracking
            setActiveTrackingOrderId(data.order.id);
            setActiveTab("orders");
            setCart([]);
          }
        } else {
          setCheckoutStep("form");
          alert("Order compilation failed.");
        }
      } catch (e) {
        setCheckoutStep("form");
        alert("Checkout failed to connect.");
      }
    }, 1800);
  };

  // --- BUYER PORTAL AUTH HANDLERS ---
  const handleRequestOtp = async () => {
    if (!authPhone && !authEmail) return;
    try {
      const res = await fetch("/api/ecom/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_otp",
          tenantSlug,
          phone: authPhone,
          email: authEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSimulatedCodeReceived(data.simulatedCode);
      }
    } catch (e) {
      alert("Failed to send verification code.");
    }
  };

  const handleBuyerAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isLogin = authMode === "login";
      const payload: any = {
        action: isLogin ? "login" : "register",
        tenantSlug,
        email: authEmail || undefined,
        phone: authPhone || undefined,
        name: authName || undefined,
        password: authPassword || undefined
      };

      if (authMethod !== "password" && otpSent) {
        payload.inputOtp = otpInputCode;
      }

      const res = await fetch("/api/ecom/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBuyerUser(data.user);
        localStorage.setItem("aether-buyer-user", JSON.stringify(data.user));
        
        // Autofill details
        setCheckoutName(data.user.name || "");
        setCheckoutEmail(data.user.email || "");
        setCheckoutPhone(data.user.phone || "");

        setShowAuthDrawer(false);
        setOtpSent(false);
        setOtpInputCode("");
        setSimulatedCodeReceived("");

        // Refresh orders
        const ordersRes = await fetch(`/api/ecom/buyers?tenantSlug=${tenantSlug}&email=${data.user.email}&phone=${data.user.phone || ""}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setBuyerOrders(ordersData.orders || []);
        }
      } else {
        alert(data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Verification error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aether-buyer-user");
    setBuyerUser(null);
    setBuyerOrders([]);
    setActiveTrackingOrderId(null);
    setCheckoutName("");
    setCheckoutEmail("");
    setCheckoutPhone("");
  };

  // Currency utility
  const getCurrencySymbol = (code: string) => {
    if (!code) return "$";
    if (code === "EUR") return "€";
    if (code === "GBP") return "£";
    if (code === "INR") return "₹";
    if (code === "BDT") return "৳";
    return "$";
  };
  const currencySymbol = getCurrencySymbol(storeData.storefront?.globalCurrency);

  // Subtotal calculations
  const subtotal = cart.reduce((acc, val) => acc + val.price, 0) / 100;
  const isDigitalCart = cart.length > 0 && cart.every(i => i.isDigital);
  const discountAmount = subtotal * (discountPercentage / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const shippingRate = storeData.storefront?.shippingRate || 0;
  const freeThreshold = storeData.storefront?.freeShippingThreshold || (isFood ? 15 : 100);

  let appliedShipping = isDigitalCart ? 0 : shippingRate / 100;
  if (freeThreshold > 0 && discountedSubtotal >= freeThreshold) appliedShipping = 0;
  const finalTotal = discountedSubtotal + appliedShipping;

  // Cart progress bar metrics
  const progressPercent = Math.min(100, (discountedSubtotal / freeThreshold) * 100);
  const remainingToFree = Math.max(0, freeThreshold - discountedSubtotal);

  // Spin the wheel data
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
    const winningIndex = [0, 2, 4][Math.floor(Math.random() * 3)];
    const sectorAngle = 360 / wheelSectors.length;
    const extraSpins = 5 * 360;
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

      const progress = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentAngle = targetAngle * easeOut;
      setWheelAngle(currentAngle);

      if (Math.floor(currentAngle / sectorAngle) > Math.floor((targetAngle * progress) / sectorAngle)) {
        playTickSound();
      }
      requestAnimationFrame(animateWheel);
    };

    requestAnimationFrame(animateWheel);
  };

  // --- RENDER FOOD PORTIONS ---
  const renderFoodHome = () => {
    const categories = storeData.categories && storeData.categories.length > 0
      ? storeData.categories.map(c => ({ name: c.name, tag: c.id, image: c.image }))
      : [
          { name: "Pizzas", tag: "pizza", image: null },
          { name: "Burgers", tag: "burger", image: null },
          { name: "Biryanis", tag: "biryani", image: null },
          { name: "Desserts", tag: "desserts", image: null },
          { name: "Chinese", tag: "chinese", image: null },
          { name: "Healthy", tag: "healthy", image: null }
        ];

    const foodOffers = storeData.storefront?.kitchenOffers?.length
      ? storeData.storefront.kitchenOffers
      : [
          { title: "FLAT 50% OFF", desc: "Up to $10 off. Code: WELCOME50", badge: "LIMITED TIME" },
          { title: "FREE DELIVERY", desc: "Free priority delivery on orders over $15", badge: "SUPER SAVER" }
        ];

    const foodCombos = storeData.storefront?.foodCombos || [];

    const popularDishes = storeData.products.filter(p => p.tags?.includes("bestseller")).length > 0
      ? storeData.products.filter(p => p.tags?.includes("bestseller")).slice(0, 3)
      : storeData.products.slice(0, 3);

    return (
      <div className="flex flex-col gap-7 animate-fadeIn">
        {/* Swiggy Style Address Picker */}
        <div className="flex justify-between items-center bg-[#0a0d16]/50 border border-white/5 p-4 rounded-[2rem] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF385C]/10 rounded-full text-[#FF385C]">
              <Bike className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">DELIVERING TO</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <input 
                type="text" 
                value={simulatedAddress} 
                onChange={e=>setSimulatedAddress(e.target.value)} 
                className="bg-transparent border-none p-0 text-sm font-extrabold text-white outline-none focus:ring-0 max-w-[200px]"
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase block font-mono">ESTIMATED TIME</span>
            <span className="text-xs font-black text-white flex items-center justify-end gap-1"><Clock className="h-3.5 w-3.5" /> 25 mins</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Popular Food Categories</h3>
          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none px-2 select-none">
            {categories.map((c, i) => (
              <button 
                key={i} 
                onClick={() => {
                  // Direct filter
                  setSelectedFoodCategory(c.tag);
                  setActiveTab("catalog");
                }}
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
              >
                <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 group-hover:border-[#FF385C] transition flex items-center justify-center p-0.5 shadow-lg group-hover:scale-105 overflow-hidden">
                  {c.image ? (
                    <img src={c.image} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-white/60 group-hover:text-white group-hover:rotate-12 transition" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-extrabold uppercase text-gray-400 group-hover:text-white transition leading-none font-mono tracking-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Offers Carousel */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Active Kitchen Offers</h3>
          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none px-2 select-none">
            {foodOffers.map((o, idx) => (
              <div 
                key={idx} 
                className="p-5 min-w-[280px] rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 flex flex-col gap-2 relative overflow-hidden shrink-0 shadow-xl group"
              >
                {o.image && (
                  <>
                    <img src={o.image} alt={o.title} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
                  </>
                )}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-xl" style={{ backgroundColor: `${primaryHex}1A` }} />
                <span className="px-2 py-0.5 border text-[8px] font-black uppercase tracking-wider self-start relative z-10 rounded-lg shadow-sm" style={{ backgroundColor: `${primaryHex}33`, borderColor: `${primaryHex}66`, color: primaryHex }}>{o.badge}</span>
                <h4 className="text-md font-black text-white leading-tight mt-1 relative z-10">{o.title}</h4>
                <p className="text-[11px] text-gray-300 relative z-10 max-w-[90%] leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Combo Packs */}
        {foodCombos.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" style={{ color: primaryHex }}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Signature Combo Packs
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none px-2 select-none snap-x snap-mandatory">
              {foodCombos.map((combo: any, idx: number) => (
                <div key={idx} className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-[32px] bg-black border border-white/10 overflow-hidden relative shadow-2xl flex flex-col group">
                  <div className="h-36 relative overflow-hidden bg-white/5">
                    {combo.image ? (
                      <img src={combo.image} alt={combo.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Utensils className="h-10 w-10 text-white/10" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute top-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">Value Pack</span>
                  </div>
                  <div className="p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-lg font-black text-white leading-tight">{combo.title}</h4>
                      <span className="text-lg font-black" style={{ color: primaryHex }}>{currencySymbol}{combo.price?.toFixed(2)}</span>
                    </div>
                    {combo.desc && <p className="text-[11px] text-gray-400 leading-snug">{combo.desc}</p>}
                    
                    <div className="mt-2 flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Includes:</span>
                      {combo.items?.map((item: any, i: number) => {
                        const prod = storeData.products.find(p => p.id === item.productId);
                        if (!prod) return null;
                        return (
                          <div key={i} className="flex justify-between text-[11px] text-gray-300">
                            <span>{item.quantity}x {prod.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => {
                        const comboProduct = {
                          id: `combo_${combo.id}`,
                          name: combo.title,
                          description: combo.desc,
                          price: combo.price * 100, // standard product price expects cents
                          image: combo.image,
                          isDigital: false,
                          isCombo: true,
                          items: combo.items
                        };
                        playTickSound();
                        addToCart(comboProduct);
                      }}
                      className="mt-4 w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] text-white text-center flex justify-center items-center gap-2"
                      style={{ backgroundColor: primaryHex }}
                    >
                      <Plus className="h-4 w-4" /> Add Combo To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Spotlight section */}
        {popularDishes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isFood ? "Trending Culinary Delights" : "Trending Products"}</h3>
              <button onClick={() => { setSelectedFoodCategory(null); setActiveTab("catalog"); }} className="text-[10px] font-bold text-[#FF385C] hover:underline uppercase tracking-wider font-mono">See Full Menu</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {popularDishes.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                  key={i} 
                  className="rounded-3xl bg-white/5 border border-white/10 flex flex-col shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                >
                  <div className="relative aspect-square w-full bg-white/5 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Utensils className="h-8 w-8 text-white/20" /></div>
                    )}
                    
                    {/* Gradient overlay for premium feel */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isLightMode ? 'from-black/40 via-transparent' : 'from-black/80 via-black/20'} to-transparent opacity-60`} />
                    
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.tags?.includes("bestseller") ? (
                         <span className={`text-[7px] backdrop-blur-md px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 uppercase tracking-wider ${isLightMode ? 'bg-white/90 text-black' : 'bg-black/60 text-white border border-white/10'}`}>
                            <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" /> BEST SELLER
                         </span>
                      ) : (
                         <span className={`text-[7px] backdrop-blur-md px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 uppercase tracking-wider ${isLightMode ? 'bg-white/90 text-black' : 'bg-indigo-500/80 text-white border border-white/10'}`}>
                            PREMIUM
                         </span>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2 hidden">
                      {/* Optional veg/non-veg indicator here if wanted on top right */}
                    </div>
                    
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                       <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white border border-white/10">
                         <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" /> {Math.random() > 0.5 ? "4.9" : "4.8"}
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-3 flex-grow flex flex-col justify-between z-10 bg-inherit">
                    <div>
                      <h4 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-[#FF385C] transition-colors">{p.name}</h4>
                      <p className="text-[9px] text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-black font-mono text-white tracking-tight">{currencySymbol}{(p.price/100).toFixed(2)}</span>
                      
                      {/* Real-time quantity toggler */}
                      <div className="shrink-0">
                        {getProductQty(p.id) === 0 ? (
                          <button 
                            onClick={() => { playTickSound(); addToCart(p); }} 
                            className="h-7 w-7 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-1.5 h-7 border border-white/10">
                            <button onClick={() => { playTickSound(); decreaseQuantity(p.id); }} className="text-white hover:scale-110 active:scale-90 transition p-1"><Minus className="h-2.5 w-2.5" /></button>
                            <span className="text-[10px] font-black font-mono w-2 text-center">{getProductQty(p.id)}</span>
                            <button onClick={() => { playTickSound(); addToCart(p); }} className="text-white hover:scale-110 active:scale-90 transition p-1"><Plus className="h-2.5 w-2.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFoodCatalog = () => {
    let filteredList = storeData.products;

    // Filter by category
    if (selectedFoodCategory) {
      filteredList = filteredList.filter(p => p.categoryId === selectedFoodCategory || p.tags?.includes(selectedFoodCategory));
    }

    // Filter by search query
    if (foodSearchQuery.trim()) {
      filteredList = filteredList.filter(p => p.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(foodSearchQuery.toLowerCase()));
    }

    // Filter by veg/non-veg
    if (foodTypeFilter === "veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("veg"));
    } else if (foodTypeFilter === "non-veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("non-veg"));
    }

    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        {/* Glass search filter and search input */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search for delicious dishes, pizzas, biryanis..." 
              value={foodSearchQuery}
              onChange={e=>setFoodSearchQuery(e.target.value)}
              className={`w-full ${isLightMode ? 'bg-white border-gray-200 text-black shadow-sm placeholder-gray-400' : 'bg-[#0a0d16]/60 border-white/10 text-white shadow-inner placeholder-gray-500'} border rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#FF385C] transition-shadow text-xs`}
            />
          </div>

          {/* Veg / Non-Veg Pills Filters */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setFoodTypeFilter("all")} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition border cursor-pointer ${
                foodTypeFilter === "all" ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              All Menu
            </button>
            <button 
              onClick={() => setFoodTypeFilter("veg")} 
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center gap-1.5 cursor-pointer ${
                foodTypeFilter === "veg" ? "bg-green-500/10 border-green-500 text-green-400" : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <div className="h-3 w-3 border border-green-500 flex items-center justify-center shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
              Pure Veg
            </button>
            <button 
              onClick={() => setFoodTypeFilter("non-veg")} 
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition border flex items-center gap-1.5 cursor-pointer ${
                foodTypeFilter === "non-veg" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <div className="h-3 w-3 border border-red-500 flex items-center justify-center shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              </div>
              Non-Veg
            </button>
          </div>
        </div>

        {/* List Catalog */}
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Menu List ({filteredList.length} items)</h2>
        
        {filteredList.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-white/[0.01] border border-white/5 rounded-[2rem]">
            <Utensils className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="font-bold">No food items match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredList.map((prod, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 10) * 0.05, duration: 0.4, ease: "easeOut" }}
                key={prod.id} 
                className="rounded-3xl bg-white/5 border border-white/10 flex flex-col shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300"
              >
                <div className="relative aspect-square w-full bg-white/5 cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                  {prod.image ? (
                    <img src={prod.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="h-8 w-8 text-white/20" /></div>
                  )}
                  
                  {/* Gradient overlay for premium feel */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${isLightMode ? 'from-black/40 via-transparent' : 'from-black/80 via-black/20'} to-transparent opacity-60`} />
                  
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {prod.tags?.includes("bestseller") ? (
                       <span className={`text-[7px] backdrop-blur-md px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 uppercase tracking-wider ${isLightMode ? 'bg-white/90 text-black' : 'bg-black/60 text-white border border-white/10'}`}>
                          <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" /> BEST SELLER
                       </span>
                    ) : (
                       <span className={`text-[7px] backdrop-blur-md px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 uppercase tracking-wider ${isLightMode ? 'bg-white/90 text-black' : 'bg-indigo-500/80 text-white border border-white/10'}`}>
                          POPULAR
                       </span>
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                     <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white border border-white/10">
                       <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" /> 4.9
                     </div>
                  </div>
                </div>
                
                <div className="p-3 flex-grow flex flex-col justify-between z-10 bg-inherit">
                  <div>
                    <h4 className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-[#FF385C] transition-colors">{prod.name}</h4>
                    <p className="text-[9px] text-gray-400 line-clamp-1 mt-0.5">{prod.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-black font-mono text-white tracking-tight">{currencySymbol}{(prod.price/100).toFixed(2)}</span>
                    
                    {/* Real-time quantity toggler */}
                    <div className="shrink-0">
                      {getProductQty(prod.id) === 0 ? (
                        <button 
                          onClick={() => { playTickSound(); addToCart(prod); }} 
                          className="h-7 w-7 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-1.5 h-7 border border-white/10">
                          <button onClick={() => { playTickSound(); decreaseQuantity(prod.id); }} className="text-white hover:scale-110 active:scale-90 transition p-1"><Minus className="h-2.5 w-2.5" /></button>
                          <span className="text-[10px] font-black font-mono w-2 text-center">{getProductQty(prod.id)}</span>
                          <button onClick={() => { playTickSound(); addToCart(prod); }} className="text-white hover:scale-110 active:scale-90 transition p-1"><Plus className="h-2.5 w-2.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFoodCart = () => {
    // Unique item calculation for quantity multipliers
    const uniqueItems = cart.filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);

    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Your Food Basket</h2>
        
        {cart.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-white/[0.01] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 mt-10">
            <ShoppingBag className="h-12 w-12 text-gray-700" />
            <p className="font-bold">{isFood ? "Your food cart is completely empty" : "Your cart is completely empty"}</p>
            <button onClick={() => setActiveTab("catalog")} className="py-2.5 px-6 rounded-xl bg-white text-black font-extrabold text-xs">Browse Menu</button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {uniqueItems.map((item) => {
              const qty = getProductQty(item.id);
              return (
                <div key={item.id} className="p-4 rounded-3xl bg-[#0b0e17]/80 border border-white/5 flex gap-4 items-center shadow-xl">
                  {item.image ? (
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Utensils className="h-6 w-6 text-white/30" /></div>
                  )}
                  <div className="flex-grow min-w-0 flex flex-col">
                    <span className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      {item.name} 
                      {item.isCombo && <span className="text-[8px] px-1 py-0.5 rounded uppercase tracking-wider" style={{ backgroundColor: `${primaryHex}33`, color: primaryHex }}>Combo</span>}
                    </span>
                    <span className="text-xs font-black mt-1" style={{ color: primaryHex }}>{currencySymbol}{(item.price/100).toFixed(2)}</span>
                    {item.isCombo && item.description && <span className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{item.description}</span>}
                  </div>
                  
                  {/* Quantity modifier controls inside cart */}
                  <div className="flex items-center gap-2.5 bg-white/10 rounded-xl p-1.5 border border-white/10 shrink-0">
                    <button onClick={() => { playTickSound(); decreaseQuantity(item.id); }} className="text-white hover:scale-110 transition"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="text-xs font-mono font-bold w-4 text-center">{qty}</span>
                    <button onClick={() => { playTickSound(); addToCart(item); }} className="text-white hover:scale-110 transition"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            })}

            {/* Ship goal threshold alert */}
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 shadow relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-300 flex items-center gap-1.5">
                  <Gift className="h-4 w-4 animate-bounce" style={{ color: primaryHex }} /> Free Delivery Goal
                </span>
                {remainingToFree > 0 ? (
                  <span className="font-black text-gray-400 font-mono">ADD {currencySymbol}{remainingToFree.toFixed(2)} MORE</span>
                ) : (
                  <span className="font-black text-green-400 uppercase font-mono">Free Delivery Unlocked! 🛵</span>
                )}
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r transition-all duration-500" style={{ width: `${progressPercent}%`, backgroundColor: primaryHex }} />
              </div>
            </div>

            {/* Total cards */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 shadow-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Subtotal</span>
                <span className="font-bold font-mono">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between items-center text-xs text-green-400">
                  <span>Coupon {couponCode} ({discountPercentage}%)</span>
                  <span className="font-bold font-mono">-{currencySymbol}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Delivery Charges</span>
                <span className="font-bold font-mono">{appliedShipping === 0 ? "FREE" : `${currencySymbol}${appliedShipping.toFixed(2)}`}</span>
              </div>
              <hr className="border-white/10" />
              <div className="flex justify-between items-center text-base font-black">
                <span className="text-white font-heading uppercase tracking-wider text-xs">To Pay</span>
                <span className="font-mono text-lg" style={{ color: primaryHex }}>{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => {
                  if (!buyerUser) {
                    setShowAuthDrawer(true);
                  } else {
                    setActiveTab("checkout");
                  }
                }} 
                className="mt-2 w-full text-white font-black py-4.5 rounded-2xl text-xs transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl cursor-pointer" 
                style={{ backgroundColor: primaryHex }}
              >
                <CreditCard className="h-4 w-4" /> Place Order Securely
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFoodCheckout = () => {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div className="flex items-center gap-4 px-2">
          <button onClick={() => setActiveTab("cart")} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5"><ChevronRight className="h-4.5 w-4.5 rotate-180" /></button>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Doorstep Delivery Details</h2>
        </div>

        {checkoutStep === "form" && (
          <form onSubmit={handleSimulatedCheckout} className="flex flex-col gap-6">
            <div className="p-6 rounded-[2rem] bg-[#0b0e17]/80 border border-white/5 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">Customer Info</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Full Name</label>
                <input type="text" required value={checkoutName} onChange={e=>setCheckoutName(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF385C]" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Email Address</label>
                <input type="email" required value={checkoutEmail} onChange={e=>setCheckoutEmail(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF385C]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Contact Phone</label>
                <input type="tel" required value={checkoutPhone} onChange={e=>setCheckoutPhone(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF385C]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-gray-500 px-1">Delivery Address</label>
                <textarea required value={checkoutAddress} onChange={e=>setCheckoutAddress(e.target.value)} rows={2} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF385C] resize-none" placeholder="Flat No, Building Name, Landmark..."></textarea>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-[#0b0e17]/80 border border-white/5 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">Select Payment</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "upi", icon: Smartphone, label: "UPI / Phone" },
                  { id: "card", icon: CreditCard, label: "Credit Card" },
                  { id: "cod", icon: Building, label: "Cash (COD)" }
                ].map(method => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "bg-[#FF385C]/10 border-[#FF385C] text-[#FF385C] shadow-md shadow-[#FF385C]/5"
                          : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10"
                      }`}
                      style={isSelected ? { borderColor: primaryHex, color: primaryHex } : {}}
                    >
                      <method.icon className="h-4.5 w-4.5" />
                      <span className="text-[9px] font-bold font-mono tracking-tight leading-none">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery:</span>
                <span>{appliedShipping === 0 ? "FREE" : `${currencySymbol}${appliedShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm mt-2 pt-2 border-t border-white/10">
                <span>Grand Total:</span>
                <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="w-full text-white font-black py-4.5 rounded-2xl text-xs transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl cursor-pointer" style={{ backgroundColor: primaryHex }}>
              Confirm & Pay {currencySymbol}{finalTotal.toFixed(2)}
            </button>
          </form>
        )}

        {checkoutStep === "processing" && (
          <div className="p-16 rounded-[2.5rem] bg-[#0b0e17] border border-white/10 text-center flex flex-col items-center justify-center gap-6 shadow-2xl mt-10">
            <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <h4 className="text-white font-black text-xl tracking-tight">Processing Payment</h4>
            <p className="text-sm text-gray-400 max-w-[200px]">Please do not close this window or tap back.</p>
          </div>
        )}

        {checkoutStep === "success" && (
          <div className="p-16 rounded-[2.5rem] bg-[#0b0e17] border border-emerald-500/30 text-center flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] mt-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="h-20 w-20 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-white font-black text-2xl tracking-tighter mb-2">Order Successful</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Your premium items are being prepared for shipping. We have emailed you the receipt.</p>
            </div>
            <button onClick={() => { setCheckoutStep("form"); setCart([]); setActiveTab("home"); }} className="mt-4 px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-widest text-xs rounded-full shadow-lg transition active:scale-95">Continue Exploring</button>
          </div>
        )}
      </div>
    );
  };

  const renderOrderTracking = () => {
    const steps = [
      { id: 1, label: "Order Placed", desc: "Received & confirmed", icon: CheckCircle2, emoji: "✅" },
      { id: 2, label: "Kitchen Preparing", desc: "Cooking your order 👨‍🍳", icon: Utensils, emoji: "🍳" },
      { id: 3, label: "Out for Delivery", desc: "Rider on the way 🛵", icon: Bike, emoji: "🛵" },
      { id: 4, label: "Delivered!", desc: "Enjoy your meal 🎉", icon: Home, emoji: "🎉" }
    ];

    const riderPos = trackingStep === 1 ? "8%" : trackingStep === 2 ? "38%" : trackingStep === 3 ? "72%" : "94%";

    return (
      <div className="rounded-[2.5rem] bg-gradient-to-b from-[#0a0c18] to-[#070910] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Animated top glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Live Delivery Tracking</p>
              <h3 className="text-base font-black text-white mt-0.5 font-mono">
                #{activeTrackingOrderId?.substring(6, 14).toUpperCase()}
              </h3>
            </div>
            <motion.div
              animate={trackingStep < 4 ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${trackingStep === 4 ? "bg-emerald-500 border-emerald-500 text-black" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}
            >
              {trackingStep < 4 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />}
              {trackingStep === 1 ? "Placed" : trackingStep === 2 ? "Preparing 🍳" : trackingStep === 3 ? "On The Way 🛵" : "Delivered! 🎉"}
            </motion.div>
          </div>

          {/* Live prep countdown */}
          {prepCountdownSec !== null && prepCountdownSec > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between bg-amber-500/8 border border-amber-500/20 rounded-2xl px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-gray-400 font-medium">Estimated Prep Time</span>
              </div>
              <span className="text-base font-black text-amber-400 font-mono">{formatPrepTime(prepCountdownSec)}</span>
            </motion.div>
          )}

          {/* Animated delivery track */}
          <div className="bg-black/50 border border-white/5 rounded-2xl py-6 px-5 relative overflow-hidden">
            {/* Track line */}
            <div className="absolute left-8 right-8 h-1 bg-white/8 rounded-full top-1/2 -translate-y-1/2" />
            {/* Progress fill */}
            <motion.div
              className="absolute left-8 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full top-1/2 -translate-y-1/2"
              animate={{ width: riderPos }}
              transition={{ type: "spring", damping: 18 }}
            />
            {/* Start dot */}
            <div className="absolute left-8 h-3 w-3 rounded-full bg-emerald-500 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            {/* End dot */}
            <div className="absolute right-8 h-3 w-3 rounded-full bg-white/20 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <Home className="h-2 w-2 text-white/40" />
            </div>
            {/* Moving rider */}
            <motion.div
              className="absolute -translate-y-1/2 top-1/2 flex flex-col items-center z-10 -translate-x-1/2"
              animate={{ left: riderPos }}
              transition={{ type: "spring", damping: 15, stiffness: 80 }}
            >
              <motion.div
                animate={trackingStep === 3 ? { y: [-2, 2, -2] } : {}}
                transition={{ repeat: Infinity, duration: 0.4 }}
                className="text-2xl drop-shadow-lg"
                style={{ filter: `drop-shadow(0 0 8px ${primaryHex}80)` }}
              >
                {trackingStep === 3 ? "🛵" : trackingStep === 2 ? "👨‍🍳" : trackingStep === 1 ? "📋" : "🏠"}
              </motion.div>
            </motion.div>
          </div>

          {/* Rider Info Card — when out for delivery */}
          <AnimatePresence>
            {activeRiderInfo && trackingStep === 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-indigo-500/8 to-violet-500/8 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xl shrink-0"
                  >
                    🛵
                  </motion.div>
                  <div>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Your Delivery Rider</p>
                    <p className="text-sm text-white font-bold mt-0.5">{activeRiderInfo.name}</p>
                    <p className="text-[10px] text-gray-500">Carrying your order!</p>
                  </div>
                </div>
                <a
                  href={`tel:${activeRiderInfo.phone}`}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase transition cursor-pointer shadow-lg shadow-indigo-600/20 shrink-0 flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps timeline */}
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-4 top-5 bottom-5 w-px bg-white/8" />
            {steps.map((s, i) => {
              const isDone = trackingStep >= s.id;
              const isCurrent = trackingStep === s.id;
              return (
                <motion.div
                  key={s.id}
                  initial={false}
                  animate={{ opacity: isDone ? 1 : 0.4 }}
                  className="flex items-center gap-4 pl-10 relative"
                >
                  {/* Node */}
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className={`absolute left-1.5 h-5 w-5 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${isDone ? "bg-gradient-to-br from-indigo-500 to-emerald-500 border-transparent shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-[#06080f] border-white/10"}`}
                  >
                    {isDone ? <span className="text-[8px]">✓</span> : <span className="text-[10px] text-gray-600">{i + 1}</span>}
                  </motion.div>

                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <span className={`text-xs font-black transition-colors ${isDone ? "text-white" : "text-gray-600"}`}>{s.label}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                    {isCurrent && (
                      <span className="ml-auto text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse">NOW</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Delivered CTA */}
          {trackingStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3 mt-2"
            >
              <div className="text-center py-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-black text-emerald-400">Order Delivered!</p>
                <p className="text-[10px] text-gray-500 mt-1">Enjoy your meal!</p>
              </div>
              <button
                onClick={() => setActiveTrackingOrderId(null)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-extrabold text-sm cursor-pointer shadow-xl active:scale-[0.98] transition"
              >
                Rate Your Experience ⭐
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        {activeTrackingOrderId ? (
          renderOrderTracking()
        ) : (
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Order History</h2>
            
            {!buyerUser ? (
              <div className="p-16 text-center text-gray-500 bg-white/[0.01] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4">
                <Lock className="h-12 w-12 text-gray-700" />
                <p className="font-bold">Log in to view your orders</p>
                <button onClick={() => setShowAuthDrawer(true)} className="py-2.5 px-6 rounded-xl bg-white text-black font-extrabold text-xs">Verify Customer Account</button>
              </div>
            ) : buyerOrders.length === 0 ? (
              <div className="p-16 text-center text-gray-500 bg-white/[0.01] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4">
                <Utensils className="h-12 w-12 text-gray-700" />
                <p className="font-bold">You haven't ordered any food yet</p>
                <button onClick={() => setActiveTab("catalog")} className="py-2.5 px-6 rounded-xl bg-white text-black font-extrabold text-xs">Browse Food Menu</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {buyerOrders.map((o) => (
                  <div key={o.id} className="p-5 rounded-3xl bg-[#0b0e17]/80 border border-white/5 flex flex-col gap-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold font-mono">ORDER ID: {o.id.substring(0, 10).toUpperCase()}</span>
                        <span className="text-[10px] text-gray-500 block font-mono">Date: {new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        o.status === "fulfilled" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex gap-4 items-center border-t border-b border-white/5 py-3 mt-1">
                      {o.productImage ? (
                        <img src={o.productImage} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0"><Utensils className="h-5 w-5 text-white/20" /></div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{o.productName}</span>
                        <span className="text-[10px] text-gray-500 truncate">{o.productDescription}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white font-mono">Paid {currencySymbol}{(o.amountCents/100).toFixed(2)}</span>
                      {o.status !== "fulfilled" && o.status !== "cancelled" && (
                        <button 
                          onClick={() => {
                            setActiveTrackingOrderId(o.id);
                          }}
                          className="px-3.5 py-1.5 bg-[#FF385C] text-white hover:bg-[#E31C5F] rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                          style={{ backgroundColor: primaryHex }}
                        >
                          <Bike className="h-3.5 w-3.5" /> Track Live
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  
  // --- WORLD-CLASS RETAIL TEMPLATE RENDER FUNCTIONS ---
  const renderRetailHome = () => {
    // Categories for pill swiper
    let categories: any[] = [];
    if (storeData.categories && storeData.categories.length > 0) {
       categories = storeData.categories.map((c: any) => ({ tag: c.id, name: c.name, image: c.image || null })).slice(0, 8);
    } else {
       categories = storeData.products
         .map(p => ({ tag: p.categoryId || "all", name: p.categoryId || "All" }))
         .filter((v, i, a) => a.findIndex(t => (t.tag === v.tag)) === i)
         .slice(0, 6);
    }

    const displayCategories = categories.length > 1 ? categories : [
      { tag: "new", name: "New In" },
      { tag: "bestsellers", name: "Best Sellers" },
      { tag: "accessories", name: "Accessories" },
      { tag: "clothing", name: "Clothing" },
      { tag: "shoes", name: "Footwear" },
    ];

    return (
      <div className="w-full pb-32 animate-fadeIn flex flex-col gap-10">
        {/* PREMIUM NATIVE HEADER (Mobile & Desktop) */}
        <div className="w-full px-5 pt-6 pb-2 flex justify-between items-center z-30 sticky top-0 bg-[#04060c]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
               <Sparkles className="w-5 h-5" />
             </div>
             <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white">
               {storeData.storefront?.companyName || "Store"}
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab("catalog")} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
               <Search className="w-5 h-5 text-white" />
             </button>
             <button onClick={() => setShowAuthDrawer(true)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
               <User className="w-5 h-5 text-white" />
             </button>
          </div>
        </div>

        {/* EDGE-TO-EDGE IMMERSIVE HERO */}
        <div className="px-4 md:px-8">
          <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10 bg-black">
            <img src={storeData.storefront?.heroImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4 inline-block shadow-lg border border-white/20">New Collection</span>
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-[1.1]">{storeData.storefront?.heroText || "Discover True Elegance"}</h2>
                <button onClick={() => setActiveTab("catalog")} className="mt-4 bg-white text-black px-8 py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* SWIPABLE CATEGORY PILLS */}
        <div className="pl-4 md:pl-8 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-6 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button onClick={() => setActiveTab("catalog")} className="relative overflow-hidden whitespace-nowrap px-8 py-4 rounded-3xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center min-w-[120px] shrink-0">
               <Grid className="w-4 h-4 mr-2" /> All
            </button>
            {displayCategories.map((c: any, i: number) => (
              <button 
                key={i} 
                onClick={() => { setSelectedFoodCategory(c.tag); setActiveTab("catalog"); }} 
                className="relative overflow-hidden whitespace-nowrap px-8 py-4 rounded-3xl bg-[#0a0c16] border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center min-w-[140px] shrink-0 group"
              >
                {c.image ? (
                  <>
                    <img src={c.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                )}
                <span className="relative z-10 drop-shadow-md">{c.name.replace(/^CAT_.*$/, 'Category')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NEW ARRIVALS HORIZONTAL FEED */}
        <div className="pl-4 md:pl-8">
          <div className="flex justify-between items-end mb-6 pr-4 md:pr-8">
            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">New Arrivals</h3>
            <button onClick={() => setActiveTab("catalog")} className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">See All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-8 pr-4 md:pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
            {storeData.products.slice(0, 6).map((p, i) => (
              <div key={i} className="min-w-[220px] md:min-w-[280px] snap-start group cursor-pointer bg-[#0c0e14] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col" onClick={() => setSelectedProduct(p)}>
                <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/50 to-transparent h-[60%] mt-auto"></div>
                  
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_5px_rgba(255,59,48,0.8)] animate-pulse"></div>
                      SPECIAL OFFER
                    </div>
                  )}
                </div>
                
                <div className="p-4 pt-2 flex flex-col gap-1 flex-1 justify-between">
                  <h4 className="text-sm md:text-base font-black text-white leading-tight line-clamp-2">{p.name}</h4>
                  
                  <div className="flex flex-col mt-2">
                    {p.compareAtPrice && p.compareAtPrice > p.price ? (
                      <span className="text-[10px] font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-transparent opacity-0 line-through">0</span>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg md:text-xl font-black text-[#ffc107]">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <div className="flex items-center gap-1.5 border border-[#ffc107]/20 bg-[#ffc107]/5 rounded-[4px] px-1.5 py-0.5">
                           <div className="w-1 h-1 rounded-full bg-[#ffc107]"></div>
                           <span className="text-[9px] font-black text-[#ffc107] tracking-widest">14:59</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="w-10 h-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                      <ExternalLink className="w-4 h-4 text-white/70" />
                    </button>
                    <button 
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#ffd000] to-[#ffb300] hover:from-[#ffdf33] hover:to-[#ffc020] text-black text-[11px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(255,193,7,0.2)] hover:shadow-[0_4px_20px_rgba(255,193,7,0.4)] transition-all active:scale-95"
                      onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREMIUM FOOTER */}
        <div className="mt-12 mx-4 md:mx-8 bg-[#0a0c16] rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col items-center text-center shadow-xl">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
             <Sparkles className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">{storeData.storefront?.companyName || "Premium Store"}</h2>
           <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">Experience world-class quality and exceptional service. Designed with passion for the modern lifestyle.</p>
           
           <div className="flex gap-6 mb-8">
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Star className="w-4 h-4 text-white" /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Heart className="w-4 h-4 text-white" /></a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><Mail className="w-4 h-4 text-white" /></a>
           </div>

           <div className="w-full h-[1px] bg-white/5 mb-8"></div>
           
           <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <span>•</span>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
             <span>•</span>
             <a href="#" className="hover:text-white transition-colors">Contact Us</a>
           </div>
        </div>
      </div>
    );
  };

  const renderRetailCatalog = () => (
    <div className="w-full pb-32 animate-fadeIn mt-4 md:mt-8 px-4 md:px-8">
      {/* PREMIUM HEADER FOR CATALOG */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#04060c]/90 backdrop-blur-xl z-20 pt-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">Collection</h2>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">{storeData.products.length} Products Available</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-95">
           <Grid className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {storeData.products.map((p, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="group cursor-pointer flex flex-col bg-[#0c0e14] rounded-3xl overflow-hidden border border-white/5 shadow-2xl" onClick={() => setSelectedProduct(p)}>
            <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
              {p.image ? (
                <img src={p.image} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" alt={p.name} />
              ) : (
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/50 to-transparent h-[60%] mt-auto"></div>
              
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_5px_rgba(255,59,48,0.8)] animate-pulse"></div>
                  SPECIAL OFFER
                </div>
              )}
            </div>
            
            <div className="p-4 pt-2 flex flex-col gap-1 flex-1 justify-between">
              <h4 className="text-sm md:text-base font-black text-white leading-tight line-clamp-2">{p.name}</h4>
              
              <div className="flex flex-col mt-2">
                {p.compareAtPrice && p.compareAtPrice > p.price ? (
                  <span className="text-[10px] font-bold text-gray-500 line-through">{storeData.storefront?.globalCurrency || "₹"}{(p.compareAtPrice / 100).toFixed(2)}</span>
                ) : (
                  <span className="text-[10px] font-bold text-transparent opacity-0 line-through">0</span>
                )}
                <div className="flex items-center gap-2 xl:gap-3 flex-wrap">
                  <span className="text-lg font-black text-[#ffc107]">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <div className="flex items-center gap-1.5 border border-[#ffc107]/20 bg-[#ffc107]/5 rounded-[4px] px-1.5 py-0.5">
                       <div className="w-1 h-1 rounded-full bg-[#ffc107]"></div>
                       <span className="text-[9px] font-black text-[#ffc107] tracking-widest whitespace-nowrap">14:59</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="w-10 h-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors">
                  <ExternalLink className="w-4 h-4 text-white/70" />
                </button>
                <button 
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#ffd000] to-[#ffb300] hover:from-[#ffdf33] hover:to-[#ffc020] text-black text-[11px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(255,193,7,0.2)] hover:shadow-[0_4px_20px_rgba(255,193,7,0.4)] transition-all active:scale-95"
                  onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderRetailCart = () => {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn pt-6 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Your Bag</h2>
        
        {cart.length === 0 ? (
          <div className="p-16 text-center bg-[#0b0e17] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-6 mt-10 shadow-2xl">
            <ShoppingBag className="h-16 w-16 text-white/20" />
            <h3 className="text-xl font-bold text-white tracking-tight">Your bag is empty.</h3>
            <button onClick={() => setActiveTab("catalog")} className="py-4 px-10 rounded-full bg-white text-black font-extrabold text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Shop Collection</button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cart.filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx).map((item) => {
              const qty = getProductQty(item.id);
              return (
                <div key={item.id} className="p-5 rounded-3xl bg-[#0b0e17] border border-white/10 flex gap-5 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                  {item.image ? (
                    <img src={item.image} className="w-24 h-28 rounded-2xl object-cover bg-white" alt={item.name} />
                  ) : (
                    <div className="w-24 h-28 rounded-2xl bg-white/5 flex items-center justify-center"><Package className="h-8 w-8 text-white/20" /></div>
                  )}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{item.name}</h4>
                      <span className="text-sm font-black text-white">{currencySymbol}{(item.price/100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                        <button onClick={() => { playTickSound(); decreaseQuantity(item.id); }} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-mono font-bold w-6 text-center text-white">{qty}</span>
                        <button onClick={() => { playTickSound(); addToCart(item); }} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-8 rounded-[2rem] bg-[#0b0e17] border border-white/10 flex flex-col gap-5 shadow-2xl mt-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h3>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Shipping</span>
                <span className="font-bold">{appliedShipping === 0 ? "FREE" : `${currencySymbol}${appliedShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-black text-white pt-4 border-t border-white/10">
                <span>Total</span>
                <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => { if (!buyerUser) setShowAuthDrawer(true); else setActiveTab("checkout"); }} 
                className="mt-4 w-full bg-white text-black font-black py-5 rounded-full text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
              >
                Checkout Securely <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRetailCheckout = () => {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn pt-4 px-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setActiveTab("cart")} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 shadow-lg"><ChevronRight className="h-5 w-5 rotate-180" /></button>
          <h2 className="text-xl font-black text-white tracking-tighter">Secure Checkout</h2>
        </div>

        {checkoutStep === "form" && (
          <form onSubmit={handleSimulatedCheckout} className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">1. Shipping Details</h3>
              <div className="p-6 rounded-[2rem] bg-[#0b0e17] border border-white/10 shadow-xl flex flex-col gap-5">
                <input type="text" required value={checkoutName} onChange={e=>setCheckoutName(e.target.value)} className="bg-transparent border-b border-white/20 px-2 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors" placeholder="Full Name" />
                <input type="email" required value={checkoutEmail} onChange={e=>setCheckoutEmail(e.target.value)} className="bg-transparent border-b border-white/20 px-2 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors" placeholder="Email Address" />
                <input type="tel" required value={checkoutPhone} onChange={e=>setCheckoutPhone(e.target.value)} className="bg-transparent border-b border-white/20 px-2 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors" placeholder="Phone Number" />
                <textarea required value={checkoutAddress} onChange={e=>setCheckoutAddress(e.target.value)} rows={2} className="bg-transparent border-b border-white/20 px-2 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none" placeholder="Complete Delivery Address"></textarea>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">2. Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "card", icon: CreditCard, label: "Credit Card" },
                  { id: "cod", icon: Building, label: "Cash on Delivery" }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-6 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      paymentMethod === method.id
                        ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        : "bg-[#0b0e17] border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    <method.icon className={`h-6 w-6 ${paymentMethod === method.id ? 'text-black' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-full text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)] flex justify-center items-center gap-2 mt-4">
              <Check className="w-4 h-4" /> Place Order • {currencySymbol}{finalTotal.toFixed(2)}
            </button>
          </form>
        )}

        {checkoutStep === "processing" && (
          <div className="p-16 rounded-[2.5rem] bg-[#0b0e17] border border-white/10 text-center flex flex-col items-center justify-center gap-6 shadow-2xl mt-10">
            <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <h4 className="text-white font-black text-xl tracking-tight">Processing Payment</h4>
            <p className="text-sm text-gray-400 max-w-[200px]">Please do not close this window or tap back.</p>
          </div>
        )}

        {checkoutStep === "success" && (
          <div className="p-16 rounded-[2.5rem] bg-[#0b0e17] border border-emerald-500/30 text-center flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] mt-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="h-20 w-20 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-white font-black text-2xl tracking-tighter mb-2">Order Successful</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Your premium items are being prepared for shipping. We have emailed you the receipt.</p>
            </div>
            <button onClick={() => { setCheckoutStep("form"); setCart([]); setActiveTab("home"); }} className="mt-4 px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-widest text-xs rounded-full shadow-lg transition active:scale-95">Continue Exploring</button>
          </div>
        )}
      </div>
    );
  };
// --- PREMIUM FIGMA-STYLE FOOD UI (food-v3) ---
  const renderPremiumFoodHome = () => {
    const foodOffers = storeData.storefront?.kitchenOffers?.length ? storeData.storefront.kitchenOffers : [
      { id: "o1", title: "50% OFF", description: "Up to ₹100 on your first order", code: "WELCOME50", bg: "from-orange-500 to-red-500" },
      { id: "o2", title: "Free Delivery", description: "On orders above ₹199", code: "FREEDEL", bg: "from-blue-500 to-indigo-500" }
    ];

    const popularCategories = storeData.products
      .map(p => ({ tag: p.categoryId || "all", name: p.categoryId || "All" }))
      .filter((v, i, a) => a.findIndex(t => (t.tag === v.tag)) === i);
      
    // Default categories if store doesn't have them
    const displayCategories = popularCategories.length > 1 ? popularCategories : [
      { tag: "burger", name: "Burgers", icon: "🍔" },
      { tag: "pizza", name: "Pizza", icon: "🍕" },
      { tag: "sushi", name: "Sushi", icon: "🍣" },
      { tag: "healthy", name: "Healthy", icon: "🥗" },
      { tag: "dessert", name: "Desserts", icon: "🍩" },
    ];

    return (
      <div className="w-full pb-24 animate-fadeIn flex flex-col pt-4">
        {/* Figma Style Location Header */}
        <div className="px-4 flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-500" /> Deliver to
            </span>
            <div className="flex items-center gap-1 mt-0.5 cursor-pointer">
              <span className="text-sm font-black text-white truncate max-w-[200px]">Current Location, City...</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button onClick={() => setShowAuthDrawer(true)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer shadow-lg">
            <User className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Figma Style Modern Search Bar */}
        <div className="px-4 mb-6">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-12 flex items-center px-4 shadow-inner">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search for food, restaurants..." 
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                value={foodSearchQuery}
                onChange={e => {
                  setFoodSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) setActiveTab("catalog");
                }}
              />
            </div>
            <button className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 transition-all cursor-pointer">
              <Grid className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Horizontal Offer Carousel */}
        <div className="pl-4 mb-8 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 pr-4 snap-x hide-scrollbar">
            {foodOffers.map((offer: any, i: number) => (
              <div key={i} className={`min-w-[280px] h-36 rounded-3xl bg-gradient-to-br ${offer.bg || 'from-orange-500 to-red-600'} p-5 flex flex-col justify-between shadow-lg snap-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{offer.title}</h3>
                  <p className="text-white/80 text-xs font-bold mt-1">{offer.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-full">{offer.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Slider */}
        <div className="mb-8">
          <div className="px-4 flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-white">Categories</h3>
            <button onClick={() => setActiveTab("catalog")} className="text-xs font-bold text-orange-500">See All</button>
          </div>
          <div className="pl-4 flex gap-4 overflow-x-auto pb-2 pr-4 hide-scrollbar">
            {displayCategories.map((c: any, i: number) => (
              <button 
                key={i} 
                onClick={() => { setSelectedFoodCategory(c.tag); setActiveTab("catalog"); }} 
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-sm hover:bg-white/10 hover:border-orange-500/50 transition-all">
                  {c.icon || <Utensils className="w-6 h-6 text-gray-300" />}
                </div>
                <span className="text-[11px] font-bold text-gray-300 text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Near You (Figma Style Cards) */}
        <div className="px-4 mb-6">
          <h3 className="text-base font-black text-white mb-4">Popular Near You</h3>
          <div className="flex flex-col gap-5">
            {storeData.products.slice(0, 5).map((p, i) => (
              <div key={i} className="flex flex-col gap-3 group cursor-pointer" onClick={() => setSelectedProduct(p)}>
                <div className="w-full h-48 rounded-3xl bg-white/5 overflow-hidden relative shadow-md">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-8 h-8 text-white/10" /></div>
                  )}
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white text-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-black">4.8</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full shadow-lg group-hover:bg-orange-500 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black text-white">{p.name}</h4>
                    <span className="text-base font-black text-orange-500">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{p.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Clock className="w-3 h-3 text-gray-500" /> 20-30 min
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                      <Bike className="w-3 h-3 text-gray-500" /> Free Delivery
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumFoodCatalog = () => {
    // We will reuse the same logic for filtering as regular food catalog
    let filteredList = [...storeData.products];
    if (selectedFoodCategory) {
      filteredList = filteredList.filter(p => p.categoryId === selectedFoodCategory || p.tags?.includes(selectedFoodCategory));
    }
    if (foodSearchQuery.trim()) {
      filteredList = filteredList.filter(p => p.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(foodSearchQuery.toLowerCase()));
    }
    if (foodTypeFilter === "veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("veg") && !p.tags?.includes("non-veg"));
    } else if (foodTypeFilter === "non-veg") {
      filteredList = filteredList.filter(p => p.tags?.includes("non-veg"));
    }

    return (
      <div className="w-full pb-24 animate-fadeIn pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white">Menu</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setFoodTypeFilter("all")} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${foodTypeFilter === "all" ? "bg-white text-black" : "bg-white/10 text-gray-400"}`}>All</button>
            <button onClick={() => setFoodTypeFilter("veg")} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${foodTypeFilter === "veg" ? "bg-green-500 text-white" : "bg-white/10 text-gray-400"}`}><span className="w-2 h-2 rounded-full bg-green-400 border border-white/50" /> Veg</button>
            <button onClick={() => setFoodTypeFilter("non-veg")} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${foodTypeFilter === "non-veg" ? "bg-red-500 text-white" : "bg-white/10 text-gray-400"}`}><span className="w-2 h-2 rounded-full bg-red-400 border border-white/50" /> Non-Veg</button>
          </div>
        </div>
        
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-white/20 mb-4" />
            <p className="font-bold text-gray-400">No items match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredList.map((p, i) => (
              <div key={i} className="bg-white/5 rounded-3xl p-3 flex gap-4 cursor-pointer hover:bg-white/10 transition-colors border border-white/5" onClick={() => setSelectedProduct(p)}>
                <div className="w-28 h-28 rounded-2xl bg-black/40 overflow-hidden relative shrink-0">
                   {p.image ? (
                    <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Utensils className="w-6 h-6 text-white/10" /></div>
                  )}
                  {p.tags?.includes("veg") && !p.tags?.includes("non-veg") && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5 shadow-sm"><div className="w-2 h-2 bg-green-500 rounded-full" /></div>}
                  {p.tags?.includes("non-veg") && <div className="absolute top-2 left-2 bg-white rounded-sm p-0.5 shadow-sm"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>}
                </div>
                <div className="flex-1 flex flex-col justify-center py-1">
                  <h4 className="text-sm font-black text-white leading-tight mb-1 line-clamp-2">{p.name}</h4>
                  <span className="text-sm font-black text-orange-500 mb-2">{storeData.storefront?.globalCurrency || "₹"}{(p.price / 100).toFixed(2)}</span>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
                    </div>
                    <button className="bg-white/10 hover:bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPremiumFoodCart = () => renderFoodCart(); // Clean cart is acceptable
  const renderPremiumFoodCheckout = () => renderFoodCheckout(); 

  const renderBuyerPortal = () => {
    return ( <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
            {/* Sheet backdrop closer */}
            <div className="absolute inset-0" onClick={() => setIsChatOpen(false)} />
            
            {/* Native Sheet Drawer */}
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 22 }}
              className="w-full bg-[#0a0c16] border-t border-white/10 rounded-t-[2.5rem] p-6 pb-12 flex flex-col gap-6 h-[95vh] relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
                        <div className="flex-1 w-full relative h-full flex flex-col overflow-hidden">
             <div className="absolute top-4 right-4 z-50">
               <button type="button" onClick={() => setIsChatOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition shadow-md cursor-pointer">
                 <X className="h-5 w-5 text-white" />
               </button>
             </div>
             <ChatWidgetUI 
                tenantSlug={tenantSlug} 
                agentConfig={storeData.assignedAgent} 
                isPreviewMode={false} 
                overrideAgentId={storeData.assignedAgent?.id || storeData.storefront?.assignedAgentId} 
              />
           </div>
           </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      </>
    );
  };


  // Full-page premium retail template — renders independently, no wrapper needed
  if (isPremiumRetail) {
    return (
      <PremiumRetailStoreDynamic
        store={{ id: tenantSlug, name: storeData.storefront?.companyName || tenantSlug, primaryColor: storeData.storefront?.primaryColor, currency: storeData.storefront?.globalCurrency || "₹" }}
        storefront={storeData.storefront}
        tenantSlug={tenantSlug}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#04060c] relative text-white pb-24 font-sans overflow-x-hidden">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full md:max-w-5xl lg:max-w-7xl mx-auto min-h-screen pb-32 md:pb-12 shadow-2xl bg-[#0a0c16]/50 md:bg-transparent md:shadow-none">
        

        {isPremiumFood ? (
          <>
            {activeTab === "home" && renderPremiumFoodHome()}
            {activeTab === "catalog" && renderPremiumFoodCatalog()}
            {activeTab === "cart" && renderPremiumFoodCart()}
            {activeTab === "checkout" && renderPremiumFoodCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : isFood ? (
          <>
            {activeTab === "home" && renderFoodHome()}
            {activeTab === "catalog" && renderFoodCatalog()}
            {activeTab === "cart" && renderFoodCart()}
            {activeTab === "checkout" && renderFoodCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : isRetail ? (
          <>
            {activeTab === "home" && renderRetailHome()}
            {activeTab === "catalog" && renderRetailCatalog()}
            {activeTab === "cart" && renderRetailCart()}
            {activeTab === "checkout" && renderRetailCheckout()}
            {activeTab === "orders" && renderOrdersTab()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fadeIn">
             <h2 className="text-xl font-black text-white mb-2 tracking-tight">Store Upgrading</h2>
             <p className="text-sm text-gray-400 leading-relaxed max-w-[250px]">We are optimizing this storefront for a better experience. Check back soon!</p>
          </div>
        )}
      </div>

      {/* RETAIL / MAIN NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#04060c]/80 backdrop-blur-2xl border-t border-white/10 pb-safe pt-2 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md md:max-w-5xl lg:max-w-7xl mx-auto flex justify-between items-center pb-2">
          {[
            { id: "home", label: "Home", icon: <Home className="w-6 h-6 mb-1.5" /> },
            { id: "catalog", label: "Menu", icon: <Grid className="w-6 h-6 mb-1.5" /> },
            { id: "cart", label: "Cart", icon: <ShoppingBag className="w-6 h-6 mb-1.5" />, badge: cart.length },
            { id: "orders", label: "Orders", icon: <Clock className="w-6 h-6 mb-1.5" /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center p-2 transition-all active:scale-95 ${activeTab === item.id ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              <div className="relative">
                {item.icon}
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-white text-black rounded-full text-[9px] font-black flex items-center justify-center shadow-md">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[9px] font-black tracking-widest uppercase ${activeTab === item.id ? "opacity-100" : "opacity-70"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAB FOR CHAT */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20 group"
      >
        <Sparkles className="text-white w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0c16] animate-pulse"></span>
      </button>

      {/* MODALS */}
{/* PREMIUM LIVE ORDER ACCEPTED MODAL */}
      <AnimatePresence>
        {showAcceptedModal && (() => {
          const riderVehicleEmoji = (activeRiderInfo as any)?.vehicle === "scooter" ? "🛵" : (activeRiderInfo as any)?.vehicle === "car" ? "🚗" : (activeRiderInfo as any)?.vehicle === "van" ? "🚐" : "🏍️";
          const totalPrepSec = prepCountdownSec !== null ? Math.max(prepCountdownSec, 1) : null;
          return (
            <motion.div
              key="accepted-modal-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-4 sm:p-6"
            >
              {/* Ring glow effects */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }} transition={{ repeat: Infinity, duration: 2 }} className="w-[400px] h-[400px] rounded-full border-2 border-emerald-500/30" />
              </div>

              <motion.div
                initial={{ scale: 0.85, y: 80, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 260 }}
                className="w-full max-w-sm bg-gradient-to-b from-[#071a10] via-[#0a1520] to-[#070b14] border-2 border-emerald-500/50 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.3)] relative"
              >
                {/* Animated top gradient bar */}
                <motion.div
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="h-1.5 w-full"
                  style={{ background: "linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #10b981)", backgroundSize: "200%" }}
                />

                <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

                <div className="p-6 flex flex-col items-center text-center gap-4 relative">
                  {/* Hero emoji */}
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500/25 to-cyan-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20"
                    >🎉</motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Order Accepted! 🚀</h3>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">Kitchen is now preparing your order</p>
                  </div>

                  {/* Live countdown */}
                  {prepCountdownSec !== null && prepCountdownSec > 0 && (
                    <div className="w-full bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4 flex flex-col items-center gap-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Estimated Prep Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-400" />
                        <span className="text-3xl font-black text-emerald-400 font-mono tracking-widest">
                          {formatPrepTime(prepCountdownSec)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                          animate={{ width: ["100%", "0%"] }}
                          transition={{ duration: totalPrepSec || 1200, ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rider Card — shown when rider is assigned */}
                  {activeRiderInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4"
                    >
                      <motion.div
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-4xl shrink-0"
                      >{riderVehicleEmoji}</motion.div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[10px] text-indigo-300 font-black uppercase tracking-wider">Your Delivery Rider</p>
                        <p className="text-white font-black text-lg leading-tight truncate">{activeRiderInfo.name}</p>
                        <p className="text-gray-400 text-xs">{activeRiderInfo.phone}</p>
                      </div>
                      {activeRiderInfo.phone && (
                        <a
                          href={`tel:${activeRiderInfo.phone}`}
                          className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 hover:bg-indigo-500/30 transition"
                        >
                          <Phone className="h-4 w-4 text-indigo-400" />
                        </a>
                      )}
                    </motion.div>
                  )}

                  {/* Status chips */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {[
                      { label: "Placed", icon: "✅", done: true },
                      { label: "Preparing", icon: "👨‍🍳", done: true },
                      { label: "On the Way", icon: "🛵", done: false },
                      { label: "Delivered", icon: "📦", done: false },
                    ].map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${step.done ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-gray-500"}`}
                      >
                        <span>{step.icon}</span><span>{step.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAcceptedModal(false)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bike className="h-4 w-4" /> Track My Order Live
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* PREMIUM LIVE MESSAGE / NOTIFICATION ALERT BANNER */}
      <AnimatePresence>
        {incomingStoreMessage && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60] select-none"
          >
            <div className="bg-gradient-to-br from-[#0d1624] to-[#090d1a] border border-indigo-500/50 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.25)]">
              {/* Top gradient bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4 text-indigo-400" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-indigo-500 border-2 border-[#090d1a] animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Message from Store</p>
                      <p className="text-[9px] text-gray-600">Just now</p>
                    </div>
                  </div>
                  <button onClick={() => setIncomingStoreMessage(null)} className="text-gray-500 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-white leading-relaxed font-medium bg-black/30 border border-white/5 rounded-2xl px-4 py-3">
                  {incomingStoreMessage}
                </p>

                <button
                  onClick={() => setIncomingStoreMessage(null)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition active:scale-[0.98] cursor-pointer shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Check className="h-3.5 w-3.5" /> Got it, Thanks!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOMER LOGIN DRAWER */}
      {renderBuyerPortal()}

      {/* SPIN THE WHEEL GAME MODAL */}
      <AnimatePresence>
        {showWheel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-[#0b0d18] border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-center relative shadow-2xl">
              <button onClick={() => setShowWheel(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white cursor-pointer"><X className="h-4 w-4" /></button>
              <Gift className="h-10 w-10 text-indigo-400 mb-2 animate-bounce" style={{ color: primaryHex }} />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Loyalty Prize Wheel</h3>
              <p className="text-center text-[10px] text-gray-500 max-w-xs mt-1.5 px-2">Spin our micro-rewards wheel to claim coupon codes valid for 5 minutes!</p>
              
              {/* Wheel element */}
              <div className="relative w-64 h-64 mt-6 mb-6 flex items-center justify-center">
                {/* Pointer */}
                <div className="absolute top-0 z-20 -mt-2">
                  <div className="w-4 h-6 bg-red-500 clip-path-triangle" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)", backgroundColor: primaryHex }} />
                </div>
                {/* Rotating wheel */}
                <motion.div 
                  className="w-full h-full rounded-full border-4 border-white/15 relative overflow-hidden shadow-2xl bg-black/40"
                  style={{ transform: `rotate(${wheelAngle}deg)` }}
                >
                  {wheelSectors.map((s, i) => {
                    const angle = 360 / wheelSectors.length;
                    const rotate = i * angle;
                    return (
                      <div 
                        key={i} 
                        className="absolute inset-0 origin-center flex items-start justify-center pt-4"
                        style={{ transform: `rotate(${rotate}deg)` }}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-black font-mono text-white tracking-tight leading-none rotate-90 origin-center translate-y-6 shrink-0">{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                  {/* Sector divider lines */}
                  {wheelSectors.map((_, i) => (
                    <div 
                      key={`line-${i}`} 
                      className="absolute inset-0 origin-center bg-white/10 w-[2px] left-1/2 -translate-x-1/2" 
                      style={{ transform: `rotate(${i * (360/wheelSectors.length)}deg)` }}
                    />
                  ))}
                </motion.div>
                {/* Center Pin */}
                <div className="absolute h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg border border-black/10 z-10">
                  <Sparkles className="h-4.5 w-4.5 text-black" />
                </div>
              </div>

              <button 
                onClick={spinTheWheel}
                disabled={isSpinning}
                className="w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-xl disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: primaryHex }}
              >
                {isSpinning ? "SPINNING CRUISE..." : "SPIN REWARDS"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SINGLE PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] ${isLightMode ? 'bg-black/30' : 'bg-black/80'} backdrop-blur-md flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-6`}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className={`w-full lg:max-w-4xl ${isLightMode ? 'bg-white text-black' : 'bg-[#0a0d1a] text-white'} lg:rounded-[2.5rem] rounded-t-[2.5rem] border ${isLightMode ? 'border-gray-100' : 'border-white/10'} flex flex-col lg:flex-row shadow-2xl overflow-hidden max-h-[90vh] lg:max-h-[85vh] relative`}
            >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className={`absolute top-4 right-4 p-2 rounded-full ${isLightMode ? 'bg-black/5 text-black hover:bg-black/10' : 'bg-white/10 text-white hover:bg-white/20'} backdrop-blur-md cursor-pointer transition z-50`}
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex flex-col lg:flex-row w-full h-full overflow-y-auto overflow-x-hidden">
                {/* Left image area */}
                <div className={`w-full lg:w-1/2 relative shrink-0 ${isLightMode ? 'bg-gray-50' : 'bg-white/5'} flex items-center justify-center p-6 lg:p-10`}>
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} className="w-full aspect-square object-cover rounded-3xl shadow-lg border border-black/5" />
                  ) : (
                    <Package className="h-20 w-20 text-gray-400 opacity-50" />
                  )}
                </div>
                
                {/* Right details area */}
                <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isLightMode ? 'bg-indigo-50 text-indigo-600' : 'bg-white/10 text-indigo-400'}`} style={{ color: primaryHex }}>
                        {selectedProduct.tags?.includes("bestseller") ? "Bestseller" : "Catalog Item"}
                      </span>
                      {selectedProduct.tags?.includes("veg") && (
                        <div className="h-4.5 w-4.5 border border-green-500 rounded-md flex items-center justify-center shrink-0 bg-green-500/10">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                      )}
                      {selectedProduct.tags?.includes("non-veg") && (
                        <div className="h-4.5 w-4.5 border border-red-500 rounded-md flex items-center justify-center shrink-0 bg-red-500/10">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-xl lg:text-2xl font-black font-heading leading-tight tracking-tight mb-2">
                        {selectedProduct.name}
                      </h2>
                      <span className="text-2xl font-black font-mono tracking-tighter" style={{ color: primaryHex }}>
                        {currencySymbol}{(selectedProduct.price / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className={`w-full h-px ${isLightMode ? 'bg-gray-100' : 'bg-white/10'} my-1`} />
                    
                    <div className="overflow-y-auto max-h-[25vh] lg:max-h-full pr-2">
                      <p className={`text-[11px] lg:text-xs leading-relaxed font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {selectedProduct.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-6 pt-6 border-t ${isLightMode ? 'border-gray-100' : 'border-white/10'} flex flex-col gap-3 shrink-0`}>
                    <button 
                      onClick={() => {
                        if(typeof playTickSound === 'function') playTickSound();
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                        setActiveTab("cart");
                      }} 
                      className="w-full text-white font-black py-3.5 rounded-xl text-[11px] uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer" 
                      style={{ backgroundColor: primaryHex }}
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
