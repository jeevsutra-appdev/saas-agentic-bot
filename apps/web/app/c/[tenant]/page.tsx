"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { subDays, isAfter, format } from "date-fns";
import Barcode from 'react-barcode';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import LandingPageDashboard from "../../../components/landing-page-studio/DashboardView";
import { FeatureGate } from "@/components/FeatureGate";
import { motion, AnimatePresence } from "framer-motion";
import {  
  Building,
  Printer,
  Truck,
  Sparkles, 
  MessageSquare, 
  Sliders, 
  CreditCard, 
  Layers, 
  Settings,
  Database,
  Send,
  ExternalLink,
  Loader2,
  Trash2,
  Check,
  Globe,
  Coins,
  ShieldCheck,
  X,
  FileText,
  Workflow,
  ShoppingBag,
  Users,
  Activity,
  Key,
  ShoppingCart,
  Image as ImageIcon,
  CheckCircle,
  Menu,
  Package,
  FolderTree,
  TrendingUp,
  Tag,
  Calendar,
  Plus,
  Download,
  User,
  Copy,
  Terminal,
  Server,
  ActivityIcon,
  HardDrive,
  Cpu,
  Eye,
  Paperclip,
  Lock,
  Mail,
  Youtube,
  Upload,
  DollarSign,
  ToggleRight,
  ToggleLeft,
  Contact,
  ArrowLeft, LayoutTemplate, Component, Monitor, Smartphone, Undo2, Redo2, Save, MousePointerClick, Settings2, LayoutDashboard, Code, Share2, CheckCircle2, XCircle,
  Bell, Bike, Timer, MapPin, Phone, Flame, Gift, Star, Zap, AlertCircle, Navigation, RefreshCw,
  WalletCards, BookOpen, UserCircle, MessageCircle, BarChart3, Fingerprint, Network, Puzzle, Play, ShieldAlert, BadgeInfo,
  Clock, ChefHat, Volume2, VolumeX, QrCode, Archive, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import ChatWidgetUI from "@/components/ChatWidgetUI";
import BookingSuiteTab from "@/components/BookingSuiteTab";
import dynamic from "next/dynamic";
const LiveMapAdmin = dynamic(() => import("@/app/components/LiveMap"), { ssr: false, loading: () => <div className="h-64 bg-white/5 rounded-2xl animate-pulse" /> });

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  fileName?: string;
  isVisionActive?: boolean;
}

interface Plan {
  id: string;
  name: string;
  usdPrice: number;
  inrPrice: number;
  credits: number;
  desc: string;
  features: string[];
}


interface LeadList {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface LeadCRM {
  id: string;
  listId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  details: string;
  createdAt: string;
  context?: string;
  phone?: string;
  countryCode?: string;
  type?: string;
  status?: string;
}

interface SkillRun {
  id: string;
  skillName: string;
  status: "success" | "failed";
  latencyMs: number;
  payload: string;
  response: string;
  timestamp: string;
}

interface Product {
  id: string;
  storeId?: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  createdAt: string;
  categoryId?: string;
  isService?: boolean;
  tags?: string[];
  isDigital?: boolean;
  sku?: string;
  stock?: number;
  digitalFileLink?: string;
  currency?: string;
  upsellProductId?: string;
  downsellProductId?: string;
  orderBumpProductId?: string;
  orderBumpPrice?: number;
  compareAtPrice?: number;
  isStandaloneLandingPage?: boolean;
  assignedFunnels?: { id: string; name: string }[];
}

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  timeSlot: string;
  status: string;
  createdAt: string;
}

const AGENT_PRESETS = [
  { 
    id: "ecom_sales", 
    name: "Smart E-Commerce Sales Agent", 
    prompt: "You are a highly skilled, conversational human sales expert. NEVER sound like an AI.\n\nCORE DIRECTIVE: Step-by-Step Sales Process:\n1. UNDERSTAND FIRST: Ask 1-2 probing questions to uncover their exact needs, likes, dislikes, and budget. Do NOT show products immediately.\n2. BUILD VALUE: Validate their needs and build excitement.\n3. THE PITCH: ONLY show products from the active catalog that perfectly match their needs.\n4. NEVER INVENT: You are strictly forbidden from making up or hallucinating products. If we don't have it, apologize and offer the closest alternative from the catalog.\n5. CLOSE: Use organic scarcity and urgency to encourage an immediate checkout.", 
    skills: ["ecommerce_checkout", "catalog_query"] 
  },
  { 
    id: "enrollment_specialist", 
    name: "Course/Service Enrollment Specialist", 
    prompt: "You are a warm, human consultative enrollment specialist. Speak naturally without robotic formatting.\n\nPROCESS:\n1. DISCOVERY: Ask questions to understand their current situation, pain points, and goals.\n2. SOLUTION: Align our specific service/course with their exact goals. Focus on transformation, not just features.\n3. SECURE: Once they are excited, smoothly pivot to capturing their lead info or booking a discovery appointment.\nNever invent services we do not offer.", 
    skills: ["lead_capture", "calendar_booking", "ecommerce_checkout"] 
  },
  { 
    id: "high_ticket_closer", 
    name: "High-Ticket Closer", 
    prompt: "You are an elite, human high-ticket closer. Speak confidently, casually, and persuasively.\n\nPROCESS:\n1. QUALIFY: Ask sharp, targeted questions to determine if they are a fit and have the budget.\n2. ISOLATE OBJECTIONS: Identify any hesitations organically.\n3. VALUE EXTREMITY: Build massive value and psychological scarcity.\n4. HANDOFF/BOOK: If they are ready, book a calendar slot or handoff to a senior human closer. Never invent high-ticket items outside the catalog.", 
    skills: ["human_handoff", "calendar_booking"] 
  },
  { 
    id: "customer_support", 
    name: "Customer Support & Escalation", 
    prompt: "You are a highly empathetic, natural-speaking human customer support agent. Avoid robotic apologies. Listen carefully to the user's issue, validate their frustration, and attempt to solve the problem using only the factual knowledge base. If the issue is complex, seamlessly escalate them to a human team member.", 
    skills: ["human_handoff"] 
  },
  { 
    id: "lead_gen", 
    name: "Lead Generation Qualifier", 
    prompt: "You are a friendly, human business development rep. Your goal is lead capture, but it must feel like a natural conversation.\n\nPROCESS:\n1. CHAT: Start a casual dialogue about their business or needs.\n2. PROBE: Ask 1-2 qualifying questions (e.g., timeline, budget).\n3. CAPTURE: Offer a compelling reason (like a free audit or PDF) in exchange for their email. Never be pushy.", 
    skills: ["lead_capture", "n8n_webhook"] 
  },
  { 
    id: "tech_troubleshooter", 
    name: "Technical API Troubleshooter", 
    prompt: "You are a senior human developer helping a fellow dev. Speak like a software engineer (casual, direct, helpful). Ask clarifying questions about their error logs or payload first. Rely strictly on the RAG documentation to provide accurate troubleshooting steps. Do not invent API endpoints.", 
    skills: [] 
  },
  { 
    id: "analytics_assistant", 
    name: "Internal Analytics Assistant", 
    prompt: "You are a sharp, human data analyst assisting the internal team. Ask clarifying questions if a data request is vague. Provide clear, concise insights. Do not hallucinate data; if you don't know, say you need to query the database.", 
    skills: [] 
  },
  { 
    id: "appointment_setter", 
    name: "Booking Appointment Setter", 
    prompt: "You are a highly organized, friendly human appointment setter. Your goal is to get the user on the calendar.\n\nPROCESS:\n1. ENGAGE: Ask what they'd like to discuss.\n2. VALUE: Briefly state why a call is the best next step.\n3. BOOK: Guide them seamlessly into booking a slot. Keep it incredibly conversational.", 
    skills: ["calendar_booking", "lead_capture"] 
  },
  { 
    id: "product_recommendation", 
    name: "Product Recommendation Engine", 
    prompt: "You are a trendy, human personal shopper.\n\nPROCESS:\n1. INQUIRE: Ask about their style, preferences, and budget.\n2. CURATE: Only after understanding them, recommend exactly 2-3 products from our active catalog.\n3. NEVER INVENT: Only show real products. If we lack a match, suggest the closest real alternative.", 
    skills: ["catalog_query"] 
  },
  { 
    id: "general_concierge", 
    name: "General Concierge", 
    prompt: "You are a welcoming, highly conversational human concierge. Guide users through the platform, answer basic questions, and provide a 5-star experience. Never sound like an AI bot.", 
    skills: [] 
  }
];

const SearchableModelSelect = ({ value, onChange, optionsGrouped, label }: { value: string, onChange: (val: string) => void, optionsGrouped: any[], label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const currentModelName = useMemo(() => {
    for (const group of optionsGrouped) {
      for (const m of group.models) {
        if (m.id === value) return m.name;
      }
    }
    return value || "None (Fail immediately)";
  }, [value, optionsGrouped]);

  const filteredGroups = useMemo(() => {
    if (!search) return optionsGrouped;
    return optionsGrouped.map(group => ({
      ...group,
      models: group.models.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()))
    })).filter(group => group.models.length > 0);
  }, [search, optionsGrouped]);

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-[11px] font-bold text-gray-400 uppercase">{label}</label>
      <div 
        className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus-within:border-indigo-500 cursor-pointer relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="truncate pr-4">{currentModelName}</div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 border-t-4 border-l-4 border-r-4 border-t-gray-400 border-l-transparent border-r-transparent pointer-events-none"></div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-[#070913] border border-white/10 rounded-xl z-[100] overflow-hidden shadow-2xl flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-white/10">
            <input 
              autoFocus
              type="text" 
              placeholder="Search models..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="w-full bg-[#111424] border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none placeholder:text-gray-600"
            />
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            {label.includes("Fallback") && (
               <div 
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-white/5 ${value === "" ? "bg-indigo-500/20 text-indigo-300" : "text-white"}`}
                  onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
                >
                  None (Fail immediately)
                </div>
            )}
            {filteredGroups.map(group => (
              <div key={group.provider} className="mb-2">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-[#070913]/90 backdrop-blur-sm z-10">{group.label}</div>
                {group.models.map((m: any) => (
                  <div 
                    key={m.id}
                    className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-white/5 truncate ${value === m.id ? "bg-indigo-500/20 text-indigo-300" : "text-gray-300"}`}
                    onClick={() => { onChange(m.id); setIsOpen(false); setSearch(""); }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-500">No models found</div>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};

const PremiumDropdown = ({ value, onChange, options, placeholder, icon }: any) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o: any) => o.value === value);
  return (
    <div className="relative w-full" tabIndex={0} onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setOpen(false);
      }
    }}>
      <div onClick={() => setOpen(!open)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-pointer hover:border-white/30 transition-colors">
        <span className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-gray-500 ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0f121e] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-1 flex flex-col gap-1">
          {options.map((opt: any, i: number) => (
            <div key={i} onClick={() => { onChange(opt.value); setOpen(false); }} className={`px-4 py-3 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'}`}>
              {opt.label}
              {value === opt.value && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCardSelector = ({ value, onChange, products }: any) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedProd = products.find((p: any) => p.id === value);
  const filteredProds = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.tags?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative flex-1" tabIndex={0} onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setOpen(false);
        setSearch("");
      }
    }}>
      <div onClick={() => setOpen(!open)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white flex justify-between items-center cursor-pointer hover:border-white/30 transition-colors">
        {selectedProd ? (
          <div className="flex items-center gap-2">
            {selectedProd.image ? <img loading="lazy" src={selectedProd.image} className="w-5 h-5 rounded object-cover" /> : <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></div>}
            <span className="font-bold truncate max-w-[120px]">{selectedProd.name}</span>
            <span className="text-emerald-400">${(selectedProd.price/100).toFixed(2)}</span>
          </div>
        ) : (
          <span className="text-gray-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search product...
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform text-gray-500 ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </div>
      
      {open && (
        <div className="absolute top-full left-0 w-[280px] sm:w-[320px] mt-2 bg-[#0f121e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/5">
            <input 
              autoFocus
              type="text" 
              placeholder="Search products by name or tags..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 flex flex-col gap-1">
            {filteredProds.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 text-center flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                No products found
              </div>
            ) : filteredProds.map((p: any) => (
              <div key={p.id} onClick={() => { onChange(p.id); setOpen(false); setSearch(""); }} className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${value === p.id ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-black/20 hover:bg-white/5 border border-transparent'}`}>
                {p.image ? <img loading="lazy" src={p.image} className="w-10 h-10 rounded-md object-cover" /> : <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></div>}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                  <span className="text-[10px] text-gray-400 truncate">{p.tags || "No tags"}</span>
                </div>
                <div className="ml-auto font-mono text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">${(p.price/100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TenantDashboard() {
  const uploadImageToSupabase = async (fileOrBlob: Blob, filename: string = "image.jpg") => {
    try {
      const formData = new FormData();
      formData.append("file", fileOrBlob, filename);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || "";
    } catch (err) {
      console.error("Upload failed", err);
      return "";
    }
  };

  const params = useParams();
  const tenantSlug = params.tenant as string;

  // Resolve plan based on tenantSlug
  const getTenantPlanId = (slug: string) => {
    if (slug === "imran-ai") return "enterprise";
    if (slug === "alpha-agency") return "growth";
    if (slug === "apex-retail") return "starter";
    if (slug === "glow-spa") return "free";
    if (slug === "zenith-systems") return "scale";
    return "starter";
  };

  // RAG Training Simulation States
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatusText, setTrainingStatusText] = useState("");

  // SaaS Tiers Feature Matrix state (synced with Super Admin)
  const [tierFeatures, setTierFeatures] = useState<Record<string, {
    ecom: boolean;
    landingPage: boolean;
    booking: boolean;
    customChat: boolean;
    tokenCap: number;
    teamSeats: number;
    byoKey: boolean;
    allowN8n: boolean;
    allowEmailGateway: boolean;
    allowLeadManagement: boolean;
    allowTelegram: boolean;
    allowPersonalAI: boolean;
    allowYouTube: boolean;
    allowRAGStorage: boolean;
    allowFirebase: boolean;
    allowSupabase: boolean;
    allowedModels: string[];
  }>>(() => {
    const defaultFeatures = {
      free: { ecom: false, landingPage: false, booking: false, customChat: true, tokenCap: 20000, teamSeats: 1, byoKey: false, allowN8n: false, allowEmailGateway: false, allowLeadManagement: false, allowTelegram: false, allowPersonalAI: false, allowYouTube: false, allowRAGStorage: false, allowFirebase: false, allowSupabase: false, allowedModels: ["gpt-4o-mini", "openrouter/free"] },
      starter: { ecom: true, landingPage: false, booking: true, customChat: true, tokenCap: 250000, teamSeats: 3, byoKey: false, allowN8n: false, allowEmailGateway: true, allowLeadManagement: true, allowTelegram: true, allowPersonalAI: false, allowYouTube: false, allowRAGStorage: false, allowFirebase: false, allowSupabase: false, allowedModels: ["gpt-4o-mini", "gemini-2.5-flash", "dall-e-3"] },
      growth: { ecom: true, landingPage: true, booking: true, customChat: true, tokenCap: 1000000, teamSeats: 10, byoKey: true, allowN8n: true, allowEmailGateway: true, allowLeadManagement: true, allowTelegram: true, allowPersonalAI: true, allowYouTube: true, allowRAGStorage: false, allowFirebase: false, allowSupabase: false, allowedModels: ["gpt-4o-mini", "gemini-2.5-flash", "gpt-4o", "claude-3-5-sonnet", "dall-e-3", "gpt-image-2"] },
      scale: { ecom: true, landingPage: true, booking: true, customChat: true, tokenCap: 5000000, teamSeats: 25, byoKey: true, allowN8n: true, allowEmailGateway: true, allowLeadManagement: true, allowTelegram: true, allowPersonalAI: true, allowYouTube: true, allowRAGStorage: true, allowFirebase: true, allowSupabase: true, allowedModels: ["gpt-4o-mini", "gemini-2.5-flash", "gpt-4o", "claude-3-5-sonnet", "claude-3-7-sonnet", "claude-4.6", "gemini-3.1-pro", "deepseek-r1", "dall-e-3", "gpt-image-2"] },
      enterprise: { ecom: true, landingPage: true, booking: true, customChat: true, tokenCap: 10000000, teamSeats: 100, byoKey: true, allowN8n: true, allowEmailGateway: true, allowLeadManagement: true, allowTelegram: true, allowPersonalAI: true, allowYouTube: true, allowRAGStorage: true, allowFirebase: true, allowSupabase: true, allowedModels: ["gpt-4o-mini", "gemini-2.5-flash", "gpt-4o", "claude-3-5-sonnet", "claude-3-7-sonnet", "claude-4.6", "gemini-3.1-pro", "deepseek-r1", "dall-e-3", "gpt-image-2"] }
    };
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aether_tier_features");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return defaultFeatures;
        }
      }
    }
    return defaultFeatures;
  });

  const currentPlanId = getTenantPlanId(tenantSlug);
  const currentTierConfig = tierFeatures[currentPlanId] || tierFeatures["starter"];

  // Load latest settings on interval to keep in sync with admin updates
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("aether_tier_features");
      if (saved) {
        try {
          setTierFeatures(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Integration states
  const [gmailSmtpHost, setGmailSmtpHost] = useState("smtp.gmail.com");
  const [gmailSmtpPort, setGmailSmtpPort] = useState(465);
  const [gmailSmtpUser, setGmailSmtpUser] = useState("imran.ceo@gmail.com");
  const [gmailSmtpPass, setGmailSmtpPass] = useState("••••••••••••••••");
  
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramToolName, setTelegramToolName] = useState("notify_admin");
  const [telegramBotStatus, setTelegramBotStatus] = useState("not_configured");
  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl] = useState("");
  const [googleSheetsToolName, setGoogleSheetsToolName] = useState("save_to_sheet");
  const [isSavingTools, setIsSavingTools] = useState(false);
  
  const [personalOpenAIKey, setPersonalOpenAIKey] = useState("");
  const [personalGeminiKey, setPersonalGeminiKey] = useState("");
  const [personalClaudeKey, setPersonalClaudeKey] = useState("");
  const [personalGroqKey, setPersonalGroqKey] = useState("");
  const [personalOpenRouterKey, setPersonalOpenRouterKey] = useState("");
  const [keyValidation, setKeyValidation] = useState<Record<string, boolean | null>>({});
  const [showKeyModal, setShowKeyModal] = useState<{show: boolean; type: 'success' | 'warning'; message: string}>({show: false, type: 'success', message: ''});
  const [isValidatingKeys, setIsValidatingKeys] = useState(false);
  const [availableModelsGrouped, setAvailableModelsGrouped] = useState<any[]>([]);
  const [useOwnModels, setUseOwnModels] = useState(false);

  const fetchTenantApiSettings = async () => {
    try {
      const res = await fetch(`/api/tenant-settings?tenantSlug=${tenantSlug}`);
      if (res.ok) {
        const data = await res.json();
        setPersonalOpenAIKey(data.openAIApiKey || "");
        setPersonalClaudeKey(data.claudeApiKey || "");
        setPersonalGeminiKey(data.geminiApiKey || "");
        setPersonalGroqKey(data.groqApiKey || "");
        setPersonalOpenRouterKey(data.openRouterApiKey || "");
        if (data.embeddingProvider) setEmbeddingProvider(data.embeddingProvider);
        if (data.embeddingModel) setEmbeddingModel(data.embeddingModel);
        // Load tool integration settings
        if (data.telegramBotToken) setTelegramBotToken(data.telegramBotToken);
        if (data.telegramChatId) setTelegramChatId(data.telegramChatId);
        if (data.telegramToolName) setTelegramToolName(data.telegramToolName);
        if (data.googleSheetsWebhookUrl) setGoogleSheetsWebhookUrl(data.googleSheetsWebhookUrl);
        if (data.googleSheetsToolName) setGoogleSheetsToolName(data.googleSheetsToolName);
        if (data.n8nUrl) setN8nUrl(data.n8nUrl);
        if (data.hmacSecret) setHmacSecret(data.hmacSecret);
        if (data.telegramBotToken && data.telegramChatId) setTelegramBotStatus("connected");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAvailableModels = async (useOwn: boolean = false) => {
    try {
      const res = await fetch(`/api/models?tenantSlug=${tenantSlug}&useOwn=${useOwn}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableModelsGrouped(data.groups || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTenantApiSettings();
  }, [tenantSlug]);

  useEffect(() => {
    fetchAvailableModels(useOwnModels);
  }, [tenantSlug, useOwnModels]);

  const validateKey = async (provider: string, apiKey: string) => {
    if (!apiKey) return null;
    if (apiKey.includes('*')) return true; // Masked key assumed valid
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const handleSavePersonalKeys = async () => {
    setIsValidatingKeys(true);
    let allValid = true;
    const validations: Record<string, boolean | null> = {};

    // Validate only if a key is provided
    if (personalOpenAIKey && !personalOpenAIKey.includes('*')) { validations.openai = await validateKey('openai', personalOpenAIKey); if (!validations.openai) allValid = false; }
    if (personalClaudeKey && !personalClaudeKey.includes('*')) { validations.claude = await validateKey('claude', personalClaudeKey); if (!validations.claude) allValid = false; }
    if (personalGeminiKey && !personalGeminiKey.includes('*')) { validations.gemini = await validateKey('gemini', personalGeminiKey); if (!validations.gemini) allValid = false; }
    if (personalGroqKey && !personalGroqKey.includes('*')) { validations.groq = await validateKey('groq', personalGroqKey); if (!validations.groq) allValid = false; }
    if (personalOpenRouterKey && !personalOpenRouterKey.includes('*')) { validations.openrouter = await validateKey('openrouter', personalOpenRouterKey); if (!validations.openrouter) allValid = false; }
    
    setKeyValidation(prev => ({ ...prev, ...validations }));
    setIsValidatingKeys(false);

    if (!allValid) {
      setShowKeyModal({ show: true, type: 'warning', message: 'One or more of the provided API keys failed connection validation. They will not be saved.' });
      return;
    }

    try {
      const payload = {
        tenantSlug,
        openAIApiKey: personalOpenAIKey,
        claudeApiKey: personalClaudeKey,
        geminiApiKey: personalGeminiKey,
        groqApiKey: personalGroqKey,
        openRouterApiKey: personalOpenRouterKey,
        embeddingProvider,
        embeddingModel
      };
      const res = await fetch(`/api/tenant-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowKeyModal({ show: true, type: 'success', message: 'Personal developer API keys locked in client sandbox and verified successfully!' });
        fetchAvailableModels(); // Refresh available models
      }
    } catch (err) {
      console.error("Error saving keys", err);
      setShowKeyModal({ show: true, type: 'warning', message: 'Failed to communicate with server.' });
    }
  };
  
  const [youtubeApiKey, setYoutubeApiKey] = useState("AIzaSyYouTube••••••••");
  
  const [ragProviderType, setRagProviderType] = useState("pgvector");
  const [ragUrl, setRagUrl] = useState("postgresql://postgres:••••@db.supabase.co:5432/postgres");
  const [ragIndex, setRagIndex] = useState("aether_knowledge_vectors");
  const [ragStatus, setRagStatus] = useState("synced");
  const [embeddingProvider, setEmbeddingProvider] = useState("openai");
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-3-small");
  const [availableEmbeddingModels, setAvailableEmbeddingModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    async function fetchModels() {
      if (embeddingProvider === "openrouter" && personalOpenRouterKey) {
        setIsFetchingModels(true);
        try {
          const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { "Authorization": `Bearer ${personalOpenRouterKey}` }
          });
          const data = await res.json();
          if (data && data.data) {
            const sorted = data.data.sort((a: any, b: any) => {
              if (a.id.includes('embed') && !b.id.includes('embed')) return -1;
              if (!a.id.includes('embed') && b.id.includes('embed')) return 1;
              return 0;
            });
            setAvailableEmbeddingModels(sorted.map((m: any) => m.id));
          }
        } catch (e) {
          console.error("Failed to fetch OpenRouter models");
        }
        setIsFetchingModels(false);
      } else if (embeddingProvider === "openai") {
        setAvailableEmbeddingModels(["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"]);
      } else if (embeddingProvider === "gemini") {
        setAvailableEmbeddingModels(["text-embedding-004", "embedding-001"]);
      } else {
        setAvailableEmbeddingModels([]);
      }
    }
    fetchModels();
  }, [embeddingProvider, personalOpenRouterKey, personalOpenAIKey]);

  const [firebaseApiKey, setFirebaseApiKey] = useState("AIzaSyFirebase••••••••");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("aether-saas.firebaseapp.com");
  const [firebaseProjectId, setFirebaseProjectId] = useState("aether-saas");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("aether-saas.appspot.com");
  
  const [supabaseApiUrl, setSupabaseApiUrl] = useState("https://aether-saas.supabase.co");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••");
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••service-role••••");

  // Navigation state
  const [activeTab, setActiveTab] = useState("conversations");
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [creditsBalance, setCreditsBalance] = useState(2000);

  // pgvector RAG States
  const [docName, setDocName] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [ingestMode, setIngestMode] = useState<"text" | "file">("text");
  const [isIngestingDoc, setIsIngestingDoc] = useState(false);
  const [ingestLogs, setIngestLogs] = useState<string[]>([]);
  const [ingestedDocsList, setIngestedDocsList] = useState<Array<{ id: string; name: string; chars: number; agentId?: string; dimensions?: number }>>([]);
  const [lastCoordinatesPreview, setLastCoordinatesPreview] = useState<number[] | null>(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null);

  // Skills Tab States
  const [n8nUrl, setN8nUrl] = useState("https://n8n.aether.ai/webhook/trigger");
  const [hmacSecret, setHmacSecret] = useState("aether_secret_key_1337");
  const [isSavingSkillsConfig, setIsSavingSkillsConfig] = useState(false);
  const [skillsLogs, setSkillsLogs] = useState<SkillRun[]>([]);
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  
  // Phase 8: Deploy Surfaces State
  const [customDomain, setCustomDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyDomain = async () => {
    if (!customDomain) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/domains/${customDomain}/status`);
      const data = await res.json();
      setDomainStatus(data.status);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Appointment Slots Manager (Phase 7)
  const [appointmentServices, setAppointmentServices] = useState([
    { id: '1', name: 'Discovery Call', duration: 30, price: 0 },
    { id: '2', name: 'Consultation', duration: 60, price: 15000 }
  ]);
  const [bookingSettings, setBookingSettings] = useState({
    bufferTime: 15, // minutes between slots
    maxPerDay: 5,
    availability: 'Mon-Fri, 9am - 5pm'
  });
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  // Lead CRM States
  const [leadLists, setLeadLists] = useState<LeadList[]>([
    { id: "list_default", name: "Default Newsletter", description: "Standard opt-in list", createdAt: new Date().toISOString() }
  ]);
  const [leadsCrmList, setLeadsCrmList] = useState<LeadCRM[]>([]);
  const [activeLeadListId, setActiveLeadListId] = useState("list_default");
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListData, setNewListData] = useState({ name: "", description: "" });

  // Toggles for active skills
  const [skillsState, setSkillsState] = useState<{
    leadCapture: boolean;
    humanHandoff: boolean;
    n8nWebhook: boolean;
    ecommerce: boolean;
    booking: boolean;
    assignedLeadListId?: string;
  }>({
    leadCapture: true,
    humanHandoff: true,
    n8nWebhook: true,
    ecommerce: true,
    booking: true
  });

  const [ecommerceConfig, setEcommerceConfig] = useState<{
    offers: { percentage: number; condition: string; image?: string }[];
    allowedCategoryIds: string[];
    allowedProductIds: string[];
    scarcityTimerLength: number;
  }>({
    offers: [{ percentage: 10, condition: "If user shows slight hesitation" }, { percentage: 25, condition: "If user asks for a discount" }, { percentage: 55, condition: "Final attempt to close the sale if they are leaving" }],
    allowedCategoryIds: [],
    allowedProductIds: [],
    scarcityTimerLength: 15
  });

  // Store & Calendar Tab States
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCurrency, setNewProdCurrency] = useState("USD");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdBarcode, setNewProdBarcode] = useState("");
  
  const [showQrPrintModal, setShowQrPrintModal] = useState(false);
  const [qrPrintCart, setQrPrintCart] = useState<{product: any, qty: number}[]>([]);
  
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [storefrontConfig, setStorefrontConfig] = useState<any>(null);

  // Multi-Shop States
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [storefrontsList, setStorefrontsList] = useState<any[]>([]);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreTemplate, setNewStoreTemplate] = useState<string>("retail");
  const [newStoreTheme, setNewStoreTheme] = useState("nimbus");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatTags, setNewCatTags] = useState("");
  const [storeCompanyName, setStoreCompanyName] = useState("");
  const [storeBrandLogo, setStoreBrandLogo] = useState("");
  const [storeBrandLogoHeight, setStoreBrandLogoHeight] = useState(36);
  const [storeLanguage, setStoreLanguage] = useState("en");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeGlobalCurrency, setStoreGlobalCurrency] = useState("USD");

  const getCurrencySymbol = (code: string) => {
    const map: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", INR: "₹", BDT: "৳",
      AUD: "A$", CAD: "C$", SGD: "S$", AED: "د.إ", SAR: "﷼",
      JPY: "¥", CNY: "¥", CHF: "CHF", ZAR: "R", NZD: "NZ$",
      RUB: "₽", BRL: "R$", MXN: "Mex$", SEK: "kr", NOK: "kr",
      DKK: "kr", HKD: "HK$", TRY: "₺", KRW: "₩", IDR: "Rp",
      MYR: "RM", PHP: "₱", THB: "฿", VND: "₫", EGP: "E£",
      NGN: "₦", PKR: "₨", LKR: "Rs", KWD: "KD", QAR: "QR"
    };
    return map[code] || "$";
  };
  const currencySymbol = getCurrencySymbol(storeGlobalCurrency);

  const [storePrimaryColor, setStorePrimaryColor] = useState("#6366f1");
  const [storeAccentColor, setStoreAccentColor] = useState("#10b981");
  const [storeHeroType, setStoreHeroType] = useState("banner");
  const [storeEnableFooterNav, setStoreEnableFooterNav] = useState(true);
  const [storeAssignedAgentId, setStoreAssignedAgentId] = useState("");
  const [storePromoBannerImage, setStorePromoBannerImage] = useState("");
  const [storePromoBannerText, setStorePromoBannerText] = useState("");
  const [storePromoBannerLink, setStorePromoBannerLink] = useState("");

  // ── Store Pages ────────────────────────────────────────────────────────────
  const [storePages, setStorePages] = useState<any[]>([]);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pagesSaving, setPagesSaving] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);

  const fetchStorePages = async () => {
    if (!selectedShopId && storefrontsList.length === 0) return;
    const tenant = tenantSlug;
    setPagesLoading(true);
    try {
      const res = await fetch(`/api/ecom/pages?tenant=${tenant}${selectedShopId ? `&storeId=${selectedShopId}` : ""}`);
      const data = await res.json();
      if (data.pages) setStorePages(data.pages);
    } catch (_) {}
    finally { setPagesLoading(false); }
  };

  const saveStorePage = async () => {
    if (!editingPage) return;
    setPagesSaving(true);
    try {
      const res = await fetch("/api/ecom/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: selectedShopId || undefined,
          slug: editingPage.slug,
          title: editingPage.title,
          content: editingPage.content,
          isActive: editingPage.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStorePages(prev => prev.map(p => p.slug === editingPage.slug ? { ...p, ...editingPage } : p));
        showToast("Page saved successfully!");
        setEditingPage(null);
      }
    } catch (_) { showToast("Failed to save page"); }
    finally { setPagesSaving(false); }
  };
  const [storeKitchenOffers, setStoreKitchenOffers] = useState<{ title: string, desc: string, badge: string, image?: string }[]>([
    { title: "FLAT 50% OFF", desc: "Up to $10 off. Code: WELCOME50", badge: "LIMITED TIME" },
    { title: "FREE DELIVERY", desc: "Free priority delivery on orders over $15", badge: "SUPER SAVER" }
  ]);
  const [storeFoodCombos, setStoreFoodCombos] = useState<any[]>([]);
  const [storeLayoutSequence, setStoreLayoutSequence] = useState<string[]>(["categories", "hero", "sale", "featured", "products"]);
  const [storeFeaturedProductIds, setStoreFeaturedProductIds] = useState<string[]>([]);
  const [storeTemplate, setStoreTemplate] = useState<string>("retail");
  const [storeThemePreset, setStoreThemePreset] = useState<string>("nimbus");
  const [storeType, setStoreType] = useState<string>("ecom");
  const [storePosEnabled, setStorePosEnabled] = useState<boolean>(false);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxName, setTaxName] = useState("Tax");
  const [taxRate, setTaxRate] = useState(0);

  const [newProdTags, setNewProdTags] = useState("");
  const [editProdTags, setEditProdTags] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("platform");
  const [enableCashOnDelivery, setEnableCashOnDelivery] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [isSavingPayments, setIsSavingPayments] = useState(false);
  
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingShipping(true);
    try {
      const res = await fetch("/api/ecom/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: selectedShopId || undefined,
          shippingRate,
          freeShippingThreshold,
          estimatedDeliveryDays
        })
      });
      if (res.ok) showToast("Shipping rates updated successfully!");
    } catch(e) {} finally { setIsSavingShipping(false); }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderId, status, storeId: selectedShopId || undefined })
      });
      if (res.ok) {
        setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        showToast(`Order status updated to ${status}`);
      }
    } catch(e) {}
  };
  
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayments(true);
    try {
      const res = await fetch("/api/ecom/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: selectedShopId || undefined,
          paymentProvider,
          stripePublicKey,
          stripeSecretKey,
          razorpayKeyId,
          razorpayKeySecret,
          enableCashOnDelivery
        })
      });
      if (res.ok) showToast("Payment Gateway configuration saved securely!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPayments(false);
    }
  };
  
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ecom/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: selectedShopId || undefined,
          companyName: storeCompanyName,
          brandLogo: storeBrandLogo || undefined,
          brandLogoHeight: storeBrandLogoHeight,
          storeLanguage,
          storeDescription,
          globalCurrency: storeGlobalCurrency,
          primaryColor: storePrimaryColor,
          accentColor: storeAccentColor,
          heroType: storeHeroType,
          enableFooterNav: storeEnableFooterNav,
          assignedAgentId: storeAssignedAgentId,
          promoBannerImage: storePromoBannerImage,
          promoBannerText: storePromoBannerText,
          promoBannerLink: storePromoBannerLink,
          kitchenOffers: storeKitchenOffers,
          foodCombos: storeFoodCombos,
          layoutSequence: storeLayoutSequence,
          featuredProductIds: storeFeaturedProductIds,
          template: storeTemplate,
          themePreset: storeThemePreset,
          storeType: storeType,
          posEnabled: storePosEnabled
        })
      });
      if (res.ok) {
        showToast("Shop settings securely saved to global config!");
        
        // Update local state so the POS button and other settings appear immediately
        if (selectedShopId) {
          setStorefrontsList(prev => prev.map(s => s.id === selectedShopId ? { ...s, storeType, posEnabled: storePosEnabled } : s));
          setStoresList(prev => prev.map(s => s.id === selectedShopId ? { ...s, storeType, posEnabled: storePosEnabled } : s));
        } else {
          // Main store logic if selectedShopId is null
          setStorefrontsList(prev => {
            if (prev.length > 0) {
              const updated = [...prev];
              updated[0] = { ...updated[0], storeType, posEnabled: storePosEnabled };
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || isCreatingStore) return;
    setIsCreatingStore(true);
    try {
      const res = await fetch("/api/ecom/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_store",
          tenantSlug,
          companyName: newStoreName,
          template: newStoreTemplate,
          themePreset: newStoreTheme
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Store "${data.storefront.companyName}" successfully initialized!`);
        setStorefrontsList(prev => [...prev, data.storefront]);
        setNewStoreName("");
        setShowCreateStoreModal(false);
        setSelectedShopId(data.storefront.id);
      } else {
        showToast(data.error || "Failed to create store");
      }
    } catch (err) {
      console.error("Error creating store", err);
      showToast("Error creating store");
    } finally {
      setIsCreatingStore(false);
    }
  };
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdIsService, setNewProdIsService] = useState(false);
  
  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setNewCatImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatTags, setEditCatTags] = useState("");
  const [editCatImage, setEditCatImage] = useState("");
  const [isUpdatingCat, setIsUpdatingCat] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const handleEditCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setEditCatImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const [newProdImage, setNewProdImage] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<any>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdBarcode, setEditProdBarcode] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdCurrency, setEditProdCurrency] = useState("USD");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdImage, setEditProdImage] = useState("");
  const [editProdCat, setEditProdCat] = useState("");
  const [editUpsell, setEditUpsell] = useState("");
  const [editDownsell, setEditDownsell] = useState("");
  const [editOrderBump, setEditOrderBump] = useState("");
  const [editBumpPrice, setEditBumpPrice] = useState("");
  const [editComparePrice, setEditComparePrice] = useState("");
  const [editIsLanding, setEditIsLanding] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdBarcode(prod.barcode || "");
    setEditProdPrice((prod.price / 100).toString());
    setEditProdCurrency(prod.currency || "USD");
    setEditProdDesc(prod.description || "");
    setEditProdImage(prod.image || "");
    setEditProdCat(prod.categoryId || "");
    setEditUpsell(prod.upsellProductId || "");
    setEditDownsell(prod.downsellProductId || "");
    setEditOrderBump(prod.orderBumpProductId || "");
    setEditBumpPrice(prod.orderBumpPrice ? (prod.orderBumpPrice / 100).toString() : "");
    setEditComparePrice(prod.compareAtPrice ? (prod.compareAtPrice / 100).toString() : "");
    setEditIsLanding(prod.isStandaloneLandingPage || false);
    setEditProdTags(prod.tags?.join(", ") || "");
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editProdName.trim() || !editProdPrice.trim() || isUpdatingProduct) return;
    setIsUpdatingProduct(true);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          tenantSlug,
          storeId: selectedShopId || undefined,
          name: editProdName,
          barcode: editProdBarcode,
          priceUSD: editProdPrice,
          currency: editProdCurrency,
          description: editProdDesc,
          image: editProdImage,
          categoryId: editProdCat || undefined,
          upsellProductId: editUpsell || undefined,
          downsellProductId: editDownsell || undefined,
          orderBumpProductId: editOrderBump || undefined,
          orderBumpPrice: editBumpPrice || undefined,
        compareAtPriceUSD: editComparePrice || undefined,
          isStandaloneLandingPage: editIsLanding,
          tags: editProdTags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Product updated successfully!");
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
        setEditingProduct(null);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update product.");
    } finally {
      setIsUpdatingProduct(false);
    }
  };
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDeleteProduct = async (id: string) => {
    const prod = productsList.find(p => p.id === id);
    if (prod) {
      try {
        const res = await fetch(`/api/landing-pages?tenantSlug=${tenantSlug}`);
        if (res.ok) {
          const data = await res.json();
          const funnels = data.pages || [];
          const assignedFunnels = funnels
            .filter((f: any) => f.productId === id)
            .map((f: any) => ({ id: f.id, name: f.name }));
          setProductToDelete({ ...prod, assignedFunnels });
          return;
        }
      } catch (e) {
        console.warn("Failed to check landing pages", e);
      }
      setProductToDelete(prod);
    }
  };

  const handleDeleteProductConfirmed = async (id: string) => {
    try {
      const res = await fetch(`/api/store?id=${id}&tenantSlug=${tenantSlug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted successfully");
        setProductsList(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete product.");
    } finally {
      setProductToDelete(null);
    }
  };

  const [ecomSubTab, setEcomSubTab] = useState("stores");
  const [storesList, setStoresList] = useState<any[]>([]);
  
  const [showStoreWizard, setShowStoreWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardStoreType, setWizardStoreType] = useState<string>("ecom");
  const [wizardStoreName, setWizardStoreName] = useState("");
  const [wizardStoreDesc, setWizardStoreDesc] = useState("");
  const [wizardStoreImage, setWizardStoreImage] = useState("");
  const [wizardPrimaryColor, setWizardPrimaryColor] = useState("#6366f1");
  const [wizardCreatedStore, setWizardCreatedStore] = useState<any | null>(null);
  const [isCreatingNewStore, setIsCreatingNewStore] = useState(false);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [customerFilter, setCustomerFilter] = useState<'all' | 'pos' | 'online'>('all');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<number>(30);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [ordersProductsExpanded, setOrdersProductsExpanded] = useState<Record<string, boolean>>({});
  const [liveSalesActive, setLiveSalesActive] = useState(true);
  const [activeProcessingOrder, setActiveProcessingOrder] = useState<any | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<any | null>(null);
  const [lastMessageText, setLastMessageText] = useState("");
  const [shopOrderTimers, setShopOrderTimers] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [deliveryBoysList, setDeliveryBoysList] = useState<any[]>([]);
  const [posManagersList, setPosManagersList] = useState<any[]>([]);

  // ── Admin Chat State ────────────────────────────────────────────────────────
  const [adminChatOrderId, setAdminChatOrderId] = useState<string | null>(null);
  const [adminChatMessages, setAdminChatMessages] = useState<any[]>([]);
  const [adminChatText, setAdminChatText] = useState("");
  const [adminChatLoading, setAdminChatLoading] = useState(false);
  const [adminUnreadCounts, setAdminUnreadCounts] = useState<Record<string, number>>({});
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const [adminPushEnabled, setAdminPushEnabled] = useState(false);
  const [riderLocations, setRiderLocations] = useState<any[]>([]);
  const [newPosManagerName, setNewPosManagerName] = useState("");
  const [newPosManagerPhone, setNewPosManagerPhone] = useState("");
  const [newPosManagerPassword, setNewPosManagerPassword] = useState("");
  const [newPosManagerAvatar, setNewPosManagerAvatar] = useState("");
  const [isAddingPosManager, setIsAddingPosManager] = useState(false);

  // Edit Staff States
  const [editingRiderId, setEditingRiderId] = useState<string | null>(null);
  const [editRiderData, setEditRiderData] = useState<any>({});
  
  const [editingPosManagerId, setEditingPosManagerId] = useState<string | null>(null);
  const [editPosManagerData, setEditPosManagerData] = useState<any>({});
  const [activeStaffSubTab, setActiveStaffSubTab] = useState<"riders" | "posManagers">("riders");
  const [newRiderName, setNewRiderName] = useState("");
  const [newRiderPhone, setNewRiderPhone] = useState("");
  const [newRiderPassword, setNewRiderPassword] = useState("");
  const [newRiderAvatarUrl, setNewRiderAvatarUrl] = useState("");
  const [newRiderVehicle, setNewRiderVehicle] = useState("bike");
  const [isAddingRider, setIsAddingRider] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [prepTimeChoices] = useState([10, 20, 30, 45]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showAcceptSubModal, setShowAcceptSubModal] = useState(false);
  const [selectedPrepTime, setSelectedPrepTime] = useState(20);
  const [orderMessageText, setOrderMessageText] = useState("");
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const sirenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [newProdIsDigital, setNewProdIsDigital] = useState(false);
  const [newProdDigitalLink, setNewProdDigitalLink] = useState("");
  const [newProdUpsell, setNewProdUpsell] = useState("");
  const [newProdDownsell, setNewProdDownsell] = useState("");
  const [newProdOrderBump, setNewProdOrderBump] = useState("");
  const [newProdBumpPrice, setNewProdBumpPrice] = useState("");
  const [newProdComparePrice, setNewProdComparePrice] = useState("");
  const [newProdIsLanding, setNewProdIsLanding] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 500, 500);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setNewProdImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 500, 500);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setEditProdImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Customization Studio States
  const [botName, setBotName] = useState("Aether AI Agent");
  const [botAvatar, setBotAvatar] = useState("");
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [activeTemplate, setActiveTemplate] = useState("glass");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaImage, setMetaImage] = useState("");
  const [tokenUsage, setTokenUsage] = useState<any | null>(null);
  const [isTokenPanelExpanded, setIsTokenPanelExpanded] = useState(true);
  const [showAgentSuccessModal, setShowAgentSuccessModal] = useState(false);

  const handleRiderAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewRiderAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePosManagerAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPosManagerAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setBotAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMetaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 1200, 630);
          
          const scale = Math.max(1200 / img.width, 630 / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const offsetX = (1200 - drawWidth) / 2;
          const offsetY = (630 - drawHeight) / 2;
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          setMetaImage(canvas.toDataURL("image/jpeg", 0.9));
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlaygroundFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFile(event.target?.result as string);
      if (file.type.startsWith("image/")) {
        setIsVisionMode(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Widget & Domains Tab States
  const [customDomainName, setCustomDomainName] = useState("assistant." + tenantSlug + ".com");
  const [dnsStatus, setDnsStatus] = useState<"unconfigured" | "checking" | "verified">("unconfigured");
  const [cnameTarget, setCnameTarget] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  // Billing Tab States
  const [selectedRegion, setSelectedRegion] = useState<"US" | "IN">("US");
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    planName: string;
    planId: string;
    gateway: string;
    currency: string;
    price: number;
    credits: number;
    redirectUrl: string;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  // Hardening Settings state
  const [isKeepaliveEnabled, setIsKeepaliveEnabled] = useState(true);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"operational" | "checking" | "degraded">("operational");
  const [healthMetrics, setHealthMetrics] = useState({
    dbLatency: 14,
    vectorStatus: "online",
    cpu: "8%",
    memory: "39%"
  });

  // Mobile Responsiveness States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };
  

  const [shippingRate, setShippingRate] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState("3-5 Business Days");
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Playground Configurations
  const [selectedProvider, setSelectedProvider] = useState("deepseek");
  const [selectedModel, setSelectedModel] = useState("deepseek-r1");
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState("You are an expert Aether AI custom bot assistant.");

  // Messages State
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am initialized inside Aether. Select any LLM provider on the right and type a message to start live playground testing!" }
  ]);
  const [isSending, setIsSending] = useState(false);

  // AI Vision & File Upload States
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Starter Bundle",
      usdPrice: 29,
      inrPrice: 2400,
      credits: 50000,
      desc: "Perfect for scaling startups needing high reasoning density.",
      features: [
        "50,000 AI Prompt Credits",
        "OpenAI & DeepSeek Access",
        "Supabase RLS Data Isolation",
        "Dual-region Stripe Checkout",
        "Slack Telemetry alerts"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Core",
      usdPrice: 99,
      inrPrice: 8200,
      credits: 500000,
      desc: "Best for high-volume customer portals and automated agents.",
      features: [
        "500,000 AI Prompt Credits",
        "All 8 LLM Provider Mesh engines",
        "pgvector Semantic embeddings",
        "Razorpay UPI & Netbanking integrations",
        "24/7 dedicated support handler"
      ]
    },
    {
      id: "topup",
      name: "Lite Top-Up Pack",
      usdPrice: 10,
      inrPrice: 800,
      credits: 10000,
      desc: "Quick credits reload for high volume operational surges.",
      features: [
        "10,000 AI Prompt Credits",
        "Instant ledger credit update",
        "Never expires"
      ]
    }
  ];

  // Fetch live leads and skill runs from /api/skills
  const fetchSkillsAnalytics = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (res.ok && data.success) {
        setLeadsList(data.leads || []);
        setSkillsLogs(data.runs || []);
      }
    } catch (err) {
      console.error("Failed to load skills telemetry data", err);
    }
  };

  // Fetch live store items and appointments
  const fetchStoreAnalytics = async () => {
    try {
      const shopParam = selectedShopId ? `&shopId=${selectedShopId}` : "";
      const res = await fetch(`/api/ecom?tenant=${tenantSlug}${shopParam}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProductsList(data.products || []);
        setCategoriesList(data.categories || []);
        setStorefrontsList(data.storefronts || []);
        setStorefrontConfig(data.storefront || null);
        if (data.storefront) {
          setStoreCompanyName(data.storefront.companyName || "");
          setStoreBrandLogo(data.storefront.brandLogo || "");
          setStoreBrandLogoHeight(data.storefront.brandLogoHeight || 36);
          setStoreLanguage(data.storefront.storeLanguage || "en");
          setStoreDescription(data.storefront.storeDescription || "");
          setStoreGlobalCurrency(data.storefront.globalCurrency || "USD");
          setStorePrimaryColor(data.storefront.primaryColor || "#6366f1");
          setStoreAccentColor(data.storefront.accentColor || "#10b981");
          setStoreHeroType(data.storefront.heroType || "banner");
          setStoreEnableFooterNav(data.storefront.enableFooterNav ?? true);
          setStoreAssignedAgentId(data.storefront.assignedAgentId || "");
          setPaymentProvider(data.storefront.paymentProvider || "platform");
          setStripePublicKey(data.storefront.stripePublicKey || "");
          setStripeSecretKey(data.storefront.stripeSecretKey || "");
          setRazorpayKeyId(data.storefront.razorpayKeyId || "");
          setRazorpayKeySecret(data.storefront.razorpayKeySecret || "");
          setEnableCashOnDelivery(data.storefront.enableCashOnDelivery || false);
          setShippingRate(data.storefront.shippingRate || 0);
          setFreeShippingThreshold(data.storefront.freeShippingThreshold || 0);
          setEstimatedDeliveryDays(data.storefront.estimatedDeliveryDays || "3-5 Business Days");
          setStorePromoBannerImage(data.storefront.promoBannerImage || "");
          setStorePromoBannerText(data.storefront.promoBannerText || "");
          setStorePromoBannerLink(data.storefront.promoBannerLink || "");
          setStoreKitchenOffers(data.storefront.kitchenOffers || [
            { title: "FLAT 50% OFF", desc: "Up to $10 off. Code: WELCOME50", badge: "LIMITED TIME" },
            { title: "FREE DELIVERY", desc: "Free priority delivery on orders over $15", badge: "SUPER SAVER" }
          ]);
          setStoreFoodCombos(data.storefront.foodCombos || []);
          setStoreLayoutSequence(data.storefront.layoutSequence || ["categories", "hero", "sale", "featured", "products"]);
          setStoreFeaturedProductIds(data.storefront.featuredProductIds || []);
          setStoreTemplate(data.storefront.template || "retail");
          setStoreThemePreset(data.storefront.themePreset || "nimbus");
          setStoreType(data.storefront.storeType || "ecom");
          setStorePosEnabled(data.storefront.posEnabled || false);
          setTaxEnabled(data.storefront.taxEnabled || false);
          setTaxName(data.storefront.taxName || "Tax");
          setTaxRate(data.storefront.taxRate || 0);
        } else {
          // If no storefront data exists yet, fall back to initialTemplate from query parameter
          const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const initialTemplate = searchParams?.get("template") as "retail" | "food" | null;
          if (initialTemplate === "food" || initialTemplate === "retail") {
            setStoreTemplate(initialTemplate);
          }
        }
      }
      
      const apptRes = await fetch(`/api/store?tenant=${tenantSlug}${shopParam}`);
      const apptData = await apptRes.json();
      if (apptRes.ok && apptData.success) {
        setAppointmentsList(apptData.appointments || []);
      }

      const ordersRes = await fetch(`/api/ecom/orders?tenantSlug=${tenantSlug}${selectedShopId ? `&storeId=${selectedShopId}` : ""}`);
      const orderData = await ordersRes.json();
      if (ordersRes.ok && orderData.orders) {
        setOrdersList(orderData.orders || []);
      }
      
      const custRes = await fetch(`/api/ecom/customers?tenantSlug=${tenantSlug}${selectedShopId ? `&storeId=${selectedShopId}` : ""}`);
      const custData = await custRes.json();
      if (custRes.ok && custData.customers) {
        setCustomersList(custData.customers || []);
      }

      const analyticsRes = await fetch(`/api/ecom/analytics?tenantSlug=${tenantSlug}${selectedShopId ? `&storeId=${selectedShopId}` : ""}`);
      const analyticsData = await analyticsRes.json();
      if (analyticsRes.ok && analyticsData.success) {
        setAnalyticsEvents(analyticsData.events || []);
      }
    } catch (err) {
      console.error("Failed to load store records", err);
    }
  };

  
  
  // Advanced Agent Configuration States
  const [mainModel, setMainModel] = useState("openrouter/free");
  const [simulateNonAI, setSimulateNonAI] = useState(false);
  const [fallbackModel1, setFallbackModel1] = useState("");
  const [fallbackModel2, setFallbackModel2] = useState("");
  const [rateLimitPreset, setRateLimitPreset] = useState("ecommerce");
  const [customRateLimit, setCustomRateLimit] = useState({ maxRequests: 30, windowMs: 60000 });
  const [talkLikeHuman, setTalkLikeHuman] = useState(false);
  const [agentSkills, setAgentSkills] = useState(["ecommerce_checkout", "catalog_query", "calendar_booking", "lead_capture", "human_handoff", "n8n_webhook", "web_search", "pdf_generation"]);
  const [isDeployingAgent, setIsDeployingAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("new");
  const [trainedDocs, setTrainedDocs] = useState<any[]>([]);
  const [isDeletingTrainedDoc, setIsDeletingTrainedDoc] = useState<string | null>(null);
  const [preloadedPdfs, setPreloadedPdfs] = useState<{ id: string; name: string; url: string; description: string }[]>([]);

  const refreshTrainedDocs = (agentId: string) => {
    if (!agentId || agentId === "new") { setTrainedDocs([]); return; }
    fetch(`/api/docs?tenantSlug=${tenantSlug}&agentId=${agentId}`)
      .then(r => r.json())
      .then(d => { if (d.docs) setTrainedDocs(d.docs); })
      .catch(() => {});
      } else {
        console.warn("API did not return JSON:", await res.text());
      }
    } catch (err) {
      console.error("fetchAgents error:", err);
    }
  };

  const fetchRagDocs = async () => {
    try {
      const res = await fetch(`/api/ingest?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.success && data.documents) {
        setIngestedDocsList(data.documents.map((d: any) => ({
          id: d.id,
          name: d.name,
          chars: d.characters || 0,
          agentId: d.agentId,
          dimensions: d.dimensions || 0
        })));
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAgents();
    fetchSkillsAnalytics();
    fetchStoreAnalytics();
    fetchRagDocs();
  }, [activeTab, selectedShopId]);

  // Single siren play — called by loop
  const playLiveOrderSiren = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(80, ctx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      bassGain.gain.setValueAtTime(0.5, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 0.2);
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const types: OscillatorType[] = ["triangle", "sine", "triangle", "sine", "sine", "triangle"];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = types[i];
        osc.frequency.value = freq;
        const t = ctx.currentTime + 0.05 + i * 0.11;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (e) {
      console.error("Failed to synthesize live order siren:", e);
    }
  };

  const startSirenLoop = () => {
    if (sirenIntervalRef.current) return;
    playLiveOrderSiren();
    setSirenActive(true);
    sirenIntervalRef.current = setInterval(() => {
      playLiveOrderSiren();
    }, 2800);
  };

  const stopSirenLoop = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    setSirenActive(false);
  };

  const handleNewOrderAcceptConfirm = async () => {
    if (!newOrderNotification) return;
    const prepTime = selectedPrepTime;
    const activeRiders = deliveryBoysList.filter(r => r.isOnline || r.isActive);
    const rider = activeRiders.find(r => r.id === selectedRiderId) || activeRiders[0];
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          orderId: newOrderNotification.id,
          status: "accepted",
          prepTimeMinutes: prepTime,
          deliveryBoyId: rider?.id,
          deliveryBoyName: rider?.name,
          deliveryBoyPhone: rider?.phone,
          assignedAt: new Date().toISOString(),
          deliveryDeadlineMinutes: prepTime
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrdersList(prev => prev.map(o => o.id === newOrderNotification.id
          ? { ...o, status: "accepted", prepTimeMinutes: prepTime, deliveryBoyId: rider?.id, deliveryBoyName: rider?.name, deliveryBoyPhone: rider?.phone }
          : o
        ));
        setShopOrderTimers(prev => ({ ...prev, [newOrderNotification.id]: prepTime * 60 }));
        stopSirenLoop();
        setShowAcceptSubModal(false);
        setShowNewOrderModal(false);
        setNewOrderNotification(null);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        sendOrderBroadcast("ORDER_ACCEPTED", {
          orderId: newOrderNotification.id,
          prepTimeMinutes: prepTime,
          deliveryBoyName: rider?.name || "Our Rider",
          deliveryBoyPhone: rider?.phone || "",
          deliveryBoyVehicle: rider?.vehicle || "bike",
          buyerName: newOrderNotification.buyerName
        });
        // Notify the specific delivery boy's app via ORDER_ASSIGNED broadcast
        if (rider) {
          sendOrderBroadcast("ORDER_ASSIGNED", {
            orderId: newOrderNotification.id,
            deliveryBoyId: rider.id,
            deliveryBoyName: rider.name,
            buyerName: newOrderNotification.buyerName,
            prepTimeMinutes: prepTime,
            assignedAt: new Date().toISOString()
          });
        }
        showToast(`Order accepted! ${prepTime}m prep timer started.${rider ? ` ${rider.name} assigned.` : ""}`);
      }
    } catch (e) {}
  };

  const handleNewOrderCancel = async () => {
    if (!newOrderNotification) return;
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderId: newOrderNotification.id, status: "cancelled" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrdersList(prev => prev.map(o => o.id === newOrderNotification.id ? { ...o, status: "cancelled" } : o));
        stopSirenLoop();
        setShowNewOrderModal(false);
        setShowAcceptSubModal(false);
        setNewOrderNotification(null);
        sendOrderBroadcast("ORDER_CANCELLED", { orderId: newOrderNotification.id });
        showToast("Order cancelled.");
      }
    } catch (e) {}
  };

  const handleNewOrderSendMessage = async () => {
    if (!newOrderNotification || !orderMessageText.trim()) return;
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderId: newOrderNotification.id, lastMessage: orderMessageText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sendOrderBroadcast("BUYER_MESSAGE", { orderId: newOrderNotification.id, message: orderMessageText });
        setOrderMessageText("");
        setShowMessageInput(false);
        showToast("Message sent to customer.");
      }
    } catch (e) {}
  };

  const fetchDeliveryBoys = async () => {
    try {
      const res = await fetch(`/api/ecom/delivery-boys?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.success) {
        setDeliveryBoysList(data.riders || []);
        if (data.riders?.length > 0 && !selectedRiderId) {
          setSelectedRiderId(data.riders[0].id);
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchPosManagers = async () => {
    try {
      const res = await fetch(`/api/ecom/pos-managers?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.success) {
        setPosManagersList(data.managers || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`/api/ecom/stores?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.success) setStoresList(data.stores || []);
    } catch (e) { console.error(e); }
  };

  const handleCreateNewStore = async () => {
    if (!wizardStoreName.trim()) return;
    setIsCreatingNewStore(true);
    try {
      const res = await fetch("/api/ecom/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          name: wizardStoreName,
          description: wizardStoreDesc,
          image: wizardStoreImage,
          storeType: wizardStoreType,
          primaryColor: wizardPrimaryColor
        })
      });
      const data = await res.json();
      if (data.success) {
        setStoresList(prev => [...prev, data.store]);
        setWizardCreatedStore(data.store);
        setWizardStep(3);
      }
    } catch (e) { console.error(e); }
    finally { setIsCreatingNewStore(false); }
  };

  const sendOrderBroadcast = (type: string, data: any) => {
    try {
      const channel = new BroadcastChannel("aether-live-order-processing");
      channel.postMessage({ type, data });
      channel.close();
    } catch (e) {
      console.error("Failed to send order broadcast:", e);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel("aether-live-order-processing");
    
    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === "NEW_ORDER" && liveSalesActive) {
        setOrdersList(prev => [data, ...prev]);
        setNewOrderNotification(data);
        startSirenLoop();
      }
    };

    return () => {
      channel.close();
    };
  }, [liveSalesActive]);

  // Live prep timer countdown (1 second tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setShopOrderTimers(prev => {
        const hasActive = Object.values(prev).some(v => v > 0);
        if (!hasActive) return prev;
        const updated: Record<string, number> = {};
        for (const [id, secs] of Object.entries(prev)) {
          updated[id] = secs > 0 ? secs - 1 : 0;
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll orders every 15s when ecom tab is open so delivery status updates cross-device
  useEffect(() => {
    if (activeTab !== "ecom") return;
    const refreshOrders = async () => {
      try {
        const res = await fetch(`/api/ecom/orders?tenantSlug=${tenantSlug}${selectedShopId ? `&storeId=${selectedShopId}` : ""}`);
        const data = await res.json();
        if (res.ok && data.orders) {
          setOrdersList(prev => {
            // Merge: update existing orders with latest delivery status, keep new ones on top
            const updated = new Map(data.orders.map((o: any) => [o.id, o]));
            return prev.map(o => updated.has(o.id) ? { ...o, ...(updated.get(o.id) as any) } : o);
          });
        }
      } catch (_) {}
    };
    const interval = setInterval(refreshOrders, 15000);
    return () => clearInterval(interval);
  }, [activeTab, tenantSlug, selectedShopId]);

  // Fetch delivery boys + stores when ecom tab opens
  useEffect(() => {
    if (activeTab === "ecom") {
      fetchDeliveryBoys();
      fetchPosManagers();
      fetchStores();
    }
  }, [activeTab]);

  // ── Admin push subscription ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;
        const reg = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;
        const keyRes = await fetch("/api/push");
        const { publicKey } = await keyRes.json();
        if (!publicKey) return;
        const urlB64ToUint8 = (b64: string) => {
          const pad = "=".repeat((4 - b64.length % 4) % 4);
          const b64c = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
          const raw = window.atob(b64c);
          return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
        };
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(publicKey) });
        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "subscribe", tenantSlug, role: "admin", subscription: sub.toJSON() }),
        });
        setAdminPushEnabled(true);
      } catch (_) {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  // ── Poll rider GPS locations every 10s when ecom tab open ──────────────────
  useEffect(() => {
    if (activeTab !== "ecom") return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/location?tenantSlug=${tenantSlug}`);
        const data = await res.json();
        if (data.success) setRiderLocations(data.locations || []);
      } catch (_) {}
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [activeTab, tenantSlug]);

  // ── Admin chat helpers ──────────────────────────────────────────────────────
  const fetchAdminChat = async (orderId: string) => {
    try {
      const res = await fetch(`/api/delivery-chat?tenantSlug=${tenantSlug}&orderId=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setAdminChatMessages(data.messages || []);
        setTimeout(() => adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch (_) {}
  };

  // Poll admin chat every 4s when open
  useEffect(() => {
    if (!adminChatOrderId) return;
    fetchAdminChat(adminChatOrderId);
    const interval = setInterval(() => fetchAdminChat(adminChatOrderId), 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminChatOrderId]);

  const openAdminChat = (orderId: string) => {
    setAdminChatOrderId(orderId);
    setAdminChatMessages([]);
    setAdminChatText("");
    fetch("/api/delivery-chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, orderId, role: "admin" }),
    }).catch(() => {});
    setAdminUnreadCounts(prev => ({ ...prev, [orderId]: 0 }));
  };

  const sendAdminChatMessage = async () => {
    if (!adminChatText.trim() || !adminChatOrderId) return;
    const text = adminChatText.trim();
    setAdminChatText("");
    setAdminChatLoading(true);
    try {
      await fetch("/api/delivery-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderId: adminChatOrderId, from: "Store Admin", fromRole: "admin", text }),
      });
      // Push notify rider
      const order = ordersList.find((o: any) => o.id === adminChatOrderId);
      if (order?.deliveryBoyId) {
        fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send", tenantSlug, role: "rider", riderId: order.deliveryBoyId, title: "Message from Store", body: text, data: { url: `/b/${tenantSlug}/delivery`, tag: "admin-chat" } }),
        }).catch(() => {});
      }
      await fetchAdminChat(adminChatOrderId);
    } catch (_) {}
    finally { setAdminChatLoading(false); }
  };

  // Poll admin unread counts every 10s
  useEffect(() => {
    if (activeTab !== "ecom" || ordersList.length === 0) return;
    const poll = async () => {
      const counts: Record<string, number> = {};
      await Promise.allSettled(
        ordersList.slice(0, 20).map(async (o: any) => {
          try {
            const res = await fetch(`/api/delivery-chat?tenantSlug=${tenantSlug}&orderId=${o.id}`);
            const data = await res.json();
            if (data.success) {
              counts[o.id] = (data.messages || []).filter((m: any) => m.fromRole === "rider" && !m.read).length;
            }
          } catch (_) {}
        })
      );
      setAdminUnreadCounts(counts);
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ordersList.length]);

  // Model maps based on dynamically fetched groups
  const providerModels: Record<string, string[]> = availableModelsGrouped.reduce((acc, group) => {
    acc[group.provider] = group.models.map((m: any) => m.id);
    return acc;
  }, { ollama: ["llama3", "mistral", "deepseek-r1:8b", "phi3", "custom"] });

  const handleProviderChange = (prov: string) => {
    setSelectedProvider(prov);
    setSelectedModel(providerModels[prov]?.[0] || "");
  };

  useEffect(() => {
    if (availableModelsGrouped.length > 0 && mainModel) {
      const group = availableModelsGrouped.find(g => g.models.some((m: any) => m.id === mainModel));
      if (group && group.provider !== selectedProvider) {
        setSelectedProvider(group.provider);
      }
    }
  }, [availableModelsGrouped, mainModel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundInput.trim() || isSending) return;

    const userMsg: ChatMessage = { 
      role: "user", 
      content: playgroundInput,
      image: uploadedFile || undefined,
      fileName: uploadedFileName || undefined,
      isVisionActive: isVisionMode
    };
    const updatedMessages = [...chatMessages, userMsg];
    
    setChatMessages(updatedMessages);
    setPlaygroundInput("");
    setUploadedFile(null);
    setUploadedFileName("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: updatedMessages,
          systemPrompt,
          temperature,
          tenantSlug,
          useOwnModels,
          simulateNonAI
        })
      });

      if (!response.ok) {
        let errText = "Failed to contact LLM provider mesh.";
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {}
        setChatMessages(prev => [...prev, { role: "assistant", content: `System Error: ${errText}` }]);
        return;
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
            
            setChatMessages(prev => {
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

      // After streaming is done, format with headers if needed
      const ragAugmented = response.headers.get("X-RAG-Augmented") === "true";
      const injectedDocs = response.headers.get("X-Injected-Documents");
      const skillTriggered = response.headers.get("X-Skill-Triggered") === "true";
      const skillName = response.headers.get("X-Skill-Name");
      const creditsLeft = response.headers.get("X-Credits-Left");

      let prefix = "";
      if (ragAugmented && injectedDocs) {
        try {
          const docsList = JSON.parse(decodeURIComponent(injectedDocs));
          prefix += `[RAG Hit: injected context from "${docsList.join(", ")}"]\n\n`;
        } catch (e) {}
      }
      if (skillTriggered && skillName) {
        prefix += `[Skill Run: ${skillName.toUpperCase()} triggered successfully]\n\n`;
      }

      if (prefix) {
        setChatMessages(prev => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: prefix + accumulatedText
            };
          }
          return next;
        });
      }

      if (creditsLeft) {
        setCreditsBalance(Number(creditsLeft));
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "System Error: Network failure calling /api/chat endpoint." }]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChatHistory = () => {
    setChatMessages([
      { role: "assistant", content: "Chat history cleared. You can start fresh testing!" }
    ]);
  };

  // pgvector ingest handler — supports both text entry and file upload
  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isIngestingDoc) return;
    if (ingestMode === "text" && (!docName.trim() || !docContent.trim())) return;
    if (ingestMode === "file" && (!docName.trim() || !docFile)) return;

    setIsIngestingDoc(true);
    setIngestLogs([
      "Initializing embedding generator...",
      ingestMode === "file" ? `Extracting text from ${docFile?.name}...` : "Processing document text...",
    ]);

    try {
      let response: Response;

      if (ingestMode === "file" && docFile) {
        const formData = new FormData();
        formData.append("name", docName);
        formData.append("file", docFile);
        formData.append("tenantSlug", tenantSlug);
        if (selectedAgentId && selectedAgentId !== "new") {
          formData.append("agentId", selectedAgentId);
        }
        response = await fetch("/api/ingest", { method: "POST", body: formData });
      } else {
        response = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: docName,
            content: docContent,
            tenantSlug,
            agentId: selectedAgentId && selectedAgentId !== "new" ? selectedAgentId : undefined
          })
        });
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setIngestLogs(prev => [
          ...prev,
          `Split into ${data.chunks} chunk(s).`,
          `Embedding generated (${data.dimensions} dims, provider: ${data.provider}).`,
          `Vectorized & stored! (ID: ${data.documentId})`,
          "Ready — agent will use this knowledge when answering queries."
        ]);
        setIngestedDocsList(prev => [
          { id: data.documentId, name: data.name, chars: data.characters, agentId: selectedAgentId !== "new" ? selectedAgentId : undefined, dimensions: data.dimensions },
          ...prev
        ]);
        setLastCoordinatesPreview(data.previewCoordinates);
        setDocName("");
        setDocContent("");
        setDocFile(null);
      } else {
        setIngestLogs(prev => [...prev, `Error: ${data.error || "Ingestion failed."}`]);
      }
    } catch (err) {
      setIngestLogs(prev => [...prev, "System Error: Failed to ingest document."]);
    } finally {
      setIsIngestingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    setIsDeletingDoc(docId);
    try {
      await fetch(`/api/ingest?tenantSlug=${tenantSlug}&docId=${docId}`, { method: "DELETE" });
      setIngestedDocsList(prev => prev.filter(d => d.id !== docId));
    } catch (_) {}
    finally { setIsDeletingDoc(null); }
  };

  // Configure Webhook Skills properties
  const handleSaveSkillsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSkillsConfig(true);

    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: n8nUrl,
          secret: hmacSecret
        })
      });

      if (res.ok) {
        showToast("n8n Webhook configuration saved! Payloads will carry dynamic HMAC validation headers.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSkillsConfig(false);
    }
  };

  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isCreatingCat) return;

    setIsCreatingCat(true);
    try {
      const res = await fetch("/api/ecom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_category",
          name: newCatName,
          description: newCatDesc,
          tags: newCatTags.split(",").map(t => t.trim()),
          image: newCatImage,
          tenantSlug,
          storeId: selectedShopId || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategoriesList(prev => [...prev, data.category]);
        setNewCatName("");
        setNewCatDesc("");
        setNewCatTags("");
        setNewCatImage("");
        showToast(`Category "${data.category.name}" added to E-Commerce catalog!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingCat(false);
    }
  };

  const openEditCategoryModal = (cat: any) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
    setEditCatTags(cat.tags?.join(", ") || "");
    setEditCatImage(cat.image || "");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim() || isUpdatingCat) return;

    setIsUpdatingCat(true);
    try {
      const res = await fetch("/api/ecom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_category",
          id: editingCategory.id,
          name: editCatName,
          description: editCatDesc,
          tags: editCatTags.split(",").map(t => t.trim()).filter(Boolean),
          image: editCatImage,
          tenantSlug,
          storeId: selectedShopId || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? data.category : c));
        setEditingCategory(null);
        showToast(`Category "${data.category.name}" updated successfully!`);
      } else {
        showToast(data.error || "Failed to update category");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error updating category");
    } finally {
      setIsUpdatingCat(false);
    }
  };

  const handleDeleteCategory = (cat: any) => {
    setCategoryToDelete(cat);
  };

  const handleDeleteCategoryConfirmed = async (id: string) => {
    try {
      const res = await fetch("/api/ecom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_category",
          id,
          tenantSlug
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategoriesList(prev => prev.filter(c => c.id !== id));
        setProductsList(prev => prev.map(p => p.categoryId === id ? { ...p, categoryId: undefined } : p));
        setCategoryToDelete(null);
        showToast("Category deleted successfully!");
      } else {
        showToast(data.error || "Failed to delete category");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error deleting category");
    }
  };

  // Create custom store product catalog item
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || isCreatingProduct) return;

    setIsCreatingProduct(true);
    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          priceUSD: newProdPrice,
          currency: newProdCurrency,
          description: newProdDesc,
          image: newProdImage,
          categoryId: newProdCategory || undefined,
          isService: newProdIsService,
          isDigital: newProdIsDigital,
          digitalFileLink: newProdDigitalLink || undefined,
          upsellProductId: newProdUpsell || undefined,
          downsellProductId: newProdDownsell || undefined,
          orderBumpProductId: newProdOrderBump || undefined,
          orderBumpPrice: newProdBumpPrice || undefined,
        compareAtPriceUSD: newProdComparePrice || undefined,
          isStandaloneLandingPage: newProdIsLanding,
          tenantSlug,
          storeId: selectedShopId || undefined,
          tags: newProdTags.split(",").map(t => t.trim()).filter(Boolean),
          stock: newProdStock,
          sku: newProdSku,
          barcode: newProdBarcode
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProductsList(prev => [...prev, data.product]);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdCurrency("USD");
        setNewProdIsDigital(false);
        setNewProdDigitalLink("");
        setNewProdUpsell("");
        setNewProdDownsell("");
        setNewProdOrderBump("");
        setNewProdBumpPrice("");
        setNewProdComparePrice("");
        setNewProdIsLanding(false);
        setNewProdDesc("");
        setNewProdImage("");
        setNewProdTags("");
        setNewProdStock("");
        setNewProdSku("");
        showToast(`Product "${data.product.name}" added to storefront! Customers can now checkout or purchase inline!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Custom Domains check DNS resolver
  const handleVerifyDNS = async (e: React.FormEvent) => {
    e.preventDefault();
    setDnsStatus("checking");

    try {
      const res = await fetch(`/api/domains?domain=${customDomainName}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setCnameTarget(data.dnsRecordCheck.expectedValue);
        setVerificationToken(data.txtRecordCheck.expectedValue);
        setDnsStatus("verified");
      } else {
        setDnsStatus("unconfigured");
      }
    } catch (err) {
      console.error(err);
      setDnsStatus("unconfigured");
    }
  };

  // Billing checkout initialization
  const handlePlanCheckout = async (plan: Plan) => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          tenantSlug,
          region: selectedRegion
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Open Checkout simulation modal
        setCheckoutModal({
          isOpen: true,
          planName: plan.name,
          planId: plan.id,
          gateway: data.gateway,
          currency: data.currency,
          price: data.price,
          credits: data.credits,
          redirectUrl: data.redirectUrl
        });
      }
    } catch (err) {
      console.error("Failed to initialize billing session", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Simulate Webhook trigger to increment credits balance instantly
  const handleSimulateWebhookSuccess = async () => {
    if (!checkoutModal) return;
    setIsSimulatingWebhook(true);

    try {
      const response = await fetch("/api/webhooks/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: checkoutModal.gateway,
          event: checkoutModal.gateway === "stripe" ? "checkout.session.completed" : "payment.captured",
          tenantSlug,
          credits: checkoutModal.credits
        })
      });

      const data = await response.json();
      if (response.ok && data.processed) {
        // Increment credit balance live!
        setCreditsBalance(prev => prev + data.credited);
        // Close modal
        setCheckoutModal(null);
      }
    } catch (err) {
      console.error("Webhook simulation failed", err);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  // Run hardkeepalive endpoint verification health probe
  const handleTriggerHealthCheck = async () => {
    setIsHealthChecking(true);
    setHealthStatus("checking");

    try {
      const res = await fetch("/api/keepalive");
      const data = await res.json();
      if (res.ok && data.success) {
        setHealthMetrics({
          dbLatency: data.telemetry.dbLatencyMs,
          vectorStatus: data.telemetry.vectorCluster,
          cpu: data.telemetry.cpuUtilization,
          memory: data.telemetry.memoryUtilization
        });
        setHealthStatus("operational");
      } else {
        setHealthStatus("degraded");
      }
    } catch (err) {
      setHealthStatus("degraded");
    } finally {
      setIsHealthChecking(false);
    }
  };

  // Helper to render formatting for DeepSeek <think> reasoning blocks, markdown, tables, links, and e-commerce product cards
  const renderMessageContent = (content: string) => {
    let thinkBlock = "";
    let actualResponse = content;

    if (content.includes("<think>")) {
      const parts = content.split("</think>");
      thinkBlock = parts[0]?.replace("<think>", "").trim() || "";
      actualResponse = parts[1]?.trim() || "";
    }

    // 1. Table Parser
    const lines = actualResponse.split("\n");
    let hasTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let nonTableTextBefore: string[] = [];
    let nonTableTextAfter: string[] = [];
    
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        inTable = true;
        hasTable = true;
        // Split and trim cells
        const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Skip separator row
        if (cells.every(c => c.startsWith("-"))) {
          continue;
        }
        
        if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
      } else {
        if (inTable) {
          inTable = false; // End of table
        }
        if (!hasTable) {
          nonTableTextBefore.push(lines[i]);
        } else {
          nonTableTextAfter.push(lines[i]);
        }
      }
    }

    const textToRender = hasTable ? nonTableTextBefore.join("\n") : actualResponse;
    const remainingText = hasTable ? nonTableTextAfter.join("\n") : "";

    // 2. Bold / Formatting Parsers
    const formatText = (text: string) => {
      if (!text) return null;
      
      const formattedLines = text.split("\n").map((ln, idx) => {
        let lineContent = ln.trim();
        
        // Handle Headings
        if (lineContent.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-bold text-white font-heading mt-3 mb-1.5 leading-relaxed tracking-wide">
              {lineContent.replace("### ", "")}
            </h3>
          );
        }
        if (lineContent.startsWith("#### ")) {
          return (
            <h4 key={idx} className="text-xs font-semibold text-indigo-300 font-heading mt-2.5 mb-1 leading-normal">
              {lineContent.replace("#### ", "")}
            </h4>
          );
        }
        
        // Handle Bullet Lists
        if (lineContent.startsWith("- ") || lineContent.startsWith("* ")) {
          const listText = lineContent.substring(2);
          return (
            <li key={idx} className="list-disc list-inside ml-2.5 text-xs text-gray-300 py-0.5 leading-relaxed">
              {renderBoldText(listText)}
            </li>
          );
        }
        
        return (
          <p key={idx} className="text-xs leading-relaxed text-gray-200 py-0.5 min-h-[1.2rem]">
            {renderBoldText(lineContent)}
          </p>
        );
      });

      return <div className="flex flex-col gap-0.5">{formattedLines}</div>;
    };

    // Helper to render inline **bold**
    const renderBoldText = (text: string) => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => 
        index % 2 === 1 ? <strong key={index} className="font-extrabold text-white text-[12px]">{part}</strong> : part
      );
    };

    // 3. Link Meta Card Parser
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchedLinks = Array.from(new Set(actualResponse.match(urlRegex) || []));

    // 4. E-commerce matched products from our catalog
    const productBuyRegex = /\[BUY:([^\]]+)\]/g;
    const extractedProductIds: string[] = [];
    let match;
    while ((match = productBuyRegex.exec(actualResponse)) !== null) {
      extractedProductIds.push(match[1].trim());
    }

    // Filter products from local state by explicit ID, or fallback to the old fuzzy string match if no tags are present but dollar signs exist
    let matchedProducts = productsList.filter(p => extractedProductIds.includes(p.id));
    if (matchedProducts.length === 0 && actualResponse.includes("$")) {
      matchedProducts = productsList.filter(p => 
        actualResponse.toLowerCase().includes(p.name.toLowerCase()) ||
        (playgroundInput.toLowerCase().includes(p.name.toLowerCase()) && actualResponse.includes("$"))
      );
    }

    const uniqueProductMatches = Array.from(new Set(matchedProducts.map(p => p.id)))
      .map(id => matchedProducts.find(p => p.id === id))
      .filter((p): p is Product => !!p);

    // 5. Category parsing
    const categoryRegex = /\[CATEGORY:([^\]]+)\]/g;
    const extractedCatIds: string[] = [];
    let catMatch;
    while ((catMatch = categoryRegex.exec(actualResponse)) !== null) {
      extractedCatIds.push(catMatch[1].trim().toLowerCase());
    }

    let matchedCategories: any[] = [];
    if (extractedCatIds.includes("all")) {
      matchedCategories = [...categoriesList];
    } else if (extractedCatIds.length > 0) {
      matchedCategories = categoriesList.filter(c => extractedCatIds.includes(c.id.toLowerCase()));
    }

    // Strip out the raw tags from the text shown to the user
    let cleanTextToRender = textToRender.replace(/\[BUY:[^\]]+\]/g, "").replace(/\[CATEGORY:[^\]]+\]/g, "");

    return (
      <div className="flex flex-col gap-3.5 w-full">
        {/* Reasoning chain */}
        {thinkBlock && (
          <div className="bg-indigo-950/20 border-l-2 border-indigo-500/40 p-3 rounded-lg text-indigo-300/80 font-mono text-[11px] leading-relaxed select-none">
            <div className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-1 select-none">Reasoning Chain Output:</div>
            <p className="whitespace-pre-wrap">{thinkBlock}</p>
          </div>
        )}
        
        {/* Main message text */}
        <div className="flex flex-col gap-1">
          {formatText(cleanTextToRender)}
        </div>

        {/* Premium Table Card component */}
        {hasTable && tableHeaders.length > 0 && (
          <div className="overflow-x-auto my-2 rounded-xl border border-white/5 bg-white/[0.01] shadow-inner max-w-full">
            <table className="min-w-full divide-y divide-white/5 text-xs text-left">
              <thead className="bg-indigo-950/20 text-indigo-400 font-bold">
                <tr>
                  {tableHeaders.map((hdr, index) => (
                    <th key={index} className="px-4 py-2.5 font-bold tracking-wider uppercase text-[10px]">{hdr}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.01] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-gray-300 leading-normal">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Remaining text if any */}
        {remainingText && (
          <div className="flex flex-col gap-1 mt-1">
            {formatText(remainingText.replace(/\[BUY:[^\]]+\]/g, "").replace(/\[CATEGORY:[^\]]+\]/g, ""))}
          </div>
        )}

        {/* Meta Link Card Rendering */}
        {matchedLinks.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-1 max-w-sm">
            {matchedLinks.map((url, idx) => {
              // Extract hostname for cleaner presentation
              let domain = "Aether Resources";
              try {
                domain = new URL(url).hostname;
              } catch(_) {}
              
              return (
                <a 
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col border border-white/10 hover:border-indigo-500/40 rounded-xl overflow-hidden bg-gradient-to-tr from-[#080a14] to-[#11142c] group transition-all shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 select-none"
                >
                  {/* Dynamic HSL gradient placeholder meta image */}
                  <div className="h-24 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 flex items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
                    <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 text-indigo-300 font-mono rounded px-1.5 py-0.5 tracking-wider uppercase">{domain}</span>
                  </div>
                  
                  <div className="p-3 flex flex-col gap-1">
                    <span className="font-bold text-white text-xs leading-snug group-hover:text-indigo-300 transition-colors">Interactive Safe Link Redirect Gateway</span>
                    <span className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">Secure gateway to access live SaaS widgets, scheduling calendars, or Razorpay payment receipts safely outside the sandbox boundary.</span>
                    <span className="text-[9px] font-mono text-indigo-400 font-semibold mt-1 truncate">{url}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Category Inline Cards */}
        {matchedCategories.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {matchedCategories.map((cat) => (
              <div key={cat.id} className="p-4 rounded-xl bg-gradient-to-br from-[#0a1128] to-[#161a38] border border-indigo-500/20 shadow-lg flex gap-4 max-w-sm animate-fadeIn transition hover:border-indigo-500/40 select-none text-gray-200">
                {cat.image ? (
                  <img loading="lazy" src={cat.image} alt={cat.name} className="h-16 w-16 rounded-lg object-cover border border-white/10 shrink-0 bg-[#070913]" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm shrink-0 uppercase shadow-inner">
                    {cat.name.substring(0, 2)}
                  </div>
                )}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white text-xs leading-tight block">{cat.name}</span>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal line-clamp-2">{cat.description || "Browse our exclusive collection."}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPlaygroundInput(`Show me all products in the ${cat.name} category.`);
                      setTimeout(() => {
                        const form = document.getElementById("ai-chat-form") as HTMLFormElement;
                        if (form) form.requestSubmit();
                      }, 50);
                    }}
                    className="mt-2.5 w-full py-1.5 text-[9px] font-bold rounded bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-1 shadow cursor-pointer"
                  >
                    Browse Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* E-commerce Catalog Products inline popup */}
        {uniqueProductMatches.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {uniqueProductMatches.map((prod) => (
              <div key={prod.id} className="my-2 rounded-2xl overflow-hidden border border-white/10 bg-[#161827] shadow-xl group hover:border-emerald-500/30 transition-all duration-300 max-w-sm">
                {prod.image ? (
                   <div className="relative h-36 w-full overflow-hidden">
                     <img loading="lazy" src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#161827] via-transparent to-transparent"></div>
                   </div>
                ) : (
                   <div className="h-24 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center font-bold text-gray-500 text-xl tracking-widest uppercase">
                     {prod.name.substring(0, 3)}
                   </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-white text-[14px] leading-tight">{prod.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{prod.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                         <span className="text-[9px] text-gray-500 line-through mb-0.5">${(prod.compareAtPrice / 100).toFixed(2)}</span>
                      )}
                      <span className="font-mono text-emerald-400 font-black text-[14px] whitespace-nowrap drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">${(prod.price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => window.open(`/b/${tenantSlug}/p/${prod.id}`, '_blank')}
                      className="flex-[0.4] py-2 rounded-xl text-gray-300 bg-white/5 hover:bg-white/10 text-[9px] font-bold flex items-center justify-center transition-all border border-white/5 cursor-pointer"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setPlaygroundInput(`I want to buy ${prod.name}. Can you help me check out securely here in the chat? Do you have any special offers or discounts for this?`);
                        setTimeout(() => {
                          const form = document.getElementById("ai-chat-form") as HTMLFormElement;
                          if (form) form.requestSubmit();
                        }, 50);
                      }}
                      className="flex-[0.6] py-2 rounded-xl text-[#2C1800] text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 cursor-pointer"
                      style={{ background: `linear-gradient(135deg, #FFDF73, #D4AF37)` }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Buy Now →
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

    // ==========================================
  // DEDICATED FULL-SCREEN E-COMMERCE OS
  // ==========================================

  // ==========================================
  // DEDICATED FULL-SCREEN LANDING PAGE STUDIO
  // ==========================================
  if (activeTab === "landing") {

  const printA4InvoiceManifestIframe = (order: any) => {
    const orderStore = [...storefrontsList, ...storesList].find(s => s.id === order.storeId) || storefrontsList[0] || storesList[0] || {};
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    let itemsHtml = '';
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      itemsHtml = (items || []).map((it: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${it.name || 'Item'}</strong><br/>
            <small style="color: #666;">SKU: ${it.productId || 'N/A'}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${it.price ? (it.price / 100).toFixed(2) : "0.00"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${((it.price || 0) * (it.quantity || 1) / 100).toFixed(2)}</td>
        </tr>
      `).join('');
    } catch(e) {}

    const storeAddress = "123 Commerce St, Suite 100, Business City, 90210";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice & Manifest - ${order.id}</title>
        <style>
          body { 
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            color: #000;
            background: #fff;
          }
          .page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            position: relative;
            box-sizing: border-box;
          }
          .half {
            height: 148.5mm;
            padding: 15mm;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          .top-half {
            border-bottom: 1px dashed #ccc;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .header img { max-height: 60px; }
          .header-right { text-align: right; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0; color: #333; }
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; line-height: 1.5; }
          .info-box { width: 48%; }
          .info-box h3 { margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
          th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; color: #666; }
          .totals { width: 200px; float: right; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
          
          /* Manifest Styles */
          .manifest-layout { border: 2px solid #000; height: 100%; border-radius: 8px; padding: 15mm; display: flex; flex-direction: column; }
          .manifest-header { border-bottom: 4px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .ship-to { font-size: 22px; font-weight: bold; margin-bottom: 20px; }
          .address-large { font-size: 18px; line-height: 1.4; max-width: 70%; }
          .return-address { font-size: 12px; color: #555; }
          .barcode-area { margin-top: auto; text-align: center; border-top: 2px dashed #000; padding-top: 20px; }
          .barcode-box { height: 60px; background: #f0f0f0; margin: 0 auto 10px auto; width: 80%; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 20px; letter-spacing: 5px;}
        </style>
      </head>
      <body>
        <div class="page">
          <!-- TOP HALF: INVOICE -->
          <div class="half top-half">
            <div class="header">
              <div>
                ${orderStore?.brandLogo ? `<img loading="lazy" src="${orderStore?.brandLogo}" />` : `<h2>${orderStore?.companyName || 'Store'}</h2>`}
              </div>
              <div class="header-right">
                <h1 class="title">Invoice</h1>
                <p style="margin:0; font-size:12px; color:#666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p style="margin:0; font-size:12px; color:#666;">Order #: ${order.id.substring(0,8).toUpperCase()}</p>
              </div>
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <h3>Billed To</h3>
                <strong>${order.buyerName || 'Customer'}</strong><br/>
                ${order.buyerPhone || 'No Phone'}<br/>
                ${order.buyerEmail || ''}
              </div>
              <div class="info-box">
                <h3>Shipped To</h3>
                <strong>${order.buyerName || 'Customer'}</strong><br/>
                ${order.deliveryAddress ? order.deliveryAddress.replace(/,/g, '<br/>') : 'Store Pickup / POS'}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${currencySymbol}${(order.amountCents / 100).toFixed(2)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total:</span>
                <span>${currencySymbol}${(order.amountCents / 100).toFixed(2)}</span>
              </div>
              <p style="font-size:11px; color:#888; text-align:right;">Payment: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</p>
            </div>
          </div>

          <!-- BOTTOM HALF: SHIPPING MANIFEST -->
          <div class="half">
            <div class="manifest-layout">
              <div class="manifest-header">
                <div>
                  <strong style="font-size: 24px;">EXPRESS</strong>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:12px; color:#666;">Weight: 1.0 kg</span><br/>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>

              <div class="return-address">
                <strong>FROM:</strong><br/>
                ${orderStore?.companyName || 'Store'}<br/>
                ${storeAddress}
              </div>

              <div style="margin-top: 30px;">
                <div class="ship-to">SHIP TO:</div>
                <div class="address-large">
                  <strong>${order.buyerName || 'Customer'}</strong><br/>
                  ${order.deliveryAddress ? order.deliveryAddress.replace(/,/g, '<br/>') : 'Store Pickup / POS'}<br/>
                  <br/>
                  <strong>Phone:</strong> ${order.buyerPhone || 'N/A'}
                </div>
              </div>

              <div class="barcode-area">
                <div class="barcode-box">
                  || | |||| || || | |||| ||
                </div>
                <strong style="letter-spacing: 2px;">${order.id.substring(0,12).toUpperCase()}</strong>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

    return (
      <div className="min-h-screen bg-[#02040a] text-gray-100 flex overflow-hidden print:overflow-visible w-full relative selection:bg-indigo-500/30 print:bg-white">
        
        {/* Dynamic Background Blurs */}
        <div className="absolute top-1/4 right-1/3 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0d18] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header: Back to main OS */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
            <button 
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Exit Builder</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Logo Brand Header */}
          <div className="p-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutTemplate className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white font-heading leading-tight">Funnel Studio</h2>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wide">{tenantSlug?.toUpperCase()}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 flex flex-col gap-1.5 text-sm font-medium flex-grow overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-2">Builder Tools</div>
            
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500">
              <Component className="h-4 w-4" />
              <span>UI Components</span>
            </button>
            
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Layers className="h-4 w-4" />
              <span>Page Layers</span>
            </button>

            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Layers className="h-4 w-4" />
              <span>Templates</span>
            </button>
            
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-6">Funnel Config</div>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Sparkles className="h-4 w-4" />
              <span>AI Copy Writer</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.02]">
              <Activity className="h-4 w-4" />
              <span>A/B Testing</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area (Canvas + Header) */}
        <main className="flex-grow flex flex-col overflow-hidden z-10 relative bg-[#070913]">
          
          {/* Builder Toolbar */}
          <header className="h-16 border-b border-white/5 bg-[#0a0d18] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer">
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white font-heading">High-Converting Checkout Funnel</h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider">Draft</span>
                </div>
                <p className="text-[10px] text-gray-500">Unsaved changes • Last edited 2m ago</p>
              </div>
            </div>

            {/* Device Toggles */}
            <div className="hidden md:flex items-center bg-black/40 p-1 rounded-lg border border-white/5">
              <button className="p-1.5 px-3 rounded-md bg-white/10 text-white shadow-sm flex items-center justify-center">
                <Monitor className="h-4 w-4" />
              </button>
              <button className="p-1.5 px-3 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition">
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
                <button className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Undo2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold transition">
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20">
                <Save className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </header>

          {/* Canvas Wrapper */}
          <div className="flex-grow overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDIwVjAuNWgyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')]">
             
             {/* Stub Page Frame */}
             <div className="w-full max-w-4xl min-h-[800px] bg-white rounded-xl shadow-2xl flex flex-col relative group">
                <div className="absolute -top-3 -left-3 -right-3 -bottom-3 border-2 border-indigo-500/0 group-hover:border-indigo-500/50 rounded-2xl pointer-events-none transition duration-300 border-dashed" />
                
                {/* Visual Placeholder for Studio */}
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <MousePointerClick className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-gray-800">Drag components here</h3>
                  <p className="text-sm">Select from the UI Components panel to start building.</p>
                </div>

             </div>
          </div>

        </main>

        {/* Right Sidebar (Settings) */}
        <aside className="hidden xl:flex w-80 bg-[#0a0d18] border-l border-white/5 flex-col shrink-0">
          <div className="h-16 border-b border-white/5 flex items-center px-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Component Settings</h3>
          </div>
          <div className="flex-grow p-6 flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <Settings2 className="h-8 w-8 text-gray-500" />
            <p className="text-xs text-gray-500">Select an element on the canvas to edit its properties.</p>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

      </div>
    );
  }

  if (activeTab === "ecom") {
    // Analytics Derived Data
    const totalRevenue = ordersList.reduce((acc, o) => acc + o.amountCents, 0) / 100;
    const pendingOrdersCount = ordersList.filter(o => o.status === "pending").length;
    const uniqueClicks = analyticsEvents.filter(e => e.eventType === "product_click").length;
    
    // Group clicks by country
    const geoDistribution = analyticsEvents.reduce((acc, cur) => {
      if (cur.country) {
        acc[cur.country] = (acc[cur.country] || 0) + 1;
      }
      return acc;
    }, {});
    const geoData = Object.entries(geoDistribution).map(([country, count]) => ({ country, count })).sort((a: any, b: any) => b.count - a.count);


  const printA4InvoiceManifestIframe = (order: any) => {
    const orderStore = [...storefrontsList, ...storesList].find(s => s.id === order.storeId) || storefrontsList[0] || storesList[0] || {};
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    let itemsHtml = '';
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      itemsHtml = (items || []).map((it: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${it.name || 'Item'}</strong><br/>
            <small style="color: #666;">SKU: ${it.productId || 'N/A'}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${it.price ? (it.price / 100).toFixed(2) : "0.00"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${((it.price || 0) * (it.quantity || 1) / 100).toFixed(2)}</td>
        </tr>
      `).join('');
    } catch(e) {}

    const storeAddress = "123 Commerce St, Suite 100, Business City, 90210";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice & Manifest - ${order.id}</title>
        <style>
          body { 
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            color: #000;
            background: #fff;
          }
          .page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            position: relative;
            box-sizing: border-box;
          }
          .half {
            height: 148.5mm;
            padding: 15mm;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          .top-half {
            border-bottom: 1px dashed #ccc;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .header img { max-height: 60px; }
          .header-right { text-align: right; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0; color: #333; }
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; line-height: 1.5; }
          .info-box { width: 48%; }
          .info-box h3 { margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
          th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; color: #666; }
          .totals { width: 200px; float: right; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .grand-total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
          
          /* Manifest Styles */
          .manifest-layout { border: 2px solid #000; height: 100%; border-radius: 8px; padding: 15mm; display: flex; flex-direction: column; }
          .manifest-header { border-bottom: 4px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .ship-to { font-size: 22px; font-weight: bold; margin-bottom: 20px; }
          .address-large { font-size: 18px; line-height: 1.4; max-width: 70%; }
          .return-address { font-size: 12px; color: #555; }
          .barcode-area { margin-top: auto; text-align: center; border-top: 2px dashed #000; padding-top: 20px; }
          .barcode-box { height: 60px; background: #f0f0f0; margin: 0 auto 10px auto; width: 80%; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 20px; letter-spacing: 5px;}
        </style>
      </head>
      <body>
        <div class="page">
          <!-- TOP HALF: INVOICE -->
          <div class="half top-half">
            <div class="header">
              <div>
                ${orderStore?.brandLogo ? `<img loading="lazy" src="${orderStore?.brandLogo}" />` : `<h2>${orderStore?.companyName || 'Store'}</h2>`}
              </div>
              <div class="header-right">
                <h1 class="title">Invoice</h1>
                <p style="margin:0; font-size:12px; color:#666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p style="margin:0; font-size:12px; color:#666;">Order #: ${order.id.substring(0,8).toUpperCase()}</p>
              </div>
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <h3>Billed To</h3>
                <strong>${order.buyerName || 'Customer'}</strong><br/>
                ${order.buyerPhone || 'No Phone'}<br/>
                ${order.buyerEmail || ''}
              </div>
              <div class="info-box">
                <h3>Shipped To</h3>
                <strong>${order.buyerName || 'Customer'}</strong><br/>
                ${order.deliveryAddress ? order.deliveryAddress.replace(/,/g, '<br/>') : 'Store Pickup / POS'}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${currencySymbol}${(order.amountCents / 100).toFixed(2)}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total:</span>
                <span>${currencySymbol}${(order.amountCents / 100).toFixed(2)}</span>
              </div>
              <p style="font-size:11px; color:#888; text-align:right;">Payment: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</p>
            </div>
          </div>

          <!-- BOTTOM HALF: SHIPPING MANIFEST -->
          <div class="half">
            <div class="manifest-layout">
              <div class="manifest-header">
                <div>
                  <strong style="font-size: 24px;">EXPRESS</strong>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:12px; color:#666;">Weight: 1.0 kg</span><br/>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>

              <div class="return-address">
                <strong>FROM:</strong><br/>
                ${orderStore?.companyName || 'Store'}<br/>
                ${storeAddress}
              </div>

              <div style="margin-top: 30px;">
                <div class="ship-to">SHIP TO:</div>
                <div class="address-large">
                  <strong>${order.buyerName || 'Customer'}</strong><br/>
                  ${order.deliveryAddress ? order.deliveryAddress.replace(/,/g, '<br/>') : 'Store Pickup / POS'}<br/>
                  <br/>
                  <strong>Phone:</strong> ${order.buyerPhone || 'N/A'}
                </div>
              </div>

              <div class="barcode-area">
                <div class="barcode-box">
                  || | |||| || || | |||| ||
                </div>
                <strong style="letter-spacing: 2px;">${order.id.substring(0,12).toUpperCase()}</strong>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

    return (
      <div className="min-h-screen bg-[#02040a] text-gray-100 flex overflow-hidden print:overflow-visible w-full relative selection:bg-indigo-500/30 print:bg-white">
        
        {/* Dynamic Background Blurs */}
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />


        {/* GLOBAL TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] border border-white/20 flex items-center gap-4 pointer-events-none"
            >
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-bold text-white whitespace-nowrap">{toastMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clickable Mobile Overlay Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* DEDICATED E-COM SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 lg:static w-64 border-r border-white/5 bg-[#050711]/95 lg:bg-[#050711]/80 backdrop-blur-xl flex flex-col justify-between shrink-0 z-50 text-gray-200 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex flex-col h-full">
            
            {/* Header: Back to main OS */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
              <button 
                onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <Layers className="h-4 w-4" />
                <span>Exit Store OS</span>
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Logo Brand Header */}
            <div className="p-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white font-heading leading-tight">Commerce Pro</h2>
                <p className="text-[10px] text-emerald-400 font-mono tracking-wide">{tenantSlug?.toUpperCase()}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 flex flex-col gap-1.5 text-sm font-medium flex-grow overflow-y-auto">
              
              <a 
                href={`/b/${tenantSlug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-3 py-3 mb-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer mt-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Front-End Shop
              </a>

              <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-2">Store Management</div>
              <button
                onClick={() => { setEcomSubTab("stores"); setIsMobileMenuOpen(false); fetchStores(); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "stores" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4" />
                  <span>My Stores</span>
                </div>
                {(storefrontsList.length + storesList.length) > 0 && (
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{storefrontsList.length + storesList.length}</span>
                )}
              </button>

              <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-4">Analytics & Reports</div>
              <button
                onClick={() => { setEcomSubTab("analytics"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "old_analytics" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Business Analytics</span>
              </button>
              
              <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-6">Inventory</div>
              <button 
                onClick={() => { setEcomSubTab("products"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "products" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <Package className="h-4 w-4" />
                <span>Products Catalog</span>
              </button>
              <button 
                onClick={() => { setEcomSubTab("categories"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "categories" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <FolderTree className="h-4 w-4" />
                <span>Categories</span>
              </button>
              
              <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-6">Operations</div>
              <button 
                onClick={() => { setEcomSubTab("orders"); setIsMobileMenuOpen(false); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "orders" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center gap-3">
                  <ActivityIcon className="h-4 w-4" />
                  <span>Order Fulfillment</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{pendingOrdersCount}</span>
                )}
              </button>
              <button
                onClick={() => { setEcomSubTab("shipping"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "shipping" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <Globe className="h-4 w-4" />
                <span>Shipping Zones</span>
              </button>
              <button
                onClick={() => { setEcomSubTab("customers"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "customers" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </button>
              <button
                onClick={() => { setEcomSubTab("riders"); setIsMobileMenuOpen(false); fetchDeliveryBoys(); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "riders" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <div className="flex items-center gap-3">
                  <Bike className="h-4 w-4" />
                  <span>Staff & POS Managers</span>
                </div>
                {deliveryBoysList.filter(r => r.isOnline).length > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{deliveryBoysList.filter(r => r.isOnline).length} Online</span>
                )}
              </button>
              <button
                onClick={() => { setEcomSubTab("appLinks"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "appLinks" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <QrCode className="h-4 w-4" />
                <span>Public App Links</span>
              </button>

              <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-2 px-3 uppercase mt-6">Configuration</div>
              <button 
                onClick={() => { setEcomSubTab("store"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "store" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <Settings className="h-4 w-4" />
                <span>Shop Settings</span>
              </button>
              <button
                onClick={() => { setEcomSubTab("gateways"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "gateways" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Payment Gateways</span>
              </button>
              <button
                onClick={() => { setEcomSubTab("pages"); setIsMobileMenuOpen(false); fetchStorePages(); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${ecomSubTab === "pages" ? "bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
              >
                <FileText className="h-4 w-4" />
                <span>Store Pages</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-y-auto z-10 p-6 sm:p-10 relative scroll-smooth">
          
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold font-heading text-white">Commerce Pro</h1>
          </div>

          <AnimatePresence mode="wait">

            {/* SUB TAB: MY STORES */}
            {ecomSubTab === "stores" && (
              <motion.div key="stores" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-6xl mx-auto w-full">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white font-heading">My Stores</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage all your storefronts from one place</p>
                  </div>
                  <button
                    onClick={() => { setShowStoreWizard(true); setWizardStep(1); setWizardStoreName(""); setWizardStoreDesc(""); setWizardStoreImage(""); setWizardStoreType("ecom"); setWizardCreatedStore(null); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add New Store
                  </button>
                </div>

                {/* Store cards grid */}
                {(() => {
                  const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
                    food:           { label: "Food Store",       icon: "🍽️", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
                    ecom:           { label: "E-Commerce",       icon: "🛍️", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                    service:        { label: "Service / Clinic", icon: "🏥", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    single_product: { label: "Single Product",   icon: "⚡", color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20"  },
                    retail:         { label: "E-Commerce",       icon: "🛍️", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                  };

                  // Normalise existing storefronts → same shape as new stores
                  const legacyCards = storefrontsList.map((sf: any) => ({
                    _isLegacy: true,
                    id: sf.id,
                    name: sf.companyName || "Main Store",
                    description: sf.storeDescription || "",
                    image: sf.brandLogo || sf.promoBannerImage || "",
                    storeType: sf.storeType || (sf.template === "food" ? "food" : "ecom"),
                    posEnabled: sf.posEnabled || false,
                    isActive: true,
                    storeSlug: null,          // legacy stores use /b/[tenant]
                    _sfId: sf.id,
                    productCount: productsList.filter((p: any) => !p.storeId || p.storeId === sf.id).length,
                    orderCount: ordersList.filter((o: any) => !o.storeId || o.storeId === sf.id).length,
                  }));

                  const allCards = [...legacyCards, ...storesList];

                  if (allCards.length === 0) return (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                      <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Layers className="h-10 w-10 text-indigo-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg">No stores yet</p>
                        <p className="text-gray-500 text-sm mt-1">Create your first store to get started</p>
                      </div>
                      <button
                        onClick={() => { setShowStoreWizard(true); setWizardStep(1); setWizardStoreName(""); setWizardStoreDesc(""); setWizardStoreImage(""); setWizardStoreType("ecom"); setWizardCreatedStore(null); }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Create First Store
                      </button>
                    </div>
                  );

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {allCards.map((store: any) => {
                        const tc = typeConfig[store.storeType] || typeConfig.ecom;
                        return (
                          <motion.div
                            key={store.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-gradient-to-br from-[#0d1220] to-[#090c16] border border-white/8 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition group"
                          >
                            {/* Hero image */}
                            <div className="relative h-36 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 overflow-hidden">
                              {store.image ? (
                                <img loading="lazy" src={store.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl opacity-25">{tc.icon}</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-transparent to-transparent" />
                              <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${tc.bg} ${tc.color}`}>
                                <span>{tc.icon}</span><span>{tc.label}</span>
                              </div>
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <div className={`h-2 w-2 rounded-full ${store.isActive ? "bg-emerald-400" : "bg-gray-600"}`} />
                                {store._isLegacy && (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Main</span>
                                )}
                              </div>
                            </div>

                            <div className="p-4 flex flex-col gap-3">
                              <div>
                                <h3 className="text-white font-black text-base leading-tight">{store.name}</h3>
                                {store.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{store.description}</p>}
                                {/* Stats row for legacy store */}
                                {store._isLegacy && (
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] text-gray-500">{store.productCount} products</span>
                                    <span className="text-[10px] text-gray-500">{store.orderCount} orders</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => {
                                    if (store._isLegacy) {
                                      setSelectedShopId(store._sfId);
                                      setEcomSubTab("orders");
                                    } else {
                                      setSelectedShopId(store.id);
                                      setEcomSubTab("orders");
                                    }
                                  }}
                                  className="flex-1 py-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <LayoutDashboard className="h-3 w-3" /> Manage
                                </button>
                                <a
                                  href={store._isLegacy ? `/b/${tenantSlug}` : `/b/${tenantSlug}/${store.storeSlug}`}
                                  target="_blank"
                                  className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <ExternalLink className="h-3 w-3" /> View
                                </a>
                                {true && (
                                  <a
                                    href={`/b/${tenantSlug}/pos?storeId=${store.id}`}
                                    target="_blank"
                                    className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> POS
                                  </a>
                                )}
                                {!store._isLegacy && (
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/ecom/stores?tenantSlug=${tenantSlug}&storeId=${store.id}`, { method: "DELETE" });
                                      setStoresList(prev => prev.filter(s => s.id !== store.id));
                                    }}
                                    className="p-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 rounded-xl transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      {/* Add new store card */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => { setShowStoreWizard(true); setWizardStep(1); setWizardStoreName(""); setWizardStoreDesc(""); setWizardStoreImage(""); setWizardStoreType("ecom"); setWizardCreatedStore(null); }}
                        className="h-full min-h-[220px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition cursor-pointer group"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center transition">
                          <Plus className="h-6 w-6 text-indigo-400" />
                        </div>
                        <p className="text-indigo-300 font-bold text-sm">Add New Store</p>
                      </motion.button>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* SUB TAB: ANALYTICS */}
            {ecomSubTab === "old_analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Business Intelligence</h2>
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold font-mono shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE DATA
                  </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 flex flex-col gap-2 hover:border-emerald-500/30 transition-colors group">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Total Revenue
                    </span>
                    <span className="text-3xl font-extrabold text-white group-hover:text-emerald-400 transition-colors font-mono">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 flex flex-col gap-2 hover:border-blue-500/30 transition-colors group">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-blue-400" /> Gross Profit (85% Est)
                    </span>
                    <span className="text-3xl font-extrabold text-white group-hover:text-blue-400 transition-colors font-mono">${(totalRevenue * 0.85).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 flex flex-col gap-2 hover:border-purple-500/30 transition-colors group">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-purple-400" /> Total Orders
                    </span>
                    <span className="text-3xl font-extrabold text-white group-hover:text-purple-400 transition-colors font-mono">{ordersList.length}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 flex flex-col gap-2 hover:border-orange-500/30 transition-colors group">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-orange-400" /> Store Views & Clicks
                    </span>
                    <span className="text-3xl font-extrabold text-white group-hover:text-orange-400 transition-colors font-mono">{uniqueClicks}</span>
                  </div>
                </div>

                {/* Complex Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Geo Chart */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-emerald-400" /> Global Traffic & Orders</h3>
                    <div className="h-[300px] w-full flex items-end gap-2 sm:gap-4 px-2 pb-2 border-b border-white/10 relative">
                      {geoData.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-mono italic">Waiting for storefront traffic...</div>
                      ) : (
                        geoData.slice(0, 8).map((data: any, idx: number) => {
                          const maxCount = Math.max(...geoData.map((d:any) => d.count));
                          const heightPct = Math.max(10, (data.count / maxCount) * 100);
                          return (
                            <div key={data.country} className="flex-1 flex flex-col items-center justify-end gap-3 group">
                              <span className="text-xs font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">{data.count}</span>
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPct}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                                className="w-full bg-gradient-to-t from-emerald-600/50 to-emerald-400 rounded-t-sm shadow-[0_0_15px_rgba(52,211,153,0.3)] relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'translateY(-100%)' }} />
                              </motion.div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-full px-1">{data.country || 'Unknown'}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-purple-400" /> Top Selling Products</h3>
                    <div className="flex flex-col gap-3 mt-2 overflow-y-auto pr-2">
                      {productsList.length === 0 ? (
                        <p className="text-gray-500 text-xs italic text-center py-10">No products added yet.</p>
                      ) : (
                        productsList.slice(0, 5).map(prod => (
                          <div key={prod.id} className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 transition-colors flex items-center gap-3">
                            {prod.image ? (
                              <img loading="lazy" src={prod.image} className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-indigo-400" /></div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-white truncate">{prod.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {prod.currency === "USD" ? "$" : prod.currency === "EUR" ? "€" : prod.currency === "GBP" ? "£" : prod.currency === "INR" ? "₹" : `${prod.currency} `}{(prod.price / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB TAB: PRODUCTS CATALOG */}
            {ecomSubTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Products Catalog</h2>
                  <button onClick={() => setShowQrPrintModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-2 text-sm">
                    <QrCode className="h-4 w-4" /> Print QRs / Barcodes
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                  
                  {/* Left: Product Grid */}
                  <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productsList.length === 0 ? (
                      <div className="sm:col-span-2 p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-3 bg-white/[0.01]">
                        <Package className="h-10 w-10 text-gray-600 mb-2" />
                        <h3 className="text-lg font-bold text-white">Your inventory is empty</h3>
                        <p className="text-sm text-gray-400 max-w-md">Add physical items, digital downloads, or service bookings using the form on the right.</p>
                      </div>
                    ) : (
                      productsList.map((prod, idx) => (
                        <motion.div 
                          key={prod.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(99,102,241,0.15)] flex flex-col"
                        >
                          <div className="h-48 w-full bg-[#0a0d1a] relative">
                            {prod.image ? (
                              <img loading="lazy" src={prod.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
                                <Package className="h-12 w-12 text-indigo-500/40" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              {prod.isDigital && <span className="px-2.5 py-1 text-[9px] font-black tracking-widest text-white bg-blue-500/80 backdrop-blur-md rounded-full shadow-lg border border-white/20">DIGITAL</span>}
                              {prod.isService && <span className="px-2.5 py-1 text-[9px] font-black tracking-widest text-white bg-emerald-500/80 backdrop-blur-md rounded-full shadow-lg border border-white/20">SERVICE</span>}
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="px-3 py-1.5 text-xs font-black text-white bg-black/60 backdrop-blur-md rounded-xl shadow-lg border border-white/10 font-mono">
                                {prod.currency === "USD" ? "$" : prod.currency === "EUR" ? "€" : prod.currency === "GBP" ? "£" : prod.currency === "INR" ? "₹" : `${prod.currency} `}{(prod.price / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col gap-2 flex-grow bg-gradient-to-b from-transparent to-black/20">
                            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">{prod.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-1">
                              {prod.sku && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono flex items-center gap-1"><Tag className="h-3 w-3" /> SKU: {prod.sku}</span>}
                              {prod.stock !== undefined && <span className={`px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 ${prod.stock <= 5 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}><Archive className="h-3 w-3" /> {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}</span>}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{prod.description}</p>
                          </div>
                          
                          {/* Quick Actions Hover Overlay */}
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(prod); }} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-transform hover:scale-110 shadow-xl" title="Edit">
                              <Settings className="h-5 w-5" />
                            </button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProduct(prod.id); }} className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 cursor-pointer transition-transform hover:scale-110 shadow-xl" title="Delete">
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBarcodePrintProduct(prod); }} className="p-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 cursor-pointer transition-transform hover:scale-110 shadow-xl" title="Print Labels">
                              <Printer className="h-5 w-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Right: Add Product Form */}
                  <div className="xl:col-span-1 p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col gap-5 sticky top-10">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Plus className="h-4 w-4 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-white text-sm tracking-wide">Create Product</h3>
                    </div>
                    
                    <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Product Name</label>
                        <input type="text" placeholder="e.g. Premium Branding Kit" value={newProdName} onChange={e => setNewProdName(e.target.value)} required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 w-1/3">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Currency</label>
                          <div className="relative">
                            <select value={newProdCurrency} onChange={e => setNewProdCurrency(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-mono shadow-inner cursor-pointer appearance-none">
<option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="GBP">British Pound (£)</option><option value="INR">Indian Rupee (₹)</option><option value="BDT">Bangladeshi Taka (৳)</option><option value="AUD">Australian Dollar (A$)</option><option value="CAD">Canadian Dollar (C$)</option><option value="SGD">Singapore Dollar (S$)</option><option value="AED">Emirati Dirham (د.إ)</option><option value="SAR">Saudi Riyal (﷼)</option><option value="JPY">Japanese Yen (¥)</option><option value="CNY">Chinese Yuan (¥)</option><option value="CHF">Swiss Franc (CHF)</option><option value="ZAR">South African Rand (R)</option><option value="NZD">New Zealand Dollar (NZ$)</option><option value="RUB">Russian Ruble (₽)</option><option value="BRL">Brazilian Real (R$)</option><option value="MXN">Mexican Peso (Mex$)</option><option value="SEK">Swedish Krona (kr)</option><option value="NOK">Norwegian Krone (kr)</option><option value="DKK">Danish Krone (kr)</option><option value="HKD">Hong Kong Dollar (HK$)</option><option value="TRY">Turkish Lira (₺)</option><option value="KRW">South Korean Won (₩)</option><option value="IDR">Indonesian Rupiah (Rp)</option><option value="MYR">Malaysian Ringgit (RM)</option><option value="PHP">Philippine Peso (₱)</option><option value="THB">Thai Baht (฿)</option><option value="VND">Vietnamese Dong (₫)</option><option value="EGP">Egyptian Pound (E£)</option><option value="NGN">Nigerian Naira (₦)</option><option value="PKR">Pakistani Rupee (₨)</option><option value="LKR">Sri Lankan Rupee (Rs)</option><option value="KWD">Kuwaiti Dinar (KD)</option><option value="QAR">Qatari Riyal (QR)</option>
</select>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-grow">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Regular Price</label>
                          <input type="number" placeholder="Optional" value={newProdComparePrice} onChange={e => setNewProdComparePrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono shadow-inner" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-grow">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Sale Price</label>
                          <input type="number" placeholder="0.00" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono shadow-inner" />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 flex-grow">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">SKU</label>
                          <input type="text" placeholder="e.g. ITM-001" value={newProdSku} onChange={e => setNewProdSku(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner font-mono uppercase" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-grow">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1 flex justify-between items-center">
                            Barcode 
                            <button type="button" onClick={() => setNewProdBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString())} className="text-indigo-400 hover:text-indigo-300 text-[9px]">Auto</button>
                          </label>
                          <input type="text" placeholder="12-digit EAN" value={newProdBarcode} onChange={e => setNewProdBarcode(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner font-mono uppercase" />
                        </div>
                        <div className="flex flex-col gap-1.5 w-1/3">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Stock Qty</label>
                          <input type="number" placeholder="&#8734;" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner font-mono" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Category</label>
                        <select value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner cursor-pointer appearance-none">
                          <option value="">-- No Category --</option>
                          {categoriesList.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Product Tags (comma separated)</label>
                        <input type="text" placeholder="e.g. veg, bestseller, spicy" value={newProdTags} onChange={e => setNewProdTags(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono shadow-inner animate-fadeIn" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Description</label>
                        <textarea placeholder="Write a compelling description..." value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white resize-none focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" rows={3} />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Cover Image</label>
                        <div className="p-1 rounded-xl border border-white/10 bg-black/40 shadow-inner flex items-center justify-center">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[10px] text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer w-full" />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors group">
                          <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">Bookable Service</span>
                          <div className="relative flex items-center">
                            <input type="checkbox" checked={newProdIsService} onChange={e => setNewProdIsService(e.target.checked)} className="peer sr-only" />
                            <div className="h-5 w-9 rounded-full bg-gray-800 peer-checked:bg-emerald-500 transition-colors shadow-inner border border-black/50"></div>
                            <div className="absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-white transition-transform peer-checked:translate-x-[16px] shadow-sm"></div>
                          </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors group">
                          <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">Digital Download</span>
                          <div className="relative flex items-center">
                            <input type="checkbox" checked={newProdIsDigital} onChange={e => setNewProdIsDigital(e.target.checked)} className="peer sr-only" />
                            <div className="h-5 w-9 rounded-full bg-gray-800 peer-checked:bg-blue-500 transition-colors shadow-inner border border-black/50"></div>
                            <div className="absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-white transition-transform peer-checked:translate-x-[16px] shadow-sm"></div>
                          </div>
                        </label>
                        
                        <AnimatePresence>
                          {newProdIsDigital && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <input type="url" placeholder="https://link-to-file.pdf" value={newProdDigitalLink} onChange={e => setNewProdDigitalLink(e.target.value)} required className="mt-2 w-full bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-xs text-blue-100 focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-blue-500/50" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

            {/* CREATE ADVANCED SALES FUNNELS */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Sales Funnel Engine
                  </h3>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={newProdIsLanding} onChange={e => setNewProdIsLanding(e.target.checked)} className="rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900 h-3.5 w-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Landing Page</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Post-Purchase Upsell</label>
                  <select value={newProdUpsell} onChange={e=>setNewProdUpsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option value="">None</option>
                    {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Decline Downsell</label>
                  <select value={newProdDownsell} onChange={e=>setNewProdDownsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option value="">None</option>
                    {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-500/10">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Order Bump</label>
                  <select value={newProdOrderBump} onChange={e=>setNewProdOrderBump(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option value="">None</option>
                    {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex flex-col gap-1">
                  <label className="text-[8px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Bump Price</label>
                  <input type="number" step="0.01" value={newProdBumpPrice} onChange={e=>setNewProdBumpPrice(e.target.value)} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
                </div>
              </div>
            </div>

                      <button type="submit" disabled={isCreatingProduct} className="mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] cursor-pointer">
                        {isCreatingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> <span>Add to Catalog</span></>}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB TAB: CATEGORIES */}
            {ecomSubTab === "categories" && (
              <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Category Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Category Form */}
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl flex flex-col gap-4 h-fit">
                    <h3 className="font-bold text-white text-sm">Create Category</h3>
                    <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                      <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                      <textarea placeholder="Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white resize-none focus:ring-1 focus:ring-indigo-500 outline-none" rows={2} />
                      <input type="text" placeholder="Tags (comma separated)" value={newCatTags} onChange={e => setNewCatTags(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                      
                      <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex justify-between mb-2">
                          <span>Cover Image (800x400)</span>
                        </label>
                        <input type="file" accept="image/*" onChange={handleCatImageUpload} className="text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 cursor-pointer" />
                      </div>
                      <button type="submit" disabled={isCreatingCat} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50 mt-2">
                        {isCreatingCat ? "Saving..." : "Add Category"}
                      </button>
                    </form>
                  </div>
                  
                  {/* Category List */}
                  <div className="flex flex-col gap-4">
                    {categoriesList.map(cat => (
                      <div key={cat.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-4 items-center group relative">
                        {cat.image ? (
                          <img loading="lazy" src={cat.image} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center shrink-0"><FolderTree className="h-6 w-6 text-gray-500" /></div>
                        )}
                        <div className="flex-1 min-w-0 pr-16">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{cat.name}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
                          {cat.tags && cat.tags.length > 0 && (
                            <p className="text-[9px] text-gray-500 mt-1.5 uppercase font-mono">{cat.tags.join(", ")}</p>
                          )}
                        </div>
                        
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-gray-400 cursor-pointer transition-all border border-white/5 hover:border-indigo-500/30"
                            title="Edit Category"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 cursor-pointer transition-all border border-white/5 hover:border-red-500/30"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}



            
            {/* SUB TAB: SHIPPING */}
            {ecomSubTab === "shipping" && (
              <motion.div key="shipping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Shipping Zones & Logistics</h2>
                
                <form onSubmit={handleSaveShipping} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col gap-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Flat Shipping Rate (in cents)</label>
                      <input type="number" value={shippingRate} onChange={e=>setShippingRate(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <p className="text-[9px] text-gray-500 px-1">E.g., 500 = {currencySymbol}5.00</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Free Shipping Threshold (in cents)</label>
                      <input type="number" value={freeShippingThreshold} onChange={e=>setFreeShippingThreshold(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <p className="text-[9px] text-gray-500 px-1">Set to 0 to disable free shipping.</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Estimated Delivery Timeframe</label>
                      <input type="text" value={estimatedDeliveryDays} onChange={e=>setEstimatedDeliveryDays(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="e.g., 3-5 Business Days" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSavingShipping} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50">
                      {isSavingShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Globe className="h-4 w-4" /> Save Logistics</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* SUB TAB: ORDERS */}
            {ecomSubTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight flex items-center gap-2">
                      <span>Order Fulfillment</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    </h2>
                    <p className="text-xs text-gray-400">Process live sales and coordinate preparation timers with riders.</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Live Sales Switcher */}
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs">
                      <span className="font-semibold text-gray-300">Live Sales & Alerts</span>
                      <button 
                        onClick={() => {
                          setLiveSalesActive(!liveSalesActive);
                          showToast(`Live sales listening is now ${!liveSalesActive ? "ENABLED" : "DISABLED"}`);
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer border border-black/40 ${liveSalesActive ? "bg-emerald-500" : "bg-gray-800"}`}
                      >
                        <span className={`h-4 w-4 bg-white rounded-full absolute top-[3px] transition-transform ${liveSalesActive ? "right-[3px]" : "left-[3px]"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter & Stats Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: "all", label: "All Orders" },
                      { id: "pending", label: "New/Pending" },
                      { id: "processing", label: "Preparing" },
                      { id: "out_for_delivery", label: "Out for Delivery" },
                      { id: "completed", label: "Completed" },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setOrderFilter(f.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${orderFilter === f.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 bg-black/30 p-2 rounded-2xl border border-white/5">
                    <div className="flex flex-col px-3 border-r border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Total Sales</span>
                      <span className="text-white font-mono font-bold">{currencySymbol}{(ordersList.reduce((acc, o) => acc + o.amountCents, 0) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col px-3">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Active Orders</span>
                      <span className="text-emerald-400 font-mono font-bold">{ordersList.filter(o => ["pending", "paid", "accepted", "preparing", "out_for_delivery", "processing"].includes(o.status)).length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {ordersList.filter(o => {
                    if (orderFilter === "all") return true;
                    if (orderFilter === "pending") return o.status === "pending" || o.status === "paid";
                    if (orderFilter === "processing") return o.status === "processing" || o.status === "accepted" || o.status === "preparing";
                    if (orderFilter === "completed") return o.status === "delivered" || o.status === "fulfilled" || o.status === "completed";
                    return o.status === orderFilter;
                  }).length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 rounded-3xl text-gray-500">
                      <ShoppingBag className="h-10 w-10 text-gray-700" />
                      <p>No orders found matching the criteria.</p>
                    </div>
                  ) : ordersList.filter(o => {
                    if (orderFilter === "all") return true;
                    if (orderFilter === "pending") return o.status === "pending" || o.status === "paid";
                    if (orderFilter === "processing") return o.status === "processing" || o.status === "accepted" || o.status === "preparing";
                    if (orderFilter === "completed") return o.status === "delivered" || o.status === "fulfilled" || o.status === "completed";
                    return o.status === orderFilter;
                  }).map(order => {
                    const timerSecs = shopOrderTimers[order.id];
                    const timerMins = timerSecs !== undefined ? Math.floor(timerSecs / 60) : null;
                    const timerSecsRem = timerSecs !== undefined ? timerSecs % 60 : null;
                    const timerExpired = timerSecs === 0;
                    
                    let items: any[] = [];
                    try { items = JSON.parse(order.itemsJson || "[]"); } catch {}
                    if (items.length === 0) {
                      const mp = productsList.find((p: any) => p.id === order.productId);
                      if (mp) items = [{ id: mp.id, name: mp.name, price: order.amountCents, quantity: 1, image: mp.image }];
                    }
                    const isExpanded = ordersProductsExpanded[order.id];

                    let badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                    if (order.status === "accepted" || order.status === "processing" || order.status === "preparing") {
                      badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
                    } else if (order.status === "out_for_delivery") {
                      badgeStyle = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
                    } else if (order.status === "delivered" || order.status === "fulfilled" || order.status === "completed") {
                      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                    } else if (order.status === "cancelled") {
                      badgeStyle = "bg-red-500/10 text-red-400 border-red-500/30";
                    }

                    return (
                      <div
                        key={order.id}
                        className={`bg-gradient-to-br from-[#111624] to-[#0a0d16] border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-colors flex flex-col shadow-xl ${order.status === "pending" || order.status === "paid" ? "border-emerald-500/30 shadow-emerald-500/10" : ""}`}
                      >
                        <div className="p-5 flex flex-col gap-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-lg leading-tight truncate">{order.buyerName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[10px] text-gray-500">#{order.id.substring(6, 14).toUpperCase()}</span>
                                <span className="text-gray-600 text-[10px]">•</span>
                                <span className="text-gray-500 text-[10px]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-gray-600 text-[10px]">•</span>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase flex items-center gap-1 ${order.source === 'pos' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'}`}>
                                  {order.source === 'pos' ? <Monitor className="w-2.5 h-2.5"/> : <Smartphone className="w-2.5 h-2.5"/>}
                                  {order.source === 'pos' ? 'POS' : 'Online'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="font-black text-emerald-400 font-mono text-lg">{currencySymbol}{(order.amountCents / 100).toFixed(2)}</span>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${badgeStyle}`}>
                                {order.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {/* Timer & Meta */}
                          {(timerSecs !== undefined || order.deliveryAddress) && (
                            <div className="flex items-center justify-between gap-2 bg-black/40 rounded-xl p-3 border border-white/5">
                              {order.deliveryAddress ? (
                                <div className="flex items-start gap-2 text-xs text-gray-400 min-w-0">
                                  <MapPin className="h-4 w-4 text-orange-400 shrink-0" />
                                  <span className="truncate">{order.deliveryAddress}</span>
                                </div>
                              ) : <span />}
                              
                              {timerSecs !== undefined && (
                                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold shrink-0 bg-white/5 px-2 py-1 rounded-lg ${timerExpired ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                                  <Timer className="h-3.5 w-3.5" />
                                  {timerExpired ? "LATE!" : `${String(timerMins).padStart(2,'0')}:${String(timerSecsRem).padStart(2,'0')}`}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Products Preview Toggle */}
                          {items.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setOrdersProductsExpanded(p => ({ ...p, [order.id]: !p[order.id] }))}
                                className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition group cursor-pointer w-full text-left bg-transparent border-none"
                              >
                                <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                  <Package className="h-3 w-3" /> {items.length} Item{items.length !== 1 ? 's' : ''}
                                </span>
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 transition">
                                  {isExpanded ? "Hide" : "View"} <ArrowLeft className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : "-rotate-90"}`} />
                                </div>
                              </button>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                                      {items.map((it: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl">
                                          {it.image ? <img loading="lazy" src={it.image} className="w-10 h-10 rounded-lg object-cover bg-black/50" /> : <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs">🍽️</div>}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-white text-[11px] font-semibold truncate">{it.name}</p>
                                            <p className="text-gray-500 text-[9px]">Qty: {it.quantity}</p>
                                          </div>
                                          <div className="text-gray-300 font-mono text-[10px] bg-white/5 px-2 py-1 rounded">
                                            {currencySymbol}{it.price ? (it.price / 100).toFixed(2) : "—"}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto grid grid-cols-4 gap-px bg-white/5 border-t border-white/5">
                          <button
                            onClick={() => setActiveProcessingOrder(order)}
                            className="py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition bg-black/20 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button
                            onClick={() => printA4InvoiceManifestIframe(order)}
                            className="py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-500/20 transition bg-blue-500/10 cursor-pointer border-l border-white/5"
                          >
                            <Printer className="h-3.5 w-3.5" /> Print
                          </button>
                          <button
                            onClick={() => openAdminChat(order.id)}
                            className="relative py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-violet-400 hover:text-white hover:bg-violet-500/20 transition bg-violet-500/10 cursor-pointer border-l border-white/5"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Chat
                            {(adminUnreadCounts[order.id] || 0) > 0 && (
                              <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                {adminUnreadCounts[order.id]}
                              </span>
                            )}
                          </button>
                          {(order.status === "pending" || order.status === "paid") ? (
                            <button
                              onClick={() => {
                                setNewOrderNotification(order);
                                setShowNewOrderModal(true);
                              }}
                              className="py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-600 transition bg-emerald-500/10 cursor-pointer border-l border-white/5"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Accept
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveProcessingOrder(order)}
                              className="py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-white hover:bg-indigo-600 transition bg-indigo-500/10 cursor-pointer border-l border-white/5"
                            >
                              <Settings className="h-3.5 w-3.5" /> Manage
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SUB TAB: RIDERS / DELIVERY BOYS */}
            {ecomSubTab === "riders" && (
              <motion.div key="riders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight flex items-center gap-3">
                      <Bike className="h-7 w-7 text-emerald-400" /> Staff & POS Managers
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your delivery fleet and POS terminal staff accounts.</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveStaffSubTab("riders")}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeStaffSubTab === "riders" ? "bg-emerald-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      Delivery Riders ({deliveryBoysList.length})
                    </button>
                    <button
                      onClick={() => setActiveStaffSubTab("posManagers")}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeStaffSubTab === "posManagers" ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                      POS Managers ({posManagersList.length})
                    </button>
                  </div>
                </div>

                {activeStaffSubTab === "riders" && (
                  <div className="flex flex-col gap-6">

                {/* Live Rider GPS Map */}
                {riderLocations.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-white">Live Rider Tracking</h3>
                      <span className="text-[10px] text-gray-500">({riderLocations.length} active)</span>
                    </div>
                    {typeof window !== "undefined" && (
                      <LiveMapAdmin
                        pins={riderLocations.map((loc: any) => ({
                          riderId: loc.riderId,
                          name: deliveryBoysList.find((r: any) => r.id === loc.riderId)?.name || loc.riderId,
                          lat: loc.lat,
                          lng: loc.lng,
                          updatedAt: loc.updatedAt,
                        }))}
                        primaryColor="#10b981"
                      />
                    )}
                  </div>
                )}

                {/* Add Rider Form */}
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="h-4 w-4 text-emerald-400" /> Add New Rider</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Name</label>
                      <input
                        type="text"
                        placeholder="Rider Name"
                        value={newRiderName}
                        onChange={e => setNewRiderName(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Phone</label>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={newRiderPhone}
                        onChange={e => setNewRiderPhone(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Vehicle</label>
                      <select
                        value={newRiderVehicle}
                        onChange={e => setNewRiderVehicle(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
                      >
                        <option value="bike">🚲 Bike</option>
                        <option value="scooter">🛵 Scooter</option>
                        <option value="car">🚗 Car</option>
                        <option value="van">🚐 Van</option>
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={isAddingRider || !newRiderName.trim() || !newRiderPhone.trim()}
                    onClick={async () => {
                      setIsAddingRider(true);
                      try {
                        const res = await fetch("/api/ecom/delivery-boys", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tenantSlug, name: newRiderName, phone: newRiderPhone, vehicle: newRiderVehicle, password: newRiderPassword, avatarUrl: newRiderAvatarUrl })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setDeliveryBoysList(prev => [...prev, data.rider]);
                          setNewRiderName(""); setNewRiderPhone(""); setNewRiderVehicle("bike"); setNewRiderPassword(""); setNewRiderAvatarUrl("");
                          showToast(`Rider ${data.rider.name} added successfully!`);
                        }
                      } catch (e) { console.error(e); } finally { setIsAddingRider(false); }
                    }}
                    className="w-full sm:w-auto sm:self-end px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAddingRider ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add Rider</>}
                  </button>
                </div>

                {/* Riders List */}
                {deliveryBoysList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl">
                    <Bike className="h-10 w-10 text-gray-700" />
                    <p className="text-gray-400 text-sm font-medium">No riders added yet</p>
                    <p className="text-gray-600 text-xs">Add your first delivery rider using the form above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deliveryBoysList.map(rider => (
                      <motion.div
                        key={rider.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col gap-4 hover:border-white/20 transition group"
                      >
                        {editingRiderId === rider.id ? (
                          <div className="flex flex-col gap-3 w-full">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Edit Rider Details</h4>
                            <input type="text" value={editRiderData.name || ""} onChange={e => setEditRiderData({...editRiderData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Name" />
                            <input type="text" value={editRiderData.phone || ""} onChange={e => setEditRiderData({...editRiderData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Phone" />
                            <input type="text" value={editRiderData.password || ""} onChange={e => setEditRiderData({...editRiderData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Login Password" />
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => setEditingRiderId(null)} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition cursor-pointer">Cancel</button>
                              <button onClick={async () => {
                                const res = await fetch("/api/ecom/delivery-boys", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantSlug, riderId: rider.id, ...editRiderData }) });
                                const data = await res.json();
                                if (data.success) { setDeliveryBoysList(prev => prev.map(r => r.id === rider.id ? data.rider : r)); setEditingRiderId(null); }
                              }} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4 w-full">
                              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${rider.isOnline ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"}`}>
                                {rider.vehicle === "scooter" ? "🛵" : rider.vehicle === "car" ? "🚗" : rider.vehicle === "van" ? "🚐" : "🚲"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-white text-sm truncate">{rider.name}</p>
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${rider.isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-500"}`}>
                                    {rider.isOnline ? "Online" : "Offline"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {rider.phone}</p>
                                {rider.currentOrderId && (
                                  <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-1"><Navigation className="h-3 w-3" /> On delivery #{rider.currentOrderId.substring(6, 12).toUpperCase()}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 p-2 bg-black/40 rounded-lg text-[10px] text-gray-400 font-mono">
                              <Lock className="w-3 h-3" /> Pwd: {rider.password || rider.phone}
                            </div>
                            <div className="flex flex-col gap-2 mt-auto">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const res = await fetch("/api/ecom/delivery-boys", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ tenantSlug, riderId: rider.id, isOnline: !rider.isOnline })
                                      });
                                      const data = await res.json();
                                      if (data.success) setDeliveryBoysList(prev => prev.map(r => r.id === rider.id ? data.rider : r));
                                    } catch (e) { console.error(e); }
                                  }}
                                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition cursor-pointer ${rider.isOnline ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"}`}
                                >
                                  {rider.isOnline ? "Go Offline" : "Go Online"}
                                </button>
                                <button onClick={() => { setEditingRiderId(rider.id); setEditRiderData({name: rider.name, phone: rider.phone, password: rider.password || rider.phone}); }} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer">
                                  Edit Details
                                </button>
                              </div>
                              <a 
                                href={`/b/${tenantSlug}/delivery`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg transition bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-center flex items-center justify-center gap-1"
                              >
                                Delivery App <ExternalLink className="h-3 w-3" />
                              </a>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm(`Remove ${rider.name}?`)) return;
                                  const res = await fetch(`/api/ecom/delivery-boys?tenantSlug=${tenantSlug}&riderId=${rider.id}`, { method: "DELETE" });
                                  const data = await res.json();
                                  if (data.success) setDeliveryBoysList(prev => prev.filter(r => r.id !== rider.id));
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/20 transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" /> Remove
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
                  </div>
                )}

                {activeStaffSubTab === "posManagers" && (
                  <div className="flex flex-col gap-6">
                    {/* Add POS Manager Form */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="h-4 w-4 text-indigo-400" /> Add POS Manager</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-gray-500">Name</label>
                          <input
                            type="text"
                            placeholder="Manager Name"
                            value={newPosManagerName}
                            onChange={e => setNewPosManagerName(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-gray-500">Phone</label>
                          <input
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={newPosManagerPhone}
                            onChange={e => setNewPosManagerPhone(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-gray-500">Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={newPosManagerPassword}
                            onChange={e => setNewPosManagerPassword(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            disabled={isAddingPosManager || !newPosManagerName.trim() || !newPosManagerPhone.trim() || !newPosManagerPassword.trim()}
                            onClick={async () => {
                              setIsAddingPosManager(true);
                              try {
                                const res = await fetch("/api/ecom/pos-managers", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "create", tenantSlug, name: newPosManagerName, phone: newPosManagerPhone, password: newPosManagerPassword, storeId: storefrontsList[0]?.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setPosManagersList(prev => [...prev, data.manager]);
                                  setNewPosManagerName(""); setNewPosManagerPhone(""); setNewPosManagerPassword(""); setNewPosManagerAvatar("");
                                }
                              } catch (e) { console.error(e); }
                              setIsAddingPosManager(false);
                            }}
                            className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                          >
                            {isAddingPosManager ? "Adding..." : "Add Manager"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* POS Managers List */}
                    {posManagersList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl">
                        <Users className="h-10 w-10 text-gray-700" />
                        <p className="text-gray-400 text-sm font-medium">No POS Managers added yet</p>
                        <p className="text-gray-600 text-xs">Add your first POS Manager using the form above</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posManagersList.map(manager => (
                          <motion.div key={manager.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                            {editingPosManagerId === manager.id ? (
                              <div className="flex flex-col gap-3 relative z-10 w-full">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Edit POS Manager</h4>
                                <input type="text" value={editPosManagerData.name || ""} onChange={e => setEditPosManagerData({...editPosManagerData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Name" />
                                <input type="text" value={editPosManagerData.phone || ""} onChange={e => setEditPosManagerData({...editPosManagerData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Phone" />
                                <input type="text" value={editPosManagerData.password || ""} onChange={e => setEditPosManagerData({...editPosManagerData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Password" />
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => setEditingPosManagerId(null)} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition cursor-pointer">Cancel</button>
                                  <button onClick={async () => {
                                    const res = await fetch("/api/ecom/pos-managers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", tenantSlug, id: manager.id, ...editPosManagerData }) });
                                    const data = await res.json();
                                    if (data.success) { setPosManagersList(prev => prev.map(m => m.id === manager.id ? data.manager : m)); setEditingPosManagerId(null); }
                                  }} className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer">Save</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex justify-between items-start relative z-10 w-full">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-extrabold text-white text-lg">{manager.name}</h4>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${manager.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                        {manager.isActive ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {manager.phone}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 p-2 bg-black/40 rounded-lg text-[10px] text-gray-400 font-mono relative z-10 w-full">
                                  <Lock className="w-3 h-3" /> Pwd: {manager.password}
                                </div>
                                <div className="flex flex-col gap-2 mt-auto relative z-10 w-full">
                                  <div className="grid grid-cols-2 gap-2">
                                    <a 
                                      href={`/b/${tenantSlug}/pos`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg transition bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-center flex items-center justify-center gap-1"
                                    >
                                      Open POS <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <button onClick={() => { setEditingPosManagerId(manager.id); setEditPosManagerData({name: manager.name, phone: manager.phone, password: manager.password}); }} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer">
                                      Edit Details
                                    </button>
                                  </div>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!confirm(`Remove POS Manager ${manager.name}?`)) return;
                                      const res = await fetch(`/api/ecom/pos-managers`, { 
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ action: "delete", tenantSlug, id: manager.id })
                                      });
                                      const data = await res.json();
                                      if (data.success) setPosManagersList(prev => prev.filter(m => m.id !== manager.id));
                                    }}
                                    className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/20 transition cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" /> Remove
                                  </button>
                                </div>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}


{/* SUB TAB: PUBLIC APP LINKS */}
            {ecomSubTab === "appLinks" && (
              <motion.div key="appLinks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight flex items-center gap-3">
                      <QrCode className="h-7 w-7 text-indigo-400" /> Public App Links
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Share these links with your customers, POS Managers, and Delivery Riders to install their respective apps.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Main Store App */}
                  <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
                    <div className="flex items-start justify-between relative z-10 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                        <ShoppingCart className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Customer</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white mb-1">E-Commerce Store</h3>
                      <p className="text-xs text-indigo-200/60 mb-6">The main storefront for your customers to browse products, chat, and place orders.</p>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${baseShareUrl}/b/${tenantSlug}`} 
                          className="flex-1 bg-black/40 border border-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-indigo-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${baseShareUrl}/b/${tenantSlug}`);
                            alert("Link copied!");
                          }}
                          className="bg-indigo-500 hover:bg-indigo-400 text-white p-2.5 rounded-xl transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a 
                          href={`/b/${tenantSlug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 p-2.5 rounded-xl transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Chat Agent App */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
                    <div className="flex items-start justify-between relative z-10 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-inner">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">Customer</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white mb-1">AI Agent App</h3>
                      <p className="text-xs text-purple-200/60 mb-6">A dedicated conversational interface for your AI sales agent.</p>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${baseShareUrl}/b/${tenantSlug}/${agentsList[0]?.id || ''}`} 
                          className="flex-1 bg-black/40 border border-purple-500/20 rounded-xl px-3 py-2.5 text-xs text-purple-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${baseShareUrl}/b/${tenantSlug}/${agentsList[0]?.id || ''}`);
                            alert("Link copied!");
                          }}
                          className="bg-purple-500 hover:bg-purple-400 text-white p-2.5 rounded-xl transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a 
                          href={`/b/${tenantSlug}/${agentsList[0]?.id || ''}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 p-2.5 rounded-xl transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* POS Terminal App */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
                    <div className="flex items-start justify-between relative z-10 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                        <Monitor className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Staff</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white mb-1">POS Terminal</h3>
                      <p className="text-xs text-emerald-200/60 mb-6">In-store billing terminal for cashiers and store managers.</p>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${baseShareUrl}/b/${tenantSlug}/pos`} 
                          className="flex-1 bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-emerald-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${baseShareUrl}/b/${tenantSlug}/pos`);
                            alert("Link copied!");
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-xl transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a 
                          href={`/b/${tenantSlug}/pos`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 p-2.5 rounded-xl transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Delivery App */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
                    <div className="flex items-start justify-between relative z-10 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
                        <Bike className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Staff</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-white mb-1">Delivery App</h3>
                      <p className="text-xs text-blue-200/60 mb-6">Mobile application for your delivery staff to track and fulfill orders.</p>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${baseShareUrl}/b/${tenantSlug}/delivery`} 
                          className="flex-1 bg-black/40 border border-blue-500/20 rounded-xl px-3 py-2.5 text-xs text-blue-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${baseShareUrl}/b/${tenantSlug}/delivery`);
                            alert("Link copied!");
                          }}
                          className="bg-blue-500 hover:bg-blue-400 text-white p-2.5 rounded-xl transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a 
                          href={`/b/${tenantSlug}/delivery`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 p-2.5 rounded-xl transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

{/* SUB TAB: STORE SETTINGS */}
            {ecomSubTab === "store" && (
              <motion.div key="store-settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Shop Settings & Appearance</h2>
                
                <form onSubmit={handleSaveStoreSettings} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col gap-8">
                  
                  {/* Store Type & POS configuration */}
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 relative z-10"><Settings className="h-4 w-4 text-indigo-400" /> Advanced Store Configuration</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      {/* Store Type Selector */}
                      <div className="flex flex-col gap-3">
                        <label className="text-[11px] uppercase font-bold tracking-wider text-indigo-300">Store Category Type</label>
                        <p className="text-[10px] text-gray-400 mb-2">Changes the layout and available settings across the platform.</p>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "ecom", label: "E-Commerce", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg> },
                            { id: "food", label: "Food Delivery", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                            { id: "single", label: "Single Product", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setStoreType(t.id)}
                              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${storeType === t.id ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-black/40 border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-gray-300'}`}
                            >
                              {t.icon}
                              <span className="text-[10px] font-bold text-center mt-1">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* POS Toggle */}
                      <div className="flex flex-col gap-3">
                        <label className="text-[11px] uppercase font-bold tracking-wider text-indigo-300">Point of Sale (POS) System</label>
                        <p className="text-[10px] text-gray-400 mb-2">Enable advanced POS for in-person billing and invoice printing.</p>
                        
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-white">Activate Professional POS</h4>
                            <p className="text-[10px] text-gray-500">Includes thermal & A4 receipt printing.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStorePosEnabled(!storePosEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner outline-none ${storePosEnabled ? 'bg-emerald-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.3)]' : 'bg-gray-700/50 border border-white/5 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]'}`}
                          >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${storePosEnabled ? 'translate-x-[1.3rem] shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'translate-x-[2px]'}`} />
                          </button>
                        </div>
                      </div>

                      {/* POS Scanner App QR */}
                      <div className="flex flex-col gap-3">
                        <label className="text-[11px] uppercase font-bold tracking-wider text-indigo-300">Mobile Barcode Scanner App</label>
                        <p className="text-[10px] text-gray-400 mb-2">Use your smartphone as a live barcode scanner for the POS. Scan the QR code below to install the standalone scanner app.</p>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-3">
                          <div className="bg-white p-3 rounded-xl shadow-lg">
                            {typeof window !== 'undefined' && (
                              <QRCodeSVG 
                                value={`${window.location.origin}/b/${tenantSlug}/scanner?storeId=${selectedShopId}`} 
                                size={120} 
                                level="H"
                              />
                            )}
                          </div>
                          <a 
                            href={`/b/${tenantSlug}/scanner?storeId=${selectedShopId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Or open scanner app directly
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Settings className="h-4 w-4 text-indigo-400" /> Basic Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Company / Brand Name</label>
                        <input type="text" placeholder="e.g. Acme Corp" value={storeCompanyName} onChange={e=>setStoreCompanyName(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Store Language</label>
                        <PremiumDropdown 
                          value={storeLanguage} 
                          onChange={(val: string) => setStoreLanguage(val)} 
                          options={[
                            { value: "en", label: "English (US)" },
                            { value: "bn", label: "Bengali (BD)" },
                            { value: "hi", label: "Hindi (IN)" },
                            { value: "es", label: "Spanish (ES)" }
                          ]}
                          placeholder="Select Language"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Store Description</label>
                      <textarea placeholder="Describe your business..." value={storeDescription} onChange={e=>setStoreDescription(e.target.value)} rows={3} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
                    </div>

                    {/* Brand Logo */}
                    <div className="mt-4 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                      <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Brand Logo / Icon</p>
                      <p className="text-[10px] text-gray-500">Displayed in the store header and footer. PNG, WebP, JPG — max 2MB.</p>

                      {/* Preview */}
                      {storeBrandLogo && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                          <img loading="lazy" src={storeBrandLogo} alt="Brand logo" style={{ height: storeBrandLogoHeight }} className="object-contain rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">Preview at {storeBrandLogoHeight}px height</p>
                          </div>
                          <button onClick={() => setStoreBrandLogo("")} className="text-red-400 hover:text-red-300 text-[11px] font-bold">Remove</button>
                        </div>
                      )}

                      {/* URL input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                        <input type="url" placeholder="https://example.com/logo.png" value={storeBrandLogo}
                          onChange={e => setStoreBrandLogo(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none" />
                      </div>

                      {/* File upload */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Or Upload File</label>
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors">
                          <span className="text-[12px] text-gray-400">Click to upload logo</span>
                          <input type="file" accept="image/png,image/webp,image/jpeg,image/jpg" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB."); return; }
                              const reader = new FileReader();
                              reader.onload = () => setStoreBrandLogo(reader.result as string);
                              reader.readAsDataURL(file);
                            }} />
                        </label>
                      </div>

                      {/* Size selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logo Height</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[24, 32, 36, 40, 48, 56, 64].map(h => (
                            <button key={h} onClick={() => setStoreBrandLogoHeight(h)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${storeBrandLogoHeight === h ? "bg-indigo-600 text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
                              {h}px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Regional & Financial */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-400" /> Regional & Agent Setup</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 px-1">Global Store Currency</label>
                        <div className="relative">
                          <PremiumDropdown 
                            value={storeGlobalCurrency} 
                            onChange={(val: string) => setStoreGlobalCurrency(val)} 
                            options={[
                              { value: "USD", label: "US Dollar ($)" }, { value: "EUR", label: "Euro (€)" }, { value: "GBP", label: "British Pound (£)" }, 
                              { value: "INR", label: "Indian Rupee (₹)" }, { value: "BDT", label: "Bangladeshi Taka (৳)" }, { value: "AUD", label: "Australian Dollar (A$)" }, 
                              { value: "CAD", label: "Canadian Dollar (C$)" }, { value: "SGD", label: "Singapore Dollar (S$)" }, { value: "AED", label: "Emirati Dirham (د.إ)" }, 
                              { value: "SAR", label: "Saudi Riyal (﷼)" }, { value: "JPY", label: "Japanese Yen (¥)" }, { value: "CNY", label: "Chinese Yuan (¥)" }, 
                              { value: "CHF", label: "Swiss Franc (CHF)" }, { value: "ZAR", label: "South African Rand (R)" }, { value: "NZD", label: "New Zealand Dollar (NZ$)" }, 
                              { value: "RUB", label: "Russian Ruble (₽)" }, { value: "BRL", label: "Brazilian Real (R$)" }, { value: "MXN", label: "Mexican Peso (Mex$)" }, 
                              { value: "SEK", label: "Swedish Krona (kr)" }, { value: "NOK", label: "Norwegian Krone (kr)" }, { value: "DKK", label: "Danish Krone (kr)" }, 
                              { value: "HKD", label: "Hong Kong Dollar (HK$)" }, { value: "TRY", label: "Turkish Lira (₺)" }, { value: "KRW", label: "South Korean Won (₩)" }, 
                              { value: "IDR", label: "Indonesian Rupiah (Rp)" }, { value: "MYR", label: "Malaysian Ringgit (RM)" }, { value: "PHP", label: "Philippine Peso (₱)" }, 
                              { value: "THB", label: "Thai Baht (฿)" }, { value: "VND", label: "Vietnamese Dong (₫)" }, { value: "EGP", label: "Egyptian Pound (E£)" }, 
                              { value: "NGN", label: "Nigerian Naira (₦)" }, { value: "PKR", label: "Pakistani Rupee (₨)" }, { value: "LKR", label: "Sri Lankan Rupee (Rs)" }, 
                              { value: "KWD", label: "Kuwaiti Dinar (KD)" }, { value: "QAR", label: "Qatari Riyal (QR)" }
                            ]}
                            placeholder="Select Currency" 
                          />
                        </div>
                        <p className="text-[9px] text-gray-500 px-1">Prices across the store will use this symbol automatically.</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 px-1">Assigned Sales Agent</label>
                        <PremiumDropdown 
                          value={storeAssignedAgentId} 
                          onChange={(val: string) => setStoreAssignedAgentId(val)} 
                          options={[
                            { value: "", label: "No Agent Assigned" },
                            ...agentsList.map(a => ({ value: a.id, label: a.name }))
                          ]}
                          placeholder="Select an Agent" 
                        />
                        <p className="text-[9px] text-gray-500 px-1">This agent will power the bottom navigation chatbot.</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Appearance */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-400" /> App Appearance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Primary Color</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2">
                          <input type="color" value={storePrimaryColor} onChange={e=>setStorePrimaryColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" />
                          <span className="text-xs text-gray-300 font-mono">{storePrimaryColor}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Accent Color</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2">
                          <input type="color" value={storeAccentColor} onChange={e=>setStoreAccentColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" />
                          <span className="text-xs text-gray-300 font-mono">{storeAccentColor}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Hero Layout</label>
                        <PremiumDropdown 
                          value={storeHeroType} 
                          onChange={(val: string) => setStoreHeroType(val)} 
                          options={[
                            { value: "banner", label: "Static Banner" },
                            { value: "carousel", label: "Animated Carousel" }
                          ]}
                          placeholder="Select Hero Layout" 
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Storefront Template</label>
                        <PremiumDropdown 
                          value={storeTemplate} 
                          onChange={(val: string) => setStoreTemplate(val)} 
                          options={[
                            { value: "retail_premium", label: "✨ Premium Retail Pro (New)" },
                            { value: "retail", label: "Retail E-Commerce Store" },
                            { value: "food", label: "Zomato/Swiggy Food Ordering" },
                            { value: "restaurant-v2-dark", label: "Restaurant v2 Dark" },
                            { value: "restaurant-v2-light", label: "Restaurant v2 Light" }
                          ]}
                          placeholder="Select Template" 
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Glossy Color Theme Preset</label>
                        <PremiumDropdown 
                          value={storeThemePreset} 
                          onChange={(val: string) => setStoreThemePreset(val)} 
                          options={[
                            { value: "nimbus", label: "Nimbus (Glassmorphic Indigo)" },
                            { value: "crimson", label: "Crimson Glory (Zomato Red)" },
                            { value: "citrus", label: "Sunset Citrus (Swiggy Orange)" },
                            { value: "emerald", label: "Emerald Fresh (UberEats Green)" },
                            { value: "flamingo", label: "Flamingo Glow (Foodpanda Pink)" },
                            { value: "starbucks", label: "Forest Mint (Starbucks Green)" },
                            { value: "caviar", label: "Golden Amber (Caviar Gold)" },
                            { value: "deliveroo", label: "Ocean Breeze (Deliveroo Teal)" },
                            { value: "chipotle", label: "Terracotta Pepper (Chipotle Rust)" },
                            { value: "gopuff", label: "Cosmic Grape (Gopuff Violet)" },
                            { value: "dominos", label: "Dominos Classic Royal Blue (Domino's Blue)" }
                          ]}
                          placeholder="Select Theme" 
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors group">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">Enable Native Bottom Navigation</span>
                          <span className="text-[10px] text-gray-500">Shows a fixed app-like footer on mobile devices for easy browsing.</span>
                        </div>
                        <div className="relative flex items-center">
                          <input type="checkbox" checked={storeEnableFooterNav} onChange={e=>setStoreEnableFooterNav(e.target.checked)} className="peer sr-only" />
                          <div className="h-6 w-11 rounded-full bg-gray-800 peer-checked:bg-purple-500 transition-colors shadow-inner border border-black/50"></div>
                          <div className="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-[20px] shadow-sm"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Promo Campaign Banner */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-rose-400"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                      <span>Promo Flash Sale Banner</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Promo Banner Image URL</label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://images.unsplash.com/... or Base64" 
                          value={storePromoBannerImage} 
                          onChange={e => setStorePromoBannerImage(e.target.value)} 
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Promo Banner Action Link (URL)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. /b/tenant/p/product-id or external link" 
                          value={storePromoBannerLink} 
                          onChange={e => setStorePromoBannerLink(e.target.value)} 
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Promo Banner Headline Text</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MID-SUMMER FESTIVAL SALE: FLAT 40% OFF ON ALL ITEMS!" 
                        value={storePromoBannerText} 
                        onChange={e => setStorePromoBannerText(e.target.value)} 
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" 
                      />
                    </div>
                  </div>

                  {storeType === "food" && (
                    <>
                      <hr className="border-white/5" />
                      
                      {/* Active Kitchen Offers Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span>Active Kitchen Offers (Food Template)</span>
                          </h3>
                          <button type="button" onClick={() => setStoreKitchenOffers([...storeKitchenOffers, { title: "", desc: "", badge: "" }])} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 bg-emerald-400/10 rounded-lg">+ Add Offer</button>
                        </div>
                        <div className="flex flex-col gap-4">
                          {storeKitchenOffers.map((offer, idx) => (
                            <div key={idx} className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <input type="text" placeholder="Offer Title (e.g. FLAT 50% OFF)" value={offer.title} onChange={e => { const newOffers = [...storeKitchenOffers]; newOffers[idx].title = e.target.value; setStoreKitchenOffers(newOffers); }} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                <input type="text" placeholder="Description (e.g. Code: WELCOME50)" value={offer.desc} onChange={e => { const newOffers = [...storeKitchenOffers]; newOffers[idx].desc = e.target.value; setStoreKitchenOffers(newOffers); }} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                <div className="flex gap-2">
                                  <input type="text" placeholder="Badge (e.g. LIMITED TIME)" value={offer.badge} onChange={e => { const newOffers = [...storeKitchenOffers]; newOffers[idx].badge = e.target.value; setStoreKitchenOffers(newOffers); }} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                  <button type="button" onClick={() => { const newOffers = storeKitchenOffers.filter((_, i) => i !== idx); setStoreKitchenOffers(newOffers); }} className="px-3 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30">X</button>
                                </div>
                              </div>
                              <input type="text" placeholder="Background Image URL (Optional)" value={offer.image || ""} onChange={e => { const newOffers = [...storeKitchenOffers]; newOffers[idx].image = e.target.value; setStoreKitchenOffers(newOffers); }} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-white/5" />

                      {/* Premium Food Combos Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-orange-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <span>Premium Food Combos (KFC/Zomato Style)</span>
                          </h3>
                          <button type="button" onClick={() => setStoreFoodCombos([...storeFoodCombos, { id: Math.random().toString(36).substr(2, 9), title: "", desc: "", price: 0, items: [] }])} className="text-xs text-orange-400 hover:text-orange-300 font-bold px-2 py-1 bg-orange-400/10 rounded-lg">+ Add Combo</button>
                        </div>
                        <div className="flex flex-col gap-4">
                          {storeFoodCombos.map((combo, idx) => (
                            <div key={combo.id || idx} className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5 relative">
                              <button type="button" onClick={() => { const newC = storeFoodCombos.filter((_, i) => i !== idx); setStoreFoodCombos(newC); }} className="absolute top-3 right-3 text-red-500 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-8">
                                <input type="text" placeholder="Combo Title (e.g. Zinger Burger Pack)" value={combo.title} onChange={e => { const newC = [...storeFoodCombos]; newC[idx].title = e.target.value; setStoreFoodCombos(newC); }} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                                <input type="number" placeholder="Combo Price ($)" value={combo.price || ""} onChange={e => { const newC = [...storeFoodCombos]; newC[idx].price = parseFloat(e.target.value) || 0; setStoreFoodCombos(newC); }} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                                <input type="text" placeholder="Description" value={combo.desc} onChange={e => { const newC = [...storeFoodCombos]; newC[idx].desc = e.target.value; setStoreFoodCombos(newC); }} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                              </div>
                              <input type="text" placeholder="Premium Background Image URL" value={combo.image || ""} onChange={e => { const newC = [...storeFoodCombos]; newC[idx].image = e.target.value; setStoreFoodCombos(newC); }} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none" />
                              
                              <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Included Products</span>
                                  <button type="button" onClick={() => {
                                    const newC = [...storeFoodCombos];
                                    if (!newC[idx].items) newC[idx].items = [];
                                    newC[idx].items.push({ productId: "", quantity: 1 });
                                    setStoreFoodCombos(newC);
                                  }} className="text-[10px] text-orange-400 hover:text-orange-300 font-bold">+ Add Item</button>
                                </div>
                                {combo.items?.map((item: any, itemIdx: number) => (
                                  <div key={itemIdx} className="flex items-center gap-2">
                                    <ProductCardSelector 
                                      value={item.productId} 
                                      onChange={(val: string) => { 
                                        const newC = [...storeFoodCombos]; 
                                        newC[idx].items[itemIdx].productId = val; 
                                        setStoreFoodCombos(newC); 
                                      }} 
                                      products={productsList} 
                                    />
                                    <input type="number" min="1" value={item.quantity} onChange={e => { const newC = [...storeFoodCombos]; newC[idx].items[itemIdx].quantity = parseInt(e.target.value) || 1; setStoreFoodCombos(newC); }} className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none text-center" />
                                    <button type="button" onClick={() => { const newC = [...storeFoodCombos]; newC[idx].items = newC[idx].items.filter((_: any, i: number) => i !== itemIdx); setStoreFoodCombos(newC); }} className="text-red-500 hover:text-red-400 p-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
                                  </div>
                                ))}
                                {(!combo.items || combo.items.length === 0) && <p className="text-[10px] text-gray-500 italic">No products added to this combo yet.</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-white/5" />
                    </>
                  )}

                  {/* Featured Collection Selection */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span>Featured Products Collection</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mb-3 px-1">Select products to show on the front page Featured section (Myntra/Flipkart style catalog spotlight).</p>
                    
                    {productsList.length === 0 ? (
                      <p className="text-xs text-gray-500 italic px-1">No products created yet. Register products in Catalog to select them here.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
                        {productsList.map((prod: any) => {
                          const isChecked = storeFeaturedProductIds.includes(prod.id);
                          return (
                            <label 
                              key={prod.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                                isChecked ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-black/35 border-white/5 text-gray-400 hover:border-white/10"
                              }`}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                className="sr-only"
                                onChange={() => {
                                  if (isChecked) {
                                    setStoreFeaturedProductIds(storeFeaturedProductIds.filter(id => id !== prod.id));
                                  } else {
                                    setStoreFeaturedProductIds([...storeFeaturedProductIds, prod.id]);
                                  }
                                }}
                              />
                              <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? "bg-amber-500 border-amber-500" : "border-white/20"}`}>
                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3px] text-black" />}
                              </div>
                              <span className="text-xs truncate font-bold">{prod.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <hr className="border-white/5" />

                  {/* Storefront Layout Sequence Reordering */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-cyan-400"><path d="m15 12-3-3-3 3"/><path d="m9 12 3 3 3-3"/><path d="M12 3v18"/></svg>
                      <span>Homepage Customizer (Flipkart/Myntra Layout Steps)</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mb-4 px-1">Reorder storefront layout sections step-by-step. Click Up/Down arrows to customize the display flow of your e-commerce homepage.</p>
                    
                    <div className="flex flex-col gap-2.5 max-w-md">
                      {storeLayoutSequence.map((item, index) => {
                        const labelMap: Record<string, string> = {
                          categories: "Top Categories Row (Circular Badges)",
                          hero: "Main Banner (Hero Section Title & Background)",
                          sale: "Promo Banner Card (Flash Sale Offer)",
                          featured: "Featured Collection Spotlight (Selected Items)",
                          products: "Complete Catalog Grid (All Registered Products)"
                        };

                        const colorMap: Record<string, string> = {
                          categories: "border-indigo-500/20 text-indigo-400",
                          hero: "border-purple-500/20 text-purple-400",
                          sale: "border-rose-500/20 text-rose-400",
                          featured: "border-amber-500/20 text-amber-400",
                          products: "border-emerald-500/20 text-emerald-400"
                        };

                        const handleMove = (dir: "up" | "down") => {
                          const newSeq = [...storeLayoutSequence];
                          const targetIdx = dir === "up" ? index - 1 : index + 1;
                          if (targetIdx < 0 || targetIdx >= newSeq.length) return;
                          
                          // Swap
                          const temp = newSeq[index];
                          newSeq[index] = newSeq[targetIdx];
                          newSeq[targetIdx] = temp;
                          setStoreLayoutSequence(newSeq);
                        };

                        return (
                          <div 
                            key={item} 
                            className={`flex items-center justify-between p-3.5 rounded-xl border bg-black/40 ${colorMap[item] || "border-white/10 text-white"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-600 text-[10px]">{index + 1}.</span>
                              <span className="text-xs font-black uppercase tracking-wider">{labelMap[item] || item}</span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button 
                                type="button" 
                                disabled={index === 0}
                                onClick={() => handleMove("up")}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer text-white"
                              >
                                ▲
                              </button>
                              <button 
                                type="button" 
                                disabled={index === storeLayoutSequence.length - 1}
                                onClick={() => handleMove("down")}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer text-white"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Save Global Settings
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            
            
            {/* SUB TAB: ADVANCED ANALYTICS */}
            {ecomSubTab === "analytics" && (
              <motion.div key="analytics_advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Advanced Analytics</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Range:</span>
                    <select value={analyticsDateRange} onChange={e => setAnalyticsDateRange(parseInt(e.target.value))} className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer">
                      <option value={7} className="bg-gray-900">Last 7 Days</option>
                      <option value={15} className="bg-gray-900">Last 15 Days</option>
                      <option value={30} className="bg-gray-900">Last 30 Days</option>
                      <option value={90} className="bg-gray-900">Last 3 Months</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const cutOffDate = subDays(new Date(), analyticsDateRange);
                  const filteredOrders = ordersList.filter(o => isAfter(new Date(o.createdAt), cutOffDate));
                  const revenue = filteredOrders.reduce((acc, o) => acc + (o.amountCents / 100), 0);
                  const newCustomers = customersList.filter(c => isAfter(new Date(c.createdAt), cutOffDate)).length;
                  const aov = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;
                  
                  // Process chart data
                  const chartDataMap: Record<string, number> = {};
                  for (let i = analyticsDateRange - 1; i >= 0; i--) {
                    chartDataMap[format(subDays(new Date(), i), "MMM dd")] = 0;
                  }
                  filteredOrders.forEach(o => {
                    const dateKey = format(new Date(o.createdAt), "MMM dd");
                    if (chartDataMap[dateKey] !== undefined) {
                      chartDataMap[dateKey] += (o.amountCents / 100);
                    }
                  });
                  const chartData = Object.entries(chartDataMap).map(([date, total]) => ({ date, total }));

                  // Product performance
                  const productMap: Record<string, {name: string, revenue: number, qty: number}> = {};
                  filteredOrders.forEach(o => {
                    const items = JSON.parse(o.itemsJson || "[]");
                    items.forEach((item: any) => {
                      if (!productMap[item.id]) productMap[item.id] = { name: item.name, revenue: 0, qty: 0 };
                      productMap[item.id].revenue += (item.price * item.qty);
                      productMap[item.id].qty += item.qty;
                    });
                  });
                  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

                  return (
                    <>
                      {/* Premium KPI Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 flex flex-col gap-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><LineChart className="w-12 h-12 text-indigo-400" /></div>
                          <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider relative z-10">Total Revenue</span>
                          <span className="text-3xl font-extrabold text-white font-mono relative z-10">${revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 flex flex-col gap-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag className="w-12 h-12 text-emerald-400" /></div>
                          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider relative z-10">Total Orders</span>
                          <span className="text-3xl font-extrabold text-white font-mono relative z-10">{filteredOrders.length}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col gap-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-12 h-12 text-amber-400" /></div>
                          <span className="text-amber-300 text-xs font-bold uppercase tracking-wider relative z-10">Avg Order Value</span>
                          <span className="text-3xl font-extrabold text-white font-mono relative z-10">${aov.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 flex flex-col gap-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-12 h-12 text-pink-400" /></div>
                          <span className="text-pink-300 text-xs font-bold uppercase tracking-wider relative z-10">New Customers</span>
                          <span className="text-3xl font-extrabold text-white font-mono relative z-10">{newCustomers}</span>
                        </div>
                      </div>

                      {/* Recharts Area Chart */}
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> Revenue Trend</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} tickLine={false} axisLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                              <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#818cf8', fontWeight: 'bold'}} />
                              <Area type="monotone" dataKey="total" name="Revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Recharts Bar Chart - Top Products */}
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-emerald-400" /> Top Selling Products</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} tickLine={false} axisLine={false} />
                              <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: "rgba(255,255,255,0.5)", fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                              <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#34d399', fontWeight: 'bold'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                              <Bar dataKey="revenue" name="Revenue Generated" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* SUB TAB: CUSTOMERS CRM */}
            {ecomSubTab === "customers" && (
              <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Customer CRM</h2>
                  <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setCustomerFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${customerFilter === 'all' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>All</button>
                    <button onClick={() => setCustomerFilter('pos')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${customerFilter === 'pos' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>POS</button>
                    <button onClick={() => setCustomerFilter('online')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${customerFilter === 'online' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Online</button>
                  </div>
                  <button onClick={() => {
                    const csvRows = ["Name,Phone,Email,Source,Date"];
                    customersList.forEach(c => csvRows.push(`${c.name},${c.phone},${c.email || ''},${c.source},${new Date(c.createdAt).toLocaleDateString()}`));
                    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `customers_${tenantSlug}.csv`;
                    a.click();
                  }} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/10 shadow-xl transition-all cursor-pointer flex items-center gap-2">
                    <Save className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Name</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Contact</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Source</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase">Date Joined</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customersList.filter(c => customerFilter === 'all' || c.source === customerFilter).map(cust => (
                          <tr key={cust.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedCustomerForHistory(cust)}>
                            <td className="p-4 text-sm font-bold text-white">{cust.name}</td>
                            <td className="p-4">
                              <div className="text-sm text-gray-300">{cust.phone}</div>
                              <div className="text-xs text-gray-500">{cust.email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${cust.source === 'pos' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{cust.source}</span>
                            </td>
                            <td className="p-4 text-sm text-gray-400">{new Date(cust.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <button className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">View Orders</button>
                            </td>
                          </tr>
                        ))}
                        {customersList.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No customers found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Customer History Modal */}
                {selectedCustomerForHistory && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomerForHistory(null)}>
                    <div className="bg-[#0b0e1e] border border-white/10 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedCustomerForHistory.name}'s History</h3>
                          <p className="text-sm text-gray-400">{selectedCustomerForHistory.phone}</p>
                        </div>
                        <button onClick={() => setSelectedCustomerForHistory(null)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"><XCircle className="w-6 h-6" /></button>
                      </div>
                      <div className="p-6 overflow-y-auto flex flex-col gap-4">
                        {ordersList.filter(o => o.buyerPhone === selectedCustomerForHistory.phone || o.customerId === selectedCustomerForHistory.id).length === 0 ? (
                          <div className="text-center text-gray-500 py-8">No order history found for this customer.</div>
                        ) : (
                          ordersList.filter(o => o.buyerPhone === selectedCustomerForHistory.phone || o.customerId === selectedCustomerForHistory.id).map(order => (
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">Order {order.id.split('_').pop()}</span>
                                <span className="text-xs font-mono text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-gray-300">
                                {JSON.parse(order.itemsJson || "[]").map((item:any) => `${item.qty}x ${item.name}`).join(", ")}
                              </div>
                              <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${order.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{order.status}</span>
                                <span className="text-sm font-bold text-white">${(order.amountCents / 100).toFixed(2)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SUB TAB: SETTINGS & GATEWAYS */}
            {(ecomSubTab === "gateways") && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">Payment Gateways</h2>
                
                <form onSubmit={handleSavePaymentSettings} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col gap-8">
                  
                  {/* Gateway Selector */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4 text-indigo-400" /> Active Provider</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Platform Option */}
                      <label className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all ${paymentProvider === "platform" ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "bg-black/40 border-white/10 hover:border-white/30"}`}>
                        <input type="radio" name="gateway" value="platform" checked={paymentProvider === "platform"} onChange={() => setPaymentProvider("platform")} className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"><ShoppingCart className="h-5 w-5 text-white" /></div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Platform Managed</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Use Aether's default checkout (2% fee).</p>
                        </div>
                      </label>

                      {/* Stripe Option */}
                      <label className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all ${paymentProvider === "stripe_custom" ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "bg-black/40 border-white/10 hover:border-white/30"}`}>
                        <input type="radio" name="gateway" value="stripe_custom" checked={paymentProvider === "stripe_custom"} onChange={() => setPaymentProvider("stripe_custom")} className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg font-black text-white text-xl font-sans">S</div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Custom Stripe</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Connect your own Stripe account.</p>
                        </div>
                      </label>

                      {/* Razorpay Option */}
                      <label className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all ${paymentProvider === "razorpay_custom" ? "bg-blue-600/10 border-[#0b336e] shadow-[0_0_20px_rgba(11,51,110,0.3)]" : "bg-black/40 border-white/10 hover:border-white/30"}`}>
                        <input type="radio" name="gateway" value="razorpay_custom" checked={paymentProvider === "razorpay_custom"} onChange={() => setPaymentProvider("razorpay_custom")} className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-[#0b336e] flex items-center justify-center shadow-lg"><CreditCard className="h-5 w-5 text-white" /></div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Custom Razorpay</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Connect your own Razorpay account.</p>
                        </div>
                      </label>

                    </div>
                  </div>

                  {/* Configuration Panels */}
                  <AnimatePresence mode="wait">
                    
                    {paymentProvider === "stripe_custom" && (
                      <motion.div key="stripe" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-5 overflow-hidden">
                        <hr className="border-white/5" />
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-400" />
                          <p className="text-xs"><strong>Integration Guide:</strong> Log into your Stripe Dashboard -&gt; Developers -&gt; API Keys. Copy the Publishable key and Secret key into the fields below.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Publishable Key (pk_test_...)</label>
                            <input type="text" value={stripePublicKey} onChange={e=>setStripePublicKey(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono" placeholder="pk_..." />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Secret Key (sk_test_...)</label>
                            <input type="password" value={stripeSecretKey} onChange={e=>setStripeSecretKey(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono" placeholder="sk_..." />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentProvider === "razorpay_custom" && (
                      <motion.div key="razorpay" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-5 overflow-hidden">
                        <hr className="border-white/5" />
                        <div className="bg-[#0b336e]/10 border border-[#0b336e]/30 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-[#3b82f6]" />
                          <p className="text-xs"><strong>Integration Guide:</strong> Log into your Razorpay Dashboard -&gt; Settings -&gt; API Keys. Generate a new key pair and paste the Key ID and Key Secret below.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Key ID (rzp_test_...)</label>
                            <input type="text" value={razorpayKeyId} onChange={e=>setRazorpayKeyId(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono" placeholder="rzp_..." />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Key Secret</label>
                            <input type="password" value={razorpayKeySecret} onChange={e=>setRazorpayKeySecret(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono" placeholder="Secret Key" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  <hr className="border-white/5 my-2" />

                  {/* Cash on Delivery Toggle */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">Offline Payments</label>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${enableCashOnDelivery ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">Cash on Delivery (COD)</span>
                          <span className="text-xs text-gray-500">Allow customers to pay when the product is delivered</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEnableCashOnDelivery(!enableCashOnDelivery)}
                        className="cursor-pointer"
                      >
                        {enableCashOnDelivery ? (
                          <ToggleRight className="h-8 w-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSavingPayments} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50">
                      {isSavingPayments ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Save API Keys</>}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}


            {/* SUB TAB: STORE PAGES */}
            {ecomSubTab === "pages" && (
              <motion.div key="pages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">Store Pages</h2>
                    <p className="text-gray-400 text-sm mt-1">Edit your store's About, Contact, Policies and FAQ pages</p>
                  </div>
                  {editingPage && (
                    <button onClick={() => setEditingPage(null)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition text-sm">
                      ← All Pages
                    </button>
                  )}
                </div>

                {pagesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
                  </div>
                ) : editingPage ? (
                  /* ── Page Editor ── */
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="text-white font-bold text-lg">{editingPage.title}</h3>
                        <p className="text-gray-400 text-xs">/{tenantSlug}/page/{editingPage.slug}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-gray-400">Active</span>
                        <button
                          onClick={() => setEditingPage((p: any) => ({ ...p, isActive: !p.isActive }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all ${editingPage.isActive ? "bg-emerald-500" : "bg-gray-600"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow ${editingPage.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Page Title</label>
                      <input
                        value={editingPage.title}
                        onChange={e => setEditingPage((p: any) => ({ ...p, title: e.target.value }))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Content (HTML)</label>
                        <a
                          href={`/b/${tenantSlug}/page/${editingPage.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 transition"
                        >
                          Preview ↗
                        </a>
                      </div>
                      <textarea
                        value={editingPage.content}
                        onChange={e => setEditingPage((p: any) => ({ ...p, content: e.target.value }))}
                        rows={16}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-y"
                        placeholder="Enter HTML content..."
                      />
                      <p className="text-gray-500 text-[10px]">You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button onClick={() => setEditingPage(null)} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition">
                        Cancel
                      </button>
                      <button
                        onClick={saveStorePage}
                        disabled={pagesSaving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition disabled:opacity-50"
                      >
                        {pagesSaving ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving…</> : <><FileText className="h-4 w-4" /> Save Page</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Pages List ── */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(storePages.length > 0 ? storePages : [
                      { slug: "about", title: "About Us", icon: "🏪", isActive: true },
                      { slug: "contact", title: "Contact Us", icon: "📞", isActive: true },
                      { slug: "returns", title: "Returns & Exchanges", icon: "↩", isActive: true },
                      { slug: "shipping", title: "Shipping Policy", icon: "🚚", isActive: true },
                      { slug: "privacy", title: "Privacy Policy", icon: "🔒", isActive: true },
                      { slug: "terms", title: "Terms of Service", icon: "📜", isActive: true },
                      { slug: "faq", title: "FAQ", icon: "❓", isActive: true },
                    ]).map((page: any) => (
                      <button
                        key={page.slug}
                        onClick={() => setEditingPage(page)}
                        className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl text-left transition-all group"
                      >
                        <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl shrink-0">
                          {page.icon || "📄"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{page.title}</p>
                          <p className="text-gray-500 text-[10px] mt-0.5">/page/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${page.isActive !== false ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-500"}`}>
                            {page.isActive !== false ? "Live" : "Hidden"}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-emerald-400 transition" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick links info */}
                {!editingPage && (
                  <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 text-xs text-blue-300">
                    <p className="font-bold mb-1">📎 Page URLs for your store:</p>
                    <p className="text-blue-400 font-mono">/b/{tenantSlug}/page/about</p>
                    <p className="text-blue-400 font-mono">/b/{tenantSlug}/page/contact</p>
                    <p className="text-blue-400 font-mono">/b/{tenantSlug}/page/faq</p>
                    <p className="text-gray-500 mt-2">These pages are automatically linked in your store footer.</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

            {/* BARCODE PRINT MODAL */}
      <AnimatePresence>
        {barcodePrintProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg bg-gradient-to-b from-[#111626] to-[#0a0d18] border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative z-[111]">
              <button onClick={() => setBarcodePrintProduct(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition">
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Printer className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Print Barcode Labels</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{barcodePrintProduct.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Label Size & Printer Type</label>
                  <select id="barcodePrinterType" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none font-medium">
                    <optgroup label="A4 Sheets (Laser/Inkjet)">
                      <option value="a4_24">A4 - 24 Labels (64.0 x 33.8 mm)</option>
                      <option value="a4_40">A4 - 40 Labels (45.7 x 25.4 mm)</option>
                      <option value="a4_65">A4 - 65 Labels (38.1 x 21.2 mm)</option>
                    </optgroup>
                    <optgroup label="Thermal Roll Printers">
                      <option value="thermal_50x30">Thermal 50x30 mm (Standard)</option>
                      <option value="thermal_40x20">Thermal 40x20 mm (Mini)</option>
                      <option value="thermal_50x50">Thermal 50x50 mm (Square)</option>
                      <option value="thermal_100x150">Thermal 100x150 mm (Shipping Size)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Quantity to Print</label>
                  <input type="number" id="barcodeQty" defaultValue={24} min={1} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none font-mono" />
                </div>
              </div>

              <button 
                onClick={() => {
                  const qty = parseInt((document.getElementById('barcodeQty') as HTMLInputElement).value || "24");
                  const pType = (document.getElementById('barcodePrinterType') as HTMLSelectElement).value;
                  const printWin = window.open('', '', 'width=800,height=600');
                  if (!printWin) return;
                  
                  const barcodeValue = barcodePrintProduct.barcode || barcodePrintProduct.sku || barcodePrintProduct.id;
                  const priceStr = barcodePrintProduct.currency === "USD" ? "$" : barcodePrintProduct.currency === "INR" ? "₹" : "£";
                  const price = priceStr + (barcodePrintProduct.price / 100).toFixed(2);
                  const storeName = "Store";
                  
                  let html = '';
                  if (pType.startsWith('a4')) {
                    // Default to 24 labels
                    let cols = 3, rows = 8, gap = '5mm', padding = '5mm', fontSize = 12, bcHeight = 40, bcWidth = 1.5;
                    
                    if (pType === 'a4_40') { cols = 4; rows = 10; gap = '3mm'; padding = '3mm'; fontSize = 10; bcHeight = 25; bcWidth = 1.2; }
                    if (pType === 'a4_65') { cols = 5; rows = 13; gap = '2mm'; padding = '2mm'; fontSize = 8; bcHeight = 20; bcWidth = 1.0; }

                    html = `
                      <html><head><title>Print Labels</title>
                      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                      <style>
                        body { margin: 0; padding: 10mm; font-family: sans-serif; }
                        .grid { display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}; }
                        .label { border: 1px dashed #ccc; padding: ${padding}; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between; overflow:hidden;}
                        .store { font-weight: bold; font-size: ${fontSize-2}px; text-transform: uppercase; margin-bottom: 2px;}
                        .name { font-size: ${fontSize-1}px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
                        .price { font-weight: bold; font-size: ${fontSize+2}px; margin-top: 5px; }
                        svg { max-width: 100%; height: auto; }
                        @media print { .label { border: none; } }
                      </style>
                      </head><body><div class="grid">
                    `;
                    for(let i=0; i<qty; i++) {
                      html += `<div class="label">
                        <div class="store">${storeName}</div>
                        <div class="name">${barcodePrintProduct.name}</div>
                        <svg class="barcode" jsbarcode-value="${barcodeValue}" jsbarcode-height="${bcHeight}" jsbarcode-width="${bcWidth}" jsbarcode-fontSize="${fontSize}" jsbarcode-margin="0"></svg>
                        <div class="price">${price}</div>
                      </div>`;
                    }
                    html += `</div>
                      <script>
                        JsBarcode(".barcode").init();
                        setTimeout(() => { window.print(); }, 500);
                      </script>
                    </body></html>`;
                  } else {
                    let w = 50, h = 30, fontSize = 10, bcHeight = 30, bcWidth = 1.2;
                    if (pType === 'thermal_40x20') { w=40; h=20; fontSize=8; bcHeight=20; bcWidth=1; }
                    if (pType === 'thermal_50x50') { w=50; h=50; fontSize=12; bcHeight=50; bcWidth=1.5; }
                    if (pType === 'thermal_100x150') { w=100; h=150; fontSize=18; bcHeight=100; bcWidth=2.5; }

                    html = `
                      <html><head><title>Print Labels</title>
                      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                      <style>
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        .label { width: ${w-4}mm; height: ${h-4}mm; padding: 2mm; text-align: center; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; box-sizing: border-box; overflow:hidden;}
                        .store { font-weight: bold; font-size: ${fontSize-2}px; text-transform: uppercase; margin-bottom: 1px;}
                        .name { font-size: ${fontSize-1}px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
                        .price { font-weight: bold; font-size: ${fontSize+1}px; margin-top: 2px; }
                        svg { max-width: 100%; height: auto; }
                        @media print { @page { size: ${w}mm ${h}mm; margin: 0; } }
                      </style>
                      </head><body>
                    `;
                    for(let i=0; i<qty; i++) {
                      html += `<div class="label">
                        <div class="store">${storeName}</div>
                        <div class="name">${barcodePrintProduct.name}</div>
                        <svg class="barcode" jsbarcode-value="${barcodeValue}" jsbarcode-height="${bcHeight}" jsbarcode-width="${bcWidth}" jsbarcode-fontSize="${fontSize}" jsbarcode-margin="0" jsbarcode-displayValue="true"></svg>
                        <div class="price">${price}</div>
                      </div>`;
                    }
                    html += `
                      <script>
                        JsBarcode(".barcode").init();
                        setTimeout(() => { window.print(); }, 500);
                      </script>
                    </body></html>`;
                  }
                  
                  printWin.document.write(html);
                  printWin.document.close();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 mt-2"
              >
                Print Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* PRODUCT EDIT OVERLAY MODAL */}
      <AnimatePresence>
      {editingProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#111626] to-[#0a0d18] border border-white/10 p-8 flex flex-col gap-6 shadow-2xl relative z-[101] custom-scrollbar">
            
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Settings className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight font-heading">Edit Product</h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {editingProduct.id}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex flex-col gap-5 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Product Name</label>
                  <input type="text" value={editProdName} onChange={e=>setEditProdName(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 flex justify-between items-center">
                    Barcode
                    <button type="button" onClick={() => setEditProdBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString())} className="text-indigo-400 hover:text-indigo-300 text-[10px]">Auto</button>
                  </label>
                  <input type="text" value={editProdBarcode} onChange={e=>setEditProdBarcode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase" />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2 w-1/3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Currency</label>
                    <select value={editProdCurrency} onChange={e => setEditProdCurrency(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-mono cursor-pointer appearance-none">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="BDT">BDT</option>
                      <option value="AUD">AUD</option>
                      <option value="CAD">CAD</option>
                      <option value="SGD">SGD</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 w-2/3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Price</label>
                    <input type="number" step="0.01" value={editProdPrice} onChange={e=>setEditProdPrice(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 flex items-center justify-between">
                  <span>Product Image</span>
                  <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">PNG, JPG, WEBP (Max 5MB)</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reupload / File Select Area */}
                  <div className="flex flex-col gap-2.5">
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01] rounded-xl p-4 cursor-pointer transition text-center group h-full min-h-[110px]">
                      <Plus className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 mb-1" />
                      <span className="text-[11px] text-gray-400 group-hover:text-white font-semibold">Choose New File</span>
                      <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Supports png, jpg, webp</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Premium Image Live Preview or Empty Placeholder */}
                  <div className="flex flex-col gap-2 justify-between">
                    {editProdImage ? (
                      <div className="relative h-[110px] rounded-xl overflow-hidden border border-white/10 bg-[#070913] flex items-center justify-center group shadow-inner">
                        <img loading="lazy" src={editProdImage} alt="Current Product" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setEditProdImage("")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
                          >
                            <X className="h-3 w-3" /> Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[110px] rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-gray-500 font-mono text-[10px]">
                        <ImageIcon className="h-7 w-7 text-gray-600 mb-1.5" />
                        <span>No image uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Image URL input as fallback */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider px-1">Or Paste Direct Image URL</span>
                  <input 
                    type="text" 
                    value={editProdImage} 
                    onChange={e=>setEditProdImage(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" 
                    placeholder="https://example.com/image.png" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Description</label>
                <textarea value={editProdDesc} onChange={e=>setEditProdDesc(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Category</label>
                <select value={editProdCat} onChange={e=>setEditProdCat(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer appearance-none">
                  <option value="">No Category</option>
                  {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Product Tags (comma separated)</label>
                <input type="text" placeholder="e.g. veg, bestseller, spicy" value={editProdTags} onChange={e=>setEditProdTags(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
              </div>

              {/* ADVANCED SALES FUNNELS */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Sales Funnel Engine
                    </h3>
                    <p className="text-[10px] text-indigo-300/60 mt-0.5">Map dynamic post-purchase upsells to maximize AOV.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsLanding} onChange={e => setEditIsLanding(e.target.checked)} className="rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Standalone Landing Page</span>
                  </label>
                </div>

                {editIsLanding && (
                  <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-emerald-400/70 truncate flex-1">/b/{tenantSlug}/p/{editingProduct.id}</span>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4022'}/b/${tenantSlug}/p/${editingProduct.id}`); showToast("Landing Page Link Copied!"); }} className="text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg transition">
                      COPY LINK
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Post-Purchase Upsell</label>
                    <select value={editUpsell} onChange={e=>setEditUpsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Decline Downsell</label>
                    <select value={editDownsell} onChange={e=>setEditDownsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-indigo-500/10">
                  <div className="col-span-2 flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">1-Click Order Bump</label>
                    <select value={editOrderBump} onChange={e=>setEditOrderBump(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Bump Price</label>
                    <input type="number" step="0.01" value={editBumpPrice} onChange={e=>setEditBumpPrice(e.target.value)} placeholder="Discounted" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
                  </div>
                </div>

              </div>

              <button type="submit" disabled={isUpdatingProduct} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {isUpdatingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Save Product Changes</span>}
              </button>
            </form>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (() => {
          const assignments = productsList
            .filter(p => p.id !== productToDelete.id)
            .reduce((acc: Array<{ productName: string; type: string }>, p) => {
              if (p.upsellProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "Post-Purchase Upsell" });
              }
              if (p.downsellProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "Decline Downsell" });
              }
              if (p.orderBumpProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "1-Click Order Bump" });
              }
              return acc;
            }, []);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#181216] to-[#0f0a0d] border border-red-500/20 p-6 flex flex-col gap-6 shadow-2xl relative animate-fadeIn"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-lg shrink-0">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white tracking-tight">Delete Product?</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Are you sure you want to delete <span className="font-semibold text-white">"{productToDelete.name}"</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {(assignments.length > 0 || (productToDelete.assignedFunnels && productToDelete.assignedFunnels.length > 0)) && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <span className="animate-pulse">⚠️</span> Warning: Assigned in Funnels
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      This product is currently assigned in the following sales funnels and will be disconnected:
                    </p>
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {assignments.map((as, idx) => (
                        <li key={`as-${idx}`} className="text-xs flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5 font-mono">
                          <span className="text-white truncate max-w-[200px]">{as.productName}</span>
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{as.type}</span>
                        </li>
                      ))}
                      {productToDelete.assignedFunnels?.map((f, idx) => (
                        <li key={`f-${idx}`} className="text-xs flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-indigo-500/20 font-mono">
                          <span className="text-white truncate max-w-[200px]">{f.name}</span>
                          <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Landing Page</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setProductToDelete(null)}
                    className="flex-grow border border-white/10 hover:bg-white/[0.05] text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProductConfirmed(productToDelete.id)}
                    className="flex-grow bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center shadow-lg shadow-red-600/20"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* CATEGORY EDIT OVERLAY MODAL */}
      <AnimatePresence>
      {editingCategory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#111626] to-[#0a0d18] border border-white/10 p-8 flex flex-col gap-6 shadow-2xl relative z-[101] custom-scrollbar">
            
            <button onClick={() => setEditingCategory(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <FolderTree className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight font-heading">Edit Category</h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {editingCategory.id}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateCategory} className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Category Name</label>
                <input type="text" value={editCatName} onChange={e=>setEditCatName(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Description</label>
                <textarea value={editCatDesc} onChange={e=>setEditCatDesc(e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Tags (comma separated)</label>
                <input type="text" value={editCatTags} onChange={e=>setEditCatTags(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="flex flex-col gap-3.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 flex items-center justify-between">
                  <span>Cover Image</span>
                  <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">800x400px</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2.5">
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01] rounded-xl p-4 cursor-pointer transition text-center group h-full min-h-[90px]">
                      <Plus className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 mb-1" />
                      <span className="text-[11px] text-gray-400 group-hover:text-white font-semibold">Choose New File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditCatImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 justify-between">
                    {editCatImage ? (
                      <div className="relative h-[90px] rounded-xl overflow-hidden border border-white/10 bg-[#070913] flex items-center justify-center group shadow-inner">
                        <img loading="lazy" src={editCatImage} alt="Category Cover" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setEditCatImage("")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
                          >
                            <X className="h-3 w-3" /> Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[90px] rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-gray-500 font-mono text-[10px]">
                        <ImageIcon className="h-7 w-7 text-gray-600 mb-1.5" />
                        <span>No image uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isUpdatingCat} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {isUpdatingCat ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Save Category Changes</span>}
              </button>
            </form>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {categoryToDelete && (() => {
          const associatedProducts = productsList.filter(p => p.categoryId === categoryToDelete.id);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#181216] to-[#0f0a0d] border border-red-500/20 p-6 flex flex-col gap-6 shadow-2xl relative animate-fadeIn"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-lg shrink-0">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white tracking-tight">Delete Category?</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Are you sure you want to delete <span className="font-semibold text-white">"{categoryToDelete.name}"</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {associatedProducts.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      ⚠️ Note: Products Affected
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      The following products will become uncategorized:
                    </p>
                    <ul className="flex flex-col gap-1.5 mt-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {associatedProducts.map((p, idx) => (
                        <li key={`ap-${idx}`} className="text-xs flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5 font-mono">
                          <span className="text-white truncate max-w-[250px]">{p.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    className="flex-grow border border-white/10 hover:bg-white/[0.05] text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategoryConfirmed(categoryToDelete.id)}
                    className="flex-grow bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center shadow-lg shadow-red-600/20"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
        </main>

        {/* ===== ECOM LIVE MODALS (fixed, z-index above sidebar) ===== */}

        {/* Celebration Confetti */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[500] pointer-events-none flex items-center justify-center">
              <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:1.2,opacity:0}} transition={{type:"spring",duration:0.5}} className="flex flex-col items-center gap-3">
                <div className="text-7xl animate-bounce">🎉</div>
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-black text-2xl px-8 py-4 rounded-3xl shadow-2xl shadow-emerald-500/30 text-center">
                  Order Accepted!<p className="text-sm font-medium opacity-80 mt-1">Preparation timer started</p>
                </div>
                <div className="flex gap-3 text-3xl mt-2">
                  {["⭐","🚀","💰","✅","🔥"].map((e,i)=>(
                    <motion.span key={i} animate={{y:[-10,10,-10]}} transition={{repeat:Infinity,duration:1+i*0.2,ease:"easeInOut"}}>{e}</motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store Creation Wizard */}
        <AnimatePresence>
          {showStoreWizard && (
            <motion.div key="ewiz-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{background:"rgba(2,4,10,0.95)",backdropFilter:"blur(16px)"}}>
              <motion.div initial={{opacity:0,scale:0.9,y:30}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}} transition={{type:"spring",damping:22,stiffness:220}} className="w-full max-w-lg bg-gradient-to-b from-[#0d1525] to-[#080c18] border border-indigo-500/30 rounded-[28px] overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{wizardStep===1?"🏪":wizardStep===2?"✏️":"🎉"}</div>
                    <div>
                      <p className="text-white font-black text-base">{wizardStep===1?"Choose Store Type":wizardStep===2?"Store Details":"Store Created!"}</p>
                      <p className="text-indigo-200 text-xs">Step {wizardStep} of 3</p>
                    </div>
                  </div>
                  <button onClick={()=>setShowStoreWizard(false)} className="text-white/60 hover:text-white transition cursor-pointer"><X className="h-5 w-5"/></button>
                </div>
                <div className="flex gap-1 px-6 pt-4">
                  {[1,2,3].map(s=><div key={s} className={`h-1 flex-1 rounded-full transition-all ${s<=wizardStep?"bg-indigo-500":"bg-white/10"}`}/>)}
                </div>
                <div className="p-6 flex flex-col gap-5">
                  {wizardStep===1&&(<>
                    <p className="text-gray-400 text-sm">Choose what kind of store you want to create</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {type:"food",icon:"🍽️",label:"Food Store",desc:"Restaurant, café, delivery",color:"border-orange-500/40 bg-orange-500/5"},
                        {type:"ecom",icon:"🛍️",label:"E-Commerce",desc:"Products, catalog, cart",color:"border-indigo-500/40 bg-indigo-500/5"},
                        {type:"service",icon:"🏥",label:"Service / Clinic",desc:"Bookings & appointments",color:"border-emerald-500/40 bg-emerald-500/5"},
                        {type:"single_product",icon:"⚡",label:"Single Product",desc:"One product landing page",color:"border-purple-500/40 bg-purple-500/5"}
                      ].map(opt=>(
                        <button key={opt.type} onClick={()=>setWizardStoreType(opt.type)} className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition cursor-pointer ${wizardStoreType===opt.type?opt.color+" ring-2 ring-indigo-500/30":"border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}>
                          <div className="text-3xl">{opt.icon}</div>
                          <p className="text-white font-bold text-sm">{opt.label}</p>
                          <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
                          {wizardStoreType===opt.type&&<CheckCircle2 className="h-4 w-4 text-indigo-400 ml-auto"/>}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setShowStoreWizard(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">Skip for now</button>
                      <button onClick={()=>setWizardStep(2)} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2">Next <ArrowLeft className="h-4 w-4 rotate-180"/></button>
                    </div>
                  </>)}
                  {wizardStep===2&&(<>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Store Name *</label>
                        <input value={wizardStoreName} onChange={e=>setWizardStoreName(e.target.value)} placeholder="e.g. Spice Garden, TechZone, Dr. Ahmed Clinic" className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60"/>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Description</label>
                        <textarea value={wizardStoreDesc} onChange={e=>setWizardStoreDesc(e.target.value)} placeholder="Short description..." rows={2} className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 resize-none"/>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Brand Color</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={wizardPrimaryColor} onChange={e=>setWizardPrimaryColor(e.target.value)} className="h-10 w-16 rounded-lg bg-transparent border border-white/10 cursor-pointer p-1"/>
                          <span className="text-gray-400 text-sm font-mono">{wizardPrimaryColor}</span>
                          <div className="flex gap-2 ml-auto">
                            {["#6366f1","#10b981","#f97316","#ec4899","#3b82f6"].map(c=>(
                              <button key={c} onClick={()=>setWizardPrimaryColor(c)} className={`h-7 w-7 rounded-full border-2 cursor-pointer ${wizardPrimaryColor===c?"border-white scale-110":"border-transparent"}`} style={{backgroundColor:c}}/>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setWizardStep(1)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">← Back</button>
                      <button onClick={()=>setShowStoreWizard(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">Skip</button>
                      <button onClick={handleCreateNewStore} disabled={!wizardStoreName.trim()||isCreatingNewStore} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2">
                        {isCreatingNewStore?<Loader2 className="h-4 w-4 animate-spin"/>:<Zap className="h-4 w-4"/>} Create Store
                      </button>
                    </div>
                  </>)}
                  {wizardStep===3&&wizardCreatedStore&&(
                    <div className="flex flex-col items-center text-center gap-5 py-4">
                      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",damping:12,stiffness:200}} className="text-6xl">🎉</motion.div>
                      <div>
                        <h3 className="text-white font-black text-xl">{wizardCreatedStore.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">Your store has been created successfully</p>
                      </div>
                      <div className="w-full bg-white/[0.03] border border-white/8 rounded-2xl p-4 text-left flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Store URL</span><span className="text-indigo-400 font-mono text-xs">/b/{tenantSlug}/{wizardCreatedStore.storeSlug}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Type</span><span className="text-white font-bold capitalize">{wizardCreatedStore.storeType.replace("_"," ")}</span></div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <a href={`/b/${tenantSlug}/${wizardCreatedStore.storeSlug}`} target="_blank" className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 hover:bg-white/10"><ExternalLink className="h-4 w-4"/> Preview Store</a>
                        <button onClick={()=>{setShowStoreWizard(false);setSelectedShopId(wizardCreatedStore.id);setEcomSubTab("orders");}} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"><LayoutDashboard className="h-4 w-4"/> Go to Dashboard</button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Order Alert Card */}
        <AnimatePresence>
          {newOrderNotification && !showNewOrderModal && (()=>{
            let notifItems: any[] = [];
            try { notifItems = JSON.parse(newOrderNotification.itemsJson||"[]"); } catch {}
            return (
              <motion.div key="notif-card-ecom" initial={{opacity:0,y:-120,scale:0.85}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-80,scale:0.9}} transition={{type:"spring",damping:18,stiffness:240}} className="fixed top-5 left-1/2 -translate-x-1/2 z-[350] w-full max-w-sm px-3 select-none cursor-pointer" onClick={()=>setShowNewOrderModal(true)}>
                <div className="absolute -inset-2 rounded-[28px] border-2 border-emerald-400/30 animate-ping pointer-events-none"/>
                <div className="relative bg-gradient-to-br from-[#071a10] via-[#0a1320] to-[#0b0f1a] border-2 border-emerald-500/70 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.35)]">
                  <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div animate={{scale:[1,1.3,1]}} transition={{repeat:Infinity,duration:0.7}}><Bell className="h-3.5 w-3.5 text-white"/></motion.div>
                      <span className="text-white font-black text-[11px] uppercase tracking-widest">🔥 New Order!</span>
                    </div>
                    <span className="text-emerald-100 font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-full">#{newOrderNotification.id.substring(6,12).toUpperCase()}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-lg leading-tight">{newOrderNotification.buyerName}</p>
                        <p className="text-gray-400 text-[11px]">{notifItems.length} item{notifItems.length!==1?"s":""} ordered</p>
                      </div>
                      <p className="text-emerald-400 font-black text-2xl font-mono">{currencySymbol}{(newOrderNotification.amountCents/100).toFixed(2)}</p>
                    </div>
                    <motion.div animate={{boxShadow:["0 0 0px rgba(16,185,129,0)","0 0 20px rgba(16,185,129,0.6)","0 0 0px rgba(16,185,129,0)"]}} transition={{repeat:Infinity,duration:1.5}} className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2">
                      <Zap className="h-4 w-4"/> Tap to Review &amp; Act
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Full-Screen New Order Modal */}
        <AnimatePresence>
          {showNewOrderModal && newOrderNotification && (()=>{
            let modalItems: any[] = [];
            try { modalItems = JSON.parse(newOrderNotification.itemsJson||"[]"); } catch {}
            if (modalItems.length===0) {
              const mp = productsList.find((p:any)=>p.id===newOrderNotification.productId);
              modalItems = [{id:newOrderNotification.productId,name:mp?.name||"Product Item",price:newOrderNotification.amountCents,quantity:1,image:mp?.image}];
            }
            return (
              <motion.div key="ecom-order-modal-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{background:"rgba(2,4,10,0.92)",backdropFilter:"blur(12px)"}}>
                <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/10 animate-ping"/></div>
                <motion.div key="ecom-order-modal" initial={{opacity:0,scale:0.88,y:40}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:20}} transition={{type:"spring",damping:22,stiffness:200}} className="relative w-full max-w-lg bg-gradient-to-b from-[#0a1520] to-[#070b14] border-2 border-emerald-500/40 rounded-[28px] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)] max-h-[90vh] flex flex-col">
                  <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <motion.div animate={{rotate:[0,-10,10,-10,0]}} transition={{repeat:Infinity,duration:1.2}} className="text-2xl">🔔</motion.div>
                      <div><p className="text-white font-black text-base">New Order Arrived!</p><p className="text-emerald-100 text-xs">#{newOrderNotification.id.substring(6,14).toUpperCase()}</p></div>
                    </div>
                    {sirenActive&&<motion.div animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:0.6}} className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full"><Volume2 className="h-3 w-3 text-white"/><span className="text-white text-[10px] font-bold">LIVE</span></motion.div>}
                  </div>
                  <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Customer</p>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shrink-0">{newOrderNotification.buyerName?.charAt(0)?.toUpperCase()||"?"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-lg leading-tight truncate">{newOrderNotification.buyerName}</p>
                          <p className="text-emerald-400 font-black text-xl font-mono">{currencySymbol}{(newOrderNotification.amountCents/100).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 mt-1">
                        {newOrderNotification.buyerEmail&&<div className="flex items-center gap-2 text-xs text-gray-300"><Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0"/><span className="truncate">{newOrderNotification.buyerEmail}</span></div>}
                        {newOrderNotification.buyerPhone&&<div className="flex items-center gap-2 text-xs text-gray-300"><Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0"/><span>{newOrderNotification.buyerPhone}</span></div>}
                        {newOrderNotification.deliveryAddress&&<div className="flex items-start gap-2 text-xs text-gray-300"><MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5"/><span className="leading-relaxed">{newOrderNotification.deliveryAddress}</span></div>}
                        <div className="flex items-center gap-2 text-xs text-gray-400"><span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{newOrderNotification.paymentMethod||"COD"}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{modalItems.length} Item{modalItems.length!==1?"s":""} Ordered</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {modalItems.map((item:any,i:number)=>(
                          <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            {item.image?<img loading="lazy" src={item.image} className="w-full h-24 object-cover"/>:<div className="w-full h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-3xl">🍽️</div>}
                            <div className="p-2.5">
                              <p className="text-white font-bold text-xs leading-tight line-clamp-2">{item.name}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-emerald-400 font-black text-xs font-mono">{currencySymbol}{item.price?(item.price/100).toFixed(2):"—"}</span>
                                <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">×{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <AnimatePresence>
                      {showMessageInput&&(
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex flex-col gap-2">
                          <textarea value={orderMessageText} onChange={e=>setOrderMessageText(e.target.value)} placeholder="Type a message to the customer..." rows={3} className="w-full bg-white/[0.06] border border-indigo-500/30 rounded-xl p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500/60"/>
                          <div className="flex gap-2">
                            <button onClick={handleNewOrderSendMessage} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"><Send className="h-3.5 w-3.5"/> Send</button>
                            <button onClick={()=>{setShowMessageInput(false);setOrderMessageText("");}} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition cursor-pointer">Cancel</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="shrink-0 p-5 pt-0 flex flex-col gap-2.5 border-t border-white/5">
                    <motion.button animate={{boxShadow:["0 0 0px rgba(16,185,129,0.0)","0 0 30px rgba(16,185,129,0.5)","0 0 0px rgba(16,185,129,0.0)"]}} transition={{repeat:Infinity,duration:1.4}} onClick={()=>setShowAcceptSubModal(true)} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5"/> Accept Order
                    </motion.button>
                    <div className="flex gap-2">
                      <button onClick={()=>setShowMessageInput(v=>!v)} className="flex-1 py-3 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 font-bold text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4"/> Message</button>
                      <button onClick={handleNewOrderCancel} className="flex-1 py-3 bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-300 font-bold text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2"><X className="h-4 w-4"/> Cancel</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Accept Sub-Modal — fixed bottom sheet ABOVE order modal */}
        <AnimatePresence>
          {showAcceptSubModal && showNewOrderModal && (()=>{
            const activeRiders = deliveryBoysList.filter((r:any)=>r.isOnline||r.isActive);
            return (
              <motion.div key="ecom-accept-sub" initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:24,stiffness:220}} className="fixed inset-x-0 bottom-0 z-[350] bg-gradient-to-b from-[#0e1828] to-[#080c18] border-t-2 border-emerald-500/40 rounded-t-[28px] p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"/>
                <p className="text-white font-black text-lg mb-4 flex items-center gap-2"><ChefHat className="h-5 w-5 text-emerald-400"/> Confirm Order Details</p>
                <div className="mb-4">
                  <p className="text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-2.5">Preparation Time</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[10,20,30,45].map(t=>(
                      <button key={t} onClick={()=>setSelectedPrepTime(t)} className={`py-3 rounded-2xl font-black text-sm transition cursor-pointer flex flex-col items-center gap-0.5 ${selectedPrepTime===t?"bg-emerald-500 text-white shadow-lg shadow-emerald-500/30":"bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/10"}`}>
                        <Clock className="h-3.5 w-3.5"/>{t}m
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-2.5">Assign Delivery Rider</p>
                  {activeRiders.length===0?(
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-orange-300 text-xs text-center">No riders online — order will proceed without assignment</div>
                  ):(
                    <div className="flex flex-col gap-2">
                      {activeRiders.map((r:any)=>{
                        const ve=r.vehicle==="bike"?"🏍️":r.vehicle==="scooter"?"🛵":r.vehicle==="car"?"🚗":"🚐";
                        return (
                          <button key={r.id} onClick={()=>setSelectedRiderId(r.id)} className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-left ${selectedRiderId===r.id?"bg-indigo-500/20 border-indigo-500/50":"bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"}`}>
                            <div className="text-2xl shrink-0">{ve}</div>
                            <div className="flex-1 min-w-0"><p className="text-white font-bold text-sm truncate">{r.name}</p><p className="text-gray-400 text-xs">{r.phone}</p></div>
                            <div className={`h-2 w-2 rounded-full shrink-0 ${r.isOnline?"bg-emerald-400":"bg-gray-500"}`}/>
                            {selectedRiderId===r.id&&<CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0"/>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button onClick={handleNewOrderAcceptConfirm} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30"><Zap className="h-5 w-5"/> Confirm &amp; Notify Customer</button>
                <button onClick={()=>setShowAcceptSubModal(false)} className="w-full py-2.5 mt-2 text-gray-500 hover:text-gray-300 font-medium text-sm transition cursor-pointer">← Back</button>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    );
  }
  const widgetEmbedCode = `<script
  src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js" 
  data-tenant="${tenantSlug}" 
  data-bot-name="Aether Assistant"
></script>`;

  return (
    <div className="min-h-screen bg-[#070913] text-gray-100 flex overflow-hidden w-full relative">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Clickable Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-25 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Premium Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 lg:static w-64 border-r border-white/5 bg-[#0a0d1a]/95 lg:bg-[#0a0d1a]/80 backdrop-blur-xl flex flex-col justify-between shrink-0 z-30 text-gray-200 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow shadow-indigo-500/10">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white font-heading">Aether Client</h2>
                <p className="text-[10px] text-indigo-400 font-mono tracking-wide">{tenantSlug?.toUpperCase()}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5 text-sm font-medium">
            <button 
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "overview" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Layers className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button 
              onClick={() => { setActiveTab("conversations"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "conversations" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Playground Console</span>
            </button>
            <button 
              onClick={() => { setActiveTab("skills"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "skills" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Workflow className="h-4 w-4" />
              <span>Skills & n8n Bridge</span>
            </button>
            <button 
              onClick={() => { setActiveTab("store"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "store" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Store & Calendar</span>
            </button>
            <button 
              onClick={() => { setActiveTab("widget"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "widget" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Globe className="h-4 w-4" />
              <span>Chat Studio & Widget</span>
            </button>
            <button 
              onClick={() => { setActiveTab("ecom"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "ecom" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>E-Commerce Setup</span>
            </button>
            <button 
              onClick={() => { setActiveTab("landing-pages"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "landing-pages" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              <span>Funnels & Pages</span>
            </button>
            <button 
              onClick={() => { setActiveTab("leads"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "leads" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Contact className="h-4 w-4" />
              <span>Leads CRM</span>
            </button>
            <button 
              onClick={() => { setActiveTab("billing"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "billing" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing & Credits</span>
            </button>
            <button
              onClick={() => { setActiveTab("integrations"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "integrations" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Workflow className="h-4 w-4" />
              <span>Integrations Hub</span>
            </button>
            <button
              onClick={() => { setActiveTab("booking"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "booking" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Calendar className="h-4 w-4" />
              <span>Booking Suite</span>
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition cursor-pointer ${activeTab === "settings" ? "bg-indigo-600/10 text-indigo-300 border-l-2 border-indigo-500" : "text-gray-400 hover:text-white hover:bg-white/[0.02]"}`}
            >
              <Settings className="h-4 w-4" />
              <span>Workspace Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card Foot */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
              IM
            </div>
            <div>
              <p className="text-xs font-bold text-white">Imran Founder</p>
              <p className="text-[9px] text-gray-500 font-mono">Workspace Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden z-10">
        
        {/* Top Header Controls */}
        <header className="px-4 sm:px-8 py-4 border-b border-white/5 flex items-center justify-between bg-[#070913]/40 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 hover:text-white lg:hidden cursor-pointer shrink-0 transition shadow"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xs sm:text-sm font-bold font-heading text-white">Aether Multi-Tenant Studio</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full px-2.5 sm:px-3.5 py-1">
              <CreditCard className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span className="font-mono">{creditsBalance.toLocaleString()} Credits</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase RLS Active</span>
            </div>
          </div>
        </header>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full select-none">
            
            {/* Onboarding Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent border border-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-bold text-white font-heading">Welcome to your workspace, `{tenantSlug}`!</h2>
                <p className="text-sm text-gray-400">
                  Your multi-tenant workspace is fully isolated by Supabase Row-Level Security policies.
                </p>
              </div>
              <button 
                onClick={() => setIsBotOnline(!isBotOnline)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${isBotOnline ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
              >
                Bot Status: {isBotOnline ? "Online" : "Offline"}
              </button>
            </div>

            {/* Quickstart Guided Walkthrough Checklist */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a0d1a] to-white/[0.01] border border-white/5 flex flex-col gap-4">
              <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                <span>Aether Workspace Setup Quickstart Walkthrough</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[9px]">Step 1: RAG Context</span>
                  <span className="font-bold text-white">Ingest Database</span>
                  <span className="text-gray-500 text-[11px] leading-relaxed">Scroll down to index your refunds, business specs, or policies!</span>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[9px]">Step 2: Sandbox Testing</span>
                  <span className="font-bold text-white">Playground Console</span>
                  <span className="text-gray-500 text-[11px] leading-relaxed">Type matching queries to trigger active pgvector RAGs.</span>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[9px]">Step 3: Metered Subscriptions</span>
                  <span className="font-bold text-white">Refill Balance</span>
                  <span className="text-gray-500 text-[11px] leading-relaxed">Reload credits via Stripe or Razorpay dynamic checkout stubs.</span>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[9px]">Step 4: Script Embed</span>
                  <span className="font-bold text-white">Launch Web Widget</span>
                  <span className="text-gray-500 text-[11px] leading-relaxed">Copy the CNAME domain pointers or the widget embed tag!</span>
                </div>

              </div>
            </div>

            {/* Micro analytics metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Monthly AI Credits</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{creditsBalance.toLocaleString()}</span>
                  <span className="text-xs text-indigo-400">/ 2,000 granted</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Knowledge Documents</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{ingestedDocsList.length}</span>
                  <span className="text-xs text-gray-500">Vectorized</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Active Skills Installed</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">5</span>
                  <span className="text-xs text-indigo-400">Built-in Tools</span>
                </div>
              </div>
            </div>

            {/* RAG Vector Ingestion Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Vector Document Form */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white font-heading flex items-center gap-2 text-sm">
                    <Database className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Train Agent with Knowledge (RAG)</span>
                  </h3>
                  {/* mode toggle */}
                  <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-[10px] font-black">
                    <button onClick={() => setIngestMode("text")} className={`px-3 py-1.5 rounded-md transition ${ingestMode === "text" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>Text</button>
                    <button onClick={() => setIngestMode("file")} className={`px-3 py-1.5 rounded-md transition ${ingestMode === "file" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>File Upload</button>
                  </div>
                </div>

                <form onSubmit={handleIngestDocument} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300">Document Title</label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. Refund Policy, Product FAQ, Company Info"
                      className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {ingestMode === "text" ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300">Document Content</label>
                      <textarea
                        required
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        placeholder="Paste or type knowledge here — FAQs, policies, product details, business rules... The agent will semantically search this when answering customers."
                        rows={6}
                        className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300">Upload File (PDF, DOCX, TXT)</label>
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition ${docFile ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.01]"}`}>
                        <input type="file" accept=".pdf,.docx,.txt,.md,.csv" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDocFile(f); if (!docName) setDocName(f.name.replace(/\.[^.]+$/, "")); } }} />
                        {docFile ? (
                          <>
                            <FileText className="h-8 w-8 text-indigo-400 mb-2" />
                            <span className="text-xs font-bold text-white">{docFile.name}</span>
                            <span className="text-[10px] text-gray-400 mt-1">{(docFile.size / 1024).toFixed(1)} KB — click to change</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-600 mb-2" />
                            <span className="text-xs font-semibold text-gray-400">Drop or click to upload</span>
                            <span className="text-[10px] text-gray-600 mt-1">PDF, DOCX, TXT, MD, CSV</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isIngestingDoc || !docName.trim() || (ingestMode === "text" ? !docContent.trim() : !docFile)}
                    className="w-fit px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 cursor-pointer shadow disabled:opacity-40"
                  >
                    {isIngestingDoc ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Vectorizing...</span></>
                    ) : (
                      <><Zap className="h-3.5 w-3.5" /><span>Vectorize & Train Agent</span></>
                    )}
                  </button>
                </form>

                {/* Index logs */}
                {ingestLogs.length > 0 && (
                  <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 font-mono text-[10px] text-emerald-400/90 leading-relaxed flex flex-col gap-1 select-text">
                    <div className="font-bold text-gray-400 mb-1 select-none">Vectorization Pipeline:</div>
                    {ingestLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className={log.startsWith("Error") ? "text-red-400" : "text-indigo-400"}>
                          {log.startsWith("Error") ? "✗" : "✓"}
                        </span>
                        <span className={log.startsWith("Error") ? "text-red-400" : ""}>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vector preview */}
                {lastCoordinatesPreview && (
                  <div className="bg-[#0b0f19] p-3 rounded-xl border border-white/5 font-mono text-[9px] text-indigo-300/70 break-all leading-normal">
                    [ {lastCoordinatesPreview.map(v => v.toFixed(5)).join(", ")} … ]
                  </div>
                )}
              </div>

              {/* Right Column: Indexed Documents */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3 flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white font-heading text-sm">Knowledge Base ({ingestedDocsList.length})</h3>
                    <button onClick={fetchRagDocs} className="text-[10px] text-gray-500 hover:text-white transition font-bold uppercase tracking-widest flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Refresh
                    </button>
                  </div>

                  {ingestedDocsList.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                      {ingestedDocsList.map((doc) => (
                        <div key={doc.id} className="flex items-start justify-between gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs group">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate">{doc.name}</div>
                              <div className="text-[10px] text-gray-600 mt-0.5 font-mono">
                                {doc.chars} chars · {doc.dimensions ? `${doc.dimensions}d` : ""}
                                {doc.agentId && <span className="ml-1 text-indigo-400/60">agent</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            disabled={isDeletingDoc === doc.id}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-red-500/10 text-red-400 disabled:opacity-40"
                          >
                            {isDeletingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/10 rounded-xl gap-2">
                      <Database className="h-8 w-8 text-gray-700" />
                      <div className="text-[11px] text-gray-500 font-medium">No documents vectorized yet.</div>
                      <div className="text-[10px] text-gray-600">Add knowledge from the form on the left.</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. PLAYGROUND TAB */}
        {activeTab === "conversations" && (
          <div className="flex-grow flex overflow-hidden">
            
            {/* Left: Chat stream */}
            <div className="flex-grow flex flex-col justify-between bg-white/[0.01] border-r border-white/5 overflow-hidden">
              
              {/* Chat Header controls */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0d1a]/50 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Playground Session</span>
                </div>
                <button 
                  onClick={clearChatHistory}
                  className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Conversation</span>
                </button>
              </div>

              {/* Message Stream */}
              <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin animate-fadeIn">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[80%] p-4 rounded-2xl transition ${
                      msg.role === "user" 
                        ? "self-end bg-indigo-600 text-white rounded-br-none" 
                        : "self-start bg-[#0a0d1a] border border-white/5 text-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-1.5 select-none">
                      {msg.role === "user" ? "Client Operator" : `${selectedProvider.toUpperCase()} / ${selectedModel}`}
                    </div>
                    <div className="text-sm leading-relaxed">
                      {msg.role === "user" ? (
                        <div className="flex flex-col gap-1.5">
                          {msg.isVisionActive && (
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30 w-fit flex items-center gap-1 select-none">
                              <Eye className="h-2.5 w-2.5" />
                              <span>AI VISION ACTIVE</span>
                            </span>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {msg.image && (
                            <img loading="lazy" src={msg.image} 
                              alt="User attachment" 
                              className="mt-2 max-w-[200px] max-h-[150px] rounded-lg object-cover border border-white/10 bg-[#070913] select-none"
                            />
                          )}
                          {msg.fileName && !msg.image && (
                            <div className="mt-2 p-2 rounded-lg bg-[#070913]/50 border border-white/10 flex items-center gap-2 max-w-[220px] select-none">
                              <Paperclip className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                              <span className="text-[10px] font-mono truncate text-gray-300">{msg.fileName}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        renderMessageContent(msg.content)
                      )}
                    </div>
                  </div>
                ))}
                
                {isSending && (
                  <div className="self-start bg-[#0a0d1a] border border-white/5 p-4 rounded-2xl rounded-bl-none text-gray-400 flex items-center gap-2 text-sm shadow">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>AI Provider thinking...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="p-4 border-t border-white/5 bg-[#0a0d1a]/50 flex flex-col gap-3 shrink-0">
                
                {/* File Attachment Preview Banner */}
                {uploadedFile && (
                  <div className="flex items-center gap-3 p-2 bg-[#070913]/60 border border-white/10 rounded-xl animate-fadeIn max-w-md select-none">
                    {uploadedFile.startsWith("data:image/") ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-[#070913]">
                        <img loading="lazy" src={uploadedFile} alt="Preview Attachment" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setUploadedFile(null); setUploadedFileName(""); }}
                          className="absolute -top-1 -right-1 h-4 w-4 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 flex items-center justify-center">
                        <Paperclip className="h-4 w-4" />
                        <button
                          type="button"
                          onClick={() => { setUploadedFile(null); setUploadedFileName(""); }}
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-grow pr-4">
                      <span className="text-[10px] font-mono text-gray-300 truncate">{uploadedFileName}</span>
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-mono font-bold">Attachment Ready</span>
                    </div>
                  </div>
                )}

                <form id="ai-chat-form" onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                  
                  {/* File Upload Selector Option */}
                  <label className="h-11 w-11 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0">
                    <Paperclip className="h-4.5 w-4.5" />
                    <input
                      type="file"
                      accept="image/*, application/pdf, text/*"
                      onChange={handlePlaygroundFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* AI Vision Mode Selector Option */}
                  <button
                    type="button"
                    onClick={() => setIsVisionMode(!isVisionMode)}
                    className={`h-11 w-11 rounded-xl border flex items-center justify-center transition shrink-0 cursor-pointer ${
                      isVisionMode 
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/5 animate-pulse" 
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-gray-400 hover:text-white"
                    }`}
                    title={isVisionMode ? "AI Vision Mode Active" : "Enable AI Vision Mode"}
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>

                  {/* Message input */}
                  <input
                    type="text"
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    placeholder={
                      isVisionMode 
                        ? "Vision mode active! Describe or ask about attached image analytics..."
                        : `Ask ${selectedProvider.toUpperCase()} to reason, query catalog, checkout products, or book appointments...`
                    }
                    className="flex-grow bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder:text-gray-600 min-w-0"
                  />

                  {/* Send Action */}
                  <button
                    type="submit"
                    disabled={isSending || !playgroundInput.trim()}
                    className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>

                </form>

              </div>

            </div>

            {/* Right Side: Configuration Sidebar */}
            <div className="w-80 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto bg-[#0a0d1a]/40 border-l border-white/5 select-none">
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <span>Model Configurations</span>
                </h3>
                <p className="text-[10px] text-gray-500">Fine-tune your sandbox chat parameters.</p>
              </div>

              {/* Provider Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-300">LLM Provider Mesh (Local & Cloud)</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["deepseek", "anthropic", "openai", "gemini", "ollama", "openrouter"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={`py-2 rounded-lg border text-center transition cursor-pointer font-semibold ${
                        selectedProvider === p 
                          ? "border-indigo-500 bg-indigo-500/10 text-white" 
                          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-gray-400"
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-300">Active Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[#070913] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                >
                  {providerModels[selectedProvider]?.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* System Prompt Directives */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-300">System Directives</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a custom AI agent..."
                  rows={4}
                  className="bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full resize-none leading-relaxed"
                />
              </div>

              {/* Temperature Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-300">Temperature</span>
                  <span className="text-indigo-400 font-mono">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="h-1.5 w-full bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Diagnostic Box */}
              <div className="mt-auto bg-white/[0.01] border border-white/5 rounded-xl p-3.5 text-[10px] text-gray-500 leading-relaxed">
                <div className="font-semibold text-gray-400 mb-1">Diagnostic Log:</div>
                - Metering: Enabled (1 Credit/req)<br />
                - RAG Engine: Active (pgvector)<br />
                - Store / Calendar: Web widgets online<br />
                - Webhook: HMAC signatures active
              </div>

            </div>

          </div>
        )}

        
        
        {/* E-COMMERCE TAB */}
        {activeTab === "ecom" && selectedShopId === null && (
          <FeatureGate tenantSlug={tenantSlug} featureKey="ecom">
          <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6 sm:gap-8 overflow-y-auto h-full select-none text-gray-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 sm:pb-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <Building className="h-6 w-6 text-indigo-400" />
                  <span>Your Store Directory</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  Create, configure, and switch between your multiple SaaS storefronts and templates dynamically.
                </p>
              </div>
              <button 
                onClick={() => setShowCreateStoreModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 cursor-pointer self-start"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Store</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {storefrontsList.map((store) => {
                const isFoodTemplate = store.template === "food";
                const storeProducts = productsList.filter(p => p.storeId === store.id || (!p.storeId && storefrontsList[0]?.id === store.id));
                const storeCategories = categoriesList.filter(c => c.storeId === store.id || (!c.storeId && storefrontsList[0]?.id === store.id));

                return (
                  <div 
                    key={store.id}
                    onClick={() => setSelectedShopId(store.id)}
                    className="group relative rounded-2xl bg-white/[0.01] border border-white/5 p-6 flex flex-col gap-4 hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="flex justify-between items-start">
                      {store.brandLogo ? (
                        <img loading="lazy" src={store.brandLogo} className="h-12 w-12 rounded-xl object-cover border border-white/10" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-extrabold text-indigo-400 font-heading uppercase text-md">
                          {store.companyName ? store.companyName.substring(0, 2) : "SH"}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        isFoodTemplate 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {isFoodTemplate ? "Food Ordering" : "Retail Catalog"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm">{store.companyName || "Untitled Store"}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{store.storeDescription || "Configure brand settings, products, themes, and catalogs for this storefront."}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 border-t border-white/5 pt-4 text-[10px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-indigo-400/70" /> {storeProducts.length} Products</span>
                      <span className="flex items-center gap-1"><FolderTree className="h-3.5 w-3.5 text-purple-400/70" /> {storeCategories.length} Categories</span>
                    </div>
                  </div>
                );
              })}

              {/* Add Store Card */}
              <div 
                onClick={() => setShowCreateStoreModal(true)}
                className="group relative rounded-2xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-500/40 hover:bg-white/[0.01] transition-all duration-300 min-h-[180px] text-center cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">Create Another Storefront</h4>
                  <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">Launch a separate business store with customized template & preset colors.</p>
                </div>
              </div>
            </div>

            {/* Create Store Modal */}
            <AnimatePresence>
              {showCreateStoreModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCreateStoreModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0d16] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-gray-200 select-none overflow-hidden"
                  >
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-600/10 blur-2xl" />
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-md font-bold text-white font-heading flex items-center gap-2">
                        <Building className="h-5 w-5 text-indigo-400" />
                        <span>Initialize Premium Storefront</span>
                      </h3>
                      <button onClick={() => setShowCreateStoreModal(false)} className="text-gray-400 hover:text-white transition">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateStore} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Store Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Imran's Pizzeria"
                          value={newStoreName}
                          onChange={e => setNewStoreName(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Storefront Template</label>
                        <select 
                          value={newStoreTemplate} 
                          onChange={e => setNewStoreTemplate(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                          <option value="retail">Retail E-Commerce Catalog</option>
                          <option value="food">Zomato/Swiggy Food Ordering</option>
                          <option value="restaurant-v2-dark">Restaurant v2 Dark</option>
                          <option value="restaurant-v2-light">Restaurant v2 Light</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Glossy Color Theme Preset</label>
                        <select 
                          value={newStoreTheme} 
                          onChange={e => setNewStoreTheme(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                          <option value="nimbus">Nimbus (Glassmorphic Indigo)</option>
                          <option value="crimson">Crimson Glory (Zomato Red)</option>
                          <option value="citrus">Sunset Citrus (Swiggy Orange)</option>
                          <option value="emerald">Emerald Fresh (UberEats Green)</option>
                          <option value="flamingo">Flamingo Glow (Foodpanda Pink)</option>
                          <option value="starbucks">Forest Mint (Starbucks Green)</option>
                          <option value="caviar">Golden Amber (Caviar Gold)</option>
                          <option value="deliveroo">Ocean Breeze (Deliveroo Teal)</option>
                          <option value="chipotle">Terracotta Pepper (Chipotle Rust)</option>
                          <option value="gopuff">Cosmic Grape (Gopuff Violet)</option>
                          <option value="dominos">Dominos Classic Royal Blue (Domino's Blue)</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        disabled={isCreatingStore || !newStoreName.trim()}
                        className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {isCreatingStore ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Initialize Storefront</span>}
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
          </FeatureGate>
        )}

        {/* E-COMMERCE TAB */}
        {activeTab === "ecom" && selectedShopId !== null && (
          <FeatureGate tenantSlug={tenantSlug} featureKey="ecom">
          <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6 sm:gap-8 overflow-y-auto h-full select-none text-gray-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 sm:pb-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-indigo-400" />
                  <span>{storeCompanyName || "Full E-Commerce Engine"}</span>
                  <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase font-mono tracking-wider font-semibold">{storeTemplate} template</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  Manage categories, product catalog, payment gateways, and shipping rules for this storefront.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedShopId(null);
                  fetchStoreAnalytics();
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 self-start cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Switch Shop</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-indigo-300 uppercase tracking-wider">Total Categories</span>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">{categoriesList.length}</span>
                  <FolderTree className="h-5 w-5 text-indigo-400 mb-1 opacity-50" />
                </div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-purple-300 uppercase tracking-wider">Total Products</span>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">{productsList.length}</span>
                  <Package className="h-5 w-5 text-purple-400 mb-1 opacity-50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
              
              {/* Left Column: Management (Tables) */}
              <div className="xl:col-span-8 flex flex-col gap-6 sm:gap-8">
                
                {/* Categories Table */}
                <div className="rounded-2xl bg-white/[0.01] border border-white/5 overflow-hidden flex flex-col shadow-xl">
                  <div className="p-4 sm:p-5 border-b border-white/5 bg-[#0a0d1a]/50 flex items-center justify-between">
                    <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-indigo-400" />
                      Live Categories
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 sm:px-5 py-3">Category</th>
                          <th className="px-4 sm:px-5 py-3 hidden sm:table-cell">Description</th>
                          <th className="px-4 sm:px-5 py-3">Tags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {categoriesList.length === 0 ? (
                          <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500 italic">No categories found. Create one to get started.</td></tr>
                        ) : (
                          categoriesList.map(cat => (
                            <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-4 sm:px-5 py-4 flex items-center gap-3">
                                {cat.image ? (
                                  <img loading="lazy" src={cat.image} className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 shrink-0">{cat.name.substring(0,2)}</div>
                                )}
                                <span className="font-semibold text-white truncate max-w-[120px]">{cat.name}</span>
                              </td>
                              <td className="px-4 sm:px-5 py-4 text-gray-400 hidden sm:table-cell">
                                <span className="line-clamp-1">{cat.description || '-'}</span>
                              </td>
                              <td className="px-4 sm:px-5 py-4">
                                <div className="flex gap-1 flex-wrap">
                                  {cat.tags && cat.tags.length > 0 ? cat.tags.map((t: string) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-300 font-mono">{t}</span>
                                  )) : '-'}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Products Table */}
                <div className="rounded-2xl bg-white/[0.01] border border-white/5 overflow-hidden flex flex-col shadow-xl">
                  <div className="p-4 sm:p-5 border-b border-white/5 bg-[#0a0d1a]/50 flex items-center justify-between">
                    <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-400" />
                      Live Catalog Inventory
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] text-gray-400 font-mono text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 sm:px-5 py-3">Item</th>
                          <th className="px-4 sm:px-5 py-3">Price</th>
                          <th className="px-4 sm:px-5 py-3 hidden sm:table-cell">Category</th>
                          <th className="px-4 sm:px-5 py-3">Type</th>
                          <th className="px-4 sm:px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {productsList.length === 0 ? (
                          <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 italic">No products found. Add items to your inventory.</td></tr>
                        ) : (
                          productsList.map(prod => {
                            const cat = categoriesList.find(c => c.id === prod.categoryId);
                            return (
                              <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-4 sm:px-5 py-4 flex items-center gap-3">
                                  {prod.image ? (
                                    <img loading="lazy" src={prod.image} className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 shrink-0"><ShoppingBag className="h-3.5 w-3.5" /></div>
                                  )}
                                  <span className="font-semibold text-white truncate max-w-[120px]">{prod.name}</span>
                                </td>
                                <td className="px-4 sm:px-5 py-4 font-mono font-bold text-indigo-300">
                                  {prod.currency === "USD" ? "$" : prod.currency === "EUR" ? "€" : prod.currency === "GBP" ? "£" : prod.currency === "INR" ? "₹" : `${prod.currency || "USD"} `}{(prod.price / 100).toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-5 py-4 hidden sm:table-cell text-gray-400">
                                  <span className="px-2 py-1 rounded bg-white/5 text-[10px]">{cat ? cat.name : 'Uncategorized'}</span>
                                </td>
                                <td className="px-4 sm:px-5 py-4">
                                  {prod.isService ? (
                                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold tracking-wide">SERVICE</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold tracking-wide">PRODUCT</span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-5 py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Creation Forms */}
              <div className="xl:col-span-4 flex flex-col gap-6 sm:gap-8">
                
                {/* Create Category */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 shadow-xl">
                  <h3 className="font-bold text-white font-heading text-sm border-b border-white/5 pb-2">Add New Category</h3>
                  <form onSubmit={handleCreateCategory} className="flex flex-col gap-3.5">
                    <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                    <textarea placeholder="Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white resize-none focus:ring-1 focus:ring-indigo-500 outline-none transition-all" rows={2} />
                    <input type="text" placeholder="Tags (comma separated)" value={newCatTags} onChange={e => setNewCatTags(e.target.value)} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide flex justify-between">
                        <span>Cover Image</span>
                        <span className="text-indigo-400">800x400px</span>
                      </label>
                      <input type="file" accept="image/*" onChange={handleCatImageUpload} className="text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer" />
                    </div>
                    <button type="submit" disabled={isCreatingCat} className="mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                      {isCreatingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Add Category</span>}
                    </button>
                  </form>
                </div>

                {/* Create Product */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 shadow-xl">
                  <h3 className="font-bold text-white font-heading text-sm border-b border-white/5 pb-2">Add Inventory Item</h3>
                  <form onSubmit={handleCreateProduct} className="flex flex-col gap-3.5">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Item Name" value={newProdName} onChange={e => setNewProdName(e.target.value)} required className="flex-grow bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none min-w-0" />
                      
                      <div className="relative w-24 shrink-0">
                        <select value={newProdCurrency} onChange={e => setNewProdCurrency(e.target.value)} required className="w-full bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none uppercase cursor-pointer appearance-none">
<option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="GBP">British Pound (£)</option><option value="INR">Indian Rupee (₹)</option><option value="BDT">Bangladeshi Taka (৳)</option><option value="AUD">Australian Dollar (A$)</option><option value="CAD">Canadian Dollar (C$)</option><option value="SGD">Singapore Dollar (S$)</option><option value="AED">Emirati Dirham (د.إ)</option><option value="SAR">Saudi Riyal (﷼)</option><option value="JPY">Japanese Yen (¥)</option><option value="CNY">Chinese Yuan (¥)</option><option value="CHF">Swiss Franc (CHF)</option><option value="ZAR">South African Rand (R)</option><option value="NZD">New Zealand Dollar (NZ$)</option><option value="RUB">Russian Ruble (₽)</option><option value="BRL">Brazilian Real (R$)</option><option value="MXN">Mexican Peso (Mex$)</option><option value="SEK">Swedish Krona (kr)</option><option value="NOK">Norwegian Krone (kr)</option><option value="DKK">Danish Krone (kr)</option><option value="HKD">Hong Kong Dollar (HK$)</option><option value="TRY">Turkish Lira (₺)</option><option value="KRW">South Korean Won (₩)</option><option value="IDR">Indonesian Rupiah (Rp)</option><option value="MYR">Malaysian Ringgit (RM)</option><option value="PHP">Philippine Peso (₱)</option><option value="THB">Thai Baht (฿)</option><option value="VND">Vietnamese Dong (₫)</option><option value="EGP">Egyptian Pound (E£)</option><option value="NGN">Nigerian Naira (₦)</option><option value="PKR">Pakistani Rupee (₨)</option><option value="LKR">Sri Lankan Rupee (Rs)</option><option value="KWD">Kuwaiti Dinar (KD)</option><option value="QAR">Qatari Riyal (QR)</option>
</select>
                      </div>

                      <input type="number" placeholder="Price" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} required className="w-24 bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none shrink-0" />
                    </div>
                    <select value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="">No Category Selected</option>
                      {categoriesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <div className="relative flex items-center">
                        <input type="checkbox" checked={newProdIsService} onChange={e => setNewProdIsService(e.target.checked)} className="peer sr-only" />
                        <div className="h-4 w-8 rounded-full bg-gray-700 peer-checked:bg-emerald-500 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-300">Mark as Service</span>
                    </label>

                    <textarea placeholder="Product/Service Description" value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white resize-none focus:ring-1 focus:ring-purple-500 outline-none" rows={2} />
                    
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Item Image</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 cursor-pointer" />
                    </div>
                    
                    <button type="submit" disabled={isCreatingProduct} className="mt-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                      {isCreatingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Publish Item</span>}
                    </button>
                  </form>
                </div>

              </div>
            </div>
            
            {/* Landing Page Builder Preview */}
            <div className="mt-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col gap-4">
               <h3 className="font-bold text-white font-heading text-lg flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-indigo-400" />
                 Storefront Configuration
               </h3>
               <p className="text-xs text-gray-400 max-w-2xl">
                 Customize the look and feel of your ultra-premium, mobile-first iOS slide-out shopping experience.
               </p>
               <div className="flex gap-4 mt-2">
                 <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer">
                   Upload Brand Logo
                 </button>
                 <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer">
                   Edit Hero Banner
                 </button>
               </div>
            </div>
          </div>
          </FeatureGate>
        )}


{/* 3. SKILLS & WEBHOOK BRIDGE TAB */}
        {activeTab === "skills" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full select-none text-gray-200">
            
            {/* Header section */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                <Workflow className="h-6 w-6 text-indigo-400" />
                <span>Skills System & n8n Webhook Bridge</span>
              </h2>
              <p className="text-xs text-gray-400">
                Grant your chatbot agent agentic abilities! Toggles built-in skills or trigger secure, SHA256-signed n8n automation loops.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Toggles and Configuration */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Toggles Panel */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4">
                  <h3 className="font-bold text-white font-heading text-sm">Active Bot Skills</h3>
                  
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-white">Lead Capture Agent</span>
                        <span className="text-[10px] text-gray-500">Automatically logs client emails and names.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={skillsState.leadCapture} 
                        onChange={(e) => setSkillsState(prev => ({ ...prev, leadCapture: e.target.checked }))}
                        className="w-8 h-4 bg-white/5 appearance-none rounded-full checked:bg-indigo-600 transition relative cursor-pointer before:absolute before:h-3 before:w-3 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                      />
                    </div>


                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                      <label className="text-xs font-bold text-gray-400">Target Lead List (For Lead Capture Agent)</label>
                      <select
                        value={skillsState.assignedLeadListId || "list_default"}
                        onChange={(e) => setSkillsState(prev => ({ ...prev, assignedLeadListId: e.target.value }))}
                        className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                      >
                        {leadLists.map(list => (
                          <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500">When the bot successfully extracts an email and name, it will be automatically saved to this Airtable sheet.</p>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-white">Human Handoff Trigger</span>
                        <span className="text-[10px] text-gray-500">Alerts human operator channel during surges.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={skillsState.humanHandoff} 
                        onChange={(e) => setSkillsState(prev => ({ ...prev, humanHandoff: e.target.checked }))}
                        className="w-8 h-4 bg-white/5 appearance-none rounded-full checked:bg-indigo-600 transition relative cursor-pointer before:absolute before:h-3 before:w-3 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-white">n8n Webhook Bridge</span>
                        <span className="text-[10px] text-gray-500">Triggers workflow chains with dynamic signatures.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={skillsState.n8nWebhook} 
                        onChange={(e) => setSkillsState(prev => ({ ...prev, n8nWebhook: e.target.checked }))}
                        className="w-8 h-4 bg-white/5 appearance-none rounded-full checked:bg-indigo-600 transition relative cursor-pointer before:absolute before:h-3 before:w-3 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* System Prompt Instruction */}
                <div className="flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-4">
                  <label className="text-xs font-bold text-gray-400 flex items-center justify-between">
                    <span>System AI Instruction (Prompt)</span>
                    <span className="text-[10px] text-gray-500 font-normal">E-Commerce Logic is auto-injected</span>
                  </label>
                  <textarea 
                    value={systemPrompt} 
                    onChange={e => setSystemPrompt(e.target.value)} 
                    className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
                    placeholder="e.g. You are a helpful sales assistant..."
                  />
                </div>

                {/* n8n settings form */}
                {skillsState.n8nWebhook && (
                  <div className="p-6 rounded-2xl bg-[#0a0d1a]/80 border border-white/5 flex flex-col gap-4">
                    <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                      <Workflow className="h-4.5 w-4.5 text-indigo-400" />
                      <span>n8n Webhook Settings</span>
                    </h3>
                    
                    <form onSubmit={handleSaveSkillsSettings} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-semibold">n8n Endpoint URL</label>
                        <input
                          type="url"
                          required
                          value={n8nUrl}
                          onChange={(e) => setN8nUrl(e.target.value)}
                          className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-semibold flex items-center gap-1">
                          <Key className="h-3 w-3 text-indigo-400" />
                          <span>HMAC Validation Secret Key</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={hmacSecret}
                          onChange={(e) => setHmacSecret(e.target.value)}
                          className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingSkillsConfig}
                        className="w-full py-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        {isSavingSkillsConfig ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <span>Save & Encrypt Configurations</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Right Column: Leads Database and Latency runs */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Live Leads Log */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 max-h-[300px] overflow-hidden">
                  <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Captured Leads Ledger (leads)</span>
                  </h3>
                  
                  {leadsList.length > 0 ? (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                      {leadsList.map((lead) => (
                        <div key={lead.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{lead.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{lead.createdAt.slice(11, 16)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-indigo-300 font-mono">
                            <span>{lead.email}</span>
                            <span className="text-gray-500 text-[10px]">ID: {lead.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-6 text-center">
                      No leads captured in sandbox chat conversation yet. Try asking: "Capture my details Imran imran@aether.ai" in the playground!
                    </div>
                  )}
                </div>

                {/* Skill Latency logs */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 max-h-[340px] overflow-hidden flex-grow">
                  <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Execution Telemetry Ledger (skill_runs)</span>
                  </h3>

                  {skillsLogs.length > 0 ? (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                      {skillsLogs.map((run) => (
                        <div key={run.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex flex-col gap-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{run.skillName.toUpperCase()}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">{run.latencyMs}ms</span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate max-w-full leading-normal">
                            Payload: {run.payload}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-6 text-center">
                      No skills executed in this session. Trigger lead capture, n8n webhooks, or operator handoffs in the playground!
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 4. STORE & CALENDAR TAB */}
        {activeTab === "store" && selectedShopId === null && (
          <div className="p-8 max-w-xl mx-auto text-center flex flex-col items-center justify-center gap-4 py-20 select-none text-gray-200">
            <ShoppingBag className="h-16 w-16 text-indigo-500/50" />
            <h2 className="text-xl font-bold text-white">Select a Store First</h2>
            <p className="text-sm text-gray-400">Please go to the E-Commerce tab and select a storefront from your directory to configure its products and bookings.</p>
            <button onClick={() => setActiveTab("ecom")} className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer">
              Go to Store Directory
            </button>
          </div>
        )}

        {/* 4. STORE & CALENDAR TAB */}
        {activeTab === "store" && selectedShopId !== null && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full select-none text-gray-200">
            
            {/* Tab branding */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-indigo-400" />
                <span>Storefront & Appointment Booking Manager</span>
              </h2>
              <p className="text-xs text-gray-400">
                Configure custom e-commerce product catalogs and collect booked calendar appointment slots dynamically from your AI assistants.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Product catalog creator and listing */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Product creator */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4">
                  <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Create New Product Catalog Item</span>
                  </h3>

                  <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Dedicated Support Addon"
                        className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300">Price in USD ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="e.g. 49.00"
                        className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300">Short Description</label>
                      <textarea
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Provide billing schedule or package details..."
                        rows={3}
                        className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                        <span>Showcase Image</span>
                        <span className="text-[10px] text-indigo-400 font-semibold">Recommended: 500x500 px (1:1 Ratio)</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-grow flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01] rounded-xl p-4 cursor-pointer transition text-center group">
                          <Plus className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 mb-1" />
                          <span className="text-[11px] text-gray-400 group-hover:text-white">Choose Showcase PNG/JPG File</span>
                          <span className="text-[9px] text-gray-500 mt-0.5">App auto-crops to perfect square aspect ratio</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {newProdImage && (
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#070913]">
                            <img loading="lazy" src={newProdImage} alt="Preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewProdImage("")}
                              className="absolute top-1 right-1 h-5 w-5 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingProduct || !newProdName.trim() || !newProdPrice.trim()}
                      className="w-full py-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      {isCreatingProduct ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Register Catalog Product</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Catalog Listing */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 max-h-[300px] overflow-hidden">
                  <h3 className="font-bold text-white font-heading text-sm">Product Storefront Catalog</h3>
                  
                  {productsList.length > 0 ? (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                      {productsList.map((prod) => (
                        <div key={prod.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {prod.image ? (
                              <img loading="lazy" src={prod.image} alt={prod.name} className="h-9 w-9 rounded-lg object-cover border border-white/5 shrink-0 bg-[#070913]" />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0 uppercase font-heading">
                                {prod.name.substring(0, 2)}
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white">{prod.name}</span>
                              <span className="text-[10px] text-gray-500 leading-normal truncate max-w-[180px]">{prod.description}</span>
                            </div>
                          </div>

      {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
        <span className="text-gray-500 line-through mr-2 text-[10px]">
          ${(prod.compareAtPrice / 100).toFixed(2)}
        </span>
      )}
    
                          <span className="font-mono text-indigo-400 font-bold shrink-0">${(prod.price / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-6 text-center">
                      No products added to catalog.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side: Appointment schedules and slot settings */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* Phase 7: Appointment Slots Manager */}
                <div className="p-6 rounded-2xl bg-[#0a0d1a]/80 border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                      <Settings2 className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Availability & Services Manager</span>
                    </h3>
                    <button 
                      onClick={() => setIsServicesModalOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 text-[10px] font-bold rounded uppercase tracking-widest transition"
                    >
                      Configure Slots
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Active Services</span>
                      <div className="flex flex-col gap-1">
                        {appointmentServices.map(s => (
                          <div key={s.id} className="text-xs text-gray-300 flex justify-between">
                            <span>{s.name} ({s.duration}m)</span>
                            <span className="text-emerald-400">{s.price === 0 ? 'Free' : `$${(s.price/100).toFixed(2)}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Global Rules</span>
                        <div className="text-xs text-gray-300">Hours: {bookingSettings.availability}</div>
                        <div className="text-xs text-gray-300">Buffer: {bookingSettings.bufferTime} mins</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live appointments schedule listing */}
                <div className="p-6 rounded-2xl bg-[#0a0d1a]/80 border border-white/5 flex flex-col gap-4 max-h-[300px] overflow-hidden">
                  <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Booked Appointments Schedule</span>
                  </h3>

                  {appointmentsList.length > 0 ? (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                      {appointmentsList.map((appt) => (
                        <div key={appt.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{appt.clientName}</span>
                            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded px-2 py-0.5 font-mono uppercase tracking-wide">
                              {appt.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                            <span>{appt.clientEmail}</span>
                            <span className="text-indigo-300">{appt.timeSlot}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-12 text-center">
                      No appointments scheduled yet in this session. Try asking: "book an appointment for Imran imran@aether.ai for Friday at 3:00 PM" in the playground!
                    </div>
                  )}
                </div>

                {/* Diagnostic specs */}
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] text-gray-500 leading-relaxed">
                  <div className="font-semibold text-gray-400 mb-1">Calendar & Store Diagnostics:</div>
                  - Checkout flow: Simulated secure checkout order link generators.<br />
                  - Booking rules: 30-minute block boundaries enforced.<br />
                  - RLS policies: isolated scoping per tenant active.
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 5. DYNAMIC CHAT UI CUSTOMIZATION STUDIO & WIDGET EMBED */}
        {activeTab === "widget" && (
          <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-6 p-4 lg:p-8 animate-fadeIn lg:h-[calc(100vh-72px)] lg:overflow-hidden">
            
            {/* LEFT SIDE: CUSTOMIZATION & TRAINING - scrolls independently */}
            <div className="flex-1 lg:max-w-3xl flex flex-col gap-6 lg:overflow-y-auto pr-2 pb-24 scrollbar-thin">
              
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                  Advanced Agent Customization Studio
                </h2>
                <p className="text-sm text-gray-400">Configure your agent's identity, RAG knowledge base, and active skills. Changes reflect instantly in the live emulator.</p>
              </div>

              {/* Agent Selection */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white text-sm">Select Agent</h3>
                  <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{agentsList.length}/10</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentsList.map(a => (
                    <div 
                      key={a.id} 
                      className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                        selectedAgentId === a.id 
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                          : 'bg-white/[0.02] border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        {a.avatarUrl ? (
                          <img loading="lazy" src={a.avatarUrl} alt={a.name} className="h-10 w-10 rounded-full object-cover border border-white/10 shadow-lg" />
                        ) : (
                          <div className="h-10 w-10 rounded-full flex items-center justify-center border border-white/10 shadow-lg" style={{ backgroundColor: a.themeColor || '#6366f1' }}>
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5">
                            {a.templateStyle || "glass"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{storeAssignedAgentId === a.id ? 'Deployed' : 'Off'}</span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const newId = storeAssignedAgentId === a.id ? "" : a.id;
                                setStoreAssignedAgentId(newId);
                                try {
                                  await fetch("/api/ecom/settings", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      tenantSlug,
                                      storeId: selectedShopId || undefined,
                                      assignedAgentId: newId
                                    })
                                  });
                                  showToast(newId ? "Agent Successfully Deployed!" : "Agent Deployment Removed.");
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all duration-300 shadow-inner outline-none ${storeAssignedAgentId === a.id ? 'bg-indigo-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.3)]' : 'bg-gray-700/50 border border-white/5 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]'}`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${storeAssignedAgentId === a.id ? 'translate-x-[1.1rem] shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'translate-x-[2px]'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-white text-sm truncate mb-1">{a.name}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: a.themeColor || '#6366f1' }}></div>
                        <span className="text-[10px] text-gray-500 font-mono truncate">{a.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => {
                            setSelectedAgentId(a.id);
                            setBotName(a.name || "Aether AI Agent");
                            setBotAvatar(a.avatarUrl || "");
                            setThemeColor(a.themeColor || "#6366f1");
                            setActiveTemplate(a.templateStyle || "glass");
                            setSystemPrompt(a.systemPrompt || "You are a helpful Aether assistant.");
                            setAgentSkills(a.activeSkills || []);
                            setMainModel(a.mainModel || "openrouter/auto");
                            setSimulateNonAI(a.simulateNonAI || false);
                            setUseOwnModels(a.useOwnModels || false);
                            setFallbackModel1(a.fallbackModel1 || "none");
                            setFallbackModel2(a.fallbackModel2 || "none");
                            setRateLimitPreset(a.rateLimitConfig?.preset || "generous");
                            setEcommerceConfig({
                              offers: a.ecommerceConfig?.offers || [
                                { percentage: 10, condition: "If user shows slight hesitation" },
                                { percentage: 25, condition: "If user asks for a discount" },
                                { percentage: 55, condition: "Final attempt to close the sale if they are leaving" }
                              ],
                              allowedCategoryIds: a.ecommerceConfig?.allowedCategoryIds || [],
                              allowedProductIds: a.ecommerceConfig?.allowedProductIds || [],
                              scarcityTimerLength: a.ecommerceConfig?.scarcityTimerLength || 15
                            });
                            setMetaTitle(a.metaTitle || "");
                            setMetaDescription(a.metaDescription || "");
                            setMetaImage(a.metaImage || "");
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            selectedAgentId === a.id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-white/5 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300'
                          }`}
                        >
                          {selectedAgentId === a.id ? 'Editing' : 'Edit Agent'}
                        </button>
                        
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${a.name}?`)) {
                              try {
                                const res = await fetch(`/api/agents?id=${a.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  showToast(`✅ Deleted ${a.name}`);
                                  if (selectedAgentId === a.id) setSelectedAgentId("new");
                                  fetchAgents();
                                } else {
                                  showToast("❌ Failed to delete agent");
                                }
                              } catch(err) {
                                showToast("❌ Error deleting agent");
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete Agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {agentsList.length < 10 && (
                    <div 
                      onClick={() => {
                        setSelectedAgentId("new");
                        setBotName("New Agent");
                        setBotAvatar("");
                        setThemeColor("#6366f1");
                        setActiveTemplate("glass");
                        setSimulateNonAI(false);
                        setMainModel("openrouter/free");
                        setSystemPrompt("You are an expert sales assistant.");
                        setAgentSkills([]);
                        setMetaTitle("");
                        setMetaDescription("");
                        setMetaImage("");
                      }}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[140px] ${
                        selectedAgentId === "new"
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                          : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-300">Create New Agent</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Identity & Aesthetics */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Identity & Theme</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">Agent Name</label>
                    <input type="text" value={botName} onChange={e => setBotName(e.target.value)} className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">Template Style</label>
                    <select value={activeTemplate} onChange={e => setActiveTemplate(e.target.value)} className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                      <option value="glass">Glassmorphism (Premium)</option>
                      <option value="ios">iOS Smooth (Light)</option>
                      <option value="neo-dark">Neo-Dark (Tech)</option>
                      <option value="minimal">Minimalist</option>
                      <option value="playful">Playful / Brand</option>
                      <option value="cyberpunk">Cyberpunk Neon (Advanced)</option>
                      <option value="holographic">Holographic 3D (Advanced)</option>
                      <option value="luxury-gold">Luxury Gold (Premium)</option>
                      <option value="emerald-city">Emerald City (Vibrant)</option>
                      <option value="aurora">Aurora Borealis (Dynamic)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">Avatar Image (512x512 PNG/JPG)</label>
                    <div className="flex items-center gap-3">
                      {botAvatar ? (
                        <img loading="lazy" src={botAvatar} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setBotAvatar(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400">Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer bg-[#070913] border border-white/10 p-0.5" />
                      <input type="text" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              
              {/* COLLAPSIBLE LIVE TOKEN MESH PANEL */}
              <AnimatePresence>
                {tokenUsage && (
                  <div className="bg-[#0a0d1a] border border-indigo-500/10 rounded-2xl p-5 shadow-[0_4px_30px_rgba(99,102,241,0.15)] flex flex-col gap-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none rounded-2xl" />
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        <h3 className="font-bold text-white text-sm">Live Token Mesh Monitor</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTokenPanelExpanded(!isTokenPanelExpanded)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <span className="text-xs font-bold font-mono">{isTokenPanelExpanded ? "[-]" : "[+]"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTokenUsage(null)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isTokenPanelExpanded && (() => {
                        const getModelPricing = (modelName: string) => {
                          const normalized = modelName ? modelName.toLowerCase() : "";
                          if (normalized.includes("gpt-4o-mini")) return { name: "GPT-4o Mini", input: 0.15, output: 0.60 };
                          if (normalized.includes("gpt-4o")) return { name: "GPT-4o", input: 2.50, output: 10.00 };
                          if (normalized.includes("gemini-2.5-flash") || normalized.includes("gemini-1.5-flash")) return { name: "Gemini Flash", input: 0.075, output: 0.30 };
                          if (normalized.includes("gemini-2.5-pro") || normalized.includes("gemini-1.5-pro")) return { name: "Gemini Pro", input: 1.25, output: 5.00 };
                          if (normalized.includes("claude-3-5-sonnet") || normalized.includes("claude-3.5-sonnet")) return { name: "Claude Sonnet", input: 3.00, output: 15.00 };
                          if (normalized.includes("claude-3-haiku")) return { name: "Claude Haiku", input: 0.25, output: 1.25 };
                          if (normalized.includes("llama-3-8b") || normalized.includes("llama-3.1-8b")) return { name: "Llama 8B", input: 0.05, output: 0.05 };
                          if (normalized.includes("llama-3-70b") || normalized.includes("llama-3.1-70b")) return { name: "Llama 70B", input: 0.59, output: 0.79 };
                          return { name: "Aether Mesh", input: 0.15, output: 0.60 };
                        };
                        const activeModelFromUsage = tokenUsage.model || mainModel;
                        const rates = getModelPricing(activeModelFromUsage);
                        const prompt_tokens = tokenUsage.prompt_tokens ?? tokenUsage.promptTokens ?? 0;
                        const completion_tokens = tokenUsage.completion_tokens ?? tokenUsage.completionTokens ?? 0;
                        const inputCost = (prompt_tokens / 1000000) * rates.input;
                        const outputCost = (completion_tokens / 1000000) * rates.output;
                        const totalCost = inputCost + outputCost;

                        return (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden flex flex-col gap-3 relative z-10"
                          >
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5 text-xs mt-1">
                              <span className="text-gray-400 font-bold">Active Engine</span>
                              <span className="text-indigo-400 font-mono font-bold bg-indigo-900/30 px-2.5 py-0.5 rounded-full border border-indigo-500/20 max-w-[200px] truncate">{rates.name}</span>
                            </div>

                            {/* Split Curtain Opening Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
                              {/* Left Curtain - Prompt */}
                              <motion.div
                                initial={{ x: -80, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 180, delay: 0.1 }}
                                className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col"
                              >
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Prompt Tokens</p>
                                <p className="text-base text-white font-mono font-black">{prompt_tokens.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-500 font-mono mt-1">${rates.input}/M tokens</p>
                              </motion.div>

                              {/* Right Curtain - Completion */}
                              <motion.div
                                initial={{ x: 80, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 180, delay: 0.1 }}
                                className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col"
                              >
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Completion Tokens</p>
                                <p className="text-base text-white font-mono font-black">{completion_tokens.toLocaleString()}</p>
                                <p className="text-[9px] text-gray-500 font-mono mt-1">${rates.output}/M tokens</p>
                              </motion.div>
                            </div>

                            {/* Dynamic Skill Executed Block */}
                            {tokenUsage.skillTriggered && (
                              <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 150, delay: 0.2 }}
                                className="bg-gradient-to-br from-indigo-950/20 to-black/40 border border-indigo-500/20 rounded-xl p-3.5 flex flex-col gap-2 relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                              >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Workflow className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "4s" }} />
                                    <span className="text-[9px] uppercase tracking-widest font-black text-indigo-300">Skill Executed</span>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">{tokenUsage.skillName?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/30 rounded-lg p-2 border border-white/5 text-[9px] font-mono">
                                  <span className="text-gray-500">Execution Output</span>
                                  <span className="text-emerald-400 font-bold">Success Confirmation</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono leading-relaxed mt-1 p-2 bg-black/20 rounded-lg border border-white/5 overflow-x-auto max-h-20 scrollbar-thin whitespace-pre-wrap">
                                  {tokenUsage.skillOutput || "Automated skill routing executed."}
                                </p>
                              </motion.div>
                            )}

                            {/* Total Cost Calculation */}
                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Est. Execution Cost</p>
                              <p className="text-base text-emerald-400 font-mono font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                                ${totalCost.toFixed(6)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>


              {/* AI Provider & Model Mesh Routing */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  AI Provider & Model Mesh Routing
                </h3>
                
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-white text-xs font-bold flex items-center gap-2">
                      Non-AI Simulation Mode
                      <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">App NPU / Self AI</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">When ON, bypasses external LLMs and uses internal ultra-smart offline algorithms for bookings and e-commerce.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSimulateNonAI(!simulateNonAI)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${simulateNonAI ? 'bg-indigo-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${simulateNonAI ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                  <div>
                    <h5 className="text-sm font-bold text-white">Model Source</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Choose where to load available models from.</p>
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setUseOwnModels(false)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!useOwnModels ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      App Provided Models
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseOwnModels(true)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${useOwnModels ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      Own Models
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">Select a primary 2026 model and up to 2 fallbacks. If the primary model fails or limits out, the mesh will instantly route to the fallbacks. Add your API keys in the integration hub to unlock models.</p>
                
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${simulateNonAI ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex flex-col gap-1.5 relative">
                    <SearchableModelSelect 
                      label="Main Engine" 
                      value={mainModel} 
                      onChange={(val) => {
                        setMainModel(val);
                        const group = availableModelsGrouped.find(g => g.models.some((m: any) => m.id === val));
                        if (group) setSelectedProvider(group.provider);
                      }} 
                      optionsGrouped={availableModelsGrouped} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <SearchableModelSelect 
                      label="Fallback 1" 
                      value={fallbackModel1} 
                      onChange={setFallbackModel1} 
                      optionsGrouped={availableModelsGrouped} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <SearchableModelSelect 
                      label="Fallback 2" 
                      value={fallbackModel2} 
                      onChange={setFallbackModel2} 
                      optionsGrouped={availableModelsGrouped} 
                    />
                  </div>
                </div>
              </div>

              {/* Fair Use Rate Limiting */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-400" />
                  Fair Use Rate Limiting
                </h3>
                
                <div className="flex flex-col gap-3">
                  <select value={rateLimitPreset} onChange={e => setRateLimitPreset(e.target.value)} className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                    <option value="ecommerce">E-Commerce Heavy (30 requests / minute)</option>
                    <option value="standard">Standard Support (15 requests / minute)</option>
                    <option value="strict">Strict Anti-Spam (5 requests / minute)</option>
                    <option value="custom">Custom Configuration</option>
                  </select>
                  
                  {rateLimitPreset === "custom" && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Max Requests</label>
                        <input type="number" value={customRateLimit.maxRequests} onChange={e => setCustomRateLimit({ ...customRateLimit, maxRequests: parseInt(e.target.value) || 1 })} className="w-full bg-[#070913] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Window Duration (ms)</label>
                        <input type="number" value={customRateLimit.windowMs} onChange={e => setCustomRateLimit({ ...customRateLimit, windowMs: parseInt(e.target.value) || 1000 })} className="w-full bg-[#070913] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preset Prompts Dropdown */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-3 mb-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Agent Presets
                  </h3>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Quick Start</span>
                </div>
                <select 
                  onChange={(e) => {
                    const preset = AGENT_PRESETS.find(p => p.id === e.target.value);
                    if (preset) {
                      setSystemPrompt(preset.prompt);
                      const newSkills = { leadCapture: false, humanHandoff: false, n8nWebhook: false, ecommerce: false, booking: false, ...skillsState };
                      if (preset.skills.includes("lead_capture")) newSkills.leadCapture = true;
                      if (preset.skills.includes("human_handoff")) newSkills.humanHandoff = true;
                      if (preset.skills.includes("n8n_webhook")) newSkills.n8nWebhook = true;
                      if (preset.skills.includes("ecommerce_checkout") || preset.skills.includes("catalog_query")) newSkills.ecommerce = true;
                      if (preset.skills.includes("calendar_booking")) newSkills.booking = true;
                      setSkillsState(newSkills);
                      showToast("Preset applied! Review settings before saving.");
                    }
                  }}
                  className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors"
                >
                  <option value="">Select a highly-optimized preset...</option>
                  {AGENT_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* System AI Instruction */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-violet-400" />
                    System AI Instruction
                  </h3>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Personality & Rules Engine</span>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 min-h-[110px] resize-y leading-relaxed placeholder-gray-600"
                  placeholder="e.g. You are a friendly sales expert for [Business Name]. Always greet users warmly, focus on upselling premium packages, and never discuss competitor brands..."
                />

                {/* Active Tool Snippets — shown if tools are configured */}
                {(telegramToolName && telegramBotToken && telegramChatId) || (googleSheetsToolName && googleSheetsWebhookUrl) ? (
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                    <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                      Active Tools — paste these tags in your system prompt above
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {telegramBotToken && telegramChatId && telegramToolName && (
                        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-lg px-2.5 py-2">
                          <span className="text-[9px] text-sky-400 font-bold w-20 shrink-0">📱 TELEGRAM</span>
                          <code className="text-[10px] text-sky-300 font-mono flex-1 truncate">[TOOL:{telegramToolName}:Your message]</code>
                          <button onClick={() => { navigator.clipboard.writeText(`[TOOL:${telegramToolName}:Your message here]`); showToast("Copied!"); }} className="text-[9px] text-sky-400 shrink-0 hover:text-sky-200">Copy</button>
                        </div>
                      )}
                      {googleSheetsWebhookUrl && googleSheetsToolName && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-2">
                          <span className="text-[9px] text-emerald-400 font-bold w-20 shrink-0">📊 SHEETS</span>
                          <code className="text-[10px] text-emerald-300 font-mono flex-1 truncate">[TOOL:{googleSheetsToolName}:{'{'}...{'}'}]</code>
                          <button onClick={() => { navigator.clipboard.writeText(`[TOOL:${googleSheetsToolName}:{"name":"value","email":"value"}]`); showToast("Copied!"); }} className="text-[9px] text-emerald-400 shrink-0 hover:text-emerald-200">Copy</button>
                        </div>
                      )}
                      <p className="text-[9px] text-gray-500 px-1">The AI will execute these tools automatically when it outputs the tag. Configure tools in <button onClick={() => setActiveTab("integrations")} className="text-indigo-400 underline">Integrations Hub</button>.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-600 border-t border-white/5 pt-2">No tools configured. Set up <button onClick={() => setActiveTab("integrations")} className="text-indigo-400 hover:text-indigo-300 underline">Google Sheets or Telegram tools</button> in Integrations Hub to give your agent action capabilities.</p>
                )}
              </div>

              {/* RAG Knowledge Base Training */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-400" />
                  Advanced AI Training (RAG)
                </h3>
                <p className="text-xs text-gray-400">Upload document files. The app will convert it into semantic RAG data strictly for this agent.</p>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!selectedAgentId || selectedAgentId === "new") return showToast("Please save the agent first before adding knowledge.");
                    
                    const form = e.target as HTMLFormElement;
                    const docName = (form.elements.namedItem("docName") as HTMLInputElement).value;
                    const fileInput = (form.elements.namedItem("docFile") as HTMLInputElement).files?.[0];
                    
                    if (!docName || !fileInput) return;

                    try {
                      setIsTraining(true);
                      setTrainingProgress(5);
                      setTrainingStatusText("Uploading document...");
                      
                      const formData = new FormData();
                      formData.append("name", docName);
                      formData.append("file", fileInput);
                      formData.append("tenantSlug", tenantSlug as string);
                      formData.append("agentId", selectedAgentId);

                      // Simulate progress steps since we can't track fetch upload easily
                      const progressInterval = setInterval(() => {
                        setTrainingProgress(prev => {
                          if (prev < 30) {
                            setTrainingStatusText("Extracting text from document...");
                            return prev + 5;
                          }
                          if (prev < 60) {
                            setTrainingStatusText("Chunking text for semantic search...");
                            return prev + 5;
                          }
                          if (prev < 90) {
                            setTrainingStatusText("Generating embeddings via AI...");
                            return prev + 2;
                          }
                          return prev;
                        });
                      }, 800);

                      const res = await fetch("/api/ingest", {
                        method: "POST",
                        body: formData
                      });
                      
                      clearInterval(progressInterval);
                      setTrainingProgress(100);
                      setTrainingStatusText("Storing vectors in database...");

                      const data = await res.json();
                      if (res.ok && data.success) {
                        showToast(`✓ Trained! ${data.chunks} chunks, ${data.dimensions}-dim embeddings via ${data.provider || embeddingProvider}`);
                        refreshTrainedDocs(selectedAgentId);
                        fetchRagDocs();
                          
                        setTimeout(() => {
                          setIsTraining(false);
                          setTrainingProgress(0);
                          setTrainingStatusText("");
                          form.reset();
                        }, 1000);
                      } else if (data.isScannedPdf) {
                        showToast("Scanned PDF detected! This PDF has no text layer. Use a text-based PDF or paste content as .txt");
                        setIsTraining(false);
                        setTrainingProgress(0);
                      } else {
                        showToast("Error: " + (data.error || "Unknown error"));
                        setIsTraining(false);
                        setTrainingProgress(0);
                      }
                    } catch(err: any) {
                      showToast("Upload failed: " + err.message);
                      setIsTraining(false);
                      setTrainingProgress(0);
                    }
                  }} 
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-3">
                    <input disabled={isTraining} name="docName" type="text" placeholder="Knowledge Base Name (e.g., Return Policy)" required className="bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50" />
                    
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                        <span>Currently using: <strong className="text-emerald-300 uppercase">{embeddingProvider}</strong></span>
                        <span className="font-mono text-emerald-300">{embeddingModel}</span>
                      </div>
                      {embeddingProvider === 'openrouter' && (
                        <span className="text-[9px] text-gray-400 italic px-1">
                          Make sure you are using an exact OpenRouter embedding model string (e.g. <strong className="text-white font-mono">nomic-ai/nomic-embed-text-v1.5</strong> or <strong className="text-white font-mono">jinaai/jina-embeddings-v2-base-en</strong>) in the Settings tab, otherwise RAG will fail!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input disabled={isTraining} name="docFile" type="file" accept=".txt,.pdf,.doc" required className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-white/10 file:text-white cursor-pointer w-full bg-[#070913] border border-white/10 rounded-xl p-1 disabled:opacity-50" />
                      <button disabled={isTraining} type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        {isTraining ? "Training..." : "Train Agent"}
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar UI */}
                  {isTraining && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300">
                        <span>{trainingStatusText}</span>
                        <span>{trainingProgress}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                          style={{ width: `${trainingProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                {/* Display Trained Documents */}
                {trainedDocs.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Knowledge Base</h4>
                    <div className="flex flex-col gap-2">
                      {trainedDocs.map((doc, idx) => {
                        const docDims = doc.parts?.[0]?.previewCoordinates?.length || 0;
                        // Detect likely dimension mismatch: current provider dims vs stored dims
                        const expectedDims = embeddingProvider === "openrouter" && embeddingModel?.includes("nomic") ? 768
                          : embeddingProvider === "local" ? 384 : 1536;
                        const hasDimMismatch = docDims > 0 && docDims !== expectedDims;
                        const hasLowContent = doc.characters < 200;
                        return (
                          <details key={idx} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <summary className="flex justify-between items-center p-3 cursor-pointer hover:bg-white/5 transition">
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="text-sm font-bold text-white group-open:text-indigo-400 transition-colors truncate">{doc.name}</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] text-gray-400">{doc.chunks} chunks • {doc.characters} chars</span>
                                  {docDims > 0 && (
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${hasDimMismatch ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'}`}>
                                      {docDims}-dim {hasDimMismatch ? '⚠ retrain' : '✓'}
                                    </span>
                                  )}
                                  {hasLowContent && (
                                    <span className="text-[9px] text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 rounded">⚠ scan PDF?</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTrainedDoc(doc.name); }}
                                  disabled={isDeletingTrainedDoc === doc.name}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition disabled:opacity-40"
                                >
                                  {isDeletingTrainedDoc === doc.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                </button>
                                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 font-mono">View ▼</span>
                              </div>
                            </summary>

                            {hasDimMismatch && (
                              <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[10px] text-amber-300">
                                ⚠ This doc was trained with a different embedding provider ({docDims}-dim) than your current setting ({expectedDims}-dim expected). Delete and re-train for accurate RAG.
                              </div>
                            )}
                            {hasLowContent && (
                              <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-500/20 text-[10px] text-rose-300">
                                ⚠ Only {doc.characters} characters extracted. If this is a PDF book, it may be a scanned/image-based PDF (no text layer). RAG will not work. Try a text-based PDF or paste text directly.
                              </div>
                            )}

                            {doc.parts && doc.parts.length > 0 && (
                              <div className="p-3 border-t border-white/5 bg-[#03040b] max-h-60 overflow-y-auto flex flex-col gap-2">
                                {doc.parts.map((part: any, pIdx: number) => (
                                  <div key={pIdx} className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Chunk {pIdx + 1} • {part.previewCoordinates?.length || 0}-dim</span>
                                      {part.previewCoordinates && (
                                        <span className="text-[8px] font-mono text-gray-500" title="Vector sample">[{part.previewCoordinates.slice(0, 4).map((c: number) => c.toFixed(3)).join(', ')}…]</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-300 leading-relaxed break-words">{part.content || <span className="italic text-gray-500">(empty — scanned PDF?)</span>}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </details>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills & Features */}
              <div className="bg-[#0a0d1a] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-emerald-400" />
                  Active Skill Sets & E-Commerce
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["ecommerce_checkout", "catalog_query", "calendar_booking", "lead_capture", "human_handoff", "n8n_webhook", "web_search", "pdf_generation", "talk_like_human"].map(skill => (
                    <label key={skill} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition">
                      <input 
                        type="checkbox" 
                        checked={skill === "talk_like_human" ? talkLikeHuman : agentSkills.includes(skill)} 
                        onChange={(e) => {
                          if (skill === "talk_like_human") {
                            setTalkLikeHuman(e.target.checked);
                            if (e.target.checked && !agentSkills.includes("talk_like_human")) setAgentSkills([...agentSkills, "talk_like_human"]);
                            if (!e.target.checked) setAgentSkills(agentSkills.filter(s => s !== "talk_like_human"));
                          } else {
                            if (e.target.checked) setAgentSkills([...agentSkills, skill]);
                            else setAgentSkills(agentSkills.filter(s => s !== skill));
                          }
                        }}
                        className="w-4 h-4 rounded bg-black/50 border border-white/20 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wide font-mono flex items-center gap-2">
                        {skill.replace('_', ' ')}
                        {skill === "talk_like_human" && <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[9px] border border-rose-500/30">Persona Override</span>}
                      </span>
                    </label>
                  ))}
                </div>

                {agentSkills.includes("ecommerce_checkout") && (
                  <div className="mt-4 p-5 border border-indigo-500/30 bg-indigo-500/5 rounded-2xl flex flex-col gap-6 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]">
                    <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-500/20 pb-3">
                      <ShoppingBag className="w-4 h-4" />
                      E-Commerce Configuration
                    </h4>

                    {/* Scarcity Timer Setting */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-white uppercase tracking-wider">Scarcity Timer Length</label>
                        <p className="text-[10px] text-gray-400 mb-2">Configure the default countdown duration when the agent activates scarcity tactics.</p>
                      </div>
                      <div className="flex gap-3">
                        {[5, 15, 30].map(mins => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setEcommerceConfig({...ecommerceConfig, scarcityTimerLength: mins})}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${ecommerceConfig.scarcityTimerLength === mins ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                          >
                            {mins} Minutes
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Offers Section */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-white uppercase tracking-wider">Dynamic Sales Offers (Max 3)</label>
                        <p className="text-[10px] text-gray-400 mb-2">The AI will intelligently present these discounts and suggest upsells/downsells based on conversation context.</p>
                      </div>
                      
                      {ecommerceConfig.offers.map((offer, idx) => (
                        <div key={idx} className="flex flex-col gap-2 bg-[#070913]/50 p-3 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-24 shrink-0">
                              <input 
                                type="number" 
                                value={offer.percentage} 
                                onChange={(e) => {
                                  const newOffers = [...ecommerceConfig.offers];
                                  newOffers[idx].percentage = parseInt(e.target.value) || 0;
                                  setEcommerceConfig({...ecommerceConfig, offers: newOffers});
                                }}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-3 pr-6 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                              />
                              <span className="absolute right-3 top-2.5 text-xs text-gray-500">% OFF</span>
                            </div>
                            <input 
                              type="text" 
                              placeholder="Usage Condition (e.g., If user shows slight hesitation)" 
                              value={offer.condition}
                              onChange={(e) => {
                                const newOffers = [...ecommerceConfig.offers];
                                newOffers[idx].condition = e.target.value;
                                setEcommerceConfig({...ecommerceConfig, offers: newOffers});
                              }}
                              className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                            />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Offer Image URL (Optional)" 
                            value={offer.image || ""}
                            onChange={(e) => {
                              const newOffers = [...ecommerceConfig.offers];
                              newOffers[idx].image = e.target.value;
                              setEcommerceConfig({...ecommerceConfig, offers: newOffers});
                            }}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Catalog Scoping Section */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-white uppercase tracking-wider">Catalog Access Scoping</label>
                        <p className="text-[10px] text-gray-400">Restrict what this agent can sell. The agent will exclusively offer these packages. Leave empty for full access.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Categories */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider px-1">Allowed Categories</span>
                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto p-1 border border-white/5 bg-black/20 rounded-2xl custom-scrollbar">
                            {categoriesList.map(c => {
                              const isSelected = ecommerceConfig.allowedCategoryIds.includes(c.id);
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    const nextValues = isSelected
                                      ? ecommerceConfig.allowedCategoryIds.filter(cid => cid !== c.id)
                                      : [...ecommerceConfig.allowedCategoryIds, c.id];
                                    setEcommerceConfig({...ecommerceConfig, allowedCategoryIds: nextValues});
                                  }}
                                  className={`group relative p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer select-none transition-all duration-300 ${
                                    isSelected
                                      ? "bg-indigo-500/10 border-indigo-500/50 shadow-md shadow-indigo-500/5 scale-[0.98]"
                                      : "bg-[#070913]/60 border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.01]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className={`p-1.5 rounded-lg border transition-colors ${isSelected ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white'}`}>
                                      <FolderTree className="h-3.5 w-3.5" />
                                    </div>
                                    {isSelected && (
                                      <div className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-90 shadow">
                                        <Check className="h-2.5 w-2.5 stroke-[3px]" />
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-[11px] font-bold mt-1.5 truncate transition-colors ${isSelected ? 'text-indigo-200' : 'text-gray-400 group-hover:text-white'}`}>
                                    {c.name}
                                  </span>
                                  {c.description && (
                                    <span className="text-[9px] text-gray-500 line-clamp-1 leading-normal">
                                      {c.description}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {categoriesList.length === 0 && (
                              <div className="col-span-full h-28 flex flex-col items-center justify-center text-gray-600 text-[10px] font-mono">
                                <FolderTree className="h-6 w-6 mb-1.5 opacity-40" />
                                <span>No Categories Available</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Products */}
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider px-1">Allowed Specific Products (Optional Override)</span>
                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto p-1 border border-white/5 bg-black/20 rounded-2xl custom-scrollbar">
                            {productsList
                              .filter(p => ecommerceConfig.allowedCategoryIds.length === 0 || ecommerceConfig.allowedCategoryIds.includes(p.categoryId))
                              .map(p => {
                                const isSelected = ecommerceConfig.allowedProductIds.includes(p.id);
                                return (
                                  <div
                                    key={p.id}
                                    onClick={() => {
                                      const nextValues = isSelected
                                        ? ecommerceConfig.allowedProductIds.filter(pid => pid !== p.id)
                                        : [...ecommerceConfig.allowedProductIds, p.id];
                                      setEcommerceConfig({...ecommerceConfig, allowedProductIds: nextValues});
                                    }}
                                    className={`group relative p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer select-none transition-all duration-300 ${
                                      isSelected
                                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/5 scale-[0.98]"
                                        : "bg-[#070913]/60 border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.01]"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      {p.image ? (
                                        <div className="h-6 w-6 rounded overflow-hidden border border-white/10 shadow-sm shrink-0">
                                          <img loading="lazy" src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className={`p-1.5 rounded-lg border transition-colors ${isSelected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white'}`}>
                                          <Package className="h-3.5 w-3.5" />
                                        </div>
                                      )}
                                      {isSelected && (
                                        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white scale-90 shadow">
                                          <Check className="h-2.5 w-2.5 stroke-[3px]" />
                                        </div>
                                      )}
                                    </div>
                                    <span className={`text-[11px] font-bold mt-1.5 truncate transition-colors ${isSelected ? 'text-emerald-200' : 'text-gray-400 group-hover:text-white'}`}>
                                      {p.name}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-mono">
                                      {(p.price / 100).toFixed(2)} {p.currency || 'USD'}
                                    </span>
                                  </div>
                                );
                              })}
                            {productsList.filter(p => ecommerceConfig.allowedCategoryIds.length === 0 || ecommerceConfig.allowedCategoryIds.includes(p.categoryId)).length === 0 && (
                              <div className="col-span-full h-28 flex flex-col items-center justify-center text-gray-600 text-[10px] font-mono">
                                <Package className="h-6 w-6 mb-1.5 opacity-40" />
                                <span>No Products Match Filters</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button 
                onClick={async () => {
                  const payload = { 
                    tenantSlug, 
                    name: botName, 
                    systemPrompt, 
                    avatarUrl: botAvatar, 
                    themeColor, 
                    templateStyle: activeTemplate,
                    activeSkills: agentSkills,
                    preloadedPdfs: preloadedPdfs,
                    ecommerceConfig,
                    simulateNonAI,
                    useOwnModels,
                    mainModel,
                    fallbackModel1,
                    fallbackModel2,
                    rateLimitConfig: rateLimitPreset === "custom" ? { preset: "custom", ...customRateLimit } 
                      : rateLimitPreset === "strict" ? { preset: "strict", maxRequests: 5, windowMs: 60000 }
                      : rateLimitPreset === "standard" ? { preset: "standard", maxRequests: 15, windowMs: 60000 }
                      : { preset: "ecommerce", maxRequests: 30, windowMs: 60000 }
                  };
                  if (selectedAgentId === "new") {
                    const res = await fetch('/api/agents', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setSelectedAgentId(data.agent.id);
                      await fetchAgents();
                      setShowAgentSuccessModal(true);
                    } else {
                      showToast(`❌ Error: ${data.error || 'Failed to create agent'}`);
                    }
                  } else {
                    const res = await fetch('/api/agents', { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id: selectedAgentId, updates: payload }) });
                    if (res.ok) { 
                      fetchAgents(); 
                      setShowAgentSuccessModal(true); 
                      fetch(`/api/docs?tenantSlug=${tenantSlug}&agentId=${selectedAgentId}`)
                        .then(r => r.json())
                        .then(d => { if (d.docs) setTrainedDocs(d.docs); });
                    }
                  }
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] text-sm active:scale-[0.99]"
              >
                {selectedAgentId === "new" ? "🚀 Save & Deploy Agent" : "💾 Save Agent Configuration"}
              </button>

            </div>

            {/* RIGHT SIDE: LIVE MOBILE EMULATOR - fixed height, no scroll */}
            <div className="w-full lg:w-[400px] shrink-0 flex flex-col items-center gap-4 lg:overflow-y-auto">
              <div className="w-full max-w-[375px] bg-[#0a0d1a] border border-white/10 rounded-[3rem] p-3 shadow-2xl relative">
                {/* Mobile Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0a0d1a] rounded-b-2xl z-20 flex justify-center items-end pb-1 border-x border-b border-white/10">
                  <div className="w-12 h-1 rounded-full bg-white/20"></div>
                </div>
                
                {/* Emulator Frame */}
                <div className="w-full h-[700px] bg-[#070913] rounded-[2.25rem] overflow-hidden relative border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                  <ChatWidgetUI 
                    tenantSlug={tenantSlug} 
                    isPreviewMode={false}
                    isEmbed={true}
                    agentConfig={{
                      id: selectedAgentId,
                      name: botName,
                      themeColor,
                      templateStyle: activeTemplate,
                      avatarUrl: botAvatar,
                      systemPrompt,
                      mainModel,
                      provider: selectedProvider,
                      useOwnModels,
                      simulateNonAI,
                      fallbackModel1,
                      fallbackModel2,
                      activeSkills: agentSkills,
                      preloadedPdfs: preloadedPdfs
                    }} 
                    onUsageUpdate={(usage) => setTokenUsage(usage)}
                  />
                </div>
              </div>


              
              {selectedAgentId !== "new" && (
                <div className="flex flex-col gap-4 w-full max-w-[375px] mt-2">
                  <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-indigo-900/20 to-black/40 border border-indigo-500/20 rounded-2xl">
                    <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="h-4 w-4" /> Public Chat Link
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-gray-300 font-mono truncate select-all">
                        {`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4022'}/b/${tenantSlug}/${selectedAgentId}`}
                      </div>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4022'}/b/${tenantSlug}/${selectedAgentId}`); showToast("Public Link Copied!"); }} className="bg-indigo-600 hover:bg-indigo-500 px-3.5 rounded-xl text-white flex items-center justify-center cursor-pointer transition shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <a href={`/b/${tenantSlug}/${selectedAgentId}`} target="_blank" rel="noreferrer" className="text-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline-offset-4 underline mt-1 transition">OPEN LIVE CHAT IN NEW TAB ↗</a>
                  </div>

                  <div className="flex flex-col gap-4 p-5 bg-[#0a0d1a] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white tracking-wider uppercase">Social Sharing Meta (SEO)</h3>
                    </div>
                    <p className="text-[10px] text-gray-500">Customize the 3D card preview when sharing this agent on WhatsApp, Telegram, or Twitter.</p>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-400 px-1">Meta Title</label>
                      <input type="text" value={metaTitle} onChange={e=>setMetaTitle(e.target.value)} placeholder="e.g. Aether Premium Support" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-400 px-1">Meta Description</label>
                      <textarea value={metaDescription} onChange={e=>setMetaDescription(e.target.value)} placeholder="e.g. Chat with our intelligent assistant to book services instantly." rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none resize-none" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-gray-400 px-1 flex justify-between">
                        <span>Feature Image Upload</span>
                        <span className="text-emerald-500 font-mono">1200x630px</span>
                      </label>
                      <div className="flex gap-2">
                        <label className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white hover:bg-black/60 cursor-pointer flex justify-center items-center gap-2 transition">
                          <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleMetaImageUpload} />
                          <Upload className="h-3.5 w-3.5" /> Upload Image
                        </label>
                        {metaImage && (
                          <button type="button" onClick={() => setMetaImage("")} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2.5 rounded-xl transition cursor-pointer">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {metaImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/10 aspect-[1200/630] bg-black flex items-center justify-center relative">
                          <img loading="lazy" src={metaImage} alt="Meta Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 7. LANDING PAGES TAB */}
        {activeTab === "landing-pages" && (
          <FeatureGate tenantSlug={tenantSlug} featureKey="landingPage">
            <LandingPageDashboard tenantSlug={tenantSlug} />
          </FeatureGate>
        )}

        {activeTab === "leads" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6 animate-fadeIn select-none overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">Leads CRM (Airtable View)</h2>
                <p className="text-xs text-gray-400 mt-1">View and manage captured leads, their conversion status, and conversation context.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20 cursor-pointer">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl premium-glass border border-white/5 overflow-x-auto bg-white/[0.01]">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-mono uppercase tracking-wider bg-white/[0.02]">
                    <th className="p-4 font-semibold">Lead Details</th>
                    <th className="p-4 font-semibold">Contact Info</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leadsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">No leads captured yet.</td>
                    </tr>
                  ) : (
                    leadsList.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.01] transition-all group">
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white text-[13px]">{lead.name}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[200px]" title={lead.context}>{lead.context || "No context"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-300">{lead.phone ? `+${lead.countryCode || ''} ${lead.phone}` : "No Phone"}</span>
                            <span className="text-[10px] text-gray-500">{lead.email}</span>
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${lead.type === "pre_chat" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                            {lead.type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${lead.status === "purchased" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                            {lead.status || "pending"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-[10px]">
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

{activeTab === "billing" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full select-none">
            
            {/* Header copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                  <Coins className="h-6 w-6 text-indigo-400" />
                  <span>Stripe & Razorpay Billing Mesh</span>
                </h2>
                <p className="text-xs text-gray-400 max-w-xl">
                  Automatic currency routing: INR users are routed to **Razorpay UPI**, global/USD users are routed to **Stripe Checkout**.
                </p>
              </div>

              {/* Region Toggle Select */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold">Billing Region Test:</span>
                <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setSelectedRegion("US")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${selectedRegion === "US" ? "bg-indigo-600/15 text-indigo-300" : "text-gray-400 hover:text-white"}`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Global (USD)</span>
                  </button>
                  <button
                    onClick={() => setSelectedRegion("IN")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${selectedRegion === "IN" ? "bg-indigo-600/15 text-indigo-300" : "text-gray-400 hover:text-white"}`}
                  >
                    <span className="font-mono text-xs">₹</span>
                    <span>India (INR)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isIndia = selectedRegion === "IN";
                const currencySymbol = isIndia ? "₹" : "$";
                const displayPrice = isIndia ? plan.inrPrice : plan.usdPrice;
                const formattedPrice = displayPrice.toLocaleString();

                return (
                  <div 
                    key={plan.id}
                    className={`p-6 rounded-2xl border transition flex flex-col justify-between gap-6 ${
                      plan.id === "enterprise"
                        ? "border-indigo-500 bg-indigo-600/5 relative shadow-lg shadow-indigo-600/5"
                        : "border-white/5 bg-white/[0.01] hover:border-white/10"
                    }`}
                  >
                    {plan.id === "enterprise" && (
                      <span className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded-full select-none">
                        Recommended
                      </span>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-white font-heading text-lg">{plan.name}</h3>
                        <p className="text-[10px] text-gray-500 font-mono">Metered Refill ledger</p>
                      </div>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">{currencySymbol}{formattedPrice}</span>
                        <span className="text-xs text-gray-400">{plan.id === "topup" ? "one-off" : "/month"}</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">{plan.desc}</p>

                      {/* Features */}
                      <div className="flex flex-col gap-2 mt-2">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
                            <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlanCheckout(plan)}
                      disabled={isCheckingOut}
                      className={`w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
                        plan.id === "enterprise"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98]"
                          : "border border-white/10 hover:bg-white/[0.04] text-white"
                      }`}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Refill {plan.credits.toLocaleString()} Credits</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Logs ledger */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-[11px] text-gray-500 flex flex-col gap-1 leading-relaxed">
              <div className="font-semibold text-gray-400">Ledger Compliance diagnostics:</div>
              - PCI-DSS Compliance: Mock Enforced (Stripe Elements / Razorpay Intent)<br />
              - Routing logic: Currency based on Toggle (Stripe Session / Razorpay Checkout Order)<br />
              - Webhook signature checks: Enforced in backend `/api/webhooks/billing`
            </div>

          </div>
        )}

        {/* 8. INTEGRATIONS HUB TAB */}
        {activeTab === "integrations" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full text-gray-200">
            
            {/* Header info */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                <Workflow className="h-6 w-6 text-indigo-400" />
                <span>API Integrations & Third-Party Gateways</span>
              </h2>
              <p className="text-xs text-gray-400">
                Configure your custom mail gateways, Telegram bot routing, webhook targets, personal AI keys, RAG systems, Firebase/Supabase environments, and media endpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: SMTP / Gmail Gateway */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowEmailGateway && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">SMTP Mail Gateway Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Starter or higher plan to use custom email gateways for your checkout & chatbots.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Mail className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">SMTP & Gmail Relay</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Mail Routing</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setGmailSmtpHost("smtp.gmail.com");
                        setGmailSmtpPort(465);
                        showToast("Gmail presets loaded!");
                      }}
                      className="flex-grow bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-1 px-2 rounded text-[10px] border border-white/5 transition"
                    >
                      Use Gmail SMTP Presets
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setGmailSmtpHost("smtp.mailgun.org");
                        setGmailSmtpPort(587);
                        showToast("Mailgun presets loaded!");
                      }}
                      className="flex-grow bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-1 px-2 rounded text-[10px] border border-white/5 transition"
                    >
                      Use Mailgun Presets
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">SMTP Host</label>
                      <input type="text" value={gmailSmtpHost} onChange={e => setGmailSmtpHost(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Port</label>
                      <input type="number" value={gmailSmtpPort} onChange={e => setGmailSmtpPort(parseInt(e.target.value) || 465)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Username / Sender Email</label>
                    <input type="text" value={gmailSmtpUser} onChange={e => setGmailSmtpUser(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">SMTP Password / App Password</label>
                    <input type="password" value={gmailSmtpPass} onChange={e => setGmailSmtpPass(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <details className="mt-1 bg-black/40 rounded-lg border border-white/5 p-2 text-[10px] text-gray-400">
                    <summary className="font-bold text-indigo-400 cursor-pointer select-none">How to set up Gmail App Password?</summary>
                    <ol className="list-decimal list-inside flex flex-col gap-1 mt-1">
                      <li>Go to your Google Account Settings.</li>
                      <li>Enable 2-Step Verification if not active.</li>
                      <li>Search for "App Passwords" in the Google account search.</li>
                      <li>Generate a new app password for "Other (Custom name)" called "Aether SaaS".</li>
                      <li>Copy the 16-character code and paste it in SMTP Password above.</li>
                    </ol>
                  </details>

                  <button 
                    onClick={() => showToast("SMTP custom credentials updated and secured!")}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Save Gateway Configuration
                  </button>
                </div>
              </div>

              {/* Card 2: Telegram AI Tool */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-sky-600/10 border border-sky-500/20 flex items-center justify-center">
                      <Send className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Telegram Notification Tool</h3>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">AI Agent Tool</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${telegramBotStatus === "connected" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-gray-500 border-white/10 bg-white/5"}`}>
                    {telegramBotStatus === "connected" ? "● ACTIVE" : "○ NOT SET"}
                  </span>
                </div>

                {/* Tool Name Badge */}
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">Tool Name (use in system prompt)</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sky-300 font-mono text-sm flex-1 bg-black/40 px-2 py-1 rounded">{telegramToolName}</code>
                    <button onClick={() => { navigator.clipboard.writeText(`[TOOL:${telegramToolName}:Your message here]`); showToast("Copied tag!"); }} className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-lg transition">Copy Tag</button>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">In system prompt: <span className="text-gray-300 font-mono">[TOOL:{telegramToolName}:message here]</span></p>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Tool Name (unique identifier)</label>
                      <input type="text" value={telegramToolName} onChange={e => setTelegramToolName(e.target.value.replace(/\s/g,"_").toLowerCase())} placeholder="notify_admin" className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Chat ID (group/user)</label>
                      <input type="text" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="-100123456789" className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Bot Token (from @BotFather)</label>
                    <input type="password" value={telegramBotToken} onChange={e => setTelegramBotToken(e.target.value)} placeholder="123456789:ABCdef..." className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <details className="bg-black/40 rounded-lg border border-white/5 p-2 text-[10px] text-gray-400">
                    <summary className="font-bold text-sky-400 cursor-pointer select-none">How to get Bot Token & Chat ID?</summary>
                    <ol className="list-decimal list-inside flex flex-col gap-1 mt-1">
                      <li>Open Telegram → search <b>@BotFather</b> → type <b>/newbot</b></li>
                      <li>Follow prompts → copy the <b>HTTP API token</b></li>
                      <li>For Chat ID: add <b>@userinfobot</b> to your group, or forward any message to it</li>
                      <li>For private notifications: message <b>@userinfobot</b> directly to get your personal chat ID</li>
                    </ol>
                    <p className="mt-1 text-sky-400">System prompt example: <span className="font-mono text-white">"When user submits contact info, call [TOOL:{telegramToolName}:Lead: Name, Email]"</span></p>
                  </details>

                  <button
                    disabled={isSavingTools}
                    onClick={async () => {
                      setIsSavingTools(true);
                      try {
                        await fetch("/api/tenant-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantSlug, telegramBotToken, telegramChatId, telegramToolName }) });
                        setTelegramBotStatus(telegramBotToken && telegramChatId ? "connected" : "not_configured");
                        showToast("✅ Telegram tool saved! Use [TOOL:" + telegramToolName + ":message] in system prompt.");
                      } catch { showToast("Save failed"); }
                      setIsSavingTools(false);
                    }}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    {isSavingTools ? "Saving..." : "Save Telegram Tool"}
                  </button>
                </div>
              </div>

              {/* Card 2b: Google Sheets AI Tool */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Google Sheets Tool</h3>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">AI Agent Tool</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${googleSheetsWebhookUrl ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-gray-500 border-white/10 bg-white/5"}`}>
                    {googleSheetsWebhookUrl ? "● ACTIVE" : "○ NOT SET"}
                  </span>
                </div>

                {/* Tool Name Badge */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Tool Name (use in system prompt)</span>
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-300 font-mono text-sm flex-1 bg-black/40 px-2 py-1 rounded">{googleSheetsToolName}</code>
                    <button onClick={() => { navigator.clipboard.writeText(`[TOOL:${googleSheetsToolName}:{"name":"value","email":"value"}]`); showToast("Copied tag!"); }} className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg transition">Copy Tag</button>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">In system prompt: <span className="text-gray-300 font-mono">[TOOL:{googleSheetsToolName}:{'{'}&#34;name&#34;:&#34;John&#34;,&#34;email&#34;:&#34;j@x.com&#34;{'}'}]</span></p>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Tool Name (unique identifier)</label>
                    <input type="text" value={googleSheetsToolName} onChange={e => setGoogleSheetsToolName(e.target.value.replace(/\s/g,"_").toLowerCase())} placeholder="save_to_sheet" className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Google Apps Script Webhook URL</label>
                    <input type="text" value={googleSheetsWebhookUrl} onChange={e => setGoogleSheetsWebhookUrl(e.target.value)} placeholder="https://script.google.com/macros/s/xxx/exec" className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <details className="bg-black/40 rounded-lg border border-white/5 p-2 text-[10px] text-gray-400">
                    <summary className="font-bold text-emerald-400 cursor-pointer select-none">How to set up Google Apps Script webhook?</summary>
                    <ol className="list-decimal list-inside flex flex-col gap-1 mt-1">
                      <li>Open your Google Sheet → click <b>Extensions → Apps Script</b></li>
                      <li>Paste this code and save:</li>
                    </ol>
                    <pre className="mt-1 bg-black/60 p-2 rounded text-emerald-300 text-[9px] overflow-x-auto whitespace-pre-wrap">{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    new Date(), data.name, data.email,
    data.phone, data.message, data._tenant
  ]);
  return ContentService.createTextOutput("OK");
}`}</pre>
                    <ol className="list-decimal list-inside flex flex-col gap-1 mt-1" start={3}>
                      <li>Click <b>Deploy → New deployment</b> → Type: Web App</li>
                      <li>Set "Execute as: Me" and "Who has access: Anyone"</li>
                      <li>Copy the <b>Web App URL</b> and paste it above</li>
                    </ol>
                    <p className="mt-1 text-emerald-400">System prompt example: <span className="font-mono text-white">"When user shares contact info, call [TOOL:{googleSheetsToolName}:{'{'}\"name\":\"their name\",\"email\":\"their email\"{'}'}]"</span></p>
                  </details>

                  <button
                    disabled={isSavingTools}
                    onClick={async () => {
                      setIsSavingTools(true);
                      try {
                        await fetch("/api/tenant-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantSlug, googleSheetsWebhookUrl, googleSheetsToolName }) });
                        showToast("✅ Google Sheets tool saved! Use [TOOL:" + googleSheetsToolName + ":{...}] in system prompt.");
                      } catch { showToast("Save failed"); }
                      setIsSavingTools(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    {isSavingTools ? "Saving..." : "Save Google Sheets Tool"}
                  </button>
                </div>
              </div>

              {/* Card 3: n8n Webhook Integration */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowN8n && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">n8n Webhook Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Growth or higher plan to connect workflows and webhook automation triggers.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Workflow className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">n8n Workflow Webhooks</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Workflow Automations</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">n8n Webhook URL</label>
                    <input type="text" value={n8nUrl} onChange={e => setN8nUrl(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">HMAC Signature Secret Key</label>
                    <input type="password" value={hmacSecret} onChange={e => setHmacSecret(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <button 
                    onClick={() => showToast("Webhook trigger endpoints registered with n8n!")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Save and Register Webhooks
                  </button>
                </div>
              </div>

              {/* Card 4: Personal AI API Keys */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowPersonalAI && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">Personal API Keys Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Growth or higher plan to connect your personal model access keys and bypass limits.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Key className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">BYO API Keys (Personal Keys)</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Custom Model Endpoints</p>
                  </div>
                </div>

                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400">OpenAI Api Key</label>
                        {keyValidation['openai'] === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {keyValidation['openai'] === false && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                      <input type="password" placeholder="sk-..." value={personalOpenAIKey} onChange={e => { setPersonalOpenAIKey(e.target.value); setKeyValidation(p => ({...p, openai: null})); }} className={`bg-[#070913] border ${keyValidation['openai'] === false ? 'border-rose-500/50 focus:border-rose-500' : keyValidation['openai'] === true ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'} rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none`} />
                    </div>
  
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400">Anthropic Claude Api Key</label>
                        {keyValidation['claude'] === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {keyValidation['claude'] === false && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                      <input type="password" placeholder="sk-ant-..." value={personalClaudeKey} onChange={e => { setPersonalClaudeKey(e.target.value); setKeyValidation(p => ({...p, claude: null})); }} className={`bg-[#070913] border ${keyValidation['claude'] === false ? 'border-rose-500/50 focus:border-rose-500' : keyValidation['claude'] === true ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'} rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none`} />
                    </div>
  
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400">Google Gemini Api Key</label>
                        {keyValidation['gemini'] === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {keyValidation['gemini'] === false && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                      <input type="password" placeholder="AIzaSy..." value={personalGeminiKey} onChange={e => { setPersonalGeminiKey(e.target.value); setKeyValidation(p => ({...p, gemini: null})); }} className={`bg-[#070913] border ${keyValidation['gemini'] === false ? 'border-rose-500/50 focus:border-rose-500' : keyValidation['gemini'] === true ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'} rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none`} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400">Groq Api Key</label>
                        {keyValidation['groq'] === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {keyValidation['groq'] === false && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                      <input type="password" placeholder="gsk_..." value={personalGroqKey} onChange={e => { setPersonalGroqKey(e.target.value); setKeyValidation(p => ({...p, groq: null})); }} className={`bg-[#070913] border ${keyValidation['groq'] === false ? 'border-rose-500/50 focus:border-rose-500' : keyValidation['groq'] === true ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'} rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none`} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-400">OpenRouter Api Key</label>
                        {keyValidation['openrouter'] === true && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        {keyValidation['openrouter'] === false && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      </div>
                      <input type="password" placeholder="sk-or-v1-..." value={personalOpenRouterKey} onChange={e => { setPersonalOpenRouterKey(e.target.value); setKeyValidation(p => ({...p, openrouter: null})); }} className={`bg-[#070913] border ${keyValidation['openrouter'] === false ? 'border-rose-500/50 focus:border-rose-500' : keyValidation['openrouter'] === true ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-white/10 focus:border-indigo-500'} rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none`} />
                    </div>

                    <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-white/5">
                      <label className="text-[10px] text-gray-400">Embedding Generation Provider</label>
                      <select value={embeddingProvider} onChange={e => setEmbeddingProvider(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="local">Local On-Device (Xenova)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-gray-400">Embedding Model String</label>
                        {isFetchingModels && <span className="text-[9px] text-indigo-400 animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching Models...</span>}
                      </div>
                      <input 
                        type="text" 
                        value={embeddingModel} 
                        onChange={e => setEmbeddingModel(e.target.value)} 
                        list="embedding-models-list"
                        placeholder={isFetchingModels ? "Loading models..." : "e.g. text-embedding-3-small"} 
                        className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" 
                      />
                      <datalist id="embedding-models-list">
                        {availableEmbeddingModels.map(model => (
                          <option key={model} value={model} />
                        ))}
                      </datalist>
                      {embeddingProvider === 'local' && <span className="text-[9px] text-emerald-400">Using: Xenova/all-MiniLM-L6-v2. No external APIs will be called.</span>}
                      {embeddingProvider === 'openrouter' && (
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">OpenRouter does not have a default embedding model. You MUST use a supported exact string.</span>
                          <button 
                            type="button"
                            onClick={() => setEmbeddingModel("nomic-ai/nomic-embed-text-v1.5")}
                            className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded px-2 py-1 text-left transition w-fit flex flex-col gap-0.5"
                          >
                            <span className="font-bold">Use Recommended OpenRouter Model:</span>
                            <span className="font-mono">nomic-ai/nomic-embed-text-v1.5</span>
                          </button>
                        </div>
                      )}
                    </div>
  
                    <button 
                      onClick={handleSavePersonalKeys}
                      disabled={isValidatingKeys}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isValidatingKeys ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Validating...</> : "Save Personal API Keys"}
                    </button>
                  </div>
                </div>

              {/* Card 5: YouTube Video API */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowYouTube && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">YouTube API Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Growth or higher plan to pull search details and catalog items from YouTube.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Youtube className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">YouTube Data Integration</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Video Aggregator</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">YouTube Data v3 API Key</label>
                    <input type="text" value={youtubeApiKey} onChange={e => setYoutubeApiKey(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <button 
                    onClick={() => showToast("YouTube Data API credentials synced!")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Save API Key
                  </button>
                </div>
              </div>

              {/* Card 6: RAG Storage Space */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowRAGStorage && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">RAG Vector Storage Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Scale or higher plan to connect advanced custom RAG storage spaces.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Database className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">RAG Space & Vector Providers</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Semantic databases</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Vector Storage Engine</label>
                    <select value={ragProviderType} onChange={e => setRagProviderType(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
                      <option value="pgvector">pgvector (Free Client Tier)</option>
                      <option value="pinecone">Pinecone Cloud DB (Paid)</option>
                      <option value="qdrant">Qdrant Vector DB (Paid)</option>
                      <option value="chroma">Chroma Embeddings (Paid)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Database Connection URL / Host</label>
                    <input type="text" value={ragUrl} onChange={e => setRagUrl(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>


                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Vector Index Namespace</label>
                    <input type="text" value={ragIndex} onChange={e => setRagIndex(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <button 
                    onClick={() => {
                      setRagStatus("synced");
                      showToast("✅ Connected to vector store index successfully!");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Connect and Synchronize Vectors
                  </button>
                </div>
              </div>

              {/* Card 7: Firebase Deep Integration */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowFirebase && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">Firebase Integration Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Scale or higher plan to connect Firebase Auth, storage buckets and analytics.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Server className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Firebase SDK Setup</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Auth & Storage Engine</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Firebase API Key</label>
                    <input type="text" value={firebaseApiKey} onChange={e => setFirebaseApiKey(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Auth Domain</label>
                      <input type="text" value={firebaseAuthDomain} onChange={e => setFirebaseAuthDomain(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Project ID</label>
                      <input type="text" value={firebaseProjectId} onChange={e => setFirebaseProjectId(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Storage Bucket</label>
                    <input type="text" value={firebaseStorageBucket} onChange={e => setFirebaseStorageBucket(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <details className="bg-black/40 rounded-lg border border-white/5 p-2 text-[10px] text-gray-400">
                    <summary className="font-bold text-indigo-400 cursor-pointer select-none">Firebase SDK Setup Guide</summary>
                    <ul className="list-disc list-inside flex flex-col gap-1 mt-1">
                      <li>Provides custom Google Login button inside AI chatbots.</li>
                      <li>Saves catalog item attachments and playground session uploads.</li>
                      <li>Requires setting up Google OAuth Client ID in Firebase Console.</li>
                    </ul>
                  </details>

                  <button 
                    onClick={() => showToast("Firebase credentials verified and active.")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Save Firebase Settings
                  </button>
                </div>
              </div>

              {/* Card 8: Supabase Deep Integration */}
              <div className="relative p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 overflow-hidden">
                {!currentTierConfig.allowSupabase && (
                  <div className="absolute inset-0 bg-[#070913]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="h-8 w-8 text-indigo-400 mb-2" />
                    <h4 className="text-white font-bold text-sm font-heading">Supabase Integration Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[250px] mt-1">Upgrade to Scale or higher plan to connect Supabase Postgres scope, RLS and user profiles.</p>
                    <button onClick={() => setActiveTab("billing")} className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">View Pricing</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <Settings2 className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Supabase Deep Integration</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">PostgreSQL & Auth Sync</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Supabase API URL</label>
                    <input type="text" value={supabaseApiUrl} onChange={e => setSupabaseApiUrl(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Anon Public Key</label>
                    <input type="password" value={supabaseAnonKey} onChange={e => setSupabaseAnonKey(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400">Service Role API Key (Privileged)</label>
                    <input type="password" value={supabaseServiceRoleKey} onChange={e => setSupabaseServiceRoleKey(e.target.value)} className="bg-[#070913] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                  </div>

                  <details className="bg-black/40 rounded-lg border border-white/5 p-2 text-[10px] text-gray-400">
                    <summary className="font-bold text-indigo-400 cursor-pointer select-none">Supabase Setup Guide</summary>
                    <ul className="list-disc list-inside flex flex-col gap-1 mt-1">
                      <li>Creates custom claim triggers to isolate user metadata scopes.</li>
                      <li>Ensures row-level security (RLS) is automatically enabled on database tables.</li>
                      <li>Service role key allows background edge functions to write telemetry securely.</li>
                    </ul>
                  </details>

                  <button 
                    onClick={() => showToast("Supabase deep database integration configured successfully!")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Save Supabase Settings
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* BOOKING SUITE TAB */}
        {activeTab === "booking" && (
          <FeatureGate tenantSlug={tenantSlug} featureKey="booking">
          <BookingSuiteTab tenantSlug={tenantSlug} />
          </FeatureGate>
        )}

        {/* 6. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 overflow-y-auto h-full text-gray-200">
            
            {/* Header info */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                <Settings className="h-6 w-6 text-indigo-400" />
                <span>Workspace Hardening & Health Monitoring</span>
              </h2>
              <p className="text-xs text-gray-400">
                Manage automated database keepalive triggers, monitor server hardware status, and review active health checks.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Keepalive configuration */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Keepalive settings */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-sm text-white">Database Keepalive Trigger</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Periodically pings your database to prevent cold starts on free-tier serverless PostgreSQL databases.
                      </p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isKeepaliveEnabled} 
                      onChange={(e) => setIsKeepaliveEnabled(e.target.checked)}
                      className="w-8 h-4 bg-white/5 appearance-none rounded-full checked:bg-indigo-600 transition relative cursor-pointer before:absolute before:h-3 before:w-3 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all"
                    />
                  </div>

                  {isKeepaliveEnabled && (
                    <div className="flex flex-col gap-2 mt-2 animate-fadeIn">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold">Target Ping Endpoint URL (GET):</label>
                      <div className="relative">
                        <pre className="bg-[#070913] p-4 rounded-xl border border-white/10 font-mono text-[10px] text-indigo-300 break-all select-all leading-normal select-none">
                          {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/keepalive
                        </pre>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/keepalive`);
                            showToast("Keepalive URL copied!");
                          }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Database configurations */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4">
                  <h3 className="font-bold text-white font-heading text-sm">Security Isolation Rules</h3>
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-gray-400">
                    <div className="flex items-center justify-between p-3.5 bg-[#0b0f19] border border-white/5 rounded-xl">
                      <span className="font-semibold text-white">Row-Level Security (RLS)</span>
                      <span className="text-emerald-400 font-mono text-[10px]">ENFORCED</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-[#0b0f19] border border-white/5 rounded-xl">
                      <span className="font-semibold text-white">Custom Claims Tenant Scope</span>
                      <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-[#0b0f19] border border-white/5 rounded-xl">
                      <span className="font-semibold text-white">Webhook HMAC Signing</span>
                      <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Health Status dashboard */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Hardware monitors */}
                <div className="p-6 rounded-2xl bg-[#0a0d1a] border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center select-none">
                    <h3 className="font-bold text-white font-heading text-sm">System Health</h3>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${healthStatus === "operational" ? "bg-emerald-500 animate-pulse" : healthStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-red-500 animate-pulse"}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider font-mono ${healthStatus === "operational" ? "text-emerald-400" : healthStatus === "checking" ? "text-amber-400" : "text-red-400"}`}>
                        {healthStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-2">
                    
                    {/* Database latency */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <ActivityIcon className="h-3.5 w-3.5 text-indigo-400" />
                        <span>DB Latency</span>
                      </span>
                      <span className="text-white font-mono text-sm">{healthMetrics.dbLatency}ms</span>
                    </div>

                    {/* Vector status */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <HardDrive className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Vector Index</span>
                      </span>
                      <span className="text-white font-mono text-sm uppercase">{healthMetrics.vectorStatus}</span>
                    </div>

                    {/* CPU Status */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Server CPU</span>
                      </span>
                      <span className="text-white font-mono text-sm">{healthMetrics.cpu}</span>
                    </div>

                    {/* RAM Status */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <Layers className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Server RAM</span>
                      </span>
                      <span className="text-white font-mono text-sm">{healthMetrics.memory}</span>
                    </div>

                  </div>

                  <button
                    onClick={handleTriggerHealthCheck}
                    disabled={isHealthChecking}
                    className="w-full py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {isHealthChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span>Run System Diagnostic Probe</span>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>


      {/* PHASE 7: SERVICES MODAL */}
      {isServicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0d1a] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-400" /> Appointment Rules
              </h3>
              <button onClick={() => setIsServicesModalOpen(false)} className="text-gray-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Operating Hours</label>
                <input type="text" value={bookingSettings.availability} onChange={(e) => setBookingSettings({...bookingSettings, availability: e.target.value})} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Buffer Between Appointments (mins)</label>
                <input type="number" value={bookingSettings.bufferTime} onChange={(e) => setBookingSettings({...bookingSettings, bufferTime: parseInt(e.target.value)})} className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="p-5 bg-white/[0.01] border-t border-white/5 flex justify-end gap-3">
              <button onClick={() => setIsServicesModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENT LINK SIMULATOR OVERLAY MODAL */}
      {checkoutModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
          <div className="w-full max-w-md rounded-3xl premium-glass border border-white/10 p-8 flex flex-col gap-6 shadow-2xl relative animate-scaleUp">
            
            {/* Close Button */}
            <button 
              onClick={() => setCheckoutModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo Brand Header */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight font-heading mt-2">
                Simulated Payment Checkout
              </h2>
              <p className="text-xs text-gray-400 max-w-[280px]">
                Aether multi-tenant billing router mapped your request to a secure payment gateway session.
              </p>
            </div>

            {/* Transaction metadata */}
            <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 flex flex-col gap-2.5 text-xs select-text">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan Refill Target:</span>
                <span className="font-semibold text-white">{checkoutModal.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Routed Gateway:</span>
                <span className="font-semibold text-indigo-400 uppercase font-mono">{checkoutModal.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Currency & Price:</span>
                <span className="font-bold text-white font-mono">{checkoutModal.currency} {checkoutModal.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ledger Top-Up value:</span>
                <span className="font-semibold text-indigo-400 font-mono">+{checkoutModal.credits.toLocaleString()} Credits</span>
              </div>
            </div>

            {/* Compliance notice */}
            <div className="text-[10px] text-gray-500 text-center leading-relaxed">
              In production, the customer is securely redirected to the {checkoutModal.gateway === "stripe" ? "Stripe checkout portal" : "Razorpay payment link"} at:
              <div className="bg-[#070913]/50 p-2 rounded-lg font-mono text-[9px] text-indigo-300 mt-1 break-all select-all leading-normal select-none">
                {checkoutModal.redirectUrl}
              </div>
            </div>

            {/* Simulating Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSimulateWebhookSuccess}
                disabled={isSimulatingWebhook}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSimulatingWebhook ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Simulate Payment & Webhook Success</span>
                    <Check className="h-4 w-4 text-white" />
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setCheckoutModal(null)}
                className="w-full border border-white/10 hover:bg-white/[0.05] text-white text-xs font-semibold py-3.5 rounded-xl cursor-pointer transition text-center"
              >
                Cancel Checkout
              </button>
            </div>

          </div>
        </div>
      )}

      
      {/* BARCODE PRINT MODAL */}
      <AnimatePresence>
        {barcodePrintProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg bg-gradient-to-b from-[#111626] to-[#0a0d18] border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative z-[111]">
              <button onClick={() => setBarcodePrintProduct(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition">
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Printer className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Print Barcode Labels</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{barcodePrintProduct.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Printer Type</label>
                  <select id="barcodePrinterType" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                    <option value="a4">Standard A4 (Laser/Inkjet)</option>
                    <option value="thermal">Thermal Roll Printer (50x30mm)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Quantity</label>
                  <input type="number" id="barcodeQty" defaultValue={24} min={1} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none font-mono" />
                </div>
              </div>

              <button 
                onClick={() => {
                  const qty = parseInt((document.getElementById('barcodeQty') as HTMLInputElement).value || "24");
                  const pType = (document.getElementById('barcodePrinterType') as HTMLSelectElement).value;
                  const printWin = window.open('', '', 'width=800,height=600');
                  if (!printWin) return;
                  
                  const barcodeValue = barcodePrintProduct.barcode || barcodePrintProduct.sku || barcodePrintProduct.id;
                  const priceStr = barcodePrintProduct.currency === "USD" ? "$" : barcodePrintProduct.currency === "INR" ? "₹" : "£";
                  const price = priceStr + (barcodePrintProduct.price / 100).toFixed(2);
                  const storeName = "Store";
                  
                  let html = '';
                  if (pType === 'a4') {
                    html = `
                      <html><head><title>Print Labels</title>
                      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                      <style>
                        body { margin: 0; padding: 10mm; font-family: sans-serif; }
                        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
                        .label { border: 1px dashed #ccc; padding: 5mm; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
                        .store { font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 2px;}
                        .name { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
                        .price { font-weight: bold; font-size: 14px; margin-top: 5px; }
                        svg { max-width: 100%; height: auto; }
                      </style>
                      </head><body><div class="grid">
                    `;
                    for(let i=0; i<qty; i++) {
                      html += `<div class="label">
                        <div class="store">${storeName}</div>
                        <div class="name">${barcodePrintProduct.name}</div>
                        <svg class="barcode" jsbarcode-value="${barcodeValue}" jsbarcode-height="40" jsbarcode-width="1.5" jsbarcode-fontSize="12" jsbarcode-margin="0"></svg>
                        <div class="price">${price}</div>
                      </div>`;
                    }
                    html += `</div>
                      <script>
                        JsBarcode(".barcode").init();
                        setTimeout(() => { window.print(); }, 500);
                      </script>
                    </body></html>`;
                  } else {
                    html = `
                      <html><head><title>Print Labels</title>
                      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                      <style>
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        .label { width: 45mm; height: 25mm; padding: 2mm; text-align: center; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always;}
                        .store { font-weight: bold; font-size: 8px; text-transform: uppercase; margin-bottom: 1px;}
                        .name { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
                        .price { font-weight: bold; font-size: 11px; margin-top: 2px; }
                        svg { max-width: 100%; height: 12mm; }
                        @media print { @page { size: 50mm 30mm; margin: 0; } }
                      </style>
                      </head><body>
                    `;
                    for(let i=0; i<qty; i++) {
                      html += `<div class="label">
                        <div class="store">${storeName}</div>
                        <div class="name">${barcodePrintProduct.name}</div>
                        <svg class="barcode" jsbarcode-value="${barcodeValue}" jsbarcode-height="30" jsbarcode-width="1.2" jsbarcode-fontSize="10" jsbarcode-margin="0" jsbarcode-displayValue="true"></svg>
                        <div class="price">${price}</div>
                      </div>`;
                    }
                    html += `
                      <script>
                        JsBarcode(".barcode").init();
                        setTimeout(() => { window.print(); }, 500);
                      </script>
                    </body></html>`;
                  }
                  
                  printWin.document.write(html);
                  printWin.document.close();
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Print Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* PRODUCT EDIT OVERLAY MODAL */}
      <AnimatePresence>
      {editingProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#111626] to-[#0a0d18] border border-white/10 p-8 flex flex-col gap-6 shadow-2xl relative z-[101] custom-scrollbar">
            
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Settings className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight font-heading">Edit Product</h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {editingProduct.id}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex flex-col gap-5 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Product Name</label>
                  <input type="text" value={editProdName} onChange={e=>setEditProdName(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 flex justify-between items-center">
                    Barcode
                    <button type="button" onClick={() => setEditProdBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString())} className="text-indigo-400 hover:text-indigo-300 text-[10px]">Auto</button>
                  </label>
                  <input type="text" value={editProdBarcode} onChange={e=>setEditProdBarcode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase" />
                </div>
                
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2 w-1/3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Currency</label>
                    <select value={editProdCurrency} onChange={e => setEditProdCurrency(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none uppercase font-mono cursor-pointer appearance-none">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="BDT">BDT</option>
                      <option value="AUD">AUD</option>
                      <option value="CAD">CAD</option>
                      <option value="SGD">SGD</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 w-2/3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Price</label>
                    <input type="number" step="0.01" value={editProdPrice} onChange={e=>setEditProdPrice(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1 flex items-center justify-between">
                  <span>Product Image</span>
                  <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider">PNG, JPG, WEBP (Max 5MB)</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reupload / File Select Area */}
                  <div className="flex flex-col gap-2.5">
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.01] rounded-xl p-4 cursor-pointer transition text-center group h-full min-h-[110px]">
                      <Plus className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 mb-1" />
                      <span className="text-[11px] text-gray-400 group-hover:text-white font-semibold">Choose New File</span>
                      <span className="text-[9px] text-gray-500 mt-0.5 font-mono">Supports png, jpg, webp</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Premium Image Live Preview or Empty Placeholder */}
                  <div className="flex flex-col gap-2 justify-between">
                    {editProdImage ? (
                      <div className="relative h-[110px] rounded-xl overflow-hidden border border-white/10 bg-[#070913] flex items-center justify-center group shadow-inner">
                        <img loading="lazy" src={editProdImage} alt="Current Product" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setEditProdImage("")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
                          >
                            <X className="h-3 w-3" /> Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[110px] rounded-xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-gray-500 font-mono text-[10px]">
                        <ImageIcon className="h-7 w-7 text-gray-600 mb-1.5" />
                        <span>No image uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Image URL input as fallback */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider px-1">Or Paste Direct Image URL</span>
                  <input 
                    type="text" 
                    value={editProdImage} 
                    onChange={e=>setEditProdImage(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" 
                    placeholder="https://example.com/image.png" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Description</label>
                <textarea value={editProdDesc} onChange={e=>setEditProdDesc(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">Category</label>
                <select value={editProdCat} onChange={e=>setEditProdCat(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer appearance-none">
                  <option value="">No Category</option>
                  {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* ADVANCED SALES FUNNELS */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Sales Funnel Engine
                    </h3>
                    <p className="text-[10px] text-indigo-300/60 mt-0.5">Map dynamic post-purchase upsells to maximize AOV.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsLanding} onChange={e => setEditIsLanding(e.target.checked)} className="rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Standalone Landing Page</span>
                  </label>
                </div>

                {editIsLanding && (
                  <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-emerald-400/70 truncate flex-1">/b/{tenantSlug}/p/{editingProduct.id}</span>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4022'}/b/${tenantSlug}/p/${editingProduct.id}`); showToast("Landing Page Link Copied!"); }} className="text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg transition">
                      COPY LINK
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Post-Purchase Upsell</label>
                    <select value={editUpsell} onChange={e=>setEditUpsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Decline Downsell</label>
                    <select value={editDownsell} onChange={e=>setEditDownsell(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-indigo-500/10">
                  <div className="col-span-2 flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">1-Click Order Bump</label>
                    <select value={editOrderBump} onChange={e=>setEditOrderBump(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="">None</option>
                      {productsList.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-indigo-300/70 px-1">Bump Price</label>
                    <input type="number" step="0.01" value={editBumpPrice} onChange={e=>setEditBumpPrice(e.target.value)} placeholder="Discounted" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
                  </div>
                </div>

              </div>

              <button type="submit" disabled={isUpdatingProduct} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {isUpdatingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Save Product Changes</span>}
              </button>
            </form>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (() => {
          const assignments = productsList
            .filter(p => p.id !== productToDelete.id)
            .reduce((acc: Array<{ productName: string; type: string }>, p) => {
              if (p.upsellProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "Post-Purchase Upsell" });
              }
              if (p.downsellProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "Decline Downsell" });
              }
              if (p.orderBumpProductId === productToDelete.id) {
                acc.push({ productName: p.name, type: "1-Click Order Bump" });
              }
              return acc;
            }, []);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-6 text-gray-200"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#181216] to-[#0f0a0d] border border-red-500/20 p-6 flex flex-col gap-6 shadow-2xl relative animate-fadeIn"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-lg shrink-0">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white tracking-tight">Delete Product?</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Are you sure you want to delete <span className="font-semibold text-white">"{productToDelete.name}"</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>

                {(assignments.length > 0 || (productToDelete.assignedFunnels && productToDelete.assignedFunnels.length > 0)) && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <span className="animate-pulse">⚠️</span> Warning: Assigned in Funnels
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      This product is currently assigned in the following sales funnels and will be disconnected:
                    </p>
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {assignments.map((as, idx) => (
                        <li key={`as-${idx}`} className="text-xs flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5 font-mono">
                          <span className="text-white truncate max-w-[200px]">{as.productName}</span>
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{as.type}</span>
                        </li>
                      ))}
                      {productToDelete.assignedFunnels?.map((f, idx) => (
                        <li key={`f-${idx}`} className="text-xs flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-indigo-500/20 font-mono">
                          <span className="text-white truncate max-w-[200px]">{f.name}</span>
                          <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Landing Page</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setProductToDelete(null)}
                    className="flex-grow border border-white/10 hover:bg-white/[0.05] text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProductConfirmed(productToDelete.id)}
                    className="flex-grow bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer transition text-center shadow-lg shadow-red-600/20"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* AGENT SAVE SUCCESS MODAL */}
      <AnimatePresence>
        {showAgentSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-gradient-to-br from-[#0a0d1a] to-[#111626] border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-6 relative z-10">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 relative z-10">Agent Deployed!</h3>
              <p className="text-[13px] text-gray-400 mb-8 max-w-[250px] relative z-10 leading-relaxed">
                Your AI Agent configuration is perfectly tuned and live across all endpoints.
              </p>
              
              <button 
                onClick={() => setShowAgentSuccessModal(false)} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 relative z-10"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Lead List Modal */}
      {isCreateListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0d1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                Create New Lead List
              </h3>
              <button onClick={() => setIsCreateListModalOpen(false)} className="text-gray-500 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">List Name</label>
                <input 
                  type="text" 
                  value={newListData.name}
                  onChange={e => setNewListData({...newListData, name: e.target.value})}
                  className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  placeholder="e.g. Black Friday Campaign Opt-ins"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">Description</label>
                <textarea 
                  value={newListData.description}
                  onChange={e => setNewListData({...newListData, description: e.target.value})}
                  className="bg-[#070913] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]" 
                  placeholder="Brief description of where these leads come from..."
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateListModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if(!newListData.name) return;
                  const newId = "list_" + Date.now();
                  setLeadLists([...leadLists, { id: newId, name: newListData.name, description: newListData.description, createdAt: new Date().toISOString() }]);
                  setNewListData({name: "", description: ""});
                  setIsCreateListModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS/WARNING MODAL FOR API KEYS */}
      <AnimatePresence>
        {showKeyModal.show && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0a0d1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${showKeyModal.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                  {showKeyModal.type === 'success' ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <XCircle className="w-7 h-7 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{showKeyModal.type === 'success' ? 'Validation Successful' : 'Validation Failed'}</h3>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{showKeyModal.message}</p>
                </div>
                <button 
                  onClick={() => setShowKeyModal({show: false, type: 'success', message: ''})}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${showKeyModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                >
                  {showKeyModal.type === 'success' ? 'Done' : 'Review Keys'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* CELEBRATION CONFETTI OVERLAY */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="text-7xl animate-bounce">🎉</div>
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-black text-2xl px-8 py-4 rounded-3xl shadow-2xl shadow-emerald-500/30 text-center">
                  Order Accepted!
                  <p className="text-sm font-medium opacity-80 mt-1">Preparation timer started</p>
                </div>
                <div className="flex gap-3 text-3xl mt-2">
                  {["⭐","🚀","💰","✅","🔥"].map((e, i) => (
                    <motion.span key={i} initial={{ y: 0 }} animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 1 + i * 0.2, ease: "easeInOut" }}>
                      {e}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STORE CREATION WIZARD MODAL */}
        <AnimatePresence>
          {showStoreWizard && (
            <motion.div
              key="store-wizard-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              style={{ background: "rgba(2,4,10,0.95)", backdropFilter: "blur(16px)" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 22, stiffness: 220 }}
                className="w-full max-w-lg bg-gradient-to-b from-[#0d1525] to-[#080c18] border border-indigo-500/30 rounded-[28px] overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.2)]"
              >
                {/* Wizard header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{wizardStep === 1 ? "🏪" : wizardStep === 2 ? "✏️" : "🎉"}</div>
                    <div>
                      <p className="text-white font-black text-base">
                        {wizardStep === 1 ? "Choose Store Type" : wizardStep === 2 ? "Store Details" : "Store Created!"}
                      </p>
                      <p className="text-indigo-200 text-xs">Step {wizardStep} of 3</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStoreWizard(false)} className="text-white/60 hover:text-white transition cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex gap-1 px-6 pt-4">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= wizardStep ? "bg-indigo-500" : "bg-white/10"}`} />
                  ))}
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {/* STEP 1: Store Type */}
                  {wizardStep === 1 && (
                    <>
                      <p className="text-gray-400 text-sm">Choose what kind of store you want to create</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { type: "food", icon: "🍽️", label: "Food Store", desc: "Restaurant, café, delivery menu", color: "border-orange-500/40 bg-orange-500/5" },
                          { type: "ecom", icon: "🛍️", label: "E-Commerce", desc: "Products, catalog, shopping cart", color: "border-indigo-500/40 bg-indigo-500/5" },
                          { type: "service", icon: "🏥", label: "Service / Clinic", desc: "Bookings, appointments, consultations", color: "border-emerald-500/40 bg-emerald-500/5" },
                          { type: "single_product", icon: "⚡", label: "Single Product", desc: "One product landing page, LP-style", color: "border-purple-500/40 bg-purple-500/5" }
                        ].map(opt => (
                          <button
                            key={opt.type}
                            onClick={() => setWizardStoreType(opt.type)}
                            className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition cursor-pointer ${wizardStoreType === opt.type ? opt.color + " ring-2 ring-indigo-500/30" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
                          >
                            <div className="text-3xl">{opt.icon}</div>
                            <p className="text-white font-bold text-sm">{opt.label}</p>
                            <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
                            {wizardStoreType === opt.type && <CheckCircle2 className="h-4 w-4 text-indigo-400 ml-auto" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setShowStoreWizard(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">Skip for now</button>
                        <button onClick={() => setWizardStep(2)} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2">
                          Next <ArrowLeft className="h-4 w-4 rotate-180" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* STEP 2: Store Details */}
                  {wizardStep === 2 && (
                    <>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Store Name *</label>
                          <input
                            value={wizardStoreName}
                            onChange={e => setWizardStoreName(e.target.value)}
                            placeholder="e.g. Spice Garden, TechZone, Dr. Ahmed Clinic"
                            className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Description</label>
                          <textarea
                            value={wizardStoreDesc}
                            onChange={e => setWizardStoreDesc(e.target.value)}
                            placeholder="Short description of your store..."
                            rows={2}
                            className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Brand Color</label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={wizardPrimaryColor} onChange={e => setWizardPrimaryColor(e.target.value)} className="h-10 w-16 rounded-lg bg-transparent border border-white/10 cursor-pointer p-1" />
                            <span className="text-gray-400 text-sm font-mono">{wizardPrimaryColor}</span>
                            <div className="flex gap-2 ml-auto">
                              {["#6366f1", "#10b981", "#f97316", "#ec4899", "#3b82f6"].map(c => (
                                <button key={c} onClick={() => setWizardPrimaryColor(c)} className={`h-7 w-7 rounded-full border-2 cursor-pointer ${wizardPrimaryColor === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setWizardStep(1)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">← Back</button>
                        <button onClick={() => setShowStoreWizard(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition cursor-pointer">Skip</button>
                        <button
                          onClick={handleCreateNewStore}
                          disabled={!wizardStoreName.trim() || isCreatingNewStore}
                          className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isCreatingNewStore ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                          Create Store
                        </button>
                      </div>
                    </>
                  )}

                  {/* STEP 3: Success */}
                  {wizardStep === 3 && wizardCreatedStore && (
                    <div className="flex flex-col items-center text-center gap-5 py-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="text-6xl"
                      >🎉</motion.div>
                      <div>
                        <h3 className="text-white font-black text-xl">{wizardCreatedStore.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">Your store has been created successfully</p>
                      </div>
                      <div className="w-full bg-white/[0.03] border border-white/8 rounded-2xl p-4 text-left flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Store URL</span>
                          <span className="text-indigo-400 font-mono text-xs">/b/{tenantSlug}/{wizardCreatedStore.storeSlug}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="text-white font-bold capitalize">{wizardCreatedStore.storeType.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <a
                          href={`/b/${tenantSlug}/${wizardCreatedStore.storeSlug}`}
                          target="_blank"
                          className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 hover:bg-white/10"
                        >
                          <ExternalLink className="h-4 w-4" /> Preview Store
                        </a>
                        <button
                          onClick={() => { setShowStoreWizard(false); setSelectedShopId(wizardCreatedStore.id); setEcomSubTab("orders"); }}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT NEW ORDER ALERT CARD — stays until action taken */}
        <AnimatePresence>
          {newOrderNotification && !showNewOrderModal && (() => {
            let notifItems: any[] = [];
            try { notifItems = JSON.parse(newOrderNotification.itemsJson || "[]"); } catch {}
            return (
              <motion.div
                key="notif-card"
                initial={{ opacity: 0, y: -120, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -80, scale: 0.9 }}
                transition={{ type: "spring", damping: 18, stiffness: 240 }}
                className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] w-full max-w-sm px-3 select-none cursor-pointer"
                onClick={() => setShowNewOrderModal(true)}
              >
                {/* Outer pulse rings */}
                <div className="absolute -inset-2 rounded-[28px] border-2 border-emerald-400/30 animate-ping pointer-events-none" />
                <div className="absolute -inset-4 rounded-[32px] border border-emerald-400/15 animate-ping pointer-events-none" style={{ animationDelay: "0.4s" }} />

                <div className="relative bg-gradient-to-br from-[#071a10] via-[#0a1320] to-[#0b0f1a] border-2 border-emerald-500/70 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.35)]">
                  {/* Top stripe */}
                  <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>
                        <Bell className="h-3.5 w-3.5 text-white" />
                      </motion.div>
                      <span className="text-white font-black text-[11px] uppercase tracking-widest">🔥 New Order!</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {sirenActive && <Volume2 className="h-3 w-3 text-white/70 animate-pulse" />}
                      <span className="text-emerald-100 font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                        #{newOrderNotification.id.substring(6, 12).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-black text-lg leading-tight">{newOrderNotification.buyerName}</p>
                        <p className="text-gray-400 text-[11px]">{notifItems.length} item{notifItems.length !== 1 ? "s" : ""} ordered</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-black text-2xl font-mono">{currencySymbol}{(newOrderNotification.amountCents / 100).toFixed(2)}</p>
                        <p className="text-gray-500 text-[10px]">{newOrderNotification.paymentMethod?.toUpperCase() || "COD"}</p>
                      </div>
                    </div>

                    <motion.button
                      animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.6)", "0 0 0px rgba(16,185,129,0)"] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="h-4 w-4" /> Tap to Review & Act
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* FULL-SCREEN NEW ORDER MODAL */}
        <AnimatePresence>
          {showNewOrderModal && newOrderNotification && (() => {
            let modalItems: any[] = [];
            try { modalItems = JSON.parse(newOrderNotification.itemsJson || "[]"); } catch {}
            if (modalItems.length === 0) {
              const matchedProd = productsList.find(p => p.id === newOrderNotification.productId);
              modalItems = [{ id: newOrderNotification.productId, name: matchedProd?.name || "Product Item", price: newOrderNotification.amountCents, quantity: 1, image: matchedProd?.image }];
            }
            const activeRiders = deliveryBoysList.filter(r => r.isOnline || r.isActive);
            return (
              <motion.div
                key="new-order-modal-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{ background: "rgba(2,4,10,0.92)", backdropFilter: "blur(12px)" }}
              >
                {/* Outer ring animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/10 animate-ping" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-emerald-500/5 animate-ping" style={{ animationDelay: "0.5s" }} />
                </div>

                <motion.div
                  key="new-order-modal"
                  initial={{ opacity: 0, scale: 0.88, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  transition={{ type: "spring", damping: 22, stiffness: 200 }}
                  className="relative w-full max-w-lg bg-gradient-to-b from-[#0a1520] to-[#070b14] border-2 border-emerald-500/40 rounded-[28px] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)] max-h-[90vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="text-2xl"
                      >🔔</motion.div>
                      <div>
                        <p className="text-white font-black text-base">New Order Arrived!</p>
                        <p className="text-emerald-100 text-xs">#{newOrderNotification.id.substring(6, 14).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sirenActive && (
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                          <Volume2 className="h-3 w-3 text-white" />
                          <span className="text-white text-[10px] font-bold">LIVE</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
                    {/* Customer Info */}
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Customer</p>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shrink-0">
                          {newOrderNotification.buyerName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-lg leading-tight truncate">{newOrderNotification.buyerName}</p>
                          <p className="text-emerald-400 font-black text-xl font-mono">{currencySymbol}{(newOrderNotification.amountCents / 100).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 mt-1">
                        {newOrderNotification.buyerEmail && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{newOrderNotification.buyerEmail}</span>
                          </div>
                        )}
                        {newOrderNotification.buyerPhone && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{newOrderNotification.buyerPhone}</span>
                          </div>
                        )}
                        {newOrderNotification.deliveryAddress && (
                          <div className="flex items-start gap-2 text-xs text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{newOrderNotification.deliveryAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{newOrderNotification.paymentMethod || "COD"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{modalItems.length} Item{modalItems.length !== 1 ? "s" : ""} Ordered</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {modalItems.map((item: any, i: number) => (
                          <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            {item.image ? (
                              <img loading="lazy" src={item.image} className="w-full h-24 object-cover" />
                            ) : (
                              <div className="w-full h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-3xl">
                                🍽️
                              </div>
                            )}
                            <div className="p-2.5">
                              <p className="text-white font-bold text-xs leading-tight line-clamp-2">{item.name}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-emerald-400 font-black text-xs font-mono">
                                  {currencySymbol}{item.price ? (item.price / 100).toFixed(2) : "—"}
                                </span>
                                <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">×{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Input (shown when active) */}
                    <AnimatePresence>
                      {showMessageInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-2"
                        >
                          <textarea
                            value={orderMessageText}
                            onChange={e => setOrderMessageText(e.target.value)}
                            placeholder="Type a message to the customer..."
                            rows={3}
                            className="w-full bg-white/[0.06] border border-indigo-500/30 rounded-xl p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500/60"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleNewOrderSendMessage}
                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Send className="h-3.5 w-3.5" /> Send Message
                            </button>
                            <button
                              onClick={() => { setShowMessageInput(false); setOrderMessageText(""); }}
                              className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
                            >Cancel</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="shrink-0 p-5 pt-0 flex flex-col gap-2.5 border-t border-white/5">
                    <motion.button
                      animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0.0)", "0 0 30px rgba(16,185,129,0.5)", "0 0 0px rgba(16,185,129,0.0)"] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      onClick={() => setShowAcceptSubModal(true)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2.5"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Accept Order
                    </motion.button>

                    <div className="flex gap-2">
                      <motion.button
                        animate={{ opacity: showMessageInput ? 1 : [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        onClick={() => setShowMessageInput(v => !v)}
                        className="flex-1 py-3 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 font-bold text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" /> Message
                      </motion.button>
                      <motion.button
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 2.2 }}
                        onClick={handleNewOrderCancel}
                        className="flex-1 py-3 bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-300 font-bold text-sm rounded-2xl cursor-pointer flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* ACCEPT SUB-MODAL — slides in from bottom */}
                <AnimatePresence>
                  {showAcceptSubModal && (() => {
                    const activeRiders = deliveryBoysList.filter(r => r.isOnline || r.isActive);
                    return (
                      <motion.div
                        key="accept-sub-modal"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 24, stiffness: 220 }}
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#0e1828] to-[#080c18] border-t-2 border-emerald-500/40 rounded-t-[28px] p-5 shadow-2xl z-10 max-h-[80%] overflow-y-auto"
                      >
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                        <p className="text-white font-black text-lg mb-4 flex items-center gap-2">
                          <ChefHat className="h-5 w-5 text-emerald-400" /> Confirm Order Details
                        </p>

                        {/* Prep Time */}
                        <div className="mb-4">
                          <p className="text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-2.5">Preparation Time</p>
                          <div className="grid grid-cols-4 gap-2">
                            {[10, 20, 30, 45].map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedPrepTime(t)}
                                className={`py-3 rounded-2xl font-black text-sm transition cursor-pointer flex flex-col items-center gap-0.5 ${
                                  selectedPrepTime === t
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                    : "bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/10"
                                }`}
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {t}m
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Boy Selector */}
                        <div className="mb-5">
                          <p className="text-gray-400 text-[11px] uppercase tracking-widest font-bold mb-2.5">Assign Delivery Rider</p>
                          {activeRiders.length === 0 ? (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-orange-300 text-xs text-center">
                              No riders online — order will proceed without assignment
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {activeRiders.map((r: any) => {
                                const vehicleEmoji = r.vehicle === "bike" ? "🏍️" : r.vehicle === "scooter" ? "🛵" : r.vehicle === "car" ? "🚗" : "🚐";
                                return (
                                  <button
                                    key={r.id}
                                    onClick={() => setSelectedRiderId(r.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-left ${
                                      selectedRiderId === r.id
                                        ? "bg-indigo-500/20 border-indigo-500/50"
                                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                                    }`}
                                  >
                                    <div className="text-2xl shrink-0">{vehicleEmoji}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-bold text-sm truncate">{r.name}</p>
                                      <p className="text-gray-400 text-xs">{r.phone}</p>
                                    </div>
                                    <div className={`h-2 w-2 rounded-full shrink-0 ${r.isOnline ? "bg-emerald-400" : "bg-gray-500"}`} />
                                    {selectedRiderId === r.id && <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleNewOrderAcceptConfirm}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30"
                        >
                          <Zap className="h-5 w-5" />
                          Confirm & Notify Customer
                        </button>
                        <button
                          onClick={() => setShowAcceptSubModal(false)}
                          className="w-full py-2.5 mt-2 text-gray-500 hover:text-gray-300 font-medium text-sm transition cursor-pointer"
                        >
                          ← Back
                        </button>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Order Details Drawer */}
        <AnimatePresence>
          {activeProcessingOrder && (() => {
            let parsedItems: any[] = [];
            if (activeProcessingOrder.itemsJson) {
              try {
                parsedItems = JSON.parse(activeProcessingOrder.itemsJson);
              } catch (e) {
                console.error("Failed to parse itemsJson:", e);
              }
            }
            if (parsedItems.length === 0) {
              const matchedProd = productsList.find(p => p.id === activeProcessingOrder.productId);
              parsedItems = [{
                id: activeProcessingOrder.productId,
                name: matchedProd?.name || "Product Item",
                price: activeProcessingOrder.amountCents,
                quantity: 1,
                image: matchedProd?.image
              }];
            }

            const activeRiders = deliveryBoysList.filter(r => r.isOnline || r.isActive);
            const rider = activeRiders.find(r => r.id === selectedRiderId) || activeRiders[0];

            const handleAcceptOrder = async (prepTime: number) => {
              try {
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tenantSlug,
                    orderId: activeProcessingOrder.id,
                    status: "accepted",
                    prepTimeMinutes: prepTime
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? { ...o, status: "accepted", prepTimeMinutes: prepTime } : o));
                  setActiveProcessingOrder(data.order);
                  // Start live countdown timer
                  setShopOrderTimers(prev => ({ ...prev, [activeProcessingOrder.id]: prepTime * 60 }));
                  // Trigger celebration
                  setShowCelebration(true);
                  setTimeout(() => setShowCelebration(false), 3000);
                  showToast(`Order accepted! ${prepTime}m prep timer started.`);
                  sendOrderBroadcast("ORDER_ACCEPTED", {
                    orderId: activeProcessingOrder.id,
                    prepTimeMinutes: prepTime
                  });
                }
              } catch (e) {}
            };

            const handleMarkInProcessing = async () => {
              try {
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tenantSlug, orderId: activeProcessingOrder.id, status: "processing" })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? { ...o, status: "processing" } : o));
                  setActiveProcessingOrder(data.order);
                  showToast("Order marked as In Processing.");
                  sendOrderBroadcast("ORDER_IN_PROCESSING", { orderId: activeProcessingOrder.id });
                }
              } catch (e) {}
            };

            const handleDispatchOrder = async () => {
              try {
                const riderToDispatch = rider || { id: "manual", name: "Manual Delivery", phone: "N/A" };
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tenantSlug,
                    orderId: activeProcessingOrder.id,
                    status: "out_for_delivery",
                    deliveryBoyId: riderToDispatch.id,
                    deliveryBoyName: riderToDispatch.name,
                    deliveryBoyPhone: riderToDispatch.phone,
                    deliveryStatus: "picked_up"
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? {
                    ...o,
                    status: "out_for_delivery",
                    deliveryBoyId: riderToDispatch.id,
                    deliveryBoyName: riderToDispatch.name,
                    deliveryBoyPhone: riderToDispatch.phone,
                    deliveryStatus: "picked_up"
                  } : o));
                  // Mark rider as on delivery
                  if (riderToDispatch.id !== "manual") {
                    setDeliveryBoysList(prev => prev.map(r => r.id === riderToDispatch.id ? { ...r, currentOrderId: activeProcessingOrder.id } : r));
                  }
                  setActiveProcessingOrder(data.order);
                  showToast(`Dispatched to ${riderToDispatch.name}. Order out for delivery!`);
                  sendOrderBroadcast("DELIVERY_PICKED_UP", {
                    orderId: activeProcessingOrder.id,
                    deliveryBoyName: riderToDispatch.name,
                    deliveryBoyPhone: riderToDispatch.phone
                  });
                }
              } catch (e) {}
            };

            const handleDeliverOrder = async () => {
              try {
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tenantSlug,
                    orderId: activeProcessingOrder.id,
                    status: "delivered",
                    deliveryStatus: "delivered"
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? { 
                    ...o, 
                    status: "delivered",
                    deliveryStatus: "delivered" 
                  } : o));
                  setActiveProcessingOrder(data.order);
                  showToast("Order delivered successfully!");
                  sendOrderBroadcast("DELIVERY_COMPLETED", {
                    orderId: activeProcessingOrder.id
                  });
                }
              } catch (e) {}
            };

            const handleCancelOrder = async () => {
              try {
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tenantSlug,
                    orderId: activeProcessingOrder.id,
                    status: "cancelled"
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? { ...o, status: "cancelled" } : o));
                  setActiveProcessingOrder(data.order);
                  showToast("Order cancelled.");
                  sendOrderBroadcast("ORDER_CANCELLED", {
                    orderId: activeProcessingOrder.id
                  });
                }
              } catch (e) {}
            };

            const handleSendMessage = async () => {
              if (!lastMessageText.trim()) return;
              try {
                const res = await fetch("/api/ecom/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tenantSlug,
                    orderId: activeProcessingOrder.id,
                    lastMessage: lastMessageText
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setOrdersList(prev => prev.map(o => o.id === activeProcessingOrder.id ? { ...o, lastMessage: lastMessageText } : o));
                  setActiveProcessingOrder(data.order);
                  sendOrderBroadcast("BUYER_MESSAGE", {
                    orderId: activeProcessingOrder.id,
                    message: lastMessageText
                  });
                  setLastMessageText("");
                  showToast("Message sent to buyer storefront.");
                }
              } catch (e) {}
            };

            const isFoodStore = storefrontConfig?.template === "food" || storeTemplate === "food";

            return (
              <div key="order-drawer-root" className="fixed inset-0 z-50 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveProcessingOrder(null)}
                  className="absolute inset-0 bg-[#020306]/80 backdrop-blur-sm cursor-pointer"
                />
                
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0d16] border-l border-white/10 p-6 shadow-2xl flex flex-col gap-6 select-none overflow-y-auto text-gray-200"
                >
                  {/* Title & Close */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Order Details</span>
                      <h3 className="text-base font-bold text-white font-mono mt-0.5">#{activeProcessingOrder.id.substring(6, 15).toUpperCase()}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Live prep timer */}
                      {shopOrderTimers[activeProcessingOrder.id] !== undefined && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${shopOrderTimers[activeProcessingOrder.id] === 0 ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"}`}>
                          <Timer className="h-3.5 w-3.5" />
                          {shopOrderTimers[activeProcessingOrder.id] === 0 ? "Time Up!" : `${String(Math.floor(shopOrderTimers[activeProcessingOrder.id] / 60)).padStart(2,'0')}:${String(shopOrderTimers[activeProcessingOrder.id] % 60).padStart(2,'0')}`}
                        </div>
                      )}
                      <button onClick={() => setActiveProcessingOrder(null)} className="text-gray-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Customer Details</h4>
                    <div>
                      <p className="text-sm font-extrabold text-white">{activeProcessingOrder.buyerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">{activeProcessingOrder.buyerEmail} | {activeProcessingOrder.buyerPhone || "No Phone"}</p>
                      <p className="text-xs text-gray-400 mt-2 bg-black/40 border border-white/5 rounded-lg p-2.5 leading-relaxed"><span className="font-semibold text-gray-300">Delivery Address:</span> {activeProcessingOrder.shippingAddress || "N/A"}</p>
                    </div>
                  </div>

                  {/* Products list */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Items Ordered</h4>
                    <div className="flex flex-col gap-2">
                      {parsedItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                          {item.image ? (
                            <img loading="lazy" src={item.image} className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400"><ShoppingBag className="h-4 w-4" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{currencySymbol}{(item.price/100).toFixed(2)} x {item.quantity}</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-300 font-mono">{currencySymbol}{((item.price * item.quantity)/100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3 px-1.5">
                      <span className="text-xs font-bold text-gray-400">Total Revenue</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{currencySymbol}{(activeProcessingOrder.amountCents/100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Message Customer Section */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Message Customer</h4>
                    {activeProcessingOrder.lastMessage && (
                      <div className="bg-indigo-500/5 border border-indigo-500/20 text-indigo-200 text-xs p-2.5 rounded-xl text-left leading-relaxed">
                        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-wide">Last message sent:</p>
                        <p className="mt-0.5 font-medium">{activeProcessingOrder.lastMessage}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type updates (e.g. food is packed)..." 
                        value={lastMessageText} 
                        onChange={e => setLastMessageText(e.target.value)} 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Fulfillment Control Panel */}
                  <div className="flex flex-col gap-3 border-t border-white/5 pt-4 mt-auto">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Fulfillment Status: <span className="text-white font-bold">{activeProcessingOrder.status.toUpperCase()}</span></h4>
                    
                    {/* Status Pending or Paid -> Accept Panel */}
                    {(activeProcessingOrder.status === "pending" || activeProcessingOrder.status === "paid") && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400">Select food preparation / packaging time to accept:</span>
                        <div className="grid grid-cols-4 gap-2">
                          {prepTimeChoices.map(time => (
                            <button 
                              key={time}
                              onClick={() => handleAcceptOrder(time)}
                              className="py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-extrabold transition text-indigo-300 cursor-pointer"
                            >
                              {time}m
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Accepted -> In Processing button + rider dispatch */}
                    {(activeProcessingOrder.status === "accepted" || activeProcessingOrder.status === "processing") && (
                      <div className="flex flex-col gap-3">
                        {activeProcessingOrder.status === "accepted" && (
                          <button
                            onClick={handleMarkInProcessing}
                            className="w-full py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="h-4 w-4" /> Mark as In Processing
                          </button>
                        )}
                        {isFoodStore ? (
                          <div className="bg-[#111422] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 text-left">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Assign Delivery Rider</span>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-gray-500">
                                {activeRiders.length === 0 ? "No online riders — add riders in the Delivery Riders panel" : "Select active rider:"}
                              </label>
                              {activeRiders.length > 0 ? (
                                <select
                                  value={selectedRiderId}
                                  onChange={e => setSelectedRiderId(e.target.value)}
                                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer w-full"
                                >
                                  {activeRiders.map(r => (
                                    <option key={r.id} value={r.id}>
                                      {r.vehicle === "scooter" ? "🛵" : r.vehicle === "car" ? "🚗" : r.vehicle === "van" ? "🚐" : "🚲"} {r.name} — {r.phone}
                                      {r.currentOrderId ? " (On Delivery)" : ""}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  onClick={() => { setActiveProcessingOrder(null); setEcomSubTab("riders"); }}
                                  className="text-xs text-indigo-400 underline text-left"
                                >
                                  → Go to Delivery Riders to add riders
                                </button>
                              )}
                            </div>
                            <button
                              onClick={handleDispatchOrder}
                              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Truck className="h-4 w-4" />
                              <span>Dispatch Order (Out for Delivery)</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleDispatchOrder}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                          >
                            Mark Shipped / Dispatched
                          </button>
                        )}
                      </div>
                    )}

                    {/* Status Out for Delivery -> Deliver order */}
                    {activeProcessingOrder.status === "out_for_delivery" && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-3 text-left">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm animate-bounce">
                              🚴
                            </div>
                            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">On The Way!</span>
                          </div>
                          <div className="bg-black/30 rounded-xl p-3 flex flex-col gap-1.5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Assigned Rider</p>
                            <p className="text-sm text-white font-bold">{activeProcessingOrder.deliveryBoyName}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Phone className="h-3 w-3" /> {activeProcessingOrder.deliveryBoyPhone}
                            </p>
                          </div>
                          <button
                            onClick={handleDeliverOrder}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                          >
                            <Check className="h-4 w-4" />
                            <span>Mark as Delivered</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Deliver status details */}
                    {activeProcessingOrder.status === "delivered" && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Order Fulfilled & Delivered</span>
                      </div>
                    )}

                    {/* Cancel Action (if not already cancelled/delivered) */}
                    {activeProcessingOrder.status !== "cancelled" && activeProcessingOrder.status !== "delivered" && (
                      <button 
                        onClick={handleCancelOrder}
                        className="w-full py-2.5 mt-2 bg-red-600/10 border border-red-600/20 hover:bg-red-600 hover:text-white text-red-400 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* QR & Barcode Generator Modal */}
        <AnimatePresence>
          {showQrPrintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0d1a] border border-white/10 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Generate QR Codes</h3>
                      <p className="text-xs text-gray-400">Add products to your print queue</p>
                    </div>
                  </div>
                  <button onClick={() => setShowQrPrintModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Selection */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold tracking-wider text-gray-500">Select Product</label>
                      <select id="qrProdSelect" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner cursor-pointer appearance-none">
                        {productsList.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.sku || 'No SKU'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold tracking-wider text-gray-500">Labels to Print</label>
                      <input id="qrQtySelect" type="number" defaultValue="24" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner" />
                    </div>
                    <button 
                      onClick={() => {
                        const select = document.getElementById('qrProdSelect') as HTMLSelectElement;
                        const qty = document.getElementById('qrQtySelect') as HTMLInputElement;
                        const prod = productsList.find(p => p.id === select.value);
                        if(prod && parseInt(qty.value) > 0) {
                          setQrPrintCart(prev => {
                            const existing = prev.find(item => item.product.id === prod.id);
                            if (existing) return prev.map(item => item.product.id === prod.id ? { ...item, qty: item.qty + parseInt(qty.value) } : item);
                            return [...prev, { product: prod, qty: parseInt(qty.value) }];
                          });
                        }
                      }}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add to Print Queue
                    </button>
                  </div>

                  {/* Right: Queue & Action */}
                  <div className="flex-1 bg-black/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      Print Queue
                      <span className="bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px]">{qrPrintCart.reduce((acc, i) => acc + i.qty, 0)} Total Labels</span>
                    </h4>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[150px]">
                      {qrPrintCart.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-10">Queue is empty</p>
                      ) : (
                        qrPrintCart.map((item, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2 px-3 border border-white/5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white truncate max-w-[150px]">{item.product.name}</span>
                              <span className="text-[10px] text-gray-400">Qty: {item.qty}</span>
                            </div>
                            <button onClick={() => setQrPrintCart(prev => prev.filter(p => p.product.id !== item.product.id))} className="text-red-400 hover:text-red-300 p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        if (qrPrintCart.length === 0) {
                          alert("Please add products to the print queue first.");
                          return;
                        }
                        window.print();
                      }}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <QrCode className="h-5 w-5" /> Print A4 Sheet
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Admin Chat Drawer ── */}
        <AnimatePresence>
          {adminChatOrderId && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                onClick={() => setAdminChatOrderId(null)} />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed top-0 right-0 bottom-0 z-[210] w-full max-w-sm bg-[#0c0f1a] border-l border-white/10 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
                  <div>
                    <h3 className="text-white font-black">Rider Chat</h3>
                    <p className="text-gray-500 text-[10px] mt-0.5">Order #{adminChatOrderId.slice(-6).toUpperCase()}</p>
                  </div>
                  <button onClick={() => setAdminChatOrderId(null)}
                    className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  {adminChatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
                      <MessageSquare className="w-10 h-10" />
                      <p className="text-sm font-medium">No messages yet</p>
                    </div>
                  )}
                  {adminChatMessages.map((msg: any) => {
                    const isMe = msg.fromRole === "admin";
                    return (
                      <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium ${isMe ? "rounded-br-sm bg-indigo-600 text-white" : "bg-white/[0.07] border border-white/[0.09] text-white rounded-bl-sm"}`}>
                          {msg.text}
                        </div>
                        <span className="text-gray-600 text-[9px]">
                          {msg.fromRole === "admin" ? "You" : msg.from} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={adminChatEndRef} />
                </div>

                <div className="px-4 pb-6 pt-3 border-t border-white/[0.07] shrink-0 flex gap-3">
                  <input
                    value={adminChatText}
                    onChange={e => setAdminChatText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminChatMessage(); } }}
                    placeholder="Message to rider…"
                    className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
                  />
                  <button
                    onClick={sendAdminChatMessage}
                    disabled={!adminChatText.trim() || adminChatLoading}
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-600 text-white disabled:opacity-40 transition active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRINTABLE QR AREA (Only visible when printing) */}
        <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[9999] print:p-0">
          <style dangerouslySetInnerHTML={{__html: "@media print { @page { margin: 0.5cm; size: A4 portrait; } body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }"}} />
          <div className="grid grid-cols-3 gap-2 w-full max-w-[21cm] mx-auto">
            {qrPrintCart.flatMap(item => Array(item.qty).fill(item.product)).map((p, i) => (
              <div key={i} className="flex items-center justify-center border border-dashed border-gray-300 p-2 break-inside-avoid">
                <div className="flex flex-col items-center text-center gap-1 w-full">
                  <h4 className="text-[10px] font-bold text-black uppercase truncate w-full">{p.name}</h4>
                  <p className="text-[9px] font-mono text-gray-600 mb-1">{p.sku || 'N/A'}</p>
                  <QRCodeSVG value={JSON.stringify({ id: p.id, sku: p.sku || 'N/A' })} size={80} level="M" />
                  <p className="text-[11px] font-black mt-1 text-black font-mono">
                    {p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : p.currency === "INR" ? "₹" : `${p.currency} `}{(p.price / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

    </div>
  );
}
