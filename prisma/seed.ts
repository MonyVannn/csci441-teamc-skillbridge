import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed data can be customized via environment variables
const SEED_USER_COUNT = parseInt(process.env.SEED_USER_COUNT || "20", 10);
const SEED_BUSINESS_OWNER_COUNT = parseInt(
  process.env.SEED_BUSINESS_OWNER_COUNT || "5",
  10
);
const SEED_PROJECT_COUNT = parseInt(process.env.SEED_PROJECT_COUNT || "30", 10);

// Sample data arrays
const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
  "Iris",
  "Jack",
  "Kate",
  "Liam",
  "Maya",
  "Noah",
  "Olivia",
  "Paul",
  "Quinn",
  "Ruby",
  "Sam",
  "Tara",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yara",
  "Zane",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Clark",
];

const companies = [
  "TechCorp",
  "InnovateLabs",
  "Digital Solutions Inc",
  "CloudWorks",
  "DataDrive",
  "AI Innovations",
  "WebMasters",
  "MobileFirst",
  "CodeCraft",
  "DevHub",
  "StartupX",
  "FutureTech",
  "NexGen Solutions",
  "SmartApps Co",
  "CyberShield",
];

const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "GraphQL",
  "REST API",
  "Machine Learning",
  "Data Analysis",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "TailwindCSS",
  "Next.js",
  "Vue.js",
  "Angular",
  "Django",
  "Flask",
  "Spring Boot",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Retail",
  "Non-profit",
  "Government",
  "Media",
  "Telecommunications",
  "Energy",
  "Real Estate",
  "Transportation",
  "Hospitality",
];

const projectCategories = [
  "WEB_DEVELOPMENT",
  "MOBILE_DEVELOPMENT",
  "UI_UX_DESIGN",
  "DATA_SCIENCE",
  "MACHINE_LEARNING",
  "BLOCKCHAIN",
  "GAME_DEVELOPMENT",
  "CYBERSECURITY",
  "CLOUD_COMPUTING",
  "DEVOPS",
  "API_DEVELOPMENT",
  "DATABASE_DESIGN",
  "SOFTWARE_TESTING",
];

const projectTitles = [
  "E-commerce Platform Development",
  "Mobile Banking App",
  "Healthcare Dashboard",
  "AI Chatbot Integration",
  "Data Analytics Platform",
  "Social Media Management Tool",
  "IoT Device Controller",
  "Blockchain Payment System",
  "Video Streaming Service",
  "Learning Management System",
  "CRM System Overhaul",
  "Inventory Management System",
  "Real-time Collaboration Tool",
  "Predictive Analytics Engine",
  "Cloud Migration Project",
  "API Gateway Implementation",
  "Microservices Architecture",
  "Security Audit Platform",
  "DevOps Pipeline Setup",
  "Mobile Game Development",
  "Content Management System",
  "Customer Portal Development",
  "Data Visualization Dashboard",
  "Machine Learning Model Training",
  "Automated Testing Framework",
  "CI/CD Pipeline Optimization",
  "Database Performance Tuning",
  "Legacy System Modernization",
  "Progressive Web App",
  "Serverless Architecture Implementation",
];

// Utility functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generateClerkId(prefix: string, index: number): string {
  return `${prefix}_${Date.now()}_${index}_${Math.random()
    .toString(36)
    .substring(7)}`;
}

