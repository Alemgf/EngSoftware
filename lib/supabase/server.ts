import { createClient } from "@supabase/supabase-js"
import { requireSupabaseServerKey, requireSupabaseUrl } from "@/lib/supabase/env"

export const createSupabaseServer = () => {
  const supabaseUrl = requireSupabaseUrl()
  const supabaseKey = requireSupabaseServerKey()

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
}
