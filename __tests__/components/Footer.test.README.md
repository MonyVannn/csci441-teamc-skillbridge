# Footer Component Test Documentation

## Overview

This file contains comprehensive unit tests for the `Footer` component, which provides the site-wide footer with navigation links, branding, and copyright information.

## Component Under Test

### `Footer` (Client Component)
**Location**: `components/Footer.tsx`

**Responsibilities**:
- Displays SKILLBRIDGE logo and tagline
- Provides navigation links organized into three sections:
  - **Company**: About Us, Explore
  - **Need Help**: Contact Us, Blog
  - **Community**: X (Twitter), LinkedIn, Instagram
- Shows copyright notice with current year
- Conditionally renders based on pathname (hides on /sign-in and /sign-up)
- Uses responsive design for mobile, tablet, and desktop layouts
- Applies dark theme styling consistent with site design

## Test Structure

### Test File
`__tests__/components/Footer.test.tsx`

### Total Coverage
- **60 test cases**
- **100% passing**
- **12 test suites/categories**

## Detailed Test Coverage

### 1. Basic Rendering (3 tests)

Tests the fundamental rendering of the Footer component:

```typescript
✓ should render the footer element
✓ should have correct background styling
✓ should render within a container
```

**Key Validations**:
- Footer uses semantic `<footer>` element
- Dark background theme (`bg-[#121212]`)
- Content wrapped in responsive container

### 2. Logo and Tagline (5 tests)

Tests the branding section:

```typescript
✓ should render the SKILLBRIDGE logo
✓ should render logo with correct styling
✓ should use h1 tags for logo text
✓ should render the tagline text
✓ should style tagline with correct classes
```

**Key Validations**:
- Logo displays "SKILL" and "BRIDGE."
- Logo uses brand color (`text-[#1DBF9F]`)
- Logo text uses `<h1>` tags for SEO
- Tagline: "Jumpstart your career as a new graduates with SkillBridge."
- Proper typography and color classes

### 3. Company Section (5 tests)

Tests the Company navigation column:

```typescript
✓ should render COMPANY section header
✓ should render COMPANY header as h3
✓ should render ABOUT US link
✓ should render EXPLORE link
✓ should have correct link styling for Company links
```

**Key Validations**:
- Section header is "COMPANY" in `<h3>` tag
- Contains 2 links: "ABOUT US" and "EXPLORE"
- Links have hover effects and transitions

### 4. Need Help Section (5 tests)

Tests the Help navigation column:

```typescript
✓ should render NEED HELP? section header
✓ should render NEED HELP? header as h3
✓ should render CONTACT US link
✓ should render BLOG link
✓ should have correct link styling for Help links
```

**Key Validations**:
- Section header is "NEED HELP?" in `<h3>` tag
- Contains 2 links: "CONTACT US" and "BLOG"
- Consistent styling with other sections

### 5. Community Section (6 tests)

Tests the Community/Social navigation column:

```typescript
✓ should render COMMUNITY section header
✓ should render COMMUNITY header as h3
✓ should render X (Twitter) link
✓ should render LINKEDIN link
✓ should render INSTAGRAM link
✓ should have correct link styling for Community links
```

**Key Validations**:
- Section header is "COMMUNITY" in `<h3>` tag
- Contains 3 social links: "X", "LINKEDIN", "INSTAGRAM"
- All links have proper hover states

### 6. Copyright Section (4 tests)

Tests the copyright notice:

```typescript
✓ should render copyright text
✓ should display current year 2025 in copyright
✓ should style copyright text correctly
✓ should have border separator above copyright
```

**Key Validations**:
- Copyright text: "SkillBridge. All Rights Reserved © 2025."
- Includes current year (2025)
- Has border separator above
- Proper text styling (gray, small size)

### 7. Link Structure (3 tests)

Tests the HTML structure and attributes of links:

```typescript
✓ should render all links as anchor elements
✓ should have href attributes on all links
✓ should have placeholder href="#" for all links
```

**Key Validations**:
- All 7 links are proper `<a>` elements
- All links have `href` attributes
- Currently using placeholder `href="#"` values

### 8. Footer Blocks Presence (4 tests)

Tests the major structural sections:

```typescript
✓ should have three main navigation columns
✓ should have logo/tagline block
✓ should have copyright block
✓ should render all major blocks in correct order
```

**Key Validations**:
- Three navigation columns present
- Logo/tagline section present
- Copyright section present
- Correct rendering order: Logo → Company → Help → Community → Copyright

### 9. Responsive Layout (4 tests)

Tests responsive grid system:

```typescript
✓ should apply responsive grid classes to main layout
✓ should apply responsive grid classes to navigation columns
✓ should apply correct column spans for logo section
✓ should apply correct column positioning for navigation
```

