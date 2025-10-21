# Quick Start: Deploy to Coolify in 5 Minutes

## **Files You Have:**

✅ `Dockerfile` - Container config
✅ `package.json` - Dependencies
✅ `test-supabase.js` - Test script
✅ `.env.example` - Config template
✅ `docker-compose.yml` - Alternative setup

---

## **Step 1: Push to Git**

```bash
cd ~/supatest
git init
git add .
git commit -m "Supabase test deployment"
git remote add origin https://github.com/YOUR_USERNAME/supatest.git
git push -u origin main
```

---

## **Step 2: Create Coolify App**

1. Log into **Coolify Dashboard**
2. Click **Applications** → **New Application**
3. Choose **Docker** (not Docker Compose)
4. **Connect Git Repository**
5. Select your `supatest` repo
6. Click **Save & Deploy**

---

## **Step 3: Add Environment Variables**

In Coolify, go to your app → **Environment** tab:

| Variable | Value |
|----------|-------|
| SUPABASE_URL | `https://api.mcquaig.org` |
| SUPABASE_ANON_KEY | `eyJ0eXAi...` (from .env) |
| SUPABASE_SERVICE_ROLE_KEY | `eyJ0eXAi...` (from .env) |
| DATABASE_URL | `postgresql://...` (from .env) |
| TEST_EMAIL | `test@mcquaig.org` |
| TEST_PASSWORD | `TestPass123!` |
| AUTO_EMAIL | `true` |

**Save variables**

---

## **Step 4: Deploy**

1. Click **Deploy** button
2. Wait for build (1-2 minutes)
3. Click **Logs** tab
4. See your test results!

---

## **Expected Output:**

```
✓ Environment variables loaded
✓ Client created successfully
✓ Connection successful - Auth endpoint responding
[TEST 3] Testing authentication...
  [3a] Testing Sign Up...
  ✓ Sign up successful
  [3b] Testing Sign In...
  ✓ Sign in successful after email verification
✓ PostgreSQL connection successful
  PostgreSQL Version: PostgreSQL 15.8
```

---

## **Done! ✅**

Your Supabase tests are now running on Coolify!

### **What happens next?**

- Container runs the test once and exits (normal)
- To re-run: Click **Redeploy** in Coolify
- To run on schedule: Set up webhook or cron job

### **Want to change test settings?**

1. Edit environment variables in Coolify
2. Click **Redeploy**
3. Tests run with new settings

### **Want to update the test script?**

1. Edit `test-supabase.js` locally
2. Commit & push to GitHub
3. Coolify auto-deploys (if webhook enabled)
4. Or click **Redeploy** manually

---

## **Helpful Links**

- Full Guide: See `DEPLOYMENT.md`
- Test Details: See `README.md`
- Troubleshooting: See `DEPLOYMENT.md` → Troubleshooting section

---

## **Need Help?**

- **Build failed?** Check logs for errors
- **Tests failed?** Verify environment variables
- **Connection timeout?** Check SUPABASE_URL is correct
- **Rate limited?** Set `AUTO_EMAIL=true` to generate unique emails

See `DEPLOYMENT.md` for detailed troubleshooting.
