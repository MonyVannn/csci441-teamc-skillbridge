/**
 * Demo API Routes for Individual User Operations
 * These endpoints are created for demonstration purposes to show backend functionality
 * The actual application uses Next.js Server Actions instead of REST APIs
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ clerkId: string }>;
}

/**
 * GET /api/demo/users/[clerkId]
 * Fetch a specific user by their Clerk ID
 *
 * Example: GET /api/demo/users/user_2abc123xyz
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;

    if (!clerkId) {
      return NextResponse.json(
        {
          success: false,
          error: "clerkId parameter is required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        intro: true,
        address: true,
        skills: true,
        imageUrl: true,
        role: true,
        occupied: true,
        createdAt: true,
        updatedAt: true,
        totalHoursContributed: true,
        projectsCompleted: true,
        industriesExperienced: true,
        education: true,
        experiences: true,
        socialLinks: true,
        previousProjects: true,
        earnedSkillBadges: true,
        earnedSpecializationBadges: true,
        earnedEngagementBadges: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/demo/users/[clerkId]
 * Update a user's profile (bio, intro, firstName, lastName, etc.)
 *
 * Request Body (all fields optional):
 * {
 *   "firstName": "string",
 *   "lastName": "string",
 *   "bio": "string",
 *   "intro": "string",
 *   "address": "string",
 *   "skills": ["string", "string"]
 * }
 *
 * Example: PATCH /api/demo/users/user_2abc123xyz
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { clerkId } = await params;

    if (!clerkId) {
      return NextResponse.json(
        {
          success: false,
          error: "clerkId parameter is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "firstName",
      "lastName",
      "bio",
      "intro",
      "address",
      "skills",
    ];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid fields to update. Allowed fields: " +
            allowedFields.join(", "),
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { clerkId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
      updatedFields: Object.keys(updateData),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
