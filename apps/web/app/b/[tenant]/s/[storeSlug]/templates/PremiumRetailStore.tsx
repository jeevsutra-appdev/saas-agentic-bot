"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, Search, Star, Heart, Minus, Plus,
  ChevronRight, ChevronLeft, Package, Truck, RotateCcw,
  Shield, CheckCircle2, MapPin, CreditCard, ArrowLeft,
  Flame, SlidersHorizontal, ChevronDown, Home,
  Layers, Sparkles, Tag, User, Zap,
} from "lucide-react";

interface Props { store: any; storefront: any; tenantSlug: string; }
interface CartItem { id: string; name: string; price: number; image?: string; qty: number; compareAtPrice?: number; }

const fmt = (v: number, sym = "₹") =>
  `${sym}${(v / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const pct = (price: number, compare: number) =>
  compare > price ? Math.round(((compare - price) / compare) * 100) : 0;

// Deterministic hash — never NaN
function stableHash(id = "x"): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return h;
}

const CAT_GRADIENTS = [
  "from-pink-500 to-rose-600", "from-violet-500 to-purple-700",
  "from-amber-400 to-orange-500", "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-600", "from-fuchsia-500 to-pink-600",
  "from-red-400 to-rose-600", "from-cyan-400 to-sky-600",
  "from-lime-400 to-green-600", "from-indigo-400 to-violet-700",
];
const CAT_EMOJI = ["👗","👟","💄","🏠","📱","🎮","⌚","👜","🧴","🎧","📚","🌿","🎨","✈️","🛒"];

/* ─────────────────────────────────────────────────────────────────────────────
   AUTO-SCROLL CAROUSEL — smooth infinite scroll, pauses on hover/touch
───────────────────────────────────────────────────────────────────────────── */
function AutoScroller({ children, cardW = 164 }: { children: ReactNode; cardW?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      if (paused.current || !el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 16;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardW + 12, behavior: "smooth" });
      }
    }, 2600);
    return () => clearInterval(id);
  }, [cardW]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onTouchStart={() => { paused.current = true; }}
      onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 4000); }}
      className="flex gap-3 overflow-x-auto scrollbar-none pb-1"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PRODUCT CARD — ultra premium, Myntra/Nykaa inspired
───────────────────────────────────────────────────────────────────────────── */
function ProductCard({
  p, sym, primary, onAdd, onRemove, qty, onWish, wished, onView,
}: {
  p: any; sym: string; primary: string;
  onAdd: () => void; onRemove: () => void; qty: number;
  onWish: () => void; wished: boolean; onView: () => void;
}) {
  const disc = pct(p.price || 0, p.compareAtPrice || 0);
  const h = stableHash(p.id);
  const rating = (3.4 + (h % 16) / 10).toFixed(1);
  const reviewCount = 50 + (h % 650) + 80;
  const [imgLoaded, setImgLoaded] = useState(false);

  /* Soft warm ivory bg — works for any product color */
  const imageBg = "linear-gradient(145deg,#faf9f7 0%,#f3f1ee 100%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.22 }}
      className="group relative bg-white dark:bg-[#12141c] flex flex-col overflow-hidden transition-all duration-300"
      style={{
        borderRadius: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.13)" }}
    >
      {/* ── IMAGE ZONE ── */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ aspectRatio: "1/1", background: imageBg, borderRadius: "20px 20px 0 0" }}
        onClick={onView}
      >
        {/* Shimmer skeleton */}
        {!imgLoaded && p.image && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "linear-gradient(90deg,#f5f4f2 25%,#eceae7 50%,#f5f4f2 75%)", backgroundSize: "200% 100%" }}
          />
        )}

        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-[1.07]"
            style={{
              opacity: imgLoaded ? 1 : 0,
              padding: "10px",
              transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-200 dark:text-gray-600" />
          </div>
        )}

        {/* Bottom gradient — shows on hover, reveals Quick View */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)" }}
        />

        {/* Quick View pill — slides up on hover */}
        <div
          className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 translate-y-2 group-hover:translate-y-0"
        >
          <span className="bg-white/92 dark:bg-black/70 backdrop-blur-md text-gray-800 dark:text-gray-200 text-[9.5px] font-black px-3 py-1.5 rounded-full shadow-xl tracking-wide uppercase">
            Quick View
          </span>
        </div>

        {/* Discount badge — pill style */}
        {disc > 0 ? (
          <div
            className="absolute top-2.5 left-2.5 text-white text-[9px] font-black px-2 py-[3px] rounded-full shadow-md"
            style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
          >
            {disc}% OFF
          </div>
        ) : (
          <div
            className="absolute top-2.5 left-2.5 text-white text-[9px] font-black px-2 py-[3px] rounded-full shadow-md"
            style={{ background: "linear-gradient(135deg,#00b4d8,#0077b6)" }}
          >
            NEW
          </div>
        )}

        {/* Wishlist — hidden until hover; always shown when active */}
        <button
          onClick={e => { e.stopPropagation(); onWish(); }}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center
            backdrop-blur-md shadow-lg border transition-all duration-200 ease-out
            ${wished
              ? "bg-rose-500 border-rose-400 text-white opacity-100 scale-100"
              : "bg-white/85 dark:bg-white/10 border-white/60 dark:border-white/10 text-gray-400 dark:text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* ── INFO ZONE — fixed height, all cards uniform ── */}
      <div className="flex flex-col" style={{ padding: "10px 11px 12px", height: 136 }}>

        {/* Title — 2-line, fixed height */}
        <p
          className="text-gray-800 dark:text-gray-100 font-semibold leading-snug overflow-hidden"
          style={{
            fontSize: 12.5, height: 34,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}
        >
          {p.name}
        </p>

        {/* Stars row */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div
            className="inline-flex items-center gap-[2px] px-1.5 py-[2px] rounded text-[9px] font-black"
            style={{ background: "linear-gradient(135deg,#fff3cd,#ffe69c)", color: "#b45309" }}
          >
            {rating}
            <Star className="w-[9px] h-[9px] fill-current" />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-[9px]">({reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="font-black text-gray-900 dark:text-white" style={{ fontSize: 14, letterSpacing: "-0.3px" }}>
            {fmt(p.price || 0, sym)}
          </span>
          {p.compareAtPrice && p.compareAtPrice > (p.price || 0) && (
            <span className="text-gray-350 dark:text-gray-500 line-through" style={{ fontSize: 10.5 }}>
              {fmt(p.compareAtPrice, sym)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          {qty === 0 ? (
            <button
              onClick={onAdd}
              className="w-full text-white font-black uppercase tracking-wider transition-all active:scale-95"
              style={{
                fontSize: 10,
                height: 30,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 100%)`,
                boxShadow: `0 3px 10px ${primary}55`,
              }}
            >
              ADD TO BAG
            </button>
          ) : (
            <div
              className="flex items-center justify-between"
              style={{ background: `${primary}12`, border: `1px solid ${primary}30`, borderRadius: 10, padding: "2px 8px", height: 30 }}
            >
              <button
                onClick={onRemove}
                className="w-6 h-6 flex items-center justify-center rounded-lg transition"
                style={{ color: primary }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-black text-[13px] dark:text-white" style={{ color: primary }}>{qty}</span>
              <button
                onClick={onAdd}
                className="w-6 h-6 flex items-center justify-center rounded-lg transition"
                style={{ color: primary }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CAROUSEL
───────────────────────────────────────────────────────────────────────────── */
function HeroCarousel({ banners, primary }: { banners: any[]; primary: string }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const go = (n: number) => {
    setIdx(n);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % banners.length), 4500);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % banners.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const cur = banners[idx];
  const gradient = `linear-gradient(135deg, ${primary}ee 0%, ${primary}88 50%, #0a0d1a 100%)`;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ minHeight: 180 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
          style={{ minHeight: 180 }}
        >
          {cur.image ? (
            <img
              src={cur.image}
              alt={cur.title}
              className="w-full object-cover"
              style={{ minHeight: 180, maxHeight: 340 }}
            />
          ) : (
            <div className="w-full" style={{ minHeight: 200, background: gradient }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
            {cur.badge && (
              <span
                className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 w-fit border"
                style={{ backgroundColor: `${primary}28`, color: primary, borderColor: `${primary}55` }}
              >
                <Zap className="w-2.5 h-2.5" /> {cur.badge}
              </span>
            )}
            <h2 className="text-white font-black text-xl md:text-3xl leading-tight max-w-xs drop-shadow-xl">
              {cur.title}
            </h2>
            {cur.sub && (
              <p className="text-white/60 text-xs mt-1 max-w-[220px]">{cur.sub}</p>
            )}
            {cur.cta && (
              <a
                href={cur.link || "#"}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full font-black text-[11px] text-white uppercase tracking-widest w-fit shadow-xl hover:opacity-90 transition active:scale-95"
                style={{ backgroundColor: primary }}
              >
                {cur.cta} <ChevronRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/35"}`}
          />
        ))}
      </div>

      <button
        onClick={() => go((idx - 1 + banners.length) % banners.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full items-center justify-center text-white hidden md:flex transition hover:bg-black/60"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => go((idx + 1) % banners.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full items-center justify-center text-white hidden md:flex transition hover:bg-black/60"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────────────────────── */
export default function PremiumRetailStore({ store, storefront, tenantSlug }: Props) {
  const primary = storefront?.primaryColor || store?.primaryColor || "#e91e8c";
  const sym = storefront?.globalCurrency || store?.currency || "₹";
  const storeName = storefront?.companyName || store?.name || "Store";
  const logo = storefront?.brandLogo || "";

  // Data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // UI
  const [searchQ, setSearchQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "low" | "high" | "new">("default");
  const [showSort, setShowSort] = useState(false);
  const [quickView, setQuickView] = useState<any | null>(null);
  const [mobileTab, setMobileTab] = useState<"home" | "cats" | "bag" | "profile">("home");
  const [scrolled, setScrolled] = useState(false);

  // Checkout
  const [checkStep, setCheckStep] = useState<"cart" | "addr" | "pay" | "done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [payMode, setPayMode] = useState<"cod" | "online">("cod");
  const [placing, setPlacing] = useState(false);
  const [doneOrder, setDoneOrder] = useState<any>(null);

  /* fetch */
  useEffect(() => {
    fetch(`/api/ecom?tenant=${tenantSlug}`)
      .then(r => r.json())
      .then(d => {
        setProducts((d.products || []).filter((p: any) => p.isActive !== false));
        setCategories(d.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* cart helpers */
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const getQty = (id: string) => cart.find(i => i.id === id)?.qty || 0;

  const addItem = (p: any) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex
        ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: p.id, name: p.name, price: p.price || 0, image: p.image, qty: 1, compareAtPrice: p.compareAtPrice }];
    });

  const removeItem = (id: string) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (!ex) return prev;
      return ex.qty === 1 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });

  const toggleWish = (id: string) =>
    setWishlist(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  /* derived */
  const featuredIds: string[] = storefront?.featuredProductIds || [];
  const featured = products.filter(p => featuredIds.includes(p.id));
  const onSale = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
  const newArr = [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 12);

  const filtered = products
    .filter(p => !activeCat || p.categoryId === activeCat)
    .filter(p => !searchQ || p.name?.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "new") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });

  const heroBanners = [
    {
      image: storefront?.promoBannerImage || "",
      title: storefront?.promoBannerText || `Shop ${storeName}`,
      sub: "Discover premium quality",
      badge: "New Season", cta: "Shop Now", link: "#",
    },
    { image: "", title: "Up to 60% Off", sub: "Limited time flash deals", badge: "Sale", cta: "Grab Deals", link: "#" },
    { image: "", title: "Free Delivery", sub: `On all orders above ${sym}999`, badge: "Offer", cta: "Order Now", link: "#" },
  ];

  const placeOrder = async () => {
    if (!name.trim() || !phone.trim() || !addr.trim()) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug, storeId: store?.id,
          buyerName: name, buyerPhone: phone, buyerEmail: "",
          shippingAddress: addr,
          productId: cart[0]?.id || "unknown",
          amountCents: cartTotal, paymentMethod: payMode,
          itemsJson: JSON.stringify(cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price }))),
          status: "pending",
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        const bc = new BroadcastChannel("aether-live-order-processing");
        bc.postMessage({ type: "NEW_ORDER", data: data.order });
        bc.close();
        setDoneOrder(data.order);
        setCart([]);
        setCheckStep("done");
      }
    } catch (_) {}
    finally { setPlacing(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#080a10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${primary} transparent transparent transparent` }}
        />
        <p className="text-gray-400 text-xs font-medium tracking-wide">Loading {storeName}…</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#07090f] text-gray-900 dark:text-white">

      {/* ────────────────────────────────────────────────────────────────────
          HEADER — ultra premium sticky
      ──────────────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-white dark:bg-[#0b0d14] transition-all duration-200 ${
          scrolled ? "shadow-[0_1px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.5)]" : "border-b border-gray-100 dark:border-white/[0.05]"
        }`}
      >
        {/* Marquee offer strip — desktop only */}
        <div className="hidden md:flex items-center justify-center gap-8 bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-600 text-white text-[10px] font-bold tracking-widest uppercase py-1.5 px-4">
          <span>🚚 Free delivery above {sym}999</span>
          <span className="opacity-30">|</span>
          <span>✨ New collection every week</span>
          <span className="opacity-30">|</span>
          <span>🔒 100% Secure checkout</span>
          <span className="opacity-30">|</span>
          <span>↩ Easy 7-day returns</span>
        </div>

        {/* Main header row */}
        <div className="flex items-center gap-2 md:gap-4 px-3 md:px-6 h-[52px]">

          {/* Logo */}
          <a href={`/b/${tenantSlug}`} className="flex items-center gap-2 shrink-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-7 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${primary}99)` }}
                >
                  {storeName.charAt(0)}
                </div>
                <span
                  className="font-black text-[15px] tracking-tight hidden sm:block"
                  style={{ color: primary }}
                >
                  {storeName}
                </span>
              </div>
            )}
          </a>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={`Search in ${storeName}…`}
                className="w-full bg-gray-100/80 dark:bg-white/[0.07] rounded-2xl pl-10 pr-4 py-2 text-[12.5px] font-medium text-gray-800 dark:text-white placeholder-gray-400 border border-transparent focus:border-gray-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.1] focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5 ml-auto">
            {/* Mobile search */}
            <button
              onClick={() => setShowSearch(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Wishlist */}
            <button className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">
              <Heart className="w-[18px] h-[18px]" />
              {wishlist.size > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full text-[7px] font-black text-white flex items-center justify-center"
                  style={{ backgroundColor: primary }}
                >
                  {wishlist.size}
                </span>
              )}
            </button>

            {/* Bag button */}
            <button
              onClick={() => { setShowCart(true); setCheckStep("cart"); }}
              className="relative flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-xl text-white text-[11.5px] font-black tracking-wide transition shadow-lg hover:opacity-90 active:scale-95 ml-1"
              style={{ backgroundColor: primary, boxShadow: `0 3px 12px ${primary}55` }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">BAG</span>
              {cartCount > 0 && (
                <span className="bg-white rounded-full px-1.5 text-[9px] font-black leading-4" style={{ color: primary }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile expandable search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden px-3 pb-2.5"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search products…"
                  className="w-full bg-gray-100 dark:bg-white/[0.07] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition"
                  style={{ "--tw-ring-color": primary } as any}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category scroll strip */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 md:px-6 pb-2 overflow-x-auto scrollbar-none border-t border-gray-50 dark:border-white/[0.04] pt-2">
            <button
              onClick={() => setActiveCat(null)}
              className={`shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                !activeCat
                  ? "text-white border-transparent shadow-sm"
                  : "text-gray-500 dark:text-gray-400 border-gray-200/70 dark:border-white/[0.08] hover:text-gray-800 dark:hover:text-white"
              }`}
              style={!activeCat ? { backgroundColor: primary } : {}}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
                className={`shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                  activeCat === c.id
                    ? "text-white border-transparent shadow-sm"
                    : "text-gray-500 dark:text-gray-400 border-gray-200/70 dark:border-white/[0.08] hover:text-gray-800 dark:hover:text-white"
                }`}
                style={activeCat === c.id ? { backgroundColor: primary } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────────────────
          MAIN
      ──────────────────────────────────────────────────────────────────── */}
      <main
        className="max-w-7xl mx-auto px-3 md:px-6 pt-4 pb-28 md:pb-10 flex flex-col gap-7"
      >
        {/* Hero */}
        <HeroCarousel banners={heroBanners} primary={primary} />

        {/* Trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { icon: Truck, label: "Free Delivery", sub: `Above ${sym}999` },
            { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
            { icon: Shield, label: "100% Genuine", sub: "Verified products" },
            { icon: Zap, label: "Fast Dispatch", sub: "Same day" },
          ].map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: i * 0.07 }}
              whileHover={{ scale: 1.03, y: -1 }}
              className="flex items-center gap-2.5 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] rounded-2xl px-3.5 py-3 shadow-sm cursor-default"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4 + i * 0.8, ease: "easeInOut", delay: i * 0.5 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primary}18` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: primary }} />
              </motion.div>
              <div className="min-w-0">
                <div className="text-gray-800 dark:text-white font-bold text-[11.5px] leading-tight">{label}</div>
                <div className="text-gray-400 text-[10px] mt-0.5">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-[16px] text-gray-900 dark:text-white">Shop by Category</h2>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="text-[11px] font-bold flex items-center gap-0.5 opacity-80 hover:opacity-100 transition"
                style={{ color: primary }}
              >
                See All <ChevronRight className="w-3 h-3" />
              </motion.button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
              {categories.slice(0, 10).map((cat, i) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-200 ${
                    activeCat === cat.id
                      ? "border-transparent shadow-lg"
                      : "border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  }`}
                  style={activeCat === cat.id ? { backgroundColor: `${primary}18`, borderColor: `${primary}40` } : {}}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-gradient-to-br ${CAT_GRADIENTS[i % CAT_GRADIENTS.length]}`}
                  >
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      CAT_EMOJI[i % CAT_EMOJI.length]
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight line-clamp-2 text-gray-600 dark:text-gray-300 w-full">
                    {cat.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Promo Banner */}
        {storefront?.promoBannerImage && (
          <motion.a
            href={storefront.promoBannerLink || "#"}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="block rounded-2xl overflow-hidden relative shadow-xl"
          >
            <img src={storefront.promoBannerImage} alt="" className="w-full object-cover" style={{ maxHeight: 160 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent flex items-center px-6 md:px-10">
              {storefront.promoBannerText && (
                <div>
                  <p className="text-white font-black text-xl md:text-3xl drop-shadow-lg">{storefront.promoBannerText}</p>
                  <motion.span
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black text-white shadow-lg"
                    style={{ backgroundColor: primary, display: "inline-flex" }}
                  >
                    Shop Now <ChevronRight className="w-3 h-3" />
                  </motion.span>
                </div>
              )}
            </div>
          </motion.a>
        )}

        {/* Featured Picks */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: primary }} />
              <h2 className="font-black text-[16px] text-gray-900 dark:text-white">Featured Picks</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {featured.slice(0, 5).map(p => (
                <ProductCard key={p.id} p={p} sym={sym} primary={primary}
                  onAdd={() => addItem(p)} onRemove={() => removeItem(p.id)} qty={getQty(p.id)}
                  onWish={() => toggleWish(p.id)} wished={wishlist.has(p.id)} onView={() => setQuickView(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Flash Deals */}
        {onSale.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg,#fff1f3 0%,#ffe4ec 100%)", border: "1px solid #fecdd3" }}
          >
            {/* Decorative glow */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,#ff4d6d22,transparent 70%)" }} />

            <div className="flex items-center gap-2 mb-3 relative">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="flex items-center gap-1.5 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md"
                style={{ background: "linear-gradient(135deg,#ff4d6d,#c9184a)" }}
              >
                <Flame className="w-3 h-3" /> Flash Deals
              </motion.div>
              <span className="text-rose-400 text-[11px] font-semibold">Today only · Ends soon</span>
            </div>

            <AutoScroller cardW={164}>
              {onSale.slice(0, 12).map(p => (
                <div key={p.id} className="shrink-0 w-[152px] md:w-[164px]">
                  <ProductCard p={p} sym={sym} primary={primary}
                    onAdd={() => addItem(p)} onRemove={() => removeItem(p.id)} qty={getQty(p.id)}
                    onWish={() => toggleWish(p.id)} wished={wishlist.has(p.id)} onView={() => setQuickView(p)} />
                </div>
              ))}
            </AutoScroller>
          </motion.section>
        )}

        {/* New Arrivals — auto-scroll carousel */}
        {newArr.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Tag className="w-4 h-4" style={{ color: primary }} />
                </motion.div>
                <h2 className="font-black text-[16px] text-gray-900 dark:text-white">New Arrivals</h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.div>
                <span>auto scrolling</span>
              </div>
            </div>

            <AutoScroller cardW={164}>
              {newArr.map(p => (
                <div key={p.id} className="shrink-0 w-[152px] md:w-[164px]">
                  <ProductCard p={p} sym={sym} primary={primary}
                    onAdd={() => addItem(p)} onRemove={() => removeItem(p.id)} qty={getQty(p.id)}
                    onWish={() => toggleWish(p.id)} wished={wishlist.has(p.id)} onView={() => setQuickView(p)} />
                </div>
              ))}
            </AutoScroller>
          </motion.section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h2 className="font-black text-[16px] text-gray-900 dark:text-white">
              {activeCat ? (categories.find(c => c.id === activeCat)?.name || "Products") : "All Products"}
              <span className="ml-2 text-sm font-semibold text-gray-400">({filtered.length})</span>
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowSort(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-[11.5px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.1] transition shadow-sm"
              >
                <SlidersHorizontal className="w-3 h-3" />
                {sortBy === "default" ? "Sort" : sortBy === "low" ? "Price ↑" : sortBy === "high" ? "Price ↓" : "Newest"}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#111320] border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl z-20 min-w-[160px] overflow-hidden"
                  >
                    {[
                      ["default", "Relevance"],
                      ["low", "Price: Low to High"],
                      ["high", "Price: High to Low"],
                      ["new", "Newest First"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => { setSortBy(v as any); setShowSort(false); }}
                        className={`w-full px-4 py-2.5 text-left text-[11.5px] font-semibold transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                          sortBy === v ? "font-black" : "text-gray-500 dark:text-gray-400"
                        }`}
                        style={sortBy === v ? { color: primary } : {}}
                      >
                        {l}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <Package className="w-14 h-14 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-400 text-sm font-medium">No products found</p>
              <button
                onClick={() => { setSearchQ(""); setActiveCat(null); }}
                className="text-[11.5px] font-bold"
                style={{ color: primary }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} sym={sym} primary={primary}
                  onAdd={() => addItem(p)} onRemove={() => removeItem(p.id)} qty={getQty(p.id)}
                  onWish={() => toggleWish(p.id)} wished={wishlist.has(p.id)} onView={() => setQuickView(p)} />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 dark:border-white/[0.06] pt-8 mt-2">

          {/* Brand row — always visible */}
          <div className="flex items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {logo ? (
                  <img src={logo} alt={storeName} className="h-7 w-auto" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black"
                    style={{ backgroundColor: primary }}
                  >
                    {storeName.charAt(0)}
                  </div>
                )}
                <span className="font-black text-gray-900 dark:text-white text-base">{storeName}</span>
              </div>
              <p className="text-gray-400 text-[11.5px] leading-relaxed max-w-xs hidden md:block">
                {storefront?.storeDescription || "Premium quality products delivered to your door. Shop with confidence."}
              </p>
              {/* Social */}
              <div className="flex gap-1.5 mt-3">
                {["I", "F", "T", "Y"].map(s => (
                  <div
                    key={s}
                    className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer text-[10px] font-black"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns — DESKTOP ONLY */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            {[
              {
                title: "Shop",
                items: [
                  { label: "New Arrivals", href: "#new-arrivals" },
                  { label: "Trending", href: "#all-products" },
                  { label: "Sale", href: "#flash-deals" },
                  { label: "All Products", href: "#all-products" },
                ],
              },
              {
                title: "Help",
                items: [
                  { label: "Contact Us", href: `/b/${tenantSlug}/page/contact` },
                  { label: "Returns & Exchanges", href: `/b/${tenantSlug}/page/returns` },
                  { label: "Shipping Info", href: `/b/${tenantSlug}/page/shipping` },
                  { label: "FAQ", href: `/b/${tenantSlug}/page/faq` },
                ],
              },
              {
                title: "Company",
                items: [
                  { label: "About Us", href: `/b/${tenantSlug}/page/about` },
                  { label: "Privacy Policy", href: `/b/${tenantSlug}/page/privacy` },
                  { label: "Terms of Service", href: `/b/${tenantSlug}/page/terms` },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-gray-800 dark:text-white font-black text-[10.5px] uppercase tracking-widest mb-3">{col.title}</h4>
                <ul className="flex flex-col gap-2">
                  {col.items.map(item => (
                    <li key={item.label}>
                      <a href={item.href} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition text-[12px] font-medium">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment + copyright — always visible */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <span className="text-gray-400 text-[10px]">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["VISA", "MC", "UPI", "GPay", "COD"].map(m => (
                <div
                  key={m}
                  className="px-2 py-1 bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] rounded-md text-[9px] font-black text-gray-400"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </footer>
      </main>

      {/* ────────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAV — native app style
      ──────────────────────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <div className="flex items-stretch h-14">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "cats", icon: Layers, label: "Categories" },
            { id: "bag", icon: ShoppingBag, label: "Bag", badge: cartCount },
            { id: "profile", icon: User, label: "Profile" },
          ].map(tab => {
            const active = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMobileTab(tab.id as any);
                  if (tab.id === "bag") { setShowCart(true); setCheckStep("cart"); }
                }}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] relative transition-all"
              >
                <div className="relative">
                  <tab.icon
                    className="w-[20px] h-[20px]"
                    style={{ color: active ? primary : "#9ca3af" }}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[8px] font-black text-white flex items-center justify-center leading-none"
                      style={{ backgroundColor: primary }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[9px] font-bold leading-none"
                  style={{ color: active ? primary : "#9ca3af" }}
                >
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                    style={{ backgroundColor: primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ────────────────────────────────────────────────────────────────────
          CART / CHECKOUT DRAWER
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60]"
              onClick={() => { if (checkStep === "cart") setShowCart(false); }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#0c0f1a] z-[70] flex flex-col shadow-2xl border-l border-gray-100 dark:border-white/[0.06]"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.07] shrink-0">
                <div className="flex items-center gap-2.5">
                  {checkStep !== "cart" && (
                    <button
                      onClick={() => setCheckStep("cart")}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <h3 className="text-gray-900 dark:text-white font-black text-[16px]">
                    {checkStep === "cart" ? "My Bag" : checkStep === "addr" ? "Delivery" : checkStep === "pay" ? "Payment" : "Order Placed!"}
                  </h3>
                  {checkStep === "cart" && cartCount > 0 && (
                    <span className="text-gray-400 text-xs">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                  )}
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step pills */}
              {checkStep !== "done" && (
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-50 dark:border-white/[0.04] shrink-0">
                  {(["cart", "addr", "pay"] as const).map((s, i) => {
                    const steps = ["cart", "addr", "pay"];
                    const cur = steps.indexOf(checkStep);
                    const done = cur > i;
                    const active = cur === i;
                    return (
                      <div key={s} className="flex items-center gap-1.5 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                            done ? "bg-emerald-500 text-white" : ""
                          }`}
                          style={active ? { backgroundColor: primary, color: "white" } : !done ? { backgroundColor: "#e5e7eb", color: "#9ca3af" } : {}}
                        >
                          {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        {i < 2 && (
                          <div className={`flex-1 h-[2px] rounded-full transition-all ${done ? "bg-emerald-400" : "bg-gray-200 dark:bg-white/10"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {/* Cart items */}
                {checkStep === "cart" && (
                  <div className="p-4 flex flex-col gap-2.5">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center py-16 gap-4">
                        <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-gray-700" />
                        <p className="text-gray-400 text-sm font-medium">Your bag is empty</p>
                        <button onClick={() => setShowCart(false)} className="text-xs font-bold" style={{ color: primary }}>
                          Continue Shopping
                        </button>
                      </div>
                    ) : cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] rounded-2xl">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-[#1a1d28] shrink-0 flex items-center justify-center border border-gray-100 dark:border-white/10">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 dark:text-white font-semibold text-[12.5px] line-clamp-2 leading-snug">{item.name}</p>
                          <p className="font-black text-[13px] mt-1 text-gray-900 dark:text-white">{fmt(item.price, sym)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-white/[0.07] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2 py-1 shrink-0">
                          <button onClick={() => removeItem(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition rounded">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-[13px] text-gray-900 dark:text-white w-4 text-center">{item.qty}</span>
                          <button onClick={() => addItem(item)} className="w-6 h-6 flex items-center justify-center rounded transition" style={{ color: primary }}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address */}
                {checkStep === "addr" && (
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-gray-400 text-[12.5px]">Enter your delivery details</p>
                    {[
                      { label: "Full Name", val: name, set: setName, type: "text", ph: "Your name" },
                      { label: "Phone Number", val: phone, set: setPhone, type: "tel", ph: "+91 XXXXX XXXXX" },
                      { label: "Delivery Address", val: addr, set: setAddr, type: "text", ph: "Street, City, PIN code" },
                    ].map(f => (
                      <div key={f.label} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{f.label}</label>
                        <input
                          type={f.type}
                          value={f.val}
                          onChange={e => f.set(e.target.value)}
                          placeholder={f.ph}
                          className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment */}
                {checkStep === "pay" && (
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-gray-400 text-[12.5px]">Choose payment method</p>
                    {[
                      { v: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when you receive" },
                      { v: "online", label: "Online Payment", icon: "💳", desc: "UPI / Card / Net Banking" },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setPayMode(opt.v as any)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                          payMode === opt.v
                            ? "shadow-md"
                            : "border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                        }`}
                        style={payMode === opt.v ? { borderColor: `${primary}60`, backgroundColor: `${primary}12` } : {}}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex-1">
                          <div className="text-gray-900 dark:text-white font-bold text-[13px]">{opt.label}</div>
                          <div className="text-gray-400 text-[11px] mt-0.5">{opt.desc}</div>
                        </div>
                        {payMode === opt.v && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: primary }} />}
                      </button>
                    ))}
                    {/* Order summary */}
                    <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2 text-[12.5px]">
                      <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(cartTotal, sym)}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="text-emerald-500 font-bold">FREE</span></div>
                      <div className="flex justify-between text-gray-900 dark:text-white font-black border-t border-gray-100 dark:border-white/[0.07] pt-2">
                        <span>Total</span><span>{fmt(cartTotal, sym)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Done */}
                {checkStep === "done" && (
                  <div className="p-6 flex flex-col items-center text-center gap-5 py-10">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.15 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                      style={{ backgroundColor: primary }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-black text-2xl">Order Placed!</h3>
                      <p className="text-gray-400 text-xs mt-1 font-mono">#{doneOrder?.id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] rounded-2xl p-4 text-[12.5px] text-left flex flex-col gap-2">
                      <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-gray-900 dark:text-white font-bold">{name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Total</span><span className="font-black" style={{ color: primary }}>{fmt(cartTotal || 0, sym)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Payment</span><span className="text-gray-900 dark:text-white font-bold">{payMode === "cod" ? "Cash on Delivery" : "Online"}</span></div>
                    </div>
                    <button
                      onClick={() => { setShowCart(false); setCheckStep("cart"); setDoneOrder(null); }}
                      className="w-full py-3.5 rounded-2xl text-white font-black text-[13px]"
                      style={{ backgroundColor: primary }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>

              {/* CTA footer */}
              {cart.length > 0 && checkStep !== "done" && (
                <div className="p-4 border-t border-gray-100 dark:border-white/[0.07] shrink-0 bg-white dark:bg-[#0c0f1a]">
                  <div className="flex justify-between items-baseline mb-3 px-1">
                    <span className="text-gray-400 text-[12px] font-medium">Total</span>
                    <span className="text-gray-900 dark:text-white font-black text-xl">{fmt(cartTotal, sym)}</span>
                  </div>
                  <button
                    disabled={placing}
                    onClick={() => {
                      if (checkStep === "cart") setCheckStep("addr");
                      else if (checkStep === "addr") { if (name && phone && addr) setCheckStep("pay"); }
                      else if (checkStep === "pay") placeOrder();
                    }}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-[12.5px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                    style={{ backgroundColor: primary, boxShadow: `0 8px 24px ${primary}50` }}
                  >
                    {placing ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Placing…</>
                    ) : checkStep === "cart" ? (
                      <><MapPin className="w-4 h-4" /> Add Delivery Details</>
                    ) : checkStep === "addr" ? (
                      <><CreditCard className="w-4 h-4" /> Choose Payment</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Place Order</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────────────────
          QUICK VIEW MODAL
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[80]"
              onClick={() => setQuickView(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white dark:bg-[#0f1220] rounded-t-3xl md:rounded-3xl z-[90] overflow-hidden shadow-2xl"
            >
              {/* Image */}
              <div className="relative bg-gray-50 dark:bg-[#161820]" style={{ aspectRatio: "1/1" }}>
                {quickView.image ? (
                  <img src={quickView.image} alt={quickView.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-gray-300 dark:text-gray-700" /></div>
                )}
                {pct(quickView.price, quickView.compareAtPrice) > 0 && (
                  <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pct(quickView.price, quickView.compareAtPrice)}% OFF
                  </div>
                )}
                <button
                  onClick={() => setQuickView(null)}
                  className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWish(quickView.id)}
                  className={`absolute top-3 right-14 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                    wishlist.has(quickView.id) ? "bg-rose-500 text-white" : "bg-black/50 text-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlist.has(quickView.id) ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-3">
                <h3 className="text-gray-900 dark:text-white font-black text-lg leading-snug">{quickView.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    {(3.4 + (stableHash(quickView.id) % 16) / 10).toFixed(1)} <Star className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span className="text-gray-400 text-[10px]">({50 + stableHash(quickView.id) % 700} ratings)</span>
                </div>
                {quickView.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-[12.5px] leading-relaxed">{quickView.description}</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-900 dark:text-white font-black text-2xl">{fmt(quickView.price || 0, sym)}</span>
                  {quickView.compareAtPrice && quickView.compareAtPrice > quickView.price && (
                    <span className="text-gray-400 text-sm line-through">{fmt(quickView.compareAtPrice, sym)}</span>
                  )}
                </div>
                {getQty(quickView.id) === 0 ? (
                  <button
                    onClick={() => { addItem(quickView); setQuickView(null); setShowCart(true); }}
                    className="w-full py-3.5 rounded-2xl text-white font-black text-[12.5px] flex items-center justify-center gap-2 active:scale-95 transition shadow-xl"
                    style={{ backgroundColor: primary, boxShadow: `0 6px 20px ${primary}50` }}
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-3">
                    <button onClick={() => removeItem(quickView.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition"><Minus className="w-4 h-4" /></button>
                    <span className="font-black text-gray-900 dark:text-white text-xl">{getQty(quickView.id)}</span>
                    <button onClick={() => addItem(quickView)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition" style={{ color: primary }}><Plus className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
