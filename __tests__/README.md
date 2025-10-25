# Test Documentation

## Overview

This directory contains comprehensive unit and integration tests for the SkillBridge application. The test suite uses Jest and React Testing Library to ensure code quality, prevent regressions, and validate functionality across the entire application.

## Test Statistics

**Total: 319 Tests** across 10 test suites - ✅ **100% Passing**

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **Unit Tests** | 7 | 220 | Pages, components, middleware |
| **Integration Tests** | 3 | 99 | Sign-in, sign-up, webhooks |
| **App Pages** | 3 | 57 | Root layout, project details, user profiles |
| **Components** | 2 | 109 | Header and Footer navigation |
| **Root Pages** | 2 | 54 | Home page marketplace, middleware |
| **TOTAL** | **10** | **319** | **Complete application coverage** |

## Test Organization

### Directory Structure

```
__tests__/
├── integration/                  # Integration tests (99 tests)
│   ├── signin.test.tsx          # Sign-in flow integration (52 tests)
│   ├── signup.test.tsx          # Sign-up flow integration (32 tests)
│   └── webhook.test.ts          # Clerk webhook integration (15 tests)
├── app/                          # App Router pages (57 tests)
│   ├── layout.test.tsx          # Root layout metadata (4 tests)
│   ├── project/
│   │   └── page.test.tsx        # Project detail page (31 tests)
│   └── profile/
│       └── page.test.tsx        # User profile page (22 tests)
├── components/                   # React components (109 tests)
│   ├── Header.test.tsx          # Header navigation (~55 tests)
│   └── Footer.test.tsx          # Footer navigation (~54 tests)
├── page.test.tsx                # Home/Marketplace page (~27 tests)
└── middleware.test.ts           # Route middleware (~27 tests)
```

## Test Coverage by Area

### 1. Integration Tests (99 tests)

#### Sign-in Flow (`integration/signin.test.tsx`) - 52 tests
**Focus:** Complete sign-in authentication flow with Clerk
- ✅ Sign-in page rendering and structure
- ✅ Accessibility features (ARIA labels, autocomplete, keyboard navigation)
- ✅ Responsive design (mobile/desktop layouts)
- ✅ Form interaction (email, password, remember me, submission)
- ✅ Authentication success scenarios (valid credentials, OAuth)
- ✅ Validation errors (missing fields, invalid format)
- ✅ Error cases (invalid credentials, locked accounts, unverified email)
- ✅ Edge cases (long emails, special characters, rapid submission)
- ✅ Navigation and links (forgot password, sign up)
- ✅ Complete sign-in flow integration
- ✅ Security features (password masking, autocomplete attributes)

**Key Technologies:**
- Clerk SignIn component with realistic form mocking
- Jest mocks for Clerk, Next.js Image
- React Testing Library for user interactions
- OAuth provider mocking (Google, GitHub)

#### Sign-up Flow (`integration/signup.test.tsx`) - 32 tests
**Focus:** Complete sign-up user journey with Clerk authentication
- ✅ Sign-up page rendering and structure
- ✅ Accessibility features (ARIA labels, keyboard navigation, required fields)
- ✅ Responsive design (mobile/desktop layouts)
- ✅ Form interaction (typing, submission, validation)
- ✅ User creation flow with Prisma database integration
- ✅ Validation and error handling (missing fields, database errors, duplicate users)
- ✅ Edge cases (empty strings, special characters, long emails)
- ✅ Complete end-to-end sign-up flow integration

**Key Technologies:**
- Clerk SignUp component with realistic form mocking
- Jest mocks for Clerk, Prisma, Next.js Image
- React Testing Library for user interactions
- Custom Web API polyfills (Request/Response/Headers)

