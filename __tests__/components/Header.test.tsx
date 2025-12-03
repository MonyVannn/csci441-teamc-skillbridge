import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import HeaderContent from "@/components/HeaderContent";
import { getUserOrNull } from "@/lib/actions/user";
import {
  getTotalUnrespondedApplication,
  getUnseenApplicationCount,
} from "@/lib/actions/application";
import { getUserByClerkId } from "@/lib/actions/user";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

// Mock Clerk server
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock Clerk - define MockUserButton inside factory to avoid hoisting issues
jest.mock("@clerk/nextjs", () => {
  // Create UserButton mock component with sub-components
  const MockUserButton = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="user-button">{children}</div>
  );
  MockUserButton.MenuItems = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="user-button-menu-items">{children}</div>
  );
  MockUserButton.Link = ({
    href,
    label,
    labelIcon,
  }: {
    href: string;
    label: string;
    labelIcon?: React.ReactNode;
  }) => (
    <div
      data-testid={`user-button-link-${label
        .replace(/\s+/g, "-")
        .toLowerCase()}`}
    >
      {label}
    </div>
  );
  MockUserButton.Action = ({ label }: { label: string }) => (
    <div data-testid={`user-button-action-${label}`}>{label}</div>
  );
  MockUserButton.UserProfilePage = ({
    children,
    label,
  }: {
    children?: React.ReactNode;
    label: string;
  }) => <div data-testid={`user-profile-page-${label}`}>{children}</div>;
  MockUserButton.UserProfileLink = ({
    url,
    label,
    labelIcon,
  }: {
    url: string;
    label: string;
    labelIcon?: React.ReactNode;
  }) => (
    <div
      data-testid={`user-profile-link-${label
        .replace(/\s+/g, "-")
        .toLowerCase()}`}
    >
      {label}
    </div>
  );

  return {
    SignedIn: ({ children }: { children: React.ReactNode }) => {
      const mockIsSignedIn = (jest.requireMock("@clerk/nextjs") as any)
        .__mockIsSignedIn;
      return mockIsSignedIn ? (
        <div data-testid="signed-in">{children}</div>
      ) : null;
    },
    SignedOut: ({ children }: { children: React.ReactNode }) => {
      const mockIsSignedIn = (jest.requireMock("@clerk/nextjs") as any)
        .__mockIsSignedIn;
      return !mockIsSignedIn ? (
        <div data-testid="signed-out">{children}</div>
      ) : null;
    },
    UserButton: MockUserButton,
    useUser: jest.fn(() => ({
      user: null,
      isLoaded: true,
    })),
    __mockIsSignedIn: false,
  };
});

// Mock server actions
jest.mock("@/lib/actions/user");
jest.mock("@/lib/actions/application", () => ({
  getTotalUnrespondedApplication: jest.fn(),
  getUnseenApplicationCount: jest.fn().mockResolvedValue(0),
}));

// Mock child components
jest.mock("@/components/setting/UserExperience", () => ({
  UserExperience: () => (
    <div data-testid="user-experience">User Experience</div>
  ),
}));

jest.mock("@/components/setting/UserEducation", () => ({
  UserEducation: () => <div data-testid="user-education">User Education</div>,
}));

jest.mock("@/components/setting/UserInformation", () => ({
  UserInformation: () => (
    <div data-testid="user-information">User Information</div>
  ),
}));

jest.mock("@/components/setting/OrganizationPostedProject", () => ({
  OrganizationPostedProjects: () => (
    <div data-testid="organization-posted-projects">
      Organization Posted Projects
    </div>
  ),
}));

jest.mock("@/components/browse/SearchBar", () => ({
  SearchBar: () => <div data-testid="search-bar">Search Bar</div>,
}));

jest.mock("@/components/setting/UserApplication", () => ({
  UserApplications: () => (
    <div data-testid="user-applications">User Applications</div>
  ),
}));

jest.mock("@/components/setting/OrganizationApplication", () => ({
  OrganizationApplication: () => (
    <div data-testid="organization-application">Organization Application</div>
  ),
}));

const mockGetUserOrNull = getUserOrNull as jest.MockedFunction<
  typeof getUserOrNull
>;
const mockGetTotalUnrespondedApplication =
  getTotalUnrespondedApplication as jest.MockedFunction<
    typeof getTotalUnrespondedApplication
  >;
const mockGetUserByClerkId = getUserByClerkId as jest.MockedFunction<
  typeof getUserByClerkId
