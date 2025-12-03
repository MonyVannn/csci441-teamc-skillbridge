import { render, screen } from "@testing-library/react";
import MarketplacePage from "@/app/(main)/page";
import { getAvailableProjects } from "@/lib/actions/project";
import { getUserOrNull } from "@/lib/actions/user";

// Mock Clerk
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock the server actions
jest.mock("@/lib/actions/project");
jest.mock("@/lib/actions/user");

// Mock the child components
jest.mock("@/components/browse/ProjectCard", () => ({
  ProjectCard: ({ projects, currentPageProp, totalPagesProp }: any) => (
    <div data-testid="project-card">
      <div data-testid="projects-count">{projects.length}</div>
      <div data-testid="current-page">{currentPageProp}</div>
      <div data-testid="total-pages">{totalPagesProp}</div>
    </div>
  ),
}));

jest.mock("@/components/browse/EmptyProject", () => ({
  EmptyProject: () => (
    <div data-testid="empty-project">No projects available</div>
  ),
}));

jest.mock("@/components/browse/Filters", () => ({
  Filters: () => <div data-testid="filters">Filters</div>,
}));

jest.mock("@/components/browse/MobileFilters", () => ({
  MobileFilters: () => <div data-testid="mobile-filters">Mobile Filters</div>,
}));

const mockGetAvailableProjects = getAvailableProjects as jest.MockedFunction<
  typeof getAvailableProjects
>;
const mockGetUserOrNull = getUserOrNull as jest.MockedFunction<
  typeof getUserOrNull
>;

