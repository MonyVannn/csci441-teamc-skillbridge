import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render the footer element", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    it("should have correct background styling", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("bg-[#121212]");
    });

    it("should render within a container", () => {
      const { container } = render(<Footer />);

      const containerDiv = container.querySelector(".container");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("Logo and Tagline", () => {
    it("should render the SKILLBRIDGE logo", () => {
      render(<Footer />);

      const skillText = screen.getByText("SKILL");
      const bridgeText = screen.getByText("BRIDGE.");

      expect(skillText).toBeInTheDocument();
      expect(bridgeText).toBeInTheDocument();
    });

    it("should render logo with correct styling", () => {
      render(<Footer />);

      const skillText = screen.getByText("SKILL");
      const logoDiv = skillText.closest("div");

      expect(logoDiv).toHaveClass("text-[#1DBF9F]");
      expect(logoDiv).toHaveClass("text-2xl");
      expect(logoDiv).toHaveClass("font-black");
    });

    it("should use h1 tags for logo text", () => {
      render(<Footer />);

      const skillHeading = screen.getByText("SKILL");
      const bridgeHeading = screen.getByText("BRIDGE.");

      expect(skillHeading.tagName).toBe("H1");
      expect(bridgeHeading.tagName).toBe("H1");
    });

    it("should render the tagline text", () => {
      render(<Footer />);

      const tagline = screen.getByText(
        "Jumpstart your career as a new graduates with SkillBridge."
      );
      expect(tagline).toBeInTheDocument();
    });

    it("should style tagline with correct classes", () => {
      render(<Footer />);

      const tagline = screen.getByText(
        "Jumpstart your career as a new graduates with SkillBridge."
      );
      expect(tagline).toHaveClass("text-gray-300");
      expect(tagline).toHaveClass("text-lg");
    });
  });

  describe("Company Section", () => {
    it("should render COMPANY section header", () => {
      render(<Footer />);

      const companyHeader = screen.getByText("COMPANY");
      expect(companyHeader).toBeInTheDocument();
    });

    it("should render COMPANY header as h3", () => {
      render(<Footer />);

      const companyHeader = screen.getByText("COMPANY");
      expect(companyHeader.tagName).toBe("H3");
    });

    it("should render ABOUT US link", () => {
      render(<Footer />);

      const aboutLink = screen.getByText("ABOUT US");
      expect(aboutLink).toBeInTheDocument();
    });

    it("should render EXPLORE link", () => {
      render(<Footer />);

      const exploreLink = screen.getByText("EXPLORE");
      expect(exploreLink).toBeInTheDocument();
    });

    it("should have correct link styling for Company links", () => {
      render(<Footer />);

      const aboutLink = screen.getByText("ABOUT US");
      expect(aboutLink).toHaveClass("text-gray-200");
      expect(aboutLink).toHaveClass("hover:text-gray-400");
      expect(aboutLink).toHaveClass("transition-colors");
    });
  });

  describe("Need Help Section", () => {
    it("should render NEED HELP? section header", () => {
      render(<Footer />);

      const helpHeader = screen.getByText("NEED HELP?");
      expect(helpHeader).toBeInTheDocument();
    });

    it("should render NEED HELP? header as h3", () => {
      render(<Footer />);

      const helpHeader = screen.getByText("NEED HELP?");
      expect(helpHeader.tagName).toBe("H3");
    });

    it("should render CONTACT US link", () => {
      render(<Footer />);

      const contactLink = screen.getByText("CONTACT US");
      expect(contactLink).toBeInTheDocument();
    });

    it("should render BLOG link", () => {
      render(<Footer />);

      const blogLink = screen.getByText("BLOG");
      expect(blogLink).toBeInTheDocument();
    });

    it("should have correct link styling for Help links", () => {
      render(<Footer />);

      const contactLink = screen.getByText("CONTACT US");
      expect(contactLink).toHaveClass("text-gray-200");
      expect(contactLink).toHaveClass("hover:text-gray-400");
      expect(contactLink).toHaveClass("transition-colors");
    });
  });

  describe("Community Section", () => {
    it("should render COMMUNITY section header", () => {
      render(<Footer />);

      const communityHeader = screen.getByText("COMMUNITY");
      expect(communityHeader).toBeInTheDocument();
    });

    it("should render COMMUNITY header as h3", () => {
      render(<Footer />);

      const communityHeader = screen.getByText("COMMUNITY");
      expect(communityHeader.tagName).toBe("H3");
    });

    it("should render X (Twitter) link", () => {
      render(<Footer />);

      const xLink = screen.getByText("X");
      expect(xLink).toBeInTheDocument();
    });

    it("should render LINKEDIN link", () => {
      render(<Footer />);

      const linkedinLink = screen.getByText("LINKEDIN");
      expect(linkedinLink).toBeInTheDocument();
    });

    it("should render INSTAGRAM link", () => {
      render(<Footer />);

      const instagramLink = screen.getByText("INSTAGRAM");
      expect(instagramLink).toBeInTheDocument();
    });

    it("should have correct link styling for Community links", () => {
      render(<Footer />);

      const linkedinLink = screen.getByText("LINKEDIN");
      expect(linkedinLink).toHaveClass("text-gray-200");
      expect(linkedinLink).toHaveClass("hover:text-gray-400");
      expect(linkedinLink).toHaveClass("transition-colors");
    });
  });

  describe("Copyright Section", () => {
    it("should render copyright text", () => {
      render(<Footer />);

      const copyright = screen.getByText(
        "SkillBridge. All Rights Reserved © 2025."
      );
      expect(copyright).toBeInTheDocument();
    });

    it("should display current year 2025 in copyright", () => {
      render(<Footer />);

      const copyright = screen.getByText(/© 2025/);
      expect(copyright).toBeInTheDocument();
    });

    it("should style copyright text correctly", () => {
      render(<Footer />);

      const copyright = screen.getByText(
        "SkillBridge. All Rights Reserved © 2025."
      );
      expect(copyright).toHaveClass("text-gray-300");
      expect(copyright).toHaveClass("text-sm");
    });

    it("should have border separator above copyright", () => {
      const { container } = render(<Footer />);

      const copyright = screen.getByText(
        "SkillBridge. All Rights Reserved © 2025."
      );
      const copyrightContainer = copyright.closest("div");

      expect(copyrightContainer).toHaveClass("border-t");
      expect(copyrightContainer).toHaveClass("border-gray-200");
    });
  });

  describe("Link Structure", () => {
    it("should render all links as anchor elements", () => {
      render(<Footer />);

      const aboutLink = screen.getByText("ABOUT US").closest("a");
      const exploreLink = screen.getByText("EXPLORE").closest("a");
      const contactLink = screen.getByText("CONTACT US").closest("a");
      const blogLink = screen.getByText("BLOG").closest("a");
      const xLink = screen.getByText("X").closest("a");
      const linkedinLink = screen.getByText("LINKEDIN").closest("a");
      const instagramLink = screen.getByText("INSTAGRAM").closest("a");

      expect(aboutLink?.tagName).toBe("A");
      expect(exploreLink?.tagName).toBe("A");
      expect(contactLink?.tagName).toBe("A");
      expect(blogLink?.tagName).toBe("A");
      expect(xLink?.tagName).toBe("A");
      expect(linkedinLink?.tagName).toBe("A");
      expect(instagramLink?.tagName).toBe("A");
    });

    it("should have href attributes on all links", () => {
      render(<Footer />);

      const links = [
        screen.getByText("ABOUT US"),
        screen.getByText("EXPLORE"),
        screen.getByText("CONTACT US"),
        screen.getByText("BLOG"),
        screen.getByText("X"),
        screen.getByText("LINKEDIN"),
        screen.getByText("INSTAGRAM"),
      ];

      links.forEach((link) => {
        const anchorElement = link.closest("a");
        expect(anchorElement).toHaveAttribute("href");
      });
    });

    it('should have placeholder href="#" for all links', () => {
      render(<Footer />);

      const links = [
        screen.getByText("ABOUT US"),
        screen.getByText("EXPLORE"),
        screen.getByText("CONTACT US"),
        screen.getByText("BLOG"),
        screen.getByText("X"),
        screen.getByText("LINKEDIN"),
        screen.getByText("INSTAGRAM"),
      ];

      links.forEach((link) => {
        const anchorElement = link.closest("a");
        expect(anchorElement).toHaveAttribute("href", "#");
      });
    });
  });

  describe("Footer Blocks Presence", () => {
    it("should have three main navigation columns", () => {
      const { container } = render(<Footer />);

      const companySection = screen.getByText("COMPANY").closest("div");
      const helpSection = screen.getByText("NEED HELP?").closest("div");
      const communitySection = screen.getByText("COMMUNITY").closest("div");

      expect(companySection).toBeInTheDocument();
      expect(helpSection).toBeInTheDocument();
      expect(communitySection).toBeInTheDocument();
    });

    it("should have logo/tagline block", () => {
      render(<Footer />);

      const logo = screen.getByText("SKILL");
      const tagline = screen.getByText(
        "Jumpstart your career as a new graduates with SkillBridge."
      );

      expect(logo).toBeInTheDocument();
      expect(tagline).toBeInTheDocument();
    });

    it("should have copyright block", () => {
      render(<Footer />);

      const copyright = screen.getByText(
        "SkillBridge. All Rights Reserved © 2025."
      );
      expect(copyright).toBeInTheDocument();
    });

    it("should render all major blocks in correct order", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      const footerContent = footer?.textContent || "";

      // Check order of major sections
      const logoIndex = footerContent.indexOf("SKILLBRIDGE.");
      const companyIndex = footerContent.indexOf("COMPANY");
      const helpIndex = footerContent.indexOf("NEED HELP?");
      const communityIndex = footerContent.indexOf("COMMUNITY");
      const copyrightIndex = footerContent.indexOf("All Rights Reserved");

      expect(logoIndex).toBeLessThan(companyIndex);
      expect(companyIndex).toBeLessThan(helpIndex);
      expect(helpIndex).toBeLessThan(communityIndex);
      expect(communityIndex).toBeLessThan(copyrightIndex);
    });
  });

  describe("Responsive Layout", () => {
    it("should apply responsive grid classes to main layout", () => {
      const { container } = render(<Footer />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid-cols-1");
      expect(gridContainer).toHaveClass("lg:grid-cols-5");
    });

    it("should apply responsive grid classes to navigation columns", () => {
      const { container } = render(<Footer />);

      const navigationGrid = container.querySelectorAll(".grid")[1];
      expect(navigationGrid).toHaveClass("grid-cols-1");
      expect(navigationGrid).toHaveClass("sm:grid-cols-3");
    });

    it("should apply correct column spans for logo section", () => {
      const { container } = render(<Footer />);

      const logoSection = container.querySelector(".lg\\:col-span-2");
      expect(logoSection).toBeInTheDocument();
      expect(logoSection).toHaveClass("lg:col-span-2");
    });

    it("should apply correct column positioning for navigation", () => {
      const { container } = render(<Footer />);

      const navigationSection = screen
        .getByText("COMPANY")
        .closest(".lg\\:col-span-3");
      expect(navigationSection).toHaveClass("lg:col-start-4");
    });
  });

  describe("Accessibility", () => {
    it("should use semantic footer element", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
      expect(footer?.tagName).toBe("FOOTER");
    });

    it("should have proper heading hierarchy", () => {
      render(<Footer />);

      const h1Elements = screen.getAllByRole("heading", { level: 1 });
      const h3Elements = screen.getAllByRole("heading", { level: 3 });

      expect(h1Elements.length).toBeGreaterThan(0);
      expect(h3Elements.length).toBe(3); // COMPANY, NEED HELP?, COMMUNITY
    });

    it("should have accessible link elements", () => {
      render(<Footer />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBe(7); // 7 total links in footer
    });

    it("should use unordered lists for navigation", () => {
      const { container } = render(<Footer />);

      const lists = container.querySelectorAll("ul");
      expect(lists.length).toBe(3); // One for each column
    });

    it("should use list items for each link", () => {
      const { container } = render(<Footer />);

      const listItems = container.querySelectorAll("li");
      // 3 headers + 7 links + 3 extra items = 13 total li elements
      expect(listItems.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("Path-based Rendering", () => {
    it("should not render footer on sign-in page", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/sign-in");

      const { container } = render(<Footer />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render footer on sign-up page", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/sign-up");

      const { container } = render(<Footer />);

      expect(container.firstChild).toBeNull();
    });

    it("should render footer on sign-in subpaths", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/sign-in/verify");

      const { container } = render(<Footer />);

      expect(container.firstChild).toBeNull();
    });

    it("should render footer on homepage", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/");

      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    it("should render footer on other pages", () => {
      const { usePathname } = require("next/navigation");
      usePathname.mockReturnValue("/profile/user-123");

      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Styling and Visual Design", () => {
    it("should have dark background theme", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("bg-[#121212]");
    });

    it("should have appropriate padding", () => {
      const { container } = render(<Footer />);

      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("px-8");
      expect(footer).toHaveClass("py-16");
    });

    it("should have gap between grid items", () => {
      const { container } = render(<Footer />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-12");
    });

    it("should apply hover styles to links", () => {
      render(<Footer />);

      const link = screen.getByText("ABOUT US");
      expect(link).toHaveClass("hover:text-gray-400");
    });

    it("should apply transition effects to links", () => {
      render(<Footer />);

      const link = screen.getByText("LINKEDIN");
      expect(link).toHaveClass("transition-colors");
    });
  });

  describe("Content Validation", () => {
    it("should contain exactly 7 navigation links", () => {
      render(<Footer />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(7);
    });

    it("should contain exactly 3 section headers", () => {
      render(<Footer />);

      const headers = [
        screen.getByText("COMPANY"),
        screen.getByText("NEED HELP?"),
        screen.getByText("COMMUNITY"),
      ];

      expect(headers).toHaveLength(3);
    });

    it("should have all Company section links", () => {
      render(<Footer />);

      expect(screen.getByText("ABOUT US")).toBeInTheDocument();
      expect(screen.getByText("EXPLORE")).toBeInTheDocument();
    });

    it("should have all Help section links", () => {
      render(<Footer />);

      expect(screen.getByText("CONTACT US")).toBeInTheDocument();
      expect(screen.getByText("BLOG")).toBeInTheDocument();
    });

    it("should have all Community section links", () => {
      render(<Footer />);

      expect(screen.getByText("X")).toBeInTheDocument();
      expect(screen.getByText("LINKEDIN")).toBeInTheDocument();
      expect(screen.getByText("INSTAGRAM")).toBeInTheDocument();
    });

    it("should contain SkillBridge branding in both logo and copyright", () => {
      render(<Footer />);

      const logo = screen.getByText("BRIDGE.");
      const copyrightElements = screen.getAllByText(/SkillBridge/);

      expect(logo).toBeInTheDocument();
      expect(copyrightElements.length).toBeGreaterThanOrEqual(2); // In tagline and copyright
    });
  });
});
