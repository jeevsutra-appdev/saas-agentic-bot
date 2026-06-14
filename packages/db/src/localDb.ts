import fs from "fs";
import path from "path";
import { createAetherClient } from "./supabase";

export interface LocalTenantSettings {
  id: string;
  tenantSlug: string;
  openRouterApiKey?: string;
  geminiApiKey?: string;
  openAIApiKey?: string;
  claudeApiKey?: string;
  groqApiKey?: string;
  embeddingProvider?: "openai" | "gemini" | "openrouter" | "local";
  embeddingModel?: string;
  // Telegram Tool Integration
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramToolName?: string;
  // Google Sheets Tool Integration
  googleSheetsWebhookUrl?: string;
  googleSheetsToolName?: string;
  // Gmail / SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  // Zoom Integration
  zoomAccountId?: string;
  zoomClientId?: string;
  zoomClientSecret?: string;
  // Google Calendar Integration
  gcalServiceAccountJson?: string;
  gcalCalendarId?: string;
  // Booking storefront customization (JSON string)
  bookingStorefrontConfig?: string;
  // Subscription Plan
  planId?: string;
  unlockedFeatures?: string[];
  updatedAt: string;
}

export interface LocalBookingService {
  id: string;
  tenantSlug: string;
  categoryId?: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number; // in cents, 0 for free (regular/original price)
  offerPrice?: number; // discounted price in cents (if set, shown as sale price)
  currency?: string;
  image?: string;
  consultationType: "online" | "in_person" | "both";
  isActive: boolean;
  maxAdvanceBookingDays?: number; // how many days ahead can be booked
  bufferMinutes?: number; // break/gap time in minutes between consecutive appointments
  createdAt: string;
}

export interface LocalBookingSchedule {
  id: string;
  tenantSlug: string;
  serviceId?: string; // null means applies to all services
  dayOfWeek: number; // 0=Sun, 1=Mon, ... 6=Sat
  startTime: string; // "HH:MM" 24h format
  endTime: string;
  isActive: boolean;
  timezone?: string; // IANA timezone, e.g. "Asia/Dhaka"
}

export interface LocalAppointment {
  id: string;
  tenantSlug: string;
  serviceId?: string;
  serviceName?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  timeSlot: string;
  date?: string; // ISO date string "YYYY-MM-DD"
  startTime?: string; // "HH:MM"
  endTime?: string;
  timezone?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | string;
  paymentStatus?: "unpaid" | "paid" | "refunded";
  amountCents?: number;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  gcalEventId?: string;
  notes?: string;
  createdAt: string;
}

export interface LocalUser {
  email: string;
  passwordHash: string;
  role: "super_admin" | "client" | "buyer";
  tenantSlug?: string;
  planId?: string;
  creditsBalance?: number;
  storageUsedBytes?: number; // Tracks total bytes of uploaded images
  phone?: string;
  name?: string;
}

export interface LocalCampaign {
  id: string;
  tenantSlug: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
}

