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
  // Calculate skip value based on the current page
  const currentPage = Number(page) || 1;
  const skip = Math.abs(pageSize * (currentPage - 1));

  const categoryList =
    categories.length > 0
      ? (categories.split(",") as ProjectCategory[])
      : undefined;

  const scopeList =
    scopes.length > 0 ? (scopes.split(",") as ProjectScope[]) : undefined;

  // Build where clause once to avoid duplication
  const whereClause = {
    status: "OPEN" as const,
    title: { contains: query, mode: "insensitive" as const },
    category: { in: categoryList },
    scope: { in: scopeList },
    budget: {
      gte: minBudget ? Number(minBudget) : undefined,
      lte: maxBudget ? Number(maxBudget) : undefined,
    },
  };

  try {
    // Use Promise.all to run both queries in parallel
    const [availableProjects, totalProjects] = await Promise.all([
      prisma.project.findMany({
        skip: skip,
        take: pageSize,
        where: whereClause,
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
      }),
      prisma.project.count({
        where: whereClause,
      }),
    ]);

    return { availableProjects, totalProjects };
  } catch (e) {
    console.error("Error fetching available projects, ", e);
    throw new Error("Failed to fetch available projects.");
  }
}

export async function searchProjectsQuick(query: string) {
  try {
    // If no query, return empty results
    if (!query.trim()) {
      return { projects: [], total: 0, hasMore: false };
    }

    // Build where clause for search
    const whereClause = {
      AND: [
        {
          status: "OPEN" as const,
          isPublic: true,
        },
        {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        },
      ],
    };

    // Get top 5 projects (to check if there are more than 4)
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          scope: true,
          budget: true,
          createdAt: true,
          businessOwner: {
            select: {
              id: true,
              imageUrl: true,
              firstName: true,
              lastName: true,
              address: true,
            },
          },
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.project.count({
        where: whereClause,
      }),
    ]);

    return {
      projects: projects.slice(0, 4), // Return only top 4
      total,
      hasMore: total > 4,
    };
  } catch (e) {
    console.error("Error searching projects, ", e);
    throw new Error("Failed to search projects.");
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  } catch (e) {
    console.error("Error fetching project data, ", e);
    throw new Error("Failed to fetch project data.");
  }
}

export async function getCompletedProjectsByAssignedStudentId(userId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found.");

    const completedProjects = await prisma.project.findMany({
      where: {
        assignedStudentId: user.id,
        status: "COMPLETED",
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
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return completedProjects;
  } catch (e) {
    console.error("Error fetching completed projects, ", e);
    throw new Error("Failed to fetch completed projects.");
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
  applicantId?: string | null
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

    // If no applicantId provided, return basic timeline
    if (!applicantId) {
      return [
        {
          date: new Date(project.createdAt).toLocaleDateString(),
          title: "Project Created",
          content: "Project was created and is open for applications.",
        },
      ];
    }

    const application = await prisma.application.findUnique({
      where: {
        projectId_applicantId: {
          projectId: projectId,
          applicantId: applicantId,
        },
      },
    });

    // If no application exists, return basic timeline with project creation
    if (!application) {
      return [
        {
          date: new Date(project.createdAt).toLocaleDateString(),
          title: "Project Created",
          content: "Project was created and is open for applications.",
        },
      ];
    }

    const projectTimelineData = [
      {
        date: new Date(application.appliedAt).toLocaleDateString(),
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

    // Revalidate homepage and settings page
    revalidatePath("/");
    revalidatePath("/settings");

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

    // Allow editing only DRAFT and OPEN projects
    if (project.status !== "OPEN" && project.status !== "DRAFT") {
      throw new Error("Only draft or open projects can be edited");
    }

    await prisma.project.update({
      where: { id: projectId },
      data: projectData,
    });

    // Revalidate homepage and settings page
    revalidatePath("/");
    revalidatePath("/settings");

    return project;
  } catch (e) {
    console.error("Error updating project data, ", e);
    throw new Error("Failed to updated project data.");
  }
}

export async function publishDraftProject(projectId: string) {
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
    if (project.status !== "DRAFT")
      throw new Error("Only draft projects can be published.");

    const publishedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "OPEN",
        isPublic: true,
      },
    });

    // Revalidate homepage and settings page
    revalidatePath("/");
    revalidatePath("/settings");

    return publishedProject;
  } catch (e) {
    console.error("Error publishing project, ", e);
    throw new Error("Failed to publish project.");
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

    // Allow archiving projects that are not already archived or completed
    if (project.status === "ARCHIVED" || project.status === "COMPLETED") {
      throw new Error("Cannot archive completed or already archived projects.");
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "ARCHIVED",
      },
    });

    // Revalidate homepage and settings page
    revalidatePath("/");
    revalidatePath("/settings");

    return project;
  } catch (e) {
    console.error("Error deleting project, ", e);
    throw new Error("Failed to delete project.");
  }
}

export async function unarchiveProject(projectId: string) {
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

    // Only allow unarchiving if project is currently archived
    if (project.status !== "ARCHIVED") {
      throw new Error("Can only unarchive projects that are archived.");
    }

    // Restore to OPEN status (or could restore to previous status if tracked)
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "OPEN",
      },
    });

    // Revalidate homepage and settings page
    revalidatePath("/");
    revalidatePath("/settings");

    return project;
  } catch (e) {
    console.error("Error unarchiving project, ", e);
    throw new Error("Failed to unarchive project.");
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