#### Webhook Integration (`integration/webhook.test.ts`) - 15 tests
**Focus:** Clerk webhook processing for user creation events
- ✅ Webhook endpoint setup and configuration
- ✅ WEBHOOK_SECRET environment variable validation
- ✅ User created event handling (user.created)
- ✅ Other event types (user.updated, user.deleted)
- ✅ Webhook security (Svix signature verification)
- ✅ Complete webhook flow (signature → parsing → user creation)
- ✅ Error recovery and logging
- ✅ Missing/invalid headers detection

**Key Technologies:**
- Next.js API Route handlers (POST endpoint)
- Svix webhook verification library
- Custom Request/Response polyfills for testing
- Server action integration (createUser)

**Integration Test Architecture:**
```
Sign-in Flow:
1. User visits sign-in page
2. Fills email and password
3. Clerk handles authentication
4. User redirected to dashboard on success
5. Errors displayed for invalid credentials

Sign-up Flow:
1. User fills Clerk sign-up form
2. Clerk creates user account
3. Clerk sends webhook to /api/webhooks/clerk
4. Webhook handler verifies signature
5. createUser action saves to Prisma database
6. User redirected to application

Testing Strategy:
- Mock Clerk SignUp component
- Mock Prisma database operations
- Mock Svix webhook verification
- Test complete flow end-to-end
- Validate error scenarios
```

### 2. App Router Pages (57 tests)

#### Root Layout (`app/layout.test.tsx`) - 4 tests
**Focus:** Metadata and SEO validation
- ✅ Application title and description
- ✅ Metadata structure validation
- ✅ SEO optimization checks

**Note:** Full RootLayout component testing is limited due to `<html>`/`<body>` tags which cannot be rendered in Jest. Structure is validated through TypeScript compilation and build process.

#### Project Detail Page (`app/project/[projectId]/page.test.tsx`) - 31 tests
**Focus:** Dynamic project pages with conditional rendering
- ✅ OPEN project rendering (no timeline)
- ✅ ASSIGNED/IN_PROGRESS/IN_REVIEW/COMPLETED/ARCHIVED rendering (with timeline)
- ✅ Conditional timeline fetching based on project status
- ✅ Async params unwrapping (Next.js 14+ pattern)
- ✅ Server action verification (`getProjectByProjectId`, `getProjectTimelineByProjectId`)
- ✅ Projects with/without assigned students
- ✅ Data fetching order validation
- ✅ Edge cases and error scenarios

#### Profile Page (`app/profile/[userId]/page.test.tsx`) - 22 tests
**Focus:** User profile display with role-based rendering
- ✅ Profile component rendering (Header, Sidebar, Content)
- ✅ User data fetching and display
- ✅ Completed projects fetching
- ✅ User not found handling (ProfileNotFoundPage)
- ✅ Different user roles (STUDENT, BUSINESS_OWNER, ADMIN)
- ✅ Async params unwrapping
- ✅ Component layout structure and order
- ✅ Data fetching order validation

### 3. Components (109 tests)

#### Header Component (`components/Header.test.tsx`) - ~55 tests
**Focus:** Main navigation and authentication UI
- ✅ Server component data fetching (user auth, notifications)
- ✅ Client component rendering (HeaderContent)
- ✅ Brand/logo rendering and links
- ✅ Search bar integration
- ✅ Signed out state (Sign in/Get Started buttons)
- ✅ Signed in state - USER role (Bio, Browse, MyApplications, Settings)
- ✅ Signed in state - BUSINESS_OWNER role (Post Project, Posted Projects, Applications)
- ✅ Notification badges for unresponded applications
- ✅ Client-side user data fetching
- ✅ Mobile responsiveness
- ✅ Accessibility features

#### Footer Component (`components/Footer.test.tsx`) - ~54 tests
**Focus:** Footer navigation and information
- ✅ Footer structure and layout
- ✅ Navigation links (Browse, Post Project, About)
- ✅ Social media links
- ✅ Company information
- ✅ Legal links (Terms, Privacy)
- ✅ Copyright information
- ✅ Responsive design
- ✅ Accessibility compliance

### 4. Root Pages (54 tests)

