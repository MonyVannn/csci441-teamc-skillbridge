"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export async function getProjects() {
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
