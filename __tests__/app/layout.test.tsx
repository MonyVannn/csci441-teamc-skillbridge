// Mock all dependencies before importing layout
jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}));

jest.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: any) => children,
}));

jest.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-geist-sans",
  }),
  Geist_Mono: () => ({
    variable: "--font-geist-mono",
  }),
}));

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/Footer", () => ({
  __esModule: true,
  default: () => null,
}));

import { metadata } from "@/app/layout";

// Since RootLayout includes <html> and <body> tags which cannot be rendered in a test environment,
// we test the exported metadata and document the expected structure

describe("RootLayout", () => {
  describe("metadata", () => {
    it("should have correct title", () => {
      expect(metadata.title).toBe("SkillBridge");
    });

    it("should have correct description", () => {
      expect(metadata.description).toBe(
        "Jumpstart your career with SkillBridge"
      );
    });

    it("should export both title and description", () => {
      expect(metadata).toHaveProperty("title");
      expect(metadata).toHaveProperty("description");
      expect(typeof metadata.title).toBe("string");
      expect(typeof metadata.description).toBe("string");
    });
  });

  describe("structure validation", () => {
    it("should define metadata for SEO", () => {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      if (metadata.description) {
        expect(metadata.description.length).toBeGreaterThan(10);
      }
    });
  });
});

/*
 * NOTE: Integration tests for the full RootLayout component structure cannot be
 * performed in a Jest test environment because the component includes <html> and <body>
 * tags which are not compatible with react-testing-library's render function.
 *
 * The RootLayout component structure includes:
 * - <html lang="en">
 * - <body> with font variables and antialiased class
 * - ClerkProvider wrapper
 * - Header component
 * - {children} placeholder
 * - SpeedInsights component
 * - Footer component
 *
 * These structural elements are validated through:
 * 1. TypeScript compilation
 * 2. Next.js build process
 * 3. E2E tests (if available)
 * 4. Manual verification during development
 */
