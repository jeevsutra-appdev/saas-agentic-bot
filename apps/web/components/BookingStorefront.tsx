"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Calendar, Clock, Video, MapPin, Star, Check, X, Zap, Globe,
  ArrowRight, Shield, Users, ChevronRight, Sparkles, Award, Heart
} from "lucide-react";
import dynamic from "next/dynamic";

const BookingCard = dynamic(() => import("@/components/BookingCard"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-3xl" style={{ background: "rgba(255,255,255,0.05)" }} />
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BSService {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  offerPrice?: number;
  currency?: string;
  consultationType: "online" | "in_person" | "both";
  isActive: boolean;
}

export interface StorefrontConfig {
  theme?: string;
  brandLogo?: string;
  brandLogoHeight?: number;
  businessName?: string;
  businessTagline?: string;
  businessBio?: string;
  businessAvatar?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  heroBadge?: string;
  colors?: { primary?: string; accent?: string };
  sections?: {
    hero?: boolean;
    services?: boolean;
    howItWorks?: boolean;
    about?: boolean;
    cta?: boolean;
    footer?: boolean;
  };
}

interface Theme {
  id: string; name: string;
  preview: [string, string, string];
  bg: string; cardBg: string; cardBorder: string;
  primary: string; primaryAlpha: string; accent: string;
  text: string; subtext: string; muted: string;
  navBg: string; sectionAlt: string; divider: string;
  heroBg: string; orb1: string; orb2: string;
  badge: { bg: string; border: string; text: string };
  btnText: string; isDark: boolean;
  gradCard: string; glowColor: string;
}

// ─── 5 Themes ─────────────────────────────────────────────────────────────────

export const BOOKING_THEMES: Record<string, Theme> = {
  midnight: {
    id: "midnight", name: "Midnight",
    preview: ["#6366f1", "#8b5cf6", "#060810"],
    bg: "#07091a", cardBg: "rgba(255,255,255,0.04)", cardBorder: "rgba(255,255,255,0.08)",
    primary: "#6366f1", primaryAlpha: "rgba(99,102,241,0.12)", accent: "#8b5cf6",
    text: "#ffffff", subtext: "rgba(255,255,255,0.55)", muted: "rgba(255,255,255,0.22)",
    navBg: "rgba(7,9,26,0.85)", sectionAlt: "#090b1e", divider: "rgba(255,255,255,0.06)",
    heroBg: "#07091a",
    orb1: "rgba(99,102,241,0.4)", orb2: "rgba(139,92,246,0.25)",
    badge: { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)", text: "#a5b4fc" },
    btnText: "#fff", isDark: true,
    gradCard: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.08) 100%)",
    glowColor: "rgba(99,102,241,0.5)"
  },
  aurora: {
    id: "aurora", name: "Aurora",
    preview: ["#06b6d4", "#7c3aed", "#040c14"],
    bg: "#040c16", cardBg: "rgba(255,255,255,0.04)", cardBorder: "rgba(6,182,212,0.12)",
    primary: "#06b6d4", primaryAlpha: "rgba(6,182,212,0.12)", accent: "#7c3aed",
    text: "#ffffff", subtext: "rgba(255,255,255,0.55)", muted: "rgba(255,255,255,0.22)",
    navBg: "rgba(4,12,22,0.85)", sectionAlt: "#060f1e", divider: "rgba(6,182,212,0.1)",
    heroBg: "#040c16",
    orb1: "rgba(6,182,212,0.35)", orb2: "rgba(124,58,237,0.3)",
    badge: { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.4)", text: "#67e8f9" },
    btnText: "#fff", isDark: true,
    gradCard: "linear-gradient(135deg,rgba(6,182,212,0.18) 0%,rgba(124,58,237,0.08) 100%)",
    glowColor: "rgba(6,182,212,0.5)"
  },
  zen: {
    id: "zen", name: "Zen",
    preview: ["#059669", "#0891b2", "#f0fdf4"],
    bg: "#f0fdf4", cardBg: "#ffffff", cardBorder: "rgba(5,150,105,0.12)",
    primary: "#059669", primaryAlpha: "rgba(5,150,105,0.1)", accent: "#0891b2",
    text: "#0f2417", subtext: "#4b7a5e", muted: "#9ca3af",
    navBg: "rgba(240,253,244,0.92)", sectionAlt: "#ecfdf5", divider: "rgba(5,150,105,0.1)",
    heroBg: "#f0fdf4",
    orb1: "rgba(5,150,105,0.2)", orb2: "rgba(8,145,178,0.15)",
    badge: { bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.3)", text: "#065f46" },
    btnText: "#fff", isDark: false,
    gradCard: "linear-gradient(135deg,rgba(5,150,105,0.12) 0%,rgba(8,145,178,0.06) 100%)",
    glowColor: "rgba(5,150,105,0.4)"
  },
  royal: {
    id: "royal", name: "Royal",
    preview: ["#f59e0b", "#d97706", "#050814"],
    bg: "#060818", cardBg: "rgba(255,255,255,0.04)", cardBorder: "rgba(245,158,11,0.14)",
    primary: "#f59e0b", primaryAlpha: "rgba(245,158,11,0.12)", accent: "#d97706",
    text: "#ffffff", subtext: "rgba(255,255,255,0.55)", muted: "rgba(255,255,255,0.22)",
    navBg: "rgba(6,8,24,0.88)", sectionAlt: "#08091e", divider: "rgba(245,158,11,0.1)",
    heroBg: "#060818",
    orb1: "rgba(245,158,11,0.28)", orb2: "rgba(217,119,6,0.2)",
    badge: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", text: "#fcd34d" },
    btnText: "#0a0a0f", isDark: true,
    gradCard: "linear-gradient(135deg,rgba(245,158,11,0.18) 0%,rgba(217,119,6,0.08) 100%)",
    glowColor: "rgba(245,158,11,0.5)"
  },
  sakura: {
    id: "sakura", name: "Sakura",
    preview: ["#f43f5e", "#ec4899", "#0d0608"],
    bg: "#0e0609", cardBg: "rgba(255,255,255,0.04)", cardBorder: "rgba(244,63,94,0.12)",
    primary: "#f43f5e", primaryAlpha: "rgba(244,63,94,0.12)", accent: "#ec4899",
    text: "#ffffff", subtext: "rgba(255,255,255,0.55)", muted: "rgba(255,255,255,0.22)",
    navBg: "rgba(14,6,9,0.88)", sectionAlt: "#120610", divider: "rgba(244,63,94,0.08)",
    heroBg: "#0e0609",
    orb1: "rgba(244,63,94,0.38)", orb2: "rgba(236,72,153,0.25)",
    badge: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.4)", text: "#fda4af" },
    btnText: "#fff", isDark: true,
    gradCard: "linear-gradient(135deg,rgba(244,63,94,0.18) 0%,rgba(236,72,153,0.08) 100%)",
    glowColor: "rgba(244,63,94,0.5)"
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function effectivePrice(svc: BSService) {
  return svc.offerPrice != null && svc.offerPrice > 0 && svc.offerPrice < svc.price ? svc.offerPrice : svc.price;
}

// ─── Service Card — Native App Style ─────────────────────────────────────────

function ServiceCard({ svc, t, onBook, index }: { svc: BSService; t: Theme; onBook: (id: string) => void; index: number }) {
  const hasOffer = svc.offerPrice != null && svc.offerPrice > 0 && svc.offerPrice < svc.price;
  const discount = hasOffer ? Math.round(((svc.price - svc.offerPrice!) / svc.price) * 100) : 0;
  const typeIcon = svc.consultationType === "online" ? Video : svc.consultationType === "in_person" ? MapPin : Globe;
  const TypeIcon = typeIcon;
  const typeLabel = svc.consultationType === "online" ? "Online" : svc.consultationType === "in_person" ? "In-Person" : "Flexible";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -6, scale: 1.015 }}
      style={{ background: t.gradCard, borderColor: t.cardBorder }}
      className="relative rounded-[24px] border overflow-hidden flex flex-col group cursor-default select-none"
    >
      {/* Glossy top shine */}
      <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg,transparent 0%,${t.primary}80 50%,transparent 100%)` }} />
      {/* Subtle inner glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"
        style={{ boxShadow: `inset 0 0 60px ${t.glowColor}` }} />

      {/* Header strip */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          {/* Type pill */}
          <div style={{ background: t.primaryAlpha, borderColor: t.badge.border, color: t.badge.text }}
            className="flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
            <TypeIcon className="w-2.5 h-2.5" />{typeLabel}
          </div>
          {/* Duration */}
          <div style={{ color: t.muted }} className="flex items-center gap-1 text-[10px] font-semibold">
            <Clock className="w-3 h-3" />{svc.durationMinutes}m
          </div>
        </div>

        {/* Offer badge */}
        {hasOffer && (
          <div className="absolute top-3 right-[52px]">
            <div style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText }}
              className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {discount}% OFF
            </div>
          </div>
        )}

        <h3 style={{ color: t.text }} className="text-[16px] font-black tracking-tight leading-tight mb-1.5">{svc.name}</h3>
        {svc.description && (
          <p style={{ color: t.subtext }} className="text-[12px] leading-relaxed line-clamp-2 mb-4">{svc.description}</p>
        )}
      </div>

      {/* Price block */}
      <div className="px-5 pb-4 flex-1 flex flex-col justify-end">
        <div className="flex items-baseline gap-2 mb-5">
          {hasOffer ? (
            <div className="flex flex-col gap-0.5">
              <span style={{ color: t.muted }} className="text-[11px] line-through">{formatPrice(svc.price, svc.currency)}</span>
              <span style={{ color: t.primary }} className="text-[28px] font-black leading-none">{formatPrice(svc.offerPrice!, svc.currency)}</span>
            </div>
          ) : (
            <span style={{ color: t.primary }} className="text-[28px] font-black leading-none">{formatPrice(svc.price, svc.currency)}</span>
          )}
        </div>

        {/* Book button — full width gradient */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onBook(svc.id)}
          style={{
            background: `linear-gradient(135deg,${t.primary},${t.accent})`,
            color: t.btnText,
            boxShadow: `0 8px 24px ${t.glowColor}`
          }}
          className="w-full h-12 rounded-[14px] font-black text-[13px] flex items-center justify-center gap-2 transition-all"
        >
          <Calendar className="w-4 h-4" />Book Now
          <ChevronRight className="w-4 h-4 opacity-60" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({ tenantSlug, serviceId, onClose }: { tenantSlug: string; serviceId: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Mobile: full bottom sheet | Desktop: centered card */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        className="sm:hidden w-full overflow-hidden rounded-t-[28px]"
        style={{ maxHeight: "94vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1 bg-[#0c0e24]">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>
        <BookingCard tenantSlug={tenantSlug} serviceId={serviceId} onClose={onClose} />
      </motion.div>

      <motion.div
        initial={{ y: 32, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="hidden sm:block w-full max-w-md rounded-[28px] overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <BookingCard tenantSlug={tenantSlug} serviceId={serviceId} onClose={onClose} />
      </motion.div>
    </motion.div>
  );
}

// ─── Announcement Banner ──────────────────────────────────────────────────────

function AnnouncementBanner({ t, config, onBook }: { t: Theme; config: StorefrontConfig; onBook: () => void }) {
  const msg = config.heroBadge || "✦ Book your appointment today — instant confirmation";
  return (
    <div style={{ background: `linear-gradient(90deg,${t.primary},${t.accent},${t.primary})`, backgroundSize: "200% 100%" }}
      className="relative overflow-hidden text-center py-2.5 px-4 cursor-pointer group"
      onClick={onBook}>
      <motion.div
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
        style={{ background: `linear-gradient(90deg,${t.primary}80,${t.accent}80,${t.primary}80)`, backgroundSize: "200% 100%" }}
      />
      <p className="relative text-[12px] font-black tracking-wide flex items-center justify-center gap-2"
        style={{ color: t.btnText }}>
        {msg}
        <span className="inline-flex items-center gap-1 underline underline-offset-2 group-hover:gap-2 transition-all">
          Book Now <ArrowRight className="w-3 h-3" />
        </span>
      </p>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function BookingNav({ t, businessName, brandLogo, brandLogoHeight, onBook, scrolled }: {
  t: Theme; businessName: string; brandLogo?: string; brandLogoHeight?: number;
  onBook: () => void; scrolled: boolean;
}) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? t.navBg : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none",
        borderBottom: scrolled ? `1px solid ${t.divider}` : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {brandLogo ? (
            <img loading="lazy" src={brandLogo} alt={businessName}
              className="object-contain shrink-0 rounded-xl"
              style={{ height: brandLogoHeight || 36, width: "auto", maxWidth: 120 }} />
          ) : (
            <div style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, boxShadow: `0 0 16px ${t.glowColor}` }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          )}
          <span style={{ color: t.text }} className="font-black text-[15px] tracking-tight truncate max-w-[140px] sm:max-w-none">
            {businessName}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {["services","how-it-works","about"].map(id => (
            <a key={id} href={`#${id}`}
              onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}
              style={{ color: t.subtext }}
              className="text-[13px] font-semibold hover:opacity-100 transition-opacity capitalize">
              {id.replace(/-/g, " ")}
            </a>
          ))}
        </nav>

        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={onBook}
          style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText, boxShadow: `0 4px 16px ${t.glowColor}` }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[13px] shadow-lg"
        >
          <Zap className="w-3.5 h-3.5" />Book Now
        </motion.button>
      </div>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ t, config, onBook, serviceCount }: { t: Theme; config: StorefrontConfig; onBook: () => void; serviceCount: number }) {
  const title = config.heroTitle || config.businessName || "Book Your Appointment";
  const subtitle = config.heroSubtitle || config.businessTagline || "Choose a service, pick your time, and get confirmed instantly.";
  const cta = config.heroCta || "Book a Session";
  const badge = config.heroBadge || "✦ Instant Confirmation";

  // Split title for gradient coloring on last word
  const words = title.split(" ");
  const lastWord = words.pop();
  const firstWords = words.join(" ");

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-24"
      style={{ background: t.heroBg }}>
      {/* Animated mesh gradient orbs */}
      <motion.div
        animate={{ x: [0,40,0], y: [0,-30,0], scale: [1,1.15,1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${t.orb1} 0%,transparent 65%)` }}
      />
      <motion.div
        animate={{ x: [0,-30,0], y: [0,30,0], scale: [1,1.2,1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${t.orb2} 0%,transparent 65%)` }}
      />
      <motion.div
        animate={{ x: [0,20,-20,0], y: [0,20,0], scale: [1,1.05,1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,${t.orb1} 0%,transparent 70%)`, opacity: 0.4 }}
      />

      {/* Theme-specific decorations */}
      {t.id === "royal" && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-5xl opacity-10 pointer-events-none select-none">♛</div>
      )}
      {t.id === "sakura" && [1,2,3,4].map(i => (
        <motion.div key={i} className="absolute text-2xl pointer-events-none select-none opacity-15"
          style={{ top: `${10+i*18}%`, left: `${8+i*20}%` }}
          animate={{ y:[0,-16,0], rotate:[0,12,-12,0], opacity:[0.08,0.2,0.08] }}
          transition={{ duration: 5+i, repeat: Infinity, delay: i*0.9 }}>🌸</motion.div>
      ))}

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-24 w-full">
        {/* Trust badge */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="flex justify-center mb-6">
          <div style={{ background: t.badge.bg, borderColor: t.badge.border, color: t.badge.text }}
            className="inline-flex items-center gap-2 border rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />{badge}
          </div>
        </motion.div>

        {/* Big title — gradient last word */}
        <motion.h1
          initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2, type:"spring", stiffness:180, damping:22 }}
          className="text-center font-black tracking-tight leading-[1.05] mb-6"
          style={{ color: t.text, fontSize: "clamp(36px,7vw,80px)" }}
        >
          {firstWords && <>{firstWords} </>}
          <span style={{ color: t.primary }}>{lastWord}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ color: t.subtext }}
          className="text-center text-[16px] sm:text-[18px] leading-relaxed mb-10 max-w-xl mx-auto"
        >
          {subtitle}
        </motion.p>

        {/* CTA row */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 20px 60px ${t.glowColor}` }}
            whileTap={{ scale: 0.97 }}
            onClick={onBook}
            style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText, boxShadow: `0 12px 40px ${t.glowColor}` }}
            className="px-8 py-4 rounded-2xl font-black text-[15px] flex items-center gap-3 shadow-2xl"
          >
            <Calendar className="w-5 h-5" />{cta}<ArrowRight className="w-4 h-4" />
          </motion.button>
          <a href="#services"
            onClick={e => { e.preventDefault(); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}
            style={{ color: t.subtext, borderColor: t.cardBorder, background: t.cardBg }}
            className="px-8 py-4 rounded-2xl font-bold text-[15px] flex items-center gap-2 border hover:opacity-80 transition-opacity backdrop-blur-md">
            View Services<ChevronRight className="w-4 h-4 opacity-50" />
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            { label:"Services", value: String(serviceCount || "—") },
            { label:"Instant Confirm", icon: Zap },
            { label:"Secure Booking", icon: Shield },
            { label:"Easy Reschedule", icon: Calendar },
          ].map((item, i) => (
            <div key={i} style={{ color: t.muted }} className="flex items-center gap-2 text-[12px] font-semibold">
              {"icon" in item && item.icon ? <item.icon className="w-3.5 h-3.5" style={{ color: t.primary }} /> : (
                <span style={{ color: t.primary }} className="font-black text-[18px] leading-none">{item.value}</span>
              )}
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div animate={{ y:[0,10,0] }} transition={{ duration:2, repeat:Infinity }}
          style={{ borderColor: t.muted }} className="w-5 h-9 rounded-full border-2 flex items-start justify-center p-1">
          <div style={{ background: t.primary }} className="w-1 h-2.5 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────

function ServicesSection({ t, services, onBook }: { t: Theme; services: BSService[]; onBook: (id: string) => void }) {
  const [filter, setFilter] = useState<"all" | "online" | "in_person">("all");
  const filtered = services.filter(s =>
    filter === "all" ||
    s.consultationType === filter ||
    (s.consultationType === "both")
  );

  const tabs = [
    { key: "all", label: "All", count: services.length },
    { key: "online", label: "Online", count: services.filter(s => s.consultationType === "online" || s.consultationType === "both").length },
    { key: "in_person", label: "In-Person", count: services.filter(s => s.consultationType === "in_person" || s.consultationType === "both").length },
  ] as const;

  return (
    <section id="services" className="py-20 sm:py-28 relative" style={{ background: t.bg }}>
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: `radial-gradient(${t.divider} 1.5px, transparent 1.5px)`, backgroundSize: "28px 28px" }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative">
        {/* Section header */}
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="text-center mb-12">
          <div style={{ color: t.primary, background: t.badge.bg, borderColor: t.badge.border }}
            className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-4">
            <Star className="w-3 h-3" />Our Services
          </div>
          <h2 style={{ color: t.text }} className="text-[32px] sm:text-[44px] font-black tracking-tight mb-3">
            Choose Your Service
          </h2>
          <p style={{ color: t.subtext }} className="text-[15px] max-w-md mx-auto">Select the consultation type that works best for you</p>
        </motion.div>

        {/* Filter tabs — pill style */}
        <div className="flex justify-center gap-2 mb-10">
          {tabs.map(tab => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(tab.key as any)}
              style={filter === tab.key
                ? { background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText, boxShadow: `0 4px 16px ${t.glowColor}` }
                : { background: t.cardBg, color: t.subtext, borderColor: t.cardBorder }
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-transparent text-[12px] font-black transition-all"
            >
              {tab.label}
              <span className="text-[10px] opacity-70 font-black">{tab.count}</span>
            </motion.button>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((svc, i) => (
              <motion.div key={svc.id} layout
                initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:0.94 }} transition={{ delay: i*0.04 }}>
                <ServiceCard svc={svc} t={t} onBook={onBook} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p style={{ color: t.muted }} className="text-center py-16 text-[14px]">No services in this category yet.</p>
        )}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks({ t }: { t: Theme }) {
  const steps = [
    { num: "01", icon: Star, title: "Choose a Service", desc: "Browse our services and pick the consultation type that fits your needs." },
    { num: "02", icon: Calendar, title: "Pick Your Time", desc: "Select an available date and time slot from the real-time calendar." },
    { num: "03", icon: Check, title: "Get Confirmed", desc: "Receive instant confirmation with calendar invite and Zoom link via email." },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative overflow-hidden" style={{ background: t.sectionAlt }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <div style={{ color: t.primary, background: t.badge.bg, borderColor: t.badge.border }}
            className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" />Simple Process
          </div>
          <h2 style={{ color: t.text }} className="text-[32px] sm:text-[44px] font-black tracking-tight mb-3">How It Works</h2>
          <p style={{ color: t.subtext }} className="text-[15px] max-w-md mx-auto">Book your appointment in 3 simple steps</p>
        </motion.div>

        {/* Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i*0.12, type:"spring", stiffness:200, damping:20 }}
                whileHover={{ y:-4 }}
                style={{ background: t.gradCard, borderColor: t.cardBorder }}
                className="relative rounded-[22px] border p-6 flex flex-col overflow-hidden"
              >
                {/* Big step number watermark */}
                <div className="absolute top-3 right-4 font-black text-[48px] leading-none pointer-events-none select-none"
                  style={{ color: t.primary, opacity: 0.08 }}>{step.num}</div>

                {/* Icon */}
                <div style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, boxShadow: `0 8px 24px ${t.glowColor}` }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 style={{ color: t.text }} className="text-[17px] font-black mb-2">{step.title}</h3>
                <p style={{ color: t.subtext }} className="text-[13px] leading-relaxed">{step.desc}</p>

                {/* Connector arrow (not on last) */}
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: t.sectionAlt }}>
                    <ChevronRight style={{ color: t.primary }} className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection({ t, config }: { t: Theme; config: StorefrontConfig }) {
  const bio = config.businessBio || "Welcome! I'm a dedicated professional with years of experience helping clients achieve their goals. Every session is personalized to your unique needs — let's work together toward meaningful results.";
  const name = config.businessName || "Your Practice";

  return (
    <section id="about" className="py-20 sm:py-28" style={{ background: t.bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ background: t.gradCard, borderColor: t.cardBorder }}
          className="rounded-[28px] border overflow-hidden relative"
        >
          {/* Top gradient bar */}
          <div style={{ background: `linear-gradient(90deg,${t.primary},${t.accent})` }} className="h-1 w-full" />

          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              <motion.div
                whileHover={{ scale: 1.04, rotate: 2 }}
                style={{ border: `3px solid ${t.primary}`, boxShadow: `0 0 40px ${t.glowColor}` }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden"
              >
                {config.businessAvatar ? (
                  <img loading="lazy" src={config.businessAvatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div style={{ background: `linear-gradient(135deg,${t.primary}30,${t.accent}20)` }}
                    className="w-full h-full flex items-center justify-center text-5xl">🌟</div>
                )}
              </motion.div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div style={{ color: t.primary, background: t.badge.bg, borderColor: t.badge.border }}
                className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-4">
                <Users className="w-3 h-3" />About
              </div>
              <h2 style={{ color: t.text }} className="text-[26px] sm:text-[34px] font-black tracking-tight mb-4">{name}</h2>
              <p style={{ color: t.subtext }} className="text-[14px] sm:text-[15px] leading-[1.8] mb-6">{bio}</p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[{ icon: Award, label: "Certified Professional" }, { icon: Heart, label: "Client-Focused" }, { icon: Shield, label: "Confidential" }].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ background: t.primaryAlpha, borderColor: t.badge.border, color: t.badge.text }}
                    className="flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-bold">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner({ t, config, onBook }: { t: Theme; config: StorefrontConfig; onBook: () => void }) {
  const cta = config.heroCta || "Book Your Session Now";
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" style={{ background: t.sectionAlt }}>
      <div style={{ background: `radial-gradient(ellipse at center,${t.orb1} 0%,transparent 65%)` }}
        className="absolute inset-0 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center relative">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}>
          <h2 style={{ color: t.text }} className="text-[30px] sm:text-[44px] font-black tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p style={{ color: t.subtext }} className="text-[15px] mb-10 max-w-md mx-auto leading-relaxed">
            Join hundreds of clients who have transformed their lives. Book your first session today.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 24px 60px ${t.glowColor}` }}
            whileTap={{ scale: 0.97 }}
            onClick={onBook}
            style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText, boxShadow: `0 16px 48px ${t.glowColor}` }}
            className="px-10 py-4 rounded-2xl font-black text-[16px] inline-flex items-center gap-3 shadow-2xl mb-6"
          >
            <Calendar className="w-5 h-5" />{cta}<ArrowRight className="w-4 h-4" />
          </motion.button>

          <p style={{ color: t.muted }} className="text-[12px] flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" />No payment until confirmed</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" />Free cancellation</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3" />Instant confirmation</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ t, config, tenantSlug }: { t: Theme; config: StorefrontConfig; tenantSlug: string }) {
  const logoH = config.brandLogoHeight || 28;
  return (
    <footer style={{ background: t.bg, borderTop: `1px solid ${t.divider}` }} className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {config.brandLogo ? (
            <img loading="lazy" src={config.brandLogo} alt={config.businessName || tenantSlug}
              className="object-contain rounded-lg"
              style={{ height: logoH, width: "auto", maxWidth: 80 }} />
          ) : (
            <div style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})` }} className="w-6 h-6 rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
          )}
          <span style={{ color: t.text }} className="font-black text-[13px]">{config.businessName || tenantSlug}</span>
        </div>
        <p style={{ color: t.muted }} className="text-[11px] text-center">
          © {new Date().getFullYear()} {config.businessName || tenantSlug} · Powered by{" "}
          <span style={{ color: t.primary }} className="font-bold">Aether AI</span>
        </p>
        <div style={{ color: t.muted }} className="flex items-center gap-4 text-[11px]">
          <span>Secure &amp; Private</span>
          <span style={{ background: t.divider }} className="w-px h-3" />
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Mobile Sticky CTA ────────────────────────────────────────────────────────

