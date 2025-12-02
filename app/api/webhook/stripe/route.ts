import { stripe } from "@/app/utils/stripe";
import { headers } from "next/headers";
import { apiClient } from "@/app/utils/api-client";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return new Response("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const customerId = session.customer as string;
    const jobId = session.metadata?.jobId;

    if (!jobId) {
      console.error("No job ID found in session metadata");
      return new Response("No job ID found", { status: 400 });
    }

    try {
      // Call Django API to activate the job post after successful payment
      await apiClient.patch(`/api/jobs/${jobId}/`, { 
        status: "ACTIVE" 
      });

      console.log(`Job ${jobId} activated after successful payment from customer ${customerId}`);
    } catch (error) {
      console.error(`Failed to activate job ${jobId}:`, error);
      return new Response("Failed to activate job", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
