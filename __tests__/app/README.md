# App-Level Tests

This directory contains comprehensive unit tests for Next.js app-level components including layouts and dynamic pages.

## Test Files

### 1. `layout.test.tsx` (4 tests)
Tests for the root application layout (`app/layout.tsx`).

**Coverage:**
- ✅ Metadata validation (title, description)
- ✅ SEO metadata structure

**Note:** Full RootLayout component structure cannot be tested in Jest because it includes `<html>` and `<body>` tags which are incompatible with react-testing-library's render function. The component structure is validated through TypeScript compilation, Next.js build process, and manual verification.

**Test Categories:**
- **Metadata** - Validates exported metadata for SEO
- **Structure Validation** - Ensures metadata is properly defined

### 2. `project/page.test.tsx` (31 tests)
Tests for the dynamic project detail page (`app/project/[projectId]/page.tsx`).

**Coverage:**
- ✅ Project data rendering for OPEN projects
- ✅ Project data rendering for ASSIGNED/IN_PROGRESS/IN_REVIEW/COMPLETED/ARCHIVED projects
- ✅ Timeline fetching for non-OPEN projects
- ✅ Async params unwrapping
- ✅ Server action calls with correct parameters
- ✅ Different project statuses
- ✅ Projects with and without assigned students
- ✅ Data fetching order
- ✅ Edge cases (null project, minimal data, etc.)

**Test Categories:**
- **Rendering with OPEN project** (4 tests)
  - ProjectDetail component rendering
  - Project data passing
  - Timeline not fetched for OPEN status
  - Null timeline for OPEN projects

- **Rendering with ASSIGNED project** (4 tests)
  - ProjectDetail component rendering
  - Timeline fetching for assigned projects
  - Timeline data passing
  - Correct student ID in timeline call

- **Different project statuses** (5 tests)
  - Timeline fetching for ASSIGNED, IN_PROGRESS, IN_REVIEW, COMPLETED, ARCHIVED

- **Params handling** (4 tests)
  - ProjectId extraction from params
  - Different projectId formats
  - Async params unwrapping

- **Project without assigned student** (2 tests)
  - Null assignedStudent handling
  - Undefined assignedStudent handling

- **Data fetching** (3 tests)
  - Correct server action calls
  - Async data fetching
  - Fetch order (project before timeline)

- **Component props** (2 tests)
  - Both project and timeline props
  - Correct project object structure

- **Edge cases** (2 tests)
  - Empty timeline array
  - Minimal project data

- **Error scenarios** (1 test)
  - Null project data (documents that it throws)

### 3. `profile/page.test.tsx` (22 tests)
Tests for the dynamic user profile page (`app/profile/[userId]/page.tsx`).

**Coverage:**
- ✅ Profile components rendering (Header, Sidebar, Content)
- ✅ User data fetching and passing
- ✅ Completed projects fetching
- ✅ User not found handling (ProfileNotFound component)
- ✅ Different user roles (STUDENT, BUSINESS_OWNER, ADMIN)
- ✅ Async params unwrapping
- ✅ Component layout structure
- ✅ Data fetching order
- ✅ Edge cases (minimal user data, null projects, etc.)

**Test Categories:**
- **Rendering with valid student user** (5 tests)
  - All profile components rendering
  - User information display
  - Sidebar rendering
  - Completed projects passing
  - Completed projects fetching with correct ID

- **Rendering with valid business owner** (4 tests)
  - All profile components rendering
  - Completed projects fetching (called for all users)
  - Empty completed projects handling
  - Business owner information display

- **User not found handling** (5 tests)
  - ProfileNotFound rendering for null user
  - ProfileNotFound rendering for undefined user
  - Profile components not rendered
  - getUserByClerkId called before checking
  - Completed projects still fetched (documents actual behavior)

- **Params handling** (3 tests)
  - UserId extraction from params
  - Different userId formats
  - Async params unwrapping

- **Completed projects scenarios** (3 tests)
  - No completed projects
  - Many completed projects
  - Null completed projects response

- **Layout structure** (2 tests)
  - Correct component order (Header, Sidebar, Content)
  - Semantic structure (aside element)

- **Data fetching** (2 tests)
  - User fetched before projects
  - Async data fetching delays

- **Component props** (2 tests)
  - Correct user object to all components
  - User with all properties intact

- **Edge cases** (2 tests)
  - Minimal user data
  - Different role values

## Testing Patterns

### Async Server Components
All page components use the new Next.js 14+ async params pattern:
```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}

const { id } = await params;
```

Tests handle this by creating Promise-wrapped params:
```typescript
const params = Promise.resolve({ userId: "clerk-123" });
render(await ProfilePage({ params }));
```

### Server Actions Mocking
Server actions are fully mocked and their calls are verified:
```typescript
jest.mock("@/lib/actions/user", () => ({
  getUserByClerkId: jest.fn(),
}));

// Verify correct calls
expect(getUserByClerkId).toHaveBeenCalledWith("clerk-123");
```

### Component Mocking
Child components are mocked with test IDs for verification:
```typescript
jest.mock("@/components/profile/ProfileHeader", () => ({
  ProfileHeader: ({ user }: any) => (
    <div data-testid="profile-header">
      <div data-testid="user-name">{user.firstName} {user.lastName}</div>
    </div>
  ),
}));
```

### Not Found Handling
Profile page returns `ProfileNotFoundPage` instead of calling `notFound()`:
```typescript
if (!userData) {
  return <ProfileNotFoundPage />;
}
```

Tests verify the component is rendered:
```typescript
expect(screen.getByTestId("profile-not-found")).toBeInTheDocument();
```

## Test Coverage Summary

| File | Tests | Focus |
|------|-------|-------|
| `layout.test.tsx` | 4 | Metadata validation |
| `project/page.test.tsx` | 31 | Project details, timeline, status handling |
| `profile/page.test.tsx` | 22 | Profile display, user roles, not found |
| **Total** | **57** | **App-level page functionality** |

## Running the Tests

```bash
# Run all app tests
npm test -- __tests__/app

# Run specific test file
npm test -- __tests__/app/layout.test.tsx
npm test -- __tests__/app/project/page.test.tsx
npm test -- __tests__/app/profile/page.test.tsx

# Watch mode for development
npm test -- __tests__/app --watch

# Coverage report
npm test -- __tests__/app --coverage
```

## Dependencies

- **Jest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers

## Limitations

1. **RootLayout Testing**: Cannot fully test RootLayout component due to `<html>` and `<body>` tags which are incompatible with react-testing-library. Metadata is tested separately.

2. **Error Boundaries**: Error handling in async components is documented but not fully testable in unit tests (e.g., project page with null data throws instead of rendering error UI).

3. **Client-Side Navigation**: Tests focus on server-side rendering and data fetching. Client-side routing and interactions require E2E tests.

## Best Practices

1. **Mock Everything External**: All server actions, components, and external libraries are mocked
2. **Test Actual Behavior**: Tests reflect actual component behavior, not ideal behavior (documented with comments when behavior could be improved)
3. **Async Patterns**: All tests properly await async components and server actions
4. **Type Safety**: TypeScript ensures mock objects match actual types
5. **Comprehensive Coverage**: Tests cover happy path, edge cases, and error scenarios

## Future Improvements

1. Add E2E tests for full page interactions
2. Add integration tests once error boundaries are implemented
3. Consider testing layout structure once Next.js provides testing utilities for app router layouts
4. Add performance testing for data fetching operations

## Contributors

Last Updated: 2024
Test Infrastructure: Jest + React Testing Library
Coverage: 57 passing tests across 3 app-level files
