import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Let static assets and standard APIs bypass middleware rules
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/cron") ||
    path.includes(".") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Safe checks for Supabase Env configuration (Robust Development Fallbacks)
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Simulated session checks for fallback development
  const sessionToken = request.cookies.get("sb-access-token")?.value;

  // 1. Super-Admin Gate
  if (path.startsWith("/admin")) {
    if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
      console.warn("Middleware [Dev Mock]: Supabase is not configured. Allowing `/admin` access.");
      return NextResponse.next();
    }
    
    if (!sessionToken && process.env.NODE_ENV !== "development") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    
    // In production: perform DB query to check super_admins table
    // For now, allow bypassing for simple dev preview
    return NextResponse.next();
  }

  // 2. Client Console Gate
  if (path.startsWith("/c/")) {
    const slug = path.split("/")[2];
    
    if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
      console.warn(`Middleware [Dev Mock]: Allowing client access to workspace slug: "${slug}"`);
      return NextResponse.next();
    }

    if (!sessionToken && process.env.NODE_ENV !== "development") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // 3. Onboarding Redirection Rule
  if (path === "/onboarding") {
    // Let onboarding page load
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/c/:path*", "/onboarding"],
};
