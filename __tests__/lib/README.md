# Lib Utility Functions Tests

This directory contains comprehensive unit tests for all utility functions and helpers in the `lib/` directory.

## Test Files

### 1. `utils.test.ts`
Tests for core utility functions in `lib/utils.ts`:

**Functions Tested:**
- `cn()` - Class name merging utility
- `formatDate()` - Date formatting function

**Test Coverage:**
- ✅ Basic functionality with multiple class names
- ✅ Conditional class names and object notation
- ✅ Tailwind CSS class merging and conflict resolution
- ✅ Edge cases (empty strings, null, undefined, arrays)
- ✅ Date formatting with all months
- ✅ Day suffix logic (1st, 2nd, 3rd, 4th, etc.)
- ✅ Special cases (11th, 12th, 13th)
- ✅ Leap year dates
- ✅ Boundary conditions (first/last day of year)
- ✅ Different date input formats (timestamp, ISO string)
- ✅ Error handling for invalid dates

### 2. `categoryThumbnails.test.ts`
Tests for category thumbnail mapping in `lib/categoryThumbnails.ts`:

**Functions Tested:**
- `getCategoryThumbnail()` - Maps project categories to thumbnail paths

**Test Coverage:**
- ✅ All 62+ project categories across multiple domains:
  - Tech & Development (13 categories)
  - Business & Analytics (7 categories)
  - Creative & Media (7 categories)
  - Writing & Communication (3 categories)
  - Legal & Healthcare (3 categories)
  - Engineering (4 categories)
  - Education & Research (2 categories)
  - E-commerce & Business (4 categories)
  - Design & Architecture (2 categories)
  - Nonprofit & Government (3 categories)
  - Agriculture & Food (2 categories)
  - Hospitality & Tourism (2 categories)
  - Industries (10 categories)
- ✅ Fallback behavior for unknown categories
- ✅ Edge cases (empty string, null, undefined)
- ✅ Case sensitivity testing
- ✅ Input validation (whitespace, special characters, numeric input)
- ✅ Consistency checks for output format
- ✅ Complete category coverage verification

### 3. `prisma.test.ts`
Tests for Prisma client initialization in `lib/prisma.ts`:

**Functionality Tested:**
- Prisma client singleton pattern
- Environment-specific behavior
- Module exports and structure

**Test Coverage:**
- ✅ Module exports and default export
- ✅ Singleton pattern in non-production environments
- ✅ Global prisma instance management
- ✅ Production vs development environment handling
- ✅ Client instantiation and reuse
- ✅ Database models availability (user, project, application)
- ✅ Prisma client methods ($connect, $disconnect, $transaction, etc.)
- ✅ Type safety and TypeScript compatibility
- ✅ Error handling for invalid configurations
- ✅ Environment-specific behavior (development, test, production, staging)
- ✅ Module consistency across multiple imports

### 4. `stores/userStore.test.ts`
Tests for authentication store hook in `lib/stores/userStore.ts`:

**Hooks Tested:**
- `useUserAuth()` - Custom authentication hook wrapping Clerk

**Test Coverage:**
- ✅ Authenticated state handling
- ✅ Unauthenticated state handling
- ✅ Loading state management
- ✅ Edge cases (null, undefined values)
- ✅ User object properties and completeness
- ✅ Loading state transitions
- ✅ Return value structure and types
- ✅ Consistency between authentication state and user presence
- ✅ Sign-out scenarios
- ✅ Multiple rapid rerenders stability
- ✅ Error scenarios and unexpected values
- ✅ Integration with Clerk hooks (useAuth, useUser)

## Running the Tests

### Run all lib tests
```bash
npm test -- __tests__/lib
```

### Run specific test file
```bash
npm test -- __tests__/lib/utils.test.ts
npm test -- __tests__/lib/categoryThumbnails.test.ts
npm test -- __tests__/lib/prisma.test.ts
npm test -- __tests__/lib/stores/userStore.test.ts
```

### Run with coverage
```bash
npm test -- __tests__/lib --coverage
```

### Run in watch mode
```bash
npm test -- __tests__/lib --watch
```

## Test Structure

All tests follow the same structure:
```typescript
describe("Function/Module Name", () => {
  describe("feature group", () => {
    it("should behavior description", () => {
      // Test implementation
    });
  });
});
```

## Coverage Goals

These tests aim for comprehensive coverage including:
- ✅ **Happy path scenarios** - Normal, expected usage
- ✅ **Edge cases** - Boundary values, empty inputs, extremes
- ✅ **Error handling** - Invalid inputs, unexpected states
- ✅ **Type safety** - TypeScript type checking and validation
- ✅ **Consistency** - Multiple calls produce same results
- ✅ **Integration** - Interaction with dependencies (mocked)

## Mocking Strategy

- **Clerk hooks** (`useAuth`, `useUser`) - Mocked using Jest
- **Prisma Client** - Tested for structure, not database operations
- **Environment variables** - Managed using helper functions to avoid read-only errors

## Key Testing Patterns

### 1. Parameterized Tests
```typescript
const testCases = [/* ... */];
testCases.forEach((testCase) => {
  it(`should handle ${testCase}`, () => {
    // Test implementation
  });
});
```

### 2. State Transitions
```typescript
const { result, rerender } = renderHook(() => useHook());
// Change state
rerender();
await waitFor(() => {
  expect(result.current.state).toBe(expectedState);
});
```

### 3. Edge Case Coverage
```typescript
describe("edge cases", () => {
  it("should handle null", () => { /* ... */ });
  it("should handle undefined", () => { /* ... */ });
  it("should handle empty string", () => { /* ... */ });
  // etc.
});
```

## Best Practices

1. **Descriptive test names** - Use "should" statements
2. **Arrange-Act-Assert** - Clear test structure
3. **One assertion per concept** - Focus each test
4. **Isolated tests** - No dependencies between tests
5. **Cleanup** - Use beforeEach/afterEach to reset state
6. **Type safety** - Test TypeScript types where applicable

## Dependencies

These tests require:
- Jest (testing framework)
- @testing-library/react (React hook testing)
- @clerk/nextjs (mocked for auth testing)
- @prisma/client (Prisma ORM)

## Notes

- **Prisma tests** focus on module structure rather than database operations
- **Hook tests** use React Testing Library's `renderHook` utility
- **Environment tests** use helper functions to avoid TypeScript read-only errors
- **Coverage** includes all utility functions in the lib/ directory
