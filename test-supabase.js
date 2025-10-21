const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

async function testSupabaseConnection() {
  console.log('\n========== SUPABASE CONNECTION TEST ==========\n');

  try {
    // Validate required environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
    }

    console.log('✓ Environment variables loaded');
    console.log(`  URL: ${SUPABASE_URL}`);
    console.log(`  Anon Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);

    // Test 1: Create client with anon key
    console.log('\n[TEST 1] Creating Supabase client with anon key...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Client created successfully');

    // Test 2: Test basic connection (auth endpoint)
    console.log('\n[TEST 2] Testing connection via auth endpoint...');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.log(`⚠ Session check: ${sessionError.message}`);
      } else {
        console.log('✓ Connection successful - Auth endpoint responding');
        console.log(`  Session: ${session ? 'Active' : 'None (expected for anon key)'}`);
      }
    } catch (err) {
      console.log(`✗ Connection test failed: ${err.message}`);
    }

    // Test 3: Test auth endpoints (if TEST_EMAIL provided)
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      console.log('\n[TEST 3] Testing authentication...');
      // Use timestamp to create unique emails UNLESS AUTO_EMAIL is disabled
      let testEmail = process.env.TEST_EMAIL;
      const testPassword = process.env.TEST_PASSWORD;

      // Only add timestamp if AUTO_EMAIL is not explicitly set to false
      if (process.env.AUTO_EMAIL !== 'false') {
        const timestamp = Date.now();
        testEmail = testEmail.replace('@', `+${timestamp}@`);
      }

      try {
        // Test 3a: Sign Up
        console.log('\n  [3a] Testing Sign Up...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) {
          // User might already exist, which is fine for testing
          if (signUpError.message.includes('already registered')) {
            console.log('  ⚠ User already exists (continuing with sign in test)');
          } else {
            console.log(`  ✗ Sign up failed: ${signUpError.message}`);
            throw signUpError;
          }
        } else {
          console.log('  ✓ Sign up successful');
          if (signUpData.user) {
            console.log(`    User ID: ${signUpData.user.id}`);
            console.log(`    Email: ${signUpData.user.email}`);
            console.log(`    Created: ${signUpData.user.created_at}`);
          }
        }

        // Test 3b: Sign In (may fail if email not confirmed)
        console.log('\n  [3b] Testing Sign In...');
        let signInData = null;
        let signInError = null;

        try {
          const result = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });
          signInData = result.data;
          signInError = result.error;
        } catch (err) {
          signInError = err;
        }

        if (signInError) {
          if (signInError.message && signInError.message.includes('Email not confirmed')) {
            console.log(`  ⚠ Email confirmation required`);
            console.log(`    → Attempting to verify email using service role key...`);

            // Test 3b-alt: Use service role to verify email
            if (SUPABASE_SERVICE_ROLE_KEY) {
              const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
              try {
                // Get the user by email
                const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
                const user = users?.users?.find(u => u.email === testEmail);

                if (user && !getUserError) {
                  // Update user to confirm email
                  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    user.id,
                    { email_confirm: true }
                  );

                  if (!updateError) {
                    console.log(`    ✓ Email verified with service role`);

                    // Now try sign in again
                    const retryResult = await supabase.auth.signInWithPassword({
                      email: testEmail,
                      password: testPassword,
                    });

                    if (!retryResult.error) {
                      signInData = retryResult.data;
                      signInError = null;
                      console.log(`  ✓ Sign in successful after email verification`);
                    } else {
                      signInError = retryResult.error;
                    }
                  }
                }
              } catch (err) {
                console.log(`    ⚠ Could not auto-verify: ${err.message}`);
              }
            }
          }

          if (signInError) {
            console.log(`  ✗ Sign in failed: ${signInError.message || signInError}`);
          }
        } else {
          console.log('  ✓ Sign in successful');
        }

        if (signInData && signInData.user) {
          console.log(`    User ID: ${signInData.user.id}`);
          console.log(`    Email: ${signInData.user.email}`);
        }
        if (signInData && signInData.session) {
          console.log(`    Session Token: ${signInData.session.access_token.substring(0, 20)}...`);
          console.log(`    Token Expires: ${new Date(signInData.session.expires_at * 1000).toISOString()}`);
        }

        // Test 3c: Get Current Session
        console.log('\n  [3c] Testing Get Current Session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.log(`  ⚠ Get session error: ${sessionError.message}`);
        } else {
          if (sessionData.session) {
            console.log('  ✓ Session retrieved');
            console.log(`    User: ${sessionData.session.user.email}`);
          } else {
            console.log('  ⚠ No active session (expected for new auth tests)');
          }
        }

      } catch (err) {
        console.log(`  ✗ Auth test error: ${err.message}`);
      }
    } else {
      console.log('\n[TEST 3] Skipping auth tests (TEST_EMAIL and TEST_PASSWORD not provided)');
    }

    // Test 4: Test service role key (if provided)
    if (SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n[TEST 4] Testing with service role key...');
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      try {
        const { data: adminSession, error: adminSessionError } = await supabaseAdmin.auth.getSession();
        if (adminSessionError) {
          console.log(`⚠ Service role test: ${adminSessionError.message}`);
        } else {
          console.log('✓ Service role key is valid');
        }
      } catch (err) {
        console.log(`⚠ Service role error: ${err.message}`);
      }
    } else {
      console.log('\n[TEST 4] Skipping service role test (key not provided)');
    }

    // Test 5: Test direct PostgreSQL connection (if DATABASE_URL provided)
    if (DATABASE_URL) {
      console.log('\n[TEST 5] Testing direct PostgreSQL connection...');
      const pgClient = new Client({
        connectionString: DATABASE_URL,
      });

      try {
        await pgClient.connect();
        console.log('✓ PostgreSQL connection successful');

        const result = await pgClient.query('SELECT version();');
        console.log(`  PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);

        await pgClient.end();
      } catch (err) {
        console.log(`✗ PostgreSQL connection failed: ${err.message}`);
      }
    } else {
      console.log('\n[TEST 5] Skipping PostgreSQL test (DATABASE_URL not provided)');
    }

    console.log('\n========== TEST COMPLETE ==========\n');
  } catch (error) {
    console.error('✗ Fatal error:', error.message);
    process.exit(1);
  }
}

testSupabaseConnection();
