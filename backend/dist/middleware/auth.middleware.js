import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    let user = await User.findOne({
      clerkId: userId,
    });

    if (!user) {
      console.log(`⏳ User profile for Clerk ID: ${userId} not found in DB. Attempting to sync from Clerk client...`);
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        if (clerkUser) {
          const email =
            clerkUser.emailAddresses?.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress ??
            clerkUser.emailAddresses?.[0]?.emailAddress;

          const phoneNumber = 
            clerkUser.phoneNumbers?.find(
              (p) => p.id === clerkUser.primaryPhoneNumberId
            )?.phoneNumber ??
            clerkUser.phoneNumbers?.[0]?.phoneNumber;

          const fullName =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
            clerkUser.username ||
            email?.split("@")[0] ||
            phoneNumber ||
            "Clerk User";

          user = await User.findOneAndUpdate(
            { clerkId: userId },
            {
              clerkId: userId,
              email,
              phoneNumber,
              fullName,
              profilePic: clerkUser.imageUrl,
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );
          console.log(`🎉 Successfully synced user from Clerk to DB: ${user._id}`);
        }
      } catch (clerkError) {
        console.error("❌ Failed to fetch user from Clerk client:", clerkError.message);
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "User profile is not synced yet",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}