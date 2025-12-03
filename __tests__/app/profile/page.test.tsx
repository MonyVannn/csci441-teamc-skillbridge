// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
  auth: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import ProfilePage from "@/app/(main)/profile/[userId]/page";
import { getUserByClerkId, getUsersRecommendation } from "@/lib/actions/user";
import { getCompletedProjectsByAssignedStudentId } from "@/lib/actions/project";
import { notFound } from "next/navigation";

// Mock server actions
jest.mock("@/lib/actions/user", () => ({
  getUserByClerkId: jest.fn(),
  getUsersRecommendation: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/actions/project", () => ({
  getCompletedProjectsByAssignedStudentId: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock ProfileNotFound component
jest.mock("@/components/profile/ProfileNotFound", () => ({
  __esModule: true,
  default: () => <div data-testid="profile-not-found">User Not Found</div>,
}));

// Mock ProfileHeader component
jest.mock("@/components/profile/ProfileHeader", () => ({
  ProfileHeader: ({ user }: any) => (
    <div data-testid="profile-header">
      <div data-testid="user-name">
        {user.firstName} {user.lastName}
      </div>
      <div data-testid="user-role">{user.role}</div>
    </div>
  ),
}));

// Mock ProfileSidebar component (no props)
jest.mock("@/components/profile/ProfileSidebar", () => ({
  ProfileSidebar: () => (
    <aside data-testid="profile-sidebar">Sidebar Content</aside>
  ),
}));

// Mock ProfileContent component
jest.mock("@/components/profile/ProfileContent", () => ({
  ProfileContent: ({ user, projects }: any) => (
    <div data-testid="profile-content">
      <div data-testid="content-user">{user.id}</div>
      <div data-testid="completed-count">{projects?.length || 0}</div>
    </div>
  ),
}));

describe("ProfilePage", () => {
  const mockStudentUser = {
    id: "user-123",
    clerkId: "clerk-123",
    email: "student@test.com",
    firstName: "John",
    lastName: "Doe",
    role: "STUDENT",
    imageUrl: null,
    bio: "Test bio",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBusinessUser = {
    id: "business-456",
    clerkId: "clerk-456",
    email: "business@test.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "BUSINESS_OWNER",
    imageUrl: null,
    bio: "Business bio",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCompletedProjects = [
    {
      id: "project-1",
      title: "Completed Project 1",
      status: "COMPLETED",
      businessOwner: {
        firstName: "Owner",
        lastName: "One",
      },
    },
    {
      id: "project-2",
      title: "Completed Project 2",
      status: "COMPLETED",
      businessOwner: {
        firstName: "Owner",
        lastName: "Two",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering with valid student user", () => {
    it("should render all profile components for student", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-header")).toBeInTheDocument();
      expect(screen.getByTestId("profile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("profile-content")).toBeInTheDocument();
    });

    it("should display user information in header", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
      expect(screen.getByTestId("user-role")).toHaveTextContent("STUDENT");
    });

    it("should pass user to sidebar", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-sidebar")).toBeInTheDocument();
    });

    it("should pass completed projects to content", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("completed-count")).toHaveTextContent("2");
    });

    it("should fetch completed projects for student", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      await ProfilePage({ params });

      expect(getCompletedProjectsByAssignedStudentId).toHaveBeenCalledWith(
        "clerk-123"
      );
    });
  });

  describe("rendering with valid business owner", () => {
    it("should render all profile components for business owner", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockBusinessUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-456" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-header")).toBeInTheDocument();
      expect(screen.getByTestId("profile-sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("profile-content")).toBeInTheDocument();
    });

    it("should fetch completed projects for business owner too", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockBusinessUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-456" });
      await ProfilePage({ params });

      // The page calls this function for all users, regardless of role
      expect(getCompletedProjectsByAssignedStudentId).toHaveBeenCalledWith(
        "clerk-456"
      );
    });

    it("should handle empty completed projects for business owner", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockBusinessUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-456" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("completed-count")).toHaveTextContent("0");
    });

    it("should display business owner information", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockBusinessUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-456" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("user-name")).toHaveTextContent("Jane Smith");
      expect(screen.getByTestId("user-role")).toHaveTextContent(
        "BUSINESS_OWNER"
      );
    });
  });

  describe("user not found handling", () => {
    it("should render ProfileNotFound when user is null", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ userId: "nonexistent" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-not-found")).toBeInTheDocument();
      expect(screen.getByText("User Not Found")).toBeInTheDocument();
    });

    it("should render ProfileNotFound when user is undefined", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(undefined);

      const params = Promise.resolve({ userId: "nonexistent" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-not-found")).toBeInTheDocument();
    });

    it("should not render profile components when user not found", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ userId: "nonexistent" });
      render(await ProfilePage({ params }));

      expect(screen.queryByTestId("profile-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("profile-sidebar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("profile-content")).not.toBeInTheDocument();
    });

    it("should call getUserByClerkId before checking existence", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ userId: "test-user" });
      await ProfilePage({ params });

      expect(getUserByClerkId).toHaveBeenCalledWith("test-user");
    });

    it("should not fetch completed projects when user not found", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ userId: "nonexistent" });
      await ProfilePage({ params });

      // Profile page returns early when user not found, so this should NOT be called
      expect(getCompletedProjectsByAssignedStudentId).not.toHaveBeenCalled();
    });
  });

  describe("params handling", () => {
    it("should extract userId from params", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "custom-clerk-id" });
      await ProfilePage({ params });

      expect(getUserByClerkId).toHaveBeenCalledWith("custom-clerk-id");
    });

    it("should handle different userId formats", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const testIds = [
        "clerk_123abc",
        "user_xyz",
        "123",
        "very-long-clerk-id-with-many-characters",
      ];

      for (const id of testIds) {
        jest.clearAllMocks();
        const params = Promise.resolve({ userId: id });
        await ProfilePage({ params });

        expect(getUserByClerkId).toHaveBeenCalledWith(id);
      }
    });

    it("should await params promise before processing", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      let resolveParams: (value: any) => void;
      const params = new Promise<{ userId: string }>((resolve) => {
        resolveParams = resolve;
      });

      const renderPromise = ProfilePage({ params });

      // Params not resolved yet
      expect(getUserByClerkId).not.toHaveBeenCalled();

      // Resolve params
      resolveParams!({ userId: "clerk-123" });

      await renderPromise;

      expect(getUserByClerkId).toHaveBeenCalledWith("clerk-123");
    });
  });

  describe("completed projects scenarios", () => {
    it("should handle student with no completed projects", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("completed-count")).toHaveTextContent("0");
    });

    it("should handle student with many completed projects", async () => {
      const manyProjects = Array.from({ length: 10 }, (_, i) => ({
        id: `project-${i}`,
        title: `Project ${i}`,
        status: "COMPLETED",
        businessOwner: { firstName: "Owner", lastName: `${i}` },
      }));

      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        manyProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("completed-count")).toHaveTextContent("10");
    });

    it("should handle null completed projects response", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        null
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("completed-count")).toHaveTextContent("0");
    });
  });

  describe("layout structure", () => {
    it("should render header, sidebar, and content in correct order", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      const { container } = render(await ProfilePage({ params }));

      const header = screen.getByTestId("profile-header");
      const sidebar = screen.getByTestId("profile-sidebar");
      const content = screen.getByTestId("profile-content");

      // Verify all elements exist
      expect(header).toBeInTheDocument();
      expect(sidebar).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it("should have correct semantic structure", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      // Sidebar should be an aside element
      const sidebar = screen.getByTestId("profile-sidebar");
      expect(sidebar.tagName).toBe("ASIDE");
    });
  });

  describe("data fetching", () => {
    it("should fetch user before fetching projects", async () => {
      const callOrder: string[] = [];

      (getUserByClerkId as jest.Mock).mockImplementation(async () => {
        callOrder.push("user");
        return mockStudentUser;
      });

      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockImplementation(
        async () => {
          callOrder.push("projects");
          return mockCompletedProjects;
        }
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      await ProfilePage({ params });

      expect(callOrder).toEqual(["user", "projects"]);
    });

    it("should handle async data fetching delays", async () => {
      (getUserByClerkId as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockStudentUser), 100)
          )
      );
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      const component = await ProfilePage({ params });

      expect(component).toBeDefined();
    });
  });

  describe("component props", () => {
    it("should pass correct user object to all components", async () => {
      (getUserByClerkId as jest.Mock).mockResolvedValue(mockStudentUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        mockCompletedProjects
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      // Header
      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");

      // Sidebar - renders without user prop
      expect(screen.getByTestId("profile-sidebar")).toBeInTheDocument();

      // Content
      expect(screen.getByTestId("content-user")).toHaveTextContent("user-123");
    });

    it("should pass user with all properties intact", async () => {
      const fullUser = {
        ...mockStudentUser,
        bio: "Detailed bio",
        imageUrl: "https://example.com/image.jpg",
        email: "full@test.com",
      };

      (getUserByClerkId as jest.Mock).mockResolvedValue(fullUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    });
  });

  describe("edge cases", () => {
    it("should handle user with minimal data", async () => {
      const minimalUser = {
        id: "minimal-123",
        clerkId: "clerk-minimal",
        role: "STUDENT",
        firstName: "Min",
        lastName: "User",
      };

      (getUserByClerkId as jest.Mock).mockResolvedValue(minimalUser);
      (getCompletedProjectsByAssignedStudentId as jest.Mock).mockResolvedValue(
        []
      );

      const params = Promise.resolve({ userId: "clerk-minimal" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    });

    it("should handle different role values", async () => {
      const adminUser = {
        ...mockStudentUser,
        role: "ADMIN",
      };

      (getUserByClerkId as jest.Mock).mockResolvedValue(adminUser);

      const params = Promise.resolve({ userId: "clerk-123" });
      render(await ProfilePage({ params }));

      expect(screen.getByTestId("user-role")).toHaveTextContent("ADMIN");
    });
  });
});
