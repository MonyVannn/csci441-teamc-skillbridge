"use server";

import { currentUser } from "@clerk/nextjs/server";
import {
  Prisma,
  ProjectCategory,
  ProjectScope,
  ProjectStatus,
} from "@prisma/client";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import {
  incrementUserStats,
  updateUserBadges,
  getProjectScopeHours,
} from "./badge";

export async function getAvailableProjects(
  query: string,
  page: string,
  categories: string,
  scopes: string,
  minBudget: string,
  maxBudget: string
) {
  const pageSize = 6;
  // Determine the skip value based on the presence of a query
  let skip: number;
  if (query) {
    skip = 0; // If there's a query, reset to the first page (skip 0)
  } else {
    skip = Math.abs(pageSize * (Number(page) - 1)); // Otherwise, calculate skip based on the provided page
  }

  const categoryList =
    categories.length > 0
      ? (categories.split(",") as ProjectCategory[])
      : undefined;

  const scopeList =
    scopes.length > 0 ? (scopes.split(",") as ProjectScope[]) : undefined;

  try {
    const totalProjects = await prisma.project.count({
      where: {
        status: { not: "ARCHIVED" },
        title: { contains: query, mode: "insensitive" },
        category: { in: categoryList },
        scope: { in: scopeList },
        budget: {
          gte: minBudget ? Number(minBudget) : undefined,
          lte: maxBudget ? Number(maxBudget) : undefined,
        },
      },
    });
    const availableProjects = await prisma.project.findMany({
      skip: skip,
      take: pageSize,
      where: {
        status: { not: "ARCHIVED" },
        title: { contains: query, mode: "insensitive" },
        category: { in: categoryList },
        scope: { in: scopeList },
        budget: {
          gte: minBudget ? Number(minBudget) : undefined,
          lte: maxBudget ? Number(maxBudget) : undefined,
        },
      },
      include: {
        businessOwner: {
          select: {
            id: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
            address: true,
            bio: true,
            intro: true,
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
        applications: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { availableProjects, totalProjects };
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
      include: {
        assignedStudent: true,
      },
    });

    return projects;
  } catch (e) {
    console.error("Error fetching project data, ", e);
    throw new Error("Failed to fetch project data.");
  }
}

export async function getProjectByProjectId(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        businessOwner: {
          select: {
            id: true,
            clerkId: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
            address: true,
            bio: true,
            intro: true,
          },
        },
        assignedStudent: {
          select: {
            id: true,
            clerkId: true,
            imageUrl: true,
            firstName: true,
            lastName: true,
            bio: true,
            skills: true,
          },
        },
        applications: {
          select: {
            updatedAt: true,
            status: true,
          },
        },
      },
    });

    if (!project) throw new Error("Project not found.");

    return project;
  } catch (e) {
    console.error("Error fetching project data, ", e);
    throw new Error("Failed to fetch project data.");
  }
}

export async function getProjectTimelineByProjectId(
  projectId: string,
  applicantId: string
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        createdAt: true,
        assignedAt: true,
        inProgressAt: true,
        inReviewAt: true,
        completedAt: true,
        status: true,
      },
    });

    if (!project) throw new Error("Project not found.");

    const application = await prisma.application.findUnique({
      where: {
        projectId_applicantId: {
          projectId: projectId,
          applicantId: applicantId,
        },
      },
    });

    if (!application) throw new Error("Application not found.");

    const projectTimelineData = [
      {
        date: new Date(application?.appliedAt).toLocaleDateString(),
        title: "Application Submitted",
        content: "User submitted their application for this project.",
      },
      {
        date: project.assignedAt
          ? new Date(project.assignedAt).toLocaleDateString()
          : "Pending",
        title: "Assigned",
        content:
          "Project has been assigned to the selected student after careful review of all applications.",
      },
      {
        date: project.inProgressAt
          ? new Date(project.inProgressAt).toLocaleDateString()
          : "Pending",
        title: "In Progress",
        content: "Student has officially begun working on the project.",
      },
      {
        date: project.inReviewAt
          ? new Date(project.inReviewAt).toLocaleDateString()
          : "Pending",
        title: "In Review",
        content: "The student has submitted their completed work for review.",
      },
      {
        date: project.completedAt
          ? new Date(project.completedAt).toLocaleDateString()
          : "Pending",
        title: "Completed",
        content:
          "Project has been successfully completed and approved by the business owner.",
      },
    ].filter((entry, index) => {
      const statusOrder = [
        "APPLICATION_SUBMITTED",
        "ASSIGNED",
        "IN_PROGRESS",
        "IN_REVIEW",
        "COMPLETED",
      ];
      const currentStatusIndex = statusOrder.indexOf(project.status);
      return index <= currentStatusIndex;
    });

    return projectTimelineData;
  } catch (e) {
    console.error("Error fetching project timeline, ", e);
    throw new Error("Failed to fetch project timeline.");
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

export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus
) {
  const user = await currentUser();

  if (!user) throw new Error("Not authenticated.");

  try {
    const existingUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
    });

    if (!existingUser) throw new Error("User not found.");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error("Project not found.");

    // Verify the user is either the business owner or the assigned student
    const isOwner = project.businessOwnerId === existingUser.id;
    const isAssignedStudent = project.assignedStudentId === existingUser.id;

    if (!isOwner && !isAssignedStudent) {
      throw new Error(
        "You do not have permission to update this project status."
      );
    }

    // Prepare update data with the appropriate timestamp
    const updateData: {
      status: ProjectStatus;
      inProgressAt?: Date;
      inReviewAt?: Date;
      completedAt?: Date;
    } = {
      status: newStatus,
    };

    // Set the appropriate timestamp based on the new status
    switch (newStatus) {
      case "IN_PROGRESS":
        updateData.inProgressAt = new Date();
        break;
      case "IN_REVIEW":
        updateData.inReviewAt = new Date();
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        break;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // If project is being marked as completed, update student badges and stats
    if (newStatus === "COMPLETED" && project.assignedStudentId) {
      try {
        // Calculate hours based on project scope
        const hoursAwarded = await getProjectScopeHours(project.scope);

        // Increment the student's stats
        await incrementUserStats(project.assignedStudentId, {
          projectsCompleted: 1,
          hoursContributed: hoursAwarded,
        });

        // Check and update all badges
        await updateUserBadges(project.assignedStudentId);

        console.log(
          `Badges and stats updated for user ${project.assignedStudentId}. Hours awarded: ${hoursAwarded}`
        );
      } catch (badgeError) {
        // Log the error but don't fail the status update
        console.error("Error updating badges:", badgeError);
      }
    }

    // Revalidate the project page to reflect the status change
    revalidatePath(`/project/${projectId}`);

    return updatedProject;
  } catch (e) {
    console.error("Error updating project status: ", e);
    throw new Error("Failed to update project status.");
  }
}
