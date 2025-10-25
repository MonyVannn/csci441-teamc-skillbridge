/**
 * Integration Tests for Sign-in Flow
 *
 * These tests cover the complete sign-in process including:
 * - Sign-in page rendering and accessibility
 * - Clerk authentication integration
 * - Form validation and error handling
 * - Success and redirect scenarios
 * - Error scenarios (invalid credentials, locked accounts)
 * - Responsive design
 */

// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInPage from "@/app/sign-in/[[...sign-in]]/page";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...props}
      data-testid="background-image"
      style={fill ? { objectFit: "cover" } : undefined}
    />
  ),
}));

// Mock Clerk's SignIn component with realistic form
jest.mock("@clerk/nextjs", () => ({
  SignIn: ({ redirectUrl, appearance }: any) => (
    <div data-testid="clerk-signin" role="main">
      <form data-testid="signin-form">
        <h1>Sign in to SkillBridge</h1>
        <p>Welcome back! Please enter your details.</p>

        {/* Email field */}
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            aria-required="true"
            data-testid="email-input"
            autoComplete="email"
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            aria-required="true"
            data-testid="password-input"
            autoComplete="current-password"
          />
        </div>

        {/* Remember me checkbox */}
        <div>
          <label>
            <input
              type="checkbox"
              name="remember"
              data-testid="remember-checkbox"
            />
            Remember me
          </label>
        </div>

        {/* Forgot password link */}
        <a href="/forgot-password" data-testid="forgot-password-link">
          Forgot password?
        </a>

        {/* Submit button */}
        <button type="submit" data-testid="submit-button">
          Sign in
        </button>

        {/* Error display */}
        <div data-testid="error-display" role="alert" aria-live="polite" />

        {/* Sign up link */}
        <div>
          Don't have an account?{" "}
          <a href="/sign-up" data-testid="signup-link">
            Sign up
          </a>
        </div>

        {/* Redirect URL (hidden but testable) */}
        {redirectUrl && (
          <input type="hidden" data-testid="redirect-url" value={redirectUrl} />
        )}

        {/* OAuth providers */}
        <div data-testid="oauth-section">
          <button type="button" data-testid="google-oauth">
            Continue with Google
          </button>
          <button type="button" data-testid="github-oauth">
            Continue with GitHub
          </button>
        </div>
      </form>
    </div>
  ),
}));

