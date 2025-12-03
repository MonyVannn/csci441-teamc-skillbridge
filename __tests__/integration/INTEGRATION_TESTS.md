# Integration Tests

## Overview

This directory contains integration tests that verify complete user flows and API integrations in the SkillBridge application. Unlike unit tests that test components in isolation, integration tests validate that multiple parts of the system work together correctly.

## Test Statistics

**Total: 229 Integration Tests** - ✅ **100% Passing**

| Test Suite | Tests | Focus |
|------------|-------|-------|
| `signin.test.tsx` | ~52 | Complete sign-in authentication flow |
| `signup.test.tsx` | ~32 | Complete sign-up user journey |
| `webhook.test.ts` | ~15 | Clerk webhook processing |
| `browse-projects.test.tsx` | ~29 | Project browsing and filtering |
| `profile.test.tsx` | ~23 | User profile display and data |
| `project-detail.test.tsx` | ~40 | Project detail page and timeline |
| `settings.test.tsx` | ~38 | User settings and preferences |
| **TOTAL** | **229** | **End-to-end flow validation** |

## What Are Integration Tests?

Integration tests verify the interaction between multiple components, services, and APIs:

- **User Flows** - Complete journeys from start to finish (e.g., sign-up process)
- **API Integration** - Testing API routes with real request/response objects
- **External Services** - Mocking third-party services (Clerk, webhooks)
- **Database Operations** - Verifying data persistence through Prisma
- **Error Handling** - Testing error scenarios across multiple layers

## Test Files

### 1. `signin.test.tsx` - Sign-in Flow Integration

Tests the complete user sign-in authentication flow including UI, form validation, error handling, and security features.

#### Test Categories

**Sign-in Page Rendering**
- Page structure and container rendering
- Clerk SignIn component integration
- Background image rendering
- Form fields and submit button
- Helper links (forgot password, sign up)

**Accessibility**
- ARIA labels for required fields
- Autocomplete attributes (email, current-password)
- Error display with proper ARIA roles
- Keyboard navigation support
- Accessible form labels

**Responsive Design (3 tests)**
- Responsive container classes (min-h-screen, flex, center)
- Responsive padding
- Content centering on all screen sizes

**Form Interaction (6 tests)**
- Email field typing
- Password field typing
- Remember me checkbox
- Complete form fill
- Password field masking
- Form submission

**Authentication Scenarios - Success (4 tests)**
- Redirect URL configuration
- Valid credentials authentication
- OAuth sign-in options (Google, GitHub)
- OAuth button clicks

**Authentication Scenarios - Validation Errors (6 tests)**
- Email input type validation
- Field placeholders
- Empty form submission
- Missing email field
- Missing password field
- Invalid email format

**Authentication Scenarios - Error Cases (5 tests)**
- Error display for authentication failures
- Invalid credentials handling
- Locked account scenario
- Too many login attempts
- Unverified email handling

**Edge Cases (5 tests)**
- Very long email addresses
- Special characters in password
- Email with plus addressing
- Rapid form submission
- Paste events in form fields

**Navigation and Links (3 tests)**
- Forgot password link
- Sign up link
- Sign up call to action

**Complete Sign-in Flow Integration (4 tests)**
- Full sign-in flow with valid credentials
- Complete flow with OAuth
- Flow switching from OAuth to email
- Form state maintenance during interaction

**Security Features (3 tests)**
- Password input type masking
- Autocomplete attributes for security
- Password not exposed in DOM

#### Key Technologies

```typescript
// Clerk authentication mocking
jest.mock("@clerk/nextjs", () => ({
  SignIn: ({ redirectUrl, appearance }: any) => (
    <div data-testid="clerk-signin">
      <form data-testid="signin-form">
        <input name="email" type="email" placeholder="Enter your email" />
        <input name="password" type="password" placeholder="Enter your password" />
        <input type="checkbox" name="remember" />
        <button type="submit">Sign in</button>
        {/* OAuth buttons */}
        <button type="button" data-testid="google-oauth">Continue with Google</button>
        <button type="button" data-testid="github-oauth">Continue with GitHub</button>
      </form>
    </div>
  ),
}));

// Background image mocking
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill }: any) => (
    <img src={src} alt={alt} data-testid="background-image" />
  ),
}));
```

