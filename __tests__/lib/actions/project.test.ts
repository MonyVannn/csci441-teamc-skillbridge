/**
 * Unit tests for Project Server Actions
 *
 * Tests cover:
 * - createProject: Creating new projects
 * - editProject: Updating existing projects
 * - publishDraftProject: Publishing draft projects
 * - deleteProject: Archiving projects
 * - unarchiveProject: Restoring archived projects
 * - updateProjectStatus: Updating project status with timestamps
 */

import {
  Prisma,
  ProjectScope,
  ProjectCategory,
  ProjectStatus,
} from "@prisma/client";

// Mock Clerk's currentUser
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

// Mock the Prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
    },
    project: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock revalidatePath from Next.js
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock badge actions
jest.mock("@/lib/actions/badge", () => ({
  incrementUserStats: jest.fn(),
  updateUserBadges: jest.fn(),
  getProjectScopeHours: jest.fn().mockResolvedValue(40),
}));

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createProject,
  editProject,
  publishDraftProject,
  deleteProject,
  unarchiveProject,
  updateProjectStatus,
} from "@/lib/actions/project";
import {
  incrementUserStats,
  updateUserBadges,
  getProjectScopeHours,
} from "@/lib/actions/badge";

describe("Project Server Actions", () => {
  const mockCurrentUser = currentUser as jest.MockedFunction<
    typeof currentUser
  >;
  const mockPrismaUserFindFirst = prisma.user.findFirst as jest.MockedFunction<
    typeof prisma.user.findFirst
  >;
  const mockPrismaProjectCreate = prisma.project.create as jest.MockedFunction<
    typeof prisma.project.create
  >;
  const mockPrismaProjectFindUnique = prisma.project
    .findUnique as jest.MockedFunction<typeof prisma.project.findUnique>;
  const mockPrismaProjectUpdate = prisma.project.update as jest.MockedFunction<
    typeof prisma.project.update
  >;

  // Test data
  const mockClerkUser = { id: "clerk_user_123" };
  const mockBusinessOwner = {
    id: "user_123",
    clerkId: "clerk_user_123",
    role: "BUSINESS_OWNER",
    email: "business@example.com",
    firstName: "John",
    lastName: "Doe",
  };
  const mockStudent = {
    id: "student_123",
    clerkId: "clerk_student_123",
    role: "STUDENT",
    email: "student@example.com",
    firstName: "Jane",
    lastName: "Smith",
  };
  const mockProjectData: Prisma.ProjectCreateInput = {
    title: "Test Project",
    description: "Test project description",
    responsibilities: "• Task 1\n• Task 2",
    deliverables: "• Deliverable 1",
    requiredSkills: ["React", "TypeScript"],
    category: ProjectCategory.WEB_DEVELOPMENT,
    scope: ProjectScope.INTERMEDIATE,
    startDate: new Date("2024-01-01"),
    estimatedEndDate: new Date("2024-06-01"),
    applicationDeadline: new Date("2024-01-15"),
    budget: 5000,
    status: ProjectStatus.OPEN,
    businessOwner: { connect: { id: "user_123" } },
  };
  const mockProject = {
    id: "project_123",
    businessOwnerId: "user_123",
    assignedStudentId: null,
    ...mockProjectData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should create a project successfully when user is authenticated business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectCreate.mockResolvedValue(mockProject as any);

      const result = await createProject(mockProjectData);

      expect(result).toEqual(mockProject);
      expect(mockPrismaProjectCreate).toHaveBeenCalledWith({
        data: mockProjectData,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(createProject(mockProjectData)).rejects.toThrow(
        "Not authenticated."
      );
    });

    it("should throw error when user is not found in database", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(createProject(mockProjectData)).rejects.toThrow(
        "Failed to create new project."
      );
    });

    it("should throw error when user is not a business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockStudent as any);

      await expect(createProject(mockProjectData)).rejects.toThrow(
        "Failed to create new project."
      );
    });

    it("should throw error when database operation fails", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectCreate.mockRejectedValue(new Error("Database error"));

      await expect(createProject(mockProjectData)).rejects.toThrow(
        "Failed to create new project."
      );
    });
  });

  describe("editProject", () => {
    const projectId = "project_123";

    it("should update an open project successfully", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "OPEN",
      } as any);
      mockPrismaProjectUpdate.mockResolvedValue(mockProject as any);

      const result = await editProject(mockProjectData, projectId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: mockProjectData,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should update a draft project successfully", async () => {
      const draftProject = { ...mockProject, status: "DRAFT" };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(draftProject as any);
      mockPrismaProjectUpdate.mockResolvedValue(draftProject as any);

      const result = await editProject(mockProjectData, projectId);

      expect(result).toEqual(draftProject);
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "User not authenticated."
      );
    });

    it("should throw error when user is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });

    it("should throw error when user is not a business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockStudent as any);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });

    it("should throw error when project is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(null);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });

    it("should throw error when project status is IN_PROGRESS", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "IN_PROGRESS",
      } as any);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });

    it("should throw error when project status is COMPLETED", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "COMPLETED",
      } as any);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });

    it("should throw error when project status is ARCHIVED", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "ARCHIVED",
      } as any);

      await expect(editProject(mockProjectData, projectId)).rejects.toThrow(
        "Failed to updated project data."
      );
    });
  });

  describe("publishDraftProject", () => {
    const projectId = "project_123";

    it("should publish a draft project successfully", async () => {
      const draftProject = { ...mockProject, status: "DRAFT" };
      const publishedProject = {
        ...mockProject,
        status: "OPEN",
        isPublic: true,
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(draftProject as any);
      mockPrismaProjectUpdate.mockResolvedValue(publishedProject as any);

      const result = await publishDraftProject(projectId);

      expect(result).toEqual(publishedProject);
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: {
          status: "OPEN",
          isPublic: true,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(publishDraftProject(projectId)).rejects.toThrow(
        "Not authenticated."
      );
    });

    it("should throw error when user is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(publishDraftProject(projectId)).rejects.toThrow(
        "Failed to publish project."
      );
    });

    it("should throw error when user is not a business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockStudent as any);

      await expect(publishDraftProject(projectId)).rejects.toThrow(
        "Failed to publish project."
      );
    });

    it("should throw error when project is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(null);

      await expect(publishDraftProject(projectId)).rejects.toThrow(
        "Failed to publish project."
      );
    });

    it("should throw error when project is not a draft", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "OPEN",
      } as any);

      await expect(publishDraftProject(projectId)).rejects.toThrow(
        "Failed to publish project."
      );
    });
  });

  describe("deleteProject (archive)", () => {
    const projectId = "project_123";

    it("should archive an open project successfully", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "OPEN",
      } as any);
      mockPrismaProjectUpdate.mockResolvedValue(mockProject as any);

      const result = await deleteProject(projectId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: { status: "ARCHIVED" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should archive a draft project successfully", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "DRAFT",
      } as any);
      mockPrismaProjectUpdate.mockResolvedValue(mockProject as any);

      await expect(deleteProject(projectId)).resolves.toBeDefined();
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Not authenticated."
      );
    });

    it("should throw error when user is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Failed to delete project."
      );
    });

    it("should throw error when user is not a business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockStudent as any);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Failed to delete project."
      );
    });

    it("should throw error when project is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(null);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Failed to delete project."
      );
    });

    it("should throw error when project is already archived", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "ARCHIVED",
      } as any);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Failed to delete project."
      );
    });

    it("should throw error when project is completed", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "COMPLETED",
      } as any);

      await expect(deleteProject(projectId)).rejects.toThrow(
        "Failed to delete project."
      );
    });
  });

  describe("unarchiveProject", () => {
    const projectId = "project_123";

    it("should unarchive a project successfully", async () => {
      const archivedProject = { ...mockProject, status: "ARCHIVED" };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(archivedProject as any);
      mockPrismaProjectUpdate.mockResolvedValue(mockProject as any);

      const result = await unarchiveProject(projectId);

      expect(result).toEqual(archivedProject);
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: { status: "OPEN" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(unarchiveProject(projectId)).rejects.toThrow(
        "Not authenticated."
      );
    });

    it("should throw error when user is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(unarchiveProject(projectId)).rejects.toThrow(
        "Failed to unarchive project."
      );
    });

    it("should throw error when user is not a business owner", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockStudent as any);

      await expect(unarchiveProject(projectId)).rejects.toThrow(
        "Failed to unarchive project."
      );
    });

    it("should throw error when project is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(null);

      await expect(unarchiveProject(projectId)).rejects.toThrow(
        "Failed to unarchive project."
      );
    });

    it("should throw error when project is not archived", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue({
        ...mockProject,
        status: "OPEN",
      } as any);

      await expect(unarchiveProject(projectId)).rejects.toThrow(
        "Failed to unarchive project."
      );
    });
  });

  describe("updateProjectStatus", () => {
    const projectId = "project_123";

    it("should update status to IN_PROGRESS and set timestamp", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "OPEN",
        assignedStudentId: "student_123",
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithStudent,
        status: "IN_PROGRESS",
        inProgressAt: new Date(),
      } as any);

      const result = await updateProjectStatus(projectId, "IN_PROGRESS");

      expect(result.status).toBe("IN_PROGRESS");
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: expect.objectContaining({
          status: "IN_PROGRESS",
          inProgressAt: expect.any(Date),
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/project/${projectId}`);
    });

    it("should update status to IN_REVIEW and set timestamp", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "IN_PROGRESS",
        assignedStudentId: "student_123",
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithStudent,
        status: "IN_REVIEW",
        inReviewAt: new Date(),
      } as any);

      const result = await updateProjectStatus(projectId, "IN_REVIEW");

      expect(result.status).toBe("IN_REVIEW");
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: expect.objectContaining({
          status: "IN_REVIEW",
          inReviewAt: expect.any(Date),
        }),
      });
    });

    it("should update status to COMPLETED and update badges/stats", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "IN_REVIEW",
        assignedStudentId: "student_123",
        scope: ProjectScope.INTERMEDIATE,
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithStudent,
        status: "COMPLETED",
        completedAt: new Date(),
      } as any);

      const result = await updateProjectStatus(projectId, "COMPLETED");

      expect(result.status).toBe("COMPLETED");
      expect(mockPrismaProjectUpdate).toHaveBeenCalledWith({
        where: { id: projectId },
        data: expect.objectContaining({
          status: "COMPLETED",
          completedAt: expect.any(Date),
        }),
      });
      expect(getProjectScopeHours).toHaveBeenCalledWith(
        ProjectScope.INTERMEDIATE
      );
      expect(incrementUserStats).toHaveBeenCalledWith("student_123", {
        projectsCompleted: 1,
        hoursContributed: 40,
      });
      expect(updateUserBadges).toHaveBeenCalledWith("student_123");
    });

    it("should allow assigned student to update status", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "IN_PROGRESS",
        assignedStudentId: "student_123",
        businessOwnerId: "user_456", // Different from current user
      };
      const currentStudentUser = {
        id: "student_123",
        clerkId: "clerk_student_123",
        role: "STUDENT",
      };

      mockCurrentUser.mockResolvedValue({
        id: "clerk_student_123",
      } as any);
      mockPrismaUserFindFirst.mockResolvedValue(currentStudentUser as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithStudent,
        status: "IN_REVIEW",
      } as any);

      const result = await updateProjectStatus(projectId, "IN_REVIEW");

      expect(result.status).toBe("IN_REVIEW");
    });

    it("should throw error when user is not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(
        updateProjectStatus(projectId, "IN_PROGRESS")
      ).rejects.toThrow("Not authenticated.");
    });

    it("should throw error when user is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(null);

      await expect(
        updateProjectStatus(projectId, "IN_PROGRESS")
      ).rejects.toThrow("Failed to update project status.");
    });

    it("should throw error when project is not found", async () => {
      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(null);

      await expect(
        updateProjectStatus(projectId, "IN_PROGRESS")
      ).rejects.toThrow("Failed to update project status.");
    });

    it("should throw error when user is not owner or assigned student", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "IN_PROGRESS",
        assignedStudentId: "other_student",
        businessOwnerId: "other_owner",
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);

      await expect(updateProjectStatus(projectId, "IN_REVIEW")).rejects.toThrow(
        "Failed to update project status."
      );
    });

    it("should not fail if badge update fails", async () => {
      const projectWithStudent = {
        ...mockProject,
        status: "IN_REVIEW",
        assignedStudentId: "student_123",
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(projectWithStudent as any);
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithStudent,
        status: "COMPLETED",
      } as any);
      (incrementUserStats as jest.Mock).mockRejectedValue(
        new Error("Badge error")
      );

      // Should not throw even if badge update fails
      const result = await updateProjectStatus(projectId, "COMPLETED");
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("edge cases", () => {
    it("should handle project without assigned student for COMPLETED status", async () => {
      const projectWithoutStudent = {
        ...mockProject,
        status: "IN_REVIEW",
        assignedStudentId: null,
      };

      mockCurrentUser.mockResolvedValue(mockClerkUser as any);
      mockPrismaUserFindFirst.mockResolvedValue(mockBusinessOwner as any);
      mockPrismaProjectFindUnique.mockResolvedValue(
        projectWithoutStudent as any
      );
      mockPrismaProjectUpdate.mockResolvedValue({
        ...projectWithoutStudent,
        status: "COMPLETED",
      } as any);

      const result = await updateProjectStatus("project_123", "COMPLETED");

      expect(result.status).toBe("COMPLETED");
      // Badge functions should not be called when there's no assigned student
      expect(incrementUserStats).not.toHaveBeenCalled();
      expect(updateUserBadges).not.toHaveBeenCalled();
    });
  });
});
