import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

async function getPageData(tenantSlug: string, slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4022";
    const res = await fetch(`${base}/api/ecom/pages?tenant=${tenantSlug}&slug=${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function StorePage({
  params,
}: {
  params: { tenant: string; slug: string };
}) {
  const { tenant, slug } = params;
  const data = await getPageData(tenant, slug);

  if (!data || !data.page) notFound();

  const { page, storefront } = data;
  const primary = storefront?.primaryColor || "#e91e8c";
  const storeName = storefront?.companyName || tenant;
  const logo = storefront?.brandLogo || "";

  return (
    <div className="min-h-screen bg-[#f4f4f6] dark:bg-[#07090f]">
      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-white/95 dark:bg-[#0b0d14]/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.05] shadow-sm"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link
            href={`/b/${tenant}`}
            className="flex items-center gap-2 shrink-0"
          >
            {logo ? (
              <img loading="lazy" src={logo} alt={storeName} className="h-7 w-auto object-contain" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ backgroundColor: primary }}
              >
                {storeName.charAt(0)}
              </div>
            )}
            <span className="font-black text-[15px] hidden sm:block" style={{ color: primary }}>
              {storeName}
            </span>
          </Link>

          <div className="flex-1" />

          <Link
            href={`/b/${tenant}`}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
          >
            <ShoppingBag className="w-4 h-4" /> Shop
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-5 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Link href={`/b/${tenant}`} className="hover:text-gray-700 dark:hover:text-gray-200 transition flex items-center gap-1">
            <Home className="w-3 h-3" /> Home
          </Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300">{page.title}</span>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Title block */}
        <div
          className="rounded-2xl p-8 mb-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${primary}ee, ${primary}88)` }}
        >
          <h1 className="text-2xl md:text-3xl font-black">{page.title}</h1>
          <p className="text-white/60 text-xs mt-1 font-medium">
            Last updated: {new Date(page.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Content */}
        <div
          className="prose-page bg-white dark:bg-[#0f1220] border border-gray-100 dark:border-white/[0.07] rounded-2xl p-6 md:p-10 shadow-sm"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>

      {/* Footer strip */}
      <div className="border-t border-gray-100 dark:border-white/[0.06] py-6 text-center">
        <p className="text-gray-400 text-[11px]">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          {["about","contact","returns","shipping","privacy","terms","faq"].map(s => (
            <Link
              key={s}
              href={`/b/${tenant}/page/${s}`}
              className={`text-[11px] font-medium transition capitalize ${s === slug ? "font-bold" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              style={s === slug ? { color: primary } : {}}
            >
              {s === "faq" ? "FAQ" : s === "returns" ? "Returns" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Inline prose styles */}
      <style>{`
        [dangerouslySetInnerHTML] h1, [dangerouslySetInnerHTML] h2 {
          font-size: 1.25rem; font-weight: 800; margin: 1.5rem 0 0.5rem; color: inherit;
        }
        [dangerouslySetInnerHTML] h3 { font-size: 1rem; font-weight: 700; margin: 1rem 0 0.25rem; }
        [dangerouslySetInnerHTML] p { margin: 0.5rem 0; line-height: 1.7; font-size: 0.875rem; color: #6b7280; }
        [dangerouslySetInnerHTML] ul, [dangerouslySetInnerHTML] ol { padding-left: 1.25rem; margin: 0.5rem 0; }
        [dangerouslySetInnerHTML] li { margin: 0.25rem 0; font-size: 0.875rem; color: #6b7280; }
        [dangerouslySetInnerHTML] strong { font-weight: 700; color: inherit; }
        @media (prefers-color-scheme: dark) {
          [dangerouslySetInnerHTML] p, [dangerouslySetInnerHTML] li { color: #9ca3af; }
        }
      `}</style>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { tenant: string; slug: string };
}) {
  const data = await getPageData(params.tenant, params.slug);
  if (!data) return { title: "Page Not Found" };
  return {
    title: `${data.page?.title} | ${data.storefront?.companyName || params.tenant}`,
  };
}
