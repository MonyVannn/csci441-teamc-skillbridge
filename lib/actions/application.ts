"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { hasCompleteProfile } from "../utils";

export async function getApplicationsByUserId() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const applications = await prisma.application.findMany({
      where: {
        applicantId: existingUser.id,
      },
      include: {
        project: {
          include: {
            businessOwner: true,
          },
        },
      },
    });

    return applications;
  } catch (e) {
    console.error("Error fetching applications: ", e);
    throw new Error("Failed to fetch applications");
  }
}

export async function getApplicationByProjectId(projectId: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const applications = await prisma.application.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        applicant: true,
      },
    });

    return applications;
  } catch (e) {
    console.error("Error fetching applications by project ID: ", e);
    throw new Error("Failed to fetch applications");
  }
}

export async function getApplicationsForAllOwnerProjects() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const applications = await prisma.application.findMany({
      where: {
        project: {
          businessOwnerId: existingUser.id,
        },
      },
      include: {
        applicant: true,
        project: true,
      },
      orderBy: {
        appliedAt: "asc",
      },
    });

    return applications;
  } catch (e) {
    console.error("Error fetching applications for owner projects: ", e);
    throw new Error("Failed to fetch applications");
  }
}

export async function getTotalUnrespondedApplication() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error(
        "Only business owners can view unresponded applications."
      );

    const count = await prisma.application.count({
      where: {
        project: {
          businessOwnerId: existingUser.id,
        },
        status: "PENDING",
      },
    });

    return count;
  } catch (e) {
    console.error("Error fetching unresponded applications count: ", e);
    throw new Error("Failed to fetch unresponded applications count");
  }
}

export async function createApplication(
  projectId: string,
  coverLetter: string
) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "USER")
      throw new Error("User must be a student.");

    // Check if user has complete profile
    const profileCheck = hasCompleteProfile(existingUser);
    if (!profileCheck.isComplete) {
      const missingFieldsList = profileCheck.missingFields.join(", ");
      throw new Error(
        `Please complete your profile before applying. Missing: ${missingFieldsList}`
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error("Project not found.");
    if (project.status !== "OPEN") throw new Error("Unavailable project.");

    const application = await prisma.application.create({
      data: {
        status: "PENDING",
        coverLetter: coverLetter,
        projectId: projectId,
        applicantId: existingUser.id,
      },
    });

    revalidatePath("/");
    return application;
  } catch (e) {
    console.error("Error creating an application, ", e);
    if (e instanceof Error) {
      throw e; // Re-throw the original error to preserve the message
    }
    throw new Error("Failed to create an application");
  }
}

export async function approveApplication(applicationId: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error("Only business owners can approve applications.");

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
      },
      include: {
        project: {
          include: {
            businessOwner: true,
          },
        },
      },
    });

    if (!application) throw new Error("Application not found.");
    if (
      !application.project ||
      !application.project.businessOwner ||
      application.project.businessOwner.id !== existingUser.id
    ) {
      throw new Error(
        "You do not have permission to approve this application."
      );
    }

    // Use project from the application include instead of fetching again
    if (application.project.status !== "OPEN")
      throw new Error("Unavailable project.");

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "ACCEPTED",
        seenByApplicant: false,
        statusChangedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: {
        id: application.projectId,
      },
      data: {
        status: "ASSIGNED",
        assignedStudentId: application.applicantId,
        assignedAt: new Date(),
      },
    });

    revalidatePath("/");

    return updatedApplication;
  } catch (e) {
    console.error("Error approving application: ", e);
    throw new Error("Failed to approve application");
  }
}

export async function rejectApplication(applicationId: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error("Only business owners can reject applications.");

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
      },
    });

    if (!application) throw new Error("Application not found.");

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "REJECTED",
        seenByApplicant: false,
        statusChangedAt: new Date(),
      },
    });

    revalidatePath("/");

    return updatedApplication;
  } catch (e) {
    console.error("Error rejecting application: ", e);
    throw new Error("Failed to reject application");
  }
}

export async function isApplied(projectId: string, userId?: string) {
  const user = userId ? { id: userId } : await currentUser();

  if (!user) return false;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) return false;

    const application = await prisma.application.findFirst({
      where: {
        projectId: projectId,
        applicantId: existingUser.id,
      },
    });

    return !!application;
  } catch (e) {
    console.error("Error checking application status: ", e);
    return false;
  }
}

export async function withdrawApplication(applicationId: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        applicantId: existingUser.id,
      },
    });

    if (!application) throw new Error("Application not found.");

    // Only allow withdrawal of PENDING applications
    if (application.status !== "PENDING") {
      throw new Error(
        "Only pending applications can be withdrawn. This application has already been processed."
      );
    }

    // Hard delete the application to allow re-application
    // This removes the unique constraint conflict and lets users apply again
    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    });

    // Revalidate paths to update caches
    revalidatePath("/");

    return { success: true };
  } catch (e) {
    console.error("Error withdrawing application: ", e);
    throw new Error("Failed to withdraw application");
  }
}

export async function getUnseenApplicationCount() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "USER")
      throw new Error("Only students can view unseen application count.");

    const count = await prisma.application.count({
      where: {
        applicantId: existingUser.id,
        seenByApplicant: false,
      },
    });

    return count;
  } catch (e) {
    console.error("Error fetching unseen applications count: ", e);
    throw new Error("Failed to fetch unseen applications count");
  }
}

export async function markApplicationsAsSeen() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "USER")
      throw new Error("Only students can mark applications as seen.");

    await prisma.application.updateMany({
      where: {
        applicantId: existingUser.id,
        seenByApplicant: false,
      },
      data: {
        seenByApplicant: true,
      },
    });

    return { success: true };
  } catch (e) {
    console.error("Error marking applications as seen: ", e);
    throw new Error("Failed to mark applications as seen");
  }
}
