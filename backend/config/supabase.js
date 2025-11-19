require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY\n' +
    'Add these to your backend/.env file'
  );
}

// Create Supabase admin client using service role key
// This has full admin access - use carefully!
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = supabase;