**Key Validations**:
- Main grid: 1 column mobile, 5 columns desktop
- Navigation grid: 1 column mobile, 3 columns tablet+
- Logo section spans 2 columns on desktop
- Navigation section positioned correctly

### 10. Accessibility (5 tests)

Tests accessibility and semantic HTML:

```typescript
✓ should use semantic footer element
✓ should have proper heading hierarchy
✓ should have accessible link elements
✓ should use unordered lists for navigation
✓ should use list items for each link
```

**Key Validations**:
- Uses semantic `<footer>` element
- Proper heading hierarchy (h1 for logo, h3 for sections)
- 7 accessible link elements
- Navigation organized in unordered lists
- Proper list item structure

### 11. Path-based Rendering (5 tests)

Tests conditional rendering based on URL:

```typescript
✓ should not render footer on sign-in page
✓ should not render footer on sign-up page
✓ should render footer on sign-in subpaths
✓ should render footer on homepage
✓ should render footer on other pages
```

**Key Validations**:
- Hidden on `/sign-in` and `/sign-up` routes
- Hidden on auth subpaths like `/sign-in/verify`
- Visible on homepage and all other pages

### 12. Styling and Visual Design (5 tests)

Tests visual styling and theming:

```typescript
✓ should have dark background theme
✓ should have appropriate padding
✓ should have gap between grid items
✓ should apply hover styles to links
✓ should apply transition effects to links
```

**Key Validations**:
- Dark background: `bg-[#121212]`
- Appropriate padding: `px-8 py-16`
- Grid gap: `gap-12`
- Hover effects: `hover:text-gray-400`
- Smooth transitions: `transition-colors`

### 13. Content Validation (6 tests)

Tests content completeness and accuracy:

```typescript
✓ should contain exactly 7 navigation links
✓ should contain exactly 3 section headers
✓ should have all Company section links
✓ should have all Help section links
✓ should have all Community section links
✓ should contain SkillBridge branding in both logo and copyright
```

**Key Validations**:
- Total of 7 links (2 + 2 + 3)
- 3 section headers (Company, Need Help, Community)
- All expected links present
- SkillBridge brand name appears in multiple places

## Mocking Strategy

### Next.js Navigation
```typescript
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));
```

**Why**: Allows testing path-based conditional rendering without actual routing.

**No Other Mocks Needed**: The Footer component is self-contained with no external dependencies, child components, or API calls.

## Test Patterns

### Testing Basic Rendering
```typescript
it('should render the footer element', () => {
  const { container } = render(<Footer />);
  
  const footer = container.querySelector('footer');
  expect(footer).toBeInTheDocument();
});
```

### Testing Content Presence
```typescript
it('should render the SKILLBRIDGE logo', () => {
  render(<Footer />);
  
  const skillText = screen.getByText('SKILL');
  const bridgeText = screen.getByText('BRIDGE.');
  
  expect(skillText).toBeInTheDocument();
  expect(bridgeText).toBeInTheDocument();
});
```

### Testing Link Structure
```typescript
it('should render all links as anchor elements', () => {
  render(<Footer />);
  
  const aboutLink = screen.getByText('ABOUT US').closest('a');
  expect(aboutLink?.tagName).toBe('A');
});
```

### Testing Conditional Rendering
```typescript
it('should not render footer on sign-in page', () => {
  const { usePathname } = require('next/navigation');
  usePathname.mockReturnValue('/sign-in');

  const { container } = render(<Footer />);

  expect(container.firstChild).toBeNull();
});
```

### Testing Responsive Design
```typescript
it('should apply responsive grid classes to main layout', () => {
  const { container } = render(<Footer />);
  
  const gridContainer = container.querySelector('.grid');
  expect(gridContainer).toHaveClass('grid-cols-1');
  expect(gridContainer).toHaveClass('lg:grid-cols-5');
});
```

### Testing Accessibility
```typescript
it('should have proper heading hierarchy', () => {
  render(<Footer />);
  
  const h1Elements = screen.getAllByRole('heading', { level: 1 });
  const h3Elements = screen.getAllByRole('heading', { level: 3 });
  
  expect(h1Elements.length).toBeGreaterThan(0);
  expect(h3Elements.length).toBe(3);
});
```

## Running Footer Tests

### Run Only Footer Tests
```bash
npm test -- __tests__/components/Footer.test.tsx
```

### Run in Watch Mode
```bash
npm run test:watch -- __tests__/components/Footer.test.tsx
```

### Run with Coverage
```bash
npm test -- __tests__/components/Footer.test.tsx --coverage
```

## Footer Structure

### Layout Breakdown

