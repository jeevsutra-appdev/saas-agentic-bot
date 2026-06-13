"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, Mail, Phone, Check, ChevronLeft,
  Video, MapPin, CreditCard, Loader2, Star, Zap, X, Download,
  ExternalLink, Globe, ArrowRight, Shield
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingService {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  offerPrice?: number;
  currency?: string;
  image?: string;
  consultationType: "online" | "in_person" | "both";
  maxAdvanceBookingDays?: number;
  bufferMinutes?: number;
}

function effectivePrice(svc: BookingService): number {
  return svc.offerPrice != null && svc.offerPrice > 0 && svc.offerPrice < svc.price
    ? svc.offerPrice : svc.price;
}

interface TimeSlot { time: string; available: boolean; }
type BookingStep = "service" | "date" | "slot" | "contact" | "payment" | "confirmed";

interface BookingCardProps {
  tenantSlug: string;
  serviceId?: string;
  onClose?: () => void;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}

// ─── Step Pill Indicator ──────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 6, opacity: i <= current ? 1 : 0.25 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="h-1.5 rounded-full"
          style={{ background: i <= current ? "#6366f1" : "rgba(255,255,255,0.15)" }}
        />
      ))}
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls = "w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all";
const iconInputCls = "w-full bg-white/[0.06] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all";

// ─── Main BookingCard ─────────────────────────────────────────────────────────

