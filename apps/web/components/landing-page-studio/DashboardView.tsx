'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, LayoutTemplate, Workflow, Settings2, BarChart, ExternalLink, Loader2, Play, Folder, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LANDING_PAGE_TEMPLATES } from './templates/templateData';

export default function LandingPageDashboard({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // New page creation state
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTemplateId, setNewPageTemplateId] = useState("blank");
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    setIsCreatingPage(true);
    try {
      const res = await fetch(`/api/landing-pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          name: newPageName,
          slug: newPageSlug || newPageName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
          templateId: newPageTemplateId === "blank" ? undefined : newPageTemplateId,
          status: "draft"
        })
      });
      const data = await res.json();
      if (data.page?.id) {
        setIsNewPageModalOpen(false);
        setNewPageName("");
        setNewPageSlug("");
        setNewPageTemplateId("blank");
        router.push(`/c/${tenantSlug}/lp/${data.page.id}`);
      }
    } catch (e) {
      console.error("Failed to create landing page", e);
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleNameChange = (name: string) => {
    setNewPageName(name);
    // Auto-generate slug
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens
    setNewPageSlug(generatedSlug);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [tenantSlug]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/campaigns?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error("Failed to fetch campaigns", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFunnels = async () => {
    // Ideally this would filter by campaignId, but since we just added campaigns 
    // we'll fetch all pages for now and let the user see them under the active campaign
    try {
      const res = await fetch(`/api/landing-pages?tenantSlug=${tenantSlug}`);
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (e) {
      console.error("Failed to fetch pages", e);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await fetch(`/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          name: newCampaignName,
          description: newCampaignDesc,
          status: "active"
        })
      });
      const data = await res.json();
      if (data.campaign) {
        setCampaigns([...campaigns, data.campaign]);
        setIsNewCampaignModalOpen(false);
        setNewCampaignName("");
        setNewCampaignDesc("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const openCampaign = (campaign: any) => {
    setActiveCampaign(campaign);
    setIsLoading(true);
    fetchFunnels().finally(() => setIsLoading(false));
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8 h-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2 cursor-pointer transition-colors hover:text-indigo-400" onClick={() => setActiveCampaign(null)}>
              <Folder className="h-6 w-6 text-indigo-400" />
              Campaigns
            </h2>
            {activeCampaign && (
              <>
                <ChevronRight className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-300 font-heading">
                  {activeCampaign.name}
                </h2>
              </>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {activeCampaign ? "Manage your funnels and pages inside this campaign." : "Organize your funnels, traffic sources, and landing pages into high-converting campaigns."}
          </p>
        </div>
        
        {activeCampaign ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNewPageModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition border border-white/10 cursor-pointer"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span>New Page Studio</span>
            </button>
            <Link 
              href={`/c/${tenantSlug}/funnels/new`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] cursor-pointer"
            >
              <Workflow className="h-4 w-4" />
              <span>Visual Funnel Flow</span>
            </Link>
          </div>
        ) : (
          <button 
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : !activeCampaign ? (
        // CAMPAIGNS VIEW
        campaigns.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 rounded-3xl bg-white/[0.01] border border-white/5 min-h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
              <Folder className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-gray-400 max-w-md text-sm mb-8">
              Start by creating your first Marketing Campaign to house your funnels and pages.
            </p>
            <button 
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-sm font-bold transition cursor-pointer group"
            >
              <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div 
                key={camp.id} 
                onClick={() => openCampaign(camp)}
                className="group relative rounded-2xl bg-[#0a0d1a] border border-white/5 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="p-6 flex flex-col h-full gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Folder className="h-6 w-6" />
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {camp.status}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-white">{camp.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{camp.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-indigo-300 transition-colors">
                  <span>Open Campaign</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // FUNNELS VIEW (INSIDE CAMPAIGN)
        pages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-12 rounded-3xl bg-white/[0.01] border border-white/5 min-h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
              <LayoutTemplate className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No funnels in this campaign</h3>
            <p className="text-gray-400 max-w-md text-sm mb-8">
              Build your first high-converting funnel or landing page for {activeCampaign.name}.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsNewPageModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition cursor-pointer group"
              >
                <LayoutTemplate className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Studio Builder</span>
              </button>
              <Link 
                href={`/c/${tenantSlug}/funnels/new`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-sm font-bold transition cursor-pointer group"
              >
                <Workflow className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Funnel Flow Editor</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div key={page.id} className="group relative rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/30 transition-all overflow-hidden flex flex-col">
                <div className="h-40 bg-[#070913] border-b border-white/5 relative overflow-hidden flex items-center justify-center group-hover:bg-[#0a0d1a] transition-colors">
                  <LayoutTemplate className="h-12 w-12 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      page.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                      page.status === 'archived' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {page.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">{page.name}</h3>
                    <span className="text-xs text-gray-500 font-mono truncate">/{page.slug}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-y border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Views</span>
                      <span className="font-mono text-gray-300">{page.visits || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Conv. Rate</span>
                      <span className="font-mono text-emerald-400">
                        {page.visits > 0 ? Math.round((page.conversions / page.visits) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/c/${tenantSlug}/lp/${page.id}`}
                      className="flex-1 flex justify-center items-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow"
                      title="Open in Studio"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Link>
                    <Link 
                      href={`/c/${tenantSlug}/funnels/${page.id}`}
                      className="flex-[2] flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition cursor-pointer shadow"
                      title="Open Visual Funnel Flow"
                    >
                      <Workflow className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Flow</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0d1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-400" /> Create Campaign
              </h3>
              <button 
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Campaign Name</label>
                <input 
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  placeholder="e.g. Black Friday 2026 Promo"
                  className="bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-gray-600"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Description (Optional)</label>
                <textarea 
                  value={newCampaignDesc}
                  onChange={e => setNewCampaignDesc(e.target.value)}
                  placeholder="Internal notes about this campaign..."
                  className="bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-gray-600 resize-none h-24"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || !newCampaignName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition flex items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Page Modal */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0a0d1a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-indigo-400" /> Create Landing Page
              </h3>
              <button 
                onClick={() => setIsNewPageModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePage} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Page Name</label>
                <input 
                  type="text"
                  required
                  value={newPageName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Agency Growth Landing Page"
                  className="bg-[#070913] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-gray-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">URL Slug</label>
                <div className="flex items-center bg-[#070913] border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-gray-500 text-sm mr-1 font-mono">/f/{tenantSlug}/</span>
                  <input 
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={e => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                    placeholder="slug"
                    className="bg-transparent border-none p-0 text-sm focus:outline-none text-white placeholder:text-gray-600 flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Select Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {/* Blank option */}
                  <div 
                    onClick={() => setNewPageTemplateId("blank")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      newPageTemplateId === "blank" 
                        ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                        : "bg-[#070913] border-white/5 text-gray-400 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xl mb-1 block">📄</span>
                    <span className="font-bold text-sm block text-white font-heading">Blank Page</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1">Start completely from scratch</span>
                  </div>
                  {/* Templates */}
                  {LANDING_PAGE_TEMPLATES.map((tmpl) => (
                    <div 
                      key={tmpl.id}
                      onClick={() => setNewPageTemplateId(tmpl.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        newPageTemplateId === tmpl.id 
                          ? "bg-indigo-600/10 border-indigo-500/50 text-white" 
                          : "bg-[#070913] border-white/5 text-gray-400 hover:border-white/10"
                      }`}
                    >
                      <span className="text-xl mb-1 block">{tmpl.emoji || "🚀"}</span>
                      <span className="font-bold text-sm block text-white line-clamp-1 font-heading">{tmpl.name}</span>
                      <span className="text-[10px] text-gray-400 line-clamp-1">{tmpl.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreatingPage || !newPageName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] cursor-pointer"
                >
                  {isCreatingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