```
Footer
├── Logo & Tagline Section (2 cols on desktop)
│   ├── SKILLBRIDGE Logo (H1)
│   └── Tagline
│
├── Navigation Section (3 cols on desktop, starts col 4)
│   ├── Company Column
│   │   ├── COMPANY (H3)
│   │   ├── ABOUT US
│   │   └── EXPLORE
│   │
│   ├── Need Help Column
│   │   ├── NEED HELP? (H3)
│   │   ├── CONTACT US
│   │   └── BLOG
│   │
│   └── Community Column
│       ├── COMMUNITY (H3)
│       ├── X
│       ├── LINKEDIN
│       └── INSTAGRAM
│
└── Copyright Section
    └── "SkillBridge. All Rights Reserved © 2025."
```

## Key Features Tested

### ✅ Branding
- SKILLBRIDGE logo with brand color
- Consistent tagline messaging
- Copyright with company name and year

### ✅ Navigation Structure
- Three organized sections (Company, Help, Community)
- 7 total navigation links
- Semantic HTML with proper lists

### ✅ Responsive Design
- Mobile: Single column stack
- Tablet: 3-column navigation
- Desktop: 5-column grid with logo spanning 2 columns

### ✅ Visual Design
- Dark theme (`#121212` background)
- Hover effects on all links
- Smooth color transitions
- Proper spacing and typography

### ✅ Accessibility
- Semantic `<footer>` element
- Proper heading hierarchy (H1, H3)
- All links are accessible anchor elements
- Organized with unordered lists

### ✅ Conditional Rendering
- Hides on authentication pages
- Shows on all other pages

## Common Test Scenarios

### Scenario 1: User on Homepage
```typescript
// Footer should be fully visible with all sections
✓ Logo and tagline displayed
✓ All 7 navigation links present
✓ Copyright information shown
✓ Dark theme applied
```

### Scenario 2: User on Sign-In Page
```typescript
// Footer should be hidden
✓ Footer element not rendered
✓ No footer content in DOM
```

### Scenario 3: Mobile User
```typescript
// Footer should stack vertically
✓ Single column layout
✓ All content still accessible
✓ Proper spacing maintained
```

### Scenario 4: Desktop User
```typescript
// Footer should use multi-column grid
✓ Logo section spans 2 columns
✓ Navigation uses 3 columns
✓ Proper alignment and spacing
```

## Coverage Metrics

### By Feature
- **Rendering**: 100% (3/3 tests)
- **Branding**: 100% (5/5 tests)
- **Navigation Links**: 100% (16/16 tests)
- **Copyright**: 100% (4/4 tests)
- **Structure**: 100% (7/7 tests)
- **Responsive Design**: 100% (4/4 tests)
- **Accessibility**: 100% (5/5 tests)
- **Conditional Logic**: 100% (5/5 tests)
- **Styling**: 100% (5/5 tests)
- **Content Validation**: 100% (6/6 tests)

### Overall
- **Total Tests**: 60
- **Passing**: 60 (100%)
- **Failing**: 0

## Best Practices Demonstrated

1. **Comprehensive Coverage**: Tests all aspects of the component
2. **Semantic HTML Testing**: Validates proper use of HTML5 elements
3. **Accessibility Focus**: Dedicated tests for a11y compliance
4. **Responsive Design**: Tests mobile, tablet, and desktop layouts
5. **Content Validation**: Ensures all expected content is present
6. **Conditional Logic**: Tests path-based rendering
7. **Visual Design**: Validates styling and theming
8. **Structured Organization**: Tests grouped by related functionality

## Future Enhancements

Potential areas for additional testing:

1. **Link Functionality**: Test actual navigation when hrefs are implemented
2. **External Links**: Test social media links open in new tabs
3. **Analytics**: Test tracking events on link clicks
4. **Dynamic Copyright Year**: Test automatic year updates
5. **Internationalization**: Test multi-language support if added
6. **Theme Switching**: Test light/dark mode if implemented
7. **Keyboard Navigation**: Test tab order and focus management
8. **Screen Reader**: Test ARIA labels and announcements

## Maintenance Notes

### When Adding New Links
1. Add test for link presence in appropriate section
2. Update "Content Validation" test for total link count
3. Update link structure tests if needed

### When Changing Layout
1. Update responsive layout tests
2. Verify grid classes
3. Test on all breakpoints

### When Updating Branding
1. Update logo tests if text changes
2. Update color tests if palette changes
3. Update copyright text tests

## Related Documentation

- [Main Test README](../README.md)
- [Header Test Documentation](./Header.test.README.md)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

## Contributing

When modifying the Footer component:

1. Update corresponding tests
2. Ensure all 60 tests still pass
3. Add new tests for new features
4. Update this documentation
5. Run `npm test` before committing
6. Maintain 100% test coverage
