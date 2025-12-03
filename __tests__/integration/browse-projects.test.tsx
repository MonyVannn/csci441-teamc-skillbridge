/**
 * Integration Tests for Browse Projects Feature
 *
 * These tests verify the server-side integration logic for browsing projects:
 * - Search functionality
 * - Category and scope filtering
 * - Budget filtering
 * - Pagination
 * - Combined filters
 * - Error handling
 */

// Mock Clerk FIRST before any imports
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

// Mock Prisma client
const mockFindMany = jest.fn();
const mockCount = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findMany: (...args: any[]) => mockFindMany(...args),
      count: (...args: any[]) => mockCount(...args),
    },
  },
}));

// Now import after mocks are set up
import { ProjectCategory, ProjectScope, ProjectStatus } from "@prisma/client";
import { getAvailableProjects } from "@/lib/actions/project";

// Sample project data
const createMockProject = (overrides = {}) => ({
  id: "proj-1",
  title: "E-commerce Website Development",
  description: "Build a modern e-commerce platform",
  responsibilities: "Frontend and backend development",
  deliverables: "Fully functional e-commerce site",
  requiredSkills: ["React", "Node.js", "MongoDB"],
  category: ProjectCategory.WEB_DEVELOPMENT,
  scope: ProjectScope.INTERMEDIATE,
  status: ProjectStatus.OPEN,
  startDate: new Date("2024-02-01"),
  estimatedEndDate: new Date("2024-03-15"),
  applicationDeadline: new Date("2024-01-25"),
  budget: 1500,
  isPublic: true,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  assignedAt: null,
  inProgressAt: null,
  inReviewAt: null,
  completedAt: null,
  cancelledAt: null,
  businessOwnerId: "owner-1",
  assignedStudentId: null,
  projectTimelineId: null,
  businessOwner: {
    id: "owner-1",
    clerkId: "clerk-owner-1",
    email: "john@example.com",
    role: "BUSINESS_OWNER" as const,
    imageUrl: "/avatars/owner1.jpg",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    bio: "Tech entrepreneur",
    intro: "Building the future",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  assignedStudent: null,
  applications: [],
  ...overrides,
});

describe("Browse Projects Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("should fetch all projects when no filters applied", async () => {
      const mockProjects = [
        createMockProject(),
        createMockProject({ id: "proj-2", title: "Mobile App" }),
        createMockProject({ id: "proj-3", title: "Data Dashboard" }),
      ];

      mockFindMany.mockResolvedValue(mockProjects);
      mockCount.mockResolvedValue(3);

      const result = await getAvailableProjects("", "", "", "", "", "");

      expect(result.availableProjects).toHaveLength(3);
      expect(result.totalProjects).toBe(3);
      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(mockCount).toHaveBeenCalledTimes(1);
    });

    it("should only show OPEN status projects", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      // The function filters by status: "OPEN" only
      expect(callArgs.where.status).toBe("OPEN");
    });

    it("should include business owner and assigned student relations", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.include.businessOwner).toBeDefined();
      expect(callArgs.include.assignedStudent).toBeDefined();
      expect(callArgs.include.applications).toBeDefined();
    });

    it("should order projects by createdAt descending", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.orderBy.createdAt).toBe("desc");
    });
  });

  describe("Search Functionality", () => {
    it("should filter by search query", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("e-commerce", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.title).toEqual({
        contains: "e-commerce",
        mode: "insensitive",
      });
    });

    it("should handle case-insensitive search", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("E-COMMERCE", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.title.mode).toBe("insensitive");
    });

    it("should return empty results for non-matching search", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await getAvailableProjects(
        "nonexistent",
        "",
        "",
        "",
        "",
        ""
      );

      expect(result.availableProjects).toHaveLength(0);
      expect(result.totalProjects).toBe(0);
    });
  });

  describe("Category Filtering", () => {
    it("should filter by single category", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "WEB_DEVELOPMENT", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.category).toEqual({ in: ["WEB_DEVELOPMENT"] });
    });

    it("should filter by multiple categories", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(2);

      await getAvailableProjects(
        "",
        "",
        "WEB_DEVELOPMENT,MOBILE_DEVELOPMENT",
        "",
        "",
        ""
      );

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.category.in).toContain("WEB_DEVELOPMENT");
      expect(callArgs.where.category.in).toContain("MOBILE_DEVELOPMENT");
    });
  });

  describe("Scope Filtering", () => {
    it("should filter by single scope", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "INTERMEDIATE", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.scope).toEqual({ in: ["INTERMEDIATE"] });
    });

    it("should filter by multiple scopes", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(2);

      await getAvailableProjects("", "", "", "BEGINNER,INTERMEDIATE", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.scope.in).toContain("BEGINNER");
      expect(callArgs.where.scope.in).toContain("INTERMEDIATE");
    });
  });

  describe("Budget Filtering", () => {
    it("should filter by minimum budget", async () => {
      mockFindMany.mockResolvedValue([createMockProject({ budget: 3000 })]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "2000", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.budget).toEqual({ gte: 2000 });
    });

    it("should filter by maximum budget", async () => {
      mockFindMany.mockResolvedValue([createMockProject({ budget: 800 })]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "", "1000");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.budget).toEqual({ lte: 1000 });
    });

    it("should filter by budget range", async () => {
      mockFindMany.mockResolvedValue([createMockProject({ budget: 1500 })]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "1000", "2000");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.budget).toEqual({ gte: 1000, lte: 2000 });
    });
  });

  describe("Pagination", () => {
    it("should paginate with page size of 6", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(20);

      await getAvailableProjects("", "1", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.take).toBe(6);
      expect(callArgs.skip).toBe(0);
    });

    it("should calculate correct skip for page 2", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(20);

      await getAvailableProjects("", "2", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.skip).toBe(6); // (2 - 1) * 6
    });

    it("should calculate correct skip for page 3", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(20);

      await getAvailableProjects("", "3", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.skip).toBe(12); // (3 - 1) * 6
    });

    it("should default to page 1 when page param is empty", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(3);

      await getAvailableProjects("", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.skip).toBe(0);
    });
  });

  describe("Combined Filters", () => {
    it("should apply all filters simultaneously", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects(
        "website",
        "1",
        "WEB_DEVELOPMENT",
        "INTERMEDIATE",
        "1000",
        "2000"
      );

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.title).toEqual({
        contains: "website",
        mode: "insensitive",
      });
      expect(callArgs.where.category).toEqual({ in: ["WEB_DEVELOPMENT"] });
      expect(callArgs.where.scope).toEqual({ in: ["INTERMEDIATE"] });
      expect(callArgs.where.budget).toEqual({ gte: 1000, lte: 2000 });
    });

    it("should combine search with category and scope", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects(
        "fitness",
        "",
        "MOBILE_DEVELOPMENT",
        "ADVANCED",
        "",
        ""
      );

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.title.contains).toBe("fitness");
      expect(callArgs.where.category.in).toContain("MOBILE_DEVELOPMENT");
      expect(callArgs.where.scope.in).toContain("ADVANCED");
    });

    it("should return empty when filters match nothing", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await getAvailableProjects(
        "impossible",
        "",
        "WEB_DEVELOPMENT",
        "BEGINNER",
        "10000",
        ""
      );

      expect(result.availableProjects).toHaveLength(0);
      expect(result.totalProjects).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockFindMany.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        getAvailableProjects("", "", "", "", "", "")
      ).rejects.toThrow();
    });

    it("should handle count errors", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockRejectedValue(new Error("Count query failed"));

      await expect(
        getAvailableProjects("", "", "", "", "", "")
      ).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in search", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await getAvailableProjects("C++ & C#", "", "", "", "", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.title.contains).toBe("C++ & C#");
    });

    it("should handle very high budget values", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await getAvailableProjects("", "", "", "", "999999", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.budget.gte).toBe(999999);
    });

    it("should handle zero budget", async () => {
      mockFindMany.mockResolvedValue([createMockProject()]);
      mockCount.mockResolvedValue(1);

      await getAvailableProjects("", "", "", "", "0", "");

      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.where.budget.gte).toBe(0);
    });
  });

  describe("Data Transformation", () => {
    it("should return projects with business owner information", async () => {
      const project = createMockProject();
      mockFindMany.mockResolvedValue([project]);
      mockCount.mockResolvedValue(1);

      const result = await getAvailableProjects("", "", "", "", "", "");

      expect(result.availableProjects[0].businessOwner).toBeDefined();
      expect(result.availableProjects[0].businessOwner.firstName).toBe("John");
    });

    it("should include required skills array", async () => {
      const project = createMockProject();
      mockFindMany.mockResolvedValue([project]);
      mockCount.mockResolvedValue(1);

      const result = await getAvailableProjects("", "", "", "", "", "");

      expect(result.availableProjects[0].requiredSkills).toEqual([
        "React",
        "Node.js",
        "MongoDB",
      ]);
    });

    it("should maintain date types correctly", async () => {
      const project = createMockProject();
      mockFindMany.mockResolvedValue([project]);
      mockCount.mockResolvedValue(1);

      const result = await getAvailableProjects("", "", "", "", "", "");

      expect(result.availableProjects[0].createdAt).toBeInstanceOf(Date);
      expect(result.availableProjects[0].startDate).toBeInstanceOf(Date);
    });
  });
});
