import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// ── Clerk webhook — create/update user in Convex ─────────────────────────
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify the webhook signature from Clerk
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get svix headers
    const svixId        = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    let payload;
    try {
      payload = await request.text();
    } catch {
      return new Response("Failed to read request body", { status: 400 });
    }

    let evt;
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(payload, {
        "svix-id":        svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const eventType = evt.type;
    const data = evt.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId  = data.id;
      const email    = data.email_addresses?.[0]?.email_address;
      const name     = [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined;
      const phone    = data.phone_numbers?.[0]?.phone_number;
      const imageUrl = data.image_url || data.profile_image_url;

      try {
        await ctx.runMutation(api.users.upsertUser, {
          clerkId,
          email,
          name,
          phone,
          imageUrl,
        });
      } catch (err) {
        console.error("Failed to upsert user:", err);
        return new Response("Failed to process user", { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