### 2. `signup.test.tsx` - Sign-up Flow Integration (32 tests)

Tests the complete user sign-up journey including UI, form interaction, and database integration.

#### Test Categories

**Sign-up Page Rendering (7 tests)**
- Page structure and container rendering
- Clerk SignUp component integration
- Layout and styling verification

**Accessibility (4 tests)**
- ARIA labels and roles
- Required field indicators
- Keyboard navigation support
- Screen reader compatibility

**Responsive Design (3 tests)**
- Mobile layout (full width)
- Desktop layout (max-width container)
- Responsive padding and spacing

**Form Interaction (4 tests)**
- User input handling
- Form field state management
- Submit button functionality
- User event simulation

**User Creation Flow (5 tests)**
- Database integration with Prisma
- User data validation
- Complete user object creation
- Default value assignment (role: USER, occupied: false)

**Validation and Error Handling (5 tests)**
- Missing required fields
- Database connection errors
- Duplicate email handling
- Error message display

**Edge Cases (3 tests)**
- Empty string handling (converted to null)
- Special characters in names
- Very long email addresses

**Complete Sign-up Flow Integration (2 tests)**
- End-to-end user creation
- Successful database persistence

#### Key Technologies

```typescript
// Clerk authentication mocking
jest.mock("@clerk/nextjs", () => ({
  SignUp: () => (
    <div data-testid="clerk-signup">
      <form>
        <input name="emailAddress" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <input name="firstName" placeholder="First Name" />
        <input name="lastName" placeholder="Last Name" />
        <button type="submit">Sign up</button>
      </form>
    </div>
  ),
}));

// Prisma database mocking
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
    },
  },
}));

// Server action mocking
jest.mock("@/lib/actions/user", () => ({
  createUser: jest.fn(),
}));
```

### 4. `profile.test.tsx` - Profile Page Integration (23 tests)

Tests the complete user profile display functionality including data fetching, badge display, and completed projects.

#### Test Categories

**getUserByClerkId - User Data Fetching (7 tests)**
- Successful user fetch by Clerk ID
- User not found (returns null)
- Database error handling
- User with all badge arrays
- User with empty badge arrays
- User with multiple experiences and education
- Organization user (role: ORGANIZATION)

**getCompletedProjectsByAssignedStudentId - Completed Projects Fetching (7 tests)**
- Successful completed projects fetch
- Empty array when user has no completed projects
- Error when user is not found
- Projects ordered by completedAt date (desc)
- BusinessOwner details inclusion
- Database error handling
- Multiple completed projects with various categories

**Profile Page - Integration Scenarios (5 tests)**
- Fetch user data and completed projects for profile display
- Handle profile not found scenario
- Display user with badges but no completed projects
- Display organization profile without experiences/education
- Handle user with extensive profile data

**Profile Page - Error Handling and Edge Cases (4 tests)**
- Handle null values in optional user fields
- Handle projects with null businessOwner fields
- Handle concurrent user and projects fetch
- Handle large badge arrays efficiently

#### Key Technologies

```typescript
// Mock Clerk to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

// Mock Prisma database operations
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

// Test server actions directly (Server Components can't be rendered)
import { getUserByClerkId } from "@/lib/actions/user";
import { getCompletedProjectsByAssignedStudentId } from "@/lib/actions/project";

// Example test
it("should fetch user data and completed projects", async () => {
  const mockUser = {
    id: "user-1",
    clerkId: "clerk_123",
    firstName: "John",
    lastName: "Doe",
    earnedSkillBadges: ["JavaScript", "React", "Node.js"],
    earnedSpecializationBadges: ["Full Stack"],
    earnedEngagementBadges: ["Top Contributor"],
    // ... other user fields
  };

  const mockProjects = [
    {
      id: "project-1",
      title: "E-commerce Platform",
      status: "COMPLETED",
      completedAt: new Date("2023-05-15"),
      businessOwner: {
        id: "org-1",
        firstName: "Tech",
        lastName: "Corp",
        // ... other businessOwner fields
      },
      // ... other project fields
    },
  ];

  (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
  (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

  const userData = await getUserByClerkId("clerk_123");
  const completedProjects = await getCompletedProjectsByAssignedStudentId("clerk_123");

  expect(userData).toEqual(mockUser);
  expect(completedProjects).toEqual(mockProjects);
  expect(userData?.earnedSkillBadges).toHaveLength(3);
  expect(completedProjects).toHaveLength(1);
});
```

