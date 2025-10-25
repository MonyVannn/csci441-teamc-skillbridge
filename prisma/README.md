# Database Seeding Guide

This directory contains the Prisma schema and database seed script for the SkillBridge application.

## Overview

The seed script (`seed.ts`) populates your MongoDB database with realistic sample data for development and testing purposes. It creates a complete ecosystem of users, projects, and applications that mirror real-world usage patterns.

## What Gets Created

### Users (3 Types)

#### 1. Admin User (1)
- **Email:** `admin@skillbridge.com`
- **Role:** ADMIN
- Full platform access with administrative privileges
- Complete profile with bio, skills, and social links

#### 2. Business Owners (Default: 5)
- **Role:** BUSINESS_OWNER
- Represent organizations posting projects
- Each has:
  - Company affiliation (TechCorp, InnovateLabs, etc.)
  - Professional title (CEO, CTO, Product Manager)
  - Work experience and industry background
  - 3-6 technical skills
  - Social links (LinkedIn + company website)
  - Random location in major US cities

#### 3. Students (Default: 20)
- **Role:** USER
- Represent students/graduates seeking projects
- Each has:
  - Educational background (CS, Software Engineering, etc.)
  - 4-10 technical skills
  - Varying experience levels (0-25 completed projects)
  - Total hours contributed (0-500)
  - **Badges** earned based on activity:
    - **Skill Badges:** BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    - **Specialization Badges:** FRONTEND_FOCUS, BACKEND_BUILDER, DESIGN_THINKER, AI_INNOVATOR
    - **Engagement Badges:** VETERAN, TOP_CONTRIBUTOR, TEAM_PLAYER
  - Work experiences (for experienced students)
  - Previous projects portfolio
  - Social links (LinkedIn + GitHub)
  - 30% are marked as currently occupied

### Projects (Default: 30)

Projects are distributed across various statuses to simulate a realistic marketplace:

- **OPEN (40%):** Ready for applications, deadline not passed
- **IN_REVIEW (10%):** Reviewing applications
- **ASSIGNED (15%):** Student assigned, not yet started
- **IN_PROGRESS (20%):** Active work in progress
- **COMPLETED (15%):** Successfully finished

