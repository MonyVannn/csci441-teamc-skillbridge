import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Store the handler function and route matcher
let middlewareHandler: any;
const mockIsPublicRoute = jest.fn();

// Mock Clerk middleware
jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: jest.fn((handler) => {
    middlewareHandler = handler;
    return handler;
  }),
  createRouteMatcher: jest.fn(() => mockIsPublicRoute),
}));

// Load middleware to initialize mocks
require("@/middleware");

describe("Middleware", () => {
  let mockAuth: any;
  let mockReq: any;
  let mockProtect: jest.Mock;

  beforeEach(() => {
    // Clear only mockIsPublicRoute to preserve clerk middleware calls
    mockIsPublicRoute.mockClear();

    // Setup mock protect function
    mockProtect = jest.fn().mockResolvedValue(undefined);

    // Setup mock auth object
    mockAuth = {
      protect: mockProtect,
      userId: null,
      sessionId: null,
    };

    // Setup mock request
    mockReq = {
      url: "http://localhost:3000/",
      nextUrl: {
        pathname: "/",
        origin: "http://localhost:3000",
        search: "",
        searchParams: new URLSearchParams(),
        href: "http://localhost:3000/",
      },
      headers: new Headers(),
      method: "GET",
    };
  });

  describe("Route Matching Configuration", () => {
    it("should create route matcher with correct public routes", () => {
      expect(createRouteMatcher).toHaveBeenCalledWith([
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/",
        "/api/webhooks(.*)",
        "/profile(.*)",
      ]);
    });

    it("should have correct matcher config for static files and API routes", () => {
      const middleware = require("@/middleware");

      expect(middleware.config.matcher).toEqual([
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
      ]);
    });
  });

  describe("Public Routes - No Authentication Required", () => {
    it("should allow access to sign-in page without authentication", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/sign-in";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to sign-up page without authentication", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/sign-up";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to homepage without authentication", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to webhook API routes without authentication", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/api/webhooks/clerk";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to profile pages without authentication", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/profile/user-123";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to nested sign-in routes", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/sign-in/sso-callback";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should allow access to nested sign-up routes", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/sign-up/verify-email";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).not.toHaveBeenCalled();
    });
  });

  describe("Protected Routes - Authentication Required", () => {
    it("should require authentication for project detail page", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/project/123";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).toHaveBeenCalled();
    });

    it("should require authentication for settings/dashboard routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/dashboard";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).toHaveBeenCalled();
    });

    it("should require authentication for custom API routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/api/projects";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
      expect(mockProtect).toHaveBeenCalled();
    });

    it("should call protect() exactly once for protected routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/project/456";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).toHaveBeenCalledTimes(1);
    });

    it("should await protect() call for protected routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/settings";

      let protectResolved = false;
      mockProtect.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        protectResolved = true;
      });

      await middlewareHandler(mockAuth, mockReq);

      expect(protectResolved).toBe(true);
    });
  });

  describe("Route Protection Logic", () => {
    it("should not call protect() for public routes", async () => {
      const publicRoutes = [
        "/",
        "/sign-in",
        "/sign-up",
        "/api/webhooks/clerk",
        "/profile/user-123",
      ];

      for (const route of publicRoutes) {
        jest.clearAllMocks();
        mockIsPublicRoute.mockReturnValue(true);
        mockReq.nextUrl.pathname = route;

        await middlewareHandler(mockAuth, mockReq);

        expect(mockProtect).not.toHaveBeenCalled();
      }
    });

    it("should call protect() for all non-public routes", async () => {
      const protectedRoutes = [
        "/project/123",
        "/dashboard",
        "/settings",
        "/api/projects",
        "/api/users",
      ];

      for (const route of protectedRoutes) {
        jest.clearAllMocks();
        mockIsPublicRoute.mockReturnValue(false);
        mockReq.nextUrl.pathname = route;

        await middlewareHandler(mockAuth, mockReq);

        expect(mockProtect).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle undefined pathname gracefully", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl = undefined;

      await expect(middlewareHandler(mockAuth, mockReq)).resolves.not.toThrow();
    });

    it("should handle protect() throwing error", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/protected-route";
      mockProtect.mockRejectedValue(new Error("Unauthorized"));

      await expect(middlewareHandler(mockAuth, mockReq)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle route matcher returning undefined", async () => {
      mockIsPublicRoute.mockReturnValue(undefined);
      mockReq.nextUrl.pathname = "/some-route";

      // Undefined is falsy, so protect should be called
      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).toHaveBeenCalled();
    });

    it("should handle empty pathname", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
    });

    it("should handle query parameters in URL", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/sign-in";
      mockReq.nextUrl.search = "?redirect=/dashboard";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).not.toHaveBeenCalled();
    });
  });

  describe("Matcher Configuration - Static Files", () => {
    it("should exclude Next.js internal files from middleware", () => {
      const middleware = require("@/middleware");
      const matcher = middleware.config.matcher[0];

      expect(matcher).toContain("(?!_next");
    });

    it("should exclude common static file extensions", () => {
      const middleware = require("@/middleware");
      const matcher = middleware.config.matcher[0];

      // Test for compressed patterns (jpe?g instead of jpg, jpeg separately)
      const patterns = ["html?", "css", "jpe?g", "webp", "png", "gif", "svg"];

      patterns.forEach((pattern) => {
        expect(matcher).toContain(pattern);
      });
    });

    it("should include json files (js(?!on) - negative lookahead)", () => {
      const middleware = require("@/middleware");
      const matcher = middleware.config.matcher[0];

      expect(matcher).toContain("js(?!on)");
    });

    it("should always run for API routes", () => {
      const middleware = require("@/middleware");
      const matcher = middleware.config.matcher[1];

      expect(matcher).toBe("/(api|trpc)(.*)");
    });
  });

  describe("Authentication Context", () => {
    it("should receive auth object with protect method", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/protected";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockAuth.protect).toBeDefined();
      expect(typeof mockAuth.protect).toBe("function");
    });

    it("should receive request object", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
    });

    it("should work with different HTTP methods", async () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        jest.clearAllMocks();
        mockIsPublicRoute.mockReturnValue(false);
        mockReq.method = method;
        mockReq.nextUrl.pathname = "/api/projects";

        await middlewareHandler(mockAuth, mockReq);

        expect(mockProtect).toHaveBeenCalled();
      }
    });
  });

  describe("Routing Behavior", () => {
    it("should handle root path correctly", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("should handle deeply nested routes", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/project/123/applications/456/details";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).toHaveBeenCalled();
    });

    it("should handle routes with special characters", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/project/test-123_abc";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockIsPublicRoute).toHaveBeenCalledWith(mockReq);
    });

    it("should handle trailing slashes", async () => {
      mockIsPublicRoute.mockReturnValue(true);
      mockReq.nextUrl.pathname = "/profile/user-123/";

      await middlewareHandler(mockAuth, mockReq);

      expect(mockProtect).not.toHaveBeenCalled();
    });
  });

  describe("Async Behavior", () => {
    it("should handle middleware as async function", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/dashboard";

      const result = middlewareHandler(mockAuth, mockReq);

      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it("should wait for protect() to complete before proceeding", async () => {
      mockIsPublicRoute.mockReturnValue(false);
      mockReq.nextUrl.pathname = "/protected";

      let protectCalled = false;
      let handlerCompleted = false;

      mockProtect.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        protectCalled = true;
      });

      await middlewareHandler(mockAuth, mockReq);
      handlerCompleted = true;

      // If we reach here, the handler awaited protect()
      expect(protectCalled).toBe(true);
      expect(handlerCompleted).toBe(true);
    });
  });

  describe("Integration with clerkMiddleware", () => {
    it("should wrap handler with clerkMiddleware", () => {
      // The middleware handler should be defined (captured during module load)
      expect(middlewareHandler).toBeDefined();
      expect(typeof middlewareHandler).toBe("function");
    });

    it("should export middleware as default export", () => {
      const middleware = require("@/middleware");

      expect(middleware.default).toBeDefined();
    });

    it("should export config object", () => {
      const middleware = require("@/middleware");

      expect(middleware.config).toBeDefined();
      expect(middleware.config.matcher).toBeDefined();
      expect(Array.isArray(middleware.config.matcher)).toBe(true);
    });
  });
});
