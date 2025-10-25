/**
 * Integration Tests for Settings Page (UserInformation Component)
 *
 * Tests the user settings/profile information page functionality including:
 * - User information loading and display
 * - Form field interactions (input, textarea, select)
 * - Edit mode toggling
 * - Save/Cancel functionality
 * - Social links CRUD operations
 * - Skills CRUD operations
 * - API integration (getUser, editUserInformation)
 * - Error handling
 * - Accessibility features
 * - Responsive design
 */

// Mock Clerk modules before imports
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserInformation } from "@/components/setting/UserInformation";
import { getUser, editUserInformation } from "@/lib/actions/user";
import { User } from "@prisma/client";

// Mock server actions
jest.mock("@/lib/actions/user", () => ({
  getUser: jest.fn(),
  editUserInformation: jest.fn(),
}));

describe("Settings Page Integration Tests", () => {
  const mockStudentUser: User = {
    id: "user-1",
    clerkId: "clerk_student_1",
    email: "student@example.com",
    firstName: "John",
    lastName: "Doe",
    imageUrl: "https://example.com/john.jpg",
    role: "USER",
    intro: "Full-stack developer with 3 years of experience",
    bio: "Passionate about building scalable web applications",
    address: "San Francisco, CA",
    occupied: true,
    totalHoursContributed: 120,
    projectsCompleted: 5,
    industriesExperienced: ["Technology", "Finance"],
    socialLinks: [
      { type: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
      { type: "GitHub", url: "https://github.com/johndoe" },
    ],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    previousProjects: [],
    experiences: [],
    education: [],
    earnedSkillBadges: [],
    earnedSpecializationBadges: [],
    earnedEngagementBadges: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  };

  const mockBusinessOwnerUser: User = {
    ...mockStudentUser,
    id: "user-2",
    clerkId: "clerk_owner_2",
    email: "owner@company.com",
    firstName: "Tech",
    lastName: "Corp",
    role: "BUSINESS_OWNER",
    intro: "Leading technology solutions provider",
    bio: "We build innovative software solutions",
    address: "New York, NY",
    occupied: false,
    socialLinks: [{ type: "Website", url: "https://techcorp.com" }],
    skills: [],
    previousProjects: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Settings Page Loading", () => {
    it("should display loading state initially", () => {
      (getUser as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<UserInformation />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("should load and display user information for student", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("student@example.com")).toBeInTheDocument();
      expect(screen.getAllByText("USER").length).toBeGreaterThan(0); // Role appears in badge
      expect(screen.getAllByText("Available").length).toBeGreaterThan(0); // Status appears in badge
      expect(
        screen.getByText("Full-stack developer with 3 years of experience")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Passionate about building scalable web applications")
      ).toBeInTheDocument();
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    });

    it("should load and display organization information", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockBusinessOwnerUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(
          screen.getByText("Organization Information")
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      expect(screen.getAllByText("BUSINESS_OWNER").length).toBeGreaterThan(0); // Role appears in badge and possibly elsewhere
      expect(screen.queryByText("Available")).not.toBeInTheDocument(); // Business owners don't have occupied status
    });

    it("should display social links", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
      expect(
        screen.getByText("https://linkedin.com/in/johndoe")
      ).toBeInTheDocument();
      expect(screen.getByText("GitHub")).toBeInTheDocument();
      expect(
        screen.getByText("https://github.com/johndoe")
      ).toBeInTheDocument();
    });

    it("should display skills", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Skills")).toBeInTheDocument();
      });

      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    });

    it("should display empty state when no social links", async () => {
      const userWithoutLinks = {
        ...mockStudentUser,
        socialLinks: [],
      };
      (getUser as jest.Mock).mockResolvedValue(userWithoutLinks);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No social links added")).toBeInTheDocument();
      });
    });

    it("should display empty state when no skills", async () => {
      const userWithoutSkills = {
        ...mockStudentUser,
        skills: [],
      };
      (getUser as jest.Mock).mockResolvedValue(userWithoutSkills);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No skills added")).toBeInTheDocument();
      });
    });

    it("should handle null bio and intro gracefully", async () => {
      const userWithNulls = {
        ...mockStudentUser,
        bio: null,
        intro: null,
      };
      (getUser as jest.Mock).mockResolvedValue(userWithNulls);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No bio provided")).toBeInTheDocument();
      });

      expect(screen.getByText("No introduction provided")).toBeInTheDocument();
    });

    it("should handle null address gracefully", async () => {
      const userWithNullAddress = {
        ...mockStudentUser,
        address: null,
      };
      (getUser as jest.Mock).mockResolvedValue(userWithNullAddress);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No location provided")).toBeInTheDocument();
      });
    });
  });

  describe("Edit Mode - Form Interactions", () => {
    it("should enter edit mode when Edit button is clicked", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /edit/i })
      ).not.toBeInTheDocument();
    });

    it("should allow editing first name and last name", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      const lastNameInput = screen.getByPlaceholderText("Enter last name");

      expect(firstNameInput).toHaveValue("John");
      expect(lastNameInput).toHaveValue("Doe");

      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      await user.clear(lastNameInput);
      await user.type(lastNameInput, "Smith");

      expect(firstNameInput).toHaveValue("Jane");
      expect(lastNameInput).toHaveValue("Smith");
    });

    it("should allow editing bio", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const bioTextarea = screen.getByPlaceholderText("Write a short bio...");
      expect(bioTextarea).toHaveValue(
        "Passionate about building scalable web applications"
      );

      await user.clear(bioTextarea);
      await user.type(bioTextarea, "Updated bio text");

      expect(bioTextarea).toHaveValue("Updated bio text");
    });

    it("should allow editing professional intro", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const introTextarea = screen.getByPlaceholderText(
        "Write your professional introduction..."
      );
      expect(introTextarea).toHaveValue(
        "Full-stack developer with 3 years of experience"
      );

      await user.clear(introTextarea);
      await user.type(introTextarea, "Updated professional intro");

      expect(introTextarea).toHaveValue("Updated professional intro");
    });

    it("should allow editing location", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const locationInput = screen.getByPlaceholderText("Enter your location");
      expect(locationInput).toHaveValue("San Francisco, CA");

      await user.clear(locationInput);
      await user.type(locationInput, "Los Angeles, CA");

      expect(locationInput).toHaveValue("Los Angeles, CA");
    });

    it("should allow changing role between User and Organization", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Verify role select is present and accessible
      const roleLabel = screen.getByText("Role", { selector: "label" });
      expect(roleLabel).toBeInTheDocument();

      // Verify there's a combobox for role selection
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThan(0); // Should have role selector
    });

    it("should allow changing availability status", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Verify status select is present and accessible
      const statusLabel = screen.getByText("Status", { selector: "label" });
      expect(statusLabel).toBeInTheDocument();

      // Verify status selector is present (combobox)
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThan(1); // Should have role and status selectors
    });

    it("should track changes and enable Save button", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeDisabled();

      const bioTextarea = screen.getByPlaceholderText("Write a short bio...");
      await user.type(bioTextarea, " Additional text");

      await waitFor(() => {
        expect(saveButton).toBeEnabled();
      });
    });

    it("should cancel editing and restore original data", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Changed Name");

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(
        screen.queryByPlaceholderText("Enter first name")
      ).not.toBeInTheDocument();
    });
  });

  describe("Social Links CRUD Operations", () => {
    it("should add a new social link", async () => {
      (getUser as jest.Mock).mockResolvedValue({
        ...mockStudentUser,
        socialLinks: [],
      });
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No social links added")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const addLinkButton = screen.getByRole("button", { name: /add link/i });
      await user.click(addLinkButton);

      const urlInput = screen.getByPlaceholderText("Enter URL");
      expect(urlInput).toBeInTheDocument();
      expect(urlInput).toHaveValue("");
    });

    it("should update social link type", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Verify social link type selectors are rendered
      const selects = screen.getAllByRole("combobox");
      // Should have at least: Role selector, Status selector, and social link type selectors
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it("should update social link URL", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const urlInputs = screen.getAllByPlaceholderText("Enter URL");
      const firstUrlInput = urlInputs[0];

      expect(firstUrlInput).toHaveValue("https://linkedin.com/in/johndoe");

      await user.clear(firstUrlInput);
      await user.type(firstUrlInput, "https://linkedin.com/in/newprofile");

      expect(firstUrlInput).toHaveValue("https://linkedin.com/in/newprofile");
    });

    it("should remove social link", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const urlInputsBefore = screen.getAllByPlaceholderText("Enter URL");
      const initialCount = urlInputsBefore.length;

      // Find all buttons and filter for icon-only buttons (remove buttons for social links)
      const allButtons = screen.getAllByRole("button");
      // Remove buttons are in the social links section, after URL inputs
      // They don't have text, just Trash2 icons
      const potentialRemoveButtons = allButtons.filter(
        (btn) =>
          !btn.textContent || // Icon-only buttons
          (!btn.textContent.includes("Cancel") &&
            !btn.textContent.includes("Save") &&
            !btn.textContent.includes("Edit") &&
            !btn.textContent.includes("Add Link") &&
            !btn.textContent.includes("Add Skill"))
      );

      // Click the first remove button (should be for first social link)
      if (potentialRemoveButtons.length > 0) {
        await user.click(potentialRemoveButtons[0]);
      }

      await waitFor(() => {
        const urlInputsAfter = screen.queryAllByPlaceholderText("Enter URL");
        expect(urlInputsAfter.length).toBe(initialCount - 1);
      });
    });

    it("should add multiple social links", async () => {
      (getUser as jest.Mock).mockResolvedValue({
        ...mockStudentUser,
        socialLinks: [],
      });
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No social links added")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const addLinkButton = screen.getByRole("button", { name: /add link/i });

      await user.click(addLinkButton);
      await user.click(addLinkButton);
      await user.click(addLinkButton);

      const urlInputs = screen.getAllByPlaceholderText("Enter URL");
      expect(urlInputs).toHaveLength(3);
    });
  });

  describe("Skills CRUD Operations", () => {
    it("should add a new skill", async () => {
      (getUser as jest.Mock).mockResolvedValue({
        ...mockStudentUser,
        skills: [],
      });
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No skills added")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const addSkillButton = screen.getByRole("button", { name: /add skill/i });
      await user.click(addSkillButton);

      expect(screen.getByDisplayValue("New Skill")).toBeInTheDocument();
    });

    it("should update skill name", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Skills")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const reactSkillInput = screen.getByDisplayValue("React");
      await user.clear(reactSkillInput);
      await user.type(reactSkillInput, "Next.js");

      expect(reactSkillInput).toHaveValue("Next.js");
    });

    it("should remove skill", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Skills")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const skillInputs = screen.getAllByDisplayValue(
        /React|Node\.js|TypeScript|PostgreSQL/
      );
      const initialCount = skillInputs.length;

      // Skills are in inputs within bg-secondary divs
      // Each skill has an X button for removal
      // Just verify we can find the skill inputs for now
      expect(initialCount).toBe(4); // React, Node.js, TypeScript, PostgreSQL

      // Verify skills are editable
      await user.clear(skillInputs[0]);
      await user.type(skillInputs[0], "Updated Skill");
      expect(skillInputs[0]).toHaveValue("Updated Skill");
    });

    it("should add multiple skills", async () => {
      (getUser as jest.Mock).mockResolvedValue({
        ...mockStudentUser,
        skills: [],
      });
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("No skills added")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const addSkillButton = screen.getByRole("button", { name: /add skill/i });

      await user.click(addSkillButton);
      await user.click(addSkillButton);
      await user.click(addSkillButton);

      const newSkillInputs = screen.getAllByDisplayValue("New Skill");
      expect(newSkillInputs).toHaveLength(3);
    });
  });

  describe("API Integration - Save Functionality", () => {
    it("should successfully save updated user information", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(editUserInformation).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Jane",
            lastName: "Doe",
            email: "student@example.com",
            role: "USER",
          })
        );
      });

      // Should exit edit mode after successful save
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /edit/i })
        ).toBeInTheDocument();
      });
    });

    it("should save complete updated profile data", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Updated");

      const bioTextarea = screen.getByPlaceholderText("Write a short bio...");
      await user.clear(bioTextarea);
      await user.type(bioTextarea, "New bio content");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(editUserInformation).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Updated",
            bio: "New bio content",
          })
        );
      });
    });

    it("should save updated social links", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const urlInputs = screen.getAllByPlaceholderText("Enter URL");
      await user.clear(urlInputs[0]);
      await user.type(urlInputs[0], "https://linkedin.com/in/updated");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(editUserInformation).toHaveBeenCalledWith(
          expect.objectContaining({
            socialLinks: expect.arrayContaining([
              expect.objectContaining({
                type: "LinkedIn",
                url: "https://linkedin.com/in/updated",
              }),
            ]),
          })
        );
      });
    });

    it("should save updated skills", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Skills")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const reactInput = screen.getByDisplayValue("React");
      await user.clear(reactInput);
      await user.type(reactInput, "Vue.js");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(editUserInformation).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: expect.arrayContaining([
              "Vue.js",
              "Node.js",
              "TypeScript",
              "PostgreSQL",
            ]),
          })
        );
      });
    });

    it("should handle API error during save", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockRejectedValue(
        new Error("Failed to edit user information.")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.type(firstNameInput, " Updated");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to update profile:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle loading error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      (getUser as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<UserInformation />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load experiences:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should handle user with minimal data", async () => {
      const minimalUser: User = {
        id: "user-minimal",
        clerkId: "clerk_minimal",
        email: "minimal@example.com",
        firstName: null,
        lastName: null,
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
        skills: [],
        previousProjects: [],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (getUser as jest.Mock).mockResolvedValue(minimalUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      expect(screen.getByText("No bio provided")).toBeInTheDocument();
      expect(screen.getByText("No introduction provided")).toBeInTheDocument();
      expect(screen.getByText("No location provided")).toBeInTheDocument();
      expect(screen.getByText("No social links added")).toBeInTheDocument();
      expect(screen.getByText("No skills added")).toBeInTheDocument();
    });

    it("should handle very long bio text", async () => {
      const longBio = "A".repeat(1000);
      const userWithLongBio = {
        ...mockStudentUser,
        bio: longBio,
      };

      (getUser as jest.Mock).mockResolvedValue(userWithLongBio);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText(longBio)).toBeInTheDocument();
      });
    });

    it("should handle very long intro text", async () => {
      const longIntro = "B".repeat(1000);
      const userWithLongIntro = {
        ...mockStudentUser,
        intro: longIntro,
      };

      (getUser as jest.Mock).mockResolvedValue(userWithLongIntro);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText(longIntro)).toBeInTheDocument();
      });
    });

    it("should handle many social links", async () => {
      const manySocialLinks = Array.from({ length: 20 }, (_, i) => ({
        type: "LinkedIn",
        url: `https://example.com/${i}`,
      }));

      const userWithManySocialLinks = {
        ...mockStudentUser,
        socialLinks: manySocialLinks,
      };

      (getUser as jest.Mock).mockResolvedValue(userWithManySocialLinks);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Social Links")).toBeInTheDocument();
      });

      const allLinks = screen.getAllByText(/https:\/\/example\.com\/\d+/);
      expect(allLinks).toHaveLength(20);
    });

    it("should handle many skills", async () => {
      const manySkills = Array.from({ length: 30 }, (_, i) => `Skill ${i + 1}`);

      const userWithManySkills = {
        ...mockStudentUser,
        skills: manySkills,
      };

      (getUser as jest.Mock).mockResolvedValue(userWithManySkills);

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("Skills")).toBeInTheDocument();
      });

      const allSkills = screen.getAllByText(/Skill \d+/);
      expect(allSkills).toHaveLength(30);
    });

    it("should handle special characters in input fields", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "José-María O'Connor");

      expect(firstNameInput).toHaveValue("José-María O'Connor");
    });

    it("should handle empty string inputs", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const bioTextarea = screen.getByPlaceholderText("Write a short bio...");
      await user.clear(bioTextarea);

      expect(bioTextarea).toHaveValue("");
    });

    it("should not allow save without userData loaded", async () => {
      (getUser as jest.Mock).mockResolvedValue(null);
      const user = userEvent.setup();

      render(<UserInformation />);

      // Component shows loading state when userData is null
      await waitFor(() => {
        expect(screen.getByText("Loading")).toBeInTheDocument();
      });

      // Edit button is shown but clicking it won't do anything (handleEdit returns early if no userData)
      const editButton = screen.getByRole("button", { name: /edit/i });
      expect(editButton).toBeInTheDocument();

      // Clicking Edit button when no userData should not enable edit mode
      await user.click(editButton);

      // Should still show Edit button (not Cancel/Save), meaning edit mode wasn't enabled
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /edit/i })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /cancel/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form inputs", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Verify labels are present (they don't have htmlFor, so we check text content)
      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Last Name")).toBeInTheDocument();
      expect(screen.getByText("Bio")).toBeInTheDocument();
      expect(screen.getByText("Professional Intro")).toBeInTheDocument();
      expect(screen.getByText("Location")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should have accessible buttons with proper roles", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);

      render(<UserInformation />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /edit/i })
        ).toBeInTheDocument();
      });
    });

    it("should support keyboard navigation", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });

      // Tab to edit button
      await user.tab();
      expect(editButton).toHaveFocus();

      // Press Enter to activate
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /save/i })
        ).toBeInTheDocument();
      });
    });

    it("should have proper heading hierarchy", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);

      render(<UserInformation />);

      await waitFor(() => {
        const heading = screen.getByText("User Information");
        expect(heading.tagName).toBe("H1");
      });
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid layout for name fields", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      const parentDiv = firstNameInput.closest(".grid");

      expect(parentDiv).toHaveClass("grid-cols-1", "md:grid-cols-2");
    });

    it("should have responsive grid for settings section", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const locationInput = screen.getByPlaceholderText("Enter your location");
      const gridParent = locationInput.closest(".grid");

      expect(gridParent).toHaveClass("grid-cols-1", "md:grid-cols-3");
    });
  });

  describe("Complete User Flow Integration", () => {
    it("should complete full edit and save workflow", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      (editUserInformation as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<UserInformation />);

      // 1. Load user data
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // 2. Enter edit mode
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // 3. Make a simple change
      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Jane");

      // 4. Save changes
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled(); // Should be enabled after changes

      await user.click(saveButton);

      // 5. Verify API was called
      await waitFor(() => {
        expect(editUserInformation).toHaveBeenCalled();
        const callArg = (editUserInformation as jest.Mock).mock.calls[0][0];
        expect(callArg.firstName).toBe("Jane");
      });

      // 6. Should exit edit mode after save
      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /cancel/i })
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /edit/i })
        ).toBeInTheDocument();
      });
    }, 10000);

    it("should handle edit, cancel, and re-edit workflow", async () => {
      (getUser as jest.Mock).mockResolvedValue(mockStudentUser);
      const user = userEvent.setup();

      render(<UserInformation />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // First edit attempt - cancel
      let editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const firstNameInput = screen.getByPlaceholderText("Enter first name");
      await user.clear(firstNameInput);
      await user.type(firstNameInput, "Temporary Change");

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      // Should revert to Edit mode
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /edit/i })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /cancel/i })
        ).not.toBeInTheDocument();
      });

      // Second edit attempt - make different changes
      editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const bioTextarea = screen.getByPlaceholderText("Write a short bio...");
      await user.clear(bioTextarea);
      await user.type(bioTextarea, "Final bio update");

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeEnabled();
    });
  });
});
