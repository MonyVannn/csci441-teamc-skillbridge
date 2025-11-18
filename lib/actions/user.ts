"use server";

import { currentUser, UserJSON } from "@clerk/nextjs/server";
import prisma from "../prisma";
import { Education, Experience, User } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function isAuthenticated(): Promise<boolean> {
  const user = await currentUser();
  return user !== null;
}

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

export async function getUserOrNull() {
  const user = await currentUser();

  if (!user) return null;

  try {
    const currentUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!currentUser) {
      console.error("User authenticated with Clerk but not found in database");
      return null;
    }

    return currentUser;
  } catch (e) {
    console.error("Error fetching user information, ", e);
    return null;
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
    return null;
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
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        imageUrl: userData.image_url || null,
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

    return newUser;
  } catch (error) {
    console.error("Error creating user in DB:", error);
    // Depending on your error handling strategy, you might re-throw the error
    // or return a specific error object.
    throw new Error("Failed to create user in the database.");
  }
}

export async function updateUser(userData: UserJSON) {
  if (
    !Array.isArray(userData.email_addresses) ||
    userData.email_addresses.length === 0 ||
    !userData.email_addresses[0]?.email_address
  ) {
    throw new Error("User data is missing a valid email address.");
  }
  const email = userData.email_addresses[0].email_address;

  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: email,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        imageUrl: userData.image_url || null,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user in DB:", error);
    throw new Error("Failed to update user in the database.");
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

    revalidatePath(`/profile/${user.id}`);

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

    revalidatePath(`/profile/${user.id}`);
    return updatedExperience;
  } catch (e) {
    console.error("Error editing user experience, ", e);
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
    revalidatePath(`/profile/${user.id}`);
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

    revalidatePath(`/profile/${user.id}`);

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

    revalidatePath(`/profile/${user.id}`);
    return updatedEducation;
  } catch (e) {
    console.error("Error editing user education, ", e);
    throw new Error("Failed to edit user education.");
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

    revalidatePath(`/profile/${user.id}`);
    return updatedUser;
  } catch (e) {
    console.error("Error deleting user education, ", e);
    throw new Error("Failed to delete user education.");
  }
}

// Bio and Intro
export async function updateBioAndIntro(bio: string, intro: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        bio: bio,
        intro: intro,
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating bio and intro: ", e);
    throw new Error("Failed to update bio and intro.");
  }
}

// Update Header (First Name, Last Name, and Intro)
export async function updateUserHeader(
  firstName: string,
  lastName: string,
  intro: string,
  address: string
) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        firstName: firstName,
        lastName: lastName,
        intro: intro,
        address: address,
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating user header: ", e);
    throw new Error("Failed to update user header.");
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

    revalidatePath("/");
  } catch (e) {
    console.error("Error editing user information, ", e);
    throw new Error("Failed to edit user information.");
  }
}

/**
 * Search for users by name or email
 * Excludes the current user from results
 */
export async function searchUsers(query: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const currentDbUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!currentDbUser) throw new Error("User not found.");

    // Return empty array if query is empty
    if (!query.trim()) {
      return [];
    }

    // Search users by first name, last name, or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: currentDbUser.id, // Exclude current user
            },
            role: {
              not: "ADMIN",
            },
          },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        role: true,
      },
      take: 10, // Limit results
    });

    return users;
  } catch (e) {
    console.error("Error searching users, ", e);
    throw new Error("Failed to search users.");
  }
}

export async function getUsersRecommendation() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!currentUser) throw new Error("User not found.");

    let recommendation;

    if (currentUser.industriesExperienced.length === 0) {
      // If user has no industry experience, get random users
      recommendation = await prisma.user.findMany({
        where: {
          id: {
            not: currentUser.id,
          },
          role: {
            not: "ADMIN",
          },
        },
        take: 5,
        orderBy: {
          id: "asc",
        },
      });
    } else {
      // If user has industry experience, recommend based on shared industries
      recommendation = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: {
                not: currentUser.id,
              },
              role: {
                not: "ADMIN",
              },
            },
            {
              industriesExperienced: {
                hasSome: currentUser.industriesExperienced,
              },
            },
          ],
        },
        take: 5,
      });
    }

    return recommendation;
  } catch (e) {
    console.error("Error getting user recommendation ", e);
    throw new Error("Failed to get user recommendation.");
  }
}

// Social Links Management
export async function createSocialLink(type: string, url: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    // Add new social link to existing links
    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        socialLinks: {
          push: {
            type: type,
            url: url,
          },
        },
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error creating social link: ", e);
    throw new Error("Failed to create social link.");
  }
}

export async function updateSocialLinks(
  links: Array<{ type: string; url: string }>
) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    // Replace all social links
    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        socialLinks: links,
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating social links: ", e);
    throw new Error("Failed to update social links.");
  }
}

export async function deleteSocialLink(linkUrl: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    // Filter out the link to delete
    const updatedLinks = existingUser.socialLinks.filter(
      (link) => link.url !== linkUrl
    );

    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        socialLinks: updatedLinks,
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error deleting social link: ", e);
    throw new Error("Failed to delete social link.");
  }
}
