"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export async function getAvailableProjects() {
  try {
    const availableProjects = await prisma.project.findMany({
      where: {
        status: { not: "ARCHIVED" },
      },
      include: {
        businessOwner: {
          select: {
            id: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedStudent: {
          select: {
            id: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return availableProjects;
  } catch (e) {
    console.error("Error fetching available projects, ", e);
    throw new Error("Failed to fetch available projects.");
  }
}

export async function getProjectsByOwnerId() {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error("This role is not allowed to call this function.");

    const projects = await prisma.project.findMany({
      where: { businessOwnerId: existingUser.id },
    });

    return projects;
  } catch (e) {
    console.error("Error fetching project data, ", e);
    throw new Error("Failed to fetch project data.");
  }
}

export async function createProject(projectData: Prisma.ProjectCreateInput) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const currentUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!currentUser) throw new Error("User not found.");
    if (currentUser.role !== "BUSINESS_OWNER")
      throw new Error("User can not create a project.");

    const project = await prisma.project.create({
      data: projectData,
    });

    console.log("Project successfully created.");
    return project;
  } catch (e) {
    console.error("Error creating new project, ", e);
    throw new Error("Failed to create new project.");
  }
}

export async function editProject(
  projectData: Prisma.ProjectCreateInput,
  projectId: string
) {
  const user = await currentUser();

  if (!user) throw new Error("User not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error("This role is now allowed to call this function.");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error("Project not found.");
    if (project.status !== "OPEN")
      throw new Error("Only open project can be deleted");

    await prisma.project.update({
      where: { id: projectId },
      data: projectData,
    });

    return project;
  } catch (e) {
    console.error("Error updating project data, ", e);
    throw new Error("Failed to updated project data.");
  }
}

export async function deleteProject(projectId: string) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");
    if (existingUser.role !== "BUSINESS_OWNER")
      throw new Error("This role is not allowed to call this function.");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error("Project not found.");
    if (project.status !== "OPEN")
      throw new Error("Only open projects can be deleted.");

    await prisma.project.delete({
      where: { id: projectId },
    });

    return project;
  } catch (e) {
    console.error("Error deleting project, ", e);
    throw new Error("Failed to delete project.");
  }
}
