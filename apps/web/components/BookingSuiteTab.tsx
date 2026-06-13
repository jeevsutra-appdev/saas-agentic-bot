"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Plus, Edit2, Trash2, Check, X, Video, MapPin,
  Star, Users, DollarSign, Settings, Loader2, ChevronRight, ChevronLeft,
  ExternalLink, Copy, CheckCircle, AlertCircle, RefreshCw,
  Zap, Mail, Phone, Globe, Link, BookOpen, Info, LayoutDashboard, TrendingUp,
  Key, ShieldCheck, Activity, Palette
} from "lucide-react";

interface BookingService {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number; // regular price in cents
  offerPrice?: number; // sale price in cents (if set, shows as discounted)
  currency?: string;
  image?: string;
  consultationType: "online" | "in_person" | "both";
  isActive: boolean;
  categoryId?: string;
  maxAdvanceBookingDays?: number;
  bufferMinutes?: number;
  createdAt: string;
}

interface BookingSchedule {
  id?: string;
  tenantSlug: string;
  serviceId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  timezone?: string;
}

interface Appointment {
  id: string;
  serviceId?: string;
  serviceName?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeSlot: string;
  status: string;
  paymentStatus?: string;
  amountCents?: number;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  gcalEventId?: string;
  notes?: string;
  createdAt: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatPrice(cents: number, currency = "USD") {
  if (!cents || cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function formatTime12(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    completed: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[status] || "bg-white/10 text-gray-400 border-white/10"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Appointment Card (shared) ─────────────────────────────────────────────────
function AppointmentCard({ appt, onCancel }: { appt: Appointment; onCancel?: (id: string) => void }) {
  const isCancelled = appt.status === "cancelled";
  const dateNum = appt.date ? new Date(appt.date + "T12:00:00").getDate() : null;
  const dateMonth = appt.date ? new Date(appt.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border transition-all ${
        isCancelled
          ? "border-red-500/10 bg-red-500/[0.02] opacity-70"
          : "border-white/8 bg-[#0a0c1a] hover:border-indigo-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Date chip */}
        <div className={`shrink-0 w-12 rounded-xl border flex flex-col items-center justify-center py-2 ${
          isCancelled ? "border-red-500/20 bg-red-500/8" : "border-indigo-500/20 bg-indigo-500/8"
        }`}>
          {dateNum ? (
            <>
              <p className={`text-[8px] font-bold uppercase tracking-widest ${isCancelled ? "text-red-400" : "text-indigo-400"}`}>{dateMonth}</p>
              <p className={`text-[20px] font-black leading-tight ${isCancelled ? "text-red-300" : "text-white"}`}>{dateNum}</p>
            </>
          ) : (
            <Calendar className={`w-4 h-4 ${isCancelled ? "text-red-400" : "text-indigo-400"}`} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4 className="text-[13px] font-bold text-white">{appt.clientName}</h4>
            <StatusBadge status={appt.status} />
            {appt.paymentStatus === "paid" && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Paid</span>
            )}
          </div>
          {appt.serviceName && <p className="text-[10px] text-indigo-400 font-semibold">{appt.serviceName}</p>}
          <p className="text-[10px] text-gray-500 mt-0.5">{appt.clientEmail}{appt.clientPhone ? ` · ${appt.clientPhone}` : ""}</p>
          {appt.startTime && (
            <p className="text-[10px] text-gray-400 font-mono mt-1">
              {formatTime12(appt.startTime)}{appt.endTime ? ` – ${formatTime12(appt.endTime)}` : ""}
            </p>
          )}
          {appt.notes && <p className="text-[9.5px] text-gray-600 italic mt-1 truncate">"{appt.notes}"</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {appt.zoomJoinUrl && !isCancelled && (
            <a
              href={appt.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold hover:bg-blue-500/25 transition-colors"
            >
              <Video className="w-3 h-3" />Zoom
            </a>
          )}
          {!isCancelled && onCancel && (
            <button
              onClick={() => onCancel(appt.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3 h-3" />Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function BookingDashboard({ appointments, loading, onRefresh, onCancel }: {
  appointments: Appointment[];
  loading: boolean;
  onRefresh: () => void;
  onCancel: (id: string) => void;
}) {
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "completed" | "cancelled">("all");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const upcoming = appointments.filter(a => a.status !== "cancelled" && a.date && a.date >= todayStr);
  const cancelled = appointments.filter(a => a.status === "cancelled");
  const todayAppts = appointments.filter(a => a.date === todayStr && a.status !== "cancelled");
  const completed = appointments.filter(a => a.status === "completed" || (a.status === "confirmed" && a.date && a.date < todayStr));
  const revenue = appointments.filter(a => a.paymentStatus === "paid").reduce((s, a) => s + (a.amountCents || 0), 0);

  // Filter + sort appointments for display
  const filterFns: Record<string, (a: Appointment) => boolean> = {
    all: () => true,
    upcoming: a => a.status !== "cancelled" && !!a.date && a.date >= todayStr,
    today: a => a.date === todayStr && a.status !== "cancelled",
    completed: a => a.status === "completed" || (a.status === "confirmed" && !!a.date && a.date < todayStr),
    cancelled: a => a.status === "cancelled"
  };

  let displayAppts = appointments.filter(filterFns[filter]);
  if (selectedDate) displayAppts = displayAppts.filter(a => a.date === selectedDate);
  const sortDesc = filter === "all" || filter === "cancelled";
  displayAppts = [...displayAppts].sort((a, b) => {
    const da = a.date || ""; const db = b.date || "";
    if (da !== db) return sortDesc ? db.localeCompare(da) : da.localeCompare(db);
    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  // Group by date
  const grouped: Record<string, Appointment[]> = {};
  for (const appt of displayAppts) {
    const k = appt.date || "Unknown";
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(appt);
  }
  const groupedEntries = Object.entries(grouped);

  // Calendar dot map
  const apptDateMap = appointments.reduce((acc, a) => {
    if (a.date) {
      if (!acc[a.date]) acc[a.date] = { active: 0, cancelled: 0 };
      if (a.status === "cancelled") acc[a.date].cancelled++;
      else acc[a.date].active++;
    }
    return acc;
  }, {} as Record<string, { active: number; cancelled: number }>);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  function formatGroupDate(dateStr: string) {
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T12:00:00");
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const tomStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`;
    if (dateStr === tomStr) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }

  const filterTabs = [
    { key: "all" as const, label: "All", count: appointments.length },
    { key: "upcoming" as const, label: "Upcoming", count: upcoming.length },
    { key: "today" as const, label: "Today", count: todayAppts.length },
    { key: "completed" as const, label: "Done", count: completed.length },
    { key: "cancelled" as const, label: "Cancelled", count: cancelled.length },
  ];

  return (
    <div className="space-y-5">
      {/* ── Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Bookings", value: appointments.length, sub: "all time", border: "border-indigo-500/20", grad: "from-indigo-500/10 to-[#0a0c1a]", text: "text-indigo-300", icon: Activity },
          { label: "Upcoming", value: upcoming.length, sub: `${todayAppts.length} today`, border: "border-emerald-500/20", grad: "from-emerald-500/10 to-[#0a0c1a]", text: "text-emerald-300", icon: Clock },
          { label: "Revenue", value: formatPrice(revenue), sub: "paid sessions", border: "border-amber-500/20", grad: "from-amber-500/10 to-[#0a0c1a]", text: "text-amber-300", icon: DollarSign },
          { label: "Cancelled", value: cancelled.length, sub: "total", border: "border-red-500/20", grad: "from-red-500/10 to-[#0a0c1a]", text: "text-red-300", icon: X },
        ].map(({ label, value, sub, border, grad, text, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -2 }} className={`p-4 rounded-2xl border ${border} bg-gradient-to-br ${grad} relative overflow-hidden cursor-default`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/[0.03] blur-xl" />
            <div className="flex items-start justify-between mb-3">
              <p className="text-[8.5px] font-black text-gray-500 uppercase tracking-[0.14em] leading-tight max-w-[70px]">{label}</p>
              <div className="w-6 h-6 rounded-lg border border-white/8 bg-white/[0.04] flex items-center justify-center shrink-0">
                <Icon className={`w-3 h-3 ${text}`} />
              </div>
            </div>
            <p className={`text-[26px] font-black leading-none ${text} mb-0.5`}>{value}</p>
            <p className="text-[9px] text-gray-700">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Calendar + List (two-column on lg) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="p-4 rounded-2xl border border-white/8 bg-[#080a18] sticky top-0">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <p className="text-[13px] font-bold text-white tracking-tight">{MONTH_NAMES[calMonth]}</p>
                <p className="text-[10px] text-gray-600">{calYear}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onRefresh}
                  className={`w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center transition-colors ${loading ? "text-indigo-400" : "text-gray-500 hover:text-white"}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1.5">
              {DAY_SHORT.map(d => (
                <div key={d} className="text-[8px] font-black text-gray-700 text-center uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dots = apptDateMap[dateStr];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const total = (dots?.active || 0) + (dots?.cancelled || 0);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    title={total ? `${total} appointment${total !== 1 ? "s" : ""}` : undefined}
                    className={`relative flex flex-col items-center justify-center rounded-lg h-9 text-[11px] font-bold transition-all group ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.5)]"
                        : isToday
                        ? "text-indigo-300 ring-1 ring-indigo-500/50 bg-indigo-500/10"
                        : dots?.active
                        ? "bg-emerald-500/10 text-white hover:bg-emerald-500/20"
                        : dots?.cancelled
                        ? "bg-red-500/[0.07] text-gray-500 hover:bg-red-500/12"
                        : "text-gray-700 hover:text-gray-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{day}</span>
                    {/* Appointment indicator dots */}
                    {dots && (
                      <div className="flex gap-[2px] mt-0.5">
                        {dots.active > 0 && (
                          <div className={`h-[3px] rounded-full bg-emerald-400 ${dots.active >= 3 ? "w-3" : dots.active === 2 ? "w-2" : "w-1.5"}`} />
                        )}
                        {dots.cancelled > 0 && (
                          <div className="h-[3px] w-1.5 rounded-full bg-red-400/60" />
                        )}
                      </div>
                    )}
                    {/* Count tooltip on hover */}
                    {total > 0 && !isSelected && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1f3c] border border-white/10 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {total} appt{total !== 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-[8px] text-gray-600 font-semibold">
                  <div className="w-2 h-[3px] rounded-full bg-emerald-400" />Active
                </span>
                <span className="flex items-center gap-1 text-[8px] text-gray-600 font-semibold">
                  <div className="w-2 h-[3px] rounded-full bg-red-400/60" />Cancelled
                </span>
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1"
                >
                  <X className="w-2.5 h-2.5" />{selectedDate}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointment list */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setSelectedDate(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all ${
                  filter === tab.key
                    ? "bg-indigo-600 border-indigo-500/30 text-white"
                    : "bg-white/[0.03] border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15"
                }`}
              >
                {tab.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-white/5 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
            {selectedDate && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
                <Calendar className="w-3 h-3" />{selectedDate}
                <button onClick={() => setSelectedDate(null)} className="ml-0.5 hover:text-white"><X className="w-2.5 h-2.5" /></button>
              </div>
            )}
          </div>

          {/* Grouped appointments */}
          {groupedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-[13px] font-bold text-gray-500">No appointments found</p>
              <p className="text-[11px] text-gray-700 mt-1">
                {selectedDate ? `No ${filter !== "all" ? filter : ""} appointments on ${selectedDate}` : `No ${filter !== "all" ? filter : ""} appointments yet`}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groupedEntries.map(([date, appts]) => (
                <div key={date}>
                  {/* Date group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-white/8 to-transparent" />
                    <span className={`text-[9.5px] font-bold px-2.5 py-1 rounded-full border ${
                      date === todayStr
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                        : date > todayStr
                        ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-500/80"
                        : "bg-white/[0.04] border-white/8 text-gray-500"
                    }`}>
                      {formatGroupDate(date)}
                    </span>
                    <span className="text-[9px] text-gray-700 font-bold shrink-0">{appts.length}</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-white/8 to-transparent" />
                  </div>
                  <div className="space-y-2">
                    {appts.map(appt => (
                      <AppointmentCard
                        key={appt.id}
                        appt={appt}
                        onCancel={appt.status !== "cancelled" ? onCancel : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Service Form ──────────────────────────────────────────────────────────────
function ServiceForm({ service, tenantSlug, onSave, onCancel }: {
  service?: BookingService | null;
  tenantSlug: string;
  onSave: (svc: BookingService) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [duration, setDuration] = useState(service?.durationMinutes || 60);
  const [price, setPrice] = useState((service?.price || 0) / 100);
  const [offerPrice, setOfferPrice] = useState(service?.offerPrice != null ? service.offerPrice / 100 : 0);
  const [hasOffer, setHasOffer] = useState(!!(service?.offerPrice && service.offerPrice > 0));
  const [currency, setCurrency] = useState(service?.currency || "USD");
  const [type, setType] = useState<"online" | "in_person" | "both">(service?.consultationType || "online");
  const [isActive, setIsActive] = useState(service?.isActive !== false);
  const [maxDays, setMaxDays] = useState(service?.maxAdvanceBookingDays || 30);
  const [buffer, setBuffer] = useState(service?.bufferMinutes || 0);
  const [image, setImage] = useState(service?.image || "");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [saving, setSaving] = useState(false);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.type)) return alert("Only JPG, PNG, WebP images are supported.");
    if (file.size > 2 * 1024 * 1024) return alert("Image must be under 2MB.");
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        tenantSlug,
        id: service?.id,
        name,
        description,
        durationMinutes: duration,
        price: Math.round(price * 100),
        offerPrice: hasOffer && offerPrice > 0 ? Math.round(offerPrice * 100) : undefined,
        currency,
        consultationType: type,
        isActive,
        maxAdvanceBookingDays: maxDays,
        bufferMinutes: buffer,
        image: image || undefined
      };
      const res = await fetch("/api/booking/services", {
        method: service ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) onSave(data.service);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors";
  const labelClass = "text-[11px] font-semibold text-gray-400 mb-1 block";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#0d1021] to-[#080a16] space-y-4"
    >
      <h3 className="text-[14px] font-bold text-white">{service ? "Edit Service" : "New Service"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Image Upload */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass + " mb-0"}>Service Image</label>
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/8">
              {(["url","upload"] as const).map(mode => (
                <button key={mode} type="button" onClick={() => setImageMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${imageMode === mode ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  {mode === "url" ? "URL" : "Upload"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-start">
            {/* Preview */}
            <div className="w-16 h-16 rounded-xl border border-white/10 bg-black/40 overflow-hidden shrink-0 flex items-center justify-center">
              {image ? (
                <img src={image} alt="preview" className="w-full h-full object-cover" onError={() => setImage("")} />
              ) : (
                <Star className="w-6 h-6 text-gray-700" />
              )}
            </div>

            <div className="flex-1">
              {imageMode === "url" ? (
                <>
                  <input value={image} onChange={e => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass} />
                  <p className="text-[10px] text-gray-600 mt-1">Paste a direct image URL (JPG, PNG, WebP)</p>
                </>
              ) : (
                <>
                  <label className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 cursor-pointer transition-colors text-[12px] text-gray-500 hover:text-gray-300">
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFile} />
                    📁 Choose file (JPG, PNG, WebP · max 2MB)
                  </label>
                  {image && <p className="text-[10px] text-emerald-400 mt-1">✓ Image loaded</p>}
                </>
              )}
              {image && (
                <button type="button" onClick={() => setImage("")} className="text-[10px] text-red-400 hover:text-red-300 mt-1 transition-colors">
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Service Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Astrology Consultation" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what the client will get..." rows={2} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className={labelClass}>Duration (minutes)</label>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass}>
            {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <label className={labelClass + " mb-0"}>Price</label>
            <button
              type="button"
              onClick={() => setHasOffer(!hasOffer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${hasOffer ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"}`}
            >
              {hasOffer ? "✓ Offer Price ON" : "+ Add Offer Price"}
            </button>
          </div>

          {/* Currency + Regular Price row */}
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Currency</p>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
              >
                {["USD", "EUR", "GBP", "INR", "AED", "BDT"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">
                {hasOffer ? "Regular Price (shows strikethrough)" : "Price (0 = Free)"}
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price === 0 ? "" : price}
                onChange={e => setPrice(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                placeholder="e.g. 500"
                className={inputClass}
              />
            </div>
          </div>

          {/* Offer price row */}
          {hasOffer && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
              <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                ✦ Sale / Offer Price
                <span className="text-amber-500/60 font-normal">(highlighted to clients)</span>
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={offerPrice === 0 ? "" : offerPrice}
                onChange={e => setOfferPrice(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                placeholder="e.g. 399"
                className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
              {offerPrice > 0 && price > 0 && offerPrice < price && (
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-3 h-3" />
                  {Math.round(((price - offerPrice) / price) * 100)}% discount — clients see{" "}
                  {currency} {offerPrice.toFixed(2)} instead of {currency} {price.toFixed(2)}
                </p>
              )}
              {offerPrice > 0 && price > 0 && offerPrice >= price && (
                <p className="text-[10px] text-red-400 font-semibold">⚠ Offer price must be less than regular price</p>
              )}
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Consultation Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className={inputClass}>
            <option value="online">Online (Video Call)</option>
            <option value="in_person">In-Person</option>
            <option value="both">Both Options</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Max Advance Booking (days)</label>
          <input type="number" min="1" max="365" value={maxDays} onChange={e => setMaxDays(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Break Gap Between Appointments (min)</label>
          <input type="number" min="0" max="120" step="5" value={buffer} onChange={e => setBuffer(Number(e.target.value))} className={inputClass} />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <label className={labelClass + " mb-0"}>Active</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-indigo-500" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-[12px] font-bold transition-colors">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {service ? "Update" : "Create"} Service
        </button>
      </div>
    </motion.div>
  );
}

// ─── Schedule Builder ──────────────────────────────────────────────────────────
function ScheduleBuilder({ tenantSlug, timezone }: { tenantSlug: string; timezone: string }) {
  const defaultSchedule = DAY_NAMES.map((_, i) => ({
    tenantSlug,
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "17:00",
    isActive: i >= 1 && i <= 5,
    timezone
  }));

  const [schedules, setSchedules] = useState<BookingSchedule[]>(defaultSchedule);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/booking/schedule?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.schedules.length > 0) {
          const merged = defaultSchedule.map(def => {
            const existing = data.schedules.find((s: any) => s.dayOfWeek === def.dayOfWeek && !s.serviceId);
            return existing ? { ...def, ...existing } : def;
          });
          setSchedules(merged);
        }
      }).catch(() => {});
  }, [tenantSlug]);

  const update = (idx: number, updates: Partial<BookingSchedule>) => {
    setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/booking/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, schedules })
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-white">Weekly Availability</h3>
          <p className="text-[11px] text-gray-500">Set your working hours for each day</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
          {saved ? "Saved!" : "Save Schedule"}
        </button>
      </div>
      <div className="space-y-2">
        {schedules.map((s, idx) => (
          <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${s.isActive ? "border-indigo-500/20 bg-indigo-500/5" : "border-white/5 bg-white/[0.02]"}`}>
            <button
              onClick={() => update(idx, { isActive: !s.isActive })}
              className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${s.isActive ? "bg-indigo-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.isActive ? "translate-x-4" : ""}`} />
            </button>
            <span className={`w-10 text-[11px] font-bold ${s.isActive ? "text-white" : "text-gray-600"}`}>{DAY_SHORT[idx]}</span>
            {s.isActive ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={s.startTime}
                  onChange={e => update(idx, { startTime: e.target.value })}
                  className="bg-black/40 border border-white/8 rounded-lg px-2 py-1 text-[12px] text-white focus:outline-none focus:border-indigo-500/50 w-28"
                />
                <span className="text-gray-600 text-[11px]">to</span>
                <input
                  type="time"
                  value={s.endTime}
                  onChange={e => update(idx, { endTime: e.target.value })}
                  className="bg-black/40 border border-white/8 rounded-lg px-2 py-1 text-[12px] text-white focus:outline-none focus:border-indigo-500/50 w-28"
                />
                <span className="text-[10px] text-gray-500 hidden sm:block">
                  {formatTime12(s.startTime)} – {formatTime12(s.endTime)}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-600 flex-1">Unavailable</span>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-amber-300/80">Timezone: <strong>{timezone}</strong>. Slots will be shown in the visitor's local time.</p>
      </div>
    </div>
  );
}

// ─── Integrations Panel ─────────────────────────────────────────────────────────
function BookingIntegrationsPanel({ tenantSlug }: { tenantSlug: string }) {
  const [zoomAccountId, setZoomAccountId] = useState("");
  const [zoomClientId, setZoomClientId] = useState("");
  const [zoomClientSecret, setZoomClientSecret] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [gcalCalendarId, setGcalCalendarId] = useState("");
  const [gcalJson, setGcalJson] = useState("");
  const [gcalConfigured, setGcalConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/tenant-settings?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.zoomAccountId) setZoomAccountId(data.zoomAccountId);
        if (data.zoomClientId) setZoomClientId(data.zoomClientId);
        if (data.smtpHost) setSmtpHost(data.smtpHost);
        if (data.smtpUser) setSmtpUser(data.smtpUser);
        if (data.smtpFrom) setSmtpFrom(data.smtpFrom);
        if (data.gcalCalendarId) setGcalCalendarId(data.gcalCalendarId);
        setGcalConfigured(!!data.gcalConfigured);
      }).catch(() => {});
  }, [tenantSlug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = { tenantSlug };
      if (zoomAccountId) body.zoomAccountId = zoomAccountId;
      if (zoomClientId) body.zoomClientId = zoomClientId;
      if (zoomClientSecret && !zoomClientSecret.includes("*")) body.zoomClientSecret = zoomClientSecret;
      if (smtpHost) body.smtpHost = smtpHost;
      if (smtpUser) body.smtpUser = smtpUser;
      if (smtpPass && !smtpPass.includes("*")) body.smtpPass = smtpPass;
      if (smtpFrom) body.smtpFrom = smtpFrom;
      if (gcalCalendarId) body.gcalCalendarId = gcalCalendarId;
      if (gcalJson.trim().startsWith("{")) body.gcalServiceAccountJson = gcalJson.trim();

      await fetch("/api/tenant-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setSaved(true);
      if (gcalJson.trim().startsWith("{")) { setGcalConfigured(true); setGcalJson(""); }
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-black/40 border border-white/8 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono";
  const labelClass = "text-[11px] font-semibold text-gray-400 mb-1 block";

  return (
    <div className="space-y-6">
      {/* Zoom */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Video className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-white">Zoom Integration</h4>
            <p className="text-[10px] text-gray-500">Auto-create Zoom meeting links on booking confirmation</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Account ID</label>
            <input value={zoomAccountId} onChange={e => setZoomAccountId(e.target.value)} placeholder="Your Zoom Account ID" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Client ID (OAuth)</label>
              <input value={zoomClientId} onChange={e => setZoomClientId(e.target.value)} placeholder="OAuth Client ID" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Client Secret</label>
              <input type="password" value={zoomClientSecret} onChange={e => setZoomClientSecret(e.target.value)} placeholder="OAuth Client Secret" className={inputClass} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <p className="text-[10px] text-gray-500 font-mono">Zoom Marketplace → Build App → Server-to-Server OAuth → Copy Account ID, Client ID, Client Secret</p>
          </div>
        </div>
      </div>

      {/* Gmail SMTP */}
      <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <Mail className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-white">Gmail / SMTP Email</h4>
            <p className="text-[10px] text-gray-500">Send confirmation, cancellation & reschedule emails automatically</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>SMTP Host</label>
              <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>From Address</label>
              <input value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} placeholder="you@gmail.com" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>SMTP Username</label>
              <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="your@gmail.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>App Password</label>
              <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="16-char App Password" className={inputClass} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <p className="text-[10px] text-gray-500 font-mono">Gmail: Enable 2FA → Google Account → Security → App Passwords → Create "Aether AI"</p>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-bold text-white">Google Calendar</h4>
              {gcalConfigured && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-2.5 h-2.5" />Connected
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500">Sync appointments to Google Calendar for both consultant & client</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Calendar ID</label>
            <input
              value={gcalCalendarId}
              onChange={e => setGcalCalendarId(e.target.value)}
              placeholder="your@gmail.com or calendar ID from settings"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Service Account JSON {gcalConfigured && <span className="text-emerald-400 ml-1">(already configured — paste new JSON to update)</span>}
            </label>
            <textarea
              value={gcalJson}
              onChange={e => setGcalJson(e.target.value)}
              placeholder={gcalConfigured ? "Paste new JSON here to replace current key..." : '{"type":"service_account","project_id":"...","private_key":"...","client_email":"...@...iam.gserviceaccount.com",...}'}
              rows={5}
              className={inputClass + " resize-none text-[11px]"}
            />
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
            <p className="text-[10px] text-emerald-400 font-bold">Quick setup:</p>
            <p className="text-[10px] text-gray-500 font-mono">1. console.cloud.google.com → Enable Calendar API</p>
            <p className="text-[10px] text-gray-500 font-mono">2. IAM → Service Accounts → Create → Download JSON key</p>
            <p className="text-[10px] text-gray-500 font-mono">3. Google Calendar → Settings → Share → Add service account email</p>
            <p className="text-[10px] text-gray-500 font-mono">4. Copy Calendar ID from "Integrate Calendar" section</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Zap className="w-4 h-4" />}
        {saved ? "Saved!" : "Save Integration Settings"}
      </button>
    </div>
  );
}

// ─── Storefront Editor ─────────────────────────────────────────────────────────

const PREVIEW_THEMES = [
  { id: "midnight", name: "Midnight", colors: ["#6366f1","#8b5cf6"] as [string,string], bg: "#060810" },
  { id: "aurora",   name: "Aurora",   colors: ["#06b6d4","#7c3aed"] as [string,string], bg: "#040c14" },
  { id: "zen",      name: "Zen",      colors: ["#059669","#0891b2"] as [string,string], bg: "#f8faf8" },
  { id: "royal",    name: "Royal",    colors: ["#f59e0b","#d97706"] as [string,string], bg: "#050814" },
  { id: "sakura",   name: "Sakura",   colors: ["#f43f5e","#ec4899"] as [string,string], bg: "#0d0608" },
];

function StorefrontEditor({ tenantSlug }: { tenantSlug: string }) {
  const [theme, setTheme] = useState("midnight");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandLogoHeight, setBrandLogoHeight] = useState(36);
  const [businessName, setBusinessName] = useState("");
  const [businessTagline, setBusinessTagline] = useState("");
  const [businessBio, setBusinessBio] = useState("");
  const [businessAvatar, setBusinessAvatar] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCta, setHeroCta] = useState("");
  const [heroBadge, setHeroBadge] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [sections, setSections] = useState({
    hero: true, services: true, howItWorks: true, about: true, cta: true, footer: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/tenant-settings?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.bookingStorefrontConfig) {
          try {
            const cfg = JSON.parse(data.bookingStorefrontConfig);
            if (cfg.theme) setTheme(cfg.theme);
            if (cfg.brandLogo) setBrandLogo(cfg.brandLogo);
            if (cfg.brandLogoHeight) setBrandLogoHeight(cfg.brandLogoHeight);
            if (cfg.businessName) setBusinessName(cfg.businessName);
            if (cfg.businessTagline) setBusinessTagline(cfg.businessTagline);
            if (cfg.businessBio) setBusinessBio(cfg.businessBio);
            if (cfg.businessAvatar) setBusinessAvatar(cfg.businessAvatar);
            if (cfg.heroTitle) setHeroTitle(cfg.heroTitle);
            if (cfg.heroSubtitle) setHeroSubtitle(cfg.heroSubtitle);
            if (cfg.heroCta) setHeroCta(cfg.heroCta);
            if (cfg.heroBadge) setHeroBadge(cfg.heroBadge);
            if (cfg.colors?.primary) { setPrimaryColor(cfg.colors.primary); setUseCustomColors(true); }
            if (cfg.colors?.accent) setAccentColor(cfg.colors.accent);
            if (cfg.sections) setSections((s: typeof sections) => ({ ...s, ...cfg.sections }));
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantSlug]);

  const handleSave = async () => {
    setSaving(true);
    const config = {
      theme, brandLogo: brandLogo || undefined, brandLogoHeight,
      businessName, businessTagline, businessBio, businessAvatar,
      heroTitle, heroSubtitle, heroCta, heroBadge,
      colors: useCustomColors ? { primary: primaryColor || undefined, accent: accentColor || undefined } : undefined,
      sections,
    };
    await fetch("/api/tenant-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, bookingStorefrontConfig: JSON.stringify(config) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />Loading storefront config...
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold text-white">Public Booking Page</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Customize your storefront at <span className="text-indigo-400">/s/{tenantSlug}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/s/${tenantSlug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-bold text-gray-300 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />View Live
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-[12px] font-bold transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* 5 Theme Templates */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <p className="text-[12px] font-bold text-white mb-3 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-violet-400" />Choose Template Theme
        </p>
        <div className="grid grid-cols-5 gap-3">
          {PREVIEW_THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                theme === t.id ? "border-indigo-500 scale-[1.04]" : "border-white/10 hover:border-white/30"
              }`}
              style={{ background: t.bg }}>
              <div className="flex gap-1">
                {t.colors.map(c => (
                  <div key={c} className="w-4 h-4 rounded-full border border-white/20" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[10px] font-bold" style={{ color: t.colors[0] }}>{t.name}</span>
              {theme === t.id && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Business Info */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
        <p className="text-[12px] font-bold text-white flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />Business Info
        </p>

        {/* Brand Logo */}
        <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Brand Logo / Icon</p>
          {brandLogo && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10">
              <img src={brandLogo} alt="Logo" className="object-contain rounded-lg" style={{ height: brandLogoHeight, width: "auto", maxWidth: 80 }} />
              <span className="text-[10px] text-gray-400 flex-1">{brandLogoHeight}px</span>
              <button onClick={() => setBrandLogo("")} className="text-red-400 text-[10px] font-bold">Remove</button>
            </div>
          )}
          <input type="url" value={brandLogo} onChange={e => setBrandLogo(e.target.value)} placeholder="https://... logo URL"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors">
            <span className="text-[11px] text-gray-400">Upload file (PNG/WebP/JPG, max 2MB)</span>
            <input type="file" accept="image/png,image/webp,image/jpeg,image/jpg" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB."); return; }
                const reader = new FileReader();
                reader.onload = () => setBrandLogo(reader.result as string);
                reader.readAsDataURL(file);
              }} />
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-500">Height:</span>
            {[24, 32, 36, 40, 48, 56].map(h => (
              <button key={h} onClick={() => setBrandLogoHeight(h)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${brandLogoHeight === h ? "bg-indigo-600 text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
                {h}px
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Business Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Dr. Arjun Sharma"
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tagline</label>
            <input value={businessTagline} onChange={e => setBusinessTagline(e.target.value)} placeholder="Expert · 15+ Years"
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">About / Bio</label>
          <textarea value={businessBio} onChange={e => setBusinessBio(e.target.value)} rows={3}
            placeholder="Helping people find clarity through astrology for over 15 years..."
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Photo URL</label>
          <input value={businessAvatar} onChange={e => setBusinessAvatar(e.target.value)} placeholder="https://..."
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
        <p className="text-[12px] font-bold text-white flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400" />Hero Section
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Headline</label>
            <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Transform Your Life"
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trust Badge</label>
            <input value={heroBadge} onChange={e => setHeroBadge(e.target.value)} placeholder="⭐ Trusted by 500+ clients"
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sub-heading</label>
          <input value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} placeholder="Book your consultation and take the first step towards clarity..."
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">CTA Button Text</label>
          <input value={heroCta} onChange={e => setHeroCta(e.target.value)} placeholder="Book a Session"
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
        </div>
      </div>

      {/* Custom Colors */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">🎨 Custom Color Override</p>
          <button onClick={() => setUseCustomColors(v => !v)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${useCustomColors ? "bg-violet-600 text-white" : "bg-white/5 text-gray-500"}`}>
            {useCustomColors ? "ON" : "OFF"}
          </button>
        </div>
        {useCustomColors && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Primary Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={primaryColor || "#6366f1"} onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#6366f1"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accent Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={accentColor || "#8b5cf6"} onChange={e => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input value={accentColor} onChange={e => setAccentColor(e.target.value)} placeholder="#8b5cf6"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Visibility */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <p className="text-[12px] font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-gray-400" />Page Sections
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(sections) as (keyof typeof sections)[]).map(key => (
            <button key={key} onClick={() => setSections((s: typeof sections) => ({ ...s, [key]: !s[key] }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                sections[key] ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-white/[0.02] border-white/[0.08] text-gray-600"
              }`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sections[key] ? "bg-indigo-400" : "bg-gray-700"}`} />
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-900/30">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          {saved ? "Saved!" : "Publish Storefront"}
        </button>
      </div>
    </div>
  );
}

// ─── Main BookingSuiteTab ──────────────────────────────────────────────────────
export default function BookingSuiteTab({ tenantSlug }: { tenantSlug: string }) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "services" | "schedule" | "appointments" | "integrations" | "storefront" | "setup">("dashboard");
  const [services, setServices] = useState<BookingService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<BookingService | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fetchServices = () => {
    fetch(`/api/booking/services?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => { if (data.success) setServices(data.services); })
      .catch(() => {});
  };

  const fetchAppointments = () => {
    setLoadingAppts(true);
    fetch(`/api/booking/appointments?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(data => { if (data.success) setAppointments(data.appointments); })
      .catch(() => {})
      .finally(() => setLoadingAppts(false));
  };

  useEffect(() => { fetchServices(); }, [tenantSlug]);
  useEffect(() => {
    if (activeSubTab === "appointments" || activeSubTab === "dashboard") fetchAppointments();
  }, [activeSubTab, tenantSlug]);

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/booking/services?tenantSlug=${tenantSlug}&id=${id}`, { method: "DELETE" });
    fetchServices();
  };

  const handleCancelAppt = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    await fetch(`/api/booking/appointments?tenantSlug=${tenantSlug}&id=${id}`, { method: "DELETE" });
    fetchAppointments();
  };

  const copyTag = (serviceId: string) => {
    navigator.clipboard.writeText(`[BOOK:${serviceId}]`);
    setCopiedId(serviceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const subTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "services", label: "Services", icon: Star },
    { id: "schedule", label: "Availability", icon: Clock },
    { id: "appointments", label: "All Bookings", icon: Users },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "storefront", label: "Storefront", icon: Globe },
    { id: "setup", label: "Setup Guide", icon: BookOpen }
  ] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-8 pt-6 pb-0 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-indigo-400" />
              Booking Suite
            </h2>
            <p className="text-xs text-gray-400 mt-1">Industry-grade appointment booking for consultants, doctors, astrologers & more</p>
          </div>
          <div className="flex items-center gap-2">
            {activeSubTab === "services" && (
              <button
                onClick={() => { setEditingService(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />Add Service
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5 w-full overflow-x-auto">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                  activeSubTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-5 space-y-5">
        <AnimatePresence mode="wait">

          {/* Dashboard */}
          {activeSubTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <BookingDashboard
                appointments={appointments}
                loading={loadingAppts}
                onRefresh={fetchAppointments}
                onCancel={handleCancelAppt}
              />
            </motion.div>
          )}

          {/* Services */}
          {activeSubTab === "services" && (
            <motion.div key="services" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {showForm && (
                <ServiceForm
                  service={editingService}
                  tenantSlug={tenantSlug}
                  onSave={() => { fetchServices(); setShowForm(false); setEditingService(null); }}
                  onCancel={() => { setShowForm(false); setEditingService(null); }}
                />
              )}

              {services.length === 0 && !showForm ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Star className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2">No services yet</h3>
                  <p className="text-[12px] text-gray-500 mb-5 max-w-xs">Create your first booking service — like "30-min Consultation", "Dental Checkup", or "Astrology Reading"</p>
                  <button
                    onClick={() => { setEditingService(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />Create First Service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map(svc => (
                    <motion.div
                      key={svc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-2xl border border-white/8 bg-[#0a0c1a] hover:border-indigo-500/20 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            {svc.consultationType === "online" ? <Video className="w-4 h-4 text-indigo-400" /> : svc.consultationType === "in_person" ? <MapPin className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-violet-400" />}
                          </div>
                          <div>
                            <h4 className="text-[12.5px] font-bold text-white truncate max-w-[140px]">{svc.name}</h4>
                            <p className="text-[9px] text-gray-600 uppercase tracking-widest">{svc.consultationType === "online" ? "Online" : svc.consultationType === "in_person" ? "In-Person" : "Both"}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full mt-1 ${svc.isActive ? "bg-emerald-500" : "bg-gray-600"}`} />
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{svc.description || "No description"}</p>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" />{svc.durationMinutes}min
                          {svc.bufferMinutes ? <span className="text-gray-600 ml-0.5">+{svc.bufferMinutes}m gap</span> : null}
                        </span>
                        {svc.offerPrice != null && svc.offerPrice > 0 && svc.offerPrice < svc.price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-600 line-through">{formatPrice(svc.price, svc.currency)}</span>
                            <span className="text-[13px] font-black text-amber-400">{formatPrice(svc.offerPrice, svc.currency)}</span>
                            <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-full">
                              {Math.round(((svc.price - svc.offerPrice) / svc.price) * 100)}% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] font-black text-indigo-300">{formatPrice(svc.price, svc.currency)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[9.5px] text-gray-500">
                        <span className="text-indigo-400 flex-1 truncate">[BOOK:{svc.id}]</span>
                        <button onClick={() => copyTag(svc.id)} className="text-gray-600 hover:text-indigo-400 transition-colors shrink-0">
                          {copiedId === svc.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => { setEditingService(svc); setShowForm(true); }}
                          className="flex-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/8 text-gray-400 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="flex-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Schedule */}
          {activeSubTab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ScheduleBuilder tenantSlug={tenantSlug} timezone={timezone} />
            </motion.div>
          )}

          {/* All Bookings (detailed list) */}
          {activeSubTab === "appointments" && (
            <motion.div key="appointments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-white">All Appointments</h3>
                <button onClick={fetchAppointments} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingAppts ? (
                <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="w-10 h-10 text-gray-700 mb-3" />
                  <p className="text-[13px] text-gray-500">No appointments yet</p>
                  <p className="text-[11px] text-gray-600 mt-1">Bookings made via the chat widget will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(appt => (
                    <AppointmentCard key={appt.id} appt={appt} onCancel={handleCancelAppt} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Integrations */}
          {activeSubTab === "integrations" && (
            <motion.div key="integrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <BookingIntegrationsPanel tenantSlug={tenantSlug} />
            </motion.div>
          )}

          {/* Storefront Editor */}
          {activeSubTab === "storefront" && (
            <motion.div key="storefront" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StorefrontEditor tenantSlug={tenantSlug} />
            </motion.div>
          )}

          {/* Setup Guide */}
          {activeSubTab === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#0d1021] to-[#080a16]">
                <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Booking Suite Setup Guide
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Create Your Services",
                      desc: "Go to the Services tab → Add Service. Create services for each consultation type (e.g. 'Astrology Reading - 60min', 'Initial Consultation - 30min'). Set pricing, duration, and whether it's online or in-person.",
                      done: services.length > 0
                    },
                    {
                      step: 2,
                      title: "Set Your Weekly Availability",
                      desc: "Go to Availability → set working hours for each day. Toggle days on/off for unavailable days. These become the booking slots clients see.",
                      done: false
                    },
                    {
                      step: 3,
                      title: "Enable the Booking Skill on Your Agent",
                      desc: "Go to Chat Studio → Agent Settings → Active Skills. Enable 'calendar_booking'. The agent will use [BOOK:service_id] tags to show interactive booking widgets inside the chat.",
                      done: false
                    },
                    {
                      step: 4,
                      title: "Add [BOOK:service_id] to System Prompt",
                      desc: "In your agent's system prompt, tell the AI when to trigger bookings. Example: 'When user wants to book, output [BOOK:YOUR_SERVICE_ID]'. Copy the tag from any service card in the Services tab.",
                      done: false
                    },
                    {
                      step: 5,
                      title: "(Optional) Connect Zoom for Auto Video Links",
                      desc: "Go to Integrations → Zoom section. Enter your Zoom Server-to-Server OAuth credentials (Account ID, Client ID, Client Secret). Zoom links will be auto-created on every booking and sent in the confirmation email.",
                      done: false
                    },
                    {
                      step: 6,
                      title: "(Optional) Configure Gmail for Auto Emails",
                      desc: "In Integrations → Gmail/SMTP. Enable 2FA on Google Account, then create an App Password at myaccount.google.com/apppasswords. Auto-sends: booking confirmation (with ICS invite), cancellation notice, reschedule, and payment receipt.",
                      done: false
                    },
                    {
                      step: 7,
                      title: "(Optional) Connect Google Calendar",
                      desc: "In Integrations → Google Calendar. Bookings will auto-sync to your Google Calendar with both client and consultant as attendees. Requires a Google Cloud service account.",
                      done: false
                    }
                  ].map(({ step, title, desc, done }) => (
                    <div key={step} className="flex gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-white/5 border border-white/10"}`}>
                        {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[11px] font-black text-gray-500">{step}</span>}
                      </div>
                      <div>
                        <h4 className={`text-[12.5px] font-bold mb-0.5 ${done ? "text-emerald-300" : "text-white"}`}>{title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Calendar detailed docs */}
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <h3 className="text-[13px] font-bold text-white mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Google Calendar — Full Setup
                </h3>
                <p className="text-[10px] text-gray-500 mb-4">Follow these steps to connect your Google Calendar so every booking is automatically added with both parties as attendees.</p>
                <div className="space-y-3">
                  {[
                    { n: 1, text: "Go to console.cloud.google.com and create a new project (or select an existing one)." },
                    { n: 2, text: "In the project, go to APIs & Services → Library → Search 'Google Calendar API' → Enable it." },
                    { n: 3, text: "Go to IAM & Admin → Service Accounts → Create Service Account. Give it a name (e.g. 'aether-booking'), click Done." },
                    { n: 4, text: "Click the service account → Keys tab → Add Key → Create new key → JSON → Download the file. This is your service account JSON." },
                    { n: 5, text: "Open Google Calendar in a browser. Find your calendar under 'My calendars', click the 3 dots → Settings." },
                    { n: 6, text: "In calendar settings, scroll to 'Share with specific people' → Add the service account email (looks like name@project.iam.gserviceaccount.com) → Set permission to 'Make changes to events'." },
                    { n: 7, text: "Scroll to 'Integrate calendar' → Copy the Calendar ID (looks like xxxxxx@group.calendar.google.com or your@gmail.com for primary)." },
                    { n: 8, text: "In Integrations tab: Paste the Calendar ID. Open the downloaded JSON file, copy all contents and paste into the Service Account JSON field. Click Save." }
                  ].map(({ n, text }) => (
                    <div key={n} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-black text-emerald-400">{n}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Prompt Examples */}
              <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5">
                <h3 className="text-[13px] font-bold text-white mb-3">AI System Prompt Snippets</h3>
                <div className="space-y-3">
                  {[
                    {
                      title: "Astrologer / Spiritual Consultant",
                      prompt: `You are [Name], an expert astrologer and spiritual guide. When a user wants to book a consultation, session, or reading, immediately show the booking calendar using [BOOK:YOUR_SERVICE_ID]. Guide them through the booking process naturally. After they book, confirm the time and let them know they'll receive a Zoom link.`
                    },
                    {
                      title: "Doctor / Medical Consultant",
                      prompt: `You are the virtual assistant for [Clinic Name]. When a patient wants to book an appointment or consultation, use [BOOK:YOUR_SERVICE_ID] to show available slots. Collect their symptoms/concerns in the notes field. Remind them to bring relevant medical reports.`
                    },
                    {
                      title: "Business / Life Coach",
                      prompt: `You are [Coach Name]'s AI assistant. When someone is ready to book a strategy session or coaching call, use [BOOK:YOUR_SERVICE_ID] to show the scheduling widget. The session is held via Zoom — a link will be generated automatically.`
                    }
                  ].map(({ title, prompt }) => (
                    <div key={title} className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <p className="text-[10px] font-bold text-violet-400 mb-1.5">{title}</p>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
