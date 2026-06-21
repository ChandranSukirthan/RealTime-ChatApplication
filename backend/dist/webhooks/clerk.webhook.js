import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("👉 Clerk Webhook request received!");
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOKS_SIGNING_SECRET;

    if (!signingSecret) {
      console.error("❌ Webhook secret is not provided in environment variables");
      return res.status(503).json({
        message: "Webhook secret is not provided",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    console.log("⏳ Verifying webhook signature...");
    const evt = await verifyWebhook(request, { signingSecret });
    console.log(`✅ Webhook verified successfully! Event type: ${evt.type}`);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find(
          (e) => e.id === u.primary_email_address_id
        )?.email_address ??
        u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      console.log(`⏳ Saving user to MongoDB: Clerk ID = ${u.id}, Email = ${email}`);
      const savedUser = await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          clerkId: u.id,
          email,
          fullName,
          profilePic: u.image_url,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      console.log(`🎉 User successfully stored/updated in MongoDB! DB ID: ${savedUser._id}`);
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) {
        console.log(`⏳ Deleting user from MongoDB: Clerk ID = ${evt.data.id}`);
        await User.findOneAndDelete({
          clerkId: evt.data.id,
        });
        console.log("🗑️ User successfully deleted from MongoDB.");
      }
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("❌ Error in Clerk webhook:", error);

    return res.status(400).json({
      message: "Webhook verification failed",
    });
  }
});

export default router;