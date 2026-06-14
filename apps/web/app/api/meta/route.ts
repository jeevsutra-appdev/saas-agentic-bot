export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AetherBot-MetaScraper/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Basic regex parser for OpenGraph tags
    const getMetaTag = (property: string) => {
      const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?(?:property|name)=["'](?:og:)?${property}["'](?:\\s+[^>]*?)?content=["']([^"']*)["']`, "i"));
      return match ? match[1] : null;
    };

    const getTitle = () => {
      const ogTitle = getMetaTag("title");
      if (ogTitle) return ogTitle;
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : null;
    };

    const metadata = {
      title: getTitle(),
      description: getMetaTag("description"),
      image: getMetaTag("image"),
      url: getMetaTag("url") || url,
    };

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Meta Scrape Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
