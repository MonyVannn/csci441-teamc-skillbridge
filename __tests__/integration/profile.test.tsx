/**
 * Integration Tests for Profile Page
 *
 * Tests the user profile display functionality including:
 * - User data fetching (getUserByClerkId)
 * - Completed projects fetching (getCompletedProjectsByAssignedStudentId)
 * - User information display
 * - Badge display (skill, specialization, engagement)
 * - Completed projects display
 * - Error handling (user not found)
 * - Edge cases (empty data, malformed responses)
 */

// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import { getUserByClerkId } from "@/lib/actions/user";
import { getCompletedProjectsByAssignedStudentId } from "@/lib/actions/project";
import { PrismaClient } from "@prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
  },
}));

// Import the mocked Prisma instance
const prisma = require("@/lib/prisma").default as jest.Mocked<PrismaClient>;

describe("Profile Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserByClerkId - User Data Fetching", () => {
    it("should successfully fetch user by clerk ID", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        imageUrl: "https://example.com/avatar.jpg",
        role: "USER",
        intro: "Software engineer with 5 years of experience",
        bio: "Passionate about building scalable web applications",
        address: "San Francisco, CA",
        occupied: false,
        totalHoursContributed: 120,
        projectsCompleted: 5,
        industriesExperienced: ["Technology", "Finance"],
        socialLinks: [
          {
            id: "link-1",
            type: "LinkedIn",
            url: "https://linkedin.com/in/johndoe",
            userId: "user-1",
          },
        ],
        experiences: [
          {
            id: "exp-1",
            title: "Senior Developer",
            company: "Tech Corp",
            startDate: new Date("2020-01-01"),
            endDate: new Date("2023-01-01"),
            description: "Built microservices architecture",
            userId: "user-1",
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "MIT",
            degree: "BS Computer Science",
            startDate: new Date("2015-09-01"),
            endDate: new Date("2019-06-01"),
            description: "Focus on distributed systems",
            userId: "user-1",
          },
        ],
        earnedSkillBadges: ["JavaScript", "TypeScript", "React"],
        earnedSpecializationBadges: ["Full Stack", "Cloud Architecture"],
        earnedEngagementBadges: ["Top Contributor", "Helpful"],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_123");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
      });
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it("should return null when user is not found", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getUserByClerkId("nonexistent_clerk_id");

      expect(result).toBeNull();
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkId: "nonexistent_clerk_id" },
      });
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      (prisma.user.findFirst as jest.Mock).mockRejectedValue(dbError);

      // Function returns null on error instead of throwing
      const result = await getUserByClerkId("clerk_123");
      expect(result).toBeNull();
    });

    it("should fetch user with all badge arrays", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_badges",
        email: "badges@example.com",
        firstName: "Badge",
        lastName: "Collector",
        imageUrl: null,
        role: "USER",
        intro: null,
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: ["Python", "Java", "Go", "Rust"],
        earnedSpecializationBadges: ["Backend", "DevOps", "Security"],
        earnedEngagementBadges: [
          "First Project",
          "Quick Learner",
          "Team Player",
        ],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_badges");

      expect(result).toEqual(mockUser);
      expect(result?.earnedSkillBadges).toHaveLength(4);
      expect(result?.earnedSpecializationBadges).toHaveLength(3);
      expect(result?.earnedEngagementBadges).toHaveLength(3);
    });

    it("should fetch user with empty badge arrays", async () => {
      const mockUser = {
        id: "user-2",
        clerkId: "clerk_nobadges",
        email: "nobadges@example.com",
        firstName: "New",
        lastName: "User",
        imageUrl: null,
        role: "USER",
        intro: null,
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_nobadges");

      expect(result).toEqual(mockUser);
      expect(result?.earnedSkillBadges).toEqual([]);
      expect(result?.earnedSpecializationBadges).toEqual([]);
      expect(result?.earnedEngagementBadges).toEqual([]);
    });

    it("should fetch user with multiple experiences and education", async () => {
      const mockUser = {
        id: "user-3",
        clerkId: "clerk_experienced",
        email: "experienced@example.com",
        firstName: "Senior",
        lastName: "Developer",
        imageUrl: "https://example.com/senior.jpg",
        role: "USER",
        intro: "10+ years in software development",
        bio: "Expert in multiple domains",
        address: "New York, NY",
        occupied: true,
        totalHoursContributed: 500,
        projectsCompleted: 15,
        industriesExperienced: ["Healthcare", "Finance", "E-commerce"],
        socialLinks: [
          {
            id: "link-1",
            type: "LinkedIn",
            url: "https://linkedin.com/in/senior",
            userId: "user-3",
          },
          {
            id: "link-2",
            type: "GitHub",
            url: "https://github.com/senior",
            userId: "user-3",
          },
        ],
        experiences: [
          {
            id: "exp-1",
            title: "Tech Lead",
            company: "Big Corp",
            startDate: new Date("2018-01-01"),
            endDate: null,
            description: "Leading a team of 10 developers",
            userId: "user-3",
          },
          {
            id: "exp-2",
            title: "Senior Developer",
            company: "Medium Corp",
            startDate: new Date("2015-06-01"),
            endDate: new Date("2017-12-31"),
            description: "Full stack development",
            userId: "user-3",
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "Stanford University",
            degree: "MS Computer Science",
            startDate: new Date("2013-09-01"),
            endDate: new Date("2015-06-01"),
            description: "Specialization in AI",
            userId: "user-3",
          },
          {
            id: "edu-2",
            institution: "UC Berkeley",
            degree: "BS Computer Science",
            startDate: new Date("2009-09-01"),
            endDate: new Date("2013-06-01"),
            description: null,
            userId: "user-3",
          },
        ],
        earnedSkillBadges: ["JavaScript", "Python", "Java"],
        earnedSpecializationBadges: ["Full Stack", "Machine Learning"],
        earnedEngagementBadges: ["Mentor", "Top Contributor"],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_experienced");

      expect(result).toEqual(mockUser);
      expect(result?.experiences).toHaveLength(2);
      expect(result?.education).toHaveLength(2);
      expect(result?.socialLinks).toHaveLength(2);
      expect(result?.industriesExperienced).toHaveLength(3);
    });

    it("should fetch organization user (role: ORGANIZATION)", async () => {
      const mockOrgUser = {
        id: "org-1",
        clerkId: "clerk_org",
        email: "org@example.com",
        firstName: "Tech",
        lastName: "Company",
        imageUrl: "https://example.com/org.jpg",
        role: "ORGANIZATION",
        intro: "Leading tech company",
        bio: "We build innovative solutions",
        address: "Seattle, WA",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [
          {
            id: "link-1",
            type: "Website",
            url: "https://techcompany.com",
            userId: "org-1",
          },
        ],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockOrgUser);

      const result = await getUserByClerkId("clerk_org");

      expect(result).toEqual(mockOrgUser);
      expect(result?.role).toBe("ORGANIZATION");
      expect(result?.experiences).toEqual([]);
      expect(result?.education).toEqual([]);
    });
  });

  describe("getCompletedProjectsByAssignedStudentId - Completed Projects Fetching", () => {
    it("should successfully fetch completed projects for a user", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      const mockProjects = [
        {
          id: "project-1",
          title: "E-commerce Platform",
          description: "Built a full-stack e-commerce platform",
          category: "WEB_DEVELOPMENT",
          scope: "LONG_TERM",
          status: "COMPLETED",
          requiredSkills: ["React", "Node.js", "PostgreSQL"],
          startDate: new Date("2023-01-01"),
          estimatedEndDate: new Date("2023-06-01"),
          completedAt: new Date("2023-05-15"),
          assignedStudentId: "user-1",
          businessOwnerId: "org-1",
          businessOwner: {
            id: "org-1",
            imageUrl: "https://example.com/org1.jpg",
            firstName: "Tech",
            lastName: "Corp",
            address: "San Francisco, CA",
            bio: "Leading tech company",
            intro: "We build great products",
          },
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-05-15"),
        },
        {
          id: "project-2",
          title: "Mobile App Development",
          description: "Developed a cross-platform mobile app",
          category: "MOBILE_DEVELOPMENT",
          scope: "SHORT_TERM",
          status: "COMPLETED",
          requiredSkills: ["React Native", "Firebase"],
          startDate: new Date("2023-07-01"),
          estimatedEndDate: new Date("2023-09-01"),
          completedAt: new Date("2023-08-30"),
          assignedStudentId: "user-1",
          businessOwnerId: "org-2",
          businessOwner: {
            id: "org-2",
            imageUrl: "https://example.com/org2.jpg",
            firstName: "Startup",
            lastName: "Inc",
            address: "Austin, TX",
            bio: "Innovative startup",
            intro: "Disrupting the market",
          },
          createdAt: new Date("2023-07-01"),
          updatedAt: new Date("2023-08-30"),
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");

      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(2);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
      });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          assignedStudentId: "user-1",
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
    });

    it("should return empty array when user has no completed projects", async () => {
      const mockUser = {
        id: "user-2",
        clerkId: "clerk_noprojects",
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCompletedProjectsByAssignedStudentId(
        "clerk_noprojects"
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          assignedStudentId: "user-2",
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
    });

    it("should return empty array when user is not found", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getCompletedProjectsByAssignedStudentId(
        "nonexistent_clerk_id"
      );

      expect(result).toEqual([]);
      expect(prisma.project.findMany).not.toHaveBeenCalled();
    });

    it("should order completed projects by completedAt date (desc)", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      const mockProjects = [
        {
          id: "project-1",
          title: "Recent Project",
          completedAt: new Date("2023-09-01"),
          assignedStudentId: "user-1",
          status: "COMPLETED",
          businessOwner: {
            id: "org-1",
            imageUrl: null,
            firstName: "Org",
            lastName: "One",
            address: null,
            bio: null,
            intro: null,
          },
        },
        {
          id: "project-2",
          title: "Older Project",
          completedAt: new Date("2023-06-01"),
          assignedStudentId: "user-1",
          status: "COMPLETED",
          businessOwner: {
            id: "org-2",
            imageUrl: null,
            firstName: "Org",
            lastName: "Two",
            address: null,
            bio: null,
            intro: null,
          },
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");

      expect(result).toEqual(mockProjects);
      expect(result[0].completedAt!.getTime()).toBeGreaterThan(
        result[1].completedAt!.getTime()
      );
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            completedAt: "desc",
          },
        })
      );
    });

    it("should include businessOwner details with completed projects", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      const mockProjects = [
        {
          id: "project-1",
          title: "Test Project",
          status: "COMPLETED",
          assignedStudentId: "user-1",
          completedAt: new Date("2023-08-01"),
          businessOwner: {
            id: "org-1",
            imageUrl: "https://example.com/org.jpg",
            firstName: "Business",
            lastName: "Owner",
            address: "Boston, MA",
            bio: "We are a consulting firm",
            intro: "Expert consultants",
          },
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");

      expect(result[0].businessOwner).toBeDefined();
      expect(result[0].businessOwner).toHaveProperty("id");
      expect(result[0].businessOwner).toHaveProperty("imageUrl");
      expect(result[0].businessOwner).toHaveProperty("firstName");
      expect(result[0].businessOwner).toHaveProperty("lastName");
      expect(result[0].businessOwner).toHaveProperty("address");
      expect(result[0].businessOwner).toHaveProperty("bio");
      expect(result[0].businessOwner).toHaveProperty("intro");
    });

    it("should handle database errors gracefully", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      // Function returns empty array on error instead of throwing
      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");
      expect(result).toEqual([]);
    });

    it("should fetch multiple completed projects with various categories", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      const mockProjects = [
        {
          id: "project-1",
          category: "WEB_DEVELOPMENT",
          scope: "LONG_TERM",
          status: "COMPLETED",
          completedAt: new Date("2023-08-01"),
          assignedStudentId: "user-1",
          businessOwner: {
            id: "org-1",
            imageUrl: null,
            firstName: "Org",
            lastName: "One",
            address: null,
            bio: null,
            intro: null,
          },
        },
        {
          id: "project-2",
          category: "DATA_SCIENCE",
          scope: "SHORT_TERM",
          status: "COMPLETED",
          completedAt: new Date("2023-07-01"),
          assignedStudentId: "user-1",
          businessOwner: {
            id: "org-2",
            imageUrl: null,
            firstName: "Org",
            lastName: "Two",
            address: null,
            bio: null,
            intro: null,
          },
        },
        {
          id: "project-3",
          category: "MOBILE_DEVELOPMENT",
          scope: "MEDIUM_TERM",
          status: "COMPLETED",
          completedAt: new Date("2023-06-01"),
          assignedStudentId: "user-1",
          businessOwner: {
            id: "org-3",
            imageUrl: null,
            firstName: "Org",
            lastName: "Three",
            address: null,
            bio: null,
            intro: null,
          },
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.category)).toEqual([
        "WEB_DEVELOPMENT",
        "DATA_SCIENCE",
        "MOBILE_DEVELOPMENT",
      ]);
      expect(result.map((p) => p.scope)).toEqual([
        "LONG_TERM",
        "SHORT_TERM",
        "MEDIUM_TERM",
      ]);
    });
  });

  describe("Profile Page - Integration Scenarios", () => {
    it("should fetch user data and completed projects for profile display", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        imageUrl: "https://example.com/john.jpg",
        role: "USER",
        intro: "Full-stack developer",
        bio: "Passionate about web technologies",
        address: "San Francisco, CA",
        occupied: false,
        totalHoursContributed: 200,
        projectsCompleted: 8,
        industriesExperienced: ["Technology", "Healthcare"],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: ["JavaScript", "React", "Node.js"],
        earnedSpecializationBadges: ["Full Stack"],
        earnedEngagementBadges: ["Top Contributor"],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProjects = [
        {
          id: "project-1",
          title: "E-commerce Platform",
          description: "Full-stack e-commerce solution",
          category: "WEB_DEVELOPMENT",
          scope: "LONG_TERM",
          status: "COMPLETED",
          requiredSkills: ["React", "Node.js"],
          startDate: new Date("2023-01-01"),
          estimatedEndDate: new Date("2023-06-01"),
          completedAt: new Date("2023-05-15"),
          assignedStudentId: "user-1",
          businessOwnerId: "org-1",
          businessOwner: {
            id: "org-1",
            imageUrl: "https://example.com/org.jpg",
            firstName: "Tech",
            lastName: "Corp",
            address: "Seattle, WA",
            bio: "Tech company",
            intro: "Building the future",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Simulate the profile page flow
      const userData = await getUserByClerkId("clerk_123");
      const completedProjects = await getCompletedProjectsByAssignedStudentId(
        "clerk_123"
      );

      expect(userData).toEqual(mockUser);
      expect(completedProjects).toEqual(mockProjects);
      expect(userData?.firstName).toBe("John");
      expect(userData?.earnedSkillBadges).toHaveLength(3);
      expect(completedProjects).toHaveLength(1);
    });

    it("should handle profile not found scenario", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const userData = await getUserByClerkId("nonexistent_clerk_id");

      expect(userData).toBeNull();
      // In the actual page, this would trigger ProfileNotFoundPage
    });

    it("should display user with badges but no completed projects", async () => {
      const mockUser = {
        id: "user-2",
        clerkId: "clerk_new",
        email: "newuser@example.com",
        firstName: "New",
        lastName: "User",
        imageUrl: null,
        role: "USER",
        intro: "Just starting out",
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: ["Python"],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: ["First Login"],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const userData = await getUserByClerkId("clerk_new");
      const completedProjects = await getCompletedProjectsByAssignedStudentId(
        "clerk_new"
      );

      expect(userData).toEqual(mockUser);
      expect(completedProjects).toEqual([]);
      expect(userData?.earnedSkillBadges).toHaveLength(1);
      expect(userData?.projectsCompleted).toBe(0);
    });

    it("should display organization profile without experiences/education", async () => {
      const mockOrgUser = {
        id: "org-1",
        clerkId: "clerk_org",
        email: "contact@techcorp.com",
        firstName: "Tech",
        lastName: "Corporation",
        imageUrl: "https://example.com/logo.jpg",
        role: "ORGANIZATION",
        intro: "Leading technology provider",
        bio: "We specialize in enterprise solutions",
        address: "New York, NY",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [
          {
            id: "link-1",
            type: "Website",
            url: "https://techcorp.com",
            userId: "org-1",
          },
        ],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockOrgUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const userData = await getUserByClerkId("clerk_org");
      const completedProjects = await getCompletedProjectsByAssignedStudentId(
        "clerk_org"
      );

      expect(userData).toEqual(mockOrgUser);
      expect(userData?.role).toBe("ORGANIZATION");
      expect(userData?.experiences).toEqual([]);
      expect(userData?.education).toEqual([]);
      expect(completedProjects).toEqual([]);
    });

    it("should handle user with extensive profile data", async () => {
      const mockUser = {
        id: "user-veteran",
        clerkId: "clerk_veteran",
        email: "veteran@example.com",
        firstName: "Veteran",
        lastName: "Developer",
        imageUrl: "https://example.com/veteran.jpg",
        role: "USER",
        intro: "20 years of software development experience",
        bio: "Expert in multiple programming paradigms and architectures",
        address: "Portland, OR",
        occupied: true,
        totalHoursContributed: 1000,
        projectsCompleted: 50,
        industriesExperienced: [
          "Healthcare",
          "Finance",
          "E-commerce",
          "Education",
          "Gaming",
        ],
        socialLinks: [
          {
            id: "link-1",
            type: "LinkedIn",
            url: "https://linkedin.com/in/veteran",
            userId: "user-veteran",
          },
          {
            id: "link-2",
            type: "GitHub",
            url: "https://github.com/veteran",
            userId: "user-veteran",
          },
          {
            id: "link-3",
            type: "Portfolio",
            url: "https://veteran.dev",
            userId: "user-veteran",
          },
        ],
        experiences: [
          {
            id: "exp-1",
            title: "Principal Engineer",
            company: "MegaCorp",
            startDate: new Date("2020-01-01"),
            endDate: null,
            description: "Leading architecture decisions",
            userId: "user-veteran",
          },
          {
            id: "exp-2",
            title: "Senior Engineer",
            company: "BigCorp",
            startDate: new Date("2015-01-01"),
            endDate: new Date("2019-12-31"),
            description: "Team lead for major projects",
            userId: "user-veteran",
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "MIT",
            degree: "PhD Computer Science",
            startDate: new Date("2010-09-01"),
            endDate: new Date("2014-06-01"),
            description: "Research in distributed systems",
            userId: "user-veteran",
          },
        ],
        earnedSkillBadges: [
          "JavaScript",
          "Python",
          "Java",
          "C++",
          "Go",
          "Rust",
          "TypeScript",
        ],
        earnedSpecializationBadges: [
          "Full Stack",
          "Cloud",
          "DevOps",
          "Security",
          "AI/ML",
        ],
        earnedEngagementBadges: [
          "Mentor",
          "Top Contributor",
          "Community Leader",
          "Innovator",
        ],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProjects = Array.from({ length: 5 }, (_, i) => ({
        id: `project-${i + 1}`,
        title: `Major Project ${i + 1}`,
        description: `Complex project in ${
          ["Healthcare", "Finance", "E-commerce", "Education", "Gaming"][i]
        }`,
        category: [
          "WEB_DEVELOPMENT",
          "DATA_SCIENCE",
          "MOBILE_DEVELOPMENT",
          "CLOUD_COMPUTING",
          "CYBERSECURITY",
        ][i],
        scope: "LONG_TERM",
        status: "COMPLETED",
        requiredSkills: ["JavaScript", "Python"],
        startDate: new Date(2023 - i, 0, 1),
        estimatedEndDate: new Date(2023 - i, 5, 30),
        completedAt: new Date(2023 - i, 5, 15),
        assignedStudentId: "user-veteran",
        businessOwnerId: `org-${i + 1}`,
        businessOwner: {
          id: `org-${i + 1}`,
          imageUrl: `https://example.com/org${i + 1}.jpg`,
          firstName: `Company`,
          lastName: `${i + 1}`,
          address: "Various",
          bio: "Business partner",
          intro: "Collaboration",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const userData = await getUserByClerkId("clerk_veteran");
      const completedProjects = await getCompletedProjectsByAssignedStudentId(
        "clerk_veteran"
      );

      expect(userData).toEqual(mockUser);
      expect(userData?.earnedSkillBadges).toHaveLength(7);
      expect(userData?.earnedSpecializationBadges).toHaveLength(5);
      expect(userData?.earnedEngagementBadges).toHaveLength(4);
      expect(userData?.experiences).toHaveLength(2);
      expect(userData?.education).toHaveLength(1);
      expect(userData?.socialLinks).toHaveLength(3);
      expect(userData?.industriesExperienced).toHaveLength(5);
      expect(completedProjects).toHaveLength(5);
    });
  });

  describe("Profile Page - Error Handling and Edge Cases", () => {
    it("should handle null values in optional user fields", async () => {
      const mockUser = {
        id: "user-minimal",
        clerkId: "clerk_minimal",
        email: "minimal@example.com",
        firstName: "Min",
        lastName: "User",
        imageUrl: null,
        role: "USER",
        intro: null,
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_minimal");

      expect(result).toEqual(mockUser);
      expect(result?.imageUrl).toBeNull();
      expect(result?.intro).toBeNull();
      expect(result?.bio).toBeNull();
      expect(result?.address).toBeNull();
    });

    it("should handle projects with null businessOwner fields", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_123",
      };

      const mockProjects = [
        {
          id: "project-1",
          title: "Test Project",
          status: "COMPLETED",
          completedAt: new Date("2023-08-01"),
          assignedStudentId: "user-1",
          businessOwner: {
            id: "org-1",
            imageUrl: null,
            firstName: "Business",
            lastName: "Owner",
            address: null,
            bio: null,
            intro: null,
          },
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getCompletedProjectsByAssignedStudentId("clerk_123");

      expect(result[0].businessOwner.imageUrl).toBeNull();
      expect(result[0].businessOwner.address).toBeNull();
      expect(result[0].businessOwner.bio).toBeNull();
      expect(result[0].businessOwner.intro).toBeNull();
    });

    it("should handle concurrent user and projects fetch", async () => {
      const mockUser = {
        id: "user-1",
        clerkId: "clerk_concurrent",
        email: "concurrent@example.com",
        firstName: "Concurrent",
        lastName: "User",
        imageUrl: null,
        role: "USER",
        intro: null,
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProjects = [
        {
          id: "project-1",
          status: "COMPLETED",
          completedAt: new Date(),
          assignedStudentId: "user-1",
          businessOwner: {
            id: "org-1",
            imageUrl: null,
            firstName: "Org",
            lastName: "One",
            address: null,
            bio: null,
            intro: null,
          },
        },
      ];

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Simulate concurrent fetching like in the profile page
      const [userData, completedProjects] = await Promise.all([
        getUserByClerkId("clerk_concurrent"),
        getCompletedProjectsByAssignedStudentId("clerk_concurrent"),
      ]);

      expect(userData).toEqual(mockUser);
      expect(completedProjects).toEqual(mockProjects);
    });

    it("should handle large badge arrays efficiently", async () => {
      const largeBadgeArray = Array.from(
        { length: 50 },
        (_, i) => `Skill ${i + 1}`
      );

      const mockUser = {
        id: "user-badges",
        clerkId: "clerk_badges",
        email: "badges@example.com",
        firstName: "Badge",
        lastName: "Collector",
        imageUrl: null,
        role: "USER",
        intro: null,
        bio: null,
        address: null,
        occupied: false,
        totalHoursContributed: 500,
        projectsCompleted: 100,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: largeBadgeArray,
        earnedSpecializationBadges: Array.from(
          { length: 20 },
          (_, i) => `Spec ${i + 1}`
        ),
        earnedEngagementBadges: Array.from(
          { length: 15 },
          (_, i) => `Engage ${i + 1}`
        ),
        previousProjects: [],
        postedProjects: [],
        appliedProjects: [],
        assignedProjects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByClerkId("clerk_badges");

      expect(result?.earnedSkillBadges).toHaveLength(50);
      expect(result?.earnedSpecializationBadges).toHaveLength(20);
      expect(result?.earnedEngagementBadges).toHaveLength(15);
    });
  });
});
