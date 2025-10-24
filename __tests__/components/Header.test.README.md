# Header Component Test Documentation

## Overview

This file contains comprehensive unit and integration tests for the `Header` and `HeaderContent` components, which provide the main navigation and authentication interface for the SkillBridge application.

## Components Under Test

### `Header` (Server Component)
**Location**: `components/Header.tsx`

**Responsibilities**:
- Fetches user authentication state via `getUserOrNull()`
- Fetches unresponded application count for business owners via `getTotalUnrespondedApplication()`
- Passes data to `HeaderContent` for rendering

### `HeaderContent` (Client Component)
**Location**: `components/HeaderContent.tsx`

**Responsibilities**:
- Renders SKILLBRIDGE logo and branding
- Displays search bar for project filtering
- Shows authentication UI (Sign in/Get Started buttons when signed out)
- Displays user-specific UI when signed in (UserButton, Post Project button)
- Provides role-specific menu items (USER vs BUSINESS_OWNER)
- Shows notification badges for unresponded applications
- Handles client-side user data fetching when needed
- Conditionally renders based on current pathname (hides on /sign-in and /sign-up)

## Test Structure

### Test File
`__tests__/components/Header.test.tsx`

### Total Coverage
- **49 test cases**
- **100% passing**
- **11 test suites/categories**

## Detailed Test Coverage

### 1. Server Component Rendering (5 tests)

Tests the server-side logic of the `Header` component:

```typescript
✓ should call getUserOrNull to fetch user data
✓ should call getTotalUnrespondedApplication for BUSINESS_OWNER users
✓ should not call getTotalUnrespondedApplication for USER role
✓ should handle errors when fetching unresponded applications
✓ should render HeaderContent with user and applications data
```

**Key Validations**:
- Server actions are called appropriately
- Role-based conditional logic works correctly
- Error handling doesn't crash the component
- Data flows correctly to HeaderContent

### 2. Brand/Logo Rendering (3 tests)

Tests the SKILLBRIDGE logo display:

```typescript
✓ should render the SKILLBRIDGE logo with correct text
✓ should render logo as a link to homepage
✓ should apply correct styling classes to logo
```

**Key Validations**:
- Logo text is "SKILL" and "BRIDGE."
- Logo links to "/" (homepage)
- Responsive typography classes are applied

### 3. Navigation and Search Bar (2 tests)

Tests the search functionality:

```typescript
✓ should render search bar component
✓ should render search bar in center position on large screens
```

**Key Validations**:
- SearchBar component is rendered
- Positioning classes for centered layout are correct

### 4. Signed Out State (5 tests)

Tests the UI for unauthenticated users:

```typescript
✓ should render "Sign in" button when user is signed out
✓ should render "Get Started" button when user is signed out
✓ should link "Sign in" button to /sign-in
✓ should link "Get Started" button to /sign-up
✓ should not render UserButton when signed out
```

**Key Validations**:
- Authentication CTAs are visible
- Links navigate to correct routes
- User-specific UI is hidden

### 5. Signed In State - USER Role (7 tests)

Tests the UI for authenticated student users:

```typescript
✓ should render UserButton when signed in
✓ should render Bio profile page for USER role
✓ should render Experience profile page for USER role
✓ should render Education profile page for USER role
✓ should render Applications profile page for USER role
✓ should render profile link with correct URL for USER role
✓ should not render "Post a Project" button for USER role
✓ should not render Posted Projects page for USER role
```

**Key Validations**:
- UserButton is displayed
- USER-specific menu items appear (Bio, Experience, Education, Applications)
- BUSINESS_OWNER-specific features are hidden
- Profile link uses correct clerkId

### 6. Signed In State - BUSINESS_OWNER Role (7 tests)

Tests the UI for authenticated business owners:

```typescript
✓ should render "Post a Project" button for BUSINESS_OWNER role
✓ should open PostProjectModal when "Post a Project" is clicked
✓ should render Bio profile page for BUSINESS_OWNER role
✓ should render Posted Projects profile page for BUSINESS_OWNER role
✓ should render Applications profile page for BUSINESS_OWNER role
✓ should not render Experience page for BUSINESS_OWNER role
✓ should not render Education page for BUSINESS_OWNER role
```

**Key Validations**:
- "Post a Project" button is displayed
- Modal opens on button click
- BUSINESS_OWNER-specific menu items appear (Bio, Posted Projects, Applications)
- USER-specific features are hidden (Experience, Education)

### 7. Notification Badge Display (5 tests)

Tests the unresponded applications notification badge:

