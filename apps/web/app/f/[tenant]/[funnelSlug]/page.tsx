export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LocalDbController } from '@aether/db';
import PublicRender from '../../../../components/landing-page-studio/canvas/PublicRender';

interface FunnelPageProps {
  params: Promise<{
    tenant: string;
    funnelSlug: string;
  }>;
}

export async function generateMetadata({ params }: FunnelPageProps): Promise<Metadata> {
  const { tenant, funnelSlug } = await params;
  const page = await LocalDbController.getLandingPageBySlug(tenant, funnelSlug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  try {
    const settings = JSON.parse(page.settings || '{}');
    return {
      title: settings.seoTitle || page.name || 'Special Offer',
      description: settings.seoDescription || 'Check out this amazing offer.',
      openGraph: {
        title: settings.seoTitle || page.name,
        description: settings.seoDescription,
        type: 'website',
      }
    };
  } catch (e) {
    return { title: page.name };
  }
}

export default async function LiveFunnelPage({ params }: FunnelPageProps) {
  const { tenant, funnelSlug } = await params;
  
  // Note: We use the local JSON DB for this architecture.
  const page = await LocalDbController.getLandingPageBySlug(tenant, funnelSlug);

  if (!page) {
    notFound();
  }

  // Increment Visits (In a real production app, use an API/Edge function to avoid blocking renders, 
  // but for local DB architecture we can increment it directly if thread safety allows, 
  // or handle via client-side analytics ping)
  try {
    await LocalDbController.updateLandingPage(page.id, tenant, {
      visits: (page.visits || 0) + 1
    });
  } catch (e) {
    console.error("Failed to track visit", e);
  }

  return (
    <main className="min-h-screen bg-[#02040A]">
      <PublicRender pageTree={page.pageTree} />
    </main>
  );
}
