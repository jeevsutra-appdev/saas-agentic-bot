'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePageBuilderStore } from '../../../../../components/landing-page-studio/store/pageBuilderStore';

const CanvasWrapper = dynamic(
  () =>
    import('../../../../../components/landing-page-studio/canvas/Canvas').then(
      (m) => ({ default: m.CanvasWrapper })
    ),
  { ssr: false }
);

function Spinner({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#02040A]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

export function LandingPageCanvas({
  tenant,
  pageId,
}: {
  tenant: string;
  pageId: string;
}) {
  const router = useRouter();
  const [initialPageTree, setInitialPageTree] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const { setPageSettings, setPageSlug } = usePageBuilderStore();

  useEffect(() => {
    if (pageId === 'new') {
      router.push(`/c/${tenant}`);
      return;
    }

    fetch(`/api/landing-pages/${pageId}?tenantSlug=${tenant}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.page?.pageTree) setInitialPageTree(data.page.pageTree);
        if (data.page?.slug) setPageSlug(data.page.slug);
        if (data.page?.settings) {
          try {
            const parsed = typeof data.page.settings === 'string'
              ? JSON.parse(data.page.settings)
              : data.page.settings;
            if (parsed && typeof parsed === 'object') setPageSettings(parsed);
          } catch { /* ignore malformed settings */ }
        }
      })
      .catch(console.error)
      .finally(() => setReady(true));
  }, [pageId, tenant, setPageSettings, setPageSlug, router]);

  if (pageId === 'new') {
    return <Spinner label="Redirecting to dashboard..." />;
  }

  if (!ready) return <Spinner label="Loading page..." />;

  return <CanvasWrapper initialPageTree={initialPageTree} />;
}
