export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { LocalDbController, LocalStorePage } from "@aether/db/src/localDb";

const DEFAULT_PAGES: LocalStorePage[] = [
  {
    slug: "about",
    title: "About Us",
    content: `<h2>Our Story</h2><p>We are a passionate team dedicated to bringing you the finest products at unbeatable prices. Our journey started with a simple mission: make quality accessible to everyone.</p><h2>Our Mission</h2><p>We believe shopping should be easy, trustworthy, and enjoyable. Every product in our store is carefully curated for quality and value.</p><h2>Why Choose Us?</h2><ul><li>✓ Genuine, quality-verified products</li><li>✓ Fast & secure delivery</li><li>✓ Hassle-free 7-day returns</li><li>✓ Friendly customer support</li></ul>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "contact",
    title: "Contact Us",
    content: `<h2>Get in Touch</h2><p>We'd love to hear from you! Reach out through any of the channels below.</p><h3>📞 Phone</h3><p>+91 98765 43210 (Mon–Sat, 9am–6pm)</p><h3>📧 Email</h3><p>support@store.com</p><h3>📍 Address</h3><p>123, Commerce Street, Business District, City – 400001</p><h2>Response Time</h2><p>We typically respond within 24 hours on business days.</p>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    content: `<h2>Return Policy</h2><p>We offer a <strong>7-day easy return policy</strong> on all items.</p><h2>How to Return</h2><ol><li>Contact our support team within 7 days of delivery</li><li>Describe the issue and share your order ID</li><li>We'll arrange a free pickup</li><li>Refund processed within 3–5 business days</li></ol><h2>Conditions</h2><ul><li>Items must be unused and in original packaging</li><li>Original tags must be intact</li><li>Damaged or used items cannot be returned</li></ul>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "shipping",
    title: "Shipping Policy",
    content: `<h2>Delivery Information</h2><p>We deliver across India with fast and secure shipping.</p><h2>Delivery Timeline</h2><ul><li><strong>Metro cities:</strong> 1–3 business days</li><li><strong>Tier 2 cities:</strong> 2–4 business days</li><li><strong>Remote areas:</strong> 4–7 business days</li></ul><h2>Shipping Charges</h2><p>🚚 <strong>FREE shipping</strong> on orders above ₹999<br/>Standard shipping: ₹49 for orders below ₹999</p><h2>Tracking</h2><p>You'll receive a tracking link via SMS and email once your order ships.</p>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    content: `<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p><h2>Information We Collect</h2><ul><li>Name, email, phone number when you place an order</li><li>Delivery address</li><li>Payment information (processed securely)</li><li>Browsing behavior on our site</li></ul><h2>How We Use Your Information</h2><ul><li>To process and deliver your orders</li><li>To send order updates and notifications</li><li>To improve our products and services</li></ul><h2>Data Security</h2><p>We use industry-standard encryption to protect your data. We never sell your personal information to third parties.</p>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "terms",
    title: "Terms of Service",
    content: `<h2>Terms of Service</h2><p>By using our store, you agree to the following terms and conditions.</p><h2>Orders & Payments</h2><ul><li>All prices are in INR and inclusive of GST</li><li>Orders are confirmed only upon successful payment</li><li>We reserve the right to cancel orders in case of pricing errors</li></ul><h2>Intellectual Property</h2><p>All content on this website including images, text, and logos are our property and may not be reproduced without permission.</p><h2>Limitation of Liability</h2><p>We are not responsible for delays caused by courier partners or force majeure events.</p><h2>Governing Law</h2><p>These terms are governed by the laws of India.</p>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: "faq",
    title: "FAQ",
    content: `<h2>Frequently Asked Questions</h2><h3>🛒 How do I place an order?</h3><p>Browse our products, add items to your bag, and proceed to checkout. Enter your delivery address and payment details to complete the order.</p><h3>💳 What payment methods do you accept?</h3><p>We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.</p><h3>🚚 How long does delivery take?</h3><p>Metro cities: 1–3 days. Other areas: 3–7 days.</p><h3>↩ Can I return a product?</h3><p>Yes! We have a 7-day easy return policy. Contact support to initiate a return.</p><h3>📦 How do I track my order?</h3><p>You'll receive a tracking link via SMS/email after your order ships.</p><h3>🤔 Product not as described?</h3><p>Contact us immediately with photos and we'll resolve it within 24 hours.</p>`,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || "";
    const storeId = searchParams.get("storeId") || undefined;
    const slug = searchParams.get("slug") || undefined;

    if (!tenantSlug) return NextResponse.json({ error: "Missing tenant" }, { status: 400 });

    const storefront = await LocalDbController.getStorefrontByTenant(tenantSlug, storeId);
    const storedPages: LocalStorePage[] = storefront?.pages || [];

    // Merge stored pages with defaults (stored takes priority)
    const merged = DEFAULT_PAGES.map(def => {
      const stored = storedPages.find(p => p.slug === def.slug);
      return stored || def;
    });

    if (slug) {
      const page = merged.find(p => p.slug === slug);
      if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
      return NextResponse.json({ success: true, page, storefront });
    }

    return NextResponse.json({ success: true, pages: merged, storefront });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, storeId, slug, title, content, isActive } = body;

    if (!tenantSlug || !slug) return NextResponse.json({ error: "Missing tenantSlug or slug" }, { status: 400 });

    const page: LocalStorePage = {
      slug, title: title || slug, content: content || "", isActive: isActive !== false,
      updatedAt: new Date().toISOString(),
    };

    const storefront = await LocalDbController.updateStorePage(tenantSlug, page, storeId);
    if (!storefront) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
