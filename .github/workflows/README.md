# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the SkillBridge project.

## Available Workflows

### 1. Unit Tests (`unit-tests.yml`)
**Purpose:** Run unit tests for components, pages, and utilities

**Triggers:**
- Push to `main`, `develop`, or `staging` branches
- Pull requests to `main`, `develop`, or `staging` branches

**What it does:**
- ✅ Runs all unit tests (excludes integration tests)
- 📊 Generates test coverage reports
- 📤 Uploads coverage to Codecov (optional)
- 💾 Archives coverage artifacts for 30 days

**Test Pattern:** Excludes `integration/` directory tests

---

### 2. Integration Tests (`integration-tests.yml`)
**Purpose:** Run integration tests for user flows and API endpoints

**Triggers:**
- Push to `main`, `develop`, or `staging` branches
- Pull requests to `main`, `develop`, or `staging` branches

**What it does:**
- ✅ Runs integration tests only (sign-in, sign-up, webhooks, etc.)
- 📊 Generates test coverage reports
- 📤 Uploads coverage to Codecov (optional)
- 💾 Archives coverage artifacts for 30 days

**Test Pattern:** Only runs tests in `integration/` directory

---

### 3. CI - All Tests (`ci-tests.yml`)
**Purpose:** Comprehensive CI pipeline running all tests together

**Triggers:**
- Push to `main`, `develop`, or `staging` branches
- Pull requests to `main`, `develop`, or `staging` branches
- Manual workflow dispatch

**What it does:**
- 🔍 Runs ESLint for code quality
- ✅ Runs complete test suite (371 tests)
- 📊 Generates comprehensive coverage report
- 📤 Uploads coverage to Codecov (optional)
- 💬 Comments coverage summary on PRs
- 💾 Archives complete test results for 30 days

---

## Required GitHub Secrets

To run these workflows, configure the following secrets in your GitHub repository:

### Essential Secrets
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | All workflows |
| `CLERK_SECRET_KEY` | Clerk secret key | All workflows |
| `DATABASE_URL` | Prisma database connection | All workflows |

### Optional Secrets
| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signature verification | Integration tests |
| `CODECOV_TOKEN` | Codecov upload token | Coverage reporting (optional) |

### How to Add Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

---

## Test Coverage

The test suite includes **371 tests** across:
- 📄 Unit tests: 220 tests (components, pages, middleware, utilities)
- 🔗 Integration tests: 151 tests (auth flows, webhooks, user journeys)

### Coverage Areas
- ✅ Authentication (sign-in, sign-up, webhooks)
- ✅ Project browsing and filtering
- ✅ User profiles
- ✅ Project details
- ✅ Navigation components
- ✅ Middleware and routing
- ✅ Settings and applications

---

## Running Tests Locally

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathIgnorePatterns=integration

# Run integration tests only
npm test -- --testPathPattern=integration

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

---

## Workflow Status Badges

Add these badges to your `README.md` to display workflow status:

```markdown
![Unit Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/unit-tests.yml/badge.svg)
![Integration Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/integration-tests.yml/badge.svg)
![CI Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-tests.yml/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

---

## Troubleshooting

### Workflow Fails Due to Missing Secrets
**Solution:** Ensure all required secrets are configured in GitHub repository settings.

### Tests Pass Locally but Fail in CI
**Possible causes:**
- Environment variable differences
- Node.js version mismatch (workflows use Node 20.x)
- Missing dependencies in `package-lock.json`

**Solution:** 
- Verify environment variables match
- Test with Node 20.x locally
- Run `npm ci` instead of `npm install`

### Coverage Upload Fails
**Solution:** The workflow continues even if Codecov upload fails (`fail_ci_if_error: false`). This is optional functionality.

---

## Customization

### Changing Trigger Branches
Edit the `on.push.branches` and `on.pull_request.branches` sections:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main, develop ]
```

### Adding More Node Versions
Modify the `strategy.matrix.node-version`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Adjusting Test Timeout
Add timeout to test command:

```bash
npm test -- --testTimeout=10000
```

---

## Maintenance

- 🔄 Workflows are automatically triggered on code changes
- 📦 Dependencies are cached to speed up workflow runs
- 🗄️ Test artifacts are retained for 30 days
- 🔍 Coverage reports help track test quality over time

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Codecov Documentation](https://docs.codecov.com/)
