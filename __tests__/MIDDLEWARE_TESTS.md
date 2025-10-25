# Middleware Unit Tests

## Overview
Comprehensive unit tests for `middleware.ts` to ensure robust routing and authentication logic using Jest patterns.

## Test File
- **Location**: `__tests__/middleware.test.ts`
- **Total Tests**: 37
- **Status**: ✅ All Passing

## Test Coverage

### 1. Route Matching Configuration (2 tests)
- ✅ Creates route matcher with correct public routes
- ✅ Has correct matcher config for static files and API routes

### 2. Public Routes - No Authentication Required (7 tests)
Tests that verify users can access public routes without authentication:
- ✅ Sign-in page (`/sign-in`)
- ✅ Sign-up page (`/sign-up`)
- ✅ Homepage (`/`)
- ✅ Webhook API routes (`/api/webhooks/*`)
- ✅ Profile pages (`/profile/*`)
- ✅ Nested sign-in routes (`/sign-in/sso-callback`)
- ✅ Nested sign-up routes (`/sign-up/verify-email`)

### 3. Protected Routes - Authentication Required (5 tests)
Tests that verify authentication is required for protected routes:
- ✅ Project detail pages (`/project/*`)
- ✅ Dashboard routes (`/dashboard`)
- ✅ Custom API routes (`/api/projects`)
- ✅ `auth.protect()` called exactly once
- ✅ `auth.protect()` is properly awaited

### 4. Route Protection Logic (2 tests)
- ✅ No `protect()` call for public routes
- ✅ `protect()` called for all non-public routes

### 5. Edge Cases and Error Handling (5 tests)
- ✅ Handles undefined pathname gracefully
- ✅ Handles `protect()` throwing errors
- ✅ Handles route matcher returning undefined
- ✅ Handles empty pathname
- ✅ Handles query parameters in URL

### 6. Matcher Configuration - Static Files (4 tests)
- ✅ Excludes Next.js internal files (`_next`)
- ✅ Excludes common static file extensions (images, fonts, etc.)
- ✅ Includes JSON files (using negative lookahead `js(?!on)`)
- ✅ Always runs for API routes (`/api/*`, `/trpc/*`)

### 7. Authentication Context (3 tests)
- ✅ Receives auth object with `protect` method
- ✅ Receives request object correctly
- ✅ Works with different HTTP methods (GET, POST, PUT, DELETE, PATCH)

### 8. Routing Behavior (4 tests)
- ✅ Handles root path (`/`)
- ✅ Handles deeply nested routes (`/project/123/applications/456/details`)
- ✅ Handles routes with special characters (`/project/test-123_abc`)
- ✅ Handles trailing slashes (`/profile/user-123/`)

### 9. Async Behavior (2 tests)
- ✅ Handles middleware as async function
- ✅ Waits for `protect()` to complete before proceeding

### 10. Integration with clerkMiddleware (3 tests)
- ✅ Wraps handler with `clerkMiddleware`
- ✅ Exports middleware as default export
- ✅ Exports config object with matcher patterns

## Mock Configuration

### Clerk Middleware Mock
```typescript
const mockIsPublicRoute = jest.fn();

jest.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: jest.fn((handler) => {
    middlewareHandler = handler;
    return handler;
  }),
  createRouteMatcher: jest.fn(() => mockIsPublicRoute),
}));
```

### Key Implementation Details
1. **Route Matcher**: `mockIsPublicRoute` is a shared mock function that's configured per test
2. **Handler Capture**: The middleware handler is captured during module initialization
3. **Module Loading**: Middleware is loaded once at the top level to preserve mock call history
4. **Mock Cleanup**: Only `mockIsPublicRoute` is cleared between tests to preserve initialization calls

## Public Routes Tested
The following routes are configured as public (no authentication required):
- `/sign-in(.*)`
- `/sign-up(.*)`
- `/` (homepage)
- `/api/webhooks(.*)`
- `/profile(.*)`

## Static File Exclusions
The matcher config excludes these file types from middleware processing:
- HTML files (`html?`)
- CSS files
- JavaScript files (excluding JSON: `js(?!on)`)
- Images (`jpe?g`, `webp`, `png`, `gif`, `svg`)
- Fonts (`ttf`, `woff2?`)
- Other static assets (`ico`, `csv`, `docx?`, `xlsx?`, `zip`, `webmanifest`)

## Running Tests

```bash
# Run all tests
npm test

# Run only middleware tests
npm test -- __tests__/middleware.test.ts

# Run with coverage
npm test -- --coverage __tests__/middleware.test.ts
```

## Test Execution Results
```
Test Suites: 1 passed, 1 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        ~1s
```

## Key Testing Patterns Used

1. **Mock Setup**: Jest mocks configured at module level before imports
2. **Handler Capture**: Middleware handler function captured via mock implementation
3. **Mock Isolation**: Only route matcher cleared between tests
4. **Async Testing**: Proper use of `async/await` in test functions
5. **Error Testing**: Verification of error propagation from `auth.protect()`
6. **Edge Cases**: Testing undefined, null, and empty values

## Benefits

- ✅ **Complete Coverage**: All routing logic paths tested
- ✅ **Authentication Gating**: Verifies protected routes require auth
- ✅ **Public Access**: Confirms public routes bypass authentication
- ✅ **Error Handling**: Tests error scenarios and edge cases
- ✅ **Configuration**: Validates static file and API route matchers
- ✅ **Async Behavior**: Ensures proper async/await patterns
- ✅ **Type Safety**: All tests written in TypeScript with no type errors
