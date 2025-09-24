import {
  PrismaClient,
  UserRole,
  ProjectCategory,
  ProjectScope,
  ProjectStatus,
  SkillLevelBadge,
  SpecializationBadge,
  EngagementBadge,
  ApplicationStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker"; // Import faker for generating realistic-looking data

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clear existing data (optional, but good for consistent seeding)
  await prisma.application.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data.");

  // 2. Create BUSINESS_OWNER Users
  const businessOwnersData = Array.from({ length: 3 }).map(() => ({
    clerkId: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    bio: faker.person.bio(),
    intro: faker.lorem.sentence(),
    address: faker.location.city() + ", " + faker.location.country(),
    skills: ["Project Management", "Business Strategy", "Marketing"],
    imageUrl: faker.image.avatar(),
    role: UserRole.BUSINESS_OWNER,
    occupied: faker.datatype.boolean(),
    totalHoursContributed: 0,
    projectsCompleted: 0,
    industriesExperienced: ["Tech", "Retail", "Finance"],
    socialLinks: [
      { type: "LinkedIn", url: faker.internet.url() },
      { type: "Website", url: faker.internet.url() },
    ],
    experiences: [],
    education: [],
    previousProjects: [],
    earnedSkillBadges: [],
    earnedSpecializationBadges: [],
    earnedEngagementBadges: [],
  }));

  const businessOwners = await Promise.all(
    businessOwnersData.map((data) => prisma.user.create({ data }))
  );
  console.log(`Created ${businessOwners.length} business owners.`);

  // 3. Create Student (USER) Users
  const studentsData = Array.from({ length: 10 }).map(() => ({
    clerkId: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    bio: faker.person.bio(),
    intro: faker.lorem.sentence(),
    address: faker.location.city() + ", " + faker.location.country(),
    skills: ["React", "Node.js", "MongoDB", "UI/UX", "Python", "Data Analysis"],
    imageUrl: faker.image.avatar(),
    role: UserRole.USER, // Student
    occupied: faker.datatype.boolean(),
    totalHoursContributed: faker.number.int({ min: 10, max: 200 }),
    projectsCompleted: faker.number.int({ min: 0, max: 10 }),
    industriesExperienced: faker.helpers.arrayElements(
      ["Tech", "Healthcare", "Non-profit", "Education"],
      { min: 1, max: 3 }
    ),
    socialLinks: [
      { type: "GitHub", url: faker.internet.url() },
      { type: "LinkedIn", url: faker.internet.url() },
    ],
    experiences: [
      {
        id: faker.string.uuid(),
        title: faker.person.jobTitle(),
        company: faker.company.name(),
        startDate: faker.date.past({ years: 2 }),
        endDate: faker.date.recent({ days: 30 }),
        description: faker.lorem.paragraph(),
      },
    ],
    education: [
      {
        id: faker.string.uuid(),
        degree: faker.company.name(),
        institution: faker.company.name(),
        startDate: faker.date.past({ years: 5 }),
        endDate: faker.date.past({ years: 1 }),
        description: faker.lorem.paragraph(),
      },
    ],
    previousProjects: [
      {
        id: faker.string.uuid(),
        title: faker.commerce.productName() + " App",
        role: "Frontend Developer",
        industry: "Software",
        description: faker.lorem.paragraph(),
        tags: ["React", "TypeScript", "API"],
        startDate: faker.date.past({ years: 1 }),
        endDate: faker.date.recent({ days: 60 }),
      },
    ],
    earnedSkillBadges: faker.helpers.arrayElements(
      [
        SkillLevelBadge.NEWBIE,
        SkillLevelBadge.BEGINNER,
        SkillLevelBadge.INTERMEDIATE,
      ],
      { min: 0, max: 2 }
    ),
    earnedSpecializationBadges: faker.helpers.arrayElements(
      [
        SpecializationBadge.WEB_DEVELOPER_PRO,
        SpecializationBadge.FRONTEND_FOCUS,
        SpecializationBadge.DATA_ANALYST_ACE,
      ],
      { min: 0, max: 2 }
    ),
    earnedEngagementBadges: faker.helpers.arrayElements(
      [EngagementBadge.EARLY_BIRD, EngagementBadge.TEAM_PLAYER],
      { min: 0, max: 1 }
    ),
  }));

  const students = await Promise.all(
    studentsData.map((data) => prisma.user.create({ data }))
  );
  console.log(`Created ${students.length} students.`);

  // 4. Create Projects
  const projectsData = Array.from({ length: 5 }).map((_, i) => {
    const businessOwner = businessOwners[i % businessOwners.length]; // Assign cyclically
    const status = faker.helpers.arrayElement([
      ProjectStatus.OPEN,
      ProjectStatus.IN_REVIEW,
      ProjectStatus.ASSIGNED,
      ProjectStatus.IN_PROGRESS,
      ProjectStatus.COMPLETED,
    ]);
    const startDate = faker.date.soon({ days: 30 });
    const estimatedEndDate = faker.date.future({
      years: 0.5,
      refDate: startDate,
    });
    const applicationDeadline = faker.date.soon({
      days: 15,
      refDate: startDate,
    });

    const project: any = {
      title: faker.commerce.productName() + " Platform",
      description: faker.lorem.paragraphs(2),
      requiredSkills: faker.helpers.arrayElements(
        ["React", "Node.js", "MongoDB", "UI/UX", "Python"],
        { min: 2, max: 4 }
      ),
      category: faker.helpers.arrayElement(Object.values(ProjectCategory)),
      scope: faker.helpers.arrayElement(Object.values(ProjectScope)),
      status: status,
      startDate: startDate,
      estimatedEndDate: estimatedEndDate,
      applicationDeadline: applicationDeadline,
      budget: faker.number.float({ min: 500, max: 5000 }),
      isPublic: true,
      businessOwnerId: businessOwner.id,
    };

    // If a project is ASSIGNED or IN_PROGRESS or COMPLETED, assign a student
    if (
      [
        ProjectStatus.ASSIGNED,
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED,
      ].includes(status as "ASSIGNED" | "IN_PROGRESS" | "COMPLETED")
    ) {
      const assignedStudent =
        students[faker.number.int({ min: 0, max: students.length - 1 })];
      project.assignedStudentId = assignedStudent.id;
    }

    return project;
  });

  const projects = await Promise.all(
    projectsData.map((data) => prisma.project.create({ data }))
  );
  console.log(`Created ${projects.length} projects.`);

  // 5. Create Applications
  // Create applications for some open projects by some students
  const openProjects = projects.filter(
    (p) =>
      p.status === ProjectStatus.OPEN || p.status === ProjectStatus.IN_REVIEW
  );

  for (const project of openProjects) {
    const numApplications = faker.number.int({ min: 1, max: 3 }); // 1 to 3 applications per project
    const applicants = faker.helpers.arrayElements(students, {
      min: 1,
      max: numApplications,
    });

    for (const applicant of applicants) {
      // Ensure the applicant isn't the assigned student for this project (though unlikely for OPEN projects)
      if (applicant.id === project.assignedStudentId) continue;

      // Randomly set status for existing applications (if project is IN_REVIEW)
      const applicationStatus =
        project.status === ProjectStatus.IN_REVIEW
          ? faker.helpers.arrayElement([
              ApplicationStatus.PENDING,
              ApplicationStatus.ACCEPTED,
              ApplicationStatus.REJECTED,
            ])
          : ApplicationStatus.PENDING;

      await prisma.application.create({
        data: {
          projectId: project.id,
          applicantId: applicant.id,
          status: applicationStatus,
          coverLetter: faker.lorem.paragraph(),
          appliedAt: faker.date.recent({ days: 7 }),
        },
      });
    }
  }
  console.log("Created applications for open projects.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