#### Marketplace Page (`page.test.tsx`) - ~27 tests
**Focus:** Main landing page with project listings
- ✅ Project fetching and display
- ✅ Pagination logic (totalPages calculation)
- ✅ Search parameter handling (query, page, categories, scopes, budget)
- ✅ Empty state rendering
- ✅ Filter integration (desktop and mobile)
- ✅ User authentication state
- ✅ Application filtering
- ✅ Error handling
- ✅ Edge cases (invalid pages, empty params)
- ✅ Responsive layout

#### Middleware (`middleware.test.ts`) - ~27 tests
**Focus:** Route protection and authentication
- ✅ Public route access
- ✅ Protected route authentication
- ✅ Role-based access control
- ✅ Redirect logic
- ✅ Authentication state validation

## Testing Patterns and Best Practices

### Web API Polyfills (Jest Environment)

Integration tests require Web API objects (Request, Response, Headers) that aren't fully available in the Jest jsdom environment. Custom polyfills are implemented in `jest.setup.ts`:

```typescript
// Custom Headers implementation
global.Headers = class Headers {
  private headers: Map<string, string>;
  
  constructor(init?: HeadersInit) {
    this.headers = new Map();
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.headers.set(key, value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers.set(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key, value);
        });
      }
    }
  }
  
  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }
  // ... additional methods
};

// Custom Response implementation
global.Response = class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.bodyText = typeof body === 'string' ? body : JSON.stringify(body);
    this.status = init?.status || 200;
    this.statusText = init?.statusText || '';
    this.headers = new Headers(init?.headers);
  }
  // ... methods: text(), json(), clone()
} as any;

// Custom Request implementation  
global.Request = class Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.toString();
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.bodyText = typeof init?.body === 'string' ? init.body : '';
  }
  // ... methods: text(), json(), clone()
} as any;
```

**Why Custom Polyfills?**
- Jest's jsdom doesn't provide complete Web API implementations
- Avoids external dependencies (like undici)
- Minimal implementation focused on testing needs
- Enables testing of Next.js API route handlers

### Async Server Components (Next.js 14+)
```typescript
// Components use Promise-wrapped params
interface PageProps {
  params: Promise<{ id: string }>;
}

// Tests handle async unwrapping
const params = Promise.resolve({ userId: "clerk-123" });
render(await ProfilePage({ params }));
```

### Server Actions Mocking
```typescript
jest.mock("@/lib/actions/user", () => ({
  getUserByClerkId: jest.fn(),
}));

(getUserByClerkId as jest.Mock).mockResolvedValue(mockUser);
expect(getUserByClerkId).toHaveBeenCalledWith("clerk-123");
```

### Component Mocking with Test IDs
```typescript
jest.mock("@/components/profile/ProfileHeader", () => ({
  ProfileHeader: ({ user }: any) => (
    <div data-testid="profile-header">
      <div data-testid="user-name">{user.firstName}</div>
    </div>
  ),
}));
```

### User-Centric Testing
```typescript
// Query by role, label, or text (not implementation details)
expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
expect(screen.getByText("Welcome")).toBeInTheDocument();
expect(screen.getByLabelText("Email")).toBeInTheDocument();
```

### Integration Testing Next.js API Routes
```typescript
// Import route handler
import { POST } from "@/app/api/webhooks/clerk/route";

// Create request with custom polyfills
const request = new Request("http://localhost:3000/api/webhooks/clerk", {
  method: "POST",
  headers: {
    "svix-id": "msg_123",
    "svix-timestamp": "1234567890",
    "svix-signature": "v1,signature",
  },
  body: JSON.stringify({ type: "user.created", data: userData }),
});

// Call route handler directly
const response = await POST(request);

// Assert response
expect(response.status).toBe(201);
const data = await response.json();
expect(data.message).toBe("User created successfully");
```

### Mocking Clerk Authentication
```typescript
// Mock Clerk SignUp component
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
```