#### Data Model Validation

The profile tests validate the complete User and Project data structures:

**User Model Fields:**
- Core: `id`, `clerkId`, `email`, `firstName`, `lastName`, `imageUrl`, `role`
- Profile: `intro`, `bio`, `address`
- Status: `occupied`, `totalHoursContributed`, `projectsCompleted`
- Collections: `industriesExperienced`, `socialLinks`, `experiences`, `education`
- Badges: `earnedSkillBadges`, `earnedSpecializationBadges`, `earnedEngagementBadges`

**Project Model Fields:**
- Core: `id`, `title`, `description`, `category`, `scope`, `status`
- Skills: `requiredSkills[]`
- Dates: `startDate`, `estimatedEndDate`, `completedAt`
- Relations: `assignedStudentId`, `businessOwnerId`, `businessOwner`

**BusinessOwner Selection:**
- `id`, `imageUrl`, `firstName`, `lastName`, `address`, `bio`, `intro`

### 3. `webhook.test.ts` - Webhook Integration (15 tests)

Tests the Clerk webhook handler that processes user creation events.

#### Test Categories

**Webhook Endpoint Setup (5 tests)**
- WEBHOOK_SECRET validation
- Environment configuration
- Missing headers detection (svix-id, svix-timestamp, svix-signature)
- Request body parsing

**User Created Event Handling (4 tests)**
- createUser function invocation
- Complete user data passing
- Email validation
- Error handling during user creation

**Other Event Types (3 tests)**
- user.updated events (ignored)
- user.deleted events (ignored)
- Unknown event types (handled gracefully)

**Webhook Security (1 test)**
- Svix signature verification
- Payload validation

**Complete Webhook Flow (1 test)**
- End-to-end webhook processing
- User creation confirmation

**Error Recovery (1 test)**
- Error logging without crashes
- Graceful degradation

#### Key Technologies

```typescript
// Next.js API Route handler testing
import { POST } from "@/app/api/webhooks/clerk/route";

// Custom Request/Response polyfills
const request = new Request("http://localhost:3000/api/webhooks/clerk", {
  method: "POST",
  headers: {
    "svix-id": "msg_123",
    "svix-timestamp": "1234567890",
    "svix-signature": "v1,signature",
  },
  body: JSON.stringify({ type: "user.created", data: userData }),
});

// Direct route handler invocation
const response = await POST(request);
expect(response.status).toBe(201);

// Svix webhook verification mocking
jest.mock("svix", () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn((payload) => JSON.parse(payload)),
  })),
}));
```

### 5. `project-detail.test.tsx` - Project Detail Integration

Tests the project detail page including data fetching, timeline display, and status-based rendering.

#### Test Categories

**Project Data Fetching**
- Fetch project by ID
- Handle project not found scenarios
- Database error handling
- Project with all optional fields

**Timeline Fetching**
- Fetch timeline for projects with status requiring timeline
- Skip timeline fetch for OPEN/DRAFT projects
- Timeline ordering by date

**Status-Based Rendering**
- OPEN project display (no timeline)
- ASSIGNED project with timeline
- IN_PROGRESS project with timeline
- IN_REVIEW project with timeline
- COMPLETED project with timeline
- ARCHIVED project handling

**Business Owner Integration**
- Display business owner information
- Handle missing business owner data

**Assigned Student Display**
- Show assigned student for non-OPEN projects
- Handle projects without assigned students

#### Key Technologies

```typescript
// Mock project server actions
jest.mock("@/lib/actions/project", () => ({
  getProjectByProjectId: jest.fn(),
  getProjectTimelineByProjectId: jest.fn(),
}));

// Test conditional timeline fetching
it("should fetch timeline for IN_PROGRESS project", async () => {
  const mockProject = {
    id: "project-1",
    status: "IN_PROGRESS",
    // ... other fields
  };
  
  (getProjectByProjectId as jest.Mock).mockResolvedValue(mockProject);
  (getProjectTimelineByProjectId as jest.Mock).mockResolvedValue(mockTimeline);
  
  // Render and verify
});
```

