# Test Documentation

## Overview

This directory contains unit and integration tests for the SkillBridge application using Jest and React Testing Library.

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
