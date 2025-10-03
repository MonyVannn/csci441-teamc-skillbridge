"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../prisma";

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

    const application = await prisma.application.create({
      data: {
        status: "PENDING",
        coverLetter: coverLetter,
        projectId: projectId,
        applicantId: existingUser.id,
      },
    });

    return application;
  } catch (e) {
    console.error("Error creating an application, ", e);
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

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: "ACCEPTED",
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

    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    });

    return { success: true };
  } catch (e) {
    console.error("Error withdrawing application: ", e);
    throw new Error("Failed to withdraw application");
  }
}
