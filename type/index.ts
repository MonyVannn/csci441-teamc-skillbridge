export type AvailableProject = {
  id: string;
  title: string;
  description: string;
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
    imageUrl: string | null;
    firstName?: string | null;
    lastName?: string | null;
    address?: string | null;
    bio?: string | null;
    intro?: string | null;
  };

  assignedStudent?: {
    id: string;
    imageUrl: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;

  applications?: [] | null;
};
