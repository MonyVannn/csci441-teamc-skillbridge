# Unit Tests Documentation

## Overview

This document covers all **unit tests** in the SkillBridge application. Unit tests focus on testing individual functions, components, and modules in **isolation** with mocked dependencies.

## Unit Test Statistics

**Total: 483 Unit Tests** across 14 test suites - ✅ **100% Passing**

| Category | Test Files | Tests | Description |
|----------|------------|-------|-------------|
| **Library Functions** | 5 | ~250 | Server actions, utils, stores, Prisma, thumbnails |
| **React Components** | 4 | ~160 | Header, Footer, ApplyButton, SearchBar |
| **App Pages** | 3 | ~57 | Root layout, project details, user profiles |
| **Root Level** | 2 | ~45 | Home page, middleware |
| **TOTAL** | **14** | **483** | **Complete unit test coverage** |

---

## What is Unit Testing?

Unit testing is a software testing technique where **individual units or components** of a software are tested in isolation. The purpose is to validate that each unit performs as designed.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Scope** | Single function, method, or component |
| **Dependencies** | Heavily mocked (database, auth, APIs) |
| **Speed** | Fast execution (~9 seconds for 483 tests) |
| **Isolation** | Tests don't depend on each other |
| **Purpose** | Verify individual behavior works correctly |

### Unit Tests vs Integration Tests

| Feature | Unit Tests | Integration Tests |
|---------|-----------|-------------------|
| **Scope** | Single unit | Multiple components |
| **Mocking** | Heavy | Minimal |
| **Speed** | Very fast | Slower |
| **Failure diagnosis** | Easy (pinpoints issue) | Harder (multiple causes) |
| **Example** | Test `createProject` function | Test entire project creation flow |

---

## Directory Structure

```
__tests__/
├── lib/                              # Library & utility tests
│   ├── actions/
│   │   └── project.test.ts           # Server actions (44 tests)
│   ├── stores/
│   │   └── userStore.test.ts         # Zustand store tests
│   ├── prisma.test.ts                # Prisma client singleton
│   ├── utils.test.ts                 # Utility functions
│   └── categoryThumbnails.test.ts    # Category thumbnail mapping
│
├── components/                       # React component tests
│   ├── Header.test.tsx               # Header navigation
│   ├── Footer.test.tsx               # Footer component
│   ├── application/
│   │   └── ApplyButton.test.tsx      # Apply button component
│   └── browse/
│       └── SearchBar.test.tsx        # Search bar component
│
├── app/                              # App Router page tests
│   ├── layout.test.tsx               # Root layout metadata
│   ├── project/
│   │   └── page.test.tsx             # Project detail page
│   └── profile/
│       └── page.test.tsx             # User profile page
│
├── page.test.tsx                     # Home/Marketplace page
└── middleware.test.ts                # Route middleware
```

---

## Test Categories

### 1. Library Function Tests (`__tests__/lib/`)

Tests for utility functions, server actions, and stores.

#### Project Server Actions (`lib/actions/project.test.ts`) - 44 Tests

Tests all CRUD operations for projects:

```typescript
// Functions tested:
- createProject()      // Create new project
- editProject()        // Update existing project
- publishDraftProject() // Publish draft to open
- deleteProject()      // Delete project
- unarchiveProject()   // Restore archived project
- updateProjectStatus() // Change project status
```

**Test Categories:**
- ✅ Authentication validation (unauthenticated users blocked)
- ✅ Authorization checks (only owners can edit/delete)
- ✅ Input validation (required fields, proper formats)
- ✅ Database operations (create, update, delete)
- ✅ Status transitions (DRAFT → OPEN, etc.)
- ✅ Error handling (not found, permission denied)
- ✅ Badge awarding (first project badge)

**Mocking Strategy:**
```typescript
// Mocked dependencies
jest.mock("@clerk/nextjs/server");     // Authentication
jest.mock("@/lib/prisma");              // Database
jest.mock("@/lib/actions/badge");       // Badge system
```

#### Prisma Client Tests (`lib/prisma.test.ts`)

Tests the Prisma client singleton pattern:

- ✅ Singleton instance creation
- ✅ Development vs production behavior
- ✅ Global instance caching

#### Utility Functions (`lib/utils.test.ts`)

Tests helper functions used throughout the app:

- ✅ `cn()` - Tailwind class merging
- ✅ Date formatting utilities
- ✅ String manipulation functions

#### User Store Tests (`lib/stores/userStore.test.ts`)

Tests Zustand state management:

- ✅ Initial state values
- ✅ State updates (setDbUser, setLoaded)
- ✅ State persistence
- ✅ Store reset functionality

#### Category Thumbnails (`lib/categoryThumbnails.test.ts`)

Tests category to thumbnail mapping:

- ✅ All categories have thumbnails
- ✅ Fallback for unknown categories
- ✅ Correct path generation

---

### 2. React Component Tests (`__tests__/components/`)

Tests for UI components using React Testing Library.

#### Header Component (`components/Header.test.tsx`)

**Tests:**
- ✅ Logo rendering and navigation
- ✅ Navigation links (Browse, Settings)
- ✅ User authentication states (signed in/out)
- ✅ User menu dropdown
- ✅ Responsive behavior
- ✅ Notification badges

**Testing Approach:**
```typescript
// Uses React Testing Library
render(<Header />);
expect(screen.getByRole('navigation')).toBeInTheDocument();
expect(screen.getByText('Browse')).toBeInTheDocument();
```

#### Footer Component (`components/Footer.test.tsx`)