>;
const mockUseUser = jest.requireMock("@clerk/nextjs").useUser;

// Helper function to set signed-in state
const setMockSignedInState = (isSignedIn: boolean) => {
  const clerkMock = jest.requireMock("@clerk/nextjs");
  clerkMock.__mockIsSignedIn = isSignedIn;
};

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockSignedInState(false);
  });

  describe("Server Component Rendering", () => {
    it("should call getUserOrNull to fetch user data", async () => {
      mockGetUserOrNull.mockResolvedValue(null);

      await Header();

      expect(mockGetUserOrNull).toHaveBeenCalledTimes(1);
    });

    it("should call getTotalUnrespondedApplication for BUSINESS_OWNER users", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "business@example.com",
        firstName: "Business",
        lastName: "Owner",
        role: "BUSINESS_OWNER" as const,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockGetUserOrNull.mockResolvedValue(mockUser);
      mockGetTotalUnrespondedApplication.mockResolvedValue(5);

      await Header();

      expect(mockGetTotalUnrespondedApplication).toHaveBeenCalledTimes(1);
    });

    it("should not call getTotalUnrespondedApplication for USER role", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "student@example.com",
        firstName: "Student",
        lastName: "User",
        role: "USER" as const,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockGetUserOrNull.mockResolvedValue(mockUser);

      await Header();

      expect(mockGetTotalUnrespondedApplication).not.toHaveBeenCalled();
    });

    it("should handle errors when fetching unresponded applications", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "business@example.com",
        role: "BUSINESS_OWNER" as const,
        firstName: null,
        lastName: null,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockGetUserOrNull.mockResolvedValue(mockUser);
      mockGetTotalUnrespondedApplication.mockRejectedValue(
        new Error("Database error")
      );

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await Header();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Error getting applications, ",
        expect.any(Error)
      );

      consoleLogSpy.mockRestore();
    });

    it("should render HeaderContent with user and applications data", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "business@example.com",
        role: "BUSINESS_OWNER" as const,
        firstName: null,
        lastName: null,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockGetUserOrNull.mockResolvedValue(mockUser);
      mockGetTotalUnrespondedApplication.mockResolvedValue(3);

      const result = await Header();
      const { container } = render(result);

      expect(container).toBeTruthy();
    });
  });
});