### 6. `settings.test.tsx` - Settings Page Integration

Tests the user settings page including form rendering, data loading, and user information updates.

#### Test Categories

**Settings Page Rendering**
- Page structure and layout
- Tab navigation (Information, Experience, Education, etc.)
- Form field rendering
- Submit button states

**User Information Loading**
- Load user data on mount
- Handle loading states
- Display user information in form fields
- Handle missing/null user data

**Form Interaction**
- Update user fields
- Form validation
- Submit handling
- Error display

**Role-Based Display**
- STUDENT-specific fields (education, experience)
- BUSINESS_OWNER-specific fields
- Common fields for all roles

**Error Handling**
- Handle failed data loads
- Display error messages
- Retry functionality

#### Key Technologies

```typescript
// Mock user actions
jest.mock("@/lib/actions/user", () => ({
  getUserByClerkId: jest.fn(),
  updateUser: jest.fn(),
}));

// Mock Clerk hooks
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn().mockReturnValue({
    user: { id: "clerk_123" },
    isLoaded: true,
  }),
}));

// Test user data loading
it("should load user information on mount", async () => {
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    // ... other fields
  };
  
  (getUserByClerkId as jest.Mock).mockResolvedValue(mockUser);
  
  render(<UserInformation />);
  
  await waitFor(() => {
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
  });
});
```

### 7. `browse-projects.test.tsx` - Browse Projects Integration

Tests the project browsing functionality including filtering, search, and pagination.

#### Test Categories

**Project Fetching**
- Fetch available projects
- Handle empty results
- Database error handling

**Search Functionality**
- Search by title
- Search by description
- Combined search terms

**Category Filtering**
- Single category filter
- Multiple category filters
- Clear filters

**Scope Filtering**
- Filter by project scope
- Multiple scope selection

**Budget Filtering**
- Minimum budget filter
- Maximum budget filter
- Budget range

**Pagination**
- Page navigation
- Results per page
- Total count accuracy

## Web API Polyfills

Integration tests require Web API objects that aren't fully implemented in Jest's jsdom environment. Custom polyfills in `jest.setup.ts` provide:

### Headers Class
```typescript
global.Headers = class Headers {
  private headers: Map<string, string>;
  
  constructor(init?: HeadersInit) {
    this.headers = new Map();
    // Initialize from various input formats
  }
  
  get(name: string): string | null;
  set(name: string, value: string): void;
  has(name: string): boolean;
  delete(name: string): void;
  forEach(callback: (value: string, key: string) => void): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
}
```

### Response Class
```typescript
global.Response = class Response {
  public status: number;
  public statusText: string;
  public headers: Headers;
  public ok: boolean;
  private bodyText: string;
  
  constructor(body?: BodyInit | null, init?: ResponseInit);
  async text(): Promise<string>;
  async json(): Promise<any>;
  clone(): Response;
}
```

### Request Class
```typescript
global.Request = class Request {
  public url: string;
  public method: string;
  public headers: Headers;
  private bodyText: string;
  
  constructor(input: RequestInfo | URL, init?: RequestInit);
  async text(): Promise<string>;
  async json(): Promise<any>;
  clone(): Request;
}
```

**Why Custom Polyfills?**
- ✅ No external dependencies (avoided `undici` per project requirements)
- ✅ Minimal implementation focused on testing needs
- ✅ Full control over behavior for testing scenarios
- ✅ Enables Next.js API route handler testing

## Running Integration Tests

### Run All Integration Tests
```bash
npm test -- __tests__/integration
```

### Run Specific Test File
```bash
npm test -- __tests__/integration/signup.test.tsx
npm test -- __tests__/integration/webhook.test.ts
```

### Watch Mode
```bash
npm test -- __tests__/integration --watch
```

### With Coverage
```bash
npm test -- __tests__/integration --coverage
```

## Test Flow Diagrams

### Sign-up Integration Flow
```
User Action → Clerk UI → Form Submit → Webhook → API Route → Database
    ↓            ↓           ↓            ↓          ↓           ↓
  Tests:     Render    Interaction   Security   Handler    Prisma
           Component     Events      Verify     Logic      Create
```

