import {
  PrismaClient,
  UserRole,
  ProjectCategory,
  ProjectScope,
  ProjectStatus,
  ApplicationStatus,
} from "@prisma/client";
import { ObjectId } from "mongodb"; // For generating MongoDB ObjectIds

const prisma = new PrismaClient();

// Helper function to generate a valid MongoDB ObjectId string
const generateObjectId = (): string => {
  return new ObjectId().toHexString();
};

async function main() {
  console.log("Start seeding...");

  // --- 1. Clear existing data ---
  try {
    await prisma.application.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("Cleared existing Application, Project, and User data.");
  } catch (error) {
    console.error("Error clearing data, continuing anyway:", error);
  }

  // --- 2. Create Users (Admin, Business Owners, Students) ---
  console.log("\nCreating Users...");

  const adminId = generateObjectId();
  const adminUser = await prisma.user.create({
    data: {
      id: adminId,
      clerkId: "user_admin_clerk_id_12345",
      email: "admin@skillbridge.com",
      firstName: "Admin",
      lastName: "User",
      bio: "Platform administrator.",
      role: UserRole.ADMIN,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  const owner1Id = generateObjectId();
  const owner1 = await prisma.user.create({
    data: {
      id: owner1Id,
      clerkId: "user_bizowner_clerk_id_67890",
      email: "innovate_corp@example.com",
      firstName: "Maria",
      lastName: "Gomez",
      bio: "CEO of Innovate Corp.",
      imageUrl: "https://avatar.vercel.sh/maria.png",
      role: UserRole.BUSINESS_OWNER,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [
        { type: "LinkedIn", url: "https://linkedin.com/in/mariag" },
      ],
    },
  });
  console.log(`Created business owner: ${owner1.email}`);

  const owner2Id = generateObjectId();
  const owner2 = await prisma.user.create({
    data: {
      id: owner2Id,
      clerkId: "user_bizowner_clerk_id_11223",
      email: "creative_studio@example.com",
      firstName: "David",
      lastName: "Lee",
      bio: "Art Director at Creative Studio.",
      imageUrl: "https://avatar.vercel.sh/david.png",
      role: UserRole.BUSINESS_OWNER,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Created business owner: ${owner2.email}`);

  const student1Id = generateObjectId();
  const student1 = await prisma.user.create({
    data: {
      id: student1Id,
      clerkId: "user_student_clerk_id_001",
      email: "emma.jones@university.edu",
      firstName: "Emma",
      lastName: "Jones",
      bio: "CS student, full-stack dev.",
      imageUrl: "https://avatar.vercel.sh/emma.png",
      role: UserRole.USER,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      occupied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [{ type: "GitHub", url: "https://github.com/emmaj" }],
      experiences: [
        {
          title: "Intern",
          company: "Web Solutions",
          startDate: new Date("2024-06-01"),
        },
      ],
    },
  });
  console.log(`Created student user: ${student1.email}`);

  const student2Id = generateObjectId();
  const student2 = await prisma.user.create({
    data: {
      id: student2Id,
      clerkId: "user_student_clerk_id_002",
      email: "liam.chen@university.edu",
      firstName: "Liam",
      lastName: "Chen",
      bio: "Aspiring data scientist.",
      imageUrl: "https://avatar.vercel.sh/liam.png",
      role: UserRole.USER,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      occupied: true, // Liam is currently occupied
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [{ type: "LinkedIn", url: "https://linkedin.com/in/liamc" }],
    },
  });
  console.log(`Created student user: ${student2.email}`);

  const student3Id = generateObjectId();
  const student3 = await prisma.user.create({
    data: {
      id: student3Id,
      clerkId: "user_student_clerk_id_003",
      email: "sophia.roberts@university.edu",
      firstName: "Sophia",
      lastName: "Roberts",
      bio: "UX/UI design enthusiast.",
      imageUrl: "https://avatar.vercel.sh/sophia.png",
      role: UserRole.USER,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      occupied: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialLinks: [{ type: "Portfolio", url: "https://sophia.design" }],
    },
  });
  console.log(`Created student user: ${student3.email}`);

  // --- 3. Create Projects ---
  console.log("\nCreating Projects...");

  const projectsToCreate = [
    {
      title: "E-commerce React Frontend",
      description:
        "Build a responsive e-commerce frontend using React, Next.js, and Tailwind CSS. Integrate with a dummy API.",
      requiredSkills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
      category: ProjectCategory.WEB_DEVELOPMENT,
      scope: ProjectScope.INTERMEDIATE,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-01-10"),
      estimatedEndDate: new Date("2025-03-10"),
      applicationDeadline: new Date("2024-12-31"),
      budget: 1500.0,
      businessOwnerId: owner1Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "Mobile Recipe App UI/UX",
      description:
        "Design a user-friendly UI/UX for a mobile recipe application. Focus on intuitive navigation and appealing visuals.",
      requiredSkills: ["Figma", "UI/UX Design", "User Research"],
      category: ProjectCategory.UI_UX_DESIGN,
      scope: ProjectScope.BEGINNER,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-02-01"),
      estimatedEndDate: new Date("2025-02-28"),
      applicationDeadline: new Date("2025-01-20"),
      budget: 800.0,
      businessOwnerId: owner2Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "Customer Feedback Sentiment Analysis",
      description:
        "Develop a Python script to perform sentiment analysis on customer feedback data. Output positive, negative, and neutral sentiment scores.",
      requiredSkills: ["Python", "Pandas", "NLTK", "Machine Learning"],
      category: ProjectCategory.DATA_SCIENCE,
      scope: ProjectScope.ADVANCED,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-01-20"),
      estimatedEndDate: new Date("2025-03-20"),
      applicationDeadline: new Date("2025-01-10"),
      budget: 2000.0,
      businessOwnerId: owner1Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "Portfolio Website Redesign",
      description:
        "Redesign an existing portfolio website for a graphic designer. Modernize the look and improve user experience.",
      requiredSkills: ["Web Design", "Figma", "HTML/CSS"],
      category: ProjectCategory.UI_UX_DESIGN,
      scope: ProjectScope.INTERMEDIATE,
      status: ProjectStatus.ASSIGNED, // This project is already assigned
      startDate: new Date("2024-11-01"),
      estimatedEndDate: new Date("2024-12-15"),
      applicationDeadline: new Date("2024-10-20"),
      budget: 1200.0,
      businessOwnerId: owner2Id,
      assignedStudentId: student1.id, // Assign to Emma
      isPublic: true,
    },
    {
      title: "Backend API for Task Management App",
      description:
        "Build a RESTful API using Node.js, Express, and MongoDB for a task management application. Implement authentication and CRUD operations.",
      requiredSkills: ["Node.js", "Express", "MongoDB", "REST API"],
      category: ProjectCategory.WEB_DEVELOPMENT,
      scope: ProjectScope.ADVANCED,
      status: ProjectStatus.IN_PROGRESS, // Already started
      startDate: new Date("2024-10-15"),
      estimatedEndDate: new Date("2024-12-30"),
      applicationDeadline: new Date("2024-10-01"),
      budget: 2500.0,
      businessOwnerId: owner1Id,
      assignedStudentId: student2.id, // Assign to Liam
      isPublic: true,
    },
    {
      title: "Blockchain DApp Prototype",
      description:
        "Develop a simple decentralized application (DApp) prototype for a loyalty program using Ethereum (or a testnet) and Solidity.",
      requiredSkills: ["Solidity", "Ethereum", "Web3.js", "Blockchain"],
      category: ProjectCategory.BLOCKCHAIN,
      scope: ProjectScope.EXPERT,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-03-01"),
      estimatedEndDate: new Date("2025-05-01"),
      applicationDeadline: new Date("2025-02-15"),
      budget: 4000.0,
      businessOwnerId: owner1Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "Basic Android Calculator App",
      description:
        "Create a functional calculator application for Android using Kotlin/Java. Focus on basic arithmetic operations and a clean UI.",
      requiredSkills: ["Android Studio", "Kotlin", "Java"],
      category: ProjectCategory.MOBILE_DEVELOPMENT,
      scope: ProjectScope.BEGINNER,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-01-05"),
      estimatedEndDate: new Date("2025-01-25"),
      applicationDeadline: new Date("2024-12-28"),
      budget: 700.0,
      businessOwnerId: owner2Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "AI Chatbot Integration",
      description:
        "Integrate a pre-trained AI chatbot (e.g., OpenAI API) into an existing web application to answer FAQs.",
      requiredSkills: [
        "Python",
        "API Integration",
        "Natural Language Processing",
      ],
      category: ProjectCategory.MACHINE_LEARNING,
      scope: ProjectScope.INTERMEDIATE,
      status: ProjectStatus.IN_REVIEW, // Applications are being reviewed
      startDate: new Date("2025-02-15"),
      estimatedEndDate: new Date("2025-03-15"),
      applicationDeadline: new Date("2025-01-31"),
      budget: 1800.0,
      businessOwnerId: owner1Id,
      assignedStudentId: null,
      isPublic: true,
    },
    {
      title: "Game Level Design for Mobile",
      description:
        "Design 3-5 engaging levels for a casual mobile puzzle game. Provide level layouts, mechanics, and design documentation.",
      requiredSkills: ["Game Design", "Level Design", "Prototyping"],
      category: ProjectCategory.GAME_DEVELOPMENT,
      scope: ProjectScope.INTERMEDIATE,
      status: ProjectStatus.OPEN,
      startDate: new Date("2025-02-20"),
      estimatedEndDate: new Date("2025-03-20"),
      applicationDeadline: new Date("2025-02-10"),
      budget: 1000.0,
      businessOwnerId: owner2Id,
      assignedStudentId: null,
      isPublic: true,
    },
  ];

  const createdProjects: any = [];
  for (const projectData of projectsToCreate) {
    const project = await prisma.project.create({
      data: {
        id: generateObjectId(),
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    createdProjects.push(project);
    console.log(`Created project: "${project.title}"`);
  }

  // Helper to easily grab projects by title
  const getProjectByTitle = (title: string) =>
    createdProjects.find((p: any) => p.title === title)!;

  // --- 4. Create Applications ---
  console.log("\nCreating Applications...");

  // Emma applies to a few projects
  await prisma.application.create({
    data: {
      id: generateObjectId(),
      projectId: getProjectByTitle("E-commerce React Frontend").id,
      applicantId: student1.id,
      status: ApplicationStatus.PENDING,
      coverLetter:
        "I have strong React/Next.js skills and am excited about e-commerce!",
      appliedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Emma applied to "E-commerce React Frontend"`);

  await prisma.application.create({
    data: {
      id: generateObjectId(),
      projectId: getProjectByTitle("AI Chatbot Integration").id, // Project with status IN_REVIEW
      applicantId: student1.id,
      status: ApplicationStatus.PENDING,
      coverLetter:
        "Experienced in Python and API integrations, eager to work on AI.",
      appliedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Emma applied to "AI Chatbot Integration"`);

  // Sophia applies to a design project and gets accepted for one
  await prisma.application.create({
    data: {
      id: generateObjectId(),
      projectId: getProjectByTitle("Mobile Recipe App UI/UX").id,
      applicantId: student3.id,
      status: ApplicationStatus.ACCEPTED, // Sophia's application is accepted
      coverLetter:
        "My portfolio demonstrates strong UI/UX design capabilities suitable for this app.",
      appliedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Sophia applied to "Mobile Recipe App UI/UX" (Accepted)`);

  await prisma.application.create({
    data: {
      id: generateObjectId(),
      projectId: getProjectByTitle("Portfolio Website Redesign").id,
      applicantId: student3.id,
      status: ApplicationStatus.REJECTED, // Sophia applied but got rejected for this one
      coverLetter:
        "I believe my design eye would greatly benefit this project!",
      appliedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Sophia applied to "Portfolio Website Redesign" (Rejected)`);

  // Liam is already occupied, but maybe he applied before that or for a future project
  await prisma.application.create({
    data: {
      id: generateObjectId(),
      projectId: getProjectByTitle("Customer Feedback Sentiment Analysis").id,
      applicantId: student2.id,
      status: ApplicationStatus.PENDING,
      coverLetter:
        "Strong background in Python and sentiment analysis tools like NLTK.",
      appliedAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`Liam applied to "Customer Feedback Sentiment Analysis"`);

  console.log("\nSeeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
