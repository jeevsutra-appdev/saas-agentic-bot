import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./global.css";
import { SuppressWarnings } from "../components/SuppressWarnings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Aether AI — 2026-Grade Agentic AI Chatbot SaaS",
  description: "Create, customize, and deploy premium multi-tenant agentic AI chatbots with instant n8n integrations, Razorpay & Stripe checkouts, and custom domains.",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-bg text-fg" suppressHydrationWarning>
        
        {children}
      </body>
    </html>
  );
}
