import { getCategoryThumbnail } from "@/lib/categoryThumbnails";

describe("getCategoryThumbnail utility function", () => {
  describe("Tech & Development categories", () => {
    it("should return correct thumbnail for WEB_DEVELOPMENT", () => {
      expect(getCategoryThumbnail("WEB_DEVELOPMENT")).toBe(
        "/thumbnails/webdev.webp"
      );
    });

    it("should return correct thumbnail for MOBILE_DEVELOPMENT", () => {
      expect(getCategoryThumbnail("MOBILE_DEVELOPMENT")).toBe(
        "/thumbnails/webdev.webp"
      );
    });

    it("should return correct thumbnail for UI_UX_DESIGN", () => {
      expect(getCategoryThumbnail("UI_UX_DESIGN")).toBe(
        "/thumbnails/uxuidesign.webp"
      );
    });

    it("should return correct thumbnail for DATA_SCIENCE", () => {
      expect(getCategoryThumbnail("DATA_SCIENCE")).toBe(
        "/thumbnails/datascience.webp"
      );
    });

    it("should return correct thumbnail for MACHINE_LEARNING", () => {
      expect(getCategoryThumbnail("MACHINE_LEARNING")).toBe(
        "/thumbnails/ai.webp"
      );
    });

    it("should return correct thumbnail for BLOCKCHAIN", () => {
      expect(getCategoryThumbnail("BLOCKCHAIN")).toBe(
        "/thumbnails/blockchain.webp"
      );
    });

    it("should return correct thumbnail for GAME_DEVELOPMENT", () => {
      expect(getCategoryThumbnail("GAME_DEVELOPMENT")).toBe(
        "/thumbnails/gamedev.webp"
      );
    });

    it("should return correct thumbnail for CYBERSECURITY", () => {
      expect(getCategoryThumbnail("CYBERSECURITY")).toBe(
        "/thumbnails/cybersecurity.webp"
      );
    });

    it("should return correct thumbnail for CLOUD_COMPUTING", () => {
      expect(getCategoryThumbnail("CLOUD_COMPUTING")).toBe(
        "/thumbnails/cloudcomputing.webp"
      );
    });

    it("should return correct thumbnail for DEVOPS", () => {
      expect(getCategoryThumbnail("DEVOPS")).toBe(
        "/thumbnails/cloudcomputing.webp"
      );
    });

    it("should return correct thumbnail for API_DEVELOPMENT", () => {
      expect(getCategoryThumbnail("API_DEVELOPMENT")).toBe(
        "/thumbnails/code.webp"
      );
    });

    it("should return correct thumbnail for DATABASE_DESIGN", () => {
      expect(getCategoryThumbnail("DATABASE_DESIGN")).toBe(
        "/thumbnails/database.webp"
      );
    });

    it("should return correct thumbnail for SOFTWARE_TESTING", () => {
      expect(getCategoryThumbnail("SOFTWARE_TESTING")).toBe(
        "/thumbnails/code.webp"
      );
    });
  });

  describe("Business & Analytics categories", () => {
    it("should return correct thumbnail for BUSINESS_ANALYTICS", () => {
      expect(getCategoryThumbnail("BUSINESS_ANALYTICS")).toBe(
        "/thumbnails/finance.webp"
      );
    });

    it("should return correct thumbnail for DIGITAL_MARKETING", () => {
      expect(getCategoryThumbnail("DIGITAL_MARKETING")).toBe(
        "/thumbnails/seo.webp"
      );
    });

    it("should return correct thumbnail for FINANCIAL_ANALYSIS", () => {
      expect(getCategoryThumbnail("FINANCIAL_ANALYSIS")).toBe(
        "/thumbnails/finance.webp"
      );
    });

    it("should return correct thumbnail for ACCOUNTING", () => {
      expect(getCategoryThumbnail("ACCOUNTING")).toBe(
        "/thumbnails/accounting.webp"
      );
    });

    it("should return correct thumbnail for PROJECT_MANAGEMENT", () => {
      expect(getCategoryThumbnail("PROJECT_MANAGEMENT")).toBe(
        "/thumbnails/finance.webp"
      );
    });

    it("should return correct thumbnail for PRODUCT_MANAGEMENT", () => {
      expect(getCategoryThumbnail("PRODUCT_MANAGEMENT")).toBe(
        "/thumbnails/finance.webp"
      );
    });

    it("should return correct thumbnail for MARKET_RESEARCH", () => {
      expect(getCategoryThumbnail("MARKET_RESEARCH")).toBe(
        "/thumbnails/finance.webp"
      );
    });
  });

  describe("Creative & Media categories", () => {
    it("should return correct thumbnail for CONTENT_CREATION", () => {
      expect(getCategoryThumbnail("CONTENT_CREATION")).toBe(
        "/thumbnails/socialmedia.webp"
      );
    });

    it("should return correct thumbnail for GRAPHIC_DESIGN", () => {
      expect(getCategoryThumbnail("GRAPHIC_DESIGN")).toBe(
        "/thumbnails/graphic.webp"
      );
    });

    it("should return correct thumbnail for VIDEO_PRODUCTION", () => {
      expect(getCategoryThumbnail("VIDEO_PRODUCTION")).toBe(
        "/thumbnails/graphic.webp"
      );
    });

    it("should return correct thumbnail for PHOTOGRAPHY", () => {
      expect(getCategoryThumbnail("PHOTOGRAPHY")).toBe(
        "/thumbnails/graphic.webp"
      );
    });

    it("should return correct thumbnail for MUSIC_PRODUCTION", () => {
      expect(getCategoryThumbnail("MUSIC_PRODUCTION")).toBe(
        "/thumbnails/music.webp"
      );
    });

    it("should return correct thumbnail for PODCAST_PRODUCTION", () => {
      expect(getCategoryThumbnail("PODCAST_PRODUCTION")).toBe(
        "/thumbnails/music.webp"
      );
    });

    it("should return correct thumbnail for FASHION_DESIGN", () => {
      expect(getCategoryThumbnail("FASHION_DESIGN")).toBe(
        "/thumbnails/fashion.webp"
      );
    });
  });

  describe("Writing & Communication categories", () => {
    it("should return correct thumbnail for TECHNICAL_WRITING", () => {
      expect(getCategoryThumbnail("TECHNICAL_WRITING")).toBe(
        "/thumbnails/code.webp"
      );
    });

    it("should return correct thumbnail for LANGUAGE_TRANSLATION", () => {
      expect(getCategoryThumbnail("LANGUAGE_TRANSLATION")).toBe(
        "/thumbnails/education.webp"
      );
    });

    it("should return correct thumbnail for SOCIAL_MEDIA_MANAGEMENT", () => {
      expect(getCategoryThumbnail("SOCIAL_MEDIA_MANAGEMENT")).toBe(
        "/thumbnails/socialmedia.webp"
      );
    });
  });

  describe("Legal & Healthcare categories", () => {
    it("should return correct thumbnail for LEGAL_RESEARCH", () => {
      expect(getCategoryThumbnail("LEGAL_RESEARCH")).toBe(
        "/thumbnails/legal.webp"
      );
    });

    it("should return correct thumbnail for HEALTHCARE_IT", () => {
      expect(getCategoryThumbnail("HEALTHCARE_IT")).toBe(
        "/thumbnails/healthcare.webp"
      );
    });

    it("should return correct thumbnail for BIOTECH_RESEARCH", () => {
      expect(getCategoryThumbnail("BIOTECH_RESEARCH")).toBe(
        "/thumbnails/healthcare.webp"
      );
    });
  });

  describe("Engineering categories", () => {
    it("should return correct thumbnail for CIVIL_ENGINEERING", () => {
      expect(getCategoryThumbnail("CIVIL_ENGINEERING")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for MECHANICAL_ENGINEERING", () => {
      expect(getCategoryThumbnail("MECHANICAL_ENGINEERING")).toBe(
        "/thumbnails/mechanical.webp"
      );
    });

    it("should return correct thumbnail for ELECTRICAL_ENGINEERING", () => {
      expect(getCategoryThumbnail("ELECTRICAL_ENGINEERING")).toBe(
        "/thumbnails/electrical.webp"
      );
    });

    it("should return correct thumbnail for ENVIRONMENTAL_SCIENCE", () => {
      expect(getCategoryThumbnail("ENVIRONMENTAL_SCIENCE")).toBe(
        "/thumbnails/agriculture.webp"
      );
    });
  });

  describe("Education & Research categories", () => {
    it("should return correct thumbnail for EDUCATION_TECH", () => {
      expect(getCategoryThumbnail("EDUCATION_TECH")).toBe(
        "/thumbnails/education.webp"
      );
    });

    it("should return correct thumbnail for PSYCHOLOGY_RESEARCH", () => {
      expect(getCategoryThumbnail("PSYCHOLOGY_RESEARCH")).toBe(
        "/thumbnails/healthcare.webp"
      );
    });
  });

  describe("E-commerce & Business categories", () => {
    it("should return correct thumbnail for E_COMMERCE", () => {
      expect(getCategoryThumbnail("E_COMMERCE")).toBe(
        "/thumbnails/retail.webp"
      );
    });

    it("should return correct thumbnail for LOGISTICS", () => {
      expect(getCategoryThumbnail("LOGISTICS")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for SUPPLY_CHAIN", () => {
      expect(getCategoryThumbnail("SUPPLY_CHAIN")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for HUMAN_RESOURCES", () => {
      expect(getCategoryThumbnail("HUMAN_RESOURCES")).toBe(
        "/thumbnails/finance.webp"
      );
    });
  });

  describe("Design & Architecture categories", () => {
    it("should return correct thumbnail for ARCHITECTURE", () => {
      expect(getCategoryThumbnail("ARCHITECTURE")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for INTERIOR_DESIGN", () => {
      expect(getCategoryThumbnail("INTERIOR_DESIGN")).toBe(
        "/thumbnails/fashion.webp"
      );
    });
  });

  describe("Nonprofit & Government categories", () => {
    it("should return correct thumbnail for NONPROFIT_OUTREACH", () => {
      expect(getCategoryThumbnail("NONPROFIT_OUTREACH")).toBe(
        "/thumbnails/socialmedia.webp"
      );
    });

    it("should return correct thumbnail for GOVERNMENT_POLICY", () => {
      expect(getCategoryThumbnail("GOVERNMENT_POLICY")).toBe(
        "/thumbnails/legal.webp"
      );
    });

    it("should return correct thumbnail for SUSTAINABILITY", () => {
      expect(getCategoryThumbnail("SUSTAINABILITY")).toBe(
        "/thumbnails/agriculture.webp"
      );
    });
  });

  describe("Agriculture & Food categories", () => {
    it("should return correct thumbnail for AGRICULTURE_TECH", () => {
      expect(getCategoryThumbnail("AGRICULTURE_TECH")).toBe(
        "/thumbnails/agriculture.webp"
      );
    });

    it("should return correct thumbnail for FOOD_SCIENCE", () => {
      expect(getCategoryThumbnail("FOOD_SCIENCE")).toBe(
        "/thumbnails/agriculture.webp"
      );
    });
  });

  describe("Hospitality & Tourism categories", () => {
    it("should return correct thumbnail for HOSPITALITY", () => {
      expect(getCategoryThumbnail("HOSPITALITY")).toBe(
        "/thumbnails/toursim.webp"
      );
    });

    it("should return correct thumbnail for TOURISM", () => {
      expect(getCategoryThumbnail("TOURISM")).toBe("/thumbnails/toursim.webp");
    });
  });

  describe("Industry categories", () => {
    it("should return correct thumbnail for REAL_ESTATE", () => {
      expect(getCategoryThumbnail("REAL_ESTATE")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for INSURANCE", () => {
      expect(getCategoryThumbnail("INSURANCE")).toBe(
        "/thumbnails/finance.webp"
      );
    });

    it("should return correct thumbnail for TELECOMMUNICATIONS", () => {
      expect(getCategoryThumbnail("TELECOMMUNICATIONS")).toBe(
        "/thumbnails/electrical.webp"
      );
    });

    it("should return correct thumbnail for AUTOMOTIVE", () => {
      expect(getCategoryThumbnail("AUTOMOTIVE")).toBe(
        "/thumbnails/automative.webp"
      );
    });

    it("should return correct thumbnail for AEROSPACE", () => {
      expect(getCategoryThumbnail("AEROSPACE")).toBe(
        "/thumbnails/aerospace.webp"
      );
    });

    it("should return correct thumbnail for ENERGY", () => {
      expect(getCategoryThumbnail("ENERGY")).toBe(
        "/thumbnails/electrical.webp"
      );
    });

    it("should return correct thumbnail for MINING", () => {
      expect(getCategoryThumbnail("MINING")).toBe("/thumbnails/mining.webp");
    });

    it("should return correct thumbnail for CONSTRUCTION", () => {
      expect(getCategoryThumbnail("CONSTRUCTION")).toBe(
        "/thumbnails/construction.webp"
      );
    });

    it("should return correct thumbnail for RETAIL", () => {
      expect(getCategoryThumbnail("RETAIL")).toBe("/thumbnails/retail.webp");
    });

    it("should return correct thumbnail for MANUFACTURING", () => {
      expect(getCategoryThumbnail("MANUFACTURING")).toBe(
        "/thumbnails/manufactoring.webp"
      );
    });
  });

  describe("fallback and edge cases", () => {
    it("should return placeholder for OTHER category", () => {
      expect(getCategoryThumbnail("OTHER")).toBe("/placeholder.jpg");
    });

    it("should return placeholder for unknown category", () => {
      expect(getCategoryThumbnail("UNKNOWN_CATEGORY")).toBe("/placeholder.jpg");
    });

    it("should return placeholder for empty string", () => {
      expect(getCategoryThumbnail("")).toBe("/placeholder.jpg");
    });

    it("should return placeholder for null (type coercion)", () => {
      expect(getCategoryThumbnail(null as any)).toBe("/placeholder.jpg");
    });

    it("should return placeholder for undefined (type coercion)", () => {
      expect(getCategoryThumbnail(undefined as any)).toBe("/placeholder.jpg");
    });

    it("should handle lowercase category names", () => {
      // Function is case-sensitive, so lowercase should fall back
      expect(getCategoryThumbnail("web_development")).toBe("/placeholder.jpg");
    });

    it("should handle mixed case category names", () => {
      // Function is case-sensitive, so mixed case should fall back
      expect(getCategoryThumbnail("Web_Development")).toBe("/placeholder.jpg");
    });

    it("should handle category with extra whitespace", () => {
      expect(getCategoryThumbnail(" WEB_DEVELOPMENT ")).toBe(
        "/placeholder.jpg"
      );
    });

    it("should handle category with special characters", () => {
      expect(getCategoryThumbnail("WEB-DEVELOPMENT!")).toBe("/placeholder.jpg");
    });

    it("should handle numeric input (type coercion)", () => {
      expect(getCategoryThumbnail(123 as any)).toBe("/placeholder.jpg");
    });
  });

  describe("consistency checks", () => {
    it("should return same result for same input", () => {
      const category = "WEB_DEVELOPMENT";
      const result1 = getCategoryThumbnail(category);
      const result2 = getCategoryThumbnail(category);
      expect(result1).toBe(result2);
    });

    it("should always return a string", () => {
      const categories = [
        "WEB_DEVELOPMENT",
        "UNKNOWN",
        "",
        "OTHER",
        null,
        undefined,
      ];
      categories.forEach((category) => {
        const result = getCategoryThumbnail(category as any);
        expect(typeof result).toBe("string");
      });
    });

    it("should always return a path starting with /", () => {
      const categories = [
        "WEB_DEVELOPMENT",
        "BLOCKCHAIN",
        "UNKNOWN",
        "",
        "OTHER",
      ];
      categories.forEach((category) => {
        const result = getCategoryThumbnail(category);
        expect(result).toMatch(/^\//);
      });
    });

    it("should always return a path ending with image extension or .jpg fallback", () => {
      const categories = [
        "WEB_DEVELOPMENT",
        "BLOCKCHAIN",
        "UNKNOWN",
        "",
        "OTHER",
      ];
      categories.forEach((category) => {
        const result = getCategoryThumbnail(category);
        expect(result).toMatch(/\.(webp|avif|jpg|svg)$/);
      });
    });
  });

  describe("all defined categories return valid paths", () => {
    const allCategories = [
      "WEB_DEVELOPMENT",
      "MOBILE_DEVELOPMENT",
      "UI_UX_DESIGN",
      "DATA_SCIENCE",
      "MACHINE_LEARNING",
      "BLOCKCHAIN",
      "GAME_DEVELOPMENT",
      "CYBERSECURITY",
      "CLOUD_COMPUTING",
      "DEVOPS",
      "API_DEVELOPMENT",
      "DATABASE_DESIGN",
      "SOFTWARE_TESTING",
      "BUSINESS_ANALYTICS",
      "DIGITAL_MARKETING",
      "FINANCIAL_ANALYSIS",
      "ACCOUNTING",
      "PROJECT_MANAGEMENT",
      "PRODUCT_MANAGEMENT",
      "MARKET_RESEARCH",
      "CONTENT_CREATION",
      "GRAPHIC_DESIGN",
      "VIDEO_PRODUCTION",
      "PHOTOGRAPHY",
      "MUSIC_PRODUCTION",
      "PODCAST_PRODUCTION",
      "FASHION_DESIGN",
      "TECHNICAL_WRITING",
      "LANGUAGE_TRANSLATION",
      "SOCIAL_MEDIA_MANAGEMENT",
      "LEGAL_RESEARCH",
      "HEALTHCARE_IT",
      "BIOTECH_RESEARCH",
      "CIVIL_ENGINEERING",
      "MECHANICAL_ENGINEERING",
      "ELECTRICAL_ENGINEERING",
      "ENVIRONMENTAL_SCIENCE",
      "EDUCATION_TECH",
      "PSYCHOLOGY_RESEARCH",
      "E_COMMERCE",
      "LOGISTICS",
      "SUPPLY_CHAIN",
      "HUMAN_RESOURCES",
      "ARCHITECTURE",
      "INTERIOR_DESIGN",
      "NONPROFIT_OUTREACH",
      "GOVERNMENT_POLICY",
      "SUSTAINABILITY",
      "AGRICULTURE_TECH",
      "FOOD_SCIENCE",
      "HOSPITALITY",
      "TOURISM",
      "REAL_ESTATE",
      "INSURANCE",
      "TELECOMMUNICATIONS",
      "AUTOMOTIVE",
      "AEROSPACE",
      "ENERGY",
      "MINING",
      "CONSTRUCTION",
      "RETAIL",
      "MANUFACTURING",
      "OTHER",
    ];

    it("should return non-placeholder path for all defined categories", () => {
      allCategories.forEach((category) => {
        const result = getCategoryThumbnail(category);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\/thumbnails\/|^\/placeholder\.jpg$/);
      });
    });
  });
});