export interface LocalLandingPage {
  id: string;
  tenantSlug: string;
  name: string;
  slug: string;
  productId?: string;
  status: "draft" | "published" | "archived";
  pageTree: string; // JSON string of CraftJS serialized state
  settings: string; // JSON string (SEO, OG image, fonts)
  funnelId?: string;
  templateId?: string;
  conversionGoal?: string;
  visits: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalCampaign {
  id: string;
  tenantSlug: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface LocalLandingPageFunnel {
  id: string;
  tenantSlug: string;
  landingPageId: string;
  upsellProductId?: string;
  upsellPrice?: number;
  downsellProductId?: string;
  downsellPrice?: number;
  orderBumpProductId?: string;
  orderBumpPrice?: number;
  orderBumpCopy?: string;
  couponPopupEnabled?: boolean;
  couponCode?: string;
  cartRecoveryEnabled?: boolean;
  createdAt: string;
}

export interface LocalAgent {
  id: string;
  tenantSlug: string;
  name: string;
  systemPrompt: string;
  avatarUrl: string;
  themeColor: string;
  templateStyle: string;
  simulateNonAI?: boolean;
  useOwnModels?: boolean;
  customDomain?: string;
  ragDocumentIds?: string[];
  activeSkills?: string[];
  mainModel?: string;
  fallbackModel1?: string;
  fallbackModel2?: string;
  rateLimitConfig?: { preset: string; maxRequests: number; windowMs: number };
  ecommerceConfig?: {
    offers: { percentage: number; condition: string }[];
    allowedCategoryIds: string[];
    allowedProductIds: string[];
  };
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  createdAt: string;
}

export interface LocalLead {
  id: string;
  tenantSlug: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  type?: "ecom" | "booking" | "general";
  status?: "new" | "interested" | "purchased" | "booked";
  inquiryDetails?: string; // JSON string of products or bookings
  details?: string;
  createdAt: string;
}

export interface LocalCategory {
  id: string;
  tenantSlug: string;
  storeId?: string;
  name: string;
  description: string;
  tags: string[];
  image?: string;
  createdAt: string;
}

export interface LocalProduct {
  id: string;
  tenantSlug: string;
  storeId?: string;
  name: string;
  price: number; // in cents
  stock?: number; // total available inventory
  sku?: string; // unique barcode/identifier
  barcode?: string;
  description: string;
  image?: string; // Base64 data URL string
  categoryId?: string;
  tags?: string[];
  relatedProductIds?: string[];
  isService?: boolean;
  isDigital?: boolean;
  digitalFileLink?: string;
  currency?: string;
  upsellProductId?: string;
  downsellProductId?: string;
  orderBumpProductId?: string;
  orderBumpPrice?: number;
  compareAtPrice?: number;
  isStandaloneLandingPage?: boolean;
  createdAt: string;
}

export interface LocalCustomer {
  id: string;
  tenantSlug: string;
  storeId?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  source: "pos" | "online";
  createdAt: string;
}

export interface LocalStorefront {
  id: string;
  tenantSlug: string;
  brandLogo?: string;
  brandLogoHeight?: number; // px height, e.g. 32 | 40 | 48
  heroImage?: string;
  heroText?: string;
  featuredProductIds?: string[];
  companyName?: string;
  storeLanguage?: string;
  storeDescription?: string;
  globalCurrency?: string;
  primaryColor?: string;
  accentColor?: string;
  heroType?: string;
  enableFooterNav?: boolean;
  assignedAgentId?: string;
  paymentProvider?: "platform" | "stripe_custom" | "razorpay_custom";
  stripePublicKey?: string;
  stripeSecretKey?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  enableCashOnDelivery?: boolean;
  shippingRate?: number;
  freeShippingThreshold?: number;
  estimatedDeliveryDays?: string;
  promoBannerImage?: string;
  promoBannerText?: string;
  promoBannerLink?: string;
  kitchenOffers?: { title: string, desc: string, badge: string, image?: string }[];
  foodCombos?: {
    id: string;
    title: string;
    desc: string;
    price: number;
    image?: string;
    items: { productId: string; quantity: number }[];
  }[];
  layoutSequence?: string[];
  template?: "retail" | "food";
  themePreset?: string;
  storeType?: string; // ecom, food, single
  posEnabled?: boolean;
  posThemeColor?: string;
  posUpiId?: string;
  posPrinterType?: "thermal" | "inkjet_laser";
  posPaperSize?: "80mm" | "58mm" | "a4" | "letter";
  pages?: LocalStorePage[];
  createdAt: string;
}

export interface LocalStorePage {
  slug: string; // 'about' | 'contact' | 'returns' | 'shipping' | 'privacy' | 'terms' | 'faq'
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

export interface LocalDocument {
  id: string;
  tenantSlug: string;
  agentId?: string;
  name: string;
  content: string;
  characters: number;
  previewCoordinates: number[];
  createdAt: string;
}

export interface LocalSkillRun {
  id: string;
  tenantSlug: string;
  skillName: string;
  status: "success" | "failed";
  latencyMs: number;
  payload: string;
  response: string;
  timestamp: string;
}

export interface LocalOrder {
  invoiceNo?: string;
  customerId?: string;
  id: string;
  tenantSlug: string;
  storeId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  productId: string;
  amountCents: number;
  status: "pending" | "paid" | "shipped" | "fulfilled" | "cancelled" | "accepted" | "processing" | "ready" | "out_for_delivery" | "delivered";
  shippingAddress?: string;
  paymentMethod?: string;
  itemsJson?: string;
  prepTimeMinutes?: number;
  lastMessage?: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  deliveryStatus?: "idle" | "assigned" | "picked_up" | "delivered";
  assignedAt?: string;
  deliveryDeadlineMinutes?: number;
  source?: "pos" | "online";
  createdAt: string;
}

export interface LocalAnalyticsEvent {
  id: string;
  tenantSlug: string;
  eventType: "page_view" | "product_click" | "add_to_cart" | "purchase";
  productId?: string;
  country?: string;
  region?: string;
  userAgent?: string;
  createdAt: string;
}

export interface LocalSubscription {
  id: string;
  tenantSlug: string;
  planId: string;
  provider: "stripe" | "razorpay" | "manual";
  providerSubId: string;
  status: "active" | "past_due" | "canceled" | "incomplete";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface LocalCreditLedger {
  id: string;
  tenantSlug: string;
  delta: number;
  reason: "subscription_renewal" | "topup" | "usage" | "admin_grant";
  refId: string;
  balanceAfter: number;
  createdAt: string;
}

export interface LocalInvoice {
  id: string;
  tenantSlug: string;
  provider: "stripe" | "razorpay";
  amount: number;
  currency: string;
  status: "paid" | "open" | "void" | "uncollectible";
  pdfUrl?: string;
  createdAt: string;
}

export interface LocalPosManager {
  id: string;
  tenantSlug: string;
  storeId?: string;
  name: string;
  avatar?: string;
  phone: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LocalDeliveryBoy {
  id: string;
  tenantSlug: string;
  name: string;
  phone: string;
  email?: string;
  vehicle: "bike" | "scooter" | "car" | "van";
  isActive: boolean;
  isOnline: boolean;
  currentOrderId?: string;
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
  totalDeliveries?: number;
  createdAt: string;
}

export type StoreType = "food" | "ecom" | "service" | "single_product";

export interface LocalStore {
  id: string;
  tenantSlug: string;
  storeSlug: string;
  name: string;
  description?: string;
  image?: string;
  storeType: StoreType;
  isActive: boolean;
  primaryColor?: string;
  currency?: string;
  settings?: {
    deliveryFee?: number;
    minOrderAmount?: number;
    estimatedDeliveryMins?: number;
    consultationFee?: number;
    slotDurationMinutes?: number;
    workingHours?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    heroImage?: string;
    productId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LocalChatMessage {
  id: string;
  tenantSlug: string;
  orderId: string;
  from: string;
  fromRole: "admin" | "rider" | "customer";
  text: string;
  timestamp: string;
  read?: boolean;
}

export interface LocalRiderLocation {
  riderId: string;
  tenantSlug: string;
  orderId?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: string;
}

export interface LocalPushSubscriptionRecord {
  id: string;
  tenantSlug: string;
  role: "admin" | "rider";
  riderId?: string;
  subscription: Record<string, unknown>;
  createdAt: string;
}

export interface LocalDatabaseSchema {
  customers: LocalCustomer[];
  users: LocalUser[];
  leads: LocalLead[];
  categories: LocalCategory[];
  products: LocalProduct[];
  storefronts: LocalStorefront[];
  appointments: LocalAppointment[];
  bookingServices: LocalBookingService[];
  bookingSchedules: LocalBookingSchedule[];
  documents: LocalDocument[];
  skillRuns: LocalSkillRun[];
  agents: LocalAgent[];
  orders: LocalOrder[];
  analyticsEvents: LocalAnalyticsEvent[];
  subscriptions: LocalSubscription[];
  creditLedgers: LocalCreditLedger[];
  invoices: LocalInvoice[];
  campaigns: LocalCampaign[];
  landingPages: LocalLandingPage[];
  landingPageFunnels: LocalLandingPageFunnel[];
  tenantSettings: LocalTenantSettings[];
  deliveryBoys: LocalDeliveryBoy[];
  posManagers: LocalPosManager[];
  stores: LocalStore[];
  chatMessages: LocalChatMessage[];
  riderLocations: LocalRiderLocation[];
  pushSubscriptions: LocalPushSubscriptionRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), "..", "db", "local_db.json");

const inMemoryRateLimits: Record<string, { count: number; windowStart: number }> = {};

export class LocalDbController {
  private static cachedDb: LocalDatabaseSchema | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_TTL = 3000; // 3 seconds TTL
  private static isFetching: boolean = false;

  public static async getCustomers(tenantSlug: string, storeId?: string): Promise<LocalCustomer[]> {
    const db = await this.read();
    if (storeId) {
      return db.customers.filter(c => c.tenantSlug === tenantSlug && (!c.storeId || c.storeId === storeId));
    }
    return db.customers.filter(c => c.tenantSlug === tenantSlug);
  }

  public static async addCustomer(customer: Omit<LocalCustomer, "id" | "createdAt">): Promise<LocalCustomer> {
    const db = await this.read();
    const newCustomer: LocalCustomer = {
      ...customer,
      id: "cust_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    db.customers.push(newCustomer);
    await this.write(db);
    return newCustomer;
  }

  public static async checkRateLimit(agentId: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const limit = inMemoryRateLimits[agentId];

    if (!limit || now - limit.windowStart > windowMs) {
      // New window
      inMemoryRateLimits[agentId] = { count: 1, windowStart: now };
      return true;
    }

    if (limit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    limit.count += 1;
    return true;
  }

  public static async getTenantSettings(tenantSlug: string): Promise<LocalTenantSettings | null> {
    const db = await this.read();
    return db.tenantSettings.find(s => s.tenantSlug === tenantSlug) || null;
  }

  public static async getAllTenantSettings(): Promise<LocalTenantSettings[]> {
    const db = await this.read();
    return db.tenantSettings || [];
  }

  public static async upsertTenantSettings(tenantSlug: string, settings: Partial<LocalTenantSettings>) {
    const db = await this.read();
    const existingIndex = db.tenantSettings.findIndex(s => s.tenantSlug === tenantSlug);
    
    if (existingIndex >= 0) {
      db.tenantSettings[existingIndex] = {
        ...db.tenantSettings[existingIndex],
        ...settings,
        updatedAt: new Date().toISOString()
      };
    } else {
      db.tenantSettings.push({
        id: "ts_" + Math.random().toString(36).substring(2, 9),
        tenantSlug,
        ...settings,
        updatedAt: new Date().toISOString()
      });
    }
    await this.write(db);
  }

  private static initDb() {
    try {
      // Check if db directory exists, create if not
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE_PATH)) {
        const initialSchema: LocalDatabaseSchema = {
          users: [
            {
              email: "jeevsutra@gmail.com",
              passwordHash: "Js1234567", // Simulated plain check for simplicity
              role: "super_admin"
            },
            {
              email: "imranhossain786@gmail.com",
              passwordHash: "Js1234567",
              role: "client",
              tenantSlug: "imran-ai",
              planId: "enterprise",
              creditsBalance: 500000
            }
          ],
          leads: [
            {
              id: "lead_1",
              tenantSlug: "imran-ai",
              name: "John Doe",
              email: "john@example.com",
              details: "Interested in Enterprise plan",
              createdAt: new Date().toISOString()
            }
          ],
          categories: [
            {
              id: "cat_1",
              tenantSlug: "imran-ai",
              name: "Premium Services",
              description: "High-end bespoke digital services",
              tags: ["digital", "premium"],
              createdAt: new Date().toISOString()
            }
          ],
          products: [
            {
              id: "prod_1",
              tenantSlug: "imran-ai",
              name: "Custom Support Bundle",
              price: 4900,
              description: "Dedicated 24/7 client portal chat assistance",
              categoryId: "cat_1",
              isService: true,
              createdAt: new Date().toISOString()
            }
          ],
          storefronts: [
            {
              id: "store_1",
              tenantSlug: "imran-ai",
              heroText: "Welcome to our Premium Store",
              createdAt: new Date().toISOString()
            }
          ],
          appointments: [
            {
              id: "appt_1",
              tenantSlug: "imran-ai",
              clientName: "Alice Miller",
              clientEmail: "alice@example.com",
              timeSlot: "Friday at 3:00 PM",
              status: "confirmed",
              createdAt: new Date().toISOString()
            }
          ],
          documents: [
            {
              id: "doc_1",
              tenantSlug: "imran-ai",
              name: "Standard Delivery Rules",
              content: "We deliver products globally within 3 to 5 business days.",
              characters: 56,
              previewCoordinates: [0.0123, -0.0456, 0.089],
              createdAt: new Date().toISOString()
            }
          ],
          skillRuns: [
            {
              id: "run_1",
              tenantSlug: "imran-ai",
              skillName: "lead_capture",
              status: "success",
              latencyMs: 12,
              payload: JSON.stringify({ name: "John Doe", email: "john@example.com" }),
              response: "Lead registered in standard schema",
              timestamp: new Date().toISOString()
            }
          ],
          agents: [
            {
              id: "agent_default",
              tenantSlug: "imran-ai",
              name: "Aether Default Agent",
              systemPrompt: "You are an expert AI assistant of acharya Imran. Your role is to provide customer support, sell all services, and book appointments.",
              avatarUrl: "",
              themeColor: "#6366f1",
              templateStyle: "glass",
              ragDocumentIds: ["doc_1"],
              activeSkills: ["ecommerce_checkout", "lead_capture"],
              createdAt: new Date().toISOString()
            }
          ],
          orders: [],
          analyticsEvents: [],
          subscriptions: [],
          creditLedgers: [],
          invoices: [],
          campaigns: [],
          landingPages: [],
          landingPageFunnels: [],
          tenantSettings: [],
          deliveryBoys: [],
          posManagers: [],
          stores: [],
          customers: [],
          bookingServices: [],
          bookingSchedules: [],
          chatMessages: [],
          riderLocations: [],
          pushSubscriptions: [],
        };

        try {
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialSchema, null, 2), "utf-8");
        } catch (e) {
          console.warn("[LocalDb] initDb write warning:", e);
        }
      }
    } catch (e) {
      console.warn("[LocalDb] initDb warning:", e);
    }
  }

  private static readFromDisk(): LocalDatabaseSchema {
    try {
      this.initDb();
      if (!fs.existsSync(DB_FILE_PATH)) {
        throw new Error("File not found after initialization");
      }
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data) as Partial<LocalDatabaseSchema>;
      
      let needsSave = false;
      const products = parsed.products || [];
      for (const p of products) {
        if (!p.barcode) {
          p.barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
          needsSave = true;
        }
      }
      
      const result: LocalDatabaseSchema = {
        users: parsed.users || [],
        leads: parsed.leads || [],
        categories: parsed.categories || [],
        products: parsed.products || [],
        storefronts: parsed.storefronts || [],
        appointments: parsed.appointments || [],
        bookingServices: parsed.bookingServices || [],
        bookingSchedules: parsed.bookingSchedules || [],
        documents: parsed.documents || [],
        skillRuns: parsed.skillRuns || [],
        agents: parsed.agents || [],
        orders: parsed.orders || [],
        analyticsEvents: parsed.analyticsEvents || [],
        subscriptions: parsed.subscriptions || [],
        creditLedgers: parsed.creditLedgers || [],
        invoices: parsed.invoices || [],
        campaigns: parsed.campaigns || [],
        landingPages: parsed.landingPages || [],
        landingPageFunnels: parsed.landingPageFunnels || [],
        tenantSettings: parsed.tenantSettings || [],
        deliveryBoys: parsed.deliveryBoys || [],
        posManagers: parsed.posManagers || [],
        stores: parsed.stores || [],
        customers: parsed.customers || [],
        chatMessages: (parsed as any).chatMessages || [],
        riderLocations: (parsed as any).riderLocations || [],
        pushSubscriptions: (parsed as any).pushSubscriptions || [],
      };
      if (needsSave) {
        try {
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify(result, null, 2));
        } catch (e) {}
      }
      return result;
    } catch (err) {
      console.warn("[LocalDb] readFromDisk warning (falling back to memory schema):", err);
      return {
        users: [
          {
            email: "jeevsutra@gmail.com",
            passwordHash: "Js1234567",
            role: "super_admin"
          },
          {
            email: "imranhossain786@gmail.com",
            passwordHash: "Js1234567",
            role: "client",
            tenantSlug: "imran-ai",
            planId: "enterprise",
            creditsBalance: 500000
          }
        ],
        leads: [
          {
            id: "lead_1",
            tenantSlug: "imran-ai",
            name: "John Doe",
            email: "john@example.com",
            details: "Interested in Enterprise plan",
            createdAt: new Date().toISOString()
          }
        ],
        categories: [
          {
            id: "cat_1",
            tenantSlug: "imran-ai",
            name: "Premium Services",
            description: "High-end bespoke digital services",
            tags: ["digital", "premium"],
            createdAt: new Date().toISOString()
          }
        ],
        products: [
          {
            id: "prod_1",
            tenantSlug: "imran-ai",
            name: "Custom Support Bundle",
            price: 4900,
            description: "Dedicated 24/7 client portal chat assistance",
            categoryId: "cat_1",
            isService: true,
            createdAt: new Date().toISOString()
          }
        ],
        storefronts: [
          {
            id: "store_1",
            tenantSlug: "imran-ai",
            heroText: "Welcome to our Premium Store",
            createdAt: new Date().toISOString()
          }
        ],
        appointments: [
          {
            id: "appt_1",
            tenantSlug: "imran-ai",
            clientName: "Alice Miller",
            clientEmail: "alice@example.com",
            timeSlot: "Friday at 3:00 PM",
            status: "confirmed",
            createdAt: new Date().toISOString()
          }
        ],
        documents: [
          {
            id: "doc_1",
            tenantSlug: "imran-ai",
            name: "Standard Delivery Rules",
            content: "We deliver products globally within 3 to 5 business days.",
            characters: 56,
            previewCoordinates: [0.0123, -0.0456, 0.089],
            createdAt: new Date().toISOString()
          }
        ],
        skillRuns: [
          {
            id: "run_1",
            tenantSlug: "imran-ai",
            skillName: "lead_capture",
            status: "success",
            latencyMs: 12,
            payload: JSON.stringify({ name: "John Doe", email: "john@example.com" }),
            response: "Lead registered in standard schema",
            timestamp: new Date().toISOString()
          }
        ],
        agents: [
          {
            id: "agent_default",
            tenantSlug: "imran-ai",
            name: "Aether Default Agent",
            systemPrompt: "You are an expert AI assistant of acharya Imran. Your role is to provide customer support, sell all services, and book appointments.",
            avatarUrl: "",
            themeColor: "#6366f1",
            templateStyle: "glass",
            ragDocumentIds: ["doc_1"],
            activeSkills: ["ecommerce_checkout", "lead_capture"],
            createdAt: new Date().toISOString()
          }
        ],
        orders: [],
        analyticsEvents: [],
        subscriptions: [],
        creditLedgers: [],
        invoices: [],
        campaigns: [],
        landingPages: [],
        landingPageFunnels: [],
        tenantSettings: [],
        deliveryBoys: [],
        posManagers: [],
        stores: [],
        customers: [],
        bookingServices: [],
        bookingSchedules: [],
        chatMessages: [],
        riderLocations: [],
        pushSubscriptions: [],
      };
    }
  }

  
  private static async read(): Promise<LocalDatabaseSchema> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || (!serviceKey && !anonKey)) {
      if (this.cachedDb) return this.cachedDb;
      return this.readFromDisk(); // Fallback for pure local dev without supabase
    }

    const now = Date.now();
    if (this.cachedDb && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cachedDb;
    }

    this.isFetching = true;
    const supabase = createAetherClient({ serviceRole: !!serviceKey });
    
    try {
      const { data, error } = await supabase.from("local_db_store").select("*") as any;
      this.isFetching = false;
      
      if (error) {
        console.error("[Supabase Sync] Fetch error:", error.message);
        return this.cachedDb || this.readFromDisk();
      }
      
      if (data && data.length > 0) {
        const defaults = this.readFromDisk() as any;
        const db = { ...(this.cachedDb || defaults) } as any;
        for (const row of data) {
          db[row.key] = row.data || defaults[row.key] || [];
        }
        // Ensure no undefined properties
        for (const k of Object.keys(defaults)) {
          if (!db[k]) db[k] = defaults[k] || [];
        }
        this.cachedDb = db;
        this.lastFetchTime = Date.now();
        
        // Try saving to local disk for local dev caching
        try {
          const fs = require('fs');
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
        } catch (e) {}
      }
      return this.cachedDb || this.readFromDisk();
    } catch (e) {
      this.isFetching = false;
      return this.cachedDb || this.readFromDisk();
    }
  }

