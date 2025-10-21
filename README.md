# Supabase Connection Test - Coolify Deployment

A containerized test suite to validate Supabase connections via Coolify.

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the project root (or use Coolify's environment variable UI):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (optional)
DATABASE_URL=postgresql://user:pass@host:5432/db (optional)
TEST_EMAIL=test@example.com (optional)
TEST_PASSWORD=TestPassword123! (optional)
```

### 2. Deploy via Coolify

**Option A: Using docker-compose**
```bash
docker-compose up --build
```

**Option B: Via Coolify Web UI**
1. Go to your Coolify dashboard
2. Create new application
3. Choose "Docker Compose"
4. Paste the contents of `docker-compose.yml`
5. Add environment variables in Coolify settings
6. Deploy

### 3. View Results

The test will:
- ✓ Validate environment variables
- ✓ Create Supabase client
- ✓ Test basic connection
- ✓ Test auth endpoints (if credentials provided)
- ✓ Test service role permissions (if key provided)
- ✓ Test direct PostgreSQL connection (if DATABASE_URL provided)

## Required Information

Gather these from your Supabase project:

**From Supabase Dashboard → Project Settings → API:**
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Public/Anon API key
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role key (keep secret!)

**From Supabase Dashboard → Database → Connection String (optional):**
- `DATABASE_URL` - PostgreSQL connection string

**For Auth Testing (optional):**
- `TEST_EMAIL` - Test email for signup
- `TEST_PASSWORD` - Test password (must be >8 chars)
- `AUTO_EMAIL` - Generate unique emails per run to avoid rate limiting (default: true)
  - Set to `false` to use the exact TEST_EMAIL each time for testing specific users
  - Set to `true` for automatic unique email generation (test@example.com → test+timestamp@example.com)

## File Structure

```
.
├── docker-compose.yml      # Container configuration
├── package.json            # Node dependencies
├── test-supabase.js        # Main test script
├── .env.example            # Environment template
└── README.md              # This file
```

## Testing Details

### Test 1: Environment Validation
Checks that required env vars are set.

### Test 2: Connection Health Check
Queries information_schema to validate connection.

### Test 3: Authentication (Optional)
Tests Supabase Auth signup and login endpoints if `TEST_EMAIL` is provided:
- **3a: Sign Up** - Creates a new user with the test credentials
- **3b: Sign In** - Logs in the user (auto-verifies email if needed)
- **3c: Get Session** - Retrieves the current session

**Email Behavior:**
- If `AUTO_EMAIL=true` (default): Creates unique email per run (test+timestamp@domain)
- If `AUTO_EMAIL=false`: Uses exact TEST_EMAIL (great for testing specific users repeatedly)

### Test 4: Service Role (Optional)
Validates service role key permissions if provided.

### Test 5: PostgreSQL Direct Connection (Optional)
Tests direct database connection if `DATABASE_URL` is provided.

## Security Notes

⚠️ **Never commit `.env` file to version control**
- Use `.env.example` as a template
- Set sensitive values via Coolify's environment UI or secrets manager
- Service role keys should be treated as secrets

## Troubleshooting

**"Missing required environment variables"**
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

**"Connection failed"**
- Verify your Supabase project is active
- Check that URLs don't have trailing slashes
- Confirm API keys are correct (copy from Supabase UI again)

**"Auth test failed"**
- Test email may already exist in your project
- Password must meet Supabase security requirements
- Check if auth is enabled in your Supabase project

**"PostgreSQL connection failed"**
- Verify DATABASE_URL format is correct
- Ensure database user has correct permissions
- Check network access (firewall/security groups)

## Usage Examples

### Run with Auto-Generated Unique Emails (Default)
```bash
# Uses test+TIMESTAMP@mcquaig.org, prevents rate limiting
docker compose --env-file .env up --build
```

### Run with Specific User Email
```bash
# Uses exact email from .env (test@mcquaig.org)
docker compose --env-file .env up --build -e AUTO_EMAIL=false
```

### Run from Command Line
```bash
# With auto email
set -a; source .env; set +a; node test-supabase.js

# With specific email
set -a; source .env; set +a; AUTO_EMAIL=false node test-supabase.js
```

### Change Credentials for Single Run
```bash
# Override test email
set -a; source .env; set +a; TEST_EMAIL=myuser@example.com node test-supabase.js

# Override multiple values
set -a; source .env; set +a; TEST_EMAIL=custom@email.com AUTO_EMAIL=false node test-supabase.js
```

## Next Steps

After confirming connections work:
1. Deploy your actual application
2. Use the same environment variables
3. Reference this test to troubleshoot connectivity issues
