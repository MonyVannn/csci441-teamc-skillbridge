"use server";

import { currentUser, UserJSON } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { Education, Experience, User } from "@prisma/client";

export async function getUser() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const currentUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!currentUser) throw new Error("User not found.");

    return currentUser;
  } catch (e) {
    console.error("Error fetching user information, ", e);
    throw new Error("Failed to fetch user information.");
  }
}

export async function getUserByClerkId(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    return user;
  } catch (e) {
    console.error("Error fetching user data, ", e);
    throw new Error("Failed to fatch user Data.");
  }
}

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

// Education
export async function getEducation() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const education = existingUser.education;
    return education;
  } catch (e) {
    console.error("Error fetching user education.", e);
    throw new Error("Failed to fetch user education.");
  }
}

export async function createEducation(educationData: Omit<Education, "id">) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    // Create the education with a generated ID
    const educationWithId = {
      ...educationData,
      id: Date.now().toString(), // or use crypto.randomUUID() for better uniqueness
    };

    // Update user's educations array
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        education: {
          push: educationWithId,
        },
      },
    });

    console.log("Education added:", updatedUser);
    return updatedUser;
  } catch (e) {
    console.error("Error adding an education: ", e);
    throw new Error("Failed to add education to user profile.");
  }
}

export async function editEducation(educationData: Education) {
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not authenticated.");

    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const updatedEducation = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        education: {
          set: existingUser.education.map((exp) =>
            exp.id === educationData.id ? { ...exp, ...educationData } : exp
          ),
        },
      },
    });

    console.log("Edcation updated:", updatedEducation);
    return updatedEducation;
  } catch (e) {
    console.error("Error editting user edcation, ", e);
    throw new Error("Failed to edit user edcation.");
  }
}

export async function deleteEducation(educationId: string) {
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
        education: {
          set: existingUser.education.filter((exp) => exp.id !== educationId),
        },
      },
    });
    console.log("Education deleted:", updatedUser);
    return updatedUser;
  } catch (e) {
    console.error("Error deleting user education, ", e);
    throw new Error("Failed to delete user education.");
  }
}

// Bio
export async function editUserInformation(informationData: User) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");
  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const { id, ...dataWithoutId } = informationData;
    const updatedInformation = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        ...dataWithoutId,
      },
    });

    console.log("Information updated.", updatedInformation);
  } catch (e) {
    console.error("Error editing user information, ", e);
    throw new Error("Failed to edit user information.");
  }
}
