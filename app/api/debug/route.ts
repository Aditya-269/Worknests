import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}