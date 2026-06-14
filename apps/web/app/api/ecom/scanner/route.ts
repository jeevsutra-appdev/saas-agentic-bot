export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

// In-memory store for recently scanned barcodes.
// In a real production app, this would be Redis or a fast database table.
const scannedBarcodes: Record<string, { barcode: string, timestamp: number }[]> = {};

// Clean up old scans every minute
setInterval(() => {
  const now = Date.now();
  for (const key in scannedBarcodes) {
    scannedBarcodes[key] = scannedBarcodes[key].filter(s => now - s.timestamp < 60000); // keep for 60s
  }
}, 60000);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenantSlug");
    const storeId = searchParams.get("storeId");
    const since = parseInt(searchParams.get("since") || "0");

    if (!tenantSlug || !storeId) {
      return NextResponse.json({ success: false, error: "Missing tenantSlug or storeId" }, { status: 400 });
    }

    const key = `${tenantSlug}_${storeId}`;
    const scans = scannedBarcodes[key] || [];
    
    // Return scans that happened after 'since'
    const recentScans = scans.filter(s => s.timestamp > since);
    
    return NextResponse.json({ 
      success: true, 
      scans: recentScans,
      serverTime: Date.now()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, storeId, barcode } = body;

    if (!tenantSlug || !storeId || !barcode) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const key = `${tenantSlug}_${storeId}`;
    if (!scannedBarcodes[key]) {
      scannedBarcodes[key] = [];
    }

    scannedBarcodes[key].push({
      barcode,
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
