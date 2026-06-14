"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Cpu,
  Users,
  CreditCard,
  Activity,
  Settings,
  Key,
  ShieldAlert,
  Server,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Coins,
  FileText,
  Save,
  ArrowRight,
  UserCheck,
  ChevronLeft,
  Settings2,
  Workflow,
  Mail,
  Lock,
  DollarSign,
  AlertTriangle,
  Globe,
  Sliders,
  Calendar,
  Layers,
  ShoppingBag,
  Clock,
  Send,
  BookOpen,
  Cloud,
  Database,
  Contact,
  Download,
  Youtube,
  MessageSquare,
  Terminal,
  Image,
  SlidersHorizontal,
  Bot,
  User,
  ShieldAlert as LockIcon,
  Edit3
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  planId: string;
  creditsBalance: number;
  status: "active" | "suspended";
  mrr: number;
  usage: number; // monthly messages count
  rateLimitMin: number;
}

interface TenantLimits {
  openaiLimit: number;
  claudeLimit: number;
  geminiLimit: number;
  imageLimit: number;
  allowOpenAI: boolean;
  allowClaude: boolean;
  allowGemini: boolean;
  allowImage: boolean;
}

interface AIProvider {
  id: string;
  name: string;
  code: string;
  status: "enabled" | "disabled";
  monthlyCap: number;
  monthlySpend: number;
  keyLabel: string;
  models: string[];
}

interface Plan {
  id: string;
  name: string;
  priceUsd: number;
  priceInr: number;
  regularPriceUsd?: number;
  regularPriceInr?: number;
  taxPercentage?: number;
  monthlyCredits: number;
  botsCount: string;
  teamSeats: string;
}

interface TokenLog {
  id: string;
  tenant: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  cost: number;
  time: string;
}

interface EmailGateway {
  id: string;
  name: string;
  status: "active" | "inactive";
  smtpHost: string;
  smtpPort: number;
  senderEmail: string;
  authType: "api_key" | "smtp_password";
  apiKeyLabel: string;
}

interface RAGProvider {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
  url: string;
  apiKeyLabel: string;
  indexName: string;
  distanceMetric: "cosine" | "euclidean" | "dot_product";
}