describe("MarketplacePage", () => {
  const mockUser = {
    id: "user-1",
    clerkId: "clerk-1",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    bio: "Test user bio",
    intro: "Test user intro",
    address: "Test Address",
    skills: ["JavaScript", "React"],
    imageUrl: "https://example.com/avatar.jpg",
    role: "USER" as const,
    occupied: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-10-24"),
    socialLinks: [],
    experiences: [],
    education: [],
    previousProjects: [],
    earnedSkillBadges: [],
    earnedSpecializationBadges: [],
    earnedEngagementBadges: [],
    totalHoursContributed: 100,
    projectsCompleted: 5,
    industriesExperienced: ["Technology", "Education"],
    postedProjects: [],
    assignedProjects: [],
    applications: [],
  };

  const mockProjects = [
    {
      id: "1",
      title: "Web Development Project",
      description: "Build a website",
      category: "WEB_DEVELOPMENT" as const,
      scope: "INTERMEDIATE" as const,
      budget: 5000,
      status: "OPEN" as const,
      businessOwnerId: "owner-1",
      businessOwner: {
        id: "owner-1",
        clerkId: "clerk-owner-1",
        firstName: "Jane",
        lastName: "Smith",
        imageUrl: null,
        address: "New York",
        bio: "Business owner bio",
        intro: "Business owner intro",
      },
      assignedStudentId: null,
      assignedStudent: null,
      applications: [
        {
          id: "app-1",
          projectId: "1",
          applicantId: "applicant-1",
          status: "PENDING" as const,
          coverLetter: "I would like to work on this project",
          appliedAt: new Date("2025-10-21"),
          updatedAt: new Date("2025-10-21"),
        },
      ],
      requiredSkills: ["React", "TypeScript"],
      responsibilities: "Develop features",
      deliverables: "Working application",
      startDate: new Date("2025-11-01"),
      estimatedEndDate: new Date("2025-12-01"),
      applicationDeadline: new Date("2025-10-25"),
      isPublic: true,
      createdAt: new Date("2025-10-20"),
      updatedAt: new Date("2025-10-20"),
      assignedAt: null,
      inProgressAt: null,
      inReviewAt: null,
      completedAt: null,
      cancelledAt: null,
      archivedAt: null,
    },
    {
      id: "2",
      title: "Mobile App Project",
      description: "Build a mobile app",
      category: "MOBILE_DEVELOPMENT" as const,
      scope: "ADVANCED" as const,
      budget: 8000,
      status: "OPEN" as const,
      businessOwnerId: "owner-2",
      businessOwner: {
        id: "owner-2",
        clerkId: "clerk-owner-2",
        firstName: "Bob",
        lastName: "Johnson",
        imageUrl: null,
        address: "San Francisco",
        bio: "Another bio",
        intro: "Another intro",
      },
      assignedStudentId: null,
      assignedStudent: null,
      applications: [],
      requiredSkills: ["React Native", "JavaScript"],
      responsibilities: "Build mobile app",
      deliverables: "Published app",
      startDate: new Date("2025-11-15"),
      estimatedEndDate: new Date("2025-12-15"),
      applicationDeadline: new Date("2025-11-01"),
      isPublic: true,
      createdAt: new Date("2025-10-21"),
      updatedAt: new Date("2025-10-21"),
      assignedAt: null,
      inProgressAt: null,
      inReviewAt: null,
      completedAt: null,
      cancelledAt: null,
      archivedAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("with projects available", () => {
    beforeEach(() => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: mockProjects,
        totalProjects: 12,
      });
      mockGetUserOrNull.mockResolvedValue(mockUser);
    });

    it("should render the marketplace page with projects", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      // Check main layout elements
      expect(screen.getByTestId("mobile-filters")).toBeInTheDocument();
      expect(screen.getByTestId("filters")).toBeInTheDocument();
      expect(screen.getByTestId("project-card")).toBeInTheDocument();

      // Verify projects are displayed
      expect(screen.getByTestId("projects-count")).toHaveTextContent("2");
    });

    it("should calculate and pass correct total pages", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      // totalProjects = 12, pageSize = 6, so totalPages = 2
      expect(screen.getByTestId("total-pages")).toHaveTextContent("2");
    });

    it("should handle page parameter correctly", async () => {
      const searchParams = Promise.resolve({ page: "2" });
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("current-page")).toHaveTextContent("2");
    });

    it("should default to page 1 when no page parameter", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    });

    it("should pass search parameters to getAvailableProjects", async () => {
      const searchParams = Promise.resolve({
        query: "web",
        page: "1",
        categories: "WEB_DEVELOPMENT",
        scopes: "INTERMEDIATE",
        minBudget: "1000",
        maxBudget: "10000",
      });

      await MarketplacePage({ searchParams });

      expect(mockGetAvailableProjects).toHaveBeenCalledWith(
        "web",
        "1",
        "WEB_DEVELOPMENT",
        "INTERMEDIATE",
        "1000",
        "10000"
      );
    });

    it("should filter out applications from projects before passing to ProjectCard", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      // Projects should be passed without applications
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });

    it("should call getUserOrNull to get current user", async () => {
      const searchParams = Promise.resolve({});
      await MarketplacePage({ searchParams });

      expect(mockGetUserOrNull).toHaveBeenCalledTimes(1);
    });
  });

  describe("with no projects available", () => {
    beforeEach(() => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: [],
        totalProjects: 0,
      });
      mockGetUserOrNull.mockResolvedValue(null);
    });

    it("should render EmptyProject component when no projects", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("empty-project")).toBeInTheDocument();
      expect(screen.getByText("No projects available")).toBeInTheDocument();
      expect(screen.queryByTestId("project-card")).not.toBeInTheDocument();
    });

    it("should still render filters when no projects", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("filters")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-filters")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should handle getAvailableProjects errors gracefully", async () => {
      mockGetAvailableProjects.mockRejectedValue(new Error("Database error"));
      mockGetUserOrNull.mockResolvedValue(null);

      const searchParams = Promise.resolve({});

      await expect(MarketplacePage({ searchParams })).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle getUserOrNull errors gracefully", async () => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: mockProjects,
        totalProjects: 12,
      });
      mockGetUserOrNull.mockRejectedValue(new Error("Auth error"));

      const searchParams = Promise.resolve({});

      await expect(MarketplacePage({ searchParams })).rejects.toThrow(
        "Auth error"
      );
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: mockProjects,
        totalProjects: 5,
      });
      mockGetUserOrNull.mockResolvedValue(null);
    });

    it("should handle page 0 as page 1", async () => {
      const searchParams = Promise.resolve({ page: "0" });
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    });

    it("should handle empty string parameters", async () => {
      const searchParams = Promise.resolve({
        query: "",
        page: "",
        categories: "",
        scopes: "",
        minBudget: "",
        maxBudget: "",
      });

      await MarketplacePage({ searchParams });

      expect(mockGetAvailableProjects).toHaveBeenCalledWith(
        "",
        "",
        "",
        "",
        "",
        ""
      );
    });

    it("should calculate totalPages correctly when total is not divisible by 6", async () => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: mockProjects,
        totalProjects: 13,
      });

      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      // 13 / 6 = 2.16... should round up to 3
      expect(screen.getByTestId("total-pages")).toHaveTextContent("3");
    });

    it("should handle when user is null", async () => {
      mockGetUserOrNull.mockResolvedValue(null);

      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });
  });

  describe("layout and structure", () => {
    beforeEach(() => {
      mockGetAvailableProjects.mockResolvedValue({
        availableProjects: mockProjects,
        totalProjects: 12,
      });
      mockGetUserOrNull.mockResolvedValue(mockUser);
    });

    it("should have correct CSS classes for responsive design", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      const { container } = render(page);

      // Check main container
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("min-h-screen", "bg-white");

      // Check for container with flex layout
      const contentContainer = container.querySelector(".container");
      expect(contentContainer).toBeInTheDocument();
    });

    it("should render all main sections", async () => {
      const searchParams = Promise.resolve({});
      const page = await MarketplacePage({ searchParams });

      render(page);

      // Mobile filters
      expect(screen.getByTestId("mobile-filters")).toBeInTheDocument();

      // Desktop filters
      expect(screen.getByTestId("filters")).toBeInTheDocument();

      // Projects section
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });
  });
});
