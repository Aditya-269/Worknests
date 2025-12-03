import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/utils/stripe';
import { jobListingDurationPricing } from '@/app/utils/pricingTiers';

export async function POST(request: NextRequest) {
  try {
    const { jobId, listingDuration } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    if (!listingDuration) {
      return NextResponse.json({ error: 'Listing duration is required' }, { status: 400 });
    }

    // Find the pricing for this duration
    const pricingTier = jobListingDurationPricing.find(tier => tier.days === listingDuration);
    if (!pricingTier) {
      return NextResponse.json({ error: 'Invalid listing duration' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Job Posting',
              description: `${pricingTier.days}-day ${pricingTier.description.toLowerCase()} job listing`,
            },
            unit_amount: pricingTier.price * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&job_id=${jobId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?job_id=${jobId}`,
      metadata: {
        jobId: jobId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}