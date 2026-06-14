import { NextResponse } from 'next/server';
import { LocalDbController } from '@aether/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, listId, name, email, phone } = body;

    if (!tenantSlug || !listId) {
      return NextResponse.json({ error: 'Missing required fields: tenantSlug, listId.' }, { status: 400 });
    }

    const newLead = await LocalDbController.addLead({
      tenantSlug,
      name: name || 'Anonymous User',
      email,
      details: JSON.stringify({ phone, source: 'OptIn Form', listId })
    });

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: newLead.id
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