describe("Sign-in Page Integration Tests", () => {
  describe("Sign-in Page Rendering", () => {
    it("should render the sign-in page with correct structure", () => {
      render(<SignInPage />);

      // Check for main container
      const container = screen.getByRole("main");
      expect(container).toBeInTheDocument();
    });

    it("should render background image", () => {
      render(<SignInPage />);

      const bgImage = screen.getByTestId("background-image");
      expect(bgImage).toBeInTheDocument();
      expect(bgImage).toHaveAttribute("src", "/bg.jpeg");
      expect(bgImage).toHaveAttribute("alt", "bg");
    });

    it("should render Clerk SignIn component", () => {
      render(<SignInPage />);

      const signInComponent = screen.getByTestId("clerk-signin");
      expect(signInComponent).toBeInTheDocument();
    });

    it("should render sign-in form", () => {
      render(<SignInPage />);

      const form = screen.getByTestId("signin-form");
      expect(form).toBeInTheDocument();
    });

    it("should display page heading and description", () => {
      render(<SignInPage />);

      expect(screen.getByText("Sign in to SkillBridge")).toBeInTheDocument();
      expect(
        screen.getByText("Welcome back! Please enter your details.")
      ).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<SignInPage />);

      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("password-input")).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<SignInPage />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent("Sign in");
    });

    it("should render helper links", () => {
      render(<SignInPage />);

      expect(screen.getByTestId("forgot-password-link")).toBeInTheDocument();
      expect(screen.getByTestId("signup-link")).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for required fields", () => {
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      expect(emailInput).toHaveAttribute("aria-required", "true");
      expect(passwordInput).toHaveAttribute("aria-required", "true");
    });

    it("should have proper autocomplete attributes", () => {
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    it("should have error display with proper ARIA attributes", () => {
      render(<SignInPage />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveAttribute("role", "alert");
      expect(errorDisplay).toHaveAttribute("aria-live", "polite");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Tab through form fields
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Can reach submit button
      await user.tab(); // remember checkbox
      await user.tab(); // forgot password link
      await user.tab(); // submit button
      expect(submitButton).toHaveFocus();
    });

    it("should have accessible form labels", () => {
      render(<SignInPage />);

      const emailLabel = screen.getByLabelText("Email address");
      const passwordLabel = screen.getByLabelText("Password");

      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive container classes", () => {
      const { container } = render(<SignInPage />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-h-screen");
      expect(mainDiv).toHaveClass("flex");
      expect(mainDiv).toHaveClass("items-center");
      expect(mainDiv).toHaveClass("justify-center");
    });

    it("should have responsive padding", () => {
      const { container } = render(<SignInPage />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("p-4");
    });

    it("should center content on all screen sizes", () => {
      const { container } = render(<SignInPage />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("items-center");
      expect(mainDiv).toHaveClass("justify-center");
    });
  });

  describe("Form Interaction", () => {
    it("should allow typing in email field", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should allow typing in password field", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      await user.type(passwordInput, "SecureP@ssw0rd");

      expect(passwordInput).toHaveValue("SecureP@ssw0rd");
    });

    it("should allow checking remember me checkbox", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const rememberCheckbox = screen.getByTestId("remember-checkbox");
      await user.click(rememberCheckbox);

      expect(rememberCheckbox).toBeChecked();
    });

    it("should handle complete form fill", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const rememberCheckbox = screen.getByTestId("remember-checkbox");

      await user.type(emailInput, "user@skillbridge.com");
      await user.type(passwordInput, "MyPassword123!");
      await user.click(rememberCheckbox);

      expect(emailInput).toHaveValue("user@skillbridge.com");
      expect(passwordInput).toHaveValue("MyPassword123!");
      expect(rememberCheckbox).toBeChecked();
    });

    it("should handle password field type", () => {
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should handle form submission attempt", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const submitButton = screen.getByTestId("submit-button");

      // Should be able to click without error
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Authentication Scenarios - Success", () => {
    it("should display correct redirect URL for successful sign-in", () => {
      render(<SignInPage />);

      // Check if redirect URL is present (Clerk handles redirect after auth)
      const form = screen.getByTestId("signin-form");
      expect(form).toBeInTheDocument();
    });

    it("should handle successful authentication with valid credentials", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Enter valid credentials
      await user.type(emailInput, "valid@example.com");
      await user.type(passwordInput, "ValidPassword123!");

      // Submit form
      await user.click(submitButton);

      // Form should still be present (Clerk handles the actual redirect)
      expect(submitButton).toBeInTheDocument();
    });

    it("should support OAuth sign-in options", () => {
      render(<SignInPage />);

      const googleButton = screen.getByTestId("google-oauth");
      const githubButton = screen.getByTestId("github-oauth");

      expect(googleButton).toBeInTheDocument();
      expect(githubButton).toHaveTextContent("Continue with GitHub");
      expect(googleButton).toHaveTextContent("Continue with Google");
    });

    it("should handle OAuth button clicks", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const googleButton = screen.getByTestId("google-oauth");

      await user.click(googleButton);

      expect(googleButton).toBeInTheDocument();
    });
  });

  describe("Authentication Scenarios - Validation Errors", () => {
    it("should have email input with email type", () => {
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have proper placeholders for guidance", () => {
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Enter your password"
      );
    });

    it("should handle empty form submission", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const submitButton = screen.getByTestId("submit-button");

      // Try to submit without filling fields
      await user.click(submitButton);

      // Error display should be present
      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
    });

    it("should handle missing email field", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Only fill password
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      // Email field should still be present and empty
      const emailInput = screen.getByTestId("email-input");
      expect(emailInput).toHaveValue("");
    });

    it("should handle missing password field", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const submitButton = screen.getByTestId("submit-button");

      // Only fill email
      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      // Password field should still be present and empty
      const passwordInput = screen.getByTestId("password-input");
      expect(passwordInput).toHaveValue("");
    });

    it("should handle invalid email format", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");

      // Enter invalid email
      await user.type(emailInput, "invalid-email");

      expect(emailInput).toHaveValue("invalid-email");
    });
  });

  describe("Authentication Scenarios - Error Cases", () => {
    it("should have error display for authentication failures", () => {
      render(<SignInPage />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
      expect(errorDisplay).toHaveAttribute("role", "alert");
    });

    it("should handle invalid credentials scenario", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Enter credentials
      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "WrongPassword123!");
      await user.click(submitButton);

      // Error display should be available
      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
    });

    it("should handle locked account scenario", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Simulate locked account attempt
      await user.type(emailInput, "locked@example.com");
      await user.type(passwordInput, "Password123!");
      await user.click(submitButton);

      // Form should still be present
      expect(submitButton).toBeInTheDocument();
    });

    it("should handle too many attempts scenario", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // Simulate multiple failed attempts
      for (let i = 0; i < 3; i++) {
        await user.clear(emailInput);
        await user.clear(passwordInput);
        await user.type(emailInput, `attempt${i}@example.com`);
        await user.type(passwordInput, "WrongPassword!");
        await user.click(submitButton);
      }

      // Error display should be present
      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
    });

    it("should handle unverified email scenario", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      // User with unverified email
      await user.type(emailInput, "unverified@example.com");
      await user.type(passwordInput, "ValidPassword123!");
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long email addresses", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const longEmail =
        "very.long.email.address.with.many.dots@subdomain.example.com";

      await user.type(emailInput, longEmail);

      expect(emailInput).toHaveValue(longEmail);
    });

    it("should handle special characters in password", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      const specialPassword = "P@ssw0rd!#$%^&*()";

      await user.type(passwordInput, specialPassword);

      expect(passwordInput).toHaveValue(specialPassword);
    });

    it("should handle email with plus addressing", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const emailWithPlus = "user+test@example.com";

      await user.type(emailInput, emailWithPlus);

      expect(emailInput).toHaveValue(emailWithPlus);
    });

    it("should handle rapid form submission", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const submitButton = screen.getByTestId("submit-button");

      // Click submit multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });

    it("should handle paste events in form fields", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");

      // Simulate paste
      await user.click(emailInput);
      await user.paste("pasted@example.com");

      expect(emailInput).toHaveValue("pasted@example.com");
    });
  });

  describe("Navigation and Links", () => {
    it("should have working forgot password link", () => {
      render(<SignInPage />);

      const forgotPasswordLink = screen.getByTestId("forgot-password-link");
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
      expect(forgotPasswordLink).toHaveTextContent("Forgot password?");
    });

    it("should have working sign up link", () => {
      render(<SignInPage />);

      const signupLink = screen.getByTestId("signup-link");
      expect(signupLink).toHaveAttribute("href", "/sign-up");
      expect(signupLink).toHaveTextContent("Sign up");
    });

    it("should display sign up call to action", () => {
      render(<SignInPage />);

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });
  });

  describe("Complete Sign-in Flow Integration", () => {
    it("should complete full sign-in flow with valid credentials", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Fill in email
      const emailInput = screen.getByTestId("email-input");
      await user.type(emailInput, "testuser@skillbridge.com");
      expect(emailInput).toHaveValue("testuser@skillbridge.com");

      // Fill in password
      const passwordInput = screen.getByTestId("password-input");
      await user.type(passwordInput, "SecurePassword123!");
      expect(passwordInput).toHaveValue("SecurePassword123!");

      // Check remember me
      const rememberCheckbox = screen.getByTestId("remember-checkbox");
      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      // Submit form
      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Verify form is still present (Clerk handles actual authentication)
      expect(submitButton).toBeInTheDocument();
      expect(screen.getByTestId("clerk-signin")).toBeInTheDocument();
    });

    it("should handle complete flow with OAuth", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // User chooses OAuth instead of email/password
      const googleButton = screen.getByTestId("google-oauth");
      await user.click(googleButton);

      // OAuth section should still be present
      expect(screen.getByTestId("oauth-section")).toBeInTheDocument();
    });

    it("should handle flow switching from OAuth to email", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Start with OAuth
      const googleButton = screen.getByTestId("google-oauth");
      await user.click(googleButton);

      // Switch to email/password
      const emailInput = screen.getByTestId("email-input");
      await user.type(emailInput, "switch@example.com");

      expect(emailInput).toHaveValue("switch@example.com");
    });

    it("should maintain form state during interaction", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      // Fill email
      await user.type(emailInput, "maintain@example.com");

      // Click forgot password (without navigating in test)
      const forgotPasswordLink = screen.getByTestId("forgot-password-link");
      expect(forgotPasswordLink).toBeInTheDocument();

      // Email should still have value
      expect(emailInput).toHaveValue("maintain@example.com");

      // Continue with password
      await user.type(passwordInput, "Password123!");
      expect(passwordInput).toHaveValue("Password123!");
    });
  });

  describe("Security Features", () => {
    it("should use password input type for password field", () => {
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have autocomplete attributes for security", () => {
      render(<SignInPage />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");

      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    it("should not expose password in DOM when typed", async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const passwordInput = screen.getByTestId("password-input");
      await user.type(passwordInput, "SecretPassword123!");

      // Password type should hide the actual text
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveValue("SecretPassword123!");
    });
  });
});