  private static async write(schema: LocalDatabaseSchema) {
    this.cachedDb = schema;
    this.lastFetchTime = Date.now();
    
    try {
      const fs = require('fs');
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(schema, null, 2), "utf-8");
    } catch (e) {}

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && (serviceKey || anonKey)) {
      const supabase = createAetherClient({ serviceRole: !!serviceKey });
      try {
        const upserts = Object.keys(schema).map(key => ({
          key,
          data: (schema as any)[key]
        }));
        const { error } = await supabase.from("local_db_store").upsert(upserts as any);
        if (error) console.error(`[Supabase Sync] Bulk write error:`, error.message);
      } catch (e) {
        console.error(`[Supabase Sync] Bulk write rejected:`, e);
      }
    }
  }

  public static async getUserByEmail(email: string): Promise<LocalUser | undefined> {
    const db = await this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static async getUserByPhone(phone: string): Promise<LocalUser | undefined> {
    const db = await this.read();
    return db.users.find(u => u.phone === phone);
  }

  public static async saveUser(user: LocalUser) {
    const db = await this.read();
    const idx = db.users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      db.users[idx] = user;
    } else {
      db.users.push(user);
    }
    await this.write(db);
  }

  public static async getUserByTenant(tenantSlug: string): Promise<LocalUser | undefined> {
    const db = await this.read();
    return db.users.find(u => u.tenantSlug === tenantSlug);
  }

  public static async addCreditLedgerEntry(entry: LocalCreditLedger) {
    const db = await this.read();
    db.creditLedgers.push(entry);
    await this.write(db);
  }

  public static async addSubscription(sub: LocalSubscription) {
    const db = await this.read();
    db.subscriptions.push(sub);
    await this.write(db);
  }

  public static async getSubscriptionsByTenant(tenantSlug: string) {
    const db = await this.read();
    return db.subscriptions.filter(s => s.tenantSlug === tenantSlug);
  }


  // --- Category Operations ---
  public static async getCategoriesByTenant(tenantSlug: string, storeId?: string): Promise<LocalCategory[]> {
    const db = await this.read();
    return db.categories.filter(c => {
      if (c.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase()) return false;
      if (!storeId) return true;
      if (c.storeId === storeId) return true;
      if (!c.storeId) {
        const firstStore = db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
        return firstStore?.id === storeId;
      }
      return false;
    });
  }

  public static async addCategory(cat: Omit<LocalCategory, "id" | "createdAt">): Promise<LocalCategory> {
    const db = await this.read();
    const newCat: LocalCategory = {
      ...cat,
      id: "cat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.categories.push(newCat);
    await this.write(db);
    return newCat;
  }

  // --- Storefront Operations ---
  public static async getStorefrontByTenant(tenantSlug: string, storeId?: string): Promise<LocalStorefront | undefined> {
    const db = await this.read();
    if (storeId) {
      return db.storefronts.find(s => s.id === storeId && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    }
    return db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async upsertStorefront(storefront: Omit<LocalStorefront, "id" | "createdAt"> & { id?: string }): Promise<LocalStorefront> {
    const db = await this.read();
    let existingIdx = -1;
    if (storefront.id) {
      existingIdx = db.storefronts.findIndex(s => s.id === storefront.id && s.tenantSlug.toLowerCase() === storefront.tenantSlug.toLowerCase());
    } else {
      existingIdx = db.storefronts.findIndex(s => s.tenantSlug.toLowerCase() === storefront.tenantSlug.toLowerCase());
    }
    
    if (existingIdx >= 0) {
      db.storefronts[existingIdx] = { ...db.storefronts[existingIdx], ...storefront };
      await this.write(db);
      return db.storefronts[existingIdx];
    } else {
      const newStorefront: LocalStorefront = {
        ...storefront,
        id: "store_" + Date.now(),
        createdAt: new Date().toISOString()
      };
      db.storefronts.push(newStorefront);
      await this.write(db);
      return newStorefront;
    }
  }


  // --- Leads Operations ---
  public static async getLeadsByTenant(tenantSlug: string): Promise<LocalLead[]> {
    const db = await this.read();
    return db.leads.filter(l => l.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async addLead(lead: Omit<LocalLead, "id" | "createdAt">): Promise<LocalLead> {
    const db = await this.read();
    const newLead: LocalLead = {
      ...lead,
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.leads.push(newLead);
    await this.write(db);
    return newLead;
  }

  public static async updateLead(tenantSlug: string, emailOrPhone: string, updateData: Partial<LocalLead>): Promise<LocalLead | null> {
    const db = await this.read();
    const leadIndex = db.leads.findIndex(l => 
      l.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() && 
      (l.email === emailOrPhone || l.phone === emailOrPhone)
    );
    if (leadIndex === -1) return null;

    db.leads[leadIndex] = { ...db.leads[leadIndex], ...updateData };
    await this.write(db);
    return db.leads[leadIndex];
  }

  // --- Product Catalog Operations ---
  public static async getProductsByTenant(tenantSlug: string, storeId?: string): Promise<LocalProduct[]> {
    const db = await this.read();
    return db.products.filter(p => {
      if (p.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase()) return false;
      if (!storeId) return true;
      if (p.storeId === storeId) return true;
      if (!p.storeId) {
        const firstStore = db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
        return firstStore?.id === storeId;
      }
      return false;
    });
  }

  public static async addProduct(prod: Omit<LocalProduct, "id" | "createdAt">): Promise<LocalProduct> {
    const db = await this.read();
    const newProd: LocalProduct = {
      ...prod,
      barcode: prod.barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      id: "prod_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.products.push(newProd);
    await this.write(db);
    return newProd;
  }

  public static async updateProduct(productId: string, tenantSlug: string, updates: Partial<LocalProduct>): Promise<LocalProduct | null> {
    const db = await this.read();
    const prodIndex = db.products.findIndex(p => p.id === productId && p.tenantSlug === tenantSlug);
    if (prodIndex === -1) return null;
    
    db.products[prodIndex] = { ...db.products[prodIndex], ...updates };
    await this.write(db);
    return db.products[prodIndex];
  }

  public static async deleteProduct(productId: string, tenantSlug: string): Promise<boolean> {
    const db = await this.read();
    const initialLength = db.products.length;
    db.products = db.products.filter(p => !(p.id === productId && p.tenantSlug === tenantSlug));
    if (db.products.length < initialLength) {
      await this.write(db);
      return true;
    }
    return false;
  }

  // --- Vector Document Operations ---
  public static async getDocumentsByTenant(tenantSlug: string): Promise<LocalDocument[]> {
    const db = await this.read();
    return db.documents.filter(d => d.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async addDocument(doc: Omit<LocalDocument, "id" | "createdAt">): Promise<LocalDocument> {
    const db = await this.read();
    const newDoc: LocalDocument = {
      ...doc,
      id: "doc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.documents.push(newDoc);
    await this.write(db);
    return newDoc;
  }

  public static async deleteDocument(tenantSlug: string, docId: string): Promise<void> {
    const db = await this.read();
    db.documents = db.documents.filter(d => !(d.id === docId && d.tenantSlug.toLowerCase() === tenantSlug.toLowerCase()));
    await this.write(db);
  }

  // --- Skill Run Ledger Operations ---
  public static async getSkillRunsByTenant(tenantSlug: string): Promise<LocalSkillRun[]> {
    const db = await this.read();
    return db.skillRuns.filter(r => r.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async addSkillRun(run: Omit<LocalSkillRun, "id" | "timestamp">): Promise<LocalSkillRun> {
    const db = await this.read();
    const newRun: LocalSkillRun = {
      ...run,
      id: "run_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    db.skillRuns.push(newRun);
    await this.write(db);
    return newRun;
  }

  // --- Agent Operations ---
  public static async getAgentsByTenant(tenantSlug: string): Promise<LocalAgent[]> {
    const db = await this.read();
    return db.agents.filter(a => a.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async addAgent(agent: Omit<LocalAgent, "id" | "createdAt">): Promise<LocalAgent> {
    const db = await this.read();
    const newAgent: LocalAgent = {
      ...agent,
      id: "agent_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.agents.push(newAgent);
    await this.write(db);
    return newAgent;
  }

  public static async updateAgent(id: string, updates: Partial<LocalAgent>): Promise<LocalAgent | null> {
    const db = await this.read();
    const idx = db.agents.findIndex(a => a.id === id);
    if (idx === -1) return null;
    db.agents[idx] = { ...db.agents[idx], ...updates };
    await this.write(db);
    return db.agents[idx];
  }

  public static async deleteAgent(id: string): Promise<boolean> {
    const db = await this.read();
    const initialLen = db.agents.length;
    db.agents = db.agents.filter(a => a.id !== id);
    await this.write(db);
    return db.agents.length < initialLen;
  }

  // --- Orders ---
  public static async createOrder(tenantSlug: string, orderData: Omit<LocalOrder, "id" | "tenantSlug" | "createdAt">): Promise<LocalOrder> {
    const db = await this.read();
    const newOrder: LocalOrder = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    await this.write(db);
    return newOrder;
  }

  public static async getOrders(tenantSlug: string, storeId?: string): Promise<LocalOrder[]> {
    const db = await this.read();
    return db.orders.filter(o => {
      if (o.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase()) return false;
      if (!storeId) return true;
      if (o.storeId === storeId) return true;
      if (!o.storeId) {
        const firstStore = db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
        return firstStore?.id === storeId;
      }
      return false;
    });
  }

  public static async updateOrderStatus(tenantSlug: string, orderId: string, status: LocalOrder["status"]): Promise<LocalOrder | null> {
    const db = await this.read();
    const idx = db.orders.findIndex(o => o.id === orderId && o.tenantSlug === tenantSlug);
    if (idx !== -1) {
      db.orders[idx].status = status;
      await this.write(db);
      return db.orders[idx];
    }
    return null;
  }

  public static async updateOrder(tenantSlug: string, orderId: string, updates: Partial<LocalOrder>): Promise<LocalOrder | null> {
    const db = await this.read();
    const idx = db.orders.findIndex(o => o.id === orderId && o.tenantSlug === tenantSlug);
    if (idx !== -1) {
      db.orders[idx] = { ...db.orders[idx], ...updates };
      await this.write(db);
      return db.orders[idx];
    }
    return null;
  }

  // --- Analytics ---
  public static async logAnalyticsEvent(tenantSlug: string, eventData: Omit<LocalAnalyticsEvent, "id" | "tenantSlug" | "createdAt">): Promise<LocalAnalyticsEvent> {
    const db = await this.read();
    const newEvent: LocalAnalyticsEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    db.analyticsEvents.push(newEvent);
    await this.write(db);
    return newEvent;
  }

  public static async getAnalytics(tenantSlug: string): Promise<LocalAnalyticsEvent[]> {
    return (await this.read()).analyticsEvents.filter(e => e.tenantSlug === tenantSlug);
  }

  // --- Storefront Operations ---
  public static async getStorefront(tenantSlug: string, storeId?: string): Promise<LocalStorefront | undefined> {
    const db = await this.read();
    if (storeId) {
      return db.storefronts.find(s => s.id === storeId && s.tenantSlug === tenantSlug);
    }
    return db.storefronts.find(s => s.tenantSlug === tenantSlug);
  }

  public static async getStorefrontsByTenant(tenantSlug: string): Promise<LocalStorefront[]> {
    const db = await this.read();
    return db.storefronts.filter(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async createStorefront(tenantSlug: string, config: Omit<LocalStorefront, "id" | "tenantSlug" | "createdAt">): Promise<LocalStorefront> {
    const db = await this.read();
    const newStorefront: LocalStorefront = {
      ...config,
      id: "store_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    db.storefronts.push(newStorefront);
      await this.write(db);
      return newStorefront;
    }

  public static async updateStorefront(tenantSlug: string, updates: Partial<LocalStorefront>, storeId?: string): Promise<LocalStorefront> {
    const db = await this.read();
    let storefront;
    if (storeId) {
      storefront = db.storefronts.find(s => s.id === storeId && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    } else if (updates.id) {
      storefront = db.storefronts.find(s => s.id === updates.id && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    } else {
      storefront = db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    }
    
    if (storefront) {
      Object.assign(storefront, updates);
    } else {
      const newId = storeId || updates.id || `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      storefront = {
        ...updates,
        id: newId,
        tenantSlug,
        createdAt: new Date().toISOString()
      };
      db.storefronts.push(storefront);
    }
    await this.write(db);
    return storefront;
  }

  public static async updateStorePage(tenantSlug: string, page: LocalStorePage, storeId?: string): Promise<LocalStorefront | null> {
    const db = await this.read();
    let sf: LocalStorefront | undefined;
    if (storeId) {
      sf = db.storefronts.find(s => s.id === storeId && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    } else {
      sf = db.storefronts.find(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    }
    if (!sf) return null;
    const pages = sf.pages || [];
    const idx = pages.findIndex(p => p.slug === page.slug);
    const updated: LocalStorePage = { ...page, updatedAt: new Date().toISOString() };
    if (idx >= 0) { pages[idx] = updated; } else { pages.push(updated); }
    sf.pages = pages;
    await this.write(db);
    return sf;
  }

  // --- Landing Pages ---
  public static async getLandingPages(tenantSlug: string): Promise<LocalLandingPage[]> {
    return (await this.read()).landingPages.filter(lp => lp.tenantSlug === tenantSlug);
  }

  public static async getLandingPage(id: string, tenantSlug: string): Promise<LocalLandingPage | undefined> {
    return (await this.read()).landingPages.find(lp => lp.id === id && lp.tenantSlug === tenantSlug);
  }

  public static async getLandingPageBySlug(tenantSlug: string, slug: string): Promise<LocalLandingPage | undefined> {
    return (await this.read()).landingPages.find(lp => lp.slug === slug && lp.tenantSlug === tenantSlug);
  }

  public static async createLandingPage(tenantSlug: string, lpData: Omit<LocalLandingPage, "id" | "tenantSlug" | "createdAt" | "updatedAt">): Promise<LocalLandingPage> {
    const db = await this.read();
    const newPage: LocalLandingPage = {
      ...lpData,
      id: `lp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.landingPages.push(newPage);
    await this.write(db);
    return newPage;
  }

  public static async updateLandingPage(id: string, tenantSlug: string, updates: Partial<LocalLandingPage>): Promise<LocalLandingPage | null> {
    const db = await this.read();
    const idx = db.landingPages.findIndex(lp => lp.id === id && lp.tenantSlug === tenantSlug);
    if (idx === -1) return null;
    
    db.landingPages[idx] = { 
      ...db.landingPages[idx], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.write(db);
    return db.landingPages[idx];
  }

  public static async getCampaigns(tenantSlug: string): Promise<LocalCampaign[]> {
    const db = await this.read();
    return db.campaigns.filter(c => c.tenantSlug === tenantSlug);
  }

  public static async createCampaign(data: { tenantSlug: string; name: string; description: string; status: string }): Promise<LocalCampaign> {
    const db = await this.read();
    const newCamp: LocalCampaign = {
      id: "camp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      tenantSlug: data.tenantSlug,
      name: data.name,
      description: data.description,
      status: data.status as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.campaigns.push(newCamp);
    await this.write(db);
    return newCamp;
  }

  public static async updateCategory(categoryId: string, tenantSlug: string, updates: Partial<LocalCategory>): Promise<LocalCategory | null> {
    const db = await this.read();
    const idx = db.categories.findIndex(c => c.id === categoryId && c.tenantSlug === tenantSlug);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...updates };
    await this.write(db);
    return db.categories[idx];
  }

  public static async deleteCategory(categoryId: string, tenantSlug: string): Promise<boolean> {
    const db = await this.read();
    const initialLen = db.categories.length;
    db.categories = db.categories.filter(c => !(c.id === categoryId && c.tenantSlug === tenantSlug));
    if (db.categories.length < initialLen) {
      // Clean up product category IDs
      db.products = db.products.map(p => {
        if (p.categoryId === categoryId && p.tenantSlug === tenantSlug) {
          return { ...p, categoryId: undefined };
        }
        return p;
      });
      await this.write(db);
      return true;
    }
    return false;
  }

  // --- Delivery Boys ---
  public static async getDeliveryBoys(tenantSlug: string): Promise<LocalDeliveryBoy[]> {
    const db = await this.read();
    return db.deliveryBoys.filter(d => d.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async createDeliveryBoy(tenantSlug: string, data: Omit<LocalDeliveryBoy, "id" | "tenantSlug" | "createdAt">): Promise<LocalDeliveryBoy> {
    const db = await this.read();
    const newBoy: LocalDeliveryBoy = {
      ...data,
      id: `rider_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    db.deliveryBoys.push(newBoy);
    await this.write(db);
    return newBoy;
  }

  public static async updateDeliveryBoy(tenantSlug: string, id: string, updates: Partial<LocalDeliveryBoy>): Promise<LocalDeliveryBoy | null> {
    const db = await this.read();
    const idx = db.deliveryBoys.findIndex(d => d.id === id && d.tenantSlug === tenantSlug);
    if (idx === -1) return null;
    db.deliveryBoys[idx] = { ...db.deliveryBoys[idx], ...updates };
    await this.write(db);
    return db.deliveryBoys[idx];
  }

  public static async deleteDeliveryBoy(tenantSlug: string, id: string): Promise<boolean> {
    const db = await this.read();
    const before = db.deliveryBoys.length;
    db.deliveryBoys = db.deliveryBoys.filter(d => !(d.id === id && d.tenantSlug === tenantSlug));
    if (db.deliveryBoys.length < before) { await this.write(db); return true; }
    return false;
  }

  public static async loginDeliveryBoy(tenantSlug: string, id: string, password: string): Promise<LocalDeliveryBoy | null> {
    const db = await this.read();
    return db.deliveryBoys.find(d =>
      d.tenantSlug === tenantSlug && d.id === id && (d.password === password || d.passwordHash === password)
    ) || null;
  }

  // --- Stores ---
  public static async getStores(tenantSlug: string): Promise<LocalStore[]> {
    const db = await this.read();
    return db.stores.filter(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async getStoreBySlug(tenantSlug: string, storeSlug: string): Promise<LocalStore | null> {
    const db = await this.read();
    return db.stores.find(
      s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() && s.storeSlug.toLowerCase() === storeSlug.toLowerCase()
    ) || null;
  }

  public static async createStore(data: Omit<LocalStore, "id" | "createdAt" | "updatedAt">): Promise<LocalStore> {
    const db = await this.read();
    const now = new Date().toISOString();
    const store: LocalStore = {
      ...data,
      id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    db.stores.push(store);
    await this.write(db);
    return store;
  }

  public static async updateStore(tenantSlug: string, storeId: string, updates: Partial<LocalStore>): Promise<LocalStore | null> {
    const db = await this.read();
    const idx = db.stores.findIndex(s => s.id === storeId && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    if (idx === -1) return null;
    db.stores[idx] = { ...db.stores[idx], ...updates, updatedAt: new Date().toISOString() };
    await this.write(db);
    return db.stores[idx];
  }

  public static async deleteStore(tenantSlug: string, storeId: string): Promise<boolean> {
    const db = await this.read();
    const before = db.stores.length;
    db.stores = db.stores.filter(s => !(s.id === storeId && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase()));
    await this.write(db);
    return db.stores.length < before;
  }

  // --- Booking Services ---
  public static async getBookingServices(tenantSlug: string): Promise<LocalBookingService[]> {
    const db = await this.read();
    return db.bookingServices.filter(s => s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async getBookingServiceById(id: string, tenantSlug: string): Promise<LocalBookingService | null> {
    const db = await this.read();
    return db.bookingServices.find(s => s.id === id && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase()) || null;
  }

  public static async createBookingService(tenantSlug: string, data: Omit<LocalBookingService, "id" | "tenantSlug" | "createdAt">): Promise<LocalBookingService> {
    const db = await this.read();
    const newService: LocalBookingService = {
      ...data,
      id: `bsvc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    db.bookingServices.push(newService);
    await this.write(db);
    return newService;
  }

  public static async updateBookingService(tenantSlug: string, id: string, updates: Partial<LocalBookingService>): Promise<LocalBookingService | null> {
    const db = await this.read();
    const idx = db.bookingServices.findIndex(s => s.id === id && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    if (idx === -1) return null;
    db.bookingServices[idx] = { ...db.bookingServices[idx], ...updates };
    await this.write(db);
    return db.bookingServices[idx];
  }

  public static async deleteBookingService(tenantSlug: string, id: string): Promise<boolean> {
    const db = await this.read();
    const before = db.bookingServices.length;
    db.bookingServices = db.bookingServices.filter(s => !(s.id === id && s.tenantSlug.toLowerCase() === tenantSlug.toLowerCase()));
    await this.write(db);
    return db.bookingServices.length < before;
  }

  // --- Booking Schedules ---
  public static async getBookingSchedules(tenantSlug: string, serviceId?: string): Promise<LocalBookingSchedule[]> {
    const db = await this.read();
    return db.bookingSchedules.filter(s => {
      if (s.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase()) return false;
      if (serviceId) return s.serviceId === serviceId || !s.serviceId;
      return true;
    });
  }

  public static async upsertBookingSchedules(tenantSlug: string, schedules: Omit<LocalBookingSchedule, "id">[]): Promise<LocalBookingSchedule[]> {
    const db = await this.read();
    // Remove existing schedules for this tenant
    db.bookingSchedules = db.bookingSchedules.filter(s => s.tenantSlug.toLowerCase() !== tenantSlug.toLowerCase());
    const newSchedules: LocalBookingSchedule[] = schedules.map(s => ({
      ...s,
      id: `bsch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${Math.random().toString(36).substr(2, 4)}`,
      tenantSlug
    }));
    db.bookingSchedules.push(...newSchedules);
    await this.write(db);
    return newSchedules;
  }

  // --- Enhanced Appointment Operations ---
  public static async getAppointmentsByTenant(tenantSlug: string): Promise<LocalAppointment[]> {
    const db = await this.read();
    return db.appointments.filter(a => a.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async getAppointmentsByService(tenantSlug: string, serviceId: string): Promise<LocalAppointment[]> {
    const db = await this.read();
    return db.appointments.filter(a => a.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() && a.serviceId === serviceId);
  }

  public static async getAppointmentsByDate(tenantSlug: string, date: string): Promise<LocalAppointment[]> {
    const db = await this.read();
    return db.appointments.filter(a => a.tenantSlug.toLowerCase() === tenantSlug.toLowerCase() && a.date === date);
  }

  public static async addAppointment(appt: Omit<LocalAppointment, "id" | "createdAt">): Promise<LocalAppointment> {
    const db = await this.read();
    const newAppt: LocalAppointment = {
      ...appt,
      id: "appt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    db.appointments.push(newAppt);
    await this.write(db);
    return newAppt;
  }

  public static async updateAppointment(tenantSlug: string, id: string, updates: Partial<LocalAppointment>): Promise<LocalAppointment | null> {
    const db = await this.read();
    const idx = db.appointments.findIndex(a => a.id === id && a.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
    if (idx === -1) return null;
    db.appointments[idx] = { ...db.appointments[idx], ...updates };
    await this.write(db);
    return db.appointments[idx];
  }

  public static async cancelAppointment(tenantSlug: string, id: string): Promise<LocalAppointment | null> {
    return this.updateAppointment(tenantSlug, id, { status: "cancelled" });
  }

  // --- POS Managers ---
  public static async getPosManagers(tenantSlug: string): Promise<LocalPosManager[]> {
    const db = await this.read();
    return (db.posManagers || []).filter(p => p.tenantSlug.toLowerCase() === tenantSlug.toLowerCase());
  }

  public static async createPosManager(tenantSlug: string, data: Omit<LocalPosManager, "id" | "tenantSlug" | "createdAt">): Promise<LocalPosManager> {
    const db = await this.read();
    const newManager: LocalPosManager = {
      ...data,
      id: `posmgr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantSlug,
      createdAt: new Date().toISOString()
    };
    if (!db.posManagers) db.posManagers = [];
    db.posManagers.push(newManager);
    await this.write(db);
    return newManager;
  }

  public static async updatePosManager(tenantSlug: string, id: string, updates: Partial<LocalPosManager>): Promise<LocalPosManager | null> {
    const db = await this.read();
    if (!db.posManagers) return null;
    const idx = db.posManagers.findIndex(p => p.id === id && p.tenantSlug === tenantSlug);
    if (idx === -1) return null;
    db.posManagers[idx] = { ...db.posManagers[idx], ...updates };
    await this.write(db);
    return db.posManagers[idx];
  }

  public static async deletePosManager(tenantSlug: string, id: string): Promise<boolean> {
    const db = await this.read();
    if (!db.posManagers) return false;
    const initialLength = db.posManagers.length;
    db.posManagers = db.posManagers.filter(p => !(p.id === id && p.tenantSlug === tenantSlug));
    if (db.posManagers.length !== initialLength) {
      await this.write(db);
      return true;
    }
    return false;
  }

  // --- Chat Messages ---
  public static async getChatMessages(tenantSlug: string, orderId: string): Promise<LocalChatMessage[]> {
    const db = await this.read();
    return (db.chatMessages || []).filter(m => m.tenantSlug === tenantSlug && m.orderId === orderId);
  }

  public static async addChatMessage(msg: Omit<LocalChatMessage, "id" | "timestamp">): Promise<LocalChatMessage> {
    const db = await this.read();
    const newMsg: LocalChatMessage = {
      ...msg,
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
    };
    if (!db.chatMessages) db.chatMessages = [];
    db.chatMessages.push(newMsg);
    await this.write(db);
    return newMsg;
  }

  public static async markChatRead(tenantSlug: string, orderId: string, role: "admin" | "rider"): Promise<void> {
    const db = await this.read();
    if (!db.chatMessages) return;
    const otherRole = role === "admin" ? "rider" : "admin";
    db.chatMessages = db.chatMessages.map(m =>
      m.tenantSlug === tenantSlug && m.orderId === orderId && m.fromRole === otherRole
        ? { ...m, read: true }
        : m
    );
    await this.write(db);
  }

  // --- Rider Locations ---
  public static async updateRiderLocation(loc: LocalRiderLocation): Promise<void> {
    const db = await this.read();
    if (!db.riderLocations) db.riderLocations = [];
    const idx = db.riderLocations.findIndex(l => l.riderId === loc.riderId && l.tenantSlug === loc.tenantSlug);
    if (idx >= 0) db.riderLocations[idx] = loc;
    else db.riderLocations.push(loc);
    await this.write(db);
  }

  public static async getRiderLocation(tenantSlug: string, riderId: string): Promise<LocalRiderLocation | null> {
    const db = await this.read();
    return (db.riderLocations || []).find(l => l.riderId === riderId && l.tenantSlug === tenantSlug) || null;
  }

  public static async getAllRiderLocations(tenantSlug: string): Promise<LocalRiderLocation[]> {
    const db = await this.read();
    return (db.riderLocations || []).filter(l => l.tenantSlug === tenantSlug);
  }

  // --- Push Subscriptions ---
  public static async savePushSubscription(record: Omit<LocalPushSubscriptionRecord, "id" | "createdAt">): Promise<LocalPushSubscriptionRecord> {
    const db = await this.read();
    if (!db.pushSubscriptions) db.pushSubscriptions = [];
    const newRec: LocalPushSubscriptionRecord = {
      ...record,
      id: "sub_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };
    // Remove existing subscriptions for the same rider/role to avoid duplicates
    db.pushSubscriptions = db.pushSubscriptions.filter(s =>
      !(s.tenantSlug === record.tenantSlug && s.role === record.role && s.riderId === record.riderId)
    );
    db.pushSubscriptions.push(newRec);
    await this.write(db);
    return newRec;
  }

  public static async getPushSubscriptions(tenantSlug: string, role?: "admin" | "rider", riderId?: string): Promise<LocalPushSubscriptionRecord[]> {
    const db = await this.read();
    return (db.pushSubscriptions || []).filter(s => {
      if (s.tenantSlug !== tenantSlug) return false;
      if (role && s.role !== role) return false;
      if (riderId && s.riderId !== riderId) return false;
      return true;
    });
  }

  public static async deletePushSubscription(tenantSlug: string, id: string): Promise<void> {
    const db = await this.read();
    if (!db.pushSubscriptions) return;
    db.pushSubscriptions = db.pushSubscriptions.filter(s => !(s.id === id && s.tenantSlug === tenantSlug));
    await this.write(db);
  }
}
