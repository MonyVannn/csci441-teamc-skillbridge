"use server";

import { currentUser, UserJSON } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { Experience } from "@prisma/client";

export async function createUser(userData: UserJSON) {
  if (
    !Array.isArray(userData.email_addresses) ||
    userData.email_addresses.length === 0 ||
    !userData.email_addresses[0]?.email_address
  ) {
    throw new Error("User data is missing a valid email address.");
  }
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

// Experience
export async function getExperience() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const experiences = existingUser.experiences;
    return experiences;
  } catch (e) {
    console.error("Error fetching user experiences.", e);
    throw new Error("Failed to fetch user experiences.");
  }
}

export async function createExperience(experienceData: Omit<Experience, "id">) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    // Create the experience with a generated ID
    const experienceWithId = {
      ...experienceData,
      id: Date.now().toString(), // or use crypto.randomUUID() for better uniqueness
    };

    // Update user's experiences array
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        experiences: {
          push: experienceWithId,
        },
      },
    });

    console.log("Experience added:", updatedUser);
    return updatedUser;
  } catch (e) {
    console.error("Error adding an experience: ", e);
    throw new Error("Failed to add experience to user profile.");
  }
}

export async function editExperience(experienceData: Experience) {
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not authenticated.");

    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const updatedExperience = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        experiences: {
          set: existingUser.experiences.map((exp) =>
            exp.id === experienceData.id ? { ...exp, ...experienceData } : exp
          ),
        },
      },
    });

    console.log("Experience updated:", updatedExperience);
    return updatedExperience;
  } catch (e) {
    console.error("Error editting user experience, ", e);
    throw new Error("Failed to edit user experience.");
  }
}

export async function deleteExperience(experienceId: string) {
  const user = await currentUser();
  try {
    if (!user) throw new Error("Not authenticated.");

    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        experiences: {
          set: existingUser.experiences.filter(
            (exp) => exp.id !== experienceId
          ),
        },
      },
    });
    console.log("Experience deleted:", updatedUser);
    return updatedUser;
  } catch (e) {
    console.error("Error deleting user experience, ", e);
    throw new Error("Failed to delete user experience.");
  }
}
