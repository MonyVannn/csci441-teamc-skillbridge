const mockUser = {
  id: "1",
  clerkId: "user_123",
  email: "monyvann.men@example.com",
  firstName: "Monyvann",
  lastName: "Men",
  bio: "I am a fourth-year undergraduate student pursuing a Bachelor of Science in Computer Science, possessing over three years of software development experience. Concurrently with my studies, I am employed as a teaching assistant for the university campus, where I apply my technical skills in a practical setting.",
  intro: "ITM Senior at AUPP | CS Senior at PTSU",
  address: "Lynn, Massachusetts, United States",
  skills: [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "TypeScript",
    "Vue.js",
    "PHP",
  ],
  imageUrl:
    "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMlRsalpHRmZCNVYyck94RnFJa0FhYzR5TXQifQ",
  role: "USER" as const,
  occupied: false,
  createdAt: new Date("2021-01-01"),
  updatedAt: new Date("2024-09-13"),
  socialLinks: [
    { type: "LinkedIn", url: "https://linkedin.com/in/monyvann-men-6cb7a260" },
  ],
  experiences: [
    {
      id: "1",
      title: "Web Developer",
      company: "American University of Phnom Penh",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-12-01"),
      description:
        "Developed a complete web application for ID Management and Request Engine. Utilized technologies such as Vue.js, JavaScript, and PHP to build and enhance web applications.",
    },
    {
      id: "2",
      title: "Frontend Developer",
      company: "Ministry of Interior, Cambodia",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-04-01"),
      description:
        "Developed up to 10 responsive web pages based on UX/UI designs using Vue.js and Laravel. Established robust frontend to backend connections, optimizing system functionality and user performance.",
    },
  ],
  education: [
    {
      id: "1",
      institution: "Paragon International University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2025-06-01"),
      description:
        "Pursuing Bachelor's degree with focus on software development and computer science fundamentals.",
    },
    {
      id: "2",
      institution: "American University of Phnom Penh",
      degree: "Information Technology Management",
      field: "Business Technology",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2024-06-01"),
      description:
        "Completed ITM program with emphasis on technology management and business applications.",
    },
  ],
  projects: [
    {
      id: "1",
      title: "Student Management System",
      description:
        "A comprehensive web application for managing student records, course enrollment, and academic progress tracking. Built with modern web technologies and responsive design.",
      category: "WEB_DEVELOPMENT",
      scope: "INTERMEDIATE",
      status: "COMPLETED",
      startDate: new Date("2024-01-15"),
      estimatedEndDate: new Date("2024-05-30"),
      budget: 5000,
      requiredSkills: [
        "React",
        "Node.js",
        "MongoDB",
        "Express.js",
        "TypeScript",
      ],
    },
    {
      id: "2",
      title: "E-Commerce Mobile App",
      description:
        "Cross-platform mobile application for online shopping with payment integration, user authentication, and real-time order tracking capabilities.",
      category: "MOBILE_DEVELOPMENT",
      scope: "ADVANCED",
      status: "IN_PROGRESS",
      startDate: new Date("2024-06-01"),
      estimatedEndDate: new Date("2024-12-15"),
      budget: 12000,
      requiredSkills: [
        "React Native",
        "Firebase",
        "Stripe API",
        "Redux",
        "JavaScript",
      ],
    },
    {
      id: "3",
      title: "Data Analytics Dashboard",
      description:
        "Interactive dashboard for visualizing business metrics and KPIs with real-time data processing and customizable reporting features.",
      category: "DATA_SCIENCE",
      scope: "EXPERT",
      status: "OPEN",
      startDate: new Date("2024-10-01"),
      estimatedEndDate: new Date("2025-03-30"),
      budget: 8500,
      requiredSkills: [
        "Python",
        "D3.js",
        "PostgreSQL",
        "Docker",
        "Machine Learning",
      ],
    },
  ],
  earnedSkillBadges: ["INTERMEDIATE"],
  earnedSpecializationBadges: ["WEB_DEVELOPER_PRO"],
  earnedEngagementBadges: [],
  totalHoursContributed: 1200,
  projectsCompleted: 8,
  industriesExperienced: ["Education", "Government", "Technology"],
};

import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader user={mockUser} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-8">
          <div className="lg:col-span-3">
            <ProfileContent user={mockUser} />
          </div>
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
