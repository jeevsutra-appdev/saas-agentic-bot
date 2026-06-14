import { Metadata } from "next";
import { LocalDbController } from "@aether/db";
import BookingStorefront, { StorefrontConfig } from "@/components/BookingStorefront";

interface Props {
  params: { tenant: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const settings = await LocalDbController.getTenantSettings(params.tenant);
  let config: StorefrontConfig | null = null;
  if (settings?.bookingStorefrontConfig) {
    try { config = JSON.parse(settings.bookingStorefrontConfig); } catch {}
  }
  const name = config?.businessName || params.tenant;
  const tagline = config?.businessTagline || "Book an appointment online";
  const themeColors: Record<string, string> = {
    midnight: "#6366f1", aurora: "#06b6d4", zen: "#059669", royal: "#f59e0b", sakura: "#f43f5e"
  };
  const themeColor = config?.colors?.primary || themeColors[config?.theme || "midnight"] || "#6366f1";

  return {
    title: `${name} — Book Appointment`,
    description: tagline,
    manifest: `/s/${params.tenant}/manifest.webmanifest`,
    themeColor,
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: name },
    openGraph: {
      title: `${name} — Book Appointment`,
      description: tagline,
      type: "website",
    },
  };
}

export default async function BookingPage({ params }: Props) {
  const settings = await LocalDbController.getTenantSettings(params.tenant);
  const allServices = await LocalDbController.getBookingServices(params.tenant);
  const services = allServices.filter(s => s.isActive);

  let config: StorefrontConfig | null = null;
  if (settings?.bookingStorefrontConfig) {
    try { config = JSON.parse(settings.bookingStorefrontConfig); } catch {}
  }

  return (
    <BookingStorefront
      tenantSlug={params.tenant}
      services={services}
      config={config}
    />
  );
}
