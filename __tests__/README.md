# Test Documentation

## Overview

This directory contains unit tests for the SkillBridge application using Jest and React Testing Library.

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
