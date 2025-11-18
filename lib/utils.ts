import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a user has completed enough information to apply for projects
 * Required fields: firstName, lastName, bio, intro, skills (at least 1), education (at least 1)
 */
export function hasCompleteProfile(user: User | null): {
  isComplete: boolean;
  missingFields: string[];
} {
  if (!user) {
    return {
      isComplete: false,
      missingFields: ["User not found"],
    };
  }

  const missingFields: string[] = [];

  if (!user.firstName || user.firstName.trim() === "") {
    missingFields.push("First Name");
  }

  if (!user.lastName || user.lastName.trim() === "") {
    missingFields.push("Last Name");
  }

  if (!user.bio || user.bio.trim() === "") {
    missingFields.push("Bio");
  }

  if (!user.intro || user.intro.trim() === "") {
    missingFields.push("Professional Introduction");
  }

  if (!user.skills || user.skills.length === 0) {
    missingFields.push("Skills");
  }

  // Handle education - check for undefined, null, or empty array
  if (
    !user.education ||
    !Array.isArray(user.education) ||
    user.education.length === 0
  ) {
    missingFields.push("Education");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function formatDate(date: Date): string {
  // Full month name
  const month = date.toLocaleString("en-US", { month: "long" });

  // Day with proper suffix
  const day = date.getDate();
  const suffix = getDaySuffix(day);

  // Year
  const year = date.getFullYear();

  return `${month} ${day}${suffix}, ${year}`;
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"; // special case
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
