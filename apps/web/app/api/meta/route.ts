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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      return NextResponse.json({
        title: url.split("/").pop() || "Image",
        description: "",
        image: url,
        url: url,
      });
    }

    const html = await response.text();

    const getMetaTag = (property: string) => {
      const match1 = html.match(new RegExp(`<meta[^>]*?(?:property|name)=["'](?:og:)?${property}["'][^>]*?content=["']([^"']+)["']`, "i"));
      if (match1) return match1[1];
      const match2 = html.match(new RegExp(`<meta[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["'](?:og:)?${property}["']`, "i"));
      return match2 ? match2[1] : null;
    };

    const getTitle = () => {
      const ogTitle = getMetaTag("title");
      if (ogTitle) return ogTitle;
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : null;
    };

    const getFallbackImage = () => {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith("data:")) {
           // Only allow data URIs if they are reasonably large (likely a real image, not a tiny placeholder)
           if (src.length > 1000) return src;
           continue;
        }
        if (!src.includes("pixel") && !src.includes("tracking") && !src.includes("icon") && src.length > 10) {
          try {
            return new URL(src, url).href;
          } catch (e) {
            continue;
          }
        }
      }
      return null;
    };

    let image = getMetaTag("image");
    if (image) {
      try {
        image = new URL(image, url).href;
      } catch (e) {}
    } else {
      image = getFallbackImage();
    }

    const metadata = {
      title: getTitle(),
      description: getMetaTag("description"),
      image: image,
      url: getMetaTag("url") || url,
    };

    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Meta Scrape Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
