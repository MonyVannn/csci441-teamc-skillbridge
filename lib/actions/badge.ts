"use server";

import {
  SkillLevelBadge,
  SpecializationBadge,
  EngagementBadge,
} from "@prisma/client";
import prisma from "../prisma";

// ===== BADGE CRITERIA CONSTANTS =====

const SKILL_LEVEL_CRITERIA = {
  NEWBIE: 1,
  BEGINNER: 3,
  INTERMEDIATE: 10,
  ADVANCED: 25,
  EXPERT: 50,
} as const;

const SPECIALIZATION_CRITERIA = {
  WEB_DEVELOPER_PRO: { category: "WEB_DEVELOPMENT", count: 5 },
  MOBILE_MAVEN: { category: "MOBILE_DEVELOPMENT", count: 5 },
  DESIGN_THINKER: { category: "UI_UX_DESIGN", count: 5 },
  DATA_ANALYST_ACE: { category: "DATA_SCIENCE", count: 5 },
  AI_INNOVATOR: { category: "MACHINE_LEARNING", count: 5 },
  CYBERSECURITY_CHAMP: { category: "BLOCKCHAIN", count: 3 },
} as const;

const ENGAGEMENT_CRITERIA = {
  TOP_CONTRIBUTOR: { projectsCompleted: 20 },
  VETERAN: { projectsCompleted: 50, hoursContributed: 200 }, // OR condition
  CONSISTENT_PERFORMER: { projectsCompleted: 15 },
} as const;

// Hours awarded based on project scope
const PROJECT_SCOPE_HOURS = {
  BEGINNER: 20,
  INTERMEDIATE: 50,
  ADVANCED: 100,
  EXPERT: 200,
} as const;

// ===== TYPES =====

export type BadgeEvent =
  | "PROJECT_COMPLETED"
  | "APPLICATION_SUBMITTED"
  | "HOURS_UPDATED"
  | "MANUAL_CHECK";

interface BadgeUpdateResult {
  newBadges: {
    skillLevel?: SkillLevelBadge[];
    specialization?: SpecializationBadge[];
    engagement?: EngagementBadge[];
  };
  updatedStats: {
    projectsCompleted?: number;
    totalHoursContributed?: number;
    industriesExperienced?: string[];
  };
}

// ===== HELPER FUNCTIONS =====

/**
 * Get hours to award based on project scope
 */
export async function getProjectScopeHours(scope: string): Promise<number> {
  return PROJECT_SCOPE_HOURS[scope as keyof typeof PROJECT_SCOPE_HOURS] || 0;
}

/**
 * Check and update skill level badges based on projects completed
 */
async function checkSkillLevelBadges(
  userId: string,
  projectsCompleted: number
): Promise<SkillLevelBadge[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { earnedSkillBadges: true },
  });

  if (!user) return [];

  const currentBadges = user.earnedSkillBadges;
  const earnedBadges: SkillLevelBadge[] = [];

  // Check each skill level and award if criteria met
  if (
    projectsCompleted >= SKILL_LEVEL_CRITERIA.EXPERT &&
    !currentBadges.includes(SkillLevelBadge.EXPERT)
  ) {
    earnedBadges.push(SkillLevelBadge.EXPERT);
  }
  if (
    projectsCompleted >= SKILL_LEVEL_CRITERIA.ADVANCED &&
    !currentBadges.includes(SkillLevelBadge.ADVANCED)
  ) {
    earnedBadges.push(SkillLevelBadge.ADVANCED);
  }
  if (
    projectsCompleted >= SKILL_LEVEL_CRITERIA.INTERMEDIATE &&
    !currentBadges.includes(SkillLevelBadge.INTERMEDIATE)
  ) {
    earnedBadges.push(SkillLevelBadge.INTERMEDIATE);
  }
  if (
    projectsCompleted >= SKILL_LEVEL_CRITERIA.BEGINNER &&
    !currentBadges.includes(SkillLevelBadge.BEGINNER)
  ) {
    earnedBadges.push(SkillLevelBadge.BEGINNER);
  }
  if (
    projectsCompleted >= SKILL_LEVEL_CRITERIA.NEWBIE &&
    !currentBadges.includes(SkillLevelBadge.NEWBIE)
  ) {
    earnedBadges.push(SkillLevelBadge.NEWBIE);
  }

  // Update user with new badges if any earned
  if (earnedBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        earnedSkillBadges: [...currentBadges, ...earnedBadges],
      },
    });
  }

  return earnedBadges;
}