```typescript
✓ should display notification badge when unresponded applications > 0
✓ should not display notification badge when unresponded applications = 0
✓ should not display notification badge when unresponded applications is null
✓ should display correct count in notification badge
✓ should style notification badge with red background
```

**Key Validations**:
- Badge appears only when count > 0
- Badge displays correct number
- Badge has proper styling (red background, rounded, white text)

### 8. Accessibility (6 tests)

Tests accessibility and semantic HTML:

```typescript
✓ should render header as a semantic header element
✓ should have proper heading hierarchy for logo
✓ should have accessible button elements for actions
✓ should have proper link elements with href attributes
✓ should use semantic navigation structure
✓ should have visible focus indicators on interactive elements
```

**Key Validations**:
- Uses semantic `<header>` element
- Logo uses `<h1>` tags
- Interactive elements are proper `<button>` or `<a>` tags
- Focus states are visible for keyboard navigation

### 9. Client-Side User Fetching (2 tests)

Tests the client-side user data synchronization:

```typescript
✓ should fetch user from database when Clerk user loads
✓ should not fetch user if already provided via server props
```

**Key Validations**:
- Fetches user when Clerk authentication loads
- Avoids redundant fetches when data is already available

### 10. Path-based Rendering (3 tests)

Tests conditional rendering based on URL:

```typescript
✓ should not render header on sign-in page
✓ should not render header on sign-up page
✓ should render header on other pages
```

**Key Validations**:
- Header is hidden on /sign-in and /sign-up routes
- Header appears on all other routes

### 11. Responsive Design (3 tests)

Tests responsive CSS classes:

```typescript
✓ should apply responsive classes to logo
✓ should apply responsive classes to action buttons
✓ should hide search bar on small screens
```

**Key Validations**:
- Tailwind responsive classes are applied correctly
- Mobile, tablet, and desktop layouts are handled
- Search bar is hidden on mobile

## Mocking Strategy

### External Dependencies

#### Clerk Authentication
```typescript
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }) => mockIsSignedIn ? <div>{children}</div> : null,
  SignedOut: ({ children }) => !mockIsSignedIn ? <div>{children}</div> : null,
  UserButton: ({ children }) => <div data-testid="user-button">{children}</div>,
  useUser: jest.fn(() => ({ user: null, isLoaded: true })),
}));
```

**Why**: Clerk SDK requires API keys and makes network requests. Mocking allows us to test authentication states without actual authentication.

#### Server Actions
```typescript
jest.mock('@/lib/actions/user');
jest.mock('@/lib/actions/application');
```

**Why**: Server actions interact with the database. Mocking allows testing without database connections.

#### Next.js Navigation
```typescript
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));
```

**Why**: Allows testing path-based conditional rendering without actual routing.

### Child Components

All child components are mocked to isolate Header testing:

```typescript
jest.mock('@/components/setting/UserExperience');
jest.mock('@/components/setting/UserEducation');
jest.mock('@/components/setting/UserInformation');
jest.mock('@/components/project/PostProjectModal');
jest.mock('@/components/setting/OrganizationPostedProject');
jest.mock('@/components/browse/SearchBar');
jest.mock('@/components/setting/UserApplication');
jest.mock('@/components/setting/OrganizationApplication');
```

**Why**: Focus tests on Header logic, not child component implementation.

## Mock Data

### Mock USER
```typescript
const mockUserRole = {
  id: 'user-1',
  clerkId: 'clerk-1',
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  bio: 'Student bio',
  skills: ['JavaScript', 'React'],
  totalHoursContributed: 50,
  projectsCompleted: 3,
  industriesExperienced: ['Technology'],
  // ... all required fields
};
```

### Mock BUSINESS_OWNER
```typescript
const mockBusinessOwner = {
  id: 'user-2',
  clerkId: 'clerk-2',
  email: 'business@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'BUSINESS_OWNER',
  bio: 'Business owner bio',
  // ... all required fields
};
```

## Helper Functions

### `setMockSignedInState(isSignedIn: boolean)`

Controls whether the component renders in signed-in or signed-out state:

```typescript
// Test signed out state
setMockSignedInState(false);
render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

// Test signed in state
setMockSignedInState(true);
render(<HeaderContent user={mockUser} totalUnrespondedApplications={0} />);
```

## Test Patterns

### Testing Server Components
```typescript
it('should call getUserOrNull to fetch user data', async () => {
  mockGetUserOrNull.mockResolvedValue(null);
  
  await Header();

  expect(mockGetUserOrNull).toHaveBeenCalledTimes(1);
});
```

