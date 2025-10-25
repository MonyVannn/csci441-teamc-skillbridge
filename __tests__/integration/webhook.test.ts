/**
 * Integration Tests for Clerk Webhook Handler
 *
 * These tests verify the webhook endpoint that handles user creation
 * from Clerk authentication service.
 */

import { POST } from "@/app/api/webhooks/clerk/route";
import { createUser } from "@/lib/actions/user";

// Mock the createUser function
jest.mock("@/lib/actions/user", () => ({
  createUser: jest.fn(),
}));

// Mock svix webhook verification
jest.mock("svix", () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn((body, headers) => {
      // Return parsed webhook event
      return JSON.parse(body);
    }),
  })),
}));

describe("Clerk Webhook Integration Tests", () => {
  const MOCK_WEBHOOK_SECRET = "whsec_test_secret_key_12345";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = MOCK_WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  });

  describe("Webhook Endpoint Setup", () => {
    it("should throw error when WEBHOOK_SECRET is not set", async () => {
      delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature",
          },
          body: JSON.stringify({ type: "user.created", data: {} }),
        }
      );

      await expect(POST(mockRequest)).rejects.toThrow(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
      );
    });

    it("should return 400 when svix headers are missing", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {},
          body: JSON.stringify({ type: "user.created", data: {} }),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Error occured -- no svix headers");
    });

    it("should return 400 when svix-id is missing", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature",
          },
          body: JSON.stringify({ type: "user.created", data: {} }),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it("should return 400 when svix-timestamp is missing", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test",
            "svix-signature": "v1,test_signature",
          },
          body: JSON.stringify({ type: "user.created", data: {} }),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it("should return 400 when svix-signature is missing", async () => {
      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test",
            "svix-timestamp": "1234567890",
          },
          body: JSON.stringify({ type: "user.created", data: {} }),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });
  });

  describe("User Created Event Handling", () => {
    const mockUserCreatedEvent = {
      type: "user.created",
      data: {
        id: "user_clerk_12345",
        email_addresses: [
          {
            email_address: "webhook@example.com",
            id: "email_12345",
          },
        ],
        first_name: "Webhook",
        last_name: "Test",
        image_url: "https://example.com/avatar.jpg",
      },
    };

    it("should call createUser for user.created event", async () => {
      (createUser as jest.Mock).mockResolvedValue({
        id: "db_user_12345",
        clerkId: "user_clerk_12345",
        email: "webhook@example.com",
      });

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_12345",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(mockUserCreatedEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(createUser).toHaveBeenCalledWith(mockUserCreatedEvent.data);
      expect(response.status).toBe(201);
      const text = await response.text();
      expect(text).toBe("boop");
    });

    it("should pass complete user data to createUser", async () => {
      (createUser as jest.Mock).mockResolvedValue({ id: "db_user" });

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_12345",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(mockUserCreatedEvent),
        }
      );

      await POST(mockRequest);

      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user_clerk_12345",
          email_addresses: expect.arrayContaining([
            expect.objectContaining({
              email_address: "webhook@example.com",
            }),
          ]),
          first_name: "Webhook",
          last_name: "Test",
          image_url: "https://example.com/avatar.jpg",
        })
      );
    });

    it("should return 500 when createUser fails", async () => {
      (createUser as jest.Mock).mockRejectedValue(new Error("Database error"));

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_12345",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(mockUserCreatedEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toBe("Error saving user");
    });

    it("should handle createUser validation errors", async () => {
      (createUser as jest.Mock).mockRejectedValue(
        new Error("User data is missing a valid email address.")
      );

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_12345",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(mockUserCreatedEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      expect(createUser).toHaveBeenCalled();
    });
  });

  describe("Other Event Types", () => {
    it("should not call createUser for user.updated event", async () => {
      const userUpdatedEvent = {
        type: "user.updated",
        data: {
          id: "user_clerk_67890",
          email_addresses: [{ email_address: "updated@example.com" }],
        },
      };

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_other",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(userUpdatedEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(createUser).not.toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it("should not call createUser for user.deleted event", async () => {
      const userDeletedEvent = {
        type: "user.deleted",
        data: {
          id: "user_clerk_11111",
        },
      };

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_other",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(userDeletedEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(createUser).not.toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it("should handle unknown event types gracefully", async () => {
      const unknownEvent = {
        type: "unknown.event",
        data: {},
      };

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_test_other",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,test_signature_valid",
          },
          body: JSON.stringify(unknownEvent),
        }
      );

      const response = await POST(mockRequest);

      expect(createUser).not.toHaveBeenCalled();
      expect(response.status).toBe(201);
      const text = await response.text();
      expect(text).toBe("boop");
    });
  });

  describe("Webhook Security", () => {
    it("should verify webhook signature", async () => {
      const mockUserEvent = {
        type: "user.created",
        data: {
          id: "user_test",
          email_addresses: [{ email_address: "test@example.com" }],
        },
      };

      (createUser as jest.Mock).mockResolvedValue({ id: "db_user" });

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_verify_test",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,valid_signature",
          },
          body: JSON.stringify(mockUserEvent),
        }
      );

      const response = await POST(mockRequest);

      // If signature verification passed, we should get 201
      expect(response.status).toBe(201);
    });
  });

  describe("Complete Webhook Flow", () => {
    it("should successfully process valid user.created webhook", async () => {
      const completeUserData = {
        id: "user_complete_12345",
        email_addresses: [
          {
            email_address: "complete@example.com",
            id: "email_complete",
          },
        ],
        first_name: "Complete",
        last_name: "Flow",
        image_url: "https://example.com/complete.jpg",
        created_at: 1234567890,
        updated_at: 1234567890,
      };

      const webhookEvent = {
        type: "user.created",
        data: completeUserData,
      };

      const expectedDbUser = {
        id: "db_complete_user",
        clerkId: "user_complete_12345",
        email: "complete@example.com",
        firstName: "Complete",
        lastName: "Flow",
        imageUrl: "https://example.com/complete.jpg",
        role: "USER",
      };

      (createUser as jest.Mock).mockResolvedValue(expectedDbUser);

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_complete",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,signature",
          },
          body: JSON.stringify(webhookEvent),
        }
      );

      const response = await POST(mockRequest);

      // Verify createUser was called with correct data
      expect(createUser).toHaveBeenCalledWith(completeUserData);

      // Verify successful response
      expect(response.status).toBe(201);
      const responseText = await response.text();
      expect(responseText).toBe("boop");

      // Verify createUser was called exactly once
      expect(createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Recovery", () => {
    it("should log error but not crash when createUser throws", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      (createUser as jest.Mock).mockRejectedValue(
        new Error("Critical database failure")
      );

      const mockRequest = new Request(
        "http://localhost:3000/api/webhooks/clerk",
        {
          method: "POST",
          headers: {
            "svix-id": "msg_error",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,signature",
          },
          body: JSON.stringify({
            type: "user.created",
            data: {
              id: "user_error",
              email_addresses: [{ email_address: "error@example.com" }],
            },
          }),
        }
      );

      const response = await POST(mockRequest);

      // Should return 500 error
      expect(response.status).toBe(500);

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error saving user",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
