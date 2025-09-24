import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
