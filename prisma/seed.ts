import { PrismaClient, UserRole } from "@prisma/client";
// For generating MongoDB ObjectIds
import { ObjectId } from "mongodb"; // You might need to install this: npm install mongodb

const prisma = new PrismaClient();

// Helper function to generate a valid MongoDB ObjectId string
const generateObjectId = (): string => {
  return new ObjectId().toHexString();
};

async function main() {
  console.log("Start seeding...");

  // Optional: Clear existing data before seeding (use with caution in production!)
  try {
    await prisma.user.deleteMany({});
    console.log("Cleared existing user data.");
  } catch (error) {
    console.error("Error clearing data, continuing anyway:", error);
  }

  // --- Create ADMIN User ---
  const adminUser = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
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
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // --- Create BUSINESS_OWNER User ---
  const businessOwner1 = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
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
        {
          title: "Senior Software Engineer",
          company: "Global Tech",
          startDate: new Date("2014-07-01"),
          endDate: new Date("2019-02-28"),
        },
      ],
    },
  });
  console.log(`Created business owner: ${businessOwner1.email}`);

  const businessOwner2 = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
      clerkId: "user_bizowner_clerk_id_11223",
      email: "creative_studio@example.com",
      firstName: "David",
      lastName: "Lee",
      bio: "Art Director at Creative Studio. We need fresh ideas in design and marketing.",
      imageUrl: "https://avatar.vercel.sh/david.png",
      role: UserRole.BUSINESS_OWNER,
      occupied: false,
      socialLinks: [{ type: "Portfolio", url: "https://davidlee.art" }],
      experiences: [
        {
          title: "Art Director",
          company: "Creative Studio",
          startDate: new Date("2017-11-01"),
          description: "Overseeing all visual projects and brand identity.",
        },
      ],
    },
  });
  console.log(`Created business owner: ${businessOwner2.email}`);

  // --- Create USER (Student) Accounts ---
  const student1 = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
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
        {
          title: "CS Student",
          company: "City University",
          startDate: new Date("2022-09-01"),
        },
      ],
    },
  });
  console.log(`Created student user: ${student1.email}`);

  const student2 = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
      clerkId: "user_student_clerk_id_002",
      email: "liam.chen@university.edu",
      firstName: "Liam",
      lastName: "Chen",
      bio: "Aspiring data scientist with a strong foundation in Python and machine learning.",
      imageUrl: "https://avatar.vercel.sh/liam.png",
      role: UserRole.USER,
      occupied: true,
      socialLinks: [{ type: "GitHub", url: "https://github.com/liamchendata" }],
      experiences: [
        {
          title: "Research Assistant",
          company: "University Research Lab",
          startDate: new Date("2023-10-01"),
          description:
            "Assisted in data collection and analysis for AI projects.",
        },
        {
          title: "Mathematics Student",
          company: "National College",
          startDate: new Date("2021-09-01"),
        },
      ],
    },
  });
  console.log(`Created student user: ${student2.email}`);

  const student3 = await prisma.user.create({
    data: {
      id: generateObjectId(), // <-- Added this line
      clerkId: "user_student_clerk_id_003",
      email: "sophia.roberts@university.edu",
      firstName: "Sophia",
      lastName: "Roberts",
      bio: "Passionate about UX/UI design and creating intuitive digital experiences.",
      imageUrl: "https://avatar.vercel.sh/sophia.png",
      role: UserRole.USER,
      occupied: false,
      socialLinks: [
        { type: "Portfolio", url: "https://sophia.design" },
        { type: "Behance", url: "https://behance.net/sophiaroberts" },
      ],
      experiences: [
        {
          title: "Graphic Design Intern",
          company: "Local Creative Agency",
          startDate: new Date("2023-01-10"),
          endDate: new Date("2023-05-01"),
          description: "Created branding materials and social media graphics.",
        },
      ],
    },
  });
  console.log(`Created student user: ${student3.email}`);

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