**Tests:**
- ✅ Footer structure and content
- ✅ Navigation links
- ✅ Social media links
- ✅ Copyright information
- ✅ Responsive layout

#### ApplyButton Component (`components/application/ApplyButton.test.tsx`)

**Tests:**
- ✅ Button rendering states
- ✅ Click handler functionality
- ✅ Loading states
- ✅ Disabled states
- ✅ Already applied state
- ✅ Authentication requirements

#### SearchBar Component (`components/browse/SearchBar.test.tsx`)

**Tests:**
- ✅ Input field rendering
- ✅ Search submission
- ✅ Debounced input
- ✅ Clear functionality
- ✅ Keyboard navigation
- ✅ Filter integration

---

### 3. App Page Tests (`__tests__/app/`)

Tests for Next.js App Router pages.

#### Root Layout (`app/layout.test.tsx`)

**Tests:**
- ✅ Metadata generation
- ✅ Font loading
- ✅ Provider wrapping
- ✅ Children rendering

#### Project Detail Page (`app/project/page.test.tsx`)

**Tests:**
- ✅ Project data fetching
- ✅ Project information display
- ✅ Owner vs visitor views
- ✅ Apply button visibility
- ✅ Not found handling
- ✅ Loading states

#### Profile Page (`app/profile/page.test.tsx`)

**Tests:**
- ✅ User data fetching
- ✅ Profile information display
- ✅ Own profile vs other's profile
- ✅ Education/Experience sections
- ✅ Not found handling

---

### 4. Root Level Tests

#### Home Page (`page.test.tsx`)

**Tests:**
- ✅ Marketplace rendering
- ✅ Featured projects display
- ✅ Category browsing
- ✅ Search functionality
- ✅ Responsive layout

#### Middleware (`middleware.test.ts`)

**Tests:**
- ✅ Route protection
- ✅ Public routes access
- ✅ Authentication redirects
- ✅ API route handling

---

## Running Unit Tests

### Run All Unit Tests

```bash
# Run all unit tests (excludes integration)
npm test -- --testPathIgnorePatterns="integration"

# Or run specific categories
npm test -- --testPathPatterns="__tests__/lib"
npm test -- --testPathPatterns="__tests__/components"
npm test -- --testPathPatterns="__tests__/app"
```

### Run Specific Test File

```bash
# Run project actions tests
npm test -- __tests__/lib/actions/project.test.ts

# Run Header component tests
npm test -- __tests__/components/Header.test.tsx
```

### Watch Mode

```bash
# Watch for changes and re-run tests
npm test -- --watch --testPathIgnorePatterns="integration"
```

### Coverage Report

```bash
# Generate coverage report for unit tests
npm test -- --coverage --testPathIgnorePatterns="integration"
```

---

## Mocking Strategy

Unit tests rely heavily on mocking to isolate the code under test.

### Common Mocks

#### Clerk Authentication

```typescript
// __mocks__/@clerk/nextjs/server.ts
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
  currentUser: jest.fn(() => ({ id: "user_123", email: "test@example.com" })),
}));
```

#### Prisma Database

```typescript
// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
```

#### Next.js Components

```typescript
// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

---

## Best Practices

### 1. Test Naming Convention

```typescript
describe("createProject", () => {
  it("should create a project successfully with valid data", () => {});
  it("should throw error when user is not authenticated", () => {});
  it("should throw error when required fields are missing", () => {});
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it("should create a project successfully", async () => {
  // Arrange
  const mockUser = { id: "user_123", role: "USER" };
  (auth as jest.Mock).mockResolvedValue({ userId: "clerk_123" });
  prisma.user.findUnique.mockResolvedValue(mockUser);

  // Act
  const result = await createProject(projectData);

  // Assert
  expect(result.success).toBe(true);
  expect(prisma.project.create).toHaveBeenCalled();
});
```

### 3. Test Isolation

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Reset all mocks before each test
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore original implementations
});
```

### 4. Component Testing

```typescript
// Use React Testing Library queries
import { render, screen, fireEvent } from "@testing-library/react";

it("should show loading state", () => {
  render(<ApplyButton loading={true} />);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" Errors

```bash
# Clear Jest cache
npm test -- --clearCache
```

#### 2. Mock Not Working

```typescript
// Ensure mock is before imports
jest.mock("@/lib/prisma");
import prisma from "@/lib/prisma"; // Must be after mock
```

#### 3. Async Test Failures

```typescript
// Always await async operations
it("should fetch data", async () => {
  await waitFor(() => {
    expect(screen.getByText("Data")).toBeInTheDocument();
  });
});
```

#### 4. React State Update Warnings

```typescript
// Wrap state updates in act()
import { act } from "@testing-library/react";

await act(async () => {
  fireEvent.click(button);
});
```

---

## Adding New Unit Tests

### 1. Create Test File

```typescript
// __tests__/lib/actions/newAction.test.ts
import { newAction } from "@/lib/actions/newAction";

jest.mock("@clerk/nextjs/server");
jest.mock("@/lib/prisma");

describe("newAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should do something", async () => {
    // Test implementation
  });
});
```

### 2. Follow Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Describe blocks: Function/component name
- It blocks: "should [expected behavior]"

### 3. Mock Dependencies

Always mock external dependencies to ensure isolation:
- Database calls (Prisma)
- Authentication (Clerk)
- External APIs
- File system operations

---

## Related Documentation

- [Main Test README](./README.md) - Overall test documentation
- [Integration Tests](./integration/README.md) - Integration test documentation
- [Jest Configuration](../jest.config.ts) - Jest setup
- [Jest Setup](../jest.setup.ts) - Global test setup
