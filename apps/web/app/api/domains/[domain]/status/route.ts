import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ domain: string }> }) {
  // Mocking Vercel Domains API Verification
  const domain = (await params).domain;
  
  // Simulate 30% chance of still verifying, 70% chance of active
  const isVerified = Math.random() > 0.3;
  
  return NextResponse.json({
    domain,
    status: isVerified ? 'active' : 'pending_verification',
    verifiedAt: isVerified ? new Date().toISOString() : null
  });
}
