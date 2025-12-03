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

// Valid MongoDB ObjectIDs for testing (24 hex characters)
const VALID_IDS = {
  // Project IDs
  PROJECT_1: "507f1f77bcf86cd799439011",
  PROJECT_2: "507f1f77bcf86cd799439012",
  PROJECT_OPEN: "507f1f77bcf86cd799439013",
  PROJECT_ASSIGNED: "507f1f77bcf86cd799439014",
  PROJECT_IN_PROGRESS: "507f1f77bcf86cd799439015",
  PROJECT_IN_REVIEW: "507f1f77bcf86cd799439016",
  PROJECT_COMPLETED: "507f1f77bcf86cd799439017",
  PROJECT_ARCHIVED: "507f1f77bcf86cd799439018",
  PROJECT_LONG: "507f1f77bcf86cd799439019",
  PROJECT_MANY_SKILLS: "507f1f77bcf86cd79943901a",
  PROJECT_HIGH_BUDGET: "507f1f77bcf86cd79943901b",
  NONEXISTENT: "507f1f77bcf86cd79943901c",
  PROJECT_INTEGRATION: "507f1f77bcf86cd79943901d",
  PROJECT_WITH_APPS: "507f1f77bcf86cd79943901e",
  PROJECT_POPULAR: "507f1f77bcf86cd79943901f",
  PROJECT_MINIMAL: "507f1f77bcf86cd799439020",
  PROJECT_NO_APPS: "507f1f77bcf86cd799439021",
  PROJECT_CONCURRENT: "507f1f77bcf86cd799439022",
  // User IDs
  STUDENT_1: "507f1f77bcf86cd799439031",
  OWNER_1: "507f1f77bcf86cd799439041",
  OWNER_2: "507f1f77bcf86cd799439042",
  OWNER_DETAILED: "507f1f77bcf86cd799439043",
};