Each project includes:
- Owner (random business owner)
- Category (Web Dev, Mobile, UI/UX, Data Science, etc.)
- Scope (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Required skills (3-7 skills)
- Budget based on scope:
  - Beginner: $500 - $2,000
  - Intermediate: $2,000 - $5,000
  - Advanced: $5,000 - $10,000
  - Expert: $10,000 - $25,000
- Timeline (start date, estimated end date, application deadline)
- Detailed description, responsibilities, and deliverables

### Applications (Variable: 1-5 per qualifying project)

Applications are created for OPEN, IN_REVIEW, and ASSIGNED projects:
- Random students apply (excluding already assigned students)
- Most have PENDING status
- Some are REJECTED (realistic rejection rate)
- 20% chance of WITHDRAWN status
- Each includes a personalized cover letter
- Application dates respect project deadlines

## Running the Seed Script

### Basic Usage

```bash
npm run prisma-seed
```

This will:
1. ✅ Clear all existing data (Applications → Projects → Users)
2. ✅ Create 1 admin user
3. ✅ Create 5 business owners
4. ✅ Create 20 students with badges
5. ✅ Create 30 projects with varied statuses
6. ✅ Create applications (1-5 per qualifying project)
7. ✅ Display a summary of created data

### Custom Data Amounts

You can customize the amount of data generated using environment variables:

#### Generate More Data
```bash
SEED_USER_COUNT=50 SEED_BUSINESS_OWNER_COUNT=10 SEED_PROJECT_COUNT=100 npm run prisma-seed
```

#### Generate Less Data (Faster)
```bash
SEED_USER_COUNT=10 SEED_BUSINESS_OWNER_COUNT=3 SEED_PROJECT_COUNT=15 npm run prisma-seed
```

#### Large Dataset (Testing Performance)
```bash
SEED_USER_COUNT=200 SEED_BUSINESS_OWNER_COUNT=25 SEED_PROJECT_COUNT=500 npm run prisma-seed
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEED_USER_COUNT` | 20 | Number of student users to create |
| `SEED_BUSINESS_OWNER_COUNT` | 5 | Number of business owner users to create |
| `SEED_PROJECT_COUNT` | 30 | Number of projects to create |

You can also add these to your `.env` or `.env.local` file:

```env
# Database Seed Configuration
SEED_USER_COUNT=50
SEED_BUSINESS_OWNER_COUNT=10
SEED_PROJECT_COUNT=100
```

Then simply run:
```bash
npm run prisma-seed
```

## Important Notes

### ⚠️ Idempotent Operation

The seed script is **idempotent**, meaning:
- Running it multiple times is safe
- It clears ALL existing data before seeding
- Fresh data is created each time
- No duplicate entries are created

**This means:**
- ✅ Safe for development and testing
- ❌ **NEVER run in production** (will delete all data!)
- ✅ Good for resetting your local database
- ✅ Ensures consistent test data

### 🔒 Production Safety

**CRITICAL:** This seed script should **ONLY** be used in development environments!

- It permanently deletes all data
- There is no undo or recovery
- Production databases should use proper data migration strategies
- Consider using separate environment checks if deploying

### 🎲 Randomization

The seed script uses randomization for realistic data:
- Names, companies, and skills are randomly selected
- Project statuses follow percentage distributions
- Application counts vary (1-5 per project)
- Dates are randomized within logical ranges
- Badge assignments based on calculated activity levels

This means:
- Each seed run produces slightly different data
- Useful for testing various scenarios
- More realistic than static test data

## Sample Data Details

### User Generation

**Business Owners:**
```typescript
// Generated with:
- firstName + lastName from predefined lists (26 first names, 25 last names)
- Email: firstname.lastname@company.com
- Company from 15 tech companies
- Random bio describing their role
- 3-6 technical skills
- 1-3 industry experiences
- Professional profile picture (via DiceBear API)
```

**Students:**
```typescript
// Generated with:
- firstName + lastName + index for uniqueness
- Email: firstname.lastname.{index}@student.edu
- 4-10 technical skills
- Random number of completed projects (0-25)
- Random hours contributed (0-500)
- Badges based on activity:
  * Skill level: Based on projects completed
  * Specialization: Based on skill set
  * Engagement: Based on hours and projects
- Educational background (B.S. Computer Science, etc.)
- Work experience (if experienced)
- Previous projects portfolio
- Profile picture (via DiceBear API)
```

### Project Status Distribution

```
OPEN (40%):        Ready for applications ━━━━━━━━━━━━
IN_REVIEW (10%):   Reviewing applicants  ━━━
ASSIGNED (15%):    Student assigned      ━━━━━
IN_PROGRESS (20%): Work in progress      ━━━━━━━
COMPLETED (15%):   Finished projects     ━━━━━
```

### Badge Assignment Logic

**Skill Level Badges:**
- `BEGINNER`: 1+ projects completed
- `INTERMEDIATE`: 10+ projects completed
- `ADVANCED`: 25+ projects completed

**Specialization Badges:**
- `FRONTEND_FOCUS`: Has React, Vue, or Angular skills
- `BACKEND_BUILDER`: Has Node.js, Python, Java, or Go skills
- `DESIGN_THINKER`: Has UI/UX, Figma, or design skills
- `AI_INNOVATOR`: Has Machine Learning or AI skills

**Engagement Badges:**
- `VETERAN`: 20+ projects completed
- `TOP_CONTRIBUTOR`: 200+ hours contributed
- `TEAM_PLAYER`: 5+ projects completed

## Sample Accounts

After running the seed script, you can reference these accounts for testing:

### Admin Account
```
Email: admin@skillbridge.com
Role: ADMIN
Note: Seeded in database, but requires Clerk authentication for login
```

### Business Owners
```
Format: firstname.lastname@company.com
Examples:
  - alice.smith@techcorp.com
  - bob.johnson@innovatelabs.com
Role: BUSINESS_OWNER
```

### Students
```
Format: firstname.lastname.{number}@student.edu
Examples:
  - charlie.williams.0@student.edu
  - diana.brown.1@student.edu
Role: USER
```

**Important:** These users exist in your database, but you'll still need to authenticate through Clerk's sign-up flow for actual login access.

## Technical Details

### Script Structure

```typescript
seed.ts
├── Configuration (env variables with defaults)
├── Sample Data Arrays
│   ├── firstNames (26)
│   ├── lastNames (25)
│   ├── companies (15)
│   ├── skills (35)
│   ├── industries (15)
│   ├── projectCategories (13)
│   └── projectTitles (30)
├── Utility Functions
│   ├── randomElement()
│   ├── randomElements()
│   ├── randomInt()
│   ├── randomDate()
│   └── generateClerkId()
└── Main Seeding Logic
    ├── 1. Clear existing data
    ├── 2. Create admin user
    ├── 3. Create business owners
    ├── 4. Create students with badges
    ├── 5. Create projects with statuses
    ├── 6. Create applications
    └── 7. Output summary
```

### Dependencies

- `@prisma/client` - Database ORM
- Executed via `tsx` (TypeScript executor)
- Configured in `package.json` under `"prisma-seed"` script

### Error Handling

The script includes robust error handling:
- Try/catch block wraps all seeding operations
- Errors are logged to console with full details
- Process exits with code 1 on failure
- Prisma client disconnects in finally block
- Prevents partial data states

## Troubleshooting

### Common Issues

#### "Error: Environment variable not found: MONGODB_URI"
**Solution:** Ensure your `.env` or `.env.local` file contains a valid MongoDB connection string.

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

#### "PrismaClientInitializationError"
**Solution:** Run `npx prisma generate` to generate the Prisma client.

```bash
npx prisma generate
npm run prisma-seed
```

#### Seed takes a long time
**Solution:** Reduce the amount of data being generated.

```bash
SEED_USER_COUNT=10 SEED_PROJECT_COUNT=15 npm run prisma-seed
```

#### Want to keep existing data
**Solution:** The seed script always clears data. If you need to add data without clearing:
1. Create a separate script
2. Or manually insert data via Prisma Studio (`npx prisma studio`)

### Verifying Seed Success

1. Check the console output for the summary:
```
✨ Seed completed successfully!
📊 Summary:
   - 1 Admin user
   - 5 Business owners
   - 20 Students
   - 30 Projects
   - 52 Applications
```

2. Open Prisma Studio to view the data:
```bash
npx prisma studio
```

3. Check your application at `http://localhost:3000`

## Development Workflow

### Typical Usage Patterns

#### Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Seed database
npm run prisma-seed

# 4. Start development server
npm run dev
```

#### Reset Database
```bash
# Clear and reseed when you need fresh data
npm run prisma-seed
```

#### Testing Different Scenarios
```bash
# Test with minimal data
SEED_USER_COUNT=5 SEED_PROJECT_COUNT=10 npm run prisma-seed

# Test with lots of data
SEED_USER_COUNT=100 SEED_PROJECT_COUNT=200 npm run prisma-seed
```

## Contributing

When modifying the seed script:

1. **Add new sample data** to the arrays (companies, skills, etc.)
2. **Maintain relationships** between models (projects → owners, applications → projects/users)
3. **Update this README** if you change configuration options
4. **Test thoroughly** with different environment variable values
5. **Keep realistic data** - aim for production-like quality
6. **Follow existing patterns** for consistency

## Related Documentation

- [Main README](../README.md) - Project overview and setup
- [Prisma Schema](./schema.prisma) - Database models and relationships
- [Testing Guide](../__tests__/README.md) - Running tests with seeded data

## License

This project is part of CSCI 441 coursework.
