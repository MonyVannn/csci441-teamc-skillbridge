import { renderHook, waitFor } from "@testing-library/react";
import { useUserAuth } from "@/lib/stores/userStore";
import { useAuth, useUser } from "@clerk/nextjs";

// Mock Clerk hooks
jest.mock("@clerk/nextjs", () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

describe("useUserAuth custom hook", () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication states", () => {
    it("should return authenticated state when user is signed in", () => {
      // Mock authenticated state
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: {
          id: "user_123",
          firstName: "John",
          lastName: "Doe",
        },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeDefined();
      expect(result.current.userId).toBe("user_123");
    });

    it("should return unauthenticated state when user is not signed in", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.userId).toBeUndefined();
    });

    it("should return loading state when auth is not loaded", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: undefined,
        isLoaded: false,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.userId).toBeUndefined();
    });
  });

  describe("edge cases and null handling", () => {
    it("should handle null isSignedIn gracefully", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: null,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle undefined isSignedIn gracefully", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: undefined,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle user without id", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: {
          firstName: "John",
          lastName: "Doe",
        },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.userId).toBeUndefined();
    });
  });

  describe("user object properties", () => {
    it("should return complete user object with all properties", () => {
      const mockUser = {
        id: "user_123",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [{ emailAddress: "john@example.com" }],
        imageUrl: "https://example.com/image.jpg",
      };

      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: mockUser,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userId).toBe("user_123");
    });

    it("should handle minimal user object", () => {
      const minimalUser = {
        id: "user_456",
      };

      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: minimalUser,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.user).toEqual(minimalUser);
      expect(result.current.userId).toBe("user_456");
    });
  });

  describe("loading transitions", () => {
    it("should transition from loading to authenticated", async () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        isSignedIn: undefined,
        isLoaded: false,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
      } as any);

      const { result, rerender } = renderHook(() => useUserAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);

      // Transition to authenticated
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should transition from loading to unauthenticated", async () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        isSignedIn: undefined,
        isLoaded: false,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
      } as any);

      const { result, rerender } = renderHook(() => useUserAuth());

      expect(result.current.isLoading).toBe(true);

      // Transition to unauthenticated
      mockUseAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe("return value structure", () => {
    it("should always return all expected properties", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("userId");
    });

    it("should return object with correct types", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(typeof result.current.isAuthenticated).toBe("boolean");
      expect(typeof result.current.isLoading).toBe("boolean");
      expect(typeof result.current.userId).toBe("string");
    });
  });

  describe("consistency checks", () => {
    it("should maintain consistency between isAuthenticated and user presence", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      if (result.current.isAuthenticated) {
        expect(result.current.user).toBeDefined();
      }
    });

    it("should not be authenticated and loading at the same time when loaded", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      if (result.current.isAuthenticated) {
        expect(result.current.isLoading).toBe(false);
      }
    });
  });

  describe("hook behavior with different user states", () => {
    it("should handle user sign-out scenario", () => {
      // User signs out
      mockUseAuth.mockReturnValue({
        isSignedIn: false,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.userId).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle multiple rapid rerenders", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      const { result, rerender } = renderHook(() => useUserAuth());

      // Multiple rerenders should produce consistent results
      const firstResult = result.current;
      rerender();
      rerender();
      rerender();

      expect(result.current.isAuthenticated).toBe(firstResult.isAuthenticated);
      expect(result.current.userId).toBe(firstResult.userId);
    });
  });

  describe("error scenarios", () => {
    it("should handle when useAuth returns unexpected values", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: "invalid" as any,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      // The implementation uses ?? false, so non-null truthy values will pass through
      // This test documents actual behavior
      expect(result.current.isAuthenticated).toBeTruthy();
    });

    it("should handle when useUser returns undefined user", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: undefined,
        isLoaded: true,
      } as any);

      const { result } = renderHook(() => useUserAuth());

      expect(result.current.user).toBeUndefined();
      expect(result.current.userId).toBeUndefined();
    });
  });

  describe("integration with Clerk hooks", () => {
    it("should call useAuth hook", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      renderHook(() => useUserAuth());

      expect(mockUseAuth).toHaveBeenCalled();
    });

    it("should call useUser hook", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      renderHook(() => useUserAuth());

      expect(mockUseUser).toHaveBeenCalled();
    });

    it("should call both hooks exactly once per render", () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        isLoaded: true,
      } as any);

      mockUseUser.mockReturnValue({
        user: { id: "user_123" },
        isLoaded: true,
      } as any);

      renderHook(() => useUserAuth());

      expect(mockUseAuth).toHaveBeenCalledTimes(1);
      expect(mockUseUser).toHaveBeenCalledTimes(1);
    });
  });
});
