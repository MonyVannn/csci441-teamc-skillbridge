import { ApplicationStatus, Project, User, UserRole } from "@prisma/client";

export type ProjectWithAssignedStudent = Project & {
  assignedStudent: User | null;
};

export type AvailableProject = {
  id: string;
  title: string;
  description: string;
  responsibilities: string | null;
  deliverables: string | null;
  requiredSkills: string[];
  category: string;
  scope: string;
  status: string;
  startDate: Date;
  estimatedEndDate: Date;
  applicationDeadline: Date;
  budget: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;

  businessOwner: {
    id: string;
    clerkId?: string;
    imageUrl: string | null;
    firstName?: string | null;
    lastName?: string | null;
    address?: string | null;
    bio?: string | null;
    intro?: string | null;
    role?: UserRole | null;
  };

  assignedStudent?: {
    id: string;
    clerkId?: string;
    imageUrl: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    skills?: string[];
  } | null;

  applications?:
    | {
        updatedAt: Date;
        status: ApplicationStatus;
      }[]
    | null;
};

export type TimelineEntry = {
  date: string;
  title: string;
  content: string;
};
