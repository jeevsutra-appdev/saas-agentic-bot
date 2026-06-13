export const dynamic = "force-dynamic";
import FunnelFlowCanvas from '../../../../../components/funnel-flow-builder/FunnelFlowCanvas';

export default async function FunnelBuilderPage({
  params,
}: {
  params: Promise<{ tenant: string; funnelId: string }>;
}) {
  const { tenant, funnelId } = await params;
  return (
    <div className="w-full h-screen overflow-hidden bg-[#02040A]">
      <FunnelFlowCanvas tenantSlug={tenant} funnelId={funnelId} />
    </div>
  );
}
