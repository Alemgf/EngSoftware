import { createClient } from "@supabase/supabase-js"
import { requireSupabaseAnonKey, requireSupabaseUrl } from "@/lib/supabase/env"

export const createSupabaseClient = () => {
  const supabaseUrl = requireSupabaseUrl()
  const supabaseAnonKey = requireSupabaseAnonKey()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}