// Main seed function
async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (idempotent - can be run multiple times)
  console.log("🗑️  Clearing existing data...");
  await prisma.application.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Existing data cleared");

  // Create Admin User
  console.log("👤 Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      clerkId: generateClerkId("admin", 0),
      email: "admin@skillbridge.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      bio: "Platform administrator with full access to all features.",
      intro: "Managing the SkillBridge platform",
      address: "San Francisco, CA",
      skills: ["Platform Management", "System Administration", "User Support"],
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      occupied: false,
      totalHoursContributed: 0,
      projectsCompleted: 0,
      industriesExperienced: [],
      socialLinks: [
        { type: "LinkedIn", url: "https://linkedin.com/in/admin" },
        { type: "GitHub", url: "https://github.com/skillbridge-admin" },
      ],
      experiences: [],
      education: [],
      previousProjects: [],
      earnedSkillBadges: [],
      earnedSpecializationBadges: [],
      earnedEngagementBadges: [],
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Business Owners
  console.log(`🏢 Creating ${SEED_BUSINESS_OWNER_COUNT} business owners...`);
  const businessOwners = [];
  for (let i = 0; i < SEED_BUSINESS_OWNER_COUNT; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const company = randomElement(companies);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company
      .toLowerCase()
      .replace(/\s/g, "")}.com`;

    const owner = await prisma.user.create({
      data: {
        clerkId: generateClerkId("owner", i),
        email,
        firstName,
        lastName,
        role: "BUSINESS_OWNER",
        bio: `${randomElement([
          "Experienced",
          "Innovative",
          "Forward-thinking",
          "Strategic",
        ])} business leader at ${company}. ${randomElement([
          "Passionate about technology and innovation.",
          "Dedicated to building great products.",
          "Focused on delivering exceptional results.",
          "Committed to excellence in everything we do.",
        ])}`,
        intro: `${randomElement([
          "CEO",
          "CTO",
          "Product Manager",
          "VP of Engineering",
          "Director of Innovation",
        ])} at ${company}`,
        address: `${randomElement([
          "New York, NY",
          "San Francisco, CA",
          "Austin, TX",
          "Seattle, WA",
          "Boston, MA",
          "Chicago, IL",
          "Los Angeles, CA",
          "Denver, CO",
        ])}`,
        skills: randomElements(skills, randomInt(3, 6)),
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        occupied: false,
        totalHoursContributed: 0,
        projectsCompleted: 0,
        industriesExperienced: randomElements(industries, randomInt(1, 3)),
        socialLinks: [
          {
            type: "LinkedIn",
            url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          },
          {
            type: "Website",
            url: `https://${company.toLowerCase().replace(/\s/g, "")}.com`,
          },
        ],
        experiences: [
          {
            id: `exp_${i}_1`,
            title: randomElement(["CEO", "CTO", "VP Engineering", "Director"]),
            company: company,
            startDate: randomDate(new Date(2018, 0, 1), new Date(2020, 0, 1)),
            endDate: null,
            description: `Leading ${company} to new heights in ${randomElement(
              industries
            )}.`,
          },
        ],
        education: [],
        previousProjects: [],
        earnedSkillBadges: [],
        earnedSpecializationBadges: [],
        earnedEngagementBadges: [],
      },
    });
    businessOwners.push(owner);
  }
  console.log(`✅ Created ${businessOwners.length} business owners`);

  // Create Students
  console.log(`🎓 Creating ${SEED_USER_COUNT} students...`);
  const students = [];
  for (let i = 0; i < SEED_USER_COUNT; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@student.edu`;

    const studentSkills = randomElements(skills, randomInt(4, 10));
    const hoursContributed = randomInt(0, 500);
    const projectsCompleted = randomInt(0, 25);
    const hasProjects = projectsCompleted > 0;

    // Determine badges based on project count and hours
    const skillBadges = [];
    if (projectsCompleted >= 25) skillBadges.push("EXPERT");
    else if (projectsCompleted >= 10) skillBadges.push("ADVANCED");
    else if (projectsCompleted >= 3) skillBadges.push("INTERMEDIATE");
    else if (projectsCompleted >= 1) skillBadges.push("BEGINNER");

    const specializationBadges = [];
    if (studentSkills.includes("React") || studentSkills.includes("Vue.js")) {
      specializationBadges.push("FRONTEND_FOCUS");
    }
    if (studentSkills.includes("Node.js") || studentSkills.includes("Django")) {
      specializationBadges.push("BACKEND_BUILDER");
    }
    if (
      studentSkills.includes("UI/UX Design") ||
      studentSkills.includes("Figma")
    ) {
      specializationBadges.push("DESIGN_THINKER");
    }
    if (
      studentSkills.includes("Machine Learning") ||
      studentSkills.includes("Python")
    ) {
      specializationBadges.push("AI_INNOVATOR");
    }

    const engagementBadges = [];
    if (projectsCompleted >= 20) engagementBadges.push("VETERAN");
    if (hoursContributed >= 200) engagementBadges.push("TOP_CONTRIBUTOR");
    if (projectsCompleted >= 5) engagementBadges.push("TEAM_PLAYER");

    const student = await prisma.user.create({
      data: {
        clerkId: generateClerkId("student", i),
        email,
        firstName,
        lastName,
        role: "USER",
        bio: hasProjects
          ? `${randomElement([
              "Passionate",
              "Dedicated",
              "Enthusiastic",
              "Motivated",
            ])} ${randomElement([
              "software developer",
              "full-stack developer",
              "data scientist",
              "designer",
              "engineer",
            ])} with ${projectsCompleted} completed projects. ${randomElement([
              "Love building innovative solutions.",
              "Enjoy working on challenging problems.",
              "Always eager to learn new technologies.",
              "Committed to writing clean, efficient code.",
            ])}`
          : `Aspiring ${randomElement([
              "software developer",
              "data scientist",
              "designer",
              "engineer",
            ])} looking to gain practical experience. ${randomElement([
              "Eager to contribute to exciting projects.",
              "Ready to learn and grow.",
              "Passionate about technology.",
              "Looking for my first opportunity.",
            ])}`,
        intro: hasProjects
          ? `${randomElement([
              "Experienced",
              "Skilled",
              "Proficient",
            ])} in ${studentSkills.slice(0, 3).join(", ")}`
          : `Learning ${studentSkills.slice(0, 3).join(", ")}`,
        address: `${randomElement([
          "New York, NY",
          "San Francisco, CA",
          "Austin, TX",
          "Seattle, WA",
          "Boston, MA",
          "Chicago, IL",
          "Los Angeles, CA",
          "Denver, CO",
          "Portland, OR",
          "Atlanta, GA",
          "Miami, FL",
          "Phoenix, AZ",
        ])}`,
        skills: studentSkills,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        occupied: Math.random() > 0.7, // 30% chance of being occupied
        totalHoursContributed: hoursContributed,
        projectsCompleted: projectsCompleted,
        industriesExperienced: hasProjects
          ? randomElements(industries, randomInt(1, 4))
          : [],
        socialLinks: [
          {
            type: "LinkedIn",
            url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          },
          {
            type: "GitHub",
            url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          },
        ],
        experiences: hasProjects
          ? [
              {
                id: `exp_${i}_1`,
                title: randomElement([
                  "Software Developer Intern",
                  "Junior Developer",
                  "Freelance Developer",
                  "Student Developer",
                ]),
                company: randomElement(companies),
                startDate: randomDate(
                  new Date(2022, 0, 1),
                  new Date(2023, 0, 1)
                ),
                endDate: randomDate(new Date(2023, 6, 1), new Date(2024, 0, 1)),
                description: `Worked on ${randomElement([
                  "web development",
                  "mobile apps",
                  "data analysis",
                  "UI/UX design",
                ])} projects using ${studentSkills.slice(0, 2).join(", ")}.`,
              },
            ]
          : [],
        education: [
          {
            id: `edu_${i}_1`,
            degree: randomElement([
              "B.S. Computer Science",
              "B.S. Software Engineering",
              "B.S. Information Technology",
              "B.S. Data Science",
              "B.A. Digital Design",
            ]),
            institution: randomElement([
              "MIT",
              "Stanford University",
              "UC Berkeley",
              "Carnegie Mellon",
              "University of Washington",
              "Georgia Tech",
              "UT Austin",
              "University of Michigan",
            ]),
            startDate: new Date(2020, 8, 1),
            endDate: new Date(2024, 5, 1),
            description: randomElement([
              "Focus on software development and algorithms",
              "Specialized in machine learning and AI",
              "Emphasis on web technologies and UX",
              "Concentration in data structures and systems",
            ]),
          },
        ],
        previousProjects: hasProjects
          ? Array.from(
              { length: Math.min(projectsCompleted, 3) },
              (_, idx) => ({
                id: `prev_${i}_${idx}`,
                title: randomElement(projectTitles),
                role: randomElement([
                  "Full-Stack Developer",
                  "Frontend Developer",
                  "Backend Developer",
                  "UI/UX Designer",
                  "Data Analyst",
                ]),
                industry: randomElement(industries),
                description: `${randomElement([
                  "Developed",
                  "Built",
                  "Created",
                  "Designed",
                ])} a ${randomElement([
                  "comprehensive",
                  "robust",
                  "scalable",
                  "user-friendly",
                ])} solution using ${randomElements(studentSkills, 2).join(
                  " and "
                )}.`,
                tags: randomElements(studentSkills, randomInt(2, 4)),
                startDate: randomDate(
                  new Date(2022, 0, 1),
                  new Date(2023, 0, 1)
                ),
                endDate: randomDate(new Date(2023, 6, 1), new Date(2024, 0, 1)),
              })
            )
          : [],
        earnedSkillBadges: skillBadges as any[],
        earnedSpecializationBadges: specializationBadges as any[],
        earnedEngagementBadges: engagementBadges as any[],
      },
    });
    students.push(student);
  }
  console.log(`✅ Created ${students.length} students`);

  // Create Projects
  console.log(`📋 Creating ${SEED_PROJECT_COUNT} projects...`);
  const projects = [];
  const now = new Date();

  for (let i = 0; i < SEED_PROJECT_COUNT; i++) {
    const owner = randomElement(businessOwners);
    const category = randomElement(projectCategories);
    const scope = randomElement([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ]);
    const startDate = randomDate(
      new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    );
    const estimatedEndDate = new Date(
      startDate.getTime() + randomInt(30, 180) * 24 * 60 * 60 * 1000
    );
    const applicationDeadline = new Date(
      startDate.getTime() - randomInt(3, 14) * 24 * 60 * 60 * 1000
    );

    // Determine project status
    const statusRandom = Math.random();
    let status = "OPEN";
    let assignedStudent = null;
    let assignedAt = null;
    let inProgressAt = null;
    let completedAt = null;

    if (statusRandom < 0.15) {
      // 15% completed
      status = "COMPLETED";
      assignedStudent = randomElement(students);
      assignedAt = randomDate(
        new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      );
      inProgressAt = new Date(assignedAt.getTime() + 24 * 60 * 60 * 1000);
      completedAt = randomDate(
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      );
    } else if (statusRandom < 0.35) {
      // 20% in progress
      status = "IN_PROGRESS";
      assignedStudent = randomElement(
        students.filter((s) => !s.occupied || Math.random() > 0.5)
      );
      assignedAt = randomDate(
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      );
      inProgressAt = new Date(assignedAt.getTime() + 24 * 60 * 60 * 1000);
    } else if (statusRandom < 0.5) {
      // 15% assigned but not started
      status = "ASSIGNED";
      assignedStudent = randomElement(
        students.filter((s) => !s.occupied || Math.random() > 0.5)
      );
      assignedAt = randomDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      );
    } else if (statusRandom < 0.6) {
      // 10% in review
      status = "IN_REVIEW";
    }
    // else 40% remain OPEN

    const requiredSkills = randomElements(skills, randomInt(3, 7));
    const budget =
      scope === "BEGINNER"
        ? randomInt(500, 2000)
        : scope === "INTERMEDIATE"
        ? randomInt(2000, 5000)
        : scope === "ADVANCED"
        ? randomInt(5000, 10000)
        : randomInt(10000, 25000);

    const project = await prisma.project.create({
      data: {
        title: randomElement(projectTitles),
        description: `${randomElement([
          "We are seeking a talented developer",
          "Looking for an experienced professional",
          "Our team needs a skilled individual",
          "We're searching for a motivated student",
        ])} to ${randomElement([
          "build",
          "develop",
          "create",
          "design",
        ])} a ${randomElement([
          "cutting-edge",
          "innovative",
          "comprehensive",
          "scalable",
        ])} solution. This project involves ${randomElement([
          "implementing new features",
          "optimizing performance",
          "integrating third-party services",
          "designing user interfaces",
          "building APIs",
          "data analysis and visualization",
        ])}. The ideal candidate should have experience with ${requiredSkills
          .slice(0, 3)
          .join(", ")} and be able to ${randomElement([
          "work independently",
          "collaborate with our team",
          "deliver high-quality code",
          "meet tight deadlines",
        ])}.`,
        responsibilities: `• ${randomElement([
          "Develop and maintain",
          "Design and implement",
          "Build and optimize",
          "Create and test",
        ])} ${randomElement([
          "core features",
          "user interfaces",
          "backend services",
          "database schemas",
        ])}\n• ${randomElement([
          "Collaborate with",
          "Work closely with",
          "Communicate with",
        ])} ${randomElement([
          "project stakeholders",
          "team members",
          "the development team",
        ])}\n• ${randomElement([
          "Write clean, maintainable code",
          "Follow best practices and coding standards",
          "Participate in code reviews",
          "Document your work",
        ])}\n• ${randomElement([
          "Test and debug applications",
          "Ensure quality and performance",
          "Optimize for scalability",
          "Implement security measures",
        ])}`,
        deliverables: `• ${randomElement([
          "Fully functional",
          "Production-ready",
          "Well-tested",
          "Documented",
        ])} ${randomElement([
          "application",
          "system",
          "platform",
          "solution",
        ])}\n• ${randomElement([
          "Source code with documentation",
          "Technical documentation",
          "API documentation",
          "User guides",
        ])}\n• ${randomElement([
          "Test cases and results",
          "Quality assurance reports",
          "Performance benchmarks",
          "Security audit results",
        ])}\n• ${randomElement([
          "Deployment package",
          "Build artifacts",
          "Configuration files",
          "Setup instructions",
        ])}`,
        requiredSkills,
        category: category as any,
        scope: scope as any,
        status: status as any,
        budget,
        startDate,
        estimatedEndDate,
        applicationDeadline,
        isPublic: true,
        businessOwnerId: owner.id,
        assignedStudentId: assignedStudent?.id || null,
        assignedAt,
        inProgressAt,
        completedAt,
      },
    });
    projects.push(project);
  }
  console.log(`✅ Created ${projects.length} projects`);

  // Create Applications
  console.log("📝 Creating applications...");
  const applications = [];
  const openOrReviewProjects = projects.filter(
    (p) =>
      p.status === "OPEN" || p.status === "IN_REVIEW" || p.status === "ASSIGNED"
  );

  for (const project of openOrReviewProjects) {
    // Each open project gets 1-5 applications
    const applicantCount = randomInt(1, 5);
    const projectApplicants = randomElements(
      students.filter((s) => s.id !== project.assignedStudentId),
      applicantCount
    );

    for (const applicant of projectApplicants) {
      const status =
        project.status === "ASSIGNED" && project.assignedStudentId === null
          ? "PENDING"
          : project.status === "ASSIGNED"
          ? applicant.id === project.assignedStudentId
            ? "ACCEPTED"
            : Math.random() > 0.5
            ? "REJECTED"
            : "PENDING"
          : Math.random() > 0.8
          ? "WITHDRAWN"
          : "PENDING";

      const application = await prisma.application.create({
        data: {
          projectId: project.id,
          applicantId: applicant.id,
          status: status as any,
          coverLetter: `Dear Hiring Manager,\n\nI am very interested in the ${
            project.title
          } position. With my background in ${applicant.skills
            .slice(0, 3)
            .join(
              ", "
            )}, I believe I would be a great fit for this project.\n\n${
            applicant.projectsCompleted > 0
              ? `I have successfully completed ${applicant.projectsCompleted} projects and contributed ${applicant.totalHoursContributed} hours to various initiatives. `
              : "As an aspiring developer, I am eager to apply my skills and learn from this opportunity. "
          }${randomElement([
            "I am confident I can deliver excellent results.",
            "I am excited about the opportunity to contribute to your team.",
            "I look forward to discussing how I can help achieve your project goals.",
            "I am committed to delivering high-quality work on time.",
          ])}\n\nThank you for your consideration.\n\nBest regards,\n${
            applicant.firstName
          } ${applicant.lastName}`,
          appliedAt: randomDate(
            new Date(project.createdAt),
            new Date(
              Math.min(project.applicationDeadline.getTime(), Date.now())
            )
          ),
        },
      });
      applications.push(application);
    }
  }
  console.log(`✅ Created ${applications.length} applications`);

  // Summary
  console.log("\n✨ Seed completed successfully!");
  console.log("📊 Summary:");
  console.log(`   - 1 Admin user`);
  console.log(`   - ${businessOwners.length} Business owners`);
  console.log(`   - ${students.length} Students`);
  console.log(`   - ${projects.length} Projects`);
  console.log(`   - ${applications.length} Applications`);
  console.log(
    `   - Projects by status: OPEN (${
      projects.filter((p) => p.status === "OPEN").length
    }), IN_REVIEW (${
      projects.filter((p) => p.status === "IN_REVIEW").length
    }), ASSIGNED (${
      projects.filter((p) => p.status === "ASSIGNED").length
    }), IN_PROGRESS (${
      projects.filter((p) => p.status === "IN_PROGRESS").length
    }), COMPLETED (${projects.filter((p) => p.status === "COMPLETED").length})`
  );
  console.log("\n🎉 Your database is now populated with sample data!");
  console.log("💡 You can customize seed data using environment variables:");
  console.log("   - SEED_USER_COUNT (default: 20)");
  console.log("   - SEED_BUSINESS_OWNER_COUNT (default: 5)");
  console.log("   - SEED_PROJECT_COUNT (default: 30)");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