export default function SuperAdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filters for Revenue Dashboard
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("2026-01-01");
  const [filterEndDate, setFilterEndDate] = useState("2026-12-31");

  // System Models registry for Tier checks
  const ALL_SYSTEM_MODELS = [
    { id: "gpt-4o-mini", name: "OpenAI gpt-4o-mini", category: "LLM" },
    { id: "gpt-4o", name: "OpenAI gpt-4o", category: "LLM" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", category: "LLM" },
    { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", category: "LLM" },
    { id: "claude-4.6", name: "Claude 4.6 (Next-Gen Flagship)", category: "LLM" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", category: "LLM" },
    { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro (Enterprise)", category: "LLM" },
    { id: "deepseek-r1", name: "DeepSeek R1 Reasoning", category: "LLM" },
    { id: "openrouter/free", name: "OpenRouter Free Models", category: "LLM" },
    { id: "dall-e-3", name: "OpenAI DALL-E-3 (Legacy Image)", category: "Image" },
    { id: "gpt-image-2", name: "OpenAI GPT Image 2 (2026 flagship)", category: "Image" }
  ];

  // SaaS Tiers Feature Matrix state (Now handles allowed models checklists & granular integration toggles)
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_tier_features", JSON.stringify(tierFeatures));
    }
  }, [tierFeatures]);


  // Providers list (2026 Popular Models, keeps existing, adds n8n Webhook as provider)
  const [providers, setProviders] = useState<AIProvider[]>([
    { id: "p1", name: "OpenAI Mesh", code: "openai", status: "enabled", monthlyCap: 3000, monthlySpend: 625.80, keyLabel: "••••••••sk-oP4a", models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o3-mini"] },
    { id: "p2", name: "Anthropic Claude", code: "anthropic", status: "enabled", monthlyCap: 2500, monthlySpend: 410.45, keyLabel: "••••••••sk-an7b", models: ["claude-3-5-sonnet", "claude-3-7-sonnet", "claude-3-5-haiku"] },
    { id: "p3", name: "Google Gemini Edge", code: "gemini", status: "enabled", monthlyCap: 1500, monthlySpend: 45.20, keyLabel: "••••••••sk-ge2c", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-3.0-flash"] },
    { id: "p4", name: "DeepSeek Reasoning", code: "deepseek", status: "enabled", monthlyCap: 1200, monthlySpend: 242.30, keyLabel: "••••••••sk-ds9d", models: ["deepseek-r1", "deepseek-v3"] },
    { id: "p5", name: "OpenRouter Aggregator", code: "openrouter", status: "enabled", monthlyCap: 1000, monthlySpend: 114.10, keyLabel: "••••••••sk-or5e", models: ["openrouter/free", "google/gemini-2.5-flash:free"] },
    { id: "p6", name: "n8n Webhook Router", code: "n8n", status: "enabled", monthlyCap: 500, monthlySpend: 12.00, keyLabel: "••••••••webhook-n8n-sec", models: ["n8n-agent-skills-router", "n8n-custom-sub-agent"] }
  ]);

  // Image Generation Mesh Cloud state (Advanced GPT Image 2 and legacy DALL-E-3 support)
  const [imageMeshConfig, setImageMeshConfig] = useState({
    active: true,
    provider: "gpt-image-2", // gpt-image-2, dalle3, pollinations, together, fal, cloudflare, huggingface
    apiKey: "AIzaSyImageMeshAetherSecret2026••••",
    defaultModel: "gpt-image-2",
    defaultWidth: 1024,
    defaultHeight: 1024,
    dalleQuality: "hd", // standard, hd
    dalleStyle: "vivid", // vivid, natural
    gptImageMode: "thinking", // instant, thinking
    multiImageConsistency: true,
    reasoningSteps: 50
  });

  // Model Search and Add States
  const [selectedProviderForModel, setSelectedProviderForModel] = useState("openai");
  const [modelToAdd, setModelToAdd] = useState("");

  // AI 3-Tier Fallbacks Configuration
  const [fallbacks, setFallbacks] = useState({
    tier1: "openai/gpt-4o-mini",
    tier2: "gemini/gemini-2.5-flash",
    tier3: "openrouter/free"
  });

  // Global Leads Data
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  
  useEffect(() => {
    if (activeTab === "leads") {
      fetch("/api/leads?tenantSlug=all")
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setAllLeads(data.leads || []);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  // Token Telemetry State (Real-time updates)
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([
    { id: "t1", tenant: "imran-ai", model: "deepseek-r1", inputTokens: 1024, outputTokens: 2560, latency: 1850, cost: 0.0071, time: "16:22:15" },
    { id: "t2", tenant: "alpha-agency", model: "gpt-4o-mini", inputTokens: 512, outputTokens: 890, latency: 420, cost: 0.0003, time: "16:21:40" },
    { id: "t3", tenant: "apex-retail", model: "gemini-2.5-flash", inputTokens: 4096, outputTokens: 1024, latency: 310, cost: 0.0006, time: "16:21:05" },
    { id: "t4", tenant: "zenith-systems", model: "claude-3-5-sonnet", inputTokens: 1536, outputTokens: 2048, latency: 1100, cost: 0.0353, time: "16:20:12" }
  ]);

  // Email Gateways State (5 Gateways including Gmail/Aether Free)
  const [emailGateways, setEmailGateways] = useState<EmailGateway[]>([
    { id: "eg1", name: "Aether SMTP Relay (Gmail Free)", status: "active", smtpHost: "smtp.gmail.com", smtpPort: 587, senderEmail: "free-relay@aether.ai", authType: "smtp_password", apiKeyLabel: "••••••••••••••••" },
    { id: "eg2", name: "Resend Gateway", status: "inactive", smtpHost: "smtp.resend.com", smtpPort: 465, senderEmail: "billing@aether.ai", authType: "api_key", apiKeyLabel: "••••••••••••••••" },
    { id: "eg3", name: "SendGrid Web API", status: "inactive", smtpHost: "smtp.sendgrid.net", smtpPort: 587, senderEmail: "no-reply@aether.ai", authType: "api_key", apiKeyLabel: "••••••••••••••••" },
    { id: "eg4", name: "Mailgun Transport", status: "inactive", smtpHost: "smtp.mailgun.org", smtpPort: 587, senderEmail: "support@aether.ai", authType: "api_key", apiKeyLabel: "••••••••••••••••" },
    { id: "eg5", name: "Amazon SES", status: "inactive", smtpHost: "email-smtp.us-east-1.amazonaws.com", smtpPort: 465, senderEmail: "alerts@aether.ai", authType: "api_key", apiKeyLabel: "••••••••••••••••" }
  ]);

  // Active email gateway configuration state
  const [activeEmailEdit, setActiveEmailEdit] = useState<EmailGateway | null>(null);

  // Payments Integration State
  const [paymentConfig, setPaymentConfig] = useState({
    stripeActive: true,
    stripeLiveSecret: "sk_live_51NvAetherSecrets••••",
    stripeWebhookSecret: "whsec_stripeAetherWebhook••••",
    razorpayActive: true,
    razorpayKeyId: "rzp_live_AetherKeys••••",
    razorpayKeySecret: "rzp_sec_AetherSecrets••••",
    razorpayWebhookSecret: "whsec_razorpayAetherWebhook••••"
  });

  // Firebase Integration Config State
  const [firebaseConfig, setFirebaseConfig] = useState({
    active: false,
    apiKey: "AIzaSyFirebaseMasterKeyAether2026••••",
    authDomain: "aether-agentic-saas.firebaseapp.com",
    projectId: "aether-agentic-saas",
    storageBucket: "aether-agentic-saas.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:12abc34567def",
    googleLoginEnabled: true,
    storageAuthEnabled: true
  });

  // Supabase Deep Integration Config State
  const [supabaseConfig, setSupabaseConfig] = useState({
    active: true,
    url: "https://aether-saas.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabaseAnonKey••••",
    serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabaseServiceRoleKey••••",
    postgresUrl: "postgresql://postgres:dbPassAether2026@db.supabase.co:5432/postgres",
    pgvectorActive: true,
    userSyncActive: true
  });

  // RAG Storage Providers State (Free and Paid vector databases)
  const [ragProviders, setRagProviders] = useState<RAGProvider[]>([
    { id: "r1", name: "Supabase pgvector (Free Extension)", code: "pgvector", status: "active", url: "https://aether-saas.supabase.co", apiKeyLabel: "PostgreSQL Native Connection", indexName: "documents_embeddings", distanceMetric: "cosine" },
    { id: "r2", name: "Pinecone Serverless (Paid / Scalable)", code: "pinecone", status: "inactive", url: "https://aether-saas.pinecone.io", apiKeyLabel: "••••••••••••••••", indexName: "aether-rag-collection", distanceMetric: "cosine" },
    { id: "r3", name: "Qdrant Vector DB (Hybrid / Cloud)", code: "qdrant", status: "inactive", url: "https://qdrant.aether-cloud.ai:6333", apiKeyLabel: "••••••••••••••••", indexName: "aether_vector_payloads", distanceMetric: "dot_product" },
    { id: "r4", name: "Milvus Distributed DB (Enterprise)", code: "milvus", status: "inactive", url: "https://milvus.aether.ai:19530", apiKeyLabel: "••••••••••••••••", indexName: "aether_rag_index", distanceMetric: "euclidean" },
    { id: "r5", name: "Chroma Vector Store (Free / Local)", code: "chroma", status: "inactive", url: "http://localhost:8000", apiKeyLabel: "No Auth (Local Developer Sandbox)", indexName: "chroma_collection", distanceMetric: "cosine" }
  ]);

  const [activeRagEdit, setActiveRagEdit] = useState<RAGProvider | null>(null);

  // YouTube Integration State
  const [youtubeConfig, setYoutubeConfig] = useState({
    active: true,
    apiKey: "AIzaSyYoutubeV3DataAPIKeyAether••••",
    autoTranscript: true,
    maxDurationMinutes: 60,
    transcriptLanguage: "en"
  });

  // Telegram Bot Integration State
  const [telegramConfig, setTelegramConfig] = useState({
    active: false,
    botToken: "1234567890:AAH-TelegramBotTokenAether2026••••",
    botUsername: "AetherAgenticBot",
    webhookUrl: "https://aether.ai/api/webhooks/telegram",
    registered: false,
    secretToken: "tg-webhook-sec-token-aether"
  });

  const [tenants, setTenants] = useState<Tenant[]>([
    { id: "1", name: "Imran AI Studio", slug: "imran-ai", email: "imranhossain786@gmail.com", planId: "enterprise", creditsBalance: 500000, status: "active", mrr: 129, usage: 24205, rateLimitMin: 120 },
    { id: "2", name: "Alpha Agency Corp", slug: "alpha-agency", email: "contact@alphaagency.co", planId: "growth", creditsBalance: 87500, status: "active", mrr: 39, usage: 5930, rateLimitMin: 60 },
    { id: "3", name: "Apex Retail Solutions", slug: "apex-retail", email: "billing@apexretail.in", planId: "starter", creditsBalance: 12400, status: "active", mrr: 12, usage: 2110, rateLimitMin: 30 },
    { id: "4", name: "Glow Salon & Spa", slug: "glow-spa", email: "support@glowspa.net", planId: "free", creditsBalance: 450, status: "suspended", mrr: 0, usage: 15, rateLimitMin: 10 },
    { id: "5", name: "Zenith Digital Systems", slug: "zenith-systems", email: "admin@zenithdigital.com", planId: "scale", creditsBalance: 420000, status: "active", mrr: 129, usage: 18940, rateLimitMin: 200 }
  ]);

  const [plans, setPlans] = useState<Plan[]>([
    { id: "free", name: "Free Tier", priceUsd: 0, priceInr: 0, regularPriceUsd: 0, regularPriceInr: 0, taxPercentage: 0, monthlyCredits: 2000, botsCount: "1 Bot", teamSeats: "1 Seat" },
    { id: "starter", name: "Starter Bundle", priceUsd: 12, priceInr: 999, regularPriceUsd: 19, regularPriceInr: 1499, taxPercentage: 18, monthlyCredits: 25000, botsCount: "3 Bots", teamSeats: "3 Seats" },
    { id: "growth", name: "Growth Core", priceUsd: 39, priceInr: 2999, regularPriceUsd: 59, regularPriceInr: 3999, taxPercentage: 18, monthlyCredits: 100000, botsCount: "10 Bots", teamSeats: "10 Seats" },
    { id: "scale", name: "Scale Master", priceUsd: 129, priceInr: 9999, regularPriceUsd: 199, regularPriceInr: 14999, taxPercentage: 18, monthlyCredits: 500000, botsCount: "Unlimited", teamSeats: "25 Seats" }
  ]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanData, setEditingPlanData] = useState<Plan | null>(null);
  

  // Granular Rate limits and toggles per tenant
  const [tenantLimits, setTenantLimits] = useState<Record<string, TenantLimits>>({
    "1": { openaiLimit: 120, claudeLimit: 90, geminiLimit: 100, imageLimit: 50, allowOpenAI: true, allowClaude: true, allowGemini: true, allowImage: true },
    "2": { openaiLimit: 60, claudeLimit: 40, geminiLimit: 50, imageLimit: 20, allowOpenAI: true, allowClaude: true, allowGemini: true, allowImage: true },
    "3": { openaiLimit: 30, claudeLimit: 15, geminiLimit: 20, imageLimit: 5, allowOpenAI: true, allowClaude: false, allowGemini: true, allowImage: true },
    "4": { openaiLimit: 10, claudeLimit: 0, geminiLimit: 5, imageLimit: 0, allowOpenAI: true, allowClaude: false, allowGemini: false, allowImage: false },
    "5": { openaiLimit: 200, claudeLimit: 150, geminiLimit: 180, imageLimit: 100, allowOpenAI: true, allowClaude: true, allowGemini: true, allowImage: true }
  });

  // Simulator for Chatbot Tool Calls inside browser
  const [simulatedPrompt, setSimulatedPrompt] = useState("Generate an image of an astronaut playing guitar on the moon.");
  const [simulatingCall, setSimulatingCall] = useState(false);
  const [simulatedImageUrl, setSimulatedImageUrl] = useState("");

  // Bot Skills Studio State
  const [selectedTenantForSkillStudio, setSelectedTenantForSkillStudio] = useState("1");
  const [botPersonalityName, setBotPersonalityName] = useState("Aether Omni Assistant");
  const [botImageSkillEnabled, setBotImageSkillEnabled] = useState(true);
  const [botTargetImageModel, setBotTargetImageModel] = useState("gpt-image-2");
  
  const [skillsChatInput, setSkillsChatInput] = useState("");
  const [skillsChatMessages, setSkillsChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; imageUrl?: string; isError?: boolean }>>([
    { sender: "bot", text: "Hello! I am your tenant bot. Ask me anything, or trigger image gen skills." }
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // General Settings
  const [encryptionKey, setEncryptionKey] = useState("aether-kms-aes-256-gcm-master-key-prod");
  const [globalKillSwitch, setGlobalKillSwitch] = useState(false);
  const [tenantSearch, setTenantSearch] = useState("");

  // Modals
  const [creditTopupModal, setCreditTopupModal] = useState<{ isOpen: boolean; tenantId: string; amount: number } | null>(null);
  const [providerEditModal, setProviderEditModal] = useState<AIProvider | null>(null);
  const [tenantLimitsModal, setTenantLimitsModal] = useState<string | null>(null); // holds tenant ID

  // Live Token & Cost Telemetry simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTenants = tenants.filter(t => t.status === "active");
      if (activeTenants.length === 0) return;
      const randomTenant = activeTenants[Math.floor(Math.random() * activeTenants.length)];
      
      const activeProviders = providers.filter(p => p.status === "enabled");
      const randomProvider = activeProviders[Math.floor(Math.random() * activeProviders.length)];
      const randomModel = randomProvider.models[Math.floor(Math.random() * randomProvider.models.length)];

      const inputs = Math.floor(Math.random() * 4000) + 128;
      const outputs = Math.floor(Math.random() * 2000) + 64;
      const latency = Math.floor(Math.random() * 1500) + 150;
      
      // Calculate realistic 2026 pricing
      let multiplier = 0.0015; // default per 1k
      if (randomModel.includes("gpt-4o")) multiplier = 0.005;
      if (randomModel.includes("claude-3-7")) multiplier = 0.008;
      if (randomModel.includes("deepseek-r1")) multiplier = 0.002;
      if (randomModel.includes("free")) multiplier = 0;
      const cost = ((inputs + outputs) / 1000) * multiplier;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newLog: TokenLog = {
        id: "tl_" + Date.now(),
        tenant: randomTenant.slug,
        model: randomModel,
        inputTokens: inputs,
        outputTokens: outputs,
        latency,
        cost: Number(cost.toFixed(5)),
        time: timeStr
      };

      setTokenLogs(prev => [newLog, ...prev.slice(0, 20)]);

      // Asynchronously update provider spend
      setProviders(prev => prev.map(p => {
        if (p.code === randomProvider.code) {
          return { ...p, monthlySpend: Number((p.monthlySpend + cost).toFixed(2)) };
        }
        return p;
      }));

      // Increment tenant usage
      setTenants(prev => prev.map(t => {
        if (t.slug === randomTenant.slug) {
          return { ...t, usage: t.usage + 1 };
        }
        return t;
      }));

    }, 7000);

    return () => clearInterval(interval);
  }, [tenants, providers]);

  // Synchronize target model when tenant changes or their allowed models change
  useEffect(() => {
    const tenant = tenants.find(t => t.id === selectedTenantForSkillStudio);
    if (!tenant) return;
    const planTier = tenant.planId;
    const tierConfig = tierFeatures[planTier];
    if (!tierConfig) return;
    
    const allowedImageModels = ALL_SYSTEM_MODELS.filter(sm => 
      sm.category === "Image" && tierConfig.allowedModels.includes(sm.id)
    );
    
    if (allowedImageModels.length > 0) {
      if (!allowedImageModels.some(m => m.id === botTargetImageModel)) {
        setBotTargetImageModel(allowedImageModels[0].id);
      }
    }
  }, [selectedTenantForSkillStudio, tierFeatures]);

  // Financial Calculations
  const calculatedTotalMRR = tenants.reduce((acc, t) => acc + (t.status === "active" ? t.mrr : 0), 0);
  const calculatedTotalCosts = providers.reduce((acc, p) => acc + p.monthlySpend, 0);
  const calculatedNetProfit = calculatedTotalMRR - calculatedTotalCosts;
  const calculatedMargin = calculatedTotalMRR > 0 ? (calculatedNetProfit / calculatedTotalMRR) * 100 : 0;

  // Filtered revenue values (simulated month-wise)
  const getRevenueStats = () => {
    let multiplier = 1.0;
    if (selectedMonth !== "All") {
      multiplier = 0.083; // roughly 1/12th
    }
    return {
      revenue: calculatedTotalMRR * multiplier,
      costs: calculatedTotalCosts * multiplier,
      profit: calculatedNetProfit * multiplier
    };
  };

  const currentStats = getRevenueStats();

  const handleTopupSubmit = () => {
    if (!creditTopupModal) return;
    const { tenantId, amount } = creditTopupModal;
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, creditsBalance: t.creditsBalance + amount };
      }
      return t;
    }));
    setCreditTopupModal(null);
  };

  const handleProviderSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerEditModal) return;
    setProviders(prev => prev.map(p => p.id === providerEditModal.id ? providerEditModal : p));
    setProviderEditModal(null);
  };

  const toggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === "active" ? "suspended" : "active" };
      }
      return t;
    }));
  };

  // Add custom model handler
  const handleAddNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelToAdd.trim()) return;
    setProviders(prev => prev.map(p => {
      if (p.code === selectedProviderForModel) {
        if (p.models.includes(modelToAdd.trim())) return p;
        return { ...p, models: [...p.models, modelToAdd.trim()] };
      }
      return p;
    }));
    setModelToAdd("");
    alert(`Model "${modelToAdd}" added successfully to provider "${selectedProviderForModel}"!`);
  };

  const handleImpersonate = (slug: string) => {
    alert(`Initiating secure administrator bypass for tenant: "${slug}". Redirecting...`);
    router.push(`/c/${slug}`);
  };

  // Handle simulated bot generation tool call
  const triggerSimulation = () => {
    setSimulatingCall(true);
    setSimulatedImageUrl("");
    setTimeout(() => {
      setSimulatingCall(false);
      const cleanPrompt = encodeURIComponent(simulatedPrompt.trim().replace(/\s+/g, '_'));
      const width = imageMeshConfig.defaultWidth;
      const height = imageMeshConfig.defaultHeight;
      const style = imageMeshConfig.provider === "dalle3" ? `&style=${imageMeshConfig.dalleStyle}&quality=${imageMeshConfig.dalleQuality}` : "";
      
      if (imageMeshConfig.provider === "dalle3") {
        setSimulatedImageUrl(`https://image.pollinations.ai/p/${cleanPrompt}?width=${width}&height=${height}&model=flux${style}`);
      } else if (imageMeshConfig.provider === "gpt-image-2") {
        const modeFlag = `&mode=${imageMeshConfig.gptImageMode}&consistency=${imageMeshConfig.multiImageConsistency}&steps=${imageMeshConfig.reasoningSteps}`;
        setSimulatedImageUrl(`https://image.pollinations.ai/p/${cleanPrompt}?width=${width}&height=${height}&model=flux${modeFlag}`);
      } else {
        setSimulatedImageUrl(`https://image.pollinations.ai/p/${cleanPrompt}?width=${width}&height=${height}&model=flux`);
      }
    }, 2000);
  };

  // Bot Skills Studio messaging controller
  const handleSkillsChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsChatInput.trim()) return;

    const userMsg = skillsChatInput.trim();
    setSkillsChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setSkillsChatInput("");
    setIsBotThinking(true);

    setTimeout(() => {
      setIsBotThinking(false);
      // Fetch details of active tenant plan checks
      const tenant = tenants.find(t => t.id === selectedTenantForSkillStudio);
      if (!tenant) return;
      const planTier = tenant.planId; // free, starter, growth, scale
      const tierConfig = tierFeatures[planTier];
      
      const containsImageKeywords = /image|generate|photo|picture|draw/i.test(userMsg);

      if (containsImageKeywords) {
        // 1. Check if Image Skill is active
        if (!botImageSkillEnabled) {
          setSkillsChatMessages(prev => [...prev, {
            sender: "bot",
            text: "❌ Image Generation skill is currently disabled for this bot. Please toggle the skill switches in the dashboard panel.",
            isError: true
          }]);
          return;
        }

        // 2. Check if selected model is allowed in their subscription plan tier
        const isAllowed = tierConfig?.allowedModels.includes(botTargetImageModel);
        if (!isAllowed) {
          setSkillsChatMessages(prev => [...prev, {
            sender: "bot",
            text: `🔒 Model Lock: The selected image generation model "${botTargetImageModel}" is locked under your tenant plan (${planTier.toUpperCase()}). Please upgrade to access premium models like gpt-image-2.`,
            isError: true
          }]);
          return;
        }

        // 3. Allowed, generate mock image via API
        const cleanPrompt = encodeURIComponent(userMsg.replace(/image|generate|photo|picture|draw/gi, "").trim().replace(/\s+/g, '_') || "default_render");
        const resolvedUrl = `https://image.pollinations.ai/p/${cleanPrompt}?width=800&height=800&model=flux`;
        
        setSkillsChatMessages(prev => [...prev, {
          sender: "bot",
          text: `🎨 Tool Triggered: Generating image using active provider model: "${botTargetImageModel}"...`,
          imageUrl: resolvedUrl
        }]);
      } else {
        // Standard conversational response
        setSkillsChatMessages(prev => [...prev, {
          sender: "bot",
          text: `Hello! I received your query. To trigger image tool calling, include keyword 'image' or 'generate' in your prompt.`
        }]);
      }
    }, 1500);
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || 
    t.slug.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060814] text-gray-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-indigo-600/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[500px] bg-purple-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Global Dashboard Navigation Header */}
      <header className="px-6 py-4.5 border-b border-white/5 bg-[#0a0d1f]/85 backdrop-blur-lg sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] transition text-gray-400 hover:text-white cursor-pointer"
            title="Toggle Sidebar Layout"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          
          <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Aether Admin Console <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SaaS Owner</span>
            </h1>
            <p className="text-[9px] text-gray-500">2026 Enterprise Multi-Tenant Control Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {globalKillSwitch && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-semibold animate-pulse">
              <ShieldAlert className="h-3 w-3" />
              EMERGENCY LOCK
            </span>
          )}
          <button 
            onClick={() => router.push("/login")}
            className="text-xs px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/[0.05] transition text-gray-400 hover:text-white cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Core Layout */}
      <div className="flex-grow flex flex-col md:flex-row w-full mx-auto">
        
        {/* Collapsible Sidebar Navigation Drawer */}
        <aside className={`border-r border-white/5 bg-[#080b18]/65 backdrop-blur-md transition-all duration-300 flex flex-col justify-between py-6 ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
          <div className="flex flex-col gap-1 text-xs px-3">
            <div className={`text-[9px] font-mono text-gray-500 uppercase tracking-widest px-3 mb-3 ${isSidebarCollapsed ? "hidden" : "block"}`}>
              Management Modules
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "overview" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Overview & Revenue</span>
            </button>

            <button
              onClick={() => setActiveTab("providers")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "providers" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Cpu className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>AI Provider Mesh</span>
            </button>

            <button
              onClick={() => setActiveTab("features")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "features" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Sliders className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Tier Feature Gates</span>
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "skills" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Bot className="h-4.5 w-4.5 shrink-0 text-indigo-400 animate-pulse" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Bot Skills Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("tenants")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "tenants" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Users className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Tenants Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "leads" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Contact className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Leads CRM</span>
            </button>

            <button
              onClick={() => setActiveTab("cloud")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "cloud" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Cloud className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Cloud & Databases</span>
            </button>

            <button
              onClick={() => setActiveTab("rag")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "rag" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Database className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Vector & RAG Space</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "integrations" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Workflow className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Social & Bot APIs</span>
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "email" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Mail className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Email Gateways</span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "billing" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <CreditCard className="h-4.5 w-4.5" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>Payments & Webhooks</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                activeTab === "settings" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold" : "border border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span className={isSidebarCollapsed ? "hidden" : "block"}>System Core</span>
            </button>
          </div>

          {/* Quick System Summary */}
          {!isSidebarCollapsed && (
            <div className="mx-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-2.5">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Engine Status</span>
              <div className="flex flex-col gap-1.5 text-[10px]">
                <div className="flex justify-between items-center text-gray-400">
                  <span>DB RLS</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Stripe Gateway</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Razorpay API</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Central Display Workspace & Settings Panels */}
        <main className="flex-grow min-w-0 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW & REVENUE ANALYTICS */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Date Filters & Calendar Picker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-white/[0.01] border border-white/5">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">SaaS Business Analytics</h2>
                  <p className="text-[10px] text-gray-500">Filter monthly subscription income against active provider cost limits.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-[#0d1021] border border-white/15 rounded-xl px-3 py-1.5 text-[11px]">
                    <span className="text-gray-500 mr-2">Year:</span>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)} 
                      className="bg-transparent text-white border-none outline-none font-semibold cursor-pointer"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>

                  <div className="flex items-center bg-[#0d1021] border border-white/15 rounded-xl px-3 py-1.5 text-[11px]">
                    <span className="text-gray-500 mr-2">Month:</span>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)} 
                      className="bg-transparent text-white border-none outline-none font-semibold cursor-pointer"
                    >
                      <option value="All">All Months</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="bg-[#0d1021] border border-white/15 text-white rounded-xl px-3 py-1.5 text-[11px] focus:outline-none"
                    />
                    <span className="text-gray-600 text-xs">to</span>
                    <input 
                      type="date" 
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="bg-[#0d1021] border border-white/15 text-white rounded-xl px-3 py-1.5 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign className="h-12 w-12 text-white" /></div>
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Gross SaaS Revenue</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-heading text-white">${currentStats.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span className="text-green-400 text-[10px] font-mono font-semibold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +18.4%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">Filter period totals</p>
                </div>

                <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu className="h-12 w-12 text-white" /></div>
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">AI API Costing</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-heading text-white">${currentStats.costs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span className="text-amber-400 text-[10px] font-semibold">Mesh limits active</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">Accumulated token expenses</p>
                </div>

                <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="h-12 w-12 text-white" /></div>
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Calculated Net Profit</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-heading text-green-400">${currentStats.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">MRR minus direct provider costs</p>
                </div>

                <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Sliders className="h-12 w-12 text-white" /></div>
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Net Profit Margin</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-heading text-indigo-300">{calculatedMargin.toFixed(1)}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">Premium SaaS cost efficiency</p>
                </div>

              </div>

              {/* Financial Charts Display (Pure SVG for high-end feel) */}
              <div className="rounded-2xl premium-glass border border-white/5 p-6 bg-[#080b18]/70 flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-sm text-white">Monthly Profit & Loss Telemetry</h3>
                  <p className="text-[10px] text-gray-500">Visual mapping of platform revenue (indigo) vs API model costs (amber).</p>
                </div>

                <div className="w-full h-64 flex items-end justify-between px-4 pb-2 border-b border-white/5 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 bottom-1/4 border-b border-white/[0.03]" />
                  <div className="absolute inset-x-0 bottom-2/4 border-b border-white/[0.03]" />
                  <div className="absolute inset-x-0 bottom-3/4 border-b border-white/[0.03]" />

                  {/* January */}
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t h-[45%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$152</span>
                      </div>
                      <div className="w-4 bg-amber-500/80 hover:bg-amber-400 rounded-t h-[15%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$50</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Jan</span>
                  </div>

                  {/* February */}
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t h-[52%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$176</span>
                      </div>
                      <div className="w-4 bg-amber-500/80 hover:bg-amber-400 rounded-t h-[18%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$61</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Feb</span>
                  </div>

                  {/* March */}
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t h-[65%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$220</span>
                      </div>
                      <div className="w-4 bg-amber-500/80 hover:bg-amber-400 rounded-t h-[22%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$74</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Mar</span>
                  </div>

                  {/* April */}
                  <div className="flex flex-col items-center gap-2 w-12">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t h-[75%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$254</span>
                      </div>
                      <div className="w-4 bg-amber-500/80 hover:bg-amber-400 rounded-t h-[28%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">$95</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Apr</span>
                  </div>

                  {/* May */}
                  <div className="flex flex-col items-center gap-2 w-12 font-bold text-gray-400">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t h-[94%] transition-all duration-300 relative group animate-pulse">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-100 font-bold">${calculatedTotalMRR}</span>
                      </div>
                      <div className="w-4 bg-amber-500/80 hover:bg-amber-400 rounded-t h-[38%] transition-all duration-300 relative group">
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-600 text-[9px] font-mono px-1 py-0.5 rounded opacity-100 font-bold">${calculatedTotalCosts.toFixed(0)}</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono">May (Live)</span>
                  </div>

                  {/* Projections */}
                  <div className="flex flex-col items-center gap-2 w-12 opacity-40">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-600 border border-dashed border-indigo-400/50 rounded-t h-[95%]"></div>
                      <div className="w-4 bg-amber-600 border border-dashed border-amber-400/50 rounded-t h-[40%]"></div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Jun</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 w-12 opacity-40">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div className="w-4 bg-indigo-600 border border-dashed border-indigo-400/50 rounded-t h-[98%]"></div>
                      <div className="w-4 bg-amber-600 border border-dashed border-amber-400/50 rounded-t h-[42%]"></div>
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500">Jul</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI PROVIDER MESH & FALLBACKS */}
          {activeTab === "providers" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Fallback configuration block */}
              <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">SaaS-Wide 3-Tier AI Fallback Failover Router</h3>
                    <p className="text-[10px] text-gray-500">If the main LLM call fails due to credentials error or network failure, request routes automatically to the fallback targets in order.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold font-mono">FALLBACK LEVEL 1 (PRIMARY ESCAPE)</label>
                    <select
                      value={fallbacks.tier1}
                      onChange={(e) => setFallbacks({ ...fallbacks, tier1: e.target.value })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    >
                      <option value="openai/gpt-4o-mini">OpenAI: gpt-4o-mini</option>
                      <option value="gemini/gemini-2.5-flash">Gemini: gemini-2.5-flash</option>
                      <option value="deepseek/deepseek-r1">DeepSeek: deepseek-r1</option>
                      <option value="openrouter/free">OpenRouter: Free models</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold font-mono">FALLBACK LEVEL 2 (SECONDARY ESCAPE)</label>
                    <select
                      value={fallbacks.tier2}
                      onChange={(e) => setFallbacks({ ...fallbacks, tier2: e.target.value })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    >
                      <option value="gemini/gemini-2.5-flash">Gemini: gemini-2.5-flash</option>
                      <option value="openai/gpt-4o-mini">OpenAI: gpt-4o-mini</option>
                      <option value="openrouter/free">OpenRouter: Free models</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold font-mono">FALLBACK LEVEL 3 (FINAL BACKUP)</label>
                    <select
                      value={fallbacks.tier3}
                      onChange={(e) => setFallbacks({ ...fallbacks, tier3: e.target.value })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    >
                      <option value="openrouter/free">OpenRouter: Free models</option>
                      <option value="gemini/gemini-2.5-flash">Gemini: gemini-2.5-flash</option>
                      <option value="n8n/n8n-custom-sub-agent">n8n: custom failover webhook</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => alert("Fallback routing schema updated. Validated across active endpoints.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-md"
                  >
                    Save Failover Priorities
                  </button>
                </div>
              </div>

              {/* Cloud Image Generation Mesh Control Card (With GPT Image 2 and DALL-E-3 Options) */}
              <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Image className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-sm text-white">Global SaaS Image Generation Mesh (Cloud APIs)</h3>
                      <p className="text-[10px] text-gray-500">Configure cloud endpoints to trigger text-to-image workflows on customer websites/agents.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setImageMeshConfig({ ...imageMeshConfig, active: !imageMeshConfig.active })}
                    className="cursor-pointer"
                  >
                    {imageMeshConfig.active ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold font-mono">IMAGE API PROVIDER</label>
                    <select
                      value={imageMeshConfig.provider}
                      onChange={(e) => {
                        const prov = e.target.value;
                        const defModel = prov === "gpt-image-2" ? "gpt-image-2" : prov === "dalle3" ? "dall-e-3" : "flux-schnell";
                        setImageMeshConfig({ ...imageMeshConfig, provider: prov, defaultModel: defModel });
                      }}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    >
                      <option value="gpt-image-2">OpenAI GPT Image 2 (2026 Flagship)</option>
                      <option value="dalle3">OpenAI DALL-E-3 (Legacy/Retired)</option>
                      <option value="pollinations">Pollinations.ai (Free Cloud API)</option>
                      <option value="together">Together AI (FLUX & SDXL)</option>
                      <option value="fal">Fal.ai (State-of-the-Art Latent)</option>
                      <option value="cloudflare">Cloudflare Workers AI (Free Tier)</option>
                      <option value="huggingface">Hugging Face Serverless (Free API)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold font-mono">DEFAULT MODEL NAME</label>
                    <input
                      type="text"
                      value={imageMeshConfig.defaultModel}
                      onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, defaultModel: e.target.value })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-gray-400 font-semibold font-mono">IMAGE CUSTOM CLOUD API KEY (IF APPLICABLE)</label>
                    <input
                      type="password"
                      value={imageMeshConfig.apiKey}
                      placeholder={imageMeshConfig.provider === "pollinations" ? "No Key Required for Pollinations" : "Enter Cloud API key here..."}
                      disabled={imageMeshConfig.provider === "pollinations"}
                      onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, apiKey: e.target.value })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* GPT Image 2 Custom Settings */}
                {imageMeshConfig.provider === "gpt-image-2" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs p-4 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/20">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-indigo-400 font-bold font-mono">GPT IMAGE 2 GENERATION MODE</label>
                      <select
                        value={imageMeshConfig.gptImageMode}
                        onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, gptImageMode: e.target.value })}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none font-mono"
                      >
                        <option value="instant">Instant Mode (Fast / Real-time)</option>
                        <option value="thinking">Thinking Mode (Reasoning-based / Ultra Rich Coherence)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-indigo-400 font-bold font-mono">THINKING REASONING STEPS</label>
                      <input
                        type="number"
                        disabled={imageMeshConfig.gptImageMode !== "thinking"}
                        value={imageMeshConfig.reasoningSteps}
                        onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, reasoningSteps: Number(e.target.value) })}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none font-mono disabled:opacity-50"
                      />
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-xl bg-[#060814] border border-white/5">
                      <div>
                        <span className="font-semibold block text-indigo-300">Multi-Image Consistency</span>
                        <span className="text-[9px] text-gray-500">Perfect for consecutive storyboards</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageMeshConfig({ ...imageMeshConfig, multiImageConsistency: !imageMeshConfig.multiImageConsistency })}
                        className="cursor-pointer"
                      >
                        {imageMeshConfig.multiImageConsistency ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* DALL-E-3 Custom Settings */}
                {imageMeshConfig.provider === "dalle3" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-indigo-400 font-bold font-mono">DALL-E-3 RENDERING QUALITY</label>
                      <select
                        value={imageMeshConfig.dalleQuality}
                        onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, dalleQuality: e.target.value })}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                      >
                        <option value="standard">Standard Resolution (Fast / Efficient)</option>
                        <option value="hd">High Definition HD (Super Fine / Ultra Rich)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-indigo-400 font-bold font-mono">DALL-E-3 STYLIZATION MODE</label>
                      <select
                        value={imageMeshConfig.dalleStyle}
                        onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, dalleStyle: e.target.value })}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                      >
                        <option value="vivid">Vivid Style (Dramatic, Colorful, Artistic)</option>
                        <option value="natural">Natural Style (Photorealistic, True-to-Life)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold">DEFAULT WIDTH (PX)</label>
                    <input
                      type="number"
                      value={imageMeshConfig.defaultWidth}
                      onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, defaultWidth: Number(e.target.value) })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-400 font-semibold">DEFAULT HEIGHT (PX)</label>
                    <input
                      type="number"
                      value={imageMeshConfig.defaultHeight}
                      onChange={(e) => setImageMeshConfig({ ...imageMeshConfig, defaultHeight: Number(e.target.value) })}
                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-end justify-end">
                    <button 
                      onClick={() => alert("Global Image Generation Mesh settings saved and synced with frontend assets.")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition w-full md:w-auto text-center"
                    >
                      Save Image Configurations
                    </button>
                  </div>
                </div>
              </div>

              {/* Providers grid & Model search and add */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Providers active list */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white">Active AI Providers & API Cap Tracking</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {providers.map((p) => (
                      <div key={p.id} className="rounded-2xl premium-glass border border-white/5 p-4.5 bg-white/[0.01] flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{p.name}</span>
                              <span className={`text-[8.5px] uppercase px-2 py-0.5 rounded-full font-semibold border ${
                                p.status === "enabled" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-gray-500 mt-1 block">Key: {p.keyLabel}</span>
                          </div>
                          <button 
                            onClick={() => setProviderEditModal(p)}
                            className="p-1.5 border border-white/10 rounded-lg hover:bg-white/[0.05] transition text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-400 font-semibold">Models active:</span>
                          <div className="flex flex-wrap gap-1">
                            {p.models.map(m => (
                              <span key={m} className="text-[9px] font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-300">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex justify-between text-[11px] font-mono text-gray-400">
                          <span>Spend: ${p.monthlySpend.toFixed(2)}</span>
                          <span>Cap: ${p.monthlyCap}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model addition module */}
                <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Search & Register Model</span>
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Add new LLM model definitions to the provider meshes to instantly expose them inside tenant playground dropdowns.
                  </p>

                  <form onSubmit={handleAddNewModel} className="flex flex-col gap-3 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 font-semibold">Select Target Provider</label>
                      <select
                        value={selectedProviderForModel}
                        onChange={(e) => setSelectedProviderForModel(e.target.value)}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                      >
                        {providers.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-400 font-semibold">Model Identifier (2026 Active/Beta)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. gpt-5-preview, claude-4-haiku"
                        value={modelToAdd}
                        onChange={(e) => setModelToAdd(e.target.value)}
                        className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono placeholder:text-gray-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Register Model</span>
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: TIER FEATURE GATES */}
          {activeTab === "features" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Software Feature-Tier Gatekeeper</h2>
                <p className="text-xs text-gray-400">Control modules, quotas, and limits on a per-subscription basis. Changes apply dynamically across all tenants assigned to the respective tier.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
                {Object.entries(tierFeatures).map(([tierKey, config]) => (
                  <div key={tierKey} className="rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white capitalize">{tierKey} Tier</span>
                        <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded">Gate config</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Manage functional accesses</p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex flex-col gap-3 text-xs">
                      {/* E-Com Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">E-Commerce Features</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], ecom: !prev[tierKey].ecom }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.ecom ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Landing Page Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Landing Page Creator</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], landingPage: !prev[tierKey].landingPage }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.landingPage ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Booking System Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Booking System</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], booking: !prev[tierKey].booking }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.booking ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Chatbot Customizer Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Bot Customization</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], customChat: !prev[tierKey].customChat }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.customChat ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* BYO Key Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">BYO API Key Mode</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], byoKey: !prev[tierKey].byoKey }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.byoKey ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Integrations Header */}
                      <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Allowed Integrations</div>

                      
                      {/* Lead Management Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Lead Management & CRM</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowLeadManagement: !prev[tierKey].allowLeadManagement }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowLeadManagement ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* n8n Webhook Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Workflow className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">n8n Webhook</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowN8n: !prev[tierKey].allowN8n }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowN8n ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Email Gateway Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">SMTP / Gmail Gateway</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowEmailGateway: !prev[tierKey].allowEmailGateway }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowEmailGateway ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Telegram Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Send className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Telegram Bot Token</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowTelegram: !prev[tierKey].allowTelegram }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowTelegram ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Personal AI Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Personal AI API Keys</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowPersonalAI: !prev[tierKey].allowPersonalAI }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowPersonalAI ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* YouTube Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">YouTube Video API</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowYouTube: !prev[tierKey].allowYouTube }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowYouTube ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* RAG Storage Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Database className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">RAG Vector Storage</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowRAGStorage: !prev[tierKey].allowRAGStorage }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowRAGStorage ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Firebase Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Server className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Firebase Integration</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowFirebase: !prev[tierKey].allowFirebase }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowFirebase ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>

                      {/* Supabase Toggle */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-300">Supabase Integration</span>
                        </div>
                        <button
                          onClick={() => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], allowSupabase: !prev[tierKey].allowSupabase }
                          }))}
                          className="cursor-pointer"
                        >
                          {config.allowSupabase ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 my-2" />

                    {/* Tier Allowed Models Checklist Matrix */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Allowed Models Matrix</span>
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto bg-black/35 p-2 rounded-lg border border-white/5">
                        {ALL_SYSTEM_MODELS.map((model) => {
                          const isChecked = config.allowedModels.includes(model.id);
                          return (
                            <label key={model.id} className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-white cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const list = isChecked 
                                    ? config.allowedModels.filter(m => m !== model.id)
                                    : [...config.allowedModels, model.id];
                                  setTierFeatures(prev => ({
                                    ...prev,
                                    [tierKey]: { ...prev[tierKey], allowedModels: list }
                                  }));
                                }}
                                className="accent-indigo-500 rounded border-white/10"
                              />
                              <span className="truncate">{model.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-white/5 my-2" />

                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Monthly Tokens Cap</span>
                        <input
                          type="number"
                          value={config.tokenCap}
                          onChange={(e) => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], tokenCap: Number(e.target.value) }
                          }))}
                          className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-right font-mono text-white text-[11px]"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Max Team Seats</span>
                        <input
                          type="number"
                          value={config.teamSeats}
                          onChange={(e) => setTierFeatures(prev => ({
                            ...prev,
                            [tierKey]: { ...prev[tierKey], teamSeats: Number(e.target.value) }
                          }))}
                          className="w-12 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-right font-mono text-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert("SaaS subscription tier gates and allowed models metrics updated successfully.")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition mt-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Feature-Tier Matrices</span>
              </button>

            </div>
          )}

          {/* NEW TAB: BOT SKILLS STUDIO PLAYGROUND */}
          {activeTab === "skills" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Tenant Bot & Skills Configuration Studio</h2>
                <p className="text-xs text-gray-400">Impersonate a tenant, toggle chatbot agentic skills, select model endpoints, and chat in real-time to check tier boundaries.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Bot Settings & Toggles Panel */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                  
                  {/* Select Tenant Card */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Users className="h-4.5 w-4.5" />
                      <span className="font-bold text-xs uppercase font-mono tracking-wider">Impersonated Tenant Profile</span>
                    </div>

                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 font-semibold">Active Tenant Simulator Target</label>
                        <select
                          value={selectedTenantForSkillStudio}
                          onChange={(e) => {
                            setSelectedTenantForSkillStudio(e.target.value);
                            setSkillsChatMessages([
                              { sender: "bot", text: `Active tenant updated. I am now acting on behalf of plan: ${tenants.find(t => t.id === e.target.value)?.planId.toUpperCase()}` }
                            ]);
                          }}
                          className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                        >
                          {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Plan: {t.planId.toUpperCase()})</option>
                          ))}
                        </select>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-1.5">
                        <span className="text-[9.5px] uppercase font-mono text-gray-500 font-bold">Plan Model Privileges:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tierFeatures[tenants.find(t => t.id === selectedTenantForSkillStudio)?.planId || "free"]?.allowedModels.map(modelId => (
                            <span key={modelId} className="text-[8.5px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded">
                              {modelId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill Configuration settings */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <SlidersHorizontal className="h-4.5 w-4.5" />
                      <span className="font-bold text-xs uppercase font-mono tracking-wider">Agentic Skills & Model Setup</span>
                    </div>

                    {(() => {
                      const currentTenantObj = tenants.find(t => t.id === selectedTenantForSkillStudio);
                      const currentTenantPlan = currentTenantObj?.planId || "free";
                      const currentTierConfig = tierFeatures[currentTenantPlan];
                      const hasImageGenAbility = currentTierConfig?.allowedModels.some(mId => {
                        const modelObj = ALL_SYSTEM_MODELS.find(sm => sm.id === mId);
                        return modelObj && modelObj.category === "Image";
                      });

                      const allowedImageModels = ALL_SYSTEM_MODELS.filter(sm => 
                        sm.category === "Image" && currentTierConfig?.allowedModels.includes(sm.id)
                      );

                      return (
                        <div className="flex flex-col gap-4 text-xs">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-gray-400 font-semibold">Bot Personality Name</label>
                            <input
                              type="text"
                              value={botPersonalityName}
                              onChange={(e) => setBotPersonalityName(e.target.value)}
                              className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                            />
                          </div>

                          {/* Render Image Gen Skill ONLY if the plan has image generation ability */}
                          {hasImageGenAbility ? (
                            <>
                              {/* Image Generation Skill Toggle */}
                              <div className="flex justify-between items-center p-3 rounded-xl bg-[#060814] border border-white/5">
                                <div>
                                  <span className="font-semibold block text-gray-300">Image Generation Skill</span>
                                  <span className="text-[10px] text-gray-500">Allows bot to trigger image API calls</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setBotImageSkillEnabled(!botImageSkillEnabled)}
                                  className="cursor-pointer"
                                >
                                  {botImageSkillEnabled ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                                </button>
                              </div>

                              {/* Target Image Model Option Dropdown - ONLY show if Skill is active */}
                              {botImageSkillEnabled && (
                                <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/10 animate-fadeIn">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-gray-400 font-semibold">Select Deployed Image Generation Model</label>
                                    <select
                                      value={botTargetImageModel}
                                      onChange={(e) => setBotTargetImageModel(e.target.value)}
                                      className="bg-[#060814] border border-white/10 text-white rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                                    >
                                      {allowedImageModels.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const activeModelName = ALL_SYSTEM_MODELS.find(sm => sm.id === botTargetImageModel)?.name || botTargetImageModel;
                                      setSkillsChatMessages(prev => [...prev, {
                                        sender: "bot",
                                        text: `✔ Success: Bot deployed to production! Image Generation Skill initialized with model: "${activeModelName}". Ready to execute agentic tools.`
                                      }]);
                                      alert(`Bot successfully deployed to active channels using ${activeModelName}!`);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] py-2 rounded-lg cursor-pointer transition text-center"
                                  >
                                    Deploy Skill to Bot
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 flex flex-col gap-2">
                              <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                                <LockIcon className="h-4.5 w-4.5 shrink-0" />
                                <span>Image Gen Skill Locked</span>
                              </div>
                              <p className="text-[10px] text-gray-500 leading-relaxed">
                                The current plan tier ({currentTenantPlan.toUpperCase()}) does not allow Image Generation capabilities. 
                                Go to the **Tier Feature Gates** matrix tab to add image models to this subscription tier.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                </div>

                {/* Real-time chat sandbox playground */}
                <div className="lg:col-span-7 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col justify-between min-h-[480px]">
                  
                  {/* Chat Box Header */}
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{botPersonalityName}</span>
                        <span className="text-[9px] text-gray-500">Active Impersonation Room</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSkillsChatMessages([{ sender: "bot", text: "Room session flushed. Ready to chat." }])}
                      className="text-[10px] text-gray-400 hover:text-white px-2 py-1 rounded border border-white/10 hover:bg-white/[0.02]"
                    >
                      Clear Chats
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 max-h-[360px]">
                    {skillsChatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest px-1">
                          {msg.sender === "user" ? "You (Tenant)" : botPersonalityName}
                        </span>
                        
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : msg.isError 
                            ? "bg-red-500/10 border border-red-500/15 text-red-400 rounded-tl-none font-mono" 
                            : "bg-[#060814]/85 border border-white/5 text-gray-300 rounded-tl-none"
                        }`}>
                          {msg.text}

                          {msg.imageUrl && (
                            <div className="mt-3.5 flex flex-col gap-1.5">
                              <img loading="lazy" src={msg.imageUrl} 
                                alt="Skill Return" 
                                className="w-64 h-auto max-h-48 object-cover rounded-lg border border-white/15"
                              />
                              <span className="text-[8.5px] text-indigo-300 font-mono">
                                Response status: 200 OK • Model: {botTargetImageModel}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isBotThinking && (
                      <div className="self-start flex flex-col gap-1 items-start max-w-[85%]">
                        <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest">{botPersonalityName}</span>
                        <div className="p-3 bg-[#060814]/85 border border-white/5 text-gray-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 animate-pulse">
                          <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSkillsChatSubmit} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2">
                    <input
                      type="text"
                      value={skillsChatInput}
                      onChange={(e) => setSkillsChatInput(e.target.value)}
                      placeholder="Ask the bot something, or type 'generate an image of a red cat' to test skills..."
                      className="flex-grow bg-[#060814] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl cursor-pointer transition flex items-center justify-center shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TENANTS TELEMETRY & TOKEN LOGS */}
          {activeTab === "tenants" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">Tenants Tracking & Token Telemetry</h2>
                  <p className="text-xs text-gray-400">Real-time mapping of request logs, provider costs, and active system-wide rate limit caps.</p>
                </div>

                <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs max-w-xs w-full focus-within:ring-1 focus-within:ring-indigo-500">
                  <Search className="h-4 w-4 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search tenant..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="bg-transparent border-none p-0 focus:outline-none text-white w-full placeholder:text-gray-700"
                  />
                </div>
              </div>

              {/* Tenants Telemetry and Rate Limits list */}
              <div className="rounded-2xl premium-glass border border-white/5 overflow-hidden bg-white/[0.01]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-mono uppercase tracking-wider bg-white/[0.02]">
                      <th className="p-4 font-semibold">Tenant Slug</th>
                      <th className="p-4 font-semibold">Credits Balance</th>
                      <th className="p-4 font-semibold">Plan Level</th>
                      <th className="p-4 font-semibold">Live Rate Limits (req/min)</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white">{t.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">slug: {t.slug} • {t.email}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-gray-300">
                          {t.creditsBalance.toLocaleString()}
                        </td>
                        <td className="p-4 capitalize">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/15">
                            {t.planId}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={t.rateLimitMin}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setTenants(prev => prev.map(item => item.id === t.id ? { ...item, rateLimitMin: val } : item));
                              }}
                              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-white font-mono text-xs"
                            />
                            <span className="text-gray-500 text-[10px]">req / min</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setTenantLimitsModal(t.id)}
                              className="px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-600/20 text-indigo-300 transition cursor-pointer flex items-center gap-1"
                              title="Configure Granular Limits (OpenAI, Claude, Gemini, Image Gen)"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                              <span>Limits Matrix</span>
                            </button>
                            <button
                              onClick={() => setCreditTopupModal({ isOpen: true, tenantId: t.id, amount: 50000 })}
                              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/20 text-gray-400 transition cursor-pointer flex items-center gap-1"
                            >
                              <Coins className="h-3.5 w-3.5" />
                              <span>Top-Up</span>
                            </button>
                            <button
                              onClick={() => handleImpersonate(t.slug)}
                              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] text-gray-400 hover:text-white transition cursor-pointer"
                              title="Impersonate Console"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => toggleTenantStatus(t.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                t.status === "active" ? "border-white/10 hover:bg-red-500/10 hover:text-red-400" : "border-green-500/30 text-green-400"
                              }`}
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Real-time Token Ticker Logs */}
              <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-ping" />
                    Real-Time Token Usage & Costs Telemetry Ticker
                  </h3>
                  <span className="text-[10px] font-mono text-gray-500">Live feed resolving...</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {tokenLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3 rounded-xl border border-white/5 bg-[#060814]/80">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-indigo-400 font-bold font-mono">@{log.tenant}</span>
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                        <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[10px]">
                          {log.model}
                        </span>
                        <div className="flex gap-2 text-[10px] text-gray-500">
                          <span>In: <strong className="text-gray-300 font-mono">{log.inputTokens}</strong></span>
                          <span>Out: <strong className="text-gray-300 font-mono">{log.outputTokens}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono self-end sm:self-auto">
                        <span className="text-gray-500">{log.latency}ms latency</span>
                        <span className="text-green-400 font-bold">${log.cost.toFixed(5)}</span>
                        <span className="text-gray-600 text-[10px]">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* LEADS DASHBOARD */}
          {activeTab === "leads" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">Global Leads CRM (Airtable View)</h2>
                  <p className="text-xs text-gray-400">View and manage captured leads across all tenants, their conversion status, and conversation context.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                  <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2 text-xs max-w-xs focus-within:ring-1 focus-within:ring-indigo-500">
                    <Search className="h-4 w-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search name, phone, email..."
                      value={leadsSearch}
                      onChange={(e) => setLeadsSearch(e.target.value)}
                      className="bg-transparent border-none p-0 focus:outline-none text-white w-full placeholder:text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl premium-glass border border-white/5 overflow-x-auto bg-white/[0.01]">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-mono uppercase tracking-wider bg-white/[0.02]">
                      <th className="p-4 font-semibold">Tenant</th>
                      <th className="p-4 font-semibold">Lead Details</th>
                      <th className="p-4 font-semibold">Contact Info</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allLeads.filter(l => l.name.toLowerCase().includes(leadsSearch.toLowerCase()) || l.email.toLowerCase().includes(leadsSearch.toLowerCase()) || l.phone?.includes(leadsSearch)).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">No leads captured yet.</td>
                      </tr>
                    ) : (
                      allLeads.filter(l => l.name.toLowerCase().includes(leadsSearch.toLowerCase()) || l.email.toLowerCase().includes(leadsSearch.toLowerCase()) || l.phone?.includes(leadsSearch)).map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/[0.01] transition-all group">
                          <td className="p-4">
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300 font-mono">{lead.tenantId}</span>
                          </td>
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

          {/* NEW TAB: CLOUD & DATABASES (Firebase + Supabase Deep integration setup) */}
          {activeTab === "cloud" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Cloud Infrastructure & Database Meshes</h2>
                <p className="text-xs text-gray-400">Configure global authentication scopes, relational database policies, and filesystems storage endpoints.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Configuration Inputs Panel */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Supabase Deep Integration Card */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Database className="h-5 w-5 text-indigo-400" />
                        <div>
                          <h3 className="font-bold text-xs text-white">Supabase Infrastructure Integration</h3>
                          <span className="text-[9px] text-indigo-400 font-mono">Row Level Security (RLS) & pgvector Enabled</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSupabaseConfig({ ...supabaseConfig, active: !supabaseConfig.active })}
                        className="cursor-pointer"
                      >
                        {supabaseConfig.active ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Supabase Project API URL</label>
                        <input
                          type="text"
                          value={supabaseConfig.url}
                          onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Supabase Anon Public API Key</label>
                        <input
                          type="password"
                          value={supabaseConfig.anonKey}
                          onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Supabase Service Role Secret Key (Bypasses RLS)</label>
                        <input
                          type="password"
                          value={supabaseConfig.serviceRoleKey}
                          onChange={(e) => setSupabaseConfig({ ...supabaseConfig, serviceRoleKey: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Raw PostgreSQL Connection String</label>
                        <input
                          type="text"
                          value={supabaseConfig.postgresUrl}
                          onChange={(e) => setSupabaseConfig({ ...supabaseConfig, postgresUrl: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 mt-1">
                        <div>
                          <span className="font-semibold block text-gray-300">Synchronize Users on Auth Actions</span>
                          <span className="text-[10px] text-gray-500">Automatically sync logins into local user json cache</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSupabaseConfig({ ...supabaseConfig, userSyncActive: !supabaseConfig.userSyncActive })}
                          className="cursor-pointer"
                        >
                          {supabaseConfig.userSyncActive ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Integration Card */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Cloud className="h-5 w-5 text-indigo-400" />
                        <div>
                          <h3 className="font-bold text-xs text-white">Firebase Suite Integration</h3>
                          <span className="text-[9px] text-gray-500 font-mono">Google Login OAuth & Firebase Storage buckets</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setFirebaseConfig({ ...firebaseConfig, active: !firebaseConfig.active })}
                        className="cursor-pointer"
                      >
                        {firebaseConfig.active ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Firebase API Key</label>
                          <input
                            type="password"
                            value={firebaseConfig.apiKey}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Auth Domain</label>
                          <input
                            type="text"
                            value={firebaseConfig.authDomain}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Project ID</label>
                          <input
                            type="text"
                            value={firebaseConfig.projectId}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Storage Bucket</label>
                          <input
                            type="text"
                            value={firebaseConfig.storageBucket}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">App ID</label>
                          <input
                            type="text"
                            value={firebaseConfig.appId}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Messaging Sender ID</label>
                          <input
                            type="text"
                            value={firebaseConfig.messagingSenderId}
                            onChange={(e) => setFirebaseConfig({ ...firebaseConfig, messagingSenderId: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 mt-1">
                        <div>
                          <span className="font-semibold block text-gray-300">Google OAuth Sign-in Redirects</span>
                          <span className="text-[10px] text-gray-500">Expose popup credentials workflows on login portals</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFirebaseConfig({ ...firebaseConfig, googleLoginEnabled: !firebaseConfig.googleLoginEnabled })}
                          className="cursor-pointer"
                        >
                          {firebaseConfig.googleLoginEnabled ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Cloud credentials and schemas saved. Client assets initialized.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition w-full"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Cloud Engine Configs</span>
                  </button>

                </div>

                {/* Cloud DB documentation instructions */}
                <div className="lg:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Cloud API Setup Documentation</h3>
                  </div>

                  <div className="flex flex-col gap-4 leading-relaxed text-gray-400">
                    <div>
                      <span className="font-bold text-gray-200 block mb-1">1. Supabase Postgres Credentials:</span>
                      <p className="text-[10px] text-gray-500">
                        In the Supabase Console, navigate to <strong>Settings &gt; Database</strong> to fetch your Postgres URL. 
                        Enable the <code>pgvector</code> extension inside the SQL editor by running:
                      </p>
                      <code className="block bg-[#060814] p-2 mt-1.5 rounded font-mono text-[9px] text-indigo-300">
                        CREATE EXTENSION IF NOT EXISTS vector;
                      </code>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="font-bold text-gray-200 block mb-1">2. Firebase Google Authentication Setup:</span>
                      <p className="text-[10px] text-gray-500">
                        Register your SaaS URL inside Firebase console's <strong>Authentication &gt; Sign-in method</strong>. 
                        Under Google config, register web client IDs and copy your credentials into the fields on the left.
                      </p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="font-bold text-gray-200 block mb-1">3. Storage Buckets Access:</span>
                      <p className="text-[10px] text-gray-500">
                        To enable image uploads inside tenant stores, set Firebase/Supabase storage rules to allow read/write scopes:
                      </p>
                      <code className="block bg-[#060814] p-2 mt-1.5 rounded font-mono text-[9px] text-indigo-300 truncate">
                        allow read, write: if request.auth != null;
                      </code>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* NEW TAB: VECTOR & RAG STORAGE (Free & Paid Pinecone/Qdrant/Milvus configs) */}
          {activeTab === "rag" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Vector Databases & RAG Storage Nodes</h2>
                <p className="text-xs text-gray-400">Manage vector indexing engines. Select between open-source free tools (Chroma) or paid scalable APIs (Pinecone Serverless).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Vector Nodes List */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {ragProviders.map((rag) => (
                    <div key={rag.id} className="p-4.5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database className="h-5 w-5 text-indigo-400" />
                          <div>
                            <span className="font-bold text-xs text-white">{rag.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Endpoint: {rag.url}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className={`text-[8.5px] uppercase font-semibold px-2 py-0.5 rounded border ${
                            rag.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-gray-400 border-white/10"
                          }`}>
                            {rag.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRagProviders(prev => prev.map(item => {
                                if (item.id === rag.id) {
                                  return { ...item, status: item.status === "active" ? "inactive" : "active" };
                                }
                                return { ...item, status: "inactive" }; // exclusive RAG provider active at a time
                              }));
                            }}
                            className="cursor-pointer"
                          >
                            {rag.status === "active" ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="grid grid-cols-3 gap-3 text-[11px] font-mono text-gray-400">
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">Active Vector Index</span>
                          <span className="text-gray-300">{rag.indexName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">Distance Metric</span>
                          <span className="text-gray-300 capitalize">{rag.distanceMetric}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">Auth Header</span>
                          <span className="text-gray-300 truncate">{rag.apiKeyLabel}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => setActiveRagEdit(rag)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-300"
                        >
                          Configure API & Index settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vector documentation details */}
                <div className="md:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 text-xs">
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">RAG Tuning Manual</h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Retrieve document payloads using chunk sizes of 1,000 characters by default. 
                    If you use <strong>Pinecone Serverless</strong>, set your embedding vector dimension to <strong>1536</strong> to match standard OpenAI `text-embedding-3-small` dimensions.
                  </p>

                  <div className="h-px bg-white/5" />

                  <div className="flex flex-col gap-2.5 text-xs">
                    <span className="font-semibold text-gray-300">Distance Metric Properties:</span>
                    <ul className="list-disc pl-4 text-gray-400 flex flex-col gap-1.5">
                      <li><strong>Cosine Similarity:</strong> Best for angular matches (e.g. OpenAI embeddings).</li>
                      <li><strong>Dot Product:</strong> Fastest metric for normalized vectors.</li>
                      <li><strong>Euclidean Distance:</strong> Standard distance calculation for flat clusters.</li>
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 8: SOCIAL & BOT APIS (With Live Chatbot Image Tool Call simulator) */}
          {activeTab === "integrations" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Social & Media Integrations</h2>
                <p className="text-xs text-gray-400">Connect YouTube transcript extractors and Telegram bot tokens directly into the platform playground.</p>
              </div>

              {/* Chatbot Image tool call simulator widget */}
              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] flex flex-col md:flex-row gap-5">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Bot className="h-5 w-5" />
                    <span className="font-bold text-xs uppercase tracking-wider font-mono">Live Chatbot Image Generation Tool Call Simulator</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Test how chatbot agents trigger the image generation tool dynamically when receiving custom prompts. The simulator routes requests based on your active Super Admin Image Mesh setting (currently using: <strong className="text-indigo-300 uppercase">{imageMeshConfig.provider}</strong>).
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simulatedPrompt}
                      onChange={(e) => setSimulatedPrompt(e.target.value)}
                      placeholder="Prompt to test image generation..."
                      className="flex-grow bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={triggerSimulation}
                      disabled={simulatingCall}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                      {simulatingCall ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>Execute Tool</span>
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-80 rounded-xl border border-white/5 bg-[#060814]/80 p-3.5 flex flex-col gap-3.5 min-h-[140px] justify-center items-center relative overflow-hidden">
                  {simulatingCall ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                      <span className="text-[10px] text-gray-500 font-mono animate-pulse">Running image_generation tool...</span>
                    </div>
                  ) : simulatedImageUrl ? (
                    <div className="w-full flex flex-col gap-2 items-center">
                      <span className="text-[9px] uppercase font-mono text-green-400 border border-green-500/20 px-2 py-0.5 rounded bg-green-500/10 self-start">
                        Tool Return URL (200 OK)
                      </span>
                      <img loading="lazy" src={simulatedImageUrl} 
                        alt="Simulated result" 
                        className="w-full h-36 object-cover rounded-lg border border-white/10 hover:scale-105 transition duration-300"
                      />
                      <span className="text-[9px] font-mono text-gray-600 truncate w-full block text-center">
                        Model: {imageMeshConfig.defaultModel} ({imageMeshConfig.defaultWidth}x{imageMeshConfig.defaultHeight})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-600 font-mono text-center">No active tool execution logged. Try typing a prompt and executing the tool.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Integration forms config */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Telegram Bot */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="h-5 w-5 text-indigo-400" />
                        <div>
                          <h3 className="font-bold text-xs text-white">Telegram Bot Gateway Integration</h3>
                          <span className="text-[9px] text-gray-500 font-mono">Enable automated chats via Telegram bots</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setTelegramConfig({ ...telegramConfig, active: !telegramConfig.active })}
                        className="cursor-pointer"
                      >
                        {telegramConfig.active ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Telegram Bot Token (from @BotFather)</label>
                        <input
                          type="password"
                          value={telegramConfig.botToken}
                          onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Bot Username (@...)</label>
                          <input
                            type="text"
                            value={telegramConfig.botUsername}
                            onChange={(e) => setTelegramConfig({ ...telegramConfig, botUsername: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Webhook Secret Token</label>
                          <input
                            type="text"
                            value={telegramConfig.secretToken}
                            onChange={(e) => setTelegramConfig({ ...telegramConfig, secretToken: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 mt-1">
                        <div>
                          <span className="font-semibold block text-gray-300">Bot Webhook Status</span>
                          <span className="text-[10px] text-gray-500">
                            {telegramConfig.registered ? "Webhook registered at Telegram API" : "Webhook pending registration"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTelegramConfig({ ...telegramConfig, registered: true });
                            alert("Mock webhook registered successfully at Telegram Bot endpoints: HTTP 200 OK.");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] text-indigo-400 text-xs font-semibold cursor-pointer"
                        >
                          Register Webhook
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Video API */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Youtube className="h-5 w-5 text-indigo-400" />
                        <div>
                          <h3 className="font-bold text-xs text-white">YouTube Data API Integration</h3>
                          <span className="text-[9px] text-gray-500 font-mono">Automatically fetch transcripts and process media contents</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setYoutubeConfig({ ...youtubeConfig, active: !youtubeConfig.active })}
                        className="cursor-pointer"
                      >
                        {youtubeConfig.active ? <ToggleRight className="h-8 w-8 text-green-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Google Cloud Console v3 API Key</label>
                        <input
                          type="password"
                          value={youtubeConfig.apiKey}
                          onChange={(e) => setYoutubeConfig({ ...youtubeConfig, apiKey: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Max Video Duration (Minutes)</label>
                          <input
                            type="number"
                            value={youtubeConfig.maxDurationMinutes}
                            onChange={(e) => setYoutubeConfig({ ...youtubeConfig, maxDurationMinutes: Number(e.target.value) })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-gray-400 font-semibold font-mono">Fallback Language ISO</label>
                          <input
                            type="text"
                            value={youtubeConfig.transcriptLanguage}
                            onChange={(e) => setYoutubeConfig({ ...youtubeConfig, transcriptLanguage: e.target.value })}
                            className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 mt-1">
                        <div>
                          <span className="font-semibold block text-gray-300">Parse YouTube Transcripts Automatically</span>
                          <span className="text-[10px] text-gray-500">Inject transcripts into agent knowledge base index</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setYoutubeConfig({ ...youtubeConfig, autoTranscript: !youtubeConfig.autoTranscript })}
                          className="cursor-pointer"
                        >
                          {youtubeConfig.autoTranscript ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Social bot triggers and YouTube configurations saved successfully.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition w-full"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Integrations</span>
                  </button>

                </div>

                {/* Bots setups details docs */}
                <div className="lg:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Bots Setup Guidelines</h3>
                  </div>

                  <div className="flex flex-col gap-3.5 leading-relaxed text-gray-400">
                    <div>
                      <span className="font-bold text-gray-200 block mb-1">Telegram Bot Token retrieval:</span>
                      <p className="text-[10px] text-gray-500">
                        Chat with the official <strong>@BotFather</strong> on Telegram. 
                        Send the command <code>/newbot</code>, choose a display name and unique username, and copy the API token generated.
                      </p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="font-bold text-gray-200 block mb-1">YouTube transcript processing:</span>
                      <p className="text-[10px] text-gray-500">
                        Register a project inside your Google Cloud Developer Console. 
                        Enable the <strong>YouTube Data API v3</strong> service, create an API credential key, and copy it to the form inputs on the left.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: EMAIL GATEWAYS */}
          {activeTab === "email" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Global SaaS Email Gateway Routing</h2>
                <p className="text-xs text-gray-400">Configure public SMTP and transactional APIs. Aether Free Tier utilizes a custom Gmail SMTP Relay by default.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Email Gateways List */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {emailGateways.map((eg) => (
                    <div key={eg.id} className="p-4.5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-5 w-5 text-indigo-400" />
                          <div>
                            <span className="font-bold text-xs text-white">{eg.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono block mt-0.5">Sender: {eg.senderEmail}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className={`text-[8.5px] uppercase font-semibold px-2 py-0.5 rounded border ${
                            eg.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-gray-400 border-white/10"
                          }`}>
                            {eg.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailGateways(prev => prev.map(item => {
                                if (item.id === eg.id) {
                                  return { ...item, status: item.status === "active" ? "inactive" : "active" };
                                }
                                return { ...item, status: "inactive" }; // only 1 active at a time
                              }));
                            }}
                            className="cursor-pointer"
                          >
                            {eg.status === "active" ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="grid grid-cols-3 gap-3 text-[11px] font-mono text-gray-400">
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">SMTP Host</span>
                          <span className="text-gray-300">{eg.smtpHost}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">SMTP Port</span>
                          <span className="text-gray-300">{eg.smtpPort}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block text-[9px] uppercase font-semibold">Auth credentials</span>
                          <span className="text-gray-300 truncate">{eg.apiKeyLabel}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => setActiveEmailEdit(eg)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-300"
                        >
                          Configure SMTP & credentials
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email instructions */}
                <div className="md:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 text-xs">
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Gateway Configuration Guide</h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    SaaS tenants require confirmation and onboarding emails. 
                    If you use the <strong>Aether SMTP Relay (Gmail Free)</strong>, ensure your Google account has generated an "App Password" to bypass MFA restrictions.
                  </p>

                  <div className="h-px bg-white/5" />

                  <div className="flex flex-col gap-2.5 text-xs">
                    <span className="font-semibold text-gray-300">Popular setup steps:</span>
                    <ol className="list-decimal pl-4.5 text-gray-400 flex flex-col gap-1.5">
                      <li>Select your email gateway.</li>
                      <li>Click "Configure SMTP & credentials".</li>
                      <li>Input credentials and click Save.</li>
                      <li>Toggle gateway active.</li>
                    </ol>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: BILLING & WEBHOOKS GATEWAY CONFIG */}
          {activeTab === "billing" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">Payment Gateways & Webhook Receivers</h2>
                  <p className="text-xs text-gray-400">Configure Stripe (global checkout) and Razorpay (India payments). Enable active states directly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Forms configs */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                  
                  {/* Stripe config */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">ST</div>
                        <div>
                          <h4 className="font-bold text-xs text-white">Stripe Checkout configuration</h4>
                          <span className="text-[9px] text-gray-500 font-mono">Used globally for credit card / link payments</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentConfig({ ...paymentConfig, stripeActive: !paymentConfig.stripeActive })}
                        className="cursor-pointer"
                      >
                        {paymentConfig.stripeActive ? <ToggleRight className="h-8 w-8 text-indigo-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Stripe Live Secret Key</label>
                        <input
                          type="password"
                          value={paymentConfig.stripeLiveSecret}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeLiveSecret: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Stripe Webhook Secret (whsec_...)</label>
                        <input
                          type="password"
                          value={paymentConfig.stripeWebhookSecret}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeWebhookSecret: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Razorpay config */}
                  <div className="p-5 rounded-2xl premium-glass border border-white/5 bg-[#0b0e22] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">RZ</div>
                        <div>
                          <h4 className="font-bold text-xs text-white">Razorpay India Gateway</h4>
                          <span className="text-[9px] text-gray-500 font-mono">Used inside India region for UPI, Card, Netbanking</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentConfig({ ...paymentConfig, razorpayActive: !paymentConfig.razorpayActive })}
                        className="cursor-pointer"
                      >
                        {paymentConfig.razorpayActive ? <ToggleRight className="h-8 w-8 text-indigo-400" /> : <ToggleLeft className="h-8 w-8 text-gray-600" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Razorpay Key ID</label>
                        <input
                          type="text"
                          value={paymentConfig.razorpayKeyId}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeyId: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Razorpay Key Secret</label>
                        <input
                          type="password"
                          value={paymentConfig.razorpayKeySecret}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayKeySecret: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-gray-400 font-semibold font-mono">Razorpay Webhook Secret</label>
                        <input
                          type="password"
                          value={paymentConfig.razorpayWebhookSecret}
                          onChange={(e) => setPaymentConfig({ ...paymentConfig, razorpayWebhookSecret: e.target.value })}
                          className="bg-[#060814] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => alert("Payment secrets updated securely inside local credentials vaults.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition w-full"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Payment Gateways</span>
                  </button>

                </div>

                {/* Developer Documentation Section */}
                <div className="lg:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22] flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Developer Webhook Setup Guides</h3>
                  </div>

                  <div className="flex flex-col gap-3.5 leading-relaxed text-gray-400">
                    <div>
                      <span className="font-bold text-gray-200 block mb-1">Stripe Webhook Target:</span>
                      <code className="block bg-[#060814] p-2.5 rounded border border-white/5 font-mono text-[10px] text-indigo-300 truncate select-all">
                        http://localhost:4022/api/webhooks/stripe
                      </code>
                      <p className="text-[10px] text-gray-500 mt-1">Configure events: `checkout.session.completed`, `customer.subscription.updated`.</p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="font-bold text-gray-200 block mb-1">Razorpay Webhook Target:</span>
                      <code className="block bg-[#060814] p-2.5 rounded border border-white/5 font-mono text-[10px] text-indigo-300 truncate select-all">
                        http://localhost:4022/api/webhooks/razorpay
                      </code>
                      <p className="text-[10px] text-gray-500 mt-1">Configure events: `subscription.charged`, `payment.authorized`.</p>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                      <span className="font-bold text-gray-200 block mb-1">Multi-Region Routing Logic:</span>
                      <p className="text-[10px] text-gray-500">
                        When billing is triggered, currency detection checks geographical IP metadata. 
                        INR currencies route to Razorpay checkout, while other currencies route directly to Stripe engine automatically.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

                    {/* TAB: SUBSCRIPTION PLANS */}
          {activeTab === "plans" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">Subscription Plans Management</h2>
                  <p className="text-xs text-gray-400">Manage plan names, pricing, taxes, and create new pricing tiers for tenants.</p>
                </div>
                <button 
                  onClick={() => {
                    const newPlan: Plan = {
                      id: "new_plan_" + Date.now(),
                      name: "New Plan",
                      priceUsd: 0,
                      priceInr: 0,
                      regularPriceUsd: 0,
                      regularPriceInr: 0,
                      taxPercentage: 0,
                      monthlyCredits: 0,
                      botsCount: "1 Bot",
                      teamSeats: "1 Seat"
                    };
                    setPlans([...plans, newPlan]);
                    setEditingPlanId(newPlan.id);
                    setEditingPlanData(newPlan);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="h-4 w-4" />
                  Create New Plan
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {plans.map(plan => (
                  <div key={plan.id} className="rounded-2xl premium-glass border border-white/5 p-5 bg-[#0b0e22]">
                    {editingPlanId === plan.id && editingPlanData ? (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Plan ID (slug)</label>
                            <input type="text" value={editingPlanData.id} onChange={e => setEditingPlanData({...editingPlanData, id: e.target.value})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Plan Name</label>
                            <input type="text" value={editingPlanData.name} onChange={e => setEditingPlanData({...editingPlanData, name: e.target.value})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Offer Price (USD)</label>
                            <input type="number" value={editingPlanData.priceUsd} onChange={e => setEditingPlanData({...editingPlanData, priceUsd: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Regular Price (USD)</label>
                            <input type="number" value={editingPlanData.regularPriceUsd || 0} onChange={e => setEditingPlanData({...editingPlanData, regularPriceUsd: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Offer Price (INR)</label>
                            <input type="number" value={editingPlanData.priceInr} onChange={e => setEditingPlanData({...editingPlanData, priceInr: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Regular Price (INR)</label>
                            <input type="number" value={editingPlanData.regularPriceInr || 0} onChange={e => setEditingPlanData({...editingPlanData, regularPriceInr: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Tax %</label>
                            <input type="number" value={editingPlanData.taxPercentage || 0} onChange={e => setEditingPlanData({...editingPlanData, taxPercentage: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Monthly Credits</label>
                            <input type="number" value={editingPlanData.monthlyCredits} onChange={e => setEditingPlanData({...editingPlanData, monthlyCredits: Number(e.target.value)})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Bots Count</label>
                            <input type="text" value={editingPlanData.botsCount} onChange={e => setEditingPlanData({...editingPlanData, botsCount: e.target.value})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-gray-400 font-semibold font-mono">Team Seats</label>
                            <input type="text" value={editingPlanData.teamSeats} onChange={e => setEditingPlanData({...editingPlanData, teamSeats: e.target.value})} className="bg-[#060814] border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => {
                              setPlans(plans.map(p => p.id === plan.id ? editingPlanData : p));
                              setEditingPlanId(null);
                              setEditingPlanData(null);
                            }}
                            className="bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 px-4 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            Save Plan
                          </button>
                          <button 
                            onClick={() => {
                              setEditingPlanId(null);
                              setEditingPlanData(null);
                            }}
                            className="bg-gray-800 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm("Delete this plan?")) {
                                setPlans(plans.filter(p => p.id !== plan.id));
                              }
                            }}
                            className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{plan.name} <span className="text-[10px] text-gray-500 font-mono ml-2">({plan.id})</span></h4>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-gray-400">Offer: <span className="text-green-400">${plan.priceUsd}</span></span>
                            <span className="text-gray-400 line-through decoration-red-500/50">Regular: ${plan.regularPriceUsd || 0}</span>
                            <span className="text-gray-400">Tax: <span className="text-indigo-300">{plan.taxPercentage || 0}%</span></span>
                            <span className="text-gray-400">Credits: <span className="text-amber-400">{plan.monthlyCredits.toLocaleString()}</span></span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setEditingPlanId(plan.id);
                            setEditingPlanData(plan);
                          }}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs transition flex items-center gap-2"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS & GLOBAL SYSTEM */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Global Console System Settings</h2>
                <p className="text-xs text-gray-400">Configure global configurations, default integrations, and platform kill switches.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Global Settings Configuration */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  
                  {/* System Core */}
                  <div className="rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-4">
                    <h3 className="font-bold text-xs text-white">System Core Configuration</h3>

                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-400 font-semibold">AES-256-GCM Master Encryption Key</label>
                        <input
                          type="text"
                          value={encryptionKey}
                          onChange={(e) => setEncryptionKey(e.target.value)}
                          className="bg-white/[0.01] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-2xl border border-red-500/10 p-5 bg-red-500/[0.01] flex flex-col gap-4">
                    <h3 className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      SaaS Emergency Controls
                    </h3>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
                      <div>
                        <span className="text-xs text-gray-300 font-semibold block">Global API Kill-Switch</span>
                        <span className="text-[10px] text-gray-500">Temporarily freeze all outbound API LLM requests across all tenants.</span>
                      </div>
                      <button 
                        onClick={() => setGlobalKillSwitch(!globalKillSwitch)}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        {globalKillSwitch ? (
                          <ToggleRight className="h-9 w-9 text-red-500" />
                        ) : (
                          <ToggleLeft className="h-9 w-9 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Master system settings saved successfully.")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition w-full"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Master Settings</span>
                  </button>

                </div>

                {/* Setup manual details */}
                <div className="md:col-span-5 rounded-2xl premium-glass border border-white/5 p-5 bg-white/[0.01] flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">System Blueprints</h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Aether AI uses Row-Level-Security (RLS) policies at the database layer. 
                    The Super Admin credentials bypass these safety checks automatically when executing backend jobs or generating telemetry statistics.
                  </p>

                  <div className="h-px bg-white/5" />

                  <div className="flex flex-col gap-2.5 text-xs">
                    <span className="font-semibold text-gray-300">Quick Dev Links:</span>
                    <a href="http://localhost:4022" target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1">
                      <span>Customer Landing Page</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a href="http://localhost:4022/onboarding" className="text-indigo-400 hover:underline flex items-center gap-1">
                      <span>Onboarding Wizard Setup</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: CREDIT TOPUP */}
      {creditTopupModal && creditTopupModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-3xl premium-glass border border-white/10 p-6 max-w-sm w-full bg-[#0b0e20] flex flex-col gap-5 shadow-2xl animate-scaleIn">
            <div>
              <h3 className="font-bold text-base text-white">Manual Credit Top-Up</h3>
              <p className="text-xs text-gray-400 mt-1">
                Grant promotional or custom credits directly to tenant:{" "}
                <span className="font-bold text-indigo-400">
                  {tenants.find(t => t.id === creditTopupModal.tenantId)?.name}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-400 font-semibold font-mono">CREDITS TO GRANT</label>
              <input
                type="number"
                value={creditTopupModal.amount}
                onChange={(e) => setCreditTopupModal(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreditTopupModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleTopupSubmit}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-semibold cursor-pointer text-white flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-4.5 w-4.5" />
                <span>Confirm Grant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROVIDER EDIT */}
      {providerEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleProviderSave} className="rounded-3xl premium-glass border border-white/10 p-6 max-w-md w-full bg-[#0b0e20] flex flex-col gap-5 shadow-2xl animate-scaleIn">
            <div>
              <h3 className="font-bold text-base text-white">Edit Provider Mesh</h3>
              <p className="text-xs text-gray-400 mt-1">Configure limits and rotation keys for {providerEditModal.name}</p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold font-mono">Monthly Budget Cap (USD)</label>
                <input
                  type="number"
                  value={providerEditModal.monthlyCap}
                  onChange={(e) => setProviderEditModal({ ...providerEditModal, monthlyCap: Number(e.target.value) })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold font-mono">Provider Key Label</label>
                <input
                  type="text"
                  value={providerEditModal.keyLabel}
                  onChange={(e) => setProviderEditModal({ ...providerEditModal, keyLabel: e.target.value })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5">
                <div>
                  <span className="font-semibold block text-gray-300">Status</span>
                  <span className="text-[10px] text-gray-500">Enable/disable for global tenants</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProviderEditModal({ ...providerEditModal, status: providerEditModal.status === "enabled" ? "disabled" : "enabled" })}
                  className="cursor-pointer"
                >
                  {providerEditModal.status === "enabled" ? (
                    <ToggleRight className="h-9 w-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProviderEditModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-semibold cursor-pointer text-white"
              >
                Save Provider
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: GRANULAR LIMITS & ACCESS MATRIX PER TENANT */}
      {tenantLimitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-3xl premium-glass border border-white/10 p-6 max-w-md w-full bg-[#0b0e20] flex flex-col gap-5 shadow-2xl animate-scaleIn">
            <div>
              <h3 className="font-bold text-base text-white">Granular Access & Limits Matrix</h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure model restrictions and rate limits for:{" "}
                <span className="font-bold text-indigo-400">
                  {tenants.find(t => t.id === tenantLimitsModal)?.name}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              
              {/* OpenAI policies */}
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">OpenAI Mesh Access</span>
                  <button
                    onClick={() => setTenantLimits(prev => ({
                      ...prev,
                      [tenantLimitsModal]: { ...prev[tenantLimitsModal], allowOpenAI: !prev[tenantLimitsModal].allowOpenAI }
                    }))}
                    className="cursor-pointer"
                  >
                    {tenantLimits[tenantLimitsModal]?.allowOpenAI ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                  </button>
                </div>
                {tenantLimits[tenantLimitsModal]?.allowOpenAI && (
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>OpenAI Rate Limit</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tenantLimits[tenantLimitsModal]?.openaiLimit || 0}
                        onChange={(e) => setTenantLimits(prev => ({
                          ...prev,
                          [tenantLimitsModal]: { ...prev[tenantLimitsModal], openaiLimit: Number(e.target.value) }
                        }))}
                        className="w-16 bg-[#060814] border border-white/10 rounded px-2 py-0.5 text-right text-white font-mono"
                      />
                      <span>req / min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Claude policies */}
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Anthropic Claude Access</span>
                  <button
                    onClick={() => setTenantLimits(prev => ({
                      ...prev,
                      [tenantLimitsModal]: { ...prev[tenantLimitsModal], allowClaude: !prev[tenantLimitsModal].allowClaude }
                    }))}
                    className="cursor-pointer"
                  >
                    {tenantLimits[tenantLimitsModal]?.allowClaude ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                  </button>
                </div>
                {tenantLimits[tenantLimitsModal]?.allowClaude && (
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>Claude Rate Limit</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tenantLimits[tenantLimitsModal]?.claudeLimit || 0}
                        onChange={(e) => setTenantLimits(prev => ({
                          ...prev,
                          [tenantLimitsModal]: { ...prev[tenantLimitsModal], claudeLimit: Number(e.target.value) }
                        }))}
                        className="w-16 bg-[#060814] border border-white/10 rounded px-2 py-0.5 text-right text-white font-mono"
                      />
                      <span>req / min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gemini 3.1/2.5 Pro policies */}
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Gemini 3.1 & 2.5 Pro Access</span>
                  <button
                    onClick={() => setTenantLimits(prev => ({
                      ...prev,
                      [tenantLimitsModal]: { ...prev[tenantLimitsModal], allowGemini: !prev[tenantLimitsModal].allowGemini }
                    }))}
                    className="cursor-pointer"
                  >
                    {tenantLimits[tenantLimitsModal]?.allowGemini ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                  </button>
                </div>
                {tenantLimits[tenantLimitsModal]?.allowGemini && (
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>Gemini Rate Limit</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tenantLimits[tenantLimitsModal]?.geminiLimit || 0}
                        onChange={(e) => setTenantLimits(prev => ({
                          ...prev,
                          [tenantLimitsModal]: { ...prev[tenantLimitsModal], geminiLimit: Number(e.target.value) }
                        }))}
                        className="w-16 bg-[#060814] border border-white/10 rounded px-2 py-0.5 text-right text-white font-mono"
                      />
                      <span>req / min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Gen API policies */}
              <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-300">Image Generation API Access</span>
                  <button
                    onClick={() => setTenantLimits(prev => ({
                      ...prev,
                      [tenantLimitsModal]: { ...prev[tenantLimitsModal], allowImage: !prev[tenantLimitsModal].allowImage }
                    }))}
                    className="cursor-pointer"
                  >
                    {tenantLimits[tenantLimitsModal]?.allowImage ? <ToggleRight className="h-7 w-7 text-indigo-400" /> : <ToggleLeft className="h-7 w-7 text-gray-600" />}
                  </button>
                </div>
                {tenantLimits[tenantLimitsModal]?.allowImage && (
                  <div className="flex justify-between items-center text-[11px] text-gray-400">
                    <span>Image Gen Limit</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tenantLimits[tenantLimitsModal]?.imageLimit || 0}
                        onChange={(e) => setTenantLimits(prev => ({
                          ...prev,
                          [tenantLimitsModal]: { ...prev[tenantLimitsModal], imageLimit: Number(e.target.value) }
                        }))}
                        className="w-16 bg-[#060814] border border-white/10 rounded px-2 py-0.5 text-right text-white font-mono"
                      />
                      <span>generations / day</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTenantLimitsModal(null)}
                className="flex-grow py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-semibold cursor-pointer text-white text-center"
              >
                Apply Matrix Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EMAIL GATEWAY CONFIGURATION */}
      {activeEmailEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setEmailGateways(prev => prev.map(item => item.id === activeEmailEdit.id ? activeEmailEdit : item));
              setActiveEmailEdit(null);
              alert("Email gateway credentials updated successfully.");
            }} 
            className="rounded-3xl premium-glass border border-white/10 p-6 max-w-md w-full bg-[#0b0e20] flex flex-col gap-5 shadow-2xl animate-scaleIn"
          >
            <div>
              <h3 className="font-bold text-base text-white">Configure Email Gateway</h3>
              <p className="text-xs text-gray-400 mt-1">Set up connection credentials and custom sender for {activeEmailEdit.name}</p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold font-mono">SMTP Host</label>
                  <input
                    type="text"
                    value={activeEmailEdit.smtpHost}
                    onChange={(e) => setActiveEmailEdit({ ...activeEmailEdit, smtpHost: e.target.value })}
                    className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold font-mono">SMTP Port</label>
                  <input
                    type="number"
                    value={activeEmailEdit.smtpPort}
                    onChange={(e) => setActiveEmailEdit({ ...activeEmailEdit, smtpPort: Number(e.target.value) })}
                    className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">Sender Email Address</label>
                <input
                  type="email"
                  value={activeEmailEdit.senderEmail}
                  onChange={(e) => setActiveEmailEdit({ ...activeEmailEdit, senderEmail: e.target.value })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold font-mono">Gateway API Key / Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={activeEmailEdit.apiKeyLabel}
                  onChange={(e) => setActiveEmailEdit({ ...activeEmailEdit, apiKeyLabel: e.target.value })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveEmailEdit(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-semibold cursor-pointer text-white"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: VECTOR/RAG EDIT */}
      {activeRagEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setRagProviders(prev => prev.map(item => item.id === activeRagEdit.id ? activeRagEdit : item));
              setActiveRagEdit(null);
              alert("Vector provider credentials and schemas updated successfully.");
            }} 
            className="rounded-3xl premium-glass border border-white/10 p-6 max-w-md w-full bg-[#0b0e20] flex flex-col gap-5 shadow-2xl animate-scaleIn"
          >
            <div>
              <h3 className="font-bold text-base text-white">Configure Vector Storage Index</h3>
              <p className="text-xs text-gray-400 mt-1">Adjust endpoints and payloads parameters for {activeRagEdit.name}</p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold font-mono">Vector Database URL</label>
                <input
                  type="text"
                  value={activeRagEdit.url}
                  onChange={(e) => setActiveRagEdit({ ...activeRagEdit, url: e.target.value })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold font-mono">Index / Collection Name</label>
                  <input
                    type="text"
                    value={activeRagEdit.indexName}
                    onChange={(e) => setActiveRagEdit({ ...activeRagEdit, indexName: e.target.value })}
                    className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold font-mono">Distance Metric</label>
                  <select
                    value={activeRagEdit.distanceMetric}
                    onChange={(e) => setActiveRagEdit({ ...activeRagEdit, distanceMetric: e.target.value as any })}
                    className="bg-[#0b0e20] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="cosine">Cosine</option>
                    <option value="euclidean">Euclidean</option>
                    <option value="dot_product">Dot Product</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold font-mono">API Key / Access Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={activeRagEdit.apiKeyLabel}
                  onChange={(e) => setActiveRagEdit({ ...activeRagEdit, apiKeyLabel: e.target.value })}
                  className="bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveRagEdit(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.05] transition text-xs font-semibold cursor-pointer text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-semibold cursor-pointer text-white"
              >
                Save Vector Config
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .premium-glass {
          background: rgba(10, 14, 34, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
