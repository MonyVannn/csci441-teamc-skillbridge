import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser } from "@/lib/actions/user";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const svix_id = req.headers.get("svix-id");
  const svix_signature = req.headers.get("svix-signature");
  const svix_timestamp = req.headers.get("svix-timestamp");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = (await req.json()) as Request;
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      await createUser(evt.data);
      console.log(`User created: ${evt.data.id}`);
    } catch (e) {
      console.error("Error saving user", e);
      return new Response("Error saving user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      // evt.data contains the deleted user info with their id (clerkId)
      const clerkId = evt.data.id;
      console.log(
        "[Webhook] Received user.deleted event for clerkId:",
        clerkId
      );

      if (!clerkId) {
        console.error("[Webhook] No clerkId provided in user.deleted event");
        return new Response("Error: Missing clerkId", { status: 400 });
      }

      const result = await deleteUser(clerkId);
      console.log("[Webhook] ✅ User deleted successfully:", clerkId, result);
    } catch (e) {
      console.error("[Webhook] ❌ Error deleting user:", e);
      if (e instanceof Error) {
        console.error("[Webhook] Error details:", e.message);
      }
      return new Response("Error deleting user", { status: 500 });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