function MobileBookCTA({ t, onBook, show }: { t: Theme; onBook: () => void; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom,16px)" }}
        >
          <div style={{ background: t.navBg, backdropFilter: "blur(24px)", borderTop: `1px solid ${t.divider}` }}
            className="px-4 pt-3 pb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBook}
              style={{
                background: `linear-gradient(135deg,${t.primary},${t.accent})`,
                color: t.btnText,
                boxShadow: `0 8px 28px ${t.glowColor}`
              }}
              className="w-full h-14 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3"
            >
              <Calendar className="w-5 h-5" />Book Appointment
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Theme Switcher ───────────────────────────────────────────────────────────

function ThemeBar({ current, onSwitch, t }: { current: string; onSwitch: (id: string) => void; t: Theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.9, y:8 }} animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.9, y:8 }} transition={{ type:"spring", stiffness:400, damping:30 }}
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, backdropFilter: "blur(24px)" }}
            className="p-3 rounded-2xl shadow-2xl min-w-[180px]"
          >
            <p style={{ color: t.muted }} className="text-[9px] font-black uppercase tracking-widest mb-2.5 px-1">Choose Theme</p>
            <div className="space-y-1">
              {Object.values(BOOKING_THEMES).map(theme => (
                <button key={theme.id}
                  onClick={() => { onSwitch(theme.id); setOpen(false); }}
                  style={{ background: current === theme.id ? t.primaryAlpha : "transparent", color: t.text }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-[12px] font-bold hover:opacity-80 transition-opacity">
                  <div className="flex gap-1">
                    {theme.preview.map((c, i) => <div key={i} style={{ background: c }} className="w-3 h-3 rounded-full" />)}
                  </div>
                  {theme.name}
                  {current === theme.id && <Check className="w-3 h-3 ml-auto" style={{ color: t.primary }} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.08, rotate: 15 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={{ background: `linear-gradient(135deg,${t.primary},${t.accent})`, color: t.btnText, boxShadow: `0 8px 24px ${t.glowColor}` }}
        className="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-lg select-none"
      >🎨</motion.button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BookingStorefrontProps {
  tenantSlug: string;
  services: BSService[];
  config: StorefrontConfig | null;
  adminPreview?: boolean;
}

export default function BookingStorefront({ tenantSlug, services, config: initialConfig }: BookingStorefrontProps) {
  const cfg = initialConfig || {};
  const [activeThemeId, setActiveThemeId] = useState(cfg.theme || "midnight");
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => { setMounted(true); }, []);
  useMotionValueEvent(scrollY, "change", v => setScrolled(v > 80));

  const baseTheme = BOOKING_THEMES[activeThemeId] || BOOKING_THEMES.midnight;
  const t: Theme = {
    ...baseTheme,
    primary: cfg.colors?.primary || baseTheme.primary,
    accent: cfg.colors?.accent || baseTheme.accent,
    primaryAlpha: cfg.colors?.primary ? cfg.colors.primary + "18" : baseTheme.primaryAlpha,
    glowColor: cfg.colors?.primary ? cfg.colors.primary + "60" : baseTheme.glowColor,
  };

  const sections = cfg.sections || {};
  const show = (key: keyof typeof sections) => sections[key] !== false;

  const openBooking = useCallback((serviceId?: string) => {
    setBookingServiceId(serviceId || services[0]?.id || "");
  }, [services]);

  const closeBooking = useCallback(() => setBookingServiceId(null), []);

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif" }}
      className="min-h-screen">
      {/* Announcement banner */}
      <AnnouncementBanner t={t} config={cfg} onBook={() => openBooking()} />
      <BookingNav t={t} businessName={cfg.businessName || tenantSlug} brandLogo={cfg.brandLogo} brandLogoHeight={cfg.brandLogoHeight} onBook={() => openBooking()} scrolled={scrolled} />

      {show("hero") && <Hero t={t} config={cfg} onBook={() => openBooking()} serviceCount={services.length} />}
      {show("services") && services.length > 0 && <ServicesSection t={t} services={services} onBook={openBooking} />}
      {show("howItWorks") && <HowItWorks t={t} />}
      {show("about") && <AboutSection t={t} config={cfg} />}
      {show("cta") && <CTABanner t={t} config={cfg} onBook={() => openBooking()} />}
      {show("footer") && <Footer t={t} config={cfg} tenantSlug={tenantSlug} />}

      {/* Mobile sticky bottom CTA — with safe area */}
      {mounted && <MobileBookCTA t={t} onBook={() => openBooking()} show={scrolled} />}

      {/* Theme switcher — client-only to avoid hydration mismatch */}
      {mounted && <ThemeBar current={activeThemeId} onSwitch={setActiveThemeId} t={t} />}

      {/* Booking modal */}
      <AnimatePresence>
        {bookingServiceId && (
          <BookingModal tenantSlug={tenantSlug} serviceId={bookingServiceId} onClose={closeBooking} />
        )}
      </AnimatePresence>
    </div>
  );
}