/**
 * Check and update specialization badges based on project categories
 */
async function checkSpecializationBadges(
  userId: string
): Promise<SpecializationBadge[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { earnedSpecializationBadges: true },
  });

  if (!user) return [];

  // Get all completed projects grouped by category
  const projectsByCategory = await prisma.project.groupBy({
    by: ["category"],
    where: {
      assignedStudentId: userId,
      status: "COMPLETED",
    },
    _count: {
      category: true,
    },
  });

  const currentBadges = user.earnedSpecializationBadges;
  const earnedBadges: SpecializationBadge[] = [];

  // Check Web Developer Pro
  const webDevCount =
    projectsByCategory.find((p) => p.category === "WEB_DEVELOPMENT")?._count
      .category || 0;
  if (
    webDevCount >= SPECIALIZATION_CRITERIA.WEB_DEVELOPER_PRO.count &&
    !currentBadges.includes(SpecializationBadge.WEB_DEVELOPER_PRO)
  ) {
    earnedBadges.push(SpecializationBadge.WEB_DEVELOPER_PRO);
  }

  // Check Mobile Maven
  const mobileDevCount =
    projectsByCategory.find((p) => p.category === "MOBILE_DEVELOPMENT")?._count
      .category || 0;
  if (
    mobileDevCount >= SPECIALIZATION_CRITERIA.MOBILE_MAVEN.count &&
    !currentBadges.includes(SpecializationBadge.MOBILE_MAVEN)
  ) {
    earnedBadges.push(SpecializationBadge.MOBILE_MAVEN);
  }

  // Check Design Thinker
  const designCount =
    projectsByCategory.find((p) => p.category === "UI_UX_DESIGN")?._count
      .category || 0;
  if (
    designCount >= SPECIALIZATION_CRITERIA.DESIGN_THINKER.count &&
    !currentBadges.includes(SpecializationBadge.DESIGN_THINKER)
  ) {
    earnedBadges.push(SpecializationBadge.DESIGN_THINKER);
  }

  // Check Data Analyst Ace
  const dataCount =
    projectsByCategory.find((p) => p.category === "DATA_SCIENCE")?._count
      .category || 0;
  if (
    dataCount >= SPECIALIZATION_CRITERIA.DATA_ANALYST_ACE.count &&
    !currentBadges.includes(SpecializationBadge.DATA_ANALYST_ACE)
  ) {
    earnedBadges.push(SpecializationBadge.DATA_ANALYST_ACE);
  }

  // Check AI Innovator
  const aiCount =
    projectsByCategory.find((p) => p.category === "MACHINE_LEARNING")?._count
      .category || 0;
  if (
    aiCount >= SPECIALIZATION_CRITERIA.AI_INNOVATOR.count &&
    !currentBadges.includes(SpecializationBadge.AI_INNOVATOR)
  ) {
    earnedBadges.push(SpecializationBadge.AI_INNOVATOR);
  }

  // Update user with new badges if any earned
  if (earnedBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        earnedSpecializationBadges: [...currentBadges, ...earnedBadges],
      },
    });
  }

  return earnedBadges;
}

/**
 * Check and update engagement badges based on activity and contributions
 */
