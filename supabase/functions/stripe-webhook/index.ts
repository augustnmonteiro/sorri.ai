import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper to make Stripe API requests
async function stripeRequest(
  endpoint: string,
  method: string,
  secretKey: string,
  body?: Record<string, string>
) {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  return response.json();
}

// Verify Stripe webhook signature
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const v1Signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !v1Signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === v1Signature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe configuration");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log("Processing webhook event:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripeRequest(
            `/subscriptions/${session.subscription}`,
            "GET",
            stripeSecretKey
          );

          // Update user profile to Pro
          const { error } = await supabase
            .from("profiles")
            .update({
              plan: "pro",
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
            })
            .eq("id", userId);

          if (error) {
            console.error("Error updating profile after checkout:", error);
          } else {
            console.log(`User ${userId} upgraded to Pro`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const updateData: Record<string, string> = {
            subscription_status: subscription.status,
          };

          // If subscription is active, ensure plan is Pro
          if (subscription.status === "active") {
            updateData.plan = "pro";
          }

          // If subscription is canceled or unpaid, downgrade to free
          if (subscription.status === "canceled" || subscription.status === "unpaid") {
            updateData.plan = "free";
            updateData.stripe_subscription_id = "";
          }

          const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", userId);

          if (error) {
            console.error("Error updating subscription status:", error);
          } else {
            console.log(`User ${userId} subscription updated: ${subscription.status}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // Downgrade user to Free
          const { error } = await supabase
            .from("profiles")
            .update({
              plan: "free",
              stripe_subscription_id: null,
              subscription_status: "canceled",
            })
            .eq("id", userId);

          if (error) {
            console.error("Error downgrading user after subscription deleted:", error);
          } else {
            console.log(`User ${userId} downgraded to Free`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          // Get subscription to find user
          const subscription = await stripeRequest(
            `/subscriptions/${subscriptionId}`,
            "GET",
            stripeSecretKey
          );
          const userId = subscription.metadata?.supabase_user_id;

          if (userId) {
            // Update subscription status to past_due
            const { error } = await supabase
              .from("profiles")
              .update({
                subscription_status: "past_due",
              })
              .eq("id", userId);

            if (error) {
              console.error("Error updating subscription status to past_due:", error);
            } else {
              console.log(`User ${userId} payment failed, status: past_due`);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