### Mocking Webhook Verification
```typescript
// Mock Svix webhook verification
jest.mock("svix", () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn((payload, headers) => {
      // Return parsed payload for testing
      return JSON.parse(payload);
    }),
  })),
}));
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm test -- --testPathIgnorePatterns=integration
```

### Run Integration Tests Only
```bash
npm test -- __tests__/integration
```

### Run Specific Test Suite
```bash
npm test -- __tests__/integration      # Integration tests
npm test -- __tests__/app              # All app router tests
npm test -- __tests__/components       # All component tests
npm test -- __tests__/page.test.tsx    # Marketplace page only
npm test -- __tests__/integration/signup.test.tsx    # Sign-up flow only
npm test -- __tests__/integration/webhook.test.ts    # Webhooks only
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

### Silent Mode (CI/CD)
```bash
npm test -- --silent
```

## Key Technologies

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **TypeScript** - Full type safety in tests
- **Next.js 14+** - App Router and Server Components
- **Custom Web API Polyfills** - Request/Response/Headers for route testing

## Documentation

Each test directory contains detailed documentation:

- **`__tests__/app/README.md`** - App Router testing guide
- **`__tests__/app/IMPLEMENTATION_SUMMARY.md`** - Detailed implementation notes
- **`__tests__/integration/README.md`** - Integration testing comprehensive guide
- **Individual test files** - Inline comments explaining complex test scenarios

## Test Quality Standards

✅ **All tests passing** - 319/319 tests pass consistently  
✅ **TypeScript strict mode** - Full type checking enabled  
✅ **No compilation errors** - Clean build with zero warnings  
✅ **Comprehensive coverage** - Unit and integration tests covering happy path, edge cases, and error scenarios  
✅ **User-centric approach** - Tests focus on user interactions, not implementation  
✅ **Well-documented** - Clear descriptions and inline comments  
✅ **Fast execution** - Complete suite runs in ~15 seconds  
✅ **Custom polyfills** - No external dependencies for Web API testing  

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- Fast execution time (~15 seconds for full suite)
- No external dependencies required
- Custom Web API polyfills avoid runtime dependencies
- Deterministic results (no flaky tests)
- Clear error messages for debugging

## Future Enhancements

### Recommended Additions
1. **E2E Tests** - Full user flow testing with Playwright/Cypress
2. **Visual Regression Tests** - Screenshot comparisons
3. **Performance Tests** - Load time and rendering performance
4. **Accessibility Tests** - Automated a11y audits
5. **More Integration Tests** - Expand to other features (project posting, applications, settings, profile pages)

### Areas for Expansion
- Additional integration tests (browse, profile, project pages)
- More authentication scenarios (password reset, email verification)
- API route testing for other endpoints
- Database integration tests with test containers
- Complete OAuth flow testing (Google, GitHub)

## Contributing

When adding new tests:

1. **Follow existing patterns** - Use established mocking and assertion strategies
2. **Test user behavior** - Focus on what users see and do, not implementation
3. **Cover edge cases** - Test null/undefined states, errors, and boundaries
4. **Document complex scenarios** - Add comments for non-obvious test logic
5. **Maintain type safety** - Keep TypeScript strict mode compliance
6. **Run full suite** - Ensure new tests don't break existing ones

## Support and Maintenance

- **Last Updated:** 2024
- **Test Framework:** Jest + React Testing Library
- **Total Coverage:** 220 tests across 7 test suites
- **Passing Rate:** 100%
- **Execution Time:** ~4 seconds

---

## Detailed Test File Documentation

Below are the detailed descriptions of each test file for reference.

## Test Files

### `page.test.tsx`

Comprehensive unit tests for the marketplace page (`app/page.tsx`), which is the main landing page displaying available projects.

#### What's Being Tested

The marketplace page is an async server component that:
- Fetches available projects from the database
- Retrieves current user information
- Displays projects in a filterable, paginated list
- Shows empty state when no projects are available
- Handles search parameters for filtering and pagination

#### Test Coverage

**17 test cases** organized into 5 categories:

##### 1. With Projects Available (7 tests)
- ✅ Renders the marketplace page with projects
- ✅ Calculates and passes correct total pages (totalPages = Math.ceil(totalProjects / 6))
- ✅ Handles page parameter correctly
- ✅ Defaults to page 1 when no page parameter provided
- ✅ Passes all search parameters to `getAvailableProjects` (query, page, categories, scopes, minBudget, maxBudget)
- ✅ Filters out applications from projects before passing to ProjectCard
- ✅ Calls `getUserOrNull` to get current user

##### 2. With No Projects Available (2 tests)
- ✅ Renders EmptyProject component when no projects exist
- ✅ Still renders filters when no projects available

##### 3. Error Handling (2 tests)
- ✅ Handles `getAvailableProjects` errors gracefully
- ✅ Handles `getUserOrNull` errors gracefully

##### 4. Edge Cases (4 tests)
- ✅ Handles page 0 as page 1 (invalid page number)
- ✅ Handles empty string parameters
- ✅ Calculates totalPages correctly when total is not divisible by 6
- ✅ Handles when user is null (not logged in)

##### 5. Layout and Structure (2 tests)
- ✅ Has correct CSS classes for responsive design
- ✅ Renders all main sections (filters, mobile filters, project list)

### `components/Header.test.tsx`

Comprehensive unit and integration tests for the Header and HeaderContent components, which provide the main navigation and user interface elements.

#### What's Being Tested

The Header is an async server component that:
- Fetches user authentication state
- Retrieves unresponded application counts for business owners
- Renders HeaderContent with user data and application notifications

The HeaderContent is a client component that:
- Displays the SKILLBRIDGE logo and navigation
- Shows different UI elements based on user authentication state
- Provides role-specific features (USER vs BUSINESS_OWNER)
- Displays notification badges for unresponded applications
- Handles client-side user data fetching when needed

#### Test Coverage

**49 test cases** organized into 11 categories:

##### 1. Server Component Rendering (5 tests)
- ✅ Calls getUserOrNull to fetch user data
- ✅ Calls getTotalUnrespondedApplication for BUSINESS_OWNER users
- ✅ Does not call getTotalUnrespondedApplication for USER role
- ✅ Handles errors when fetching unresponded applications
- ✅ Renders HeaderContent with user and applications data

##### 2. Brand/Logo Rendering (3 tests)
- ✅ Renders the SKILLBRIDGE logo with correct text
- ✅ Renders logo as a link to homepage (/)
- ✅ Applies correct styling classes to logo

##### 3. Navigation and Search Bar (2 tests)
- ✅ Renders search bar component
- ✅ Renders search bar in center position on large screens

##### 4. Signed Out State (5 tests)
- ✅ Renders "Sign in" button when user is signed out
- ✅ Renders "Get Started" button when user is signed out
- ✅ Links "Sign in" button to /sign-in
- ✅ Links "Get Started" button to /sign-up
- ✅ Does not render UserButton when signed out

##### 5. Signed In State - USER Role (7 tests)
- ✅ Renders UserButton when signed in
- ✅ Renders Bio profile page for USER role
- ✅ Renders Experience profile page for USER role
- ✅ Renders Education profile page for USER role
- ✅ Renders Applications profile page for USER role
- ✅ Renders profile link with correct URL for USER role
- ✅ Does not render "Post a Project" button for USER role
- ✅ Does not render Posted Projects page for USER role

##### 6. Signed In State - BUSINESS_OWNER Role (7 tests)
- ✅ Renders "Post a Project" button for BUSINESS_OWNER role
- ✅ Opens PostProjectModal when "Post a Project" is clicked
- ✅ Renders Bio profile page for BUSINESS_OWNER role
- ✅ Renders Posted Projects profile page for BUSINESS_OWNER role
- ✅ Renders Applications profile page for BUSINESS_OWNER role
- ✅ Does not render Experience page for BUSINESS_OWNER role
- ✅ Does not render Education page for BUSINESS_OWNER role

##### 7. Notification Badge Display (5 tests)
- ✅ Displays notification badge when unresponded applications > 0
- ✅ Does not display notification badge when unresponded applications = 0
- ✅ Does not display notification badge when unresponded applications is null
- ✅ Displays correct count in notification badge
- ✅ Styles notification badge with red background

##### 8. Accessibility (6 tests)
- ✅ Renders header as a semantic header element
- ✅ Has proper heading hierarchy for logo (H1 elements)
- ✅ Has accessible button elements for actions
- ✅ Has proper link elements with href attributes
- ✅ Uses semantic navigation structure
- ✅ Has visible focus indicators on interactive elements

##### 9. Client-Side User Fetching (2 tests)
- ✅ Fetches user from database when Clerk user loads
- ✅ Does not fetch user if already provided via server props

##### 10. Path-based Rendering (3 tests)
- ✅ Does not render header on sign-in page
- ✅ Does not render header on sign-up page
- ✅ Renders header on other pages

##### 11. Responsive Design (3 tests)
- ✅ Applies responsive classes to logo
- ✅ Applies responsive classes to action buttons
- ✅ Hides search bar on small screens

### `components/Footer.test.tsx`

Comprehensive unit tests for the Footer component, which provides site-wide navigation links and branding.

#### What's Being Tested

The Footer is a client component that:
- Displays the SKILLBRIDGE logo and tagline
- Provides navigation links organized into three sections (Company, Need Help, Community)
- Shows copyright information
- Conditionally renders based on current pathname (hides on auth pages)
- Uses responsive design for mobile, tablet, and desktop layouts

#### Test Coverage

**60 test cases** organized into 12 categories:

##### 1. Basic Rendering (3 tests)
- ✅ Renders the footer element
- ✅ Has correct background styling
- ✅ Renders within a container

##### 2. Logo and Tagline (5 tests)
- ✅ Renders the SKILLBRIDGE logo
- ✅ Renders logo with correct styling
- ✅ Uses h1 tags for logo text
- ✅ Renders the tagline text
- ✅ Styles tagline with correct classes

##### 3. Company Section (5 tests)
- ✅ Renders COMPANY section header
- ✅ Renders COMPANY header as h3
- ✅ Renders ABOUT US link
- ✅ Renders EXPLORE link
- ✅ Has correct link styling for Company links

##### 4. Need Help Section (5 tests)
- ✅ Renders NEED HELP? section header
- ✅ Renders NEED HELP? header as h3
- ✅ Renders CONTACT US link
- ✅ Renders BLOG link
- ✅ Has correct link styling for Help links

##### 5. Community Section (6 tests)
- ✅ Renders COMMUNITY section header
- ✅ Renders COMMUNITY header as h3
- ✅ Renders X (Twitter) link
- ✅ Renders LINKEDIN link
- ✅ Renders INSTAGRAM link
- ✅ Has correct link styling for Community links

##### 6. Copyright Section (4 tests)
- ✅ Renders copyright text
- ✅ Displays current year 2025 in copyright
- ✅ Styles copyright text correctly
- ✅ Has border separator above copyright

##### 7. Link Structure (3 tests)
- ✅ Renders all links as anchor elements
- ✅ Has href attributes on all links
- ✅ Has placeholder href="#" for all links

##### 8. Footer Blocks Presence (4 tests)
- ✅ Has three main navigation columns
- ✅ Has logo/tagline block
- ✅ Has copyright block
- ✅ Renders all major blocks in correct order

##### 9. Responsive Layout (4 tests)
- ✅ Applies responsive grid classes to main layout
- ✅ Applies responsive grid classes to navigation columns
- ✅ Applies correct column spans for logo section
- ✅ Applies correct column positioning for navigation

##### 10. Accessibility (5 tests)
- ✅ Uses semantic footer element
- ✅ Has proper heading hierarchy
- ✅ Has accessible link elements
- ✅ Uses unordered lists for navigation
- ✅ Uses list items for each link

##### 11. Path-based Rendering (5 tests)
- ✅ Does not render footer on sign-in page
- ✅ Does not render footer on sign-up page
- ✅ Does not render footer on sign-in subpaths
- ✅ Renders footer on homepage
- ✅ Renders footer on other pages

##### 12. Styling and Visual Design (5 tests)
- ✅ Has dark background theme
- ✅ Has appropriate padding
- ✅ Has gap between grid items
- ✅ Applies hover styles to links
- ✅ Applies transition effects to links

##### 13. Content Validation (6 tests)
- ✅ Contains exactly 7 navigation links
- ✅ Contains exactly 3 section headers
- ✅ Has all Company section links
- ✅ Has all Help section links
- ✅ Has all Community section links
- ✅ Contains SkillBridge branding in both logo and copyright

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- __tests__/page.test.tsx
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Structure

### Mocking Strategy

The tests use comprehensive mocking to isolate the component being tested:

#### 1. External Dependencies
```typescript
// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));
```

#### 2. Server Actions
```typescript
// Mock database queries
jest.mock('@/lib/actions/project');
jest.mock('@/lib/actions/user');
```

#### 3. Child Components
```typescript
// Mock UI components to focus on page logic
jest.mock('@/components/browse/ProjectCard', () => ({
  ProjectCard: ({ projects, currentPageProp, totalPagesProp }: any) => (
    <div data-testid="project-card">
      <div data-testid="projects-count">{projects.length}</div>
      <div data-testid="current-page">{currentPageProp}</div>
      <div data-testid="total-pages">{totalPagesProp}</div>
    </div>
  ),
}));
```

### Mock Data

The tests use realistic mock data that matches the Prisma schema:

#### Mock User
```typescript
const mockUser = {
  id: 'user-1',
  clerkId: 'clerk-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  // ... all required User fields
};
```

#### Mock Projects
```typescript
const mockProjects = [
  {
    id: '1',
    title: 'Web Development Project',
    category: 'WEB_DEVELOPMENT',
    scope: 'INTERMEDIATE',
    budget: 5000,
    status: 'OPEN',
    businessOwner: { ... },
    applications: [ ... ],
    // ... all required Project fields
  },
  // ... more projects
];
```

### Test Patterns

#### Testing Async Server Components
```typescript
it('should render the marketplace page with projects', async () => {
  const searchParams = Promise.resolve({});
  const page = await MarketplacePage({ searchParams });
  
  render(page);
  
  expect(screen.getByTestId('project-card')).toBeInTheDocument();
});
```

#### Testing Function Calls
```typescript
it('should pass search parameters to getAvailableProjects', async () => {
  const searchParams = Promise.resolve({
    query: 'web',
    page: '1',
    categories: 'WEB_DEVELOPMENT',
  });

  await MarketplacePage({ searchParams });

  expect(mockGetAvailableProjects).toHaveBeenCalledWith(
    'web',
    '1',
    'WEB_DEVELOPMENT',
    // ... other params
  );
});
```

#### Testing Error Handling
```typescript
it('should handle getAvailableProjects errors gracefully', async () => {
  mockGetAvailableProjects.mockRejectedValue(new Error('Database error'));
  
  const searchParams = Promise.resolve({});

  await expect(MarketplacePage({ searchParams })).rejects.toThrow('Database error');
});
```

## Configuration

### Jest Configuration (`jest.config.ts`)

```typescript
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@clerk)/)',
  ],
};
```

#### Key Settings:
- **testEnvironment**: `jsdom` - Simulates browser environment
- **setupFilesAfterEnv**: Runs `jest.setup.ts` before each test
- **moduleNameMapper**: Maps `@/` to project root for imports
- **transformIgnorePatterns**: Transforms Clerk packages (needed for ESM modules)

### Jest Setup (`jest.setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

