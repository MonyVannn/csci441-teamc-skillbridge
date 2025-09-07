import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/lib/actions/user";

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
    } catch (e) {
      console.error("Error saving user", e);
      return new Response("Error saving user", { status: 500 });
    }
  }
  return new Response("boop", { status: 201 });
}
