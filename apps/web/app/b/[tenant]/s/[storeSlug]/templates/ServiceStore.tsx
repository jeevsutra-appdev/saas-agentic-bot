"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Phone, Mail, MapPin, Star, CheckCircle2,
  ChevronRight, X, User, ArrowLeft, Loader2, MessageSquare,
  Award, Shield, Heart, Sparkles, ChevronDown
} from "lucide-react";

interface Props {
  store: any;
  tenantSlug: string;
}

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
];

const SERVICES_FALLBACK = [
  { id: "s1", name: "Initial Consultation", duration: 30, price: 500, icon: "💬", desc: "First-time meeting to understand your needs" },
  { id: "s2", name: "Follow-up Session", duration: 20, price: 300, icon: "🔄", desc: "Review and follow-up on treatment plan" },
  { id: "s3", name: "Full Checkup", duration: 60, price: 1200, icon: "🩺", desc: "Complete health/diagnosis session" },
  { id: "s4", name: "Emergency Visit", duration: 15, price: 800, icon: "🚨", desc: "Urgent appointment slot" },
];

const TEAM_FALLBACK = [
  { id: "t1", name: "Dr. Arif Rahman", role: "Senior Consultant", avatar: "👨‍⚕️", rating: 4.9, reviews: 312 },
  { id: "t2", name: "Dr. Nadia Islam", role: "Specialist", avatar: "👩‍⚕️", rating: 4.8, reviews: 245 },
];

