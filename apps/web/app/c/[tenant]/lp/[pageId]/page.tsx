export const dynamic = "force-dynamic";
import { LandingPageCanvas } from './LandingPageCanvas';

export default async function LandingPageEditor({
  params,
}: {
  params: Promise<{ tenant: string; pageId: string }>;
}) {
  const { tenant, pageId } = await params;
  return <LandingPageCanvas tenant={tenant} pageId={pageId} />;
}
