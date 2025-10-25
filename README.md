# SkillBridge

SkillBridge is a platform designed to bridge the gap between new graduates and students seeking practical experience and businesses/nonprofits needing short-term, specific tasks completed. Our mission is to empower emerging talent by providing opportunities to build verifiable portfolios and enhance their employability in a competitive job market.

## Problem Addressed

New graduates and students often struggle to gain essential practical experience due to a saturated job market and limited internship opportunities. This lack of real-world application can put them at a disadvantage when seeking entry-level positions.

## Our Solution

SkillBridge offers a dynamic micro-project marketplace where:

*   **Businesses and Nonprofits** can post well-defined, small-scale projects requiring specific skills.
*   **Students and New Grads** can discover, apply for, and complete these projects, building a verifiable history of practical experience.

## Key Features and Interventions

*   **Micro-Project Marketplace Platform:** A centralized online hub for posting and discovering micro-projects.
*   **Verified Skill-Building and Portfolio Creation:** A system to verify project completion, which translates into tangible portfolio credit.
*   **Incentive Framework:** Facilitation of optional small stipends for successful project completion.
*   **Skill and Achievement Recognition System:** A badge system to motivate users and visually represent their accumulated skills and milestones.


## Technology Stack

*   **Authentication:** Clerk.js
*   **Frontend:** Next.js
*   **UI Components:** Shadcn UI
*   **Backend:** MongoDB
*   **ORM:** Prisma
*   **Version Control:** GitHub

## Getting Started

### Prerequisites

*   Node.js 18+ installed
*   MongoDB database (local or cloud)
*   Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/csci441-teamc-skillbridge.git
cd csci441-teamc-skillbridge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Webhook (for syncing users)
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Seed the database with sample data:
```bash
npm run prisma-seed
```

### Database Seeding

The seed script populates your database with realistic sample data for development and testing:

*   **1 Admin user** - Full platform access
*   **5 Business owners** - Organizations posting projects  
*   **20 Students** - Users with various skill levels and experience
*   **30 Projects** - Mix of open, in-progress, and completed projects
*   **Applications** - Realistic application data linking students to projects

#### Running the Seed Script

```bash
npm run prisma-seed
```

#### Customizing Seed Data

You can customize the amount of data generated using environment variables:

```bash
# Generate more data
SEED_USER_COUNT=50 SEED_BUSINESS_OWNER_COUNT=10 SEED_PROJECT_COUNT=100 npm run prisma-seed

# Generate less data
SEED_USER_COUNT=10 SEED_BUSINESS_OWNER_COUNT=3 SEED_PROJECT_COUNT=15 npm run prisma-seed
```

**Available Options:**
*   `SEED_USER_COUNT` - Number of student users (default: 20)
*   `SEED_BUSINESS_OWNER_COUNT` - Number of business owners (default: 5)
*   `SEED_PROJECT_COUNT` - Number of projects (default: 30)

**Important:** The seed script is **idempotent** - running it multiple times will clear existing data and create fresh sample data. This is safe for development but **should never be run in production**.

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
csci441-teamc-skillbridge/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── profile/           # User profile pages
│   ├── project/           # Project detail pages
│   ├── sign-in/           # Authentication pages
│   └── sign-up/           
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── browse/           # Browse page components
│   ├── profile/          # Profile components
│   └── project/          # Project components
├── lib/                   # Utility libraries
│   ├── actions/          # Server actions
│   └── stores/           # State management
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed script
├── __tests__/            # Test files
│   ├── integration/      # Integration tests
│   └── components/       # Component tests
└── public/               # Static assets
```

## Sample Users

After running the seed script, you can use these test accounts:

*   **Admin:** admin@skillbridge.com
*   **Business Owners:** Various emails like `firstname.lastname@company.com`
*   **Students:** Various emails like `firstname.lastname.#@student.edu`

**Note:** These are seeded users in the database. For actual authentication, you'll need to create accounts through Clerk's sign-up flow.

## Contributing

1. Create a feature branch from `main`
2. Make your changes and write tests
3. Ensure all tests pass: `npm test`
4. Submit a pull request

## License

This project is part of CSCI 441 coursework.

