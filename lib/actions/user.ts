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
export async function updateBio(bio: string) {
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

    // Check if URL already exists
    const urlExists = existingUser.socialLinks.some((link) => link.url === url);

    if (urlExists) {
      return {
        success: false,
        error: "This URL already exists in your social links.",
      };
    }

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
    return { success: false, error: "Failed to create social link." };
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

    // Ensure URLs are unique as a safety measure (frontend should already handle this)
    const uniqueLinks = links.filter(
      (link, index, self) => index === self.findIndex((l) => l.url === link.url)
    );

    // Replace all social links
    await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        socialLinks: uniqueLinks,
      },
    });

    revalidatePath(`/profile/${user.id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating social links: ", e);
    return { success: false, error: "Failed to update social links." };
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

    // Check if link was actually found and removed
    if (updatedLinks.length === existingUser.socialLinks.length) {
      return { success: false, error: "Social link not found." };
    }

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
    return { success: false, error: "Failed to delete social link." };
  }
}

export async function deleteUser(clerkId: string) {
  console.log(`[deleteUser] Starting deletion for clerkId: ${clerkId}`);

  try {
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        applications: true,
        postedProjects: true,
        assignedProjects: true,
        sentMessages: true,
        conversations: true,
      },
    });

    if (!user) {
      console.log(
        `[deleteUser] User with clerkId ${clerkId} not found in database`
      );
      return {
        success: true,
        message: "User not found (may already be deleted)",
      };
    }

    console.log(
      `[deleteUser] Found user: ${user.email} (${clerkId}) with ${user.applications.length} applications, ${user.postedProjects.length} posted projects, ${user.assignedProjects.length} assigned projects, ${user.sentMessages.length} messages, ${user.conversations.length} conversations`
    );

    // Step 1: Delete all applications made by this user
    console.log(`[deleteUser] Step 1: Deleting applications...`);
    const deletedApplications = await prisma.application.deleteMany({
      where: { applicantId: user.id },
    });
    console.log(
      `[deleteUser] Deleted ${deletedApplications.count} applications`
    );

    // Step 2: Handle projects posted by this user (business owner)
    // Option A: Delete projects if no one is assigned
    // Option B: Mark projects as archived/cancelled
    // We'll use Option B for better data integrity
    console.log(`[deleteUser] Step 2: Handling posted projects...`);
    const postedProjectsCount = await prisma.project.updateMany({
      where: {
        businessOwnerId: user.id,
        status: { notIn: ["COMPLETED", "CANCELLED", "ARCHIVED"] },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });
    console.log(
      `[deleteUser] Cancelled ${postedProjectsCount.count} active posted projects`
    );

    // For completed/archived projects, we'll keep them but remove the owner reference
    // This maintains project history for students who worked on them
    await prisma.project.updateMany({
      where: {
        businessOwnerId: user.id,
        status: { in: ["COMPLETED", "ARCHIVED"] },
      },
      data: {
        businessOwnerId: "000000000000000000000000", // Placeholder ID for deleted users
      },
    });

    // Step 3: Handle projects assigned to this user (student)
    // Reset assigned projects back to OPEN or IN_REVIEW status
    console.log(`[deleteUser] Step 3: Handling assigned projects...`);
    const assignedProjectsCount = await prisma.project.updateMany({
      where: {
        assignedStudentId: user.id,
        status: { notIn: ["COMPLETED", "ARCHIVED"] },
      },
      data: {
        assignedStudentId: null,
        assignedAt: null,
        status: "OPEN",
      },
    });
    console.log(
      `[deleteUser] Unassigned user from ${assignedProjectsCount.count} active projects`
    );

    // For completed projects, just remove the student reference but keep history
    await prisma.project.updateMany({
      where: {
        assignedStudentId: user.id,
        status: { in: ["COMPLETED", "ARCHIVED"] },
      },
      data: {
        assignedStudentId: null,
      },
    });

    // Step 4: Delete all messages sent by this user
    console.log(`[deleteUser] Step 4: Deleting messages...`);
    const deletedMessages = await prisma.message.deleteMany({
      where: { senderId: user.id },
    });
    console.log(`[deleteUser] Deleted ${deletedMessages.count} messages`);

    // Step 5: Handle conversations
    console.log(`[deleteUser] Step 5: Handling conversations...`);
    // First, disconnect the user from all conversations in the User model
    await prisma.user.update({
      where: { clerkId },
      data: {
        conversationIds: [],
        conversations: {
          set: [], // Disconnect from all conversations
        },
      },
    });
    console.log(`[deleteUser] Disconnected user from all conversations`);

    // Now remove user from conversation participant lists and clean up empty conversations
    for (const conversation of user.conversations) {
      const updatedParticipantIds = conversation.participantIds.filter(
        (id) => id !== user.id
      );

      // If conversation has no more participants, delete it
      if (updatedParticipantIds.length === 0) {
        await prisma.conversation.delete({
          where: { id: conversation.id },
        });
        console.log(
          `[deleteUser] Deleted empty conversation ${conversation.id}`
        );
      } else {
        // Update conversation to remove this user
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            participantIds: updatedParticipantIds,
          },
        });
      }
    }
    console.log(
      `[deleteUser] Processed ${user.conversations.length} conversations`
    );

    // Step 6: Finally, delete the user record
    console.log(`[deleteUser] Step 6: Deleting user record...`);
    await prisma.user.delete({
      where: { clerkId },
    });
    console.log(
      `[deleteUser] ✅ Successfully deleted user: ${user.email} (${clerkId})`
    );

    return {
      success: true,
      message: "User and all associated data deleted successfully",
      details: {
        applications: deletedApplications.count,
        messages: deletedMessages.count,
        postedProjects: postedProjectsCount.count,
        assignedProjects: assignedProjectsCount.count,
        conversations: user.conversations.length,
      },
    };
  } catch (error) {
    console.error("[deleteUser] ❌ Error deleting user:", error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error("[deleteUser] Error name:", error.name);
      console.error("[deleteUser] Error message:", error.message);
      console.error("[deleteUser] Error stack:", error.stack);
    }
    throw new Error(`Failed to delete user from the database: ${error}`);
  }
}