export default function ServiceStore({ store, tenantSlug }: Props) {
  const primary = store.primaryColor || "#10b981";

  const [activeTab, setActiveTab] = useState<"home" | "book" | "about">("home");
  const [bookStep, setBookStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState<any | null>(null);
  const [services, setServices] = useState(SERVICES_FALLBACK);
  const [team, setTeam] = useState(TEAM_FALLBACK);

  // Generate next 14 days
  const getNext14Days = () => {
    const days: { label: string; value: string; dayName: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en", { weekday: "short" });
      const label = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      days.push({ label, value, dayName });
    }
    return days;
  };

  const days = getNext14Days();

  const handleBookAppointment = async () => {
    if (!clientName || !clientPhone || !selectedService || !selectedDate || !selectedSlot) return;
    setIsBooking(true);
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: store.id,
          buyerName: clientName,
          buyerPhone: clientPhone,
          buyerEmail: clientEmail,
          amountCents: Math.round((selectedService.price || 0) * 100),
          paymentMethod: "cod",
          itemsJson: JSON.stringify([{
            id: selectedService.id,
            name: selectedService.name,
            price: selectedService.price,
            quantity: 1,
            appointmentDate: selectedDate,
            appointmentTime: selectedSlot,
            assignedTo: selectedTeam?.name
          }]),
          status: "pending",
          deliveryAddress: clientNote || "",
          type: "appointment"
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingDone({ ...data.order, service: selectedService, slot: selectedSlot, date: selectedDate, teamMember: selectedTeam });
        setBookStep(4);
      }
    } catch (e) {}
    finally { setIsBooking(false); }
  };

  const currency = "৳";

  return (
    <div className="min-h-screen bg-[#02040A] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071a10] to-[#02040A]" />
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 30% 50%, ${primary}20 0%, transparent 70%)` }} />

        <div className="relative max-w-2xl mx-auto px-5 pt-10 pb-8">
          <div className="flex items-center gap-4 mb-6">
            {store.brandLogo ? (
              <div className="shrink-0 flex items-center" style={{ height: store.brandLogoHeight || 56 }}>
                <img loading="lazy" src={store.brandLogo} alt={store.name}
                  className="rounded-2xl object-contain"
                  style={{ height: store.brandLogoHeight || 56, width: "auto", maxWidth: 120 }} />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border-2" style={{ borderColor: primary + "50" }}>
                {store.image ? (
                  <img loading="lazy" src={store.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: primary + "20" }}>🏥</div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-black text-xl leading-tight">{store.name}</h1>
              {store.description && <p className="text-gray-400 text-sm mt-0.5">{store.description}</p>}
            </div>
          </div>

          {/* Rating + info chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-bold">4.9 Rating</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-full">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span className="text-gray-300 text-xs">Verified</span>
            </div>
            {store.settings?.workingHours && (
              <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-full">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300 text-xs">{store.settings.workingHours}</span>
              </div>
            )}
            {store.settings?.address && (
              <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-full">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300 text-xs truncate max-w-[140px]">{store.settings.address}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CTA Book button */}
      <div className="max-w-2xl mx-auto px-5 -mt-2 pb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { setActiveTab("book"); setBookStep(1); }}
          className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${primary}, ${primary}bb)`, boxShadow: `0 0 40px ${primary}40` }}
        >
          <Calendar className="h-5 w-5" />
          Book Appointment
        </motion.button>
      </div>

      {/* Bottom Tab Nav */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-[#04060c]/95 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-around px-4">
        {[
          { id: "home", label: "Home", icon: "🏠" },
          { id: "book", label: "Book", icon: "📅" },
          { id: "about", label: "About", icon: "ℹ️" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === tab.id ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold text-white">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-5 pb-24">
        <AnimatePresence mode="wait">

          {/* HOME TAB */}
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">

              {/* Services */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-black text-lg">Our Services</h2>
                  <button onClick={() => setActiveTab("book")} className="text-xs font-bold flex items-center gap-1 cursor-pointer" style={{ color: primary }}>
                    Book now <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(svc => (
                    <motion.button
                      key={svc.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedService(svc); setActiveTab("book"); setBookStep(2); }}
                      className="text-left bg-gradient-to-br from-[#0d1520] to-[#090c16] border border-white/8 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/20 transition cursor-pointer"
                    >
                      <span className="text-2xl">{svc.icon}</span>
                      <p className="text-white font-bold text-sm leading-tight">{svc.name}</p>
                      <p className="text-gray-500 text-xs line-clamp-2">{svc.desc}</p>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="font-black text-sm" style={{ color: primary }}>{currency}{svc.price}</span>
                        <span className="text-gray-600 text-xs">{svc.duration} min</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Team */}
              <section>
                <h2 className="text-white font-black text-lg mb-4">Our Team</h2>
                <div className="flex flex-col gap-3">
                  {team.map(member => (
                    <div key={member.id} className="flex items-center gap-4 bg-gradient-to-br from-[#0d1520] to-[#090c16] border border-white/8 rounded-2xl p-4">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: primary + "15", border: `1px solid ${primary}30` }}>
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-base truncate">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.role}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-300 text-xs font-bold">{member.rating}</span>
                          <span className="text-gray-600 text-xs">({member.reviews} reviews)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedTeam(member); setActiveTab("book"); setBookStep(1); }}
                        className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer text-white"
                        style={{ background: primary + "20", border: `1px solid ${primary}40`, color: primary }}
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Why us */}
              <section className="bg-gradient-to-br from-[#0d1520] to-[#090c16] border border-white/8 rounded-2xl p-5">
                <h3 className="text-white font-black text-base mb-4">Why Choose Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "⏱️", label: "On-time", desc: "Always punctual" },
                    { icon: "🏆", label: "Certified", desc: "Licensed professionals" },
                    { icon: "💬", label: "24/7 Support", desc: "Always available" },
                    { icon: "🔒", label: "Private", desc: "100% confidential" },
                  ].map(f => (
                    <div key={f.label} className="flex items-start gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                      <span className="text-xl shrink-0">{f.icon}</span>
                      <div>
                        <p className="text-white font-bold text-xs">{f.label}</p>
                        <p className="text-gray-500 text-[10px]">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* BOOK TAB */}
          {activeTab === "book" && (
            <motion.div key="book" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

              {/* Progress */}
              <div className="flex items-center gap-2 pt-2">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= bookStep ? "" : "bg-white/10"}`}
                    style={s <= bookStep ? { background: primary } : {}}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                {bookStep === 1 ? "Select a service" : bookStep === 2 ? "Choose date & time" : bookStep === 3 ? "Your details" : "Confirmed!"}
              </p>

              {/* BOOK STEP 1: Choose Service */}
              {bookStep === 1 && (
                <div className="flex flex-col gap-3">
                  {services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => { setSelectedService(svc); setBookStep(2); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition cursor-pointer ${selectedService?.id === svc.id ? "" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                      style={selectedService?.id === svc.id ? { borderColor: primary, background: primary + "15" } : {}}
                    >
                      <span className="text-3xl shrink-0">{svc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{svc.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{svc.desc}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="font-black text-sm" style={{ color: primary }}>{currency}{svc.price}</span>
                          <span className="text-gray-600 text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{svc.duration} min</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* BOOK STEP 2: Date & Time */}
              {bookStep === 2 && (
                <div className="flex flex-col gap-5">
                  {selectedService && (
                    <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3">
                      <span className="text-2xl">{selectedService.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{selectedService.name}</p>
                        <p className="text-xs" style={{ color: primary }}>{currency}{selectedService.price} · {selectedService.duration} min</p>
                      </div>
                      <button onClick={() => { setSelectedService(null); setBookStep(1); }} className="text-gray-500 hover:text-white cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Select Date</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      {days.map(day => (
                        <button
                          key={day.value}
                          onClick={() => setSelectedDate(day.value)}
                          className={`flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl shrink-0 border-2 transition cursor-pointer ${selectedDate === day.value ? "" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                          style={selectedDate === day.value ? { borderColor: primary, background: primary + "20" } : {}}
                        >
                          <span className={`text-[10px] font-bold ${selectedDate === day.value ? "text-white" : "text-gray-500"}`}>{day.dayName}</span>
                          <span className={`text-base font-black ${selectedDate === day.value ? "text-white" : "text-gray-300"}`}>{day.label.split(" ")[1]}</span>
                          <span className={`text-[9px] ${selectedDate === day.value ? "text-white/70" : "text-gray-600"}`}>{day.label.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Select Time</p>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${selectedSlot === slot ? "" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"}`}
                            style={selectedSlot === slot ? { borderColor: primary, background: primary + "20", color: "white" } : {}}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => setBookStep(3)}
                    className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer disabled:opacity-40"
                    style={{ background: primary }}
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* BOOK STEP 3: Details */}
              {bookStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service</span>
                      <span className="text-white font-bold">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="text-white font-bold">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time</span>
                      <span className="text-white font-bold">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/8 pt-2 mt-1">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-black text-base" style={{ color: primary }}>{currency}{selectedService?.price}</span>
                    </div>
                  </div>

                  {[
                    { label: "Your Name *", value: clientName, setter: setClientName, placeholder: "Full name" },
                    { label: "Phone *", value: clientPhone, setter: setClientPhone, placeholder: "+880 1234 567890" },
                    { label: "Email", value: clientEmail, setter: setClientEmail, placeholder: "email@example.com" },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">{field.label}</label>
                      <input
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Note / Reason</label>
                    <textarea
                      value={clientNote}
                      onChange={e => setClientNote(e.target.value)}
                      placeholder="Brief description of your concern..."
                      rows={2}
                      className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none"
                    />
                  </div>

                  <button
                    disabled={!clientName || !clientPhone || isBooking}
                    onClick={handleBookAppointment}
                    className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: primary }}
                  >
                    {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Calendar className="h-5 w-5" /> Confirm Booking</>}
                  </button>
                </div>
              )}

              {/* BOOK STEP 4: Done */}
              {bookStep === 4 && bookingDone && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center gap-5 py-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl"
                  >🗓️</motion.div>
                  <div>
                    <h2 className="text-white font-black text-2xl">Booking Confirmed!</h2>
                    <p className="text-gray-400 text-sm mt-1">We'll see you soon, {clientName}</p>
                  </div>

                  <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-left flex flex-col gap-3">
                    {[
                      { label: "Service", value: bookingDone.service?.name },
                      { label: "Date", value: bookingDone.date },
                      { label: "Time", value: bookingDone.slot },
                      { label: "Fee", value: `${currency}${bookingDone.service?.price}` },
                      { label: "Booking ID", value: `#${bookingDone.id?.substring(6, 14).toUpperCase()}` },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="text-white font-bold">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {store.settings?.phone && (
                    <a href={`tel:${store.settings.phone}`} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 text-white font-bold text-sm cursor-pointer hover:bg-white/5 transition">
                      <Phone className="h-4 w-4" /> Call Us: {store.settings.phone}
                    </a>
                  )}

                  <button
                    onClick={() => { setBookStep(1); setSelectedService(null); setSelectedDate(""); setSelectedSlot(""); setBookingDone(null); setClientName(""); setClientPhone(""); setClientEmail(""); setClientNote(""); setActiveTab("home"); }}
                    className="w-full py-3 rounded-2xl bg-white/10 text-white font-bold text-sm cursor-pointer hover:bg-white/15 transition"
                  >
                    Back to Home
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 py-2">
              <div className="bg-gradient-to-br from-[#0d1520] to-[#090c16] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
                <h2 className="text-white font-black text-lg">About {store.name}</h2>
                {store.description && <p className="text-gray-400 text-sm leading-relaxed">{store.description}</p>}

                {store.settings?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">{store.settings.address}</p>
                  </div>
                )}
                {store.settings?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <a href={`tel:${store.settings.phone}`} className="text-indigo-400 text-sm font-bold">{store.settings.phone}</a>
                  </div>
                )}
                {store.settings?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${store.settings.email}`} className="text-indigo-400 text-sm">{store.settings.email}</a>
                  </div>
                )}
                {store.settings?.workingHours && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <p className="text-gray-300 text-sm">{store.settings.workingHours}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setActiveTab("book"); setBookStep(1); }}
                className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}bb)` }}
              >
                <Calendar className="h-5 w-5" /> Book Appointment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
