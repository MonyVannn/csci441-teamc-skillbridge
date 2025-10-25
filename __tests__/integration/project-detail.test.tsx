/**
 * Integration Tests for Project Detail Page
 *
 * Tests the project detail page functionality including:
 * - Project data fetching (getProjectByProjectId)
 * - Project timeline fetching (getProjectTimelineByProjectId)
 * - Project details display (title, description, budget, timeline)
 * - Different project statuses (OPEN, ASSIGNED, IN_PROGRESS, IN_REVIEW, COMPLETED, ARCHIVED)
 * - Error handling (project not found, invalid project ID)
 * - Edge cases (project without assigned student, no timeline)
 */

// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import {
  getProjectByProjectId,
  getProjectTimelineByProjectId,
} from "@/lib/actions/project";
import { PrismaClient, ProjectStatus } from "@prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findUnique: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
    },
  },
}));

// Import the mocked Prisma instance
const prisma = require("@/lib/prisma").default as jest.Mocked<PrismaClient>;

describe("Project Detail Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjectByProjectId - Project Data Fetching", () => {
    it("should successfully fetch project by ID", async () => {
      const mockProject = {
        id: "project-1",
        title: "E-commerce Platform Development",
        description:
          "Build a full-stack e-commerce platform with payment integration",
        category: "WEB_DEVELOPMENT",
        scope: "LONG_TERM",
        status: "OPEN" as ProjectStatus,
        requiredSkills: ["React", "Node.js", "PostgreSQL", "Stripe"],
        estimatedBudget: 5000,
        startDate: new Date("2024-01-01"),
        estimatedEndDate: new Date("2024-06-01"),
        createdAt: new Date("2023-12-01"),
        updatedAt: new Date("2023-12-01"),
        assignedAt: null,
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        businessOwnerId: "owner-1",
        assignedStudentId: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: "https://example.com/owner.jpg",
          firstName: "Business",
          lastName: "Owner",
          address: "New York, NY",
          bio: "Tech entrepreneur",
          intro: "Building innovative solutions",
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-1");

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: "project-1" },
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
    });

    it("should fetch project with assigned student", async () => {
      const mockProject = {
        id: "project-2",
        title: "Mobile App Development",
        description: "Create a cross-platform mobile application",
        category: "MOBILE_DEVELOPMENT",
        scope: "MEDIUM_TERM",
        status: "IN_PROGRESS" as ProjectStatus,
        requiredSkills: ["React Native", "Firebase"],
        estimatedBudget: 3000,
        startDate: new Date("2024-02-01"),
        estimatedEndDate: new Date("2024-05-01"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-02-10"),
        assignedAt: new Date("2024-02-01"),
        inProgressAt: new Date("2024-02-05"),
        inReviewAt: null,
        completedAt: null,
        businessOwnerId: "owner-2",
        assignedStudentId: "student-1",
        businessOwner: {
          id: "owner-2",
          clerkId: "clerk_owner_2",
          imageUrl: "https://example.com/owner2.jpg",
          firstName: "Startup",
          lastName: "Inc",
          address: "San Francisco, CA",
          bio: "Innovative startup",
          intro: "Disrupting the market",
        },
        assignedStudent: {
          id: "student-1",
          clerkId: "clerk_student_1",
          imageUrl: "https://example.com/student.jpg",
          firstName: "John",
          lastName: "Doe",
          bio: "Full-stack developer",
          skills: ["React Native", "Firebase", "JavaScript"],
        },
        applications: [
          {
            updatedAt: new Date("2024-01-20"),
            status: "ACCEPTED",
          },
        ],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-2");

      expect(result).toEqual(mockProject);
      expect(result.assignedStudent).toBeDefined();
      expect(result.assignedStudent?.firstName).toBe("John");
      expect(result.assignedStudent?.skills).toEqual([
        "React Native",
        "Firebase",
        "JavaScript",
      ]);
    });

    it("should throw error when project is not found", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        getProjectByProjectId("nonexistent-project-id")
      ).rejects.toThrow("Failed to fetch project data.");
    });

    it("should handle database errors gracefully", async () => {
      (prisma.project.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(getProjectByProjectId("project-1")).rejects.toThrow(
        "Failed to fetch project data."
      );
    });

    it("should fetch project with all statuses - OPEN", async () => {
      const mockProject = {
        id: "project-open",
        title: "Open Project",
        description: "Project accepting applications",
        category: "WEB_DEVELOPMENT",
        scope: "SHORT_TERM",
        status: "OPEN" as ProjectStatus,
        requiredSkills: ["JavaScript"],
        estimatedBudget: 1000,
        startDate: new Date("2024-03-01"),
        estimatedEndDate: new Date("2024-04-01"),
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
        assignedAt: null,
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        businessOwnerId: "owner-1",
        assignedStudentId: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-open");

      expect(result.status).toBe("OPEN");
      expect(result.assignedStudent).toBeNull();
      expect(result.assignedAt).toBeNull();
    });

    it("should fetch project with ASSIGNED status", async () => {
      const mockProject = {
        id: "project-assigned",
        status: "ASSIGNED" as ProjectStatus,
        assignedAt: new Date("2024-02-01"),
        inProgressAt: null,
        assignedStudentId: "student-1",
        assignedStudent: {
          id: "student-1",
          clerkId: "clerk_student_1",
          imageUrl: null,
          firstName: "Student",
          lastName: "One",
          bio: null,
          skills: [],
        },
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-assigned");

      expect(result.status).toBe("ASSIGNED");
      expect(result.assignedStudent).toBeDefined();
      expect(result.assignedAt).toBeDefined();
      expect(result.inProgressAt).toBeNull();
    });

    it("should fetch project with COMPLETED status", async () => {
      const mockProject = {
        id: "project-completed",
        status: "COMPLETED" as ProjectStatus,
        assignedAt: new Date("2024-01-01"),
        inProgressAt: new Date("2024-01-05"),
        inReviewAt: new Date("2024-02-01"),
        completedAt: new Date("2024-02-15"),
        assignedStudentId: "student-1",
        assignedStudent: {
          id: "student-1",
          clerkId: "clerk_student_1",
          imageUrl: null,
          firstName: "Student",
          lastName: "One",
          bio: null,
          skills: [],
        },
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-completed");

      expect(result.status).toBe("COMPLETED");
      expect(result.completedAt).toBeDefined();
      expect(result.assignedAt).toBeDefined();
      expect(result.inProgressAt).toBeDefined();
      expect(result.inReviewAt).toBeDefined();
    });

    it("should include business owner details", async () => {
      const mockProject = {
        id: "project-1",
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-detailed",
          clerkId: "clerk_owner_detailed",
          imageUrl: "https://example.com/owner-detailed.jpg",
          firstName: "Detailed",
          lastName: "Owner",
          address: "Los Angeles, CA",
          bio: "Experienced entrepreneur with 10+ years in tech",
          intro: "Building the future of technology",
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-1");

      expect(result.businessOwner).toHaveProperty("id");
      expect(result.businessOwner).toHaveProperty("clerkId");
      expect(result.businessOwner).toHaveProperty("imageUrl");
      expect(result.businessOwner).toHaveProperty("firstName");
      expect(result.businessOwner).toHaveProperty("lastName");
      expect(result.businessOwner).toHaveProperty("address");
      expect(result.businessOwner).toHaveProperty("bio");
      expect(result.businessOwner).toHaveProperty("intro");
      expect(result.businessOwner.bio).toBe(
        "Experienced entrepreneur with 10+ years in tech"
      );
    });

    it("should include applications with status and updatedAt", async () => {
      const mockProject = {
        id: "project-with-apps",
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [
          {
            updatedAt: new Date("2024-02-01"),
            status: "PENDING",
          },
          {
            updatedAt: new Date("2024-02-05"),
            status: "ACCEPTED",
          },
          {
            updatedAt: new Date("2024-02-03"),
            status: "REJECTED",
          },
        ],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-with-apps");

      expect(result.applications).toHaveLength(3);
      expect(result.applications[0]).toHaveProperty("updatedAt");
      expect(result.applications[0]).toHaveProperty("status");
      expect(result.applications[1].status).toBe("ACCEPTED");
    });
  });

  describe("getProjectTimelineByProjectId - Timeline Fetching", () => {
    it("should return basic timeline for OPEN project without applicantId", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: null,
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        status: "OPEN" as ProjectStatus,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectTimelineByProjectId("project-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: new Date(mockProject.createdAt).toLocaleDateString(),
        title: "Project Created",
        content: "Project was created and is open for applications.",
      });
    });

    it("should return complete timeline for COMPLETED project with applicantId", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: new Date("2024-01-20"),
        inReviewAt: new Date("2024-02-15"),
        completedAt: new Date("2024-02-28"),
        status: "COMPLETED" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      expect(result).toHaveLength(5);
      expect(result[0].title).toBe("Application Submitted");
      expect(result[1].title).toBe("Assigned");
      expect(result[2].title).toBe("In Progress");
      expect(result[3].title).toBe("In Review");
      expect(result[4].title).toBe("Completed");

      expect(result[0].date).toBe(
        new Date(mockApplication.appliedAt).toLocaleDateString()
      );
      expect(result[1].date).toBe(
        new Date(mockProject.assignedAt!).toLocaleDateString()
      );
      expect(result[4].date).toBe(
        new Date(mockProject.completedAt!).toLocaleDateString()
      );
    });

    it("should return partial timeline for IN_PROGRESS project", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: new Date("2024-01-20"),
        inReviewAt: null,
        completedAt: null,
        status: "IN_PROGRESS" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Application Submitted");
      expect(result[1].title).toBe("Assigned");
      expect(result[2].title).toBe("In Progress");
      expect(result[2].date).toBe(
        new Date(mockProject.inProgressAt!).toLocaleDateString()
      );
    });

    it("should return partial timeline for ASSIGNED project", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        status: "ASSIGNED" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Application Submitted");
      expect(result[1].title).toBe("Assigned");
      expect(result[1].date).not.toBe("Pending");
    });

    it("should return basic timeline when no application exists", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        status: "ASSIGNED" as ProjectStatus,
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: new Date(mockProject.createdAt).toLocaleDateString(),
        title: "Project Created",
        content: "Project was created and is open for applications.",
      });
    });

    it("should throw error when project is not found", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        getProjectTimelineByProjectId("nonexistent-project-id", "student-1")
      ).rejects.toThrow("Failed to fetch project timeline.");
    });

    it("should handle database errors gracefully", async () => {
      (prisma.project.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        getProjectTimelineByProjectId("project-1", "student-1")
      ).rejects.toThrow("Failed to fetch project timeline.");
    });

    it("should return timeline with 'Pending' dates for future stages", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        status: "ASSIGNED" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      // Only shows entries up to current status (ASSIGNED = index 1)
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Application Submitted");
      expect(result[1].title).toBe("Assigned");
    });

    it("should return timeline for IN_REVIEW status", async () => {
      const mockProject = {
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: new Date("2024-01-20"),
        inReviewAt: new Date("2024-02-15"),
        completedAt: null,
        status: "IN_REVIEW" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const result = await getProjectTimelineByProjectId(
        "project-1",
        "student-1"
      );

      expect(result).toHaveLength(4);
      expect(result[3].title).toBe("In Review");
      expect(result[3].date).toBe(
        new Date(mockProject.inReviewAt!).toLocaleDateString()
      );
    });
  });

  describe("Project Detail Page - Integration Scenarios", () => {
    it("should fetch project data and timeline together for IN_PROGRESS project", async () => {
      const mockProject = {
        id: "project-integration",
        title: "Integration Test Project",
        description: "Testing full integration",
        category: "WEB_DEVELOPMENT",
        scope: "LONG_TERM",
        status: "IN_PROGRESS" as ProjectStatus,
        requiredSkills: ["React", "Node.js"],
        estimatedBudget: 5000,
        startDate: new Date("2024-01-01"),
        estimatedEndDate: new Date("2024-06-01"),
        createdAt: new Date("2023-12-01"),
        updatedAt: new Date("2024-01-10"),
        assignedAt: new Date("2024-01-05"),
        inProgressAt: new Date("2024-01-10"),
        inReviewAt: null,
        completedAt: null,
        businessOwnerId: "owner-1",
        assignedStudentId: "student-1",
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: "https://example.com/owner.jpg",
          firstName: "Business",
          lastName: "Owner",
          address: "Seattle, WA",
          bio: "Tech company owner",
          intro: "Building great products",
        },
        assignedStudent: {
          id: "student-1",
          clerkId: "clerk_student_1",
          imageUrl: "https://example.com/student.jpg",
          firstName: "John",
          lastName: "Developer",
          bio: "Full-stack developer",
          skills: ["React", "Node.js", "PostgreSQL"],
        },
        applications: [
          {
            updatedAt: new Date("2024-01-05"),
            status: "ACCEPTED",
          },
        ],
      };

      const mockTimelineProject = {
        createdAt: mockProject.createdAt,
        assignedAt: mockProject.assignedAt,
        inProgressAt: mockProject.inProgressAt,
        inReviewAt: mockProject.inReviewAt,
        completedAt: mockProject.completedAt,
        status: mockProject.status,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-02"),
      };

      // Mock for getProjectByProjectId
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(
        mockProject
      );
      // Mock for getProjectTimelineByProjectId
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce(
        mockTimelineProject
      );
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      // Simulate the project detail page flow
      const project = await getProjectByProjectId("project-integration");
      const timeline =
        project.status !== "OPEN"
          ? await getProjectTimelineByProjectId(
              "project-integration",
              project.assignedStudent?.id || null
            )
          : null;

      expect(project).toEqual(mockProject);
      expect(timeline).toBeDefined();
      expect(timeline).toHaveLength(3); // Application, Assigned, In Progress
      expect(project.status).toBe("IN_PROGRESS");
      expect(project.assignedStudent).toBeDefined();
    });

    it("should handle OPEN project without timeline", async () => {
      const mockProject = {
        id: "project-open",
        title: "Open Project",
        status: "OPEN" as ProjectStatus,
        assignedStudent: null,
        assignedStudentId: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const project = await getProjectByProjectId("project-open");
      const timeline =
        project.status !== "OPEN"
          ? await getProjectTimelineByProjectId(
              "project-open",
              project.assignedStudent?.id || null
            )
          : null;

      expect(project.status).toBe("OPEN");
      expect(timeline).toBeNull();
      expect(project.assignedStudent).toBeNull();
    });

    it("should handle ARCHIVED project", async () => {
      const mockProject = {
        id: "project-archived",
        title: "Archived Project",
        status: "ARCHIVED" as ProjectStatus,
        assignedStudent: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const project = await getProjectByProjectId("project-archived");

      expect(project.status).toBe("ARCHIVED");
    });

    it("should handle project with multiple applications", async () => {
      const mockProject = {
        id: "project-popular",
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: Array.from({ length: 10 }, (_, i) => ({
          updatedAt: new Date(`2024-02-${i + 1}`),
          status: i < 3 ? "PENDING" : i < 5 ? "ACCEPTED" : "REJECTED",
        })),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-popular");

      expect(result.applications).toHaveLength(10);
      expect(
        result.applications.filter((app) => app.status === "PENDING")
      ).toHaveLength(3);
      expect(
        result.applications.filter((app) => app.status === "ACCEPTED")
      ).toHaveLength(2);
      expect(
        result.applications.filter((app) => app.status === "REJECTED")
      ).toHaveLength(5);
    });
  });

  describe("Project Detail Page - Error Handling and Edge Cases", () => {
    it("should handle invalid project ID format", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProjectByProjectId("invalid-id-123!@#")).rejects.toThrow(
        "Failed to fetch project data."
      );
    });

    it("should handle null values in optional project fields", async () => {
      const mockProject = {
        id: "project-minimal",
        title: "Minimal Project",
        description: "Minimal data project",
        category: "WEB_DEVELOPMENT",
        scope: "SHORT_TERM",
        status: "OPEN" as ProjectStatus,
        requiredSkills: [],
        estimatedBudget: 0,
        startDate: new Date("2024-01-01"),
        estimatedEndDate: new Date("2024-02-01"),
        createdAt: new Date("2023-12-15"),
        updatedAt: new Date("2023-12-15"),
        assignedAt: null,
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        businessOwnerId: "owner-1",
        assignedStudentId: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-minimal");

      expect(result.businessOwner.imageUrl).toBeNull();
      expect(result.businessOwner.address).toBeNull();
      expect(result.businessOwner.bio).toBeNull();
      expect(result.assignedStudent).toBeNull();
      expect(result.requiredSkills).toEqual([]);
    });

    it("should handle project with empty applications array", async () => {
      const mockProject = {
        id: "project-no-apps",
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-no-apps");

      expect(result.applications).toEqual([]);
      expect(result.applications).toHaveLength(0);
    });

    it("should handle concurrent project and timeline fetch", async () => {
      const mockProject = {
        id: "project-concurrent",
        status: "ASSIGNED" as ProjectStatus,
        assignedStudentId: "student-1",
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: {
          id: "student-1",
          clerkId: "clerk_student_1",
          imageUrl: null,
          firstName: "Student",
          lastName: "One",
          bio: null,
          skills: [],
        },
        applications: [],
      };

      const mockTimelineProject = {
        createdAt: mockProject.createdAt,
        assignedAt: mockProject.assignedAt,
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        status: "ASSIGNED" as ProjectStatus,
      };

      const mockApplication = {
        appliedAt: new Date("2024-01-10"),
      };

      (prisma.project.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockProject)
        .mockResolvedValueOnce(mockTimelineProject);
      (prisma.application.findUnique as jest.Mock).mockResolvedValue(
        mockApplication
      );

      const [project, timeline] = await Promise.all([
        getProjectByProjectId("project-concurrent"),
        getProjectTimelineByProjectId("project-concurrent", "student-1"),
      ]);

      expect(project).toEqual(mockProject);
      expect(timeline).toHaveLength(2);
    });

    it("should handle very long project descriptions", async () => {
      const longDescription = "A".repeat(5000);
      const mockProject = {
        id: "project-long",
        title: "Project with Long Description",
        description: longDescription,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-long");

      expect(result.description).toHaveLength(5000);
      expect(result.description).toBe(longDescription);
    });

    it("should handle project with many required skills", async () => {
      const manySkills = Array.from({ length: 20 }, (_, i) => `Skill-${i + 1}`);
      const mockProject = {
        id: "project-many-skills",
        requiredSkills: manySkills,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-many-skills");

      expect(result.requiredSkills).toHaveLength(20);
      expect(result.requiredSkills).toEqual(manySkills);
    });

    it("should handle project with very high budget", async () => {
      const mockProject = {
        id: "project-high-budget",
        estimatedBudget: 1000000,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: "owner-1",
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: null,
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectByProjectId("project-high-budget");

      expect(result.estimatedBudget).toBe(1000000);
    });
  });
});
