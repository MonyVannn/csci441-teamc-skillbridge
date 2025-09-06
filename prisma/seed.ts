import { PrismaClient, UserRole } from "@prisma/client";
import { ObjectId } from "mongodb";

const prisma = new PrismaClient();

const generateObjectId = (): string => {
  return new ObjectId().toHexString();
};

async function main() {
  console.log("Start seeding...");

  try {
    await prisma.user.deleteMany({});
    console.log("Cleared existing user data.");
  } catch (error) {
    console.error("Error clearing data, continuing anyway:", error);
  }

  // --- Create ADMIN User ---
  const adminUser = await prisma.user.create({
    data: {
      id: generateObjectId(),
      clerkId: "user_admin_clerk_id_12345",
      email: "admin@skillbridge.com",
      firstName: "Admin",
      lastName: "User",
      bio: "Administrator for SkillBridge platform, overseeing all operations.",
      imageUrl: "https://avatar.vercel.sh/admin.png",
      role: UserRole.ADMIN,
      occupied: false,
      socialLinks: [
        { type: "LinkedIn", url: "https://linkedin.com/in/skillbridge-admin" },
      ],
      experiences: [
        {
          title: "Chief Operations Officer",
          company: "SkillBridge Solutions",
          startDate: new Date("2022-01-15"),
          description: "Managed all platform development and deployment.",
        },
      ],
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // --- Create BUSINESS_OWNER User ---
  const businessOwner1 = await prisma.user.create({
    data: {
      id: generateObjectId(),
      clerkId: "user_bizowner_clerk_id_67890",
      email: "innovate_corp@example.com",
      firstName: "Maria",
      lastName: "Gomez",
      bio: "Founder of Innovate Corp, seeking innovative student talent for our projects.",
      imageUrl: "https://avatar.vercel.sh/maria.png",
      role: UserRole.BUSINESS_OWNER,
      occupied: false,
      socialLinks: [
        { type: "Website", url: "https://innovatecorp.com" },
        { type: "LinkedIn", url: "https://linkedin.com/company/innovate-corp" },
      ],
      experiences: [
        {
          title: "CEO",
          company: "Innovate Corp",
          startDate: new Date("2019-03-01"),
          description:
            "Leading a team of 50+ to build cutting-edge software solutions.",
        },
      ],
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
    },
  });
  console.log(`Created business owner: ${businessOwner1.email}`);

  // --- Create USER (Student) Accounts ---
  const student1 = await prisma.user.create({
    data: {
      id: generateObjectId(),
      clerkId: "user_student_clerk_id_001",
      email: "emma.jones@university.edu",
      firstName: "Emma",
      lastName: "Jones",
      bio: "Third-year Computer Science student, specializing in full-stack development. Eager to learn and contribute!",
      imageUrl: "https://avatar.vercel.sh/emma.png",
      role: UserRole.USER,
      occupied: false,
      socialLinks: [
        { type: "GitHub", url: "https://github.com/emmajdev" },
        { type: "LinkedIn", url: "https://linkedin.com/in/emmajonesdev" },
      ],
      experiences: [
        {
          title: "Frontend Developer Intern",
          company: "Web Solutions Inc.",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-08-31"),
          description:
            "Developed responsive user interfaces using React and Tailwind CSS.",
        },
      ],
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
    },
  });
  console.log(`Created student user: ${student1.email}`);

  // Repeat for other student users...

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
