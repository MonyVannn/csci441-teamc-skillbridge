"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "../prisma";

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
