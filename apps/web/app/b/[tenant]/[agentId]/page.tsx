export const dynamic = "force-dynamic";
import { LocalDbController } from "@aether/db";
import ChatWidgetUI from "@/components/ChatWidgetUI";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { tenant: string, agentId: string } }): Promise<Metadata> {
  const agent = (await LocalDbController.getAgentsByTenant(params.tenant)).find(a => a.id === params.agentId);
  if (!agent) return { title: "Agent Not Found" };

  return {
    title: agent.metaTitle || agent.name || "Aether AI Agent",
    description: agent.metaDescription || "Chat with our intelligent assistant.",
    openGraph: {
      title: agent.metaTitle || agent.name || "Aether AI Agent",
      description: agent.metaDescription || "Chat with our intelligent assistant.",
      images: agent.metaImage ? [{ url: agent.metaImage, width: 1200, height: 630 }] : undefined,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: agent.metaTitle || agent.name || "Aether AI Agent",
      description: agent.metaDescription || "Chat with our intelligent assistant.",
      images: agent.metaImage ? [agent.metaImage] : undefined,
    }
  };
}

export default async function PublicChatbotWidget({ params }: { params: { tenant: string, agentId: string } }) {
  const agent = (await LocalDbController.getAgentsByTenant(params.tenant)).find(a => a.id === params.agentId);

  if (!agent) {
    return <div className="fixed inset-0 bg-[#070913] flex items-center justify-center text-white">Agent Not Found</div>;
  }

  return <ChatWidgetUI tenantSlug={params.tenant} agentConfig={agent} isPreviewMode={false} />;
}
