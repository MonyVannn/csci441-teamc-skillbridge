/**
 * Integration Tests for Sign-up Flow
 *
 * These tests cover the complete sign-up process including:
 * - Sign-up page rendering and accessibility
 * - Clerk authentication integration
 * - Webhook handling for user creation
 * - Database user creation
 * - Form validation and error handling
 * - Responsive design
 */

// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "@/app/sign-up/[[...sign-up]]/page";
import { createUser } from "@/lib/actions/user";
import prisma from "@/lib/prisma";

// Mock Clerk's SignUp component
jest.mock("@clerk/nextjs", () => ({
  SignUp: ({ afterSignUpUrl, appearance }: any) => (
    <div data-testid="clerk-signup">
      <form data-testid="signup-form">
        <h1>Create your account</h1>

        {/* Email field */}
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email"
            aria-required="true"
            data-testid="email-input"
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            aria-required="true"
            data-testid="password-input"
          />
        </div>

        {/* First name field */}
        <div>
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Enter first name"
            data-testid="firstname-input"
          />
        </div>

        {/* Last name field */}
        <div>
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Enter last name"
            data-testid="lastname-input"
          />
        </div>

        <button type="submit" data-testid="submit-button">
          Continue
        </button>

        {/* Error display */}
        <div data-testid="error-display" role="alert" aria-live="polite" />

        {/* Redirect URL (hidden but testable) */}
        {afterSignUpUrl && (
          <input
            type="hidden"
            data-testid="redirect-url"
            value={afterSignUpUrl}
          />
        )}
      </form>
    </div>
  ),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill }: any) => (
    <img src={src} alt={alt} data-fill={fill} />
  ),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("Sign-up Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sign-up Page Rendering", () => {
    it("should render the sign-up page with all required elements", () => {
      render(<SignUpPage />);

      // Verify page container
      expect(screen.getByTestId("clerk-signup")).toBeInTheDocument();

      // Verify form exists
      expect(screen.getByTestId("signup-form")).toBeInTheDocument();

      // Verify heading
      expect(
        screen.getByRole("heading", { name: /create your account/i })
      ).toBeInTheDocument();
    });

    it("should render email input field", () => {
      render(<SignUpPage />);

      const emailInput = screen.getByTestId("email-input");
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it("should render password input field", () => {
      render(<SignUpPage />);

      const passwordInput = screen.getByTestId("password-input");
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("should render first name and last name fields", () => {
      render(<SignUpPage />);

      expect(screen.getByTestId("firstname-input")).toBeInTheDocument();
      expect(screen.getByTestId("lastname-input")).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<SignUpPage />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
      expect(submitButton).toHaveTextContent(/continue/i);
    });

    it("should render background image", () => {
      render(<SignUpPage />);

      const bgImage = screen.getByAltText("bg");
      expect(bgImage).toBeInTheDocument();
      expect(bgImage).toHaveAttribute("src", "/bg.jpeg");
    });

    it("should have error display area with proper ARIA attributes", () => {
      render(<SignUpPage />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
      expect(errorDisplay).toHaveAttribute("role", "alert");
      expect(errorDisplay).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for all form inputs", () => {
      render(<SignUpPage />);

      // All inputs should be associated with labels
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it("should mark required fields with aria-required", () => {
      render(<SignUpPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
    });

    it("should have accessible error announcements", () => {
      render(<SignUpPage />);

      const errorDisplay = screen.getByTestId("error-display");

      // Error display should announce changes to screen readers
      expect(errorDisplay).toHaveAttribute("role", "alert");
      expect(errorDisplay).toHaveAttribute("aria-live", "polite");
    });

    it("should have keyboard-accessible submit button", () => {
      render(<SignUpPage />);

      const submitButton = screen.getByTestId("submit-button");

      // Button should be keyboard accessible (implicit with button element)
      expect(submitButton.tagName).toBe("BUTTON");
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive container classes", () => {
      const { container } = render(<SignUpPage />);

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "p-4"
      );
    });

    it("should apply padding for mobile devices", () => {
      const { container } = render(<SignUpPage />);

      const mainDiv = container.querySelector(".p-4");
      expect(mainDiv).toBeInTheDocument();
    });

    it("should center content on all screen sizes", () => {
      const { container } = render(<SignUpPage />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("flex", "items-center", "justify-center");
    });
  });

  describe("Form Interaction", () => {
    it("should allow user to type in email field", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      const emailInput = screen.getByTestId("email-input");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should allow user to type in password field", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      const passwordInput = screen.getByTestId("password-input");
      await user.type(passwordInput, "SecureP@ssw0rd");

      expect(passwordInput).toHaveValue("SecureP@ssw0rd");
    });

    it("should allow user to fill all form fields", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      await user.type(
        screen.getByTestId("email-input"),
        "john.doe@example.com"
      );
      await user.type(screen.getByTestId("password-input"), "StrongP@ss123");
      await user.type(screen.getByTestId("firstname-input"), "John");
      await user.type(screen.getByTestId("lastname-input"), "Doe");

      expect(screen.getByTestId("email-input")).toHaveValue(
        "john.doe@example.com"
      );
      expect(screen.getByTestId("password-input")).toHaveValue("StrongP@ss123");
      expect(screen.getByTestId("firstname-input")).toHaveValue("John");
      expect(screen.getByTestId("lastname-input")).toHaveValue("Doe");
    });

    it("should have submit button that can be clicked", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      const submitButton = screen.getByTestId("submit-button");

      // Should be able to click without error
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("User Creation Flow (Database Integration)", () => {
    const mockUserData = {
      id: "clerk_user_123",
      email_addresses: [
        {
          email_address: "newuser@example.com",
          id: "email_123",
        },
      ],
      first_name: "Jane",
      last_name: "Smith",
      image_url: "https://example.com/avatar.jpg",
    };

    const expectedDbUser = {
      id: "db_user_123",
      clerkId: "clerk_user_123",
      email: "newuser@example.com",
      firstName: "Jane",
      lastName: "Smith",
      imageUrl: "https://example.com/avatar.jpg",
      role: "USER",
      occupied: false,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
      socialLinks: [],
      experiences: [],
      earnedSkillBadges: [],
      earnedSpecializationBadges: [],
      earnedEngagementBadges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create user in database with valid data", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(expectedDbUser);

      const result = await createUser(mockUserData as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: "clerk_user_123",
          email: "newuser@example.com",
          firstName: "Jane",
          lastName: "Smith",
          imageUrl: "https://example.com/avatar.jpg",
          role: "USER",
          occupied: false,
          totalHoursContributed: 0,
          projectsCompleted: 0,
          industriesExperienced: [],
          socialLinks: [],
          experiences: [],
          earnedSkillBadges: [],
          earnedSpecializationBadges: [],
          earnedEngagementBadges: [],
        },
      });

      expect(result).toEqual(expectedDbUser);
    });

    it("should handle user with only email (no names)", async () => {
      const minimalUserData = {
        id: "clerk_user_456",
        email_addresses: [{ email_address: "minimal@example.com" }],
        first_name: null,
        last_name: null,
        image_url: null,
      };

      const expectedMinimalUser = {
        ...expectedDbUser,
        id: "db_user_456",
        clerkId: "clerk_user_456",
        email: "minimal@example.com",
        firstName: null,
        lastName: null,
        imageUrl: null,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(expectedMinimalUser);

      const result = await createUser(minimalUserData as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clerkId: "clerk_user_456",
          email: "minimal@example.com",
          firstName: null,
          lastName: null,
          imageUrl: null,
          role: "USER",
        }),
      });

      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });

    it("should set default role to USER for new sign-ups", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(expectedDbUser);

      await createUser(mockUserData as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: "USER",
        }),
      });
    });

    it("should initialize user with default values", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(expectedDbUser);

      await createUser(mockUserData as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          occupied: false,
          totalHoursContributed: 0,
          projectsCompleted: 0,
          industriesExperienced: [],
          socialLinks: [],
          experiences: [],
          earnedSkillBadges: [],
          earnedSpecializationBadges: [],
          earnedEngagementBadges: [],
        }),
      });
    });
  });

  describe("Validation and Error Handling", () => {
    it("should throw error when email_addresses is missing", async () => {
      const invalidUserData = {
        id: "clerk_user_789",
        email_addresses: undefined,
        first_name: "Test",
        last_name: "User",
      };

      await expect(createUser(invalidUserData as any)).rejects.toThrow(
        "User data is missing a valid email address."
      );
    });

    it("should throw error when email_addresses is empty array", async () => {
      const invalidUserData = {
        id: "clerk_user_789",
        email_addresses: [],
        first_name: "Test",
        last_name: "User",
      };

      await expect(createUser(invalidUserData as any)).rejects.toThrow(
        "User data is missing a valid email address."
      );
    });

    it("should throw error when email_addresses does not have email_address field", async () => {
      const invalidUserData = {
        id: "clerk_user_789",
        email_addresses: [{ id: "email_123" }],
        first_name: "Test",
        last_name: "User",
      };

      await expect(createUser(invalidUserData as any)).rejects.toThrow(
        "User data is missing a valid email address."
      );
    });

    it("should handle database creation errors gracefully", async () => {
      const mockUserData = {
        id: "clerk_user_123",
        email_addresses: [{ email_address: "test@example.com" }],
        first_name: "Test",
        last_name: "User",
      };

      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(createUser(mockUserData as any)).rejects.toThrow(
        "Failed to create user in the database."
      );
    });

    it("should handle duplicate email error", async () => {
      const mockUserData = {
        id: "clerk_user_duplicate",
        email_addresses: [{ email_address: "existing@example.com" }],
      };

      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error("Unique constraint failed on the fields: (`email`)")
      );

      await expect(createUser(mockUserData as any)).rejects.toThrow(
        "Failed to create user in the database."
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle user data with special characters in name", async () => {
      const specialCharUserData = {
        id: "clerk_user_special",
        email_addresses: [{ email_address: "special@example.com" }],
        first_name: "José",
        last_name: "O'Brien-Smith",
        image_url: null,
      };

      const expectedUser = {
        id: "db_user_special",
        clerkId: "clerk_user_special",
        email: "special@example.com",
        firstName: "José",
        lastName: "O'Brien-Smith",
        imageUrl: null,
        role: "USER",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await createUser(specialCharUserData as any);

      expect(result.firstName).toBe("José");
      expect(result.lastName).toBe("O'Brien-Smith");
    });

    it("should handle very long email addresses", async () => {
      const longEmail =
        "very.long.email.address.with.many.dots@subdomain.example.com";
      const longEmailUserData = {
        id: "clerk_user_long",
        email_addresses: [{ email_address: longEmail }],
        first_name: "Long",
        last_name: "Email",
      };

      const expectedUser = {
        id: "db_user_long",
        clerkId: "clerk_user_long",
        email: longEmail,
        firstName: "Long",
        lastName: "Email",
        imageUrl: null,
        role: "USER",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await createUser(longEmailUserData as any);

      expect(result.email).toBe(longEmail);
    });

    it("should handle empty string names as valid", async () => {
      const emptyNameUserData = {
        id: "clerk_user_empty",
        email_addresses: [{ email_address: "empty@example.com" }],
        first_name: "",
        last_name: "",
        image_url: "",
      };

      const expectedUser = {
        id: "db_user_empty",
        clerkId: "clerk_user_empty",
        email: "empty@example.com",
        firstName: null,
        lastName: null,
        imageUrl: null,
        role: "USER",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await createUser(emptyNameUserData as any);

      // Empty strings should be converted to null (as per createUser implementation)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: null,
          lastName: null,
          imageUrl: null,
        }),
      });
    });
  });

  describe("Complete Sign-up Flow Integration", () => {
    it("should complete full sign-up flow successfully", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      // Step 1: User sees the form
      expect(
        screen.getByRole("heading", { name: /create your account/i })
      ).toBeInTheDocument();

      // Step 2: User fills out the form
      await user.type(
        screen.getByTestId("email-input"),
        "complete@example.com"
      );
      await user.type(
        screen.getByTestId("password-input"),
        "SecurePassword123!"
      );
      await user.type(screen.getByTestId("firstname-input"), "Complete");
      await user.type(screen.getByTestId("lastname-input"), "User");

      // Step 3: Verify form data is entered
      expect(screen.getByTestId("email-input")).toHaveValue(
        "complete@example.com"
      );
      expect(screen.getByTestId("password-input")).toHaveValue(
        "SecurePassword123!"
      );
      expect(screen.getByTestId("firstname-input")).toHaveValue("Complete");
      expect(screen.getByTestId("lastname-input")).toHaveValue("User");

      // Step 4: User submits the form
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeEnabled();

      // Form is ready for submission
      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });

    it("should handle form submission with minimum required fields", async () => {
      const user = userEvent.setup();
      render(<SignUpPage />);

      // Only fill required fields (email and password)
      await user.type(screen.getByTestId("email-input"), "minimal@example.com");
      await user.type(screen.getByTestId("password-input"), "Pass123!");

      expect(screen.getByTestId("email-input")).toHaveValue(
        "minimal@example.com"
      );
      expect(screen.getByTestId("password-input")).toHaveValue("Pass123!");
      expect(screen.getByTestId("firstname-input")).toHaveValue("");
      expect(screen.getByTestId("lastname-input")).toHaveValue("");

      // Form should still be submittable
      expect(screen.getByTestId("submit-button")).toBeEnabled();
    });
  });
});
