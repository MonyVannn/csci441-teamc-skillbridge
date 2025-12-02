# GitHub Secrets Setup Guide

Follow these steps to configure your GitHub repository for the CI/CD workflows.

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your repository: `https://github.com/MonyVannn/csci441-teamc-skillbridge`
2. Click **Settings** (top navigation)
3. In left sidebar, click **Secrets and variables** → **Actions**

### 2. Add Required Secrets

Click **New repository secret** for each of these:

---

#### Secret 1: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**Name:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Value:** Your Clerk publishable key (starts with `pk_test_` or `pk_live_`)

**Where to find it:**
- Go to https://dashboard.clerk.com
- Select your application
- Navigate to **API Keys**
- Copy the **Publishable key**

---

#### Secret 2: CLERK_SECRET_KEY

**Name:** `CLERK_SECRET_KEY`

**Value:** Your Clerk secret key (starts with `sk_test_` or `sk_live_`)

**Where to find it:**
- Same location as above
- Copy the **Secret key** (click to reveal)
- ⚠️ Keep this secret secure!

---

#### Secret 3: CLERK_WEBHOOK_SECRET

**Name:** `CLERK_WEBHOOK_SECRET`

**Value:** Your Clerk webhook signing secret (starts with `whsec_`)

**Where to find it:**
- Clerk Dashboard → **Webhooks**
- Click on your webhook endpoint
- Copy the **Signing Secret**

---

#### Secret 4: TEST_DATABASE_URL (IMPORTANT!)

**Name:** `TEST_DATABASE_URL`

**⚠️ CRITICAL: DO NOT USE YOUR PRODUCTION DATABASE URL!**

**Option A: Use a Dummy URL (Recommended for current setup)**

Since your tests are fully mocked and never actually connect to a database:

```
mongodb://localhost:27017/test
```

This is safe because:
- ✅ Tests are mocked and won't connect
- ✅ Prisma only needs it for client generation
- ✅ No actual database operations occur

**Option B: Use a Separate Test Database (For future real integration tests)**

If you want to be extra safe or plan to add real database tests:

```
mongodb+srv://test-user:test-pass@test-cluster.mongodb.net/skillbridge-test
```

Requirements:
- Must be a completely separate database instance
- Different cluster/server from production
- Different credentials
- Use a `-test` suffix in database name

**❌ NEVER DO THIS:**
```
# ❌ DANGER - Production database!
mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/skillbridge
```

---

#### Secret 5: CODECOV_TOKEN (Optional)

**Name:** `CODECOV_TOKEN`

**Value:** Your Codecov repository token

**Where to find it:**
- Go to https://codecov.io
- Sign in with GitHub
- Select your repository
- Copy the **Repository Upload Token**

**Note:** This is optional. If you don't add it, coverage uploads will be skipped.

---

## Verification Checklist

After adding secrets, verify:

- [ ] All 5 secrets are added (4 required + 1 optional)
- [ ] `TEST_DATABASE_URL` is NOT your production database
- [ ] Secret keys are not accidentally committed to code
- [ ] Webhooks secret matches your Clerk webhook configuration

## Testing the Setup

After adding secrets:

1. Push a commit to your branch
2. Go to **Actions** tab in GitHub
3. Watch the workflows run
4. All tests should pass ✅

## Troubleshooting

### Workflow fails with "secret not found"
**Solution:** Check that secret name exactly matches (case-sensitive)

### Tests fail but pass locally
**Solution:** Verify all required secrets are set correctly

### "DATABASE_URL" error
**Solution:** You may have `DATABASE_URL` instead of `TEST_DATABASE_URL` somewhere. The workflows now use `TEST_DATABASE_URL` for safety.

## Security Best Practices

✅ **DO:**
- Use GitHub Secrets for all sensitive values
- Use separate test database credentials
- Rotate secrets periodically
- Limit access to repository settings

❌ **DON'T:**
- Commit secrets to code
- Share secrets in public channels
- Use production credentials in CI/CD
- Give test database access to production data

---

## Quick Reference

| Secret | Required? | Example Value |
|--------|-----------|---------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | `pk_test_...` |
| `CLERK_SECRET_KEY` | ✅ Yes | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | ✅ Yes | `whsec_...` |
| `TEST_DATABASE_URL` | ✅ Yes | `mongodb://localhost:27017/test` |
| `CODECOV_TOKEN` | ⚪ Optional | `your-codecov-token` |

---

**Need help?** Check the [TEST_SAFETY.md](./TEST_SAFETY.md) document for details on why these configurations are safe.