### Testing Conditional Rendering
```typescript
it('should not render "Post a Project" button for USER role', () => {
  setMockSignedInState(true);
  render(<HeaderContent user={mockUserRole} totalUnrespondedApplications={null} />);

  expect(screen.queryByText('Post a Project')).not.toBeInTheDocument();
});
```

### Testing User Interactions
```typescript
it('should open PostProjectModal when "Post a Project" is clicked', async () => {
  const user = userEvent.setup();
  setMockSignedInState(true);
  render(<HeaderContent user={mockBusinessOwner} totalUnrespondedApplications={null} />);

  const postButton = screen.getByText('Post a Project');
  await user.click(postButton);

  await waitFor(() => {
    expect(screen.getByTestId('post-project-modal')).toBeInTheDocument();
  });
});
```

### Testing Accessibility
```typescript
it('should render header as a semantic header element', () => {
  const { container } = render(<HeaderContent user={null} totalUnrespondedApplications={null} />);

  const header = container.querySelector('header');
  expect(header).toBeInTheDocument();
});
```

## Running Header Tests

### Run Only Header Tests
```bash
npm test -- __tests__/components/Header.test.tsx
```

### Run in Watch Mode
```bash
npm run test:watch -- __tests__/components/Header.test.tsx
```

### Run with Coverage
```bash
npm test -- __tests__/components/Header.test.tsx --coverage
```

## Key Features Tested

### ✅ Authentication States
- Signed out: Shows Sign in and Get Started buttons
- Signed in (USER): Shows UserButton with student-specific menu
- Signed in (BUSINESS_OWNER): Shows UserButton with business-specific menu + Post Project button

### ✅ Role-Based Features
- **USER role**: Experience, Education, Applications menu items
- **BUSINESS_OWNER role**: Posted Projects, Applications menu items, Post Project button
- **Common**: Bio menu item, profile link

### ✅ Notifications
- Badge appears when unresponded applications > 0
- Badge shows correct count
- Badge has proper styling

### ✅ Navigation
- Logo links to homepage
- Sign in button links to /sign-in
- Get Started button links to /sign-up
- Profile link uses user's clerkId

### ✅ Responsive Design
- Mobile: Smaller text, hidden search bar
- Tablet: Medium text sizes
- Desktop: Full-size elements, centered search bar

### ✅ Accessibility
- Semantic HTML (`<header>`, `<h1>`, `<button>`, `<a>`)
- Proper heading hierarchy
- Keyboard navigation support
- Focus indicators

## Common Issues and Solutions

### Issue: Tests fail with "Cannot find module '@clerk/nextjs'"
**Solution**: Ensure Clerk mocks are defined before imports:
```typescript
jest.mock('@clerk/nextjs/server', () => ({ ... }));
jest.mock('@clerk/nextjs', () => ({ ... }));
```

### Issue: SignedIn/SignedOut both render
**Solution**: Use conditional mock that checks `__mockIsSignedIn` flag:
```typescript
SignedIn: ({ children }) => mockIsSignedIn ? <div>{children}</div> : null,
SignedOut: ({ children }) => !mockIsSignedIn ? <div>{children}</div> : null,
```

### Issue: UserButton doesn't appear in tests
**Solution**: Call `setMockSignedInState(true)` before rendering:
```typescript
beforeEach(() => {
  setMockSignedInState(true);
});
```

## Best Practices Demonstrated

1. **Isolated Testing**: Each test focuses on one specific behavior
2. **Comprehensive Mocking**: All external dependencies are mocked
3. **Role-Based Testing**: Separate test suites for different user roles
4. **Accessibility First**: Dedicated tests for ARIA and semantic HTML
5. **Responsive Testing**: Validate mobile, tablet, and desktop layouts
6. **Error Handling**: Test graceful degradation when API calls fail
7. **User Interactions**: Test click handlers and modal openings
8. **Conditional Logic**: Test all branches of if/else statements

## Future Enhancements

Potential areas for additional test coverage:

1. **Keyboard Navigation**: Test tab order and keyboard accessibility
2. **Screen Reader**: Test ARIA labels and announcements
3. **Performance**: Test component re-render optimization
4. **Network States**: Test loading states during user fetch
5. **Edge Cases**: Test very long usernames, special characters
6. **Animation**: Test modal open/close transitions
7. **Multi-language**: Test internationalization if added

## Contributing

When adding new features to Header:

1. Add corresponding test cases
2. Ensure all existing tests still pass
3. Update this documentation with new test descriptions
4. Follow the existing test patterns and structure
5. Run `npm test` before committing

## Related Documentation

- [Main Test README](../README.md)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Clerk Testing Guide](https://clerk.com/docs/testing)