// Polyfills for Next.js compatibility
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;
global.Request = Request as any;
global.Response = Response as any;
global.Headers = Headers as any;
```

#### Polyfills Needed:
- **TextEncoder/TextDecoder**: Required by Next.js server utilities
- **ReadableStream**: Required by Next.js streaming
- **Request/Response/Headers**: Required by Next.js web APIs

## Dependencies

### Testing Libraries
```json
{
  "jest": "^30.2.0",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.9.1",
  "jest-environment-jsdom": "^30.2.0"
}
```

### Why These Dependencies?

- **jest**: Test runner and assertion library
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM elements
- **jest-environment-jsdom**: Browser-like environment for tests

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ✅ Good - Tests what the user sees
expect(screen.getByTestId('empty-project')).toBeInTheDocument();

// ❌ Bad - Tests internal implementation
expect(component.state.isEmpty).toBe(true);
```

### 2. Use Descriptive Test Names
```typescript
// ✅ Good - Clear what's being tested
it('should calculate totalPages correctly when total is not divisible by 6', async () => {

// ❌ Bad - Unclear what's being tested
it('test pagination', async () => {
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should handle page parameter correctly', async () => {
  // Arrange - Setup test data
  const searchParams = Promise.resolve({ page: '2' });
  
  // Act - Execute the code under test
  const page = await MarketplacePage({ searchParams });
  render(page);
  
  // Assert - Verify the results
  expect(screen.getByTestId('current-page')).toHaveTextContent('2');
});
```

