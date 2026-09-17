import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Missing config is a setup mistake, not a runtime condition to paper over —
// fail loudly here rather than letting every query return an opaque error.
if (!url || !key) {
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env — see .env.example',
  )
}

// The anon key is read-only: the views it can reach are grants over public
// regulatory data, and nothing in `pms` is exposed directly.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
})
