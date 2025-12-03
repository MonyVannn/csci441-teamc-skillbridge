/**
 * Demo API Routes for User/Profile Operations
 * These endpoints are created for demonstration purposes to show backend functionality
 * The actual application uses Next.js Server Actions instead of REST APIs
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/demo/users
 * Fetch all users from the database
 *
 * Query Parameters:
 * - limit: number (optional) - Limit the number of results
 * - offset: number (optional) - Skip a number of results for pagination
 *
 * Example: GET /api/demo/users?limit=10&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
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
      },
    });

    const totalCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + users.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/demo/users
 * Create a new user (Demo only - actual user creation happens via Clerk webhook)
 *
 * Request Body:
 * {
 *   "clerkId": "string",
 *   "email": "string",
 *   "firstName": "string" (optional),
 *   "lastName": "string" (optional),
 *   "bio": "string" (optional),
 *   "intro": "string" (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { clerkId, email, firstName, lastName, bio, intro } = body;

    if (!clerkId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: clerkId and email are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this clerkId or email already exists",
        },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        intro: intro || null,
        role: "USER",
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: [],
        socialLinks: [],
        experiences: [],
        education: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