describe("HeaderContent Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockSignedInState(false);
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
    });
  });

  describe("Brand/Logo Rendering", () => {
    it("should render the SKILLBRIDGE logo with correct text", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      expect(screen.getByText("SKILL")).toBeInTheDocument();
      expect(screen.getByText("BRIDGE.")).toBeInTheDocument();
    });

    it("should render logo as a link to homepage", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const logoLink = screen.getByText("SKILL").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("should apply correct styling classes to logo", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const logoContainer = screen.getByText("SKILL").closest("div");
      expect(logoContainer).toHaveClass("text-gray-100");
      expect(logoContainer).toHaveClass("font-bold");
    });
  });

  describe("Navigation and Search Bar", () => {
    it("should render search bar component", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    });

    it("should render search bar in center position on large screens", () => {
      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      const searchBarContainer = screen.getByTestId("search-bar").parentElement;
      expect(searchBarContainer).toHaveClass("absolute");
      expect(searchBarContainer).toHaveClass("left-1/2");
      expect(searchBarContainer).toHaveClass("-translate-x-1/2");
    });
  });

  describe("Signed Out State", () => {
    it('should render "Sign in" button when user is signed out', () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const signInButton = screen.getByText("Sign in");
      expect(signInButton).toBeInTheDocument();
    });

    it('should render "Get Started" button when user is signed out', () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const getStartedButton = screen.getByText("Get Started");
      expect(getStartedButton).toBeInTheDocument();
    });

    it('should link "Sign in" button to /sign-in', () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const signInLink = screen.getByText("Sign in").closest("a");
      expect(signInLink).toHaveAttribute("href", "/sign-in");
    });

    it('should link "Get Started" button to /sign-up', () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const getStartedLink = screen.getByText("Get Started").closest("a");
      expect(getStartedLink).toHaveAttribute("href", "/sign-up");
    });

    it("should not render UserButton when signed out", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      expect(screen.queryByTestId("user-button")).not.toBeInTheDocument();
    });
  });

  describe("Signed In State - USER Role", () => {
    const mockUserRole = {
      id: "user-1",
      clerkId: "clerk-1",
      email: "student@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "USER" as const,
      bio: "Student bio",
      intro: "Student intro",
      address: "Student Address",
      skills: ["JavaScript", "React"],
      imageUrl: "https://example.com/avatar.jpg",
      occupied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [],
      experiences: [],
      education: [],
      previousProjects: [],
      earnedSkillBadges: [],
      earnedSpecializationBadges: [],
      earnedEngagementBadges: [],
      totalHoursContributed: 50,
      projectsCompleted: 3,
      industriesExperienced: ["Technology"],
      postedProjects: [],
      assignedProjects: [],
      applications: [],
      conversationIds: [],
    };

    beforeEach(() => {
      setMockSignedInState(true);
    });

    it("should render UserButton when signed in", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(screen.getByTestId("user-button")).toBeInTheDocument();
    });

    it("should render View profile link for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-view-profile")
      ).toBeInTheDocument();
    });

    it("should render Manage Applications link for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-manage-applications")
      ).toBeInTheDocument();
    });

    it("should render Documentation link for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-documentation")
      ).toBeInTheDocument();
    });

    it("should render manageAccount action for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-action-manageAccount")
      ).toBeInTheDocument();
    });

    it("should render profile link with correct URL for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      const profileLink = screen.getByTestId(
        "user-profile-link-go-to-profile-page"
      );
      expect(profileLink).toBeInTheDocument();
    });

    it('should not render "Post a Project" button for USER role', () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(screen.queryByText("Post a Project")).not.toBeInTheDocument();
    });

    it("should not render Manage Projects link for USER role", () => {
      render(
        <HeaderContent
          user={mockUserRole}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.queryByTestId("user-button-link-manage-projects")
      ).not.toBeInTheDocument();
    });
  });

  describe("Signed In State - BUSINESS_OWNER Role", () => {
    const mockBusinessOwner = {
      id: "user-2",
      clerkId: "clerk-2",
      email: "business@example.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "BUSINESS_OWNER" as const,
      bio: "Business owner bio",
      intro: "Business owner intro",
      address: "Business Address",
      skills: [],
      imageUrl: "https://example.com/business-avatar.jpg",
      occupied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [],
      experiences: [],
      education: [],
      previousProjects: [],
      earnedSkillBadges: [],
      earnedSpecializationBadges: [],
      earnedEngagementBadges: [],
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
      postedProjects: [],
      assignedProjects: [],
      applications: [],
      conversationIds: [],
    };

    beforeEach(() => {
      setMockSignedInState(true);
    });

    it('should render "Post a Project" button for BUSINESS_OWNER role', () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(screen.getByText("Post a Project")).toBeInTheDocument();
    });

    it('"Post a Project" button should link to /project/new', () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      const postButton = screen.getByText("Post a Project");
      expect(postButton.closest("a")).toHaveAttribute("href", "/project/new");
    });

    it("should render View profile link for BUSINESS_OWNER role", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-view-profile")
      ).toBeInTheDocument();
    });

    it("should render Manage Projects link for BUSINESS_OWNER role", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-manage-projects")
      ).toBeInTheDocument();
    });

    it("should render Manage Applications link for BUSINESS_OWNER role", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-manage-applications")
      ).toBeInTheDocument();
    });

    it("should render Documentation link for BUSINESS_OWNER role", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-link-documentation")
      ).toBeInTheDocument();
    });

    it("should render signOut action for BUSINESS_OWNER role", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      expect(
        screen.getByTestId("user-button-action-signOut")
      ).toBeInTheDocument();
    });
  });

  describe("Notification Badge Display", () => {
    const mockBusinessOwner = {
      id: "user-2",
      clerkId: "clerk-2",
      email: "business@example.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "BUSINESS_OWNER" as const,
      bio: null,
      intro: null,
      address: null,
      skills: [],
      imageUrl: null,
      occupied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [],
      experiences: [],
      education: [],
      previousProjects: [],
      earnedSkillBadges: [],
      earnedSpecializationBadges: [],
      earnedEngagementBadges: [],
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
      postedProjects: [],
      assignedProjects: [],
      applications: [],
      conversationIds: [],
    };

    beforeEach(() => {
      setMockSignedInState(true);
    });

    it("should display notification badge when unresponded applications > 0", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={5}
        />
      );

      const badges = screen.getAllByText("5");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should not display notification badge when unresponded applications = 0", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={0}
        />
      );

      const container = screen.getByTestId("user-button").parentElement;
      expect(container?.querySelector(".bg-red-400")).not.toBeInTheDocument();
    });

    it("should not display notification badge when unresponded applications is null", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={null}
        />
      );

      const container = screen.getByTestId("user-button").parentElement;
      expect(container?.querySelector(".bg-red-400")).not.toBeInTheDocument();
    });

    it("should display correct count in notification badge", () => {
      render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={12}
        />
      );

      const badges = screen.getAllByText("12");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should style notification badge with red background", () => {
      const { container } = render(
        <HeaderContent
          user={mockBusinessOwner}
          totalUnrespondedApplications={3}
        />
      );

      const badge = container.querySelector(".bg-red-400");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("rounded-full");
      expect(badge).toHaveClass("text-white");
    });
  });

  describe("Accessibility", () => {
    it("should render header as a semantic header element", () => {
      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have proper heading hierarchy for logo", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const heading1 = screen.getByText("SKILL");
      const heading2 = screen.getByText("BRIDGE.");

      expect(heading1.tagName).toBe("H1");
      expect(heading2.tagName).toBe("H1");
    });

    it("should have accessible button elements for actions", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const getStartedButton = screen
        .getByText("Get Started")
        .closest("button");
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton?.tagName).toBe("BUTTON");
    });

    it("should have proper link elements with href attributes", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const signInLink = screen.getByText("Sign in").closest("a");
      const getStartedLink = screen.getByText("Get Started").closest("a");

      expect(signInLink).toHaveAttribute("href");
      expect(getStartedLink).toHaveAttribute("href");
    });

    it("should use semantic navigation structure", () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "test@example.com",
        role: "USER" as const,
        firstName: null,
        lastName: null,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      const { container } = render(
        <HeaderContent user={mockUser} totalUnrespondedApplications={null} />
      );

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();
    });

    it("should have visible focus indicators on interactive elements", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const signInButton = screen.getByText("Sign in").closest("button");
      expect(signInButton).toHaveClass("hover:bg-[#695DCC]/40");
    });
  });

  describe("Client-Side User Fetching", () => {
    it("should fetch user from database when Clerk user loads", async () => {
      const mockClerkUser = {
        id: "clerk-123",
        firstName: "John",
        lastName: "Doe",
      };

      const mockDbUser = {
        id: "user-1",
        clerkId: "clerk-123",
        email: "test@example.com",
        role: "USER" as const,
        firstName: null,
        lastName: null,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockUseUser.mockReturnValue({
        user: mockClerkUser,
        isLoaded: true,
      });

      mockGetUserByClerkId.mockResolvedValue(mockDbUser);

      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      await waitFor(() => {
        expect(mockGetUserByClerkId).toHaveBeenCalledWith("clerk-123");
      });
    });

    it("should not fetch user if already provided via server props", () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk-1",
        email: "test@example.com",
        role: "USER" as const,
        firstName: null,
        lastName: null,
        bio: null,
        intro: null,
        address: null,
        skills: [],
        imageUrl: null,
        occupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        socialLinks: [],
        experiences: [],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        postedProjects: [],
        assignedProjects: [],
        applications: [],
        conversationIds: [],
      };

      mockUseUser.mockReturnValue({
        user: { id: "clerk-1" },
        isLoaded: true,
      });

      render(
        <HeaderContent user={mockUser} totalUnrespondedApplications={null} />
      );

      expect(mockGetUserByClerkId).not.toHaveBeenCalled();
    });
  });

  describe("Path-based Rendering", () => {
    it("should not render header on sign-in page", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/sign-in");

      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render header on sign-up page", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/sign-up");

      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render header on other pages", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/profile/user-123");

      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      expect(container.querySelector("header")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive classes to logo", () => {
      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      const logoDiv = screen.getByText("SKILL").closest("div");
      expect(logoDiv).toHaveClass("text-base");
      expect(logoDiv).toHaveClass("sm:text-2xl");
    });

    it("should apply responsive classes to action buttons", () => {
      render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

      const getStartedButton = screen
        .getByText("Get Started")
        .closest("button");
      expect(getStartedButton).toHaveClass("text-xs");
      expect(getStartedButton).toHaveClass("sm:text-sm");
    });

    it("should hide search bar on small screens", () => {
      const { container } = render(
        <HeaderContent user={null} totalUnrespondedApplications={null} />
      );

      const searchBarContainer = screen.getByTestId("search-bar").parentElement;
      expect(searchBarContainer).toHaveClass("hidden");
      expect(searchBarContainer).toHaveClass("lg:block");
    });
  });
});