### Webhook Processing Flow
```
Clerk Event → HTTP POST → Signature Verify → Parse Body → createUser → Database
     ↓            ↓              ↓                 ↓           ↓          ↓
  Tests:      Request       Svix Mock        JSON Parse    Action     Persist
           Construction    Verification      Validation     Call       User
```

## Mock Strategy

### What We Mock
1. **Clerk Authentication** - SignUp component and webhook events
2. **Prisma Database** - user.create operations
3. **Svix Verification** - Webhook signature validation
4. **Next.js Image** - Image component (prevents optimization errors)
5. **Server Actions** - createUser function

### What We DON'T Mock
1. **Business Logic** - Actual validation and data transformation
2. **Route Handlers** - Real Next.js API route code
3. **Error Handling** - Actual error scenarios and recovery
4. **Type Safety** - Full TypeScript validation

## Best Practices

### 1. Test Complete Flows
```typescript
it("should complete the full sign-up flow", async () => {
  // Render component
  render(<SignUpPage />);
  
  // User interaction
  await user.type(emailInput, "test@example.com");
  await user.click(submitButton);
  
  // Verify database call
  expect(prisma.user.create).toHaveBeenCalled();
  
  // Verify success state
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### 2. Test Error Scenarios
```typescript
it("should handle database errors gracefully", async () => {
  // Mock error
  (prisma.user.create as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );
  
  // Trigger action
  await createUser(userData);
  
  // Verify error handling
  expect(console.error).toHaveBeenCalledWith(
    "Error creating user in DB:",
    expect.any(Error)
  );
});
```

### 3. Test API Routes Directly
```typescript
it("should process user.created webhook", async () => {
  const request = new Request("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    headers: { /* svix headers */ },
    body: JSON.stringify({ type: "user.created", data: userData }),
  });
  
  const response = await POST(request);
  
  expect(response.status).toBe(201);
  expect(createUser).toHaveBeenCalledWith(userData);
});
```

### 4. Validate Data Transformations
```typescript
it("should convert empty strings to null", async () => {
  await createUser({
    email: "test@example.com",
    firstName: "",
    lastName: "",
    imageUrl: "",
  });
  
  expect(prisma.user.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      firstName: null,
      lastName: null,
      imageUrl: null,
    }),
  });
});
```

## Debugging Tips

### Console Errors Are Expected
Many tests intentionally trigger errors to verify error handling:
```
console.error
  Error creating user in DB: Error: Database connection failed
```
These are **intentional** and indicate the test is working correctly.

### Check Mock Calls
```typescript
// See what arguments were passed
console.log((createUser as jest.Mock).mock.calls);

// See number of times called
console.log((createUser as jest.Mock).mock.calls.length);
```

### Inspect Request/Response
```typescript
// Log request details
console.log(await request.text());
console.log(Object.fromEntries(request.headers.entries()));

// Log response details
console.log(response.status, response.statusText);
console.log(await response.json());
```

## Common Issues and Solutions

### Issue: "Cannot read properties of undefined"
**Solution:** Check that Web API polyfills are loaded in `jest.setup.ts`

### Issue: Mock not being called
**Solution:** Verify mock path matches actual import path:
```typescript
// Import path in code
import { createUser } from "@/lib/actions/user";

// Mock path must match
jest.mock("@/lib/actions/user", () => ({
  createUser: jest.fn(),
}));
```

### Issue: Test timeout
**Solution:** Ensure async operations are properly awaited:
```typescript
// ❌ Wrong - missing await
const response = POST(request);

// ✅ Correct - awaited
const response = await POST(request);
```

## Contributing

When adding new integration tests:

1. **Follow the established structure** - Group tests by feature/flow
2. **Mock external services** - Keep tests independent
3. **Test happy path first** - Then add error scenarios
4. **Use meaningful test descriptions** - Explain what's being validated
5. **Document complex scenarios** - Add comments for non-obvious logic
6. **Keep tests fast** - Mock database and network calls
7. **Verify data transformations** - Test business logic thoroughly

## Related Documentation

- **Main Test README** - `../__tests__/README.md`
- **Unit Tests** - `../__tests__/components/`, `../__tests__/app/`
- **Jest Configuration** - `../../jest.config.ts`
- **Web API Polyfills** - `../../jest.setup.ts`
- **Clerk Documentation** - https://clerk.com/docs
- **Svix Documentation** - https://docs.svix.com/