async function checkEngagementBadges(
  userId: string,
  projectsCompleted: number,
  totalHours: number
): Promise<EngagementBadge[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { earnedEngagementBadges: true },
  });

  if (!user) return [];

  const currentBadges = user.earnedEngagementBadges;
  const earnedBadges: EngagementBadge[] = [];

  // Check Top Contributor
  if (
    projectsCompleted >=
      ENGAGEMENT_CRITERIA.TOP_CONTRIBUTOR.projectsCompleted &&
    !currentBadges.includes(EngagementBadge.TOP_CONTRIBUTOR)
  ) {
    earnedBadges.push(EngagementBadge.TOP_CONTRIBUTOR);
  }

  // Check Veteran (OR condition: 50 projects OR 200 hours)
  if (
    (projectsCompleted >= ENGAGEMENT_CRITERIA.VETERAN.projectsCompleted ||
      totalHours >= ENGAGEMENT_CRITERIA.VETERAN.hoursContributed) &&
    !currentBadges.includes(EngagementBadge.VETERAN)
  ) {
    earnedBadges.push(EngagementBadge.VETERAN);
  }

  // Check Consistent Performer
  if (
    projectsCompleted >=
      ENGAGEMENT_CRITERIA.CONSISTENT_PERFORMER.projectsCompleted &&
    !currentBadges.includes(EngagementBadge.CONSISTENT_PERFORMER)
  ) {
    earnedBadges.push(EngagementBadge.CONSISTENT_PERFORMER);
  }

  // Update user with new badges if any earned
  if (earnedBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        earnedEngagementBadges: [...currentBadges, ...earnedBadges],
      },
    });
  }

  return earnedBadges;
}

// ===== MAIN FUNCTIONS =====

/**
 * Increment user statistics (projects completed, hours contributed, industries)
 * Call this when a project is completed or hours are logged
 */
export async function incrementUserStats(
  userId: string,
  stats: {
    projectsCompleted?: number;
    hoursContributed?: number;
    industry?: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        projectsCompleted: true,
        totalHoursContributed: true,
        industriesExperienced: true,
      },
    });

    if (!user) throw new Error("User not found");

    const updateData: {
      projectsCompleted?: number;
      totalHoursContributed?: number;
      industriesExperienced?: string[];
    } = {};

    // Increment projects completed
    if (stats.projectsCompleted) {
      updateData.projectsCompleted =
        user.projectsCompleted + stats.projectsCompleted;
    }

    // Increment hours contributed
    if (stats.hoursContributed) {
      updateData.totalHoursContributed =
        user.totalHoursContributed + stats.hoursContributed;
    }

    // Add industry if new
    if (
      stats.industry &&
      !user.industriesExperienced.includes(stats.industry)
    ) {
      updateData.industriesExperienced = [
        ...user.industriesExperienced,
        stats.industry,
      ];
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      projectsCompleted: updateData.projectsCompleted || user.projectsCompleted,
      totalHoursContributed:
        updateData.totalHoursContributed || user.totalHoursContributed,
      industriesExperienced:
        updateData.industriesExperienced || user.industriesExperienced,
    };
  } catch (error) {
    console.error("Error incrementing user stats:", error);
    throw new Error("Failed to increment user stats");
  }
}

/**
 * Main function to check and update all user badges
 * Call this after major events like project completion
 */
export async function updateUserBadges(
  userId: string
): Promise<BadgeUpdateResult> {
  try {
    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        projectsCompleted: true,
        totalHoursContributed: true,
        industriesExperienced: true,
      },
    });

    if (!user) throw new Error("User not found");

    const newBadges: BadgeUpdateResult["newBadges"] = {};

    // Check and update skill level badges
    const skillBadges = await checkSkillLevelBadges(
      userId,
      user.projectsCompleted
    );
    if (skillBadges.length > 0) {
      newBadges.skillLevel = skillBadges;
    }

    // Check and update specialization badges
    const specializationBadges = await checkSpecializationBadges(userId);
    if (specializationBadges.length > 0) {
      newBadges.specialization = specializationBadges;
    }

    // Check and update engagement badges
    const engagementBadges = await checkEngagementBadges(
      userId,
      user.projectsCompleted,
      user.totalHoursContributed
    );
    if (engagementBadges.length > 0) {
      newBadges.engagement = engagementBadges;
    }

    return {
      newBadges,
      updatedStats: {
        projectsCompleted: user.projectsCompleted,
        totalHoursContributed: user.totalHoursContributed,
        industriesExperienced: user.industriesExperienced,
      },
    };
  } catch (error) {
    console.error("Error updating user badges:", error);
    throw new Error("Failed to update user badges");
  }
}

/**
 * Get all badges for a user (for display purposes)
 */
export async function getUserBadges(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        earnedSkillBadges: true,
        earnedSpecializationBadges: true,
        earnedEngagementBadges: true,
        projectsCompleted: true,
        totalHoursContributed: true,
        industriesExperienced: true,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    console.error("Error fetching user badges:", error);
    throw new Error("Failed to fetch user badges");
  }
}
