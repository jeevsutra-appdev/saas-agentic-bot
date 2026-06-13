'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Search, Image as ImageIcon, X, Loader2, ExternalLink, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MediaItem {
  id: string;
  thumb: string;
  full: string;
  author: string;
  authorUrl?: string;
  source: 'pixabay' | 'pexels' | 'unsplash' | 'upload';
  alt: string;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

type TabId = 'upload' | 'pixabay' | 'pexels' | 'unsplash';

// ─── API Keys (env vars — never exposed client-side in production) ────────────
// These are public search-only keys. Set them in .env.local:
//   NEXT_PUBLIC_PIXABAY_API_KEY=...
//   NEXT_PUBLIC_PEXELS_API_KEY=...
//   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=...
const PIXABAY_KEY  = process.env.NEXT_PUBLIC_PIXABAY_API_KEY  || '';
const PEXELS_KEY   = process.env.NEXT_PUBLIC_PEXELS_API_KEY   || '';
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

// ─── Source configs ───────────────────────────────────────────────────────────
const SOURCES = [
  { id: 'upload'   as TabId, label: 'Upload',   icon: '⬆', color: '#6366f1', hasKey: true },
  { id: 'pixabay'  as TabId, label: 'Pixabay',  icon: '🌿', color: '#10b981', hasKey: !!PIXABAY_KEY  },
  { id: 'pexels'   as TabId, label: 'Pexels',   icon: '📷', color: '#05a081', hasKey: !!PEXELS_KEY   },
  { id: 'unsplash' as TabId, label: 'Unsplash', icon: '🎨', color: '#ffffff', hasKey: !!UNSPLASH_KEY },
];

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchPixabay(query: string, page = 1): Promise<MediaItem[]> {
  if (!PIXABAY_KEY) throw new Error('no_key');
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20&page=${page}&safesearch=true`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.hits || []).map((h: any) => ({
    id: `px_${h.id}`,
    thumb: h.previewURL,
    full: h.largeImageURL || h.webformatURL,
    author: h.user,
    authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    source: 'pixabay' as const,
    alt: h.tags,
  }));
}

async function fetchPexels(query: string, page = 1): Promise<MediaItem[]> {
  if (!PEXELS_KEY) throw new Error('no_key');
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  const data = await res.json();
  return (data.photos || []).map((p: any) => ({
    id: `pe_${p.id}`,
    thumb: p.src.small,
    full: p.src.large2x || p.src.large,
    author: p.photographer,
    authorUrl: p.photographer_url,
    source: 'pexels' as const,
    alt: p.alt || query,
  }));
}

async function fetchUnsplash(query: string, page = 1): Promise<MediaItem[]> {
  if (!UNSPLASH_KEY) throw new Error('no_key');
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } });
  const data = await res.json();
  return (data.results || []).map((p: any) => ({
    id: `un_${p.id}`,
    thumb: p.urls.small,
    full: p.urls.regular,
    author: p.user?.name || 'Unknown',
    authorUrl: p.user?.links?.html,
    source: 'unsplash' as const,
    alt: p.alt_description || query,
  }));
}

const FETCH_FN: Record<string, (q: string, page: number) => Promise<MediaItem[]>> = {
  pixabay: fetchPixabay,
  pexels: fetchPexels,
  unsplash: fetchUnsplash,
};

// ─── Curated default images (shown before any search) ────────────────────────
const DEFAULTS: MediaItem[] = [
  { id: 'd1', thumb: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&q=70', full: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Business team' },
  { id: 'd2', thumb: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&q=70', full: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Office workspace' },
  { id: 'd3', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=70', full: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Abstract gradient' },
  { id: 'd4', thumb: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&q=70', full: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Mobile phone' },
  { id: 'd5', thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=70', full: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Analytics' },
  { id: 'd6', thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&q=70', full: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=90', author: 'Unsplash', source: 'unsplash', alt: 'Team collaboration' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const MediaLibrary = ({ onSelect, selectedUrl }: MediaLibraryProps) => {
  const [activeTab, setActiveTab]   = useState<TabId>('pixabay');
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<MediaItem[]>(DEFAULTS);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [uploads, setUploads]       = useState<MediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Search ──────────────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string, tab: TabId, pg = 1) => {
    if (tab === 'upload') return;
    if (!q.trim()) { setResults(DEFAULTS); return; }

    setIsLoading(true);
    setError(null);
    try {
      const fn = FETCH_FN[tab];
      const items = await fn(q.trim(), pg);
      setResults(pg === 1 ? items : prev => [...prev, ...items]);
      setHasMore(items.length === 20);
    } catch (e: any) {
      if (e.message === 'no_key') {
        setError(`Add your ${tab.toUpperCase()} API key to .env.local as NEXT_PUBLIC_${tab.toUpperCase()}_${tab === 'unsplash' ? 'ACCESS_KEY' : 'API_KEY'} to enable this source.`);
      } else {
        setError('Search failed. Check your API key and try again.');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, activeTab, 1);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeTab, doSearch]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setQuery('');
    setResults(DEFAULTS);
    setError(null);
    setPage(1);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(query, activeTab, next);
  };

  // ── File Upload ─────────────────────────────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const item: MediaItem = {
          id: `up_${Date.now()}_${Math.random()}`,
          thumb: dataUrl,
          full: dataUrl,
          author: 'You',
          source: 'upload',
          alt: file.name,
        };
        setUploads(prev => [item, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const displayItems = activeTab === 'upload' ? uploads : results;

  return (
    <div className="flex flex-col gap-2">
      
      {/* Source Tabs */}
      <div className="flex gap-1 bg-black/30 rounded-lg p-1">
        {SOURCES.map(src => (
          <button
            key={src.id}
            onClick={() => handleTabChange(src.id)}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${
              activeTab === src.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {src.icon} {src.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' ? (
        <div className="flex flex-col gap-2">
          <div
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
              isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          >
            <Upload className="h-6 w-6 text-indigo-400" />
            <p className="text-xs text-gray-400 text-center">
              <span className="text-indigo-400 font-semibold">Click to upload</span> or drag & drop<br/>
              PNG, JPG, GIF, WebP, SVG
            </p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>
          {uploads.length === 0 && (
            <p className="text-[10px] text-gray-500 text-center">No uploads yet</p>
          )}
        </div>
      ) : (
        /* Search Bar */
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search copyright-free images...`}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-md pl-8 pr-3 py-2 text-white text-xs outline-none focus:border-indigo-500 placeholder:text-gray-600"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-[10px] text-amber-300 leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && results.length === 0 && (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Searching...</span>
        </div>
      )}

      {/* Image Grid */}
      {displayItems.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-0.5">
          {displayItems.map(item => {
            const isSelected = selectedUrl === item.full;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.full)}
                className={`relative group rounded-lg overflow-hidden aspect-square bg-black/30 transition-all ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-[#070A13]' : 'hover:ring-1 hover:ring-white/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumb}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Check className="h-5 w-5 text-white" />
                  <span className="text-[9px] text-white font-semibold">Use Image</span>
                </div>
                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {/* Author tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] text-gray-300 truncate">📷 {item.author}</p>
                </div>
              </button>
            );
          })}
          {/* Loading spinner inline when fetching more pages */}
          {isLoading && results.length > 0 && (
            <div className="col-span-2 flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>
      )}

      {/* Load More */}
      {!isLoading && hasMore && query.trim() && activeTab !== 'upload' && results.length > 0 && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg transition-all hover:bg-indigo-500/5"
        >
          Load more images
        </button>
      )}

      {/* Attribution notice */}
      {activeTab !== 'upload' && (
        <p className="text-[9px] text-gray-600 text-center leading-snug">
          All images are copyright-free for commercial use.<br/>
          Attribution required for some sources — check license.
        </p>
      )}
    </div>
  );
};
