import { NextResponse } from "next/server";

// Using a static mock for exchange rates for demo purposes.
// In production, this would call a real API like ExchangeRate-API.
const mockRates = {
  USD: 1,
  INR: 83.5,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.5,
  AED: 3.67
};

export async function GET(request: Request) {
  try {
    return NextResponse.json({ success: true, rates: mockRates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
