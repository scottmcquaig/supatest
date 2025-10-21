# Coolify Deployment Guide

Deploy your Supabase test script to Coolify in 3 different ways.

---

## **Option 1: Docker Compose (Easiest)**

Best if you have a complex setup or want everything defined in one file.

### Steps:

1. **Push files to GitHub/Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial Supabase test deployment"
   git push origin main
   ```

2. **In Coolify Dashboard:**
   - Go to **Applications** → **New Application**
   - Choose **Docker Compose**
   - Select your Git repository
   - Specify the path: `/` (or your repo root)
   - Coolify will auto-detect `docker-compose.yml`

3. **Add Environment Variables:**
   - Go to **Environment** tab
   - Add each variable:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `DATABASE_URL`
     - `TEST_EMAIL`
     - `TEST_PASSWORD`
     - `AUTO_EMAIL` (optional, defaults to true)

4. **Deploy:**
   - Click **Deploy**
   - Logs will show test results
   - Container exits after test completes

### View Results:
- Check **Logs** tab in Coolify to see test output

---

## **Option 2: Dockerfile (Recommended for Coolify)**

Simpler interface, lets Coolify handle the build.

### Steps:

1. **Push files to Git:**
   ```bash
   git init
   git add Dockerfile package.json test-supabase.js .env.example
   git commit -m "Add Supabase test Dockerfile"
   git push origin main
   ```

2. **In Coolify Dashboard:**
   - Go to **Applications** → **New Application**
   - Choose **Docker** (not Docker Compose)
   - Select your Git repository
   - Leave **Docker Compose File** empty
   - Coolify will auto-detect `Dockerfile`

3. **Add Environment Variables:**
   - In Coolify, go to **Environment** section
   - Click **Add Variable**
   - Add all required variables:

   | Variable | Example | Required |
   |----------|---------|----------|
   | SUPABASE_URL | https://api.mcquaig.org | ✅ Yes |
   | SUPABASE_ANON_KEY | eyJ0eXAi... | ✅ Yes |
   | SUPABASE_SERVICE_ROLE_KEY | eyJ0eXAi... | ⭕ Optional |
   | DATABASE_URL | postgresql://user:pass@host:5432/db | ⭕ Optional |
   | TEST_EMAIL | test@mcquaig.org | ⭕ Optional |
   | TEST_PASSWORD | TestPass123! | ⭕ Optional |
   | AUTO_EMAIL | true | ⭕ Optional (default: true) |

4. **Deploy:**
   - Click **Deploy**
   - Coolify builds image from Dockerfile
   - Test runs automatically

5. **Schedule (Optional):**
   - Set up **Webhook** or **Cron** to run tests periodically
   - Go to **Settings** → **Webhooks**
   - Or use Coolify's built-in scheduler

### View Results:
- **Logs** tab shows test output
- Container stops after test completes (normal)

---

## **Option 3: Manual Docker Push**

For testing before committing to Coolify.

### Steps:

1. **Build locally:**
   ```bash
   docker build -t supabase-test:latest .
   ```

2. **Run to test:**
   ```bash
   docker run --env-file .env supabase-test:latest
   ```

3. **Tag for your registry:**
   ```bash
   docker tag supabase-test:latest your-registry/supabase-test:latest
   docker push your-registry/supabase-test:latest
   ```

4. **In Coolify:**
   - Choose **Image** deployment type
   - Enter: `your-registry/supabase-test:latest`
   - Add environment variables
   - Deploy

---

## **Choosing the Right Option**

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Docker Compose** | One file, can add services | More complex | Complex multi-service setups |
| **Dockerfile** | Simple, Coolify-friendly, auto-builds | Single container only | Quick deployments, testing |
| **Manual Push** | Full control, can optimize image | Manual management | Advanced users, CI/CD |

**→ For your use case, use Option 2 (Dockerfile)** - it's the simplest and most Coolify-friendly.

---

## **Post-Deployment**

### View Logs:
- Coolify Dashboard → Your App → **Logs** tab
- Logs show:
  ```
  ✓ Environment variables loaded
  ✓ Client created successfully
  ✓ Connection successful
  [TEST 3] Testing authentication...
  etc.
  ```

### Schedule Regular Tests:

**Option A: Webhook (GitHub)**
1. In Coolify: Copy the **Webhook URL**
2. Go to GitHub Repo → **Settings** → **Webhooks** → **Add webhook**
3. Paste Coolify webhook URL
4. Choose trigger: **Push events**
5. Coolify redeploys on every push

**Option B: Cron Job (External)**
```bash
0 */6 * * * curl https://your-coolify-instance/api/v1/deploy/webhook-token
```

**Option C: Coolify Scheduler**
- Some Coolify versions have built-in scheduling
- Check **Settings** → **Scheduler**

---

## **Troubleshooting**

### "Build failed"
- Check Dockerfile syntax
- Verify `package.json` exists
- Check Node version compatibility

### "Test runs but no logs appear"
- Container may have exited already
- Check **Logs** tab (may need to refresh)
- Look for recent entries

### "Environment variables not found"
- Verify variables added in Coolify UI
- Check spelling exactly matches code
- Redeploy after adding variables

### "Connection timeout"
- Verify `SUPABASE_URL` is correct
- Check firewall allows outbound connections
- If using `DATABASE_URL`, verify PostgreSQL port is accessible

---

## **Keeping Tests Updated**

To update tests without redeploying:

### Option 1: Git Push (Recommended)
```bash
# Make changes locally
git add test-supabase.js
git commit -m "Update auth tests"
git push origin main

# In Coolify: Click "Redeploy" or set up auto-deploy on push
```

### Option 2: Direct Edit in Coolify
- Some Coolify versions allow editing files in UI
- Not recommended for production

### Option 3: Update Environment Variables
- Change `AUTO_EMAIL`, `TEST_EMAIL`, etc.
- Click "Redeploy" to run tests with new params

---

## **Security Best Practices**

⚠️ **Never commit `.env` to version control:**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
```

✅ **Use Coolify's Secrets Manager:**
- Set `SUPABASE_SERVICE_ROLE_KEY` as a secret
- Coolify won't expose in logs
- Better than plain environment variables

✅ **Rotate Keys Regularly:**
- Don't hardcode credentials
- Use Coolify's variable system
- Test with throwaway keys when possible

---

## **Example: Complete Coolify Setup**

1. Create `.gitignore`:
   ```
   .env
   node_modules/
   *.log
   ```

2. Push to GitHub:
   ```bash
   git add Dockerfile package.json test-supabase.js .env.example .gitignore
   git commit -m "Setup Coolify Supabase test deployment"
   git push origin main
   ```

3. In Coolify:
   - **New App** → **Docker**
   - Connect GitHub repo
   - Add 7 environment variables
   - **Deploy**

4. Logs show test results in real-time ✅

---

## **Quick Reference**

**Fastest way to deploy:**

```
1. git push to GitHub with Dockerfile + test-supabase.js
2. Coolify: Create new Docker app, connect GitHub
3. Add environment variables
4. Deploy - Done!
```