### 4. Reset Mocks Between Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear all mock calls/results
});
```

### 5. Group Related Tests
```typescript
describe('MarketplacePage', () => {
  describe('with projects available', () => {
    // Tests for when projects exist
  });
  
  describe('error handling', () => {
    // Tests for error scenarios
  });
});
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/...'"
**Solution**: Ensure `moduleNameMapper` is configured in `jest.config.ts`
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

#### 2. "TextEncoder is not defined"
**Solution**: Add polyfill in `jest.setup.ts`
```typescript
global.TextEncoder = TextEncoder as any;
```

#### 3. "Unexpected token 'export'" (Clerk packages)
**Solution**: Add to `transformIgnorePatterns` in `jest.config.ts`
```typescript
transformIgnorePatterns: [
  'node_modules/(?!(@clerk)/)',
]
```

#### 4. "Request is not defined"
**Solution**: Add polyfill in `jest.setup.ts`
```typescript
global.Request = Request as any;
global.Response = Response as any;
global.Headers = Headers as any;
```

### Debugging Tests

#### Run in Verbose Mode
```bash
npm test -- --verbose
```

#### Run Single Test
```bash
npm test -- --testNamePattern="should render the marketplace page"
```

#### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Adding New Tests

### 1. Create Test File
Place test files in `__tests__/` directory with `.test.tsx` or `.test.ts` extension.

### 2. Import Dependencies
```typescript
import { render, screen } from '@testing-library/react';
import ComponentToTest from '@/path/to/component';
```

### 3. Mock Dependencies
```typescript
jest.mock('@/lib/actions/someAction');
```

### 4. Write Tests
```typescript
describe('ComponentName', () => {
  it('should do something', () => {
    // Test implementation
  });
});
```

### 5. Run Tests
```bash
npm test -- __tests__/your-test-file.test.tsx
```

## Coverage Reports

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Coverage Output
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   85.71 |       75 |      80 |   85.71 |
 app/page.tsx      |   85.71 |       75 |      80 |   85.71 | 45-47
-------------------|---------|----------|---------|---------|-------------------
```

### View HTML Coverage Report
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest Matchers](https://jestjs.io/docs/expect)

## Contributing

When adding new tests:
1. Follow the existing test structure and patterns
2. Use descriptive test names
3. Mock external dependencies appropriately
4. Ensure tests are isolated and don't depend on each other
5. Run all tests before committing: `npm test`
6. Update this README if adding new patterns or configurations