export default function BookingCard({ tenantSlug, serviceId: initialServiceId, onClose }: BookingCardProps) {
  const [step, setStep] = useState<BookingStep>(initialServiceId ? "date" : "service");
  const [services, setServices] = useState<BookingService[]>([]);
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/booking/services?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const active = data.services.filter((s: any) => s.isActive);
          setServices(active);
          if (initialServiceId) {
            const svc = active.find((s: any) => s.id === initialServiceId);
            if (svc) setSelectedService(svc);
          }
        }
      }).catch(() => {});
  }, [tenantSlug, initialServiceId]);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    const dateStr = isoDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setLoadingSlots(true); setSlots([]);
    fetch(`/api/booking/slots?tenantSlug=${tenantSlug}&serviceId=${selectedService.id}&date=${dateStr}`)
      .then(r => r.json())
      .then(data => { if (data.success) setSlots(data.slots || []); })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, tenantSlug]);

  const today = new Date(); today.setHours(0,0,0,0);
  const maxAdvance = selectedService?.maxAdvanceBookingDays ?? 30;
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + maxAdvance);
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(viewYear, viewMonth, d));

  const isDisabled = (d: Date) => d < today || d > maxDate;
  const isSelected = (d: Date) =>
    selectedDate?.getDate() === d.getDate() &&
    selectedDate?.getMonth() === d.getMonth() &&
    selectedDate?.getFullYear() === d.getFullYear();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot || !selectedService || !name || !email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug, serviceId: selectedService.id,
          clientName: name, clientEmail: email, clientPhone: phone || undefined,
          date: isoDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
          startTime: selectedSlot,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          paymentStatus: effectivePrice(selectedService) > 0 ? "unpaid" : "paid",
          amountCents: effectivePrice(selectedService),
          notes: notes || undefined
        })
      });
      const data = await res.json();
      if (data.success) { setConfirmedAppt(data.appointment); setStep("confirmed"); }
      else alert("Booking failed: " + (data.error || "Unknown error"));
    } catch { alert("Network error. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const downloadICS = () => {
    if (!confirmedAppt || !selectedService) return;
    const start = new Date(`${confirmedAppt.date}T${confirmedAppt.startTime}:00`);
    const end = new Date(`${confirmedAppt.date}T${confirmedAppt.endTime}:00`);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
    const ics = ["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",
      `UID:${confirmedAppt.id}@aether.ai`, `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${selectedService.name}`,
      confirmedAppt.zoomJoinUrl ? `DESCRIPTION:Zoom: ${confirmedAppt.zoomJoinUrl}` : "",
      "END:VEVENT","END:VCALENDAR"
    ].filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "appointment.ics"; a.click();
  };

  const stepIndex: Record<BookingStep, number> = { service:0, date:1, slot:2, contact:3, payment:4, confirmed:5 };
  const currentStep = stepIndex[step];

  return (
    <div className="w-full min-h-full flex flex-col bg-gradient-to-b from-[#0c0e24] via-[#090b1c] to-[#07091a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.2) 0%,transparent 70%)", filter: "blur(30px)" }} />

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 24px rgba(99,102,241,0.45)" }}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[16px] font-black text-white tracking-tight leading-tight">Book Appointment</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
              {step === "confirmed" ? "All done!" : `Step ${currentStep + 1} of 5`}
            </p>
          </div>
        </div>
        {onClose && step !== "confirmed" && (
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/8">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Step indicator ── */}
      {step !== "confirmed" && (
        <div className="px-5 pb-4">
          <StepIndicator current={currentStep} total={5} />
        </div>
      )}

      {/* ── Service summary chip (date/slot/contact/payment steps) ── */}
      <AnimatePresence>
        {selectedService && step !== "service" && step !== "confirmed" && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="mx-5 mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/8">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              {selectedService.consultationType === "online" ? <Video className="w-4 h-4 text-indigo-400" /> :
               selectedService.consultationType === "in_person" ? <MapPin className="w-4 h-4 text-indigo-400" /> :
               <Globe className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-indigo-100 truncate">{selectedService.name}</p>
              <p className="text-[11px] text-indigo-400/70">
                {selectedService.durationMinutes}min ·{" "}
                {selectedService.offerPrice != null && selectedService.offerPrice > 0 && selectedService.offerPrice < selectedService.price ? (
                  <><span className="line-through opacity-50">{formatPrice(selectedService.price, selectedService.currency)}</span>{" "}
                    <span className="text-amber-400 font-bold">{formatPrice(selectedService.offerPrice, selectedService.currency)}</span></>
                ) : formatPrice(selectedService.price, selectedService.currency)}
              </p>
            </div>
            {!initialServiceId && (
              <button onClick={() => setStep("service")}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold shrink-0 transition-colors">
                Change
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step Content ── */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Service Selection ── */}
          {step === "service" && (
            <motion.div key="service"
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ type:"spring", stiffness:380, damping:32 }}
              className="space-y-4">
              <div>
                <h4 className="text-[18px] font-black text-white mb-1">Choose a Service</h4>
                <p className="text-[13px] text-gray-500">Select the consultation type you need</p>
              </div>
              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-[14px]">No services available yet.</div>
              ) : (
                <div className="space-y-3">
                  {services.map(svc => {
                    const hasOffer = svc.offerPrice != null && svc.offerPrice > 0 && svc.offerPrice < svc.price;
                    const discount = hasOffer ? Math.round(((svc.price - svc.offerPrice!) / svc.price) * 100) : 0;
                    return (
                      <motion.button
                        key={svc.id}
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedService(svc); setStep("date"); }}
                        className="w-full text-left rounded-2xl border border-white/8 bg-white/[0.04] hover:border-indigo-500/40 hover:bg-indigo-500/8 transition-all p-4 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06),transparent)" }} />
                        <div className="flex items-center gap-4 relative">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/22 transition-colors">
                            {svc.consultationType === "online" ? <Video className="w-5 h-5 text-indigo-400" /> :
                             svc.consultationType === "in_person" ? <MapPin className="w-5 h-5 text-indigo-400" /> :
                             <Globe className="w-5 h-5 text-indigo-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-white truncate">{svc.name}</p>
                            {svc.description && <p className="text-[12px] text-gray-500 truncate mt-0.5">{svc.description}</p>}
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Clock className="w-3 h-3" />{svc.durationMinutes} min
                              </span>
                              <span className="text-[11px] text-gray-600">·</span>
                              <span className="text-[11px] text-gray-500 capitalize">{svc.consultationType.replace("_", " ")}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {hasOffer ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">{discount}% OFF</span>
                                <p className="text-[11px] text-gray-600 line-through">{formatPrice(svc.price, svc.currency)}</p>
                                <p className="text-[16px] font-black text-amber-400">{formatPrice(svc.offerPrice!, svc.currency)}</p>
                              </div>
                            ) : (
                              <p className="text-[18px] font-black text-indigo-300">{formatPrice(svc.price, svc.currency)}</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Date Picker ── */}
          {step === "date" && (
            <motion.div key="date"
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ type:"spring", stiffness:380, damping:32 }}
              className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-[18px] font-black text-white">Pick a Date</h4>
                <p className="text-[12px] text-gray-500">Up to {maxAdvance} days ahead</p>
              </div>

              {/* Month nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); }}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/8">
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <span className="text-[15px] font-black text-white">{MONTHS[viewMonth]} {viewYear}</span>
                <button
                  onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); }}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/8">
                  <ChevronLeft className="w-4.5 h-4.5 rotate-180" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-[11px] font-black text-gray-600 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`e-${i}`} />;
                  const disabled = isDisabled(date);
                  const selected = isSelected(date);
                  const todayDate = isToday(date);
                  return (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={!disabled ? { scale: 1.12 } : {}}
                      whileTap={!disabled ? { scale: 0.92 } : {}}
                      disabled={disabled}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(""); setStep("slot"); }}
                      className={`h-10 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center mx-auto w-full relative ${
                        selected
                          ? "text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                          : disabled
                          ? "text-gray-700 cursor-not-allowed"
                          : todayDate
                          ? "text-indigo-300 bg-indigo-500/12 hover:bg-indigo-500/25"
                          : "text-gray-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                      style={selected ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : undefined}
                    >
                      {date.getDate()}
                      {todayDate && !selected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/10" />Unavailable
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Time Slot ── */}
          {step === "slot" && (
            <motion.div key="slot"
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ type:"spring", stiffness:380, damping:32 }}
              className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[18px] font-black text-white">Select Time</h4>
                  {selectedDate && (
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {DAYS_FULL[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
                    </p>
                  )}
                </div>
                <button onClick={() => setStep("date")}
                  className="flex items-center gap-1 text-[12px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />Change
                </button>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-[13px]">Fetching available slots...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">😕</div>
                  <p className="text-[14px] text-gray-400 font-semibold mb-1">No slots available</p>
                  <p className="text-[12px] text-gray-600 mb-4">Try a different date</p>
                  <button onClick={() => setStep("date")}
                    className="text-[13px] text-indigo-400 hover:text-indigo-300 font-bold">
                    ← Pick another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {slots.map(slot => (
                    <motion.button
                      key={slot.time}
                      whileHover={slot.available ? { scale: 1.03, y: -1 } : {}}
                      whileTap={slot.available ? { scale: 0.97 } : {}}
                      disabled={!slot.available}
                      onClick={() => { setSelectedSlot(slot.time); setStep("contact"); }}
                      className={`py-3.5 px-3 rounded-2xl text-[13px] font-bold border transition-all flex items-center justify-center gap-2 ${
                        !slot.available
                          ? "bg-white/[0.02] border-white/5 text-gray-700 cursor-not-allowed opacity-40"
                          : "bg-white/[0.05] border-white/10 text-gray-200 hover:bg-indigo-500/15 hover:border-indigo-500/50 hover:text-white"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      {formatTime(slot.time)}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Contact Info ── */}
          {step === "contact" && (
            <motion.div key="contact"
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ type:"spring", stiffness:380, damping:32 }}
              className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[18px] font-black text-white">Your Details</h4>
                  {selectedDate && (
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {DAYS_FULL[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()} · {formatTime(selectedSlot)}
                    </p>
                  )}
                </div>
                <button onClick={() => setStep("slot")}
                  className="flex items-center gap-1 text-[12px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />Change
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                  <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} className={iconInputCls} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                  <input type="email" placeholder="Email Address *" value={email} onChange={e => setEmail(e.target.value)} className={iconInputCls} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                  <input type="tel" placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className={iconInputCls} />
                </div>
                <textarea
                  placeholder="Notes or questions (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={name && email ? { scale: 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.5)" } : {}}
                whileTap={name && email ? { scale: 0.98 } : {}}
                disabled={!name || !email}
                onClick={() => selectedService && effectivePrice(selectedService) > 0 ? setStep("payment") : handleConfirm()}
                className={`w-full h-14 rounded-2xl text-[15px] font-black flex items-center justify-center gap-2.5 transition-all ${
                  name && email
                    ? "text-white shadow-[0_8px_32px_rgba(99,102,241,0.4)]"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
                style={name && email ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : undefined}
              >
                {isSubmitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : selectedService && effectivePrice(selectedService) > 0
                  ? <><CreditCard className="w-5 h-5" />Continue to Payment<ArrowRight className="w-4 h-4" /></>
                  : <><Check className="w-5 h-5" />Confirm Booking</>}
              </motion.button>

              <p className="text-[11px] text-gray-600 text-center flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />Your data is secure and private
              </p>
            </motion.div>
          )}

          {/* ── Payment ── */}
          {step === "payment" && selectedService && (
            <motion.div key="payment"
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ type:"spring", stiffness:380, damping:32 }}
              className="space-y-5">
              <div>
                <h4 className="text-[18px] font-black text-white">Confirm & Pay</h4>
                <p className="text-[13px] text-gray-500">Secure checkout</p>
              </div>

              {/* Booking summary card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {[
                  ["Service", selectedService.name],
                  ["Date", selectedDate ? `${MONTHS[selectedDate.getMonth()].slice(0,3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : ""],
                  ["Time", formatTime(selectedSlot)],
                  ["Duration", `${selectedService.durationMinutes} min`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-[12px] text-gray-500">{label}</span>
                    <span className="text-[13px] font-bold text-white">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3.5">
                  <span className="text-[14px] font-black text-white">Total</span>
                  <div>
                    {selectedService.offerPrice != null && selectedService.offerPrice > 0 && selectedService.offerPrice < selectedService.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600 line-through">{formatPrice(selectedService.price, selectedService.currency)}</span>
                        <span className="text-[18px] font-black text-amber-400">{formatPrice(selectedService.offerPrice, selectedService.currency)}</span>
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          {Math.round(((selectedService.price - selectedService.offerPrice) / selectedService.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-[18px] font-black text-indigo-300">{formatPrice(selectedService.price, selectedService.currency)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card form */}
              <div className="space-y-3">
                <input placeholder="Card Number" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM / YY" className={inputCls} />
                  <input placeholder="CVV" className={inputCls} />
                </div>
                <input placeholder="Name on Card" className={inputCls} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 16px 48px rgba(99,102,241,0.55)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="w-full h-14 rounded-2xl text-white text-[15px] font-black flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(99,102,241,0.4)] transition-all"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" />Pay & Confirm Booking</>}
              </motion.button>

              <p className="text-[11px] text-gray-600 text-center flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />256-bit SSL encrypted · Secure payment
              </p>
            </motion.div>
          )}

          {/* ── Confirmed ── */}
          {step === "confirmed" && confirmedAppt && (
            <motion.div key="confirmed"
              initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
              transition={{ type:"spring", stiffness:300, damping:28 }}
              className="space-y-5 py-2">
              {/* Success animation */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale:0, rotate:-90 }} animate={{ scale:1, rotate:0 }}
                  transition={{ type:"spring", stiffness:400, damping:22, delay:0.1 }}
                  className="relative mb-4"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05))", border: "2px solid rgba(16,185,129,0.4)", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
                    <Check className="w-9 h-9 text-emerald-400" />
                  </div>
                  {/* Orbiting dots */}
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400"
                      style={{ top: "50%", left: "50%", transformOrigin: `${30 + i*5}px 0` }}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2 + i*0.5, repeat: Infinity, ease: "linear", delay: i*0.3 }}
                    />
                  ))}
                </motion.div>
                <motion.h4 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="text-[22px] font-black text-white tracking-tight mb-1.5">Booking Confirmed! 🎉</motion.h4>
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
                  className="text-[13px] text-gray-500">Confirmation sent to <span className="text-gray-300">{confirmedAppt.clientEmail}</span></motion.p>
              </div>

              {/* Details */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {[
                  ["Service", confirmedAppt.serviceName || selectedService?.name],
                  ["Date", confirmedAppt.date],
                  ["Time", `${formatTime(confirmedAppt.startTime)} – ${formatTime(confirmedAppt.endTime)}`],
                  ["Ref #", confirmedAppt.id?.substring(0,8).toUpperCase()],
                ].map(([label, value]) => value ? (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-[12px] text-gray-500">{label}</span>
                    <span className="text-[13px] font-bold text-white font-mono">{value}</span>
                  </div>
                ) : null)}
              </div>

              {/* Zoom link */}
              {confirmedAppt.zoomJoinUrl && (
                <motion.a href={confirmedAppt.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.02 }}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-blue-500/30 bg-blue-500/8 hover:bg-blue-500/15 transition-all">
                  <Video className="w-5 h-5 text-blue-400" />
                  <span className="text-[14px] font-bold text-blue-300">Join Zoom Meeting</span>
                  <ExternalLink className="w-4 h-4 text-blue-400/60" />
                </motion.a>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={downloadICS}
                  className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-[13px] font-bold text-gray-300 flex items-center justify-center gap-2 transition-all">
                  <Download className="w-4 h-4" />Calendar
                </motion.button>
                {onClose && (
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={onClose}
                    className="h-12 rounded-2xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    Done <Check className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
