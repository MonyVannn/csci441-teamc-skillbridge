import { render, screen, waitFor } from "@testing-library/react";
import ProjectDetailPage from "@/app/project/[projectId]/page";
import {
  getProjectByProjectId,
  getProjectTimelineByProjectId,
} from "@/lib/actions/project";

// Mock server actions
jest.mock("@/lib/actions/project", () => ({
  getProjectByProjectId: jest.fn(),
  getProjectTimelineByProjectId: jest.fn(),
}));

// Mock ProjectDetail component
jest.mock("@/components/project/ProjectDetail", () => ({
  ProjectDetail: ({ project, timeline }: any) => (
    <div data-testid="project-detail">
      <div data-testid="project-id">{project.id}</div>
      <div data-testid="project-title">{project.title}</div>
      <div data-testid="project-status">{project.status}</div>
      {timeline && <div data-testid="project-timeline">Timeline Present</div>}
    </div>
  ),
}));

describe("ProjectDetailPage", () => {
  const mockOpenProject = {
    id: "project-123",
    title: "Test Project",
    description: "Test Description",
    responsibilities: "Test responsibilities",
    deliverables: "Test deliverables",
    requiredSkills: ["React", "TypeScript"],
    category: "WEB_DEVELOPMENT",
    scope: "BEGINNER",
    budget: 1000,
    status: "OPEN",
    startDate: new Date(),
    estimatedEndDate: new Date(),
    applicationDeadline: new Date(),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessOwner: {
      id: "owner-123",
      clerkId: "clerk-owner-123",
      imageUrl: null,
      firstName: "John",
      lastName: "Doe",
    },
    assignedStudent: null,
    applications: [],
  };

  const mockAssignedProject = {
    ...mockOpenProject,
    status: "ASSIGNED",
    assignedStudent: {
      id: "student-123",
      clerkId: "clerk-student-123",
      imageUrl: null,
      firstName: "Jane",
      lastName: "Smith",
    },
  };

  const mockTimeline = [
    {
      date: "2024-01-01",
      title: "Application Submitted",
      content: "User submitted application",
    },
    {
      date: "2024-01-02",
      title: "Assigned",
      content: "Project assigned to student",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering with OPEN project", () => {
    it("should render ProjectDetail component for open project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-detail")).toBeInTheDocument();
    });

    it("should pass project data to ProjectDetail", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-id")).toHaveTextContent("project-123");
      expect(screen.getByTestId("project-title")).toHaveTextContent(
        "Test Project"
      );
      expect(screen.getByTestId("project-status")).toHaveTextContent("OPEN");
    });

    it("should not fetch timeline for OPEN project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(getProjectTimelineByProjectId).not.toHaveBeenCalled();
    });

    it("should pass null timeline for OPEN project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.queryByTestId("project-timeline")).not.toBeInTheDocument();
    });
  });

  describe("rendering with ASSIGNED project", () => {
    it("should render ProjectDetail component for assigned project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        mockAssignedProject
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-detail")).toBeInTheDocument();
    });

    it("should fetch timeline for non-OPEN project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        mockAssignedProject
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      await ProjectDetailPage({ params });

      expect(getProjectTimelineByProjectId).toHaveBeenCalledWith(
        "project-123",
        "student-123"
      );
    });

    it("should pass timeline to ProjectDetail for assigned project", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        mockAssignedProject
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-timeline")).toBeInTheDocument();
      expect(screen.getByText("Timeline Present")).toBeInTheDocument();
    });
  });

  describe("different project statuses", () => {
    const statuses = [
      "ASSIGNED",
      "IN_PROGRESS",
      "IN_REVIEW",
      "COMPLETED",
      "ARCHIVED",
    ];

    statuses.forEach((status) => {
      it(`should fetch timeline for ${status} project`, async () => {
        const project = {
          ...mockAssignedProject,
          status,
        };

        (getProjectByProjectId as jest.Mock).mockResolvedValue(project);
        (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
          mockTimeline
        );

        const params = Promise.resolve({ projectId: "project-123" });
        await ProjectDetailPage({ params });

        expect(getProjectTimelineByProjectId).toHaveBeenCalled();
      });
    });
  });

  describe("params handling", () => {
    it("should extract projectId from params", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "custom-id-456" });
      await ProjectDetailPage({ params });

      expect(getProjectByProjectId).toHaveBeenCalledWith("custom-id-456");
    });

    it("should handle different projectId formats", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const testIds = [
        "uuid-123-456",
        "project_abc",
        "123",
        "very-long-project-id-with-many-characters",
      ];

      for (const id of testIds) {
        jest.clearAllMocks();
        const params = Promise.resolve({ projectId: id });
        await ProjectDetailPage({ params });

        expect(getProjectByProjectId).toHaveBeenCalledWith(id);
      }
    });

    it("should await params promise before processing", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      let resolveParams: (value: any) => void;
      const params = new Promise<{ projectId: string }>((resolve) => {
        resolveParams = resolve;
      });

      const renderPromise = ProjectDetailPage({ params });

      // Params not resolved yet, so getProjectByProjectId shouldn't be called
      expect(getProjectByProjectId).not.toHaveBeenCalled();

      // Resolve params
      resolveParams!({ projectId: "project-123" });

      await renderPromise;

      expect(getProjectByProjectId).toHaveBeenCalledWith("project-123");
    });
  });

  describe("project without assigned student", () => {
    it("should pass null for assignedStudent when not present", async () => {
      const projectWithoutStudent = {
        ...mockAssignedProject,
        status: "IN_PROGRESS",
        assignedStudent: null,
      };

      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        projectWithoutStudent
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      await ProjectDetailPage({ params });

      expect(getProjectTimelineByProjectId).toHaveBeenCalledWith(
        "project-123",
        null
      );
    });

    it("should handle undefined assignedStudent", async () => {
      const projectWithoutStudent = {
        ...mockAssignedProject,
        status: "ASSIGNED",
        assignedStudent: undefined,
      };

      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        projectWithoutStudent
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      await ProjectDetailPage({ params });

      expect(getProjectTimelineByProjectId).toHaveBeenCalledWith(
        "project-123",
        null
      );
    });
  });

  describe("data fetching", () => {
    it("should call getProjectByProjectId with correct projectId", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "test-project-789" });
      await ProjectDetailPage({ params });

      expect(getProjectByProjectId).toHaveBeenCalledTimes(1);
      expect(getProjectByProjectId).toHaveBeenCalledWith("test-project-789");
    });

    it("should handle async data fetching", async () => {
      (getProjectByProjectId as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockOpenProject), 100)
          )
      );

      const params = Promise.resolve({ projectId: "project-123" });
      const component = await ProjectDetailPage({ params });

      expect(component).toBeDefined();
    });

    it("should fetch project before timeline", async () => {
      const callOrder: string[] = [];

      (getProjectByProjectId as jest.Mock).mockImplementation(async () => {
        callOrder.push("project");
        return mockAssignedProject;
      });

      (getProjectTimelineByProjectId as jest.Mock).mockImplementation(
        async () => {
          callOrder.push("timeline");
          return mockTimeline;
        }
      );

      const params = Promise.resolve({ projectId: "project-123" });
      await ProjectDetailPage({ params });

      expect(callOrder).toEqual(["project", "timeline"]);
    });
  });

  describe("component props", () => {
    it("should pass both project and timeline props", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        mockAssignedProject
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(
        mockTimeline
      );

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-detail")).toBeInTheDocument();
      expect(screen.getByTestId("project-timeline")).toBeInTheDocument();
    });

    it("should pass correct project object structure", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(mockOpenProject);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      // Verify project data is rendered
      expect(screen.getByTestId("project-id")).toHaveTextContent(
        mockOpenProject.id
      );
      expect(screen.getByTestId("project-title")).toHaveTextContent(
        mockOpenProject.title
      );
    });
  });

  describe("edge cases", () => {
    it("should handle project with empty timeline", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(
        mockAssignedProject
      );
      (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue([]);

      const params = Promise.resolve({ projectId: "project-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-detail")).toBeInTheDocument();
    });

    it("should handle project with minimal data", async () => {
      const minimalProject = {
        id: "minimal-123",
        title: "Minimal",
        status: "OPEN",
      };

      (getProjectByProjectId as jest.Mock).mockResolvedValue(minimalProject);

      const params = Promise.resolve({ projectId: "minimal-123" });
      render(await ProjectDetailPage({ params }));

      expect(screen.getByTestId("project-detail")).toBeInTheDocument();
    });
  });

  describe("error scenarios", () => {
    it("should handle missing project data", async () => {
      (getProjectByProjectId as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({ projectId: "nonexistent" });

      // The component doesn't handle null project gracefully - it will throw
      // This documents the current behavior
      await expect(ProjectDetailPage({ params })).rejects.toThrow();
    });
  });
});
