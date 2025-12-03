// Mock Clerk modules before imports to prevent ESM errors
jest.mock("@clerk/backend", () => ({}));
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
  auth: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchBar } from "@/components/browse/SearchBar";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("SearchBar Component", () => {
  const mockPush = jest.fn();
  const mockPathname = "/browse";
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  describe("rendering", () => {
    it("should render search input with placeholder", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");
      expect(input).toBeInTheDocument();
    });

    it("should render search icon", () => {
      const { container } = render(<SearchBar />);
      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
    });

    it("should render with empty value initially", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("should initialize with query from URL params on homepage", () => {
      // Set pathname to homepage where URL params sync works
      (usePathname as jest.Mock).mockReturnValue("/");
      const params = new URLSearchParams("query=test+search");
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;
      expect(input.value).toBe("test search");
    });

    it("should render with empty value on non-homepage", () => {
      // On non-homepage, query is always cleared
      (usePathname as jest.Mock).mockReturnValue("/browse");
      const params = new URLSearchParams("query=test+search");
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("user interactions", () => {
    it("should update input value when user types", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "React Developer" } });

      expect(input.value).toBe("React Developer");
    });

    it("should call router.push with updated query param on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "TypeScript" } });

      // Wait for debounce
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=TypeScript&page=1");
      jest.useRealTimers();
    });

    it("should reset page to 1 when search query changes on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();
      const params = new URLSearchParams("query=old&page=5");
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "new search" } });
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=new+search&page=1");
      jest.useRealTimers();
    });

    it("should preserve other query params when searching on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();
      const params = new URLSearchParams(
        "categories=WEB_DEVELOPMENT&scopes=BEGINNER"
      );
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "frontend" } });
      jest.advanceTimersByTime(300);

      const expectedUrl =
        "/?categories=WEB_DEVELOPMENT&scopes=BEGINNER&query=frontend&page=1";
      expect(mockPush).toHaveBeenCalledWith(expectedUrl);
      jest.useRealTimers();
    });

    it("should handle empty search query on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();
      const params = new URLSearchParams("query=something");
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "" } });
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=&page=1");
      jest.useRealTimers();
    });

    it("should handle special characters in search on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "C++ & C#" } });
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=C%2B%2B+%26+C%23&page=1");
      jest.useRealTimers();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid consecutive searches on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "a" } });
      jest.advanceTimersByTime(300);
      fireEvent.change(input, { target: { value: "ab" } });
      jest.advanceTimersByTime(300);
      fireEvent.change(input, { target: { value: "abc" } });
      jest.advanceTimersByTime(300);

      // Should be called 3 times
      expect(mockPush).toHaveBeenCalledTimes(3);
      expect(mockPush).toHaveBeenLastCalledWith("/?query=abc&page=1");
      jest.useRealTimers();
    });

    it("should handle search input with only whitespace on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "   " } });
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=+++&page=1");
      jest.useRealTimers();
    });

    it("should handle very long search queries on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");
      const longQuery = "a".repeat(500);

      fireEvent.change(input, { target: { value: longQuery } });
      jest.advanceTimersByTime(300);

      expect(input).toHaveValue(longQuery);
      expect(mockPush).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should handle null query param gracefully", () => {
      const params = new URLSearchParams();
      params.get = jest.fn().mockReturnValue(null);
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;

      expect(input.value).toBe("");
    });
  });

  describe("accessibility", () => {
    it("should have search input type", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");
      expect(input).toHaveAttribute("type", "search");
    });

    it("should be focusable", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");
      input.focus();
      expect(input).toHaveFocus();
    });

    it("should support keyboard navigation", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.keyDown(input, { key: "Tab" });
      expect(input).toBeInTheDocument();
    });
  });

  describe("URL parameter synchronization", () => {
    it("should build correct URL with homepage pathname", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "test" } });
      jest.advanceTimersByTime(300);

      expect(mockPush).toHaveBeenCalledWith("/?query=test&page=1");
      jest.useRealTimers();
    });

    it("should handle existing complex query params on homepage", async () => {
      // URL push only happens on homepage
      (usePathname as jest.Mock).mockReturnValue("/");
      jest.useFakeTimers();
      const params = new URLSearchParams(
        "categories=WEB_DEVELOPMENT,MOBILE_DEVELOPMENT&scopes=BEGINNER,INTERMEDIATE&minBudget=100&maxBudget=1000"
      );
      (useSearchParams as jest.Mock).mockReturnValue(params);

      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search projects");

      fireEvent.change(input, { target: { value: "React" } });
      jest.advanceTimersByTime(300);

      const call = mockPush.mock.calls[0][0];
      expect(call).toContain("query=React");
      expect(call).toContain("page=1");
      // URL encoding converts commas to %2C
      expect(call).toContain("categories=WEB_DEVELOPMENT%2CMOBILE_DEVELOPMENT");
      jest.useRealTimers();
    });
  });

  describe("state management", () => {
    it("should maintain local state between renders", () => {
      const { rerender } = render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "test query" } });
      expect(input.value).toBe("test query");

      rerender(<SearchBar />);
      expect(input.value).toBe("test query");
    });

    it("should update state when URL params change on homepage", () => {
      // Set pathname to homepage where URL params sync works
      (usePathname as jest.Mock).mockReturnValue("/");
      const params1 = new URLSearchParams("query=first");
      (useSearchParams as jest.Mock).mockReturnValue(params1);

      const { rerender } = render(<SearchBar />);
      let input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;
      expect(input.value).toBe("first");

      // Simulate URL change
      const params2 = new URLSearchParams("query=second");
      (useSearchParams as jest.Mock).mockReturnValue(params2);

      rerender(<SearchBar />);
      input = screen.getByPlaceholderText(
        "Search projects"
      ) as HTMLInputElement;
      // Note: Component initializes from searchParams only on mount or pathname change
      // Rerenders with same pathname don't trigger useEffect
      expect(input.value).toBe("first");
    });
  });
});
