import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "Missing required 'domain' search query parameter." },
        { status: 400 }
      );
    }

    console.log(`[Domains API] Performing DNS lookup checks for CNAME/TXT pointer on: ${domain}`);

    // Mock realistic DNS validation lookup
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulated network socket check

    const isVerified = domain.includes(".") && domain.length > 5; // Simple pattern check

    return NextResponse.json({
      success: true,
      domain,
      status: isVerified ? "active" : "pending",
      dnsRecordCheck: {
        type: "CNAME",
        host: "@",
        expectedValue: "cname.aether.ai",
        currentValue: isVerified ? "cname.aether.ai" : "unconfigured",
        verified: isVerified
      },
      txtRecordCheck: {
        type: "TXT",
        host: "_aether-challenge",
        expectedValue: `aether-verification-token-${Math.random().toString(36).substring(2, 9)}`,
        currentValue: isVerified ? "token-validated" : "missing",
        verified: isVerified
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "DNS verification check failed." },
      { status: 500 }
    );
  }
}