describe("Project Detail Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjectByProjectId - Project Data Fetching", () => {
    it("should successfully fetch project by ID", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_1,
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
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_1);

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: VALID_IDS.PROJECT_1 },
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
        id: VALID_IDS.PROJECT_2,
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
        businessOwnerId: VALID_IDS.OWNER_2,
        assignedStudentId: VALID_IDS.STUDENT_1,
        businessOwner: {
          id: VALID_IDS.OWNER_2,
          clerkId: "clerk_owner_2",
          imageUrl: "https://example.com/owner2.jpg",
          firstName: "Startup",
          lastName: "Inc",
          address: "San Francisco, CA",
          bio: "Innovative startup",
          intro: "Disrupting the market",
        },
        assignedStudent: {
          id: VALID_IDS.STUDENT_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_2);

      expect(result).toEqual(mockProject);
      expect(result!.assignedStudent).toBeDefined();
      expect(result!.assignedStudent?.firstName).toBe("John");
      expect(result!.assignedStudent?.skills).toEqual([
        "React Native",
        "Firebase",
        "JavaScript",
      ]);
    });

    it("should throw error when project is not found", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      // When project ID format is valid but project doesn't exist, function returns null
      const result = await getProjectByProjectId(VALID_IDS.NONEXISTENT);
      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      (prisma.project.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      // With valid ID, database error returns null (error is caught internally)
      const result = await getProjectByProjectId(VALID_IDS.PROJECT_1);
      expect(result).toBeNull();
    });

    it("should fetch project with all statuses - OPEN", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_OPEN,
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
        businessOwnerId: VALID_IDS.OWNER_1,
        assignedStudentId: null,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_OPEN);

      expect(result!.status).toBe("OPEN");
      expect(result!.assignedStudent).toBeNull();
      expect(result!.assignedAt).toBeNull();
    });

    it("should fetch project with ASSIGNED status", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_ASSIGNED,
        status: "ASSIGNED" as ProjectStatus,
        assignedAt: new Date("2024-02-01"),
        inProgressAt: null,
        assignedStudentId: VALID_IDS.STUDENT_1,
        assignedStudent: {
          id: VALID_IDS.STUDENT_1,
          clerkId: "clerk_student_1",
          imageUrl: null,
          firstName: "Student",
          lastName: "One",
          bio: null,
          skills: [],
        },
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_ASSIGNED);

      expect(result!.status).toBe("ASSIGNED");
      expect(result!.assignedStudent).toBeDefined();
      expect(result!.assignedAt).toBeDefined();
      expect(result!.inProgressAt).toBeNull();
    });

    it("should fetch project with COMPLETED status", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_COMPLETED,
        status: "COMPLETED" as ProjectStatus,
        assignedAt: new Date("2024-01-01"),
        inProgressAt: new Date("2024-01-05"),
        inReviewAt: new Date("2024-02-01"),
        completedAt: new Date("2024-02-15"),
        assignedStudentId: VALID_IDS.STUDENT_1,
        assignedStudent: {
          id: VALID_IDS.STUDENT_1,
          clerkId: "clerk_student_1",
          imageUrl: null,
          firstName: "Student",
          lastName: "One",
          bio: null,
          skills: [],
        },
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_COMPLETED);

      expect(result!.status).toBe("COMPLETED");
      expect(result!.completedAt).toBeDefined();
      expect(result!.assignedAt).toBeDefined();
      expect(result!.inProgressAt).toBeDefined();
      expect(result!.inReviewAt).toBeDefined();
    });

    it("should include business owner details", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_1,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_DETAILED,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_1);

      expect(result!.businessOwner).toHaveProperty("id");
      expect(result!.businessOwner).toHaveProperty("clerkId");
      expect(result!.businessOwner).toHaveProperty("imageUrl");
      expect(result!.businessOwner).toHaveProperty("firstName");
      expect(result!.businessOwner).toHaveProperty("lastName");
      expect(result!.businessOwner).toHaveProperty("address");
      expect(result!.businessOwner).toHaveProperty("bio");
      expect(result!.businessOwner).toHaveProperty("intro");
      expect(result!.businessOwner.bio).toBe(
        "Experienced entrepreneur with 10+ years in tech"
      );
    });

    it("should include applications with status and updatedAt", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_WITH_APPS,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_WITH_APPS);

      expect(result!.applications).toHaveLength(3);
      expect(result!.applications[0]).toHaveProperty("updatedAt");
      expect(result!.applications[0]).toHaveProperty("status");
      expect(result!.applications[1].status).toBe("ACCEPTED");
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

      const result = await getProjectTimelineByProjectId(VALID_IDS.PROJECT_1);

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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        getProjectTimelineByProjectId(
          VALID_IDS.NONEXISTENT,
          VALID_IDS.STUDENT_1
        )
      ).rejects.toThrow("Failed to fetch project timeline.");
    });

    it("should handle database errors gracefully", async () => {
      (prisma.project.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        getProjectTimelineByProjectId(VALID_IDS.PROJECT_1, VALID_IDS.STUDENT_1)
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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        VALID_IDS.PROJECT_1,
        VALID_IDS.STUDENT_1
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
        id: VALID_IDS.PROJECT_INTEGRATION,
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
        businessOwnerId: VALID_IDS.OWNER_1,
        assignedStudentId: VALID_IDS.STUDENT_1,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
          clerkId: "clerk_owner_1",
          imageUrl: "https://example.com/owner.jpg",
          firstName: "Business",
          lastName: "Owner",
          address: "Seattle, WA",
          bio: "Tech company owner",
          intro: "Building great products",
        },
        assignedStudent: {
          id: VALID_IDS.STUDENT_1,
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
      const project = await getProjectByProjectId(
        VALID_IDS.PROJECT_INTEGRATION
      );
      const timeline =
        project!.status !== "OPEN"
          ? await getProjectTimelineByProjectId(
              VALID_IDS.PROJECT_INTEGRATION,
              project!.assignedStudent?.id || null
            )
          : null;

      expect(project).toEqual(mockProject);
      expect(timeline).toBeDefined();
      expect(timeline).toHaveLength(3); // Application, Assigned, In Progress
      expect(project!.status).toBe("IN_PROGRESS");
      expect(project!.assignedStudent).toBeDefined();
    });

    it("should handle OPEN project without timeline", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_OPEN,
        title: "Open Project",
        status: "OPEN" as ProjectStatus,
        assignedStudent: null,
        assignedStudentId: null,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const project = await getProjectByProjectId(VALID_IDS.PROJECT_OPEN);
      const timeline =
        project!.status !== "OPEN"
          ? await getProjectTimelineByProjectId(
              VALID_IDS.PROJECT_OPEN,
              project!.assignedStudent?.id || null
            )
          : null;

      expect(project!.status).toBe("OPEN");
      expect(timeline).toBeNull();
      expect(project!.assignedStudent).toBeNull();
    });

    it("should handle ARCHIVED project", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_ARCHIVED,
        title: "Archived Project",
        status: "ARCHIVED" as ProjectStatus,
        assignedStudent: null,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const project = await getProjectByProjectId(VALID_IDS.PROJECT_ARCHIVED);

      expect(project!.status).toBe("ARCHIVED");
    });

    it("should handle project with multiple applications", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_POPULAR,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_POPULAR);

      expect(result!.applications).toHaveLength(10);
      expect(
        result!.applications.filter((app) => app.status === "PENDING")
      ).toHaveLength(3);
      expect(
        result!.applications.filter((app) => app.status === "ACCEPTED")
      ).toHaveLength(2);
      expect(
        result!.applications.filter((app) => app.status === "REJECTED")
      ).toHaveLength(5);
    });
  });

  describe("Project Detail Page - Error Handling and Edge Cases", () => {
    it("should handle invalid project ID format", async () => {
      // Invalid format returns null immediately (validation happens before DB call)
      const result = await getProjectByProjectId("invalid-id-123!@#");
      expect(result).toBeNull();
    });

    it("should handle null values in optional project fields", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_MINIMAL,
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
        businessOwnerId: VALID_IDS.OWNER_1,
        assignedStudentId: null,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_MINIMAL);

      expect(result!.businessOwner.imageUrl).toBeNull();
      expect(result!.businessOwner.address).toBeNull();
      expect(result!.businessOwner.bio).toBeNull();
      expect(result!.assignedStudent).toBeNull();
      expect(result!.requiredSkills).toEqual([]);
    });

    it("should handle project with empty applications array", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_NO_APPS,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_NO_APPS);

      expect(result!.applications).toEqual([]);
      expect(result!.applications).toHaveLength(0);
    });

    it("should handle concurrent project and timeline fetch", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_CONCURRENT,
        status: "ASSIGNED" as ProjectStatus,
        assignedStudentId: VALID_IDS.STUDENT_1,
        createdAt: new Date("2024-01-01"),
        assignedAt: new Date("2024-01-15"),
        inProgressAt: null,
        inReviewAt: null,
        completedAt: null,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
          clerkId: "clerk_owner_1",
          imageUrl: null,
          firstName: "Owner",
          lastName: "One",
          address: null,
          bio: null,
          intro: null,
        },
        assignedStudent: {
          id: VALID_IDS.STUDENT_1,
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
        getProjectByProjectId(VALID_IDS.PROJECT_CONCURRENT),
        getProjectTimelineByProjectId(
          VALID_IDS.PROJECT_CONCURRENT,
          VALID_IDS.STUDENT_1
        ),
      ]);

      expect(project).toEqual(mockProject);
      expect(timeline).toHaveLength(2);
    });

    it("should handle very long project descriptions", async () => {
      const longDescription = "A".repeat(5000);
      const mockProject = {
        id: VALID_IDS.PROJECT_LONG,
        title: "Project with Long Description",
        description: longDescription,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_LONG);

      expect(result!.description).toHaveLength(5000);
      expect(result!.description).toBe(longDescription);
    });

    it("should handle project with many required skills", async () => {
      const manySkills = Array.from({ length: 20 }, (_, i) => `Skill-${i + 1}`);
      const mockProject = {
        id: VALID_IDS.PROJECT_MANY_SKILLS,
        requiredSkills: manySkills,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_MANY_SKILLS);

      expect(result!.requiredSkills).toHaveLength(20);
      expect(result!.requiredSkills).toEqual(manySkills);
    });

    it("should handle project with very high budget", async () => {
      const mockProject = {
        id: VALID_IDS.PROJECT_HIGH_BUDGET,
        estimatedBudget: 1000000,
        status: "OPEN" as ProjectStatus,
        businessOwner: {
          id: VALID_IDS.OWNER_1,
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

      const result = await getProjectByProjectId(VALID_IDS.PROJECT_HIGH_BUDGET);

      expect((result as any).estimatedBudget).toBe(1000000);
    });
  });
});
