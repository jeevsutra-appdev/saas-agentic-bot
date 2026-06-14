import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

interface StorefrontConfig {
  theme?: string;
  businessName?: string;
  businessTagline?: string;
  colors?: { primary?: string; accent?: string };
}

const THEME_COLORS: Record<string, { bg: string; theme: string }> = {
  midnight: { bg: "#060810", theme: "#6366f1" },
  aurora:   { bg: "#040c14", theme: "#06b6d4" },
  zen:      { bg: "#f8faf8", theme: "#059669" },
  royal:    { bg: "#050814", theme: "#f59e0b" },
  sakura:   { bg: "#0d0608", theme: "#f43f5e" },
};

export async function GET(
  _req: Request,
  { params }: { params: { tenant: string } }
) {
  const settings = await LocalDbController.getTenantSettings(params.tenant);
  let config: StorefrontConfig | null = null;
  if (settings?.bookingStorefrontConfig) {
    try { config = JSON.parse(settings.bookingStorefrontConfig); } catch {}
  }

  const name = config?.businessName || params.tenant;
  const theme = config?.theme || "midnight";
  const colors = THEME_COLORS[theme] || THEME_COLORS.midnight;
  const themeColor = config?.colors?.primary || colors.theme;
  const bgColor = colors.bg;

  const manifest = {
    name,
    short_name: name.length > 12 ? name.substring(0, 12) : name,
    description: `Book appointments with ${name}`,
    start_url: `/s/${params.tenant}`,
    scope: `/s/${params.tenant}`,
    display: "standalone",
    orientation: "portrait",
    theme_color: themeColor,
    background_color: bgColor,
    icons: [
      {
        src: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${encodeURIComponent(themeColor)}"/><text y=".9em" font-size="70" x="15">📅</text></svg>`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity"],
    lang: "en"
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
