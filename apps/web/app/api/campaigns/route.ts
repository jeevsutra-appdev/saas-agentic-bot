import { NextResponse } from 'next/server';
import { LocalDbController } from '@aether/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantSlug = url.searchParams.get('tenantSlug');
    if (!tenantSlug) return NextResponse.json({ error: 'Missing tenant' }, { status: 400 });
    const campaigns = await LocalDbController.getCampaigns(tenantSlug);
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantSlug, name, description, status } = body;
    if (!tenantSlug || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    const newCamp = await LocalDbController.createCampaign({
      tenantSlug,
      name,
      description: description || '',
      status: status || 'active'
    });
    return NextResponse.json({ campaign: newCamp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
