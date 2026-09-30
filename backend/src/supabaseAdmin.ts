import { createClient } from '@supabase/supabase-js'

// Uses the service_role key, which bypasses Row Level Security.
// Never expose this key to the frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
