import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApplyButton } from "@/components/application/ApplyButton";
import { createApplication, isApplied } from "@/lib/actions/application";
import { AvailableProject } from "@/type";
import { User } from "@prisma/client";

// Mock server actions
jest.mock("@/lib/actions/application", () => ({
  createApplication: jest.fn(),
  isApplied: jest.fn(),
}));

describe("ApplyButton Component", () => {
  const mockCompleteUser: User = {
    id: "user123",
    clerkId: "clerk123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    bio: "A passionate developer",
    intro: "Hello, I'm John",
    address: "123 Main St",
    skills: ["JavaScript", "TypeScript"],
    imageUrl: "https://example.com/image.jpg",
    role: "USER" as const,
    occupied: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    socialLinks: [],
    experiences: [],
    education: [
      {
        id: "edu1",
        degree: "Computer Science",
        institution: "University",
        startDate: new Date(),
        endDate: null,
        description: null,
      },
    ],
    previousProjects: [],
    earnedSkillBadges: [],
    earnedSpecializationBadges: [],
    earnedEngagementBadges: [],
    totalHoursContributed: 0,
    projectsCompleted: 0,
    industriesExperienced: [],
    conversationIds: [],
  };

  const mockProject: AvailableProject = {
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
      address: null,
      bio: null,
      intro: null,
    },
    assignedStudent: null,
    applications: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (isApplied as jest.Mock).mockResolvedValue(false);
  });

  describe("initial rendering", () => {
    it("should render Apply Now button when not applied", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        expect(screen.getByText("Apply Now")).toBeInTheDocument();
      });
    });

    it("should render Applied button when already applied", async () => {
      (isApplied as jest.Mock).mockResolvedValue(true);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        expect(screen.getByText("Applied")).toBeInTheDocument();
      });
    });

    it("should check application status on mount", async () => {
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        expect(isApplied).toHaveBeenCalledWith(mockProject.id);
      });
    });

    it("should disable button when already applied", async () => {
      (isApplied as jest.Mock).mockResolvedValue(true);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Applied");
        expect(button).toBeDisabled();
      });
    });
  });

  describe("dialog interactions", () => {
    it("should open dialog when Apply Now is clicked", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        expect(button).toBeEnabled();
      });

      const button = screen.getByText("Apply Now");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should not open dialog when Applied button is clicked", async () => {
      (isApplied as jest.Mock).mockResolvedValue(true);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Applied");
        expect(button).toBeDisabled();
      });
    });
  });

  describe("form submission", () => {
    it("should submit application with cover letter", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      (createApplication as jest.Mock).mockResolvedValue({ success: true });

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Find and fill the cover letter textarea
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, {
        target: { value: "I am interested in this project" },
      });

      // Find and click submit button
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createApplication).toHaveBeenCalledWith(
          mockProject.id,
          "I am interested in this project"
        );
      });
    });

    it("should not submit without cover letter", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      expect(createApplication).not.toHaveBeenCalled();
    });

    it("should close dialog after successful submission", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      (createApplication as jest.Mock).mockResolvedValue({ success: true });

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, {
        target: { value: "My application" },
      });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should clear form data after submission", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      (createApplication as jest.Mock).mockResolvedValue({ success: true });

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      // Open dialog
      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      // Fill and submit
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Test application" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createApplication).toHaveBeenCalled();
      });

      // After submission, button should show "Applied" and be disabled
      await waitFor(() => {
        const button = screen.getByText("Applied");
        expect(button).toBeDisabled();
      });
    });
  });

  describe("error handling", () => {
    it("should handle application submission error gracefully", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      (createApplication as jest.Mock).mockRejectedValue(
        new Error("Submission failed")
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Test" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to submit application:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("state management", () => {
    it("should update button text after application", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);
      (createApplication as jest.Mock).mockResolvedValue({ success: true });

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        expect(screen.getByText("Apply Now")).toBeInTheDocument();
      });

      const button = screen.getByText("Apply Now");
      fireEvent.click(button);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Application" } });

      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Applied")).toBeInTheDocument();
      });
    });

    it("should handle dialog state correctly", async () => {
      (isApplied as jest.Mock).mockResolvedValue(false);

      render(<ApplyButton project={mockProject} user={mockCompleteUser} />);

      await waitFor(() => {
        const button = screen.getByText("Apply Now");
        fireEvent.click(button);
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Close dialog
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });
});
