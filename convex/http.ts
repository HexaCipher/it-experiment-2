import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

// ─── Name Validation Helpers ──────────────────────────────
/**
 * Strips leading/trailing whitespace and collapses internal spaces.
 * Returns the sanitized value.
 */
function sanitizeName(raw: string | null | undefined): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Returns true if the name contains any digit character.
 * Used as a server-side guard — defence-in-depth against API-level bypass.
 */
function containsDigit(name: string): boolean {
  return /\d/.test(name);
}

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Server configuration error", { status: 500 });
    }

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const user = evt.data;

      const clerkUserId = user.id;
      const email = user.email_addresses?.[0]?.email_address ?? null;

      if (!clerkUserId || !email) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing user data" }),
          { status: 400 },
        );
      }

      // ── Server-side name validation (defence-in-depth) ──
      const firstName = sanitizeName(user.first_name);
      const lastName = sanitizeName(user.last_name);

      if (containsDigit(firstName) || containsDigit(lastName)) {
        console.warn(
          `Rejected user.created — name contains digits: "${firstName}" "${lastName}" (${clerkUserId})`
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: "Name must not contain numeric characters.",
          }),
          { status: 422, headers: { "Content-Type": "application/json" } },
        );
      }

      const displayName = `${firstName} ${lastName}`.trim() || "New User";
      console.log("Creating user:", clerkUserId, email, displayName);

      try {
        const result = await ctx.runMutation(
          internal.functions.mutations.createUser,
          {
            clerk_user_id: clerkUserId,
            email,
            role: "user",
            status: "pending",
            name: displayName,
            created_at: Date.now(),
          },
        );

        console.log("User created successfully:", result);
        return new Response(JSON.stringify({ success: true, result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to create user:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to create user",
            error: error instanceof Error ? error.message : String(error),
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    if (eventType === "user.updated") {
      const user = evt.data;
      const clerkUserId = user.id;

      // ── Server-side name validation (defence-in-depth) ──
      const firstName = sanitizeName(user.first_name);
      const lastName = sanitizeName(user.last_name);

      if (containsDigit(firstName) || containsDigit(lastName)) {
        console.warn(
          `Rejected user.updated — name contains digits: "${firstName}" "${lastName}" (${clerkUserId})`
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: "Name must not contain numeric characters.",
          }),
          { status: 422, headers: { "Content-Type": "application/json" } },
        );
      }

      const displayName = `${firstName} ${lastName}`.trim() || "User";

      try {
        // Update user details (email, name) without changing role/status
        await ctx.runMutation(internal.functions.mutations.createUser, {
          clerk_user_id: clerkUserId,
          email: user.email_addresses?.[0]?.email_address ?? "",
          name: displayName,
          role: "user",
          status: "pending",
          created_at: Date.now(),
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to update user:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to update user" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    if (eventType === "user.deleted") {
      const user = evt.data;
      const clerkUserId = user.id;

      if (!clerkUserId) {
        return new Response("Missing user id", { status: 400 });
      }

      try {
        await ctx.runMutation(internal.functions.mutations.deleteUserByClerkId, {
          clerk_user_id: clerkUserId,
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to delete user:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to delete user" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event processed" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }),
});

export default http;