// import { httpRouter, HttpRouter } from "convex/server";
// import { httpAction } from "./_generated/server";
// import  { Webhook } from "svix";
// import { WebhookEvent } from "@clerk/nextjs/server";

// const http = httpRouter();

// const clerkWebHook = httpAction(async (ctx, request ) => {
//    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
//    if(!webhookSecret) {
//       throw new Error(" Missing CLERK_WEBHOOK_SECRET environment variable");
//    }

//    const svix_id = request.headers.get("svix-id");
//    const svix_signature = request.headers.get("svix-signature");
//    const svix_timestamp = request.headers.get("svix-timestamp");

//    if(!svix_id || !svix_signature || !svix_timestamp) {
//      return new Response("Error occured -- no svix headers", {
//         status:400,
//      });
//    }

//    const payload = await request.json();
//    const body = JSON.stringify(payload);

//    const wh = new Webhook(webhookSecret);

//    let evt: WebhookEvent;

//    try {
//       evt = wh.verify(body, {
//         "svix-id": svix_id,
//         "svix-timestamp": svix_timestamp,
//          "svix-signature": svix_signature,
//       })
//    } catch (error) {
//       console.error("Error verifying webhook:", error);
//       return new Response("Error occured", {status: 400});
//    }

//    try {
//       // todo: create the user save it to the db
//    } catch (error) {

//    }

// })

// http.route({
//     path:"/clerk-webhook",
//     method: "POST",
//     handler:
// })

// export default http;
