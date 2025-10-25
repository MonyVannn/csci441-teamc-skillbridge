import { cn, formatDate } from "@/lib/utils";

describe("cn utility function", () => {
  describe("basic functionality", () => {
    it("should merge multiple class names", () => {
      expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
    });

    it("should handle empty strings", () => {
      expect(cn("", "class1", "")).toBe("class1");
    });

    it("should handle undefined and null values", () => {
      expect(cn(undefined, "class1", null, "class2")).toBe("class1 class2");
    });

    it("should return empty string when no arguments provided", () => {
      expect(cn()).toBe("");
    });
  });

  describe("conditional class names", () => {
    it("should handle conditional classes correctly", () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
        "base active"
      );
    });

    it("should handle object notation for conditional classes", () => {
      expect(
        cn({
          base: true,
          active: true,
          disabled: false,
        })
      ).toBe("base active");
    });
  });

  describe("tailwind merge functionality", () => {
    it("should merge conflicting tailwind classes correctly", () => {
      // Later class should override earlier one
      expect(cn("p-4", "p-8")).toBe("p-8");
    });

    it("should handle multiple conflicting utilities", () => {
      expect(cn("text-sm", "text-lg", "text-xl")).toBe("text-xl");
    });

    it("should preserve non-conflicting classes", () => {
      expect(cn("text-sm", "bg-blue-500", "text-lg", "rounded")).toBe(
        "bg-blue-500 text-lg rounded"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle arrays of class names", () => {
      expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
    });

    it("should handle nested arrays", () => {
      expect(cn(["class1", ["class2", "class3"]], "class4")).toBe(
        "class1 class2 class3 class4"
      );
    });

    it("should handle whitespace correctly", () => {
      expect(cn("  class1  ", "  class2  ")).toBe("class1 class2");
    });

    it("should handle duplicate class names", () => {
      // Note: cn doesn't deduplicate classes, it merges them
      expect(cn("class1", "class2", "class1")).toBe("class1 class2 class1");
    });
  });
});

describe("formatDate utility function", () => {
  describe("standard date formatting", () => {
    it("should format January 1st correctly", () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      expect(formatDate(date)).toBe("January 1st, 2024");
    });

    it("should format February 2nd correctly", () => {
      const date = new Date(2024, 1, 2); // February 2, 2024
      expect(formatDate(date)).toBe("February 2nd, 2024");
    });

    it("should format March 3rd correctly", () => {
      const date = new Date(2024, 2, 3); // March 3, 2024
      expect(formatDate(date)).toBe("March 3rd, 2024");
    });

    it("should format April 4th correctly", () => {
      const date = new Date(2024, 3, 4); // April 4, 2024
      expect(formatDate(date)).toBe("April 4th, 2024");
    });
  });

  describe("day suffix edge cases", () => {
    it("should handle 11th, 12th, 13th correctly", () => {
      const date11 = new Date(2024, 0, 11);
      const date12 = new Date(2024, 0, 12);
      const date13 = new Date(2024, 0, 13);

      expect(formatDate(date11)).toBe("January 11th, 2024");
      expect(formatDate(date12)).toBe("January 12th, 2024");
      expect(formatDate(date13)).toBe("January 13th, 2024");
    });

    it("should handle 21st, 22nd, 23rd correctly", () => {
      const date21 = new Date(2024, 0, 21);
      const date22 = new Date(2024, 0, 22);
      const date23 = new Date(2024, 0, 23);

      expect(formatDate(date21)).toBe("January 21st, 2024");
      expect(formatDate(date22)).toBe("January 22nd, 2024");
      expect(formatDate(date23)).toBe("January 23rd, 2024");
    });

    it("should handle 31st correctly", () => {
      const date = new Date(2024, 0, 31);
      expect(formatDate(date)).toBe("January 31st, 2024");
    });

    it("should handle days ending in 4-9 and 0 with 'th'", () => {
      const date5 = new Date(2024, 0, 5);
      const date10 = new Date(2024, 0, 10);
      const date20 = new Date(2024, 0, 20);
      const date30 = new Date(2024, 0, 30);

      expect(formatDate(date5)).toBe("January 5th, 2024");
      expect(formatDate(date10)).toBe("January 10th, 2024");
      expect(formatDate(date20)).toBe("January 20th, 2024");
      expect(formatDate(date30)).toBe("January 30th, 2024");
    });
  });

  describe("all months", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    months.forEach((month, index) => {
      it(`should format ${month} correctly`, () => {
        const date = new Date(2024, index, 15);
        expect(formatDate(date)).toBe(`${month} 15th, 2024`);
      });
    });
  });

  describe("different years", () => {
    it("should handle year 2000", () => {
      const date = new Date(2000, 0, 1);
      expect(formatDate(date)).toBe("January 1st, 2000");
    });

    it("should handle year 2025", () => {
      const date = new Date(2025, 11, 31);
      expect(formatDate(date)).toBe("December 31st, 2025");
    });

    it("should handle year 1999", () => {
      const date = new Date(1999, 5, 15);
      expect(formatDate(date)).toBe("June 15th, 1999");
    });
  });

  describe("leap year dates", () => {
    it("should handle February 29th in a leap year", () => {
      const date = new Date(2024, 1, 29); // 2024 is a leap year
      expect(formatDate(date)).toBe("February 29th, 2024");
    });

    it("should handle dates in a leap year", () => {
      const date = new Date(2020, 1, 29); // 2020 is a leap year
      expect(formatDate(date)).toBe("February 29th, 2020");
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle first day of year", () => {
      const date = new Date(2024, 0, 1);
      expect(formatDate(date)).toBe("January 1st, 2024");
    });

    it("should handle last day of year", () => {
      const date = new Date(2024, 11, 31);
      expect(formatDate(date)).toBe("December 31st, 2024");
    });

    it("should handle Date object created from timestamp", () => {
      const timestamp = 1704067200000; // January 1, 2024, 00:00:00 UTC
      const date = new Date(timestamp);
      // Note: This might be December 31st, 2023 depending on timezone
      const result = formatDate(date);
      expect(result).toMatch(/(December 31st, 2023|January 1st, 2024)/);
    });

    it("should handle Date object created from ISO string", () => {
      const date = new Date("2024-06-15T12:00:00.000Z");
      expect(formatDate(date)).toMatch(/June 1[45]th, 2024/); // Account for timezone
    });
  });

  describe("error handling", () => {
    it("should handle invalid date gracefully", () => {
      const invalidDate = new Date("invalid");
      const result = formatDate(invalidDate);
      expect(result).toContain("NaN");
    });
  });
});
