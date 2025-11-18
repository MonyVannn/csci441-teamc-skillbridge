import { cn, formatDate, hasCompleteProfile } from "@/lib/utils";
import { User } from "@prisma/client";

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

describe("hasCompleteProfile utility function", () => {
  // Helper to create a complete user object
  const createCompleteUser = (): User => ({
    id: "user123",
    clerkId: "clerk123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    bio: "A passionate developer",
    intro: "Hello, I'm John",
    address: "123 Main St",
    skills: ["JavaScript", "TypeScript"],
    imageUrl: "https://example.com/image.jpg",
    role: "USER" as const,
    occupied: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    socialLinks: [],
    experiences: [],
    education: [
      {
        id: "edu1",
        degree: "Computer Science",
        institution: "University",
        startDate: new Date(),
        endDate: null,
        description: null,
      },
    ],
    previousProjects: [],
    earnedSkillBadges: [],
    earnedSpecializationBadges: [],
    earnedEngagementBadges: [],
    totalHoursContributed: 0,
    projectsCompleted: 0,
    industriesExperienced: [],
    conversationIds: [],
  });

  describe("complete profiles", () => {
    it("should return isComplete: true for a complete user profile", () => {
      const user = createCompleteUser();
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
  });

  describe("null or undefined user", () => {
    it("should handle null user", () => {
      const result = hasCompleteProfile(null);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toEqual(["User not found"]);
    });
  });

  describe("missing firstName", () => {
    it("should detect missing firstName", () => {
      const user = createCompleteUser();
      user.firstName = null;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("First Name");
    });

    it("should detect empty firstName", () => {
      const user = createCompleteUser();
      user.firstName = "   ";
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("First Name");
    });
  });

  describe("missing lastName", () => {
    it("should detect missing lastName", () => {
      const user = createCompleteUser();
      user.lastName = null;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Last Name");
    });

    it("should detect empty lastName", () => {
      const user = createCompleteUser();
      user.lastName = "";
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Last Name");
    });
  });

  describe("missing bio", () => {
    it("should detect missing bio", () => {
      const user = createCompleteUser();
      user.bio = null;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Bio");
    });

    it("should detect empty bio", () => {
      const user = createCompleteUser();
      user.bio = "";
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Bio");
    });
  });

  describe("missing intro", () => {
    it("should detect missing intro", () => {
      const user = createCompleteUser();
      user.intro = null;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Professional Introduction");
    });

    it("should detect empty intro", () => {
      const user = createCompleteUser();
      user.intro = "  ";
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Professional Introduction");
    });
  });

  describe("missing skills", () => {
    it("should detect empty skills array", () => {
      const user = createCompleteUser();
      user.skills = [];
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Skills");
    });
  });

  describe("missing education", () => {
    it("should detect empty education array", () => {
      const user = createCompleteUser();
      user.education = [];
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Education");
    });

    it("should handle undefined education", () => {
      const user = createCompleteUser();
      // @ts-expect-error - Testing edge case where education might be undefined
      user.education = undefined;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Education");
    });

    it("should handle null education", () => {
      const user = createCompleteUser();
      // @ts-expect-error - Testing edge case where education might be null
      user.education = null;
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Education");
    });

    it("should handle non-array education", () => {
      const user = createCompleteUser();
      // @ts-expect-error - Testing edge case where education might not be an array
      user.education = "not an array";
      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("Education");
    });
  });

  describe("multiple missing fields", () => {
    it("should detect multiple missing fields", () => {
      const user = createCompleteUser();
      user.firstName = null;
      user.lastName = "";
      user.bio = null;
      user.education = [];

      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain("First Name");
      expect(result.missingFields).toContain("Last Name");
      expect(result.missingFields).toContain("Bio");
      expect(result.missingFields).toContain("Education");
      expect(result.missingFields.length).toBe(4);
    });

    it("should detect all missing fields", () => {
      const user = createCompleteUser();
      user.firstName = null;
      user.lastName = null;
      user.bio = null;
      user.intro = null;
      user.skills = [];
      user.education = [];

      const result = hasCompleteProfile(user);

      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toEqual([
        "First Name",
        "Last Name",
        "Bio",
        "Professional Introduction",
        "Skills",
        "Education",
      ]);
    });
  });
});
