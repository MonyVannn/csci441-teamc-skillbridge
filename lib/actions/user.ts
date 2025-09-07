import { UserJSON } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { User } from "@prisma/client";

export async function createUser(userData: UserJSON) {
  const email = userData.email_addresses[0].email_address;
  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        imageUrl: userData.image_url,
        role: "USER", // Default to USER for new sign-ups
        occupied: false, // Default
        totalHoursContributed: 0, // Default
        projectsCompleted: 0, // Default
        industriesExperienced: [], // Default
        // Social links and experiences will be empty initially and can be added later
        socialLinks: [],
        experiences: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
      },
    });
    console.log("User created in DB:", newUser.email);

    return newUser;
  } catch (error) {
    console.error("Error creating user in DB:", error);
    // Depending on your error handling strategy, you might re-throw the error
    // or return a specific error object.
    throw new Error("Failed to create user in the database.");
  }
}
