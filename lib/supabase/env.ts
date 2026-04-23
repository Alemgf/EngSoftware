/** Lê variáveis de ambiente do Supabase — sem fallbacks no código-fonte. */

export function requireSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. Define it in .env.local (or your host env).'
    )
  }
  return url
}

export function requireSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Define it in .env.local (or your host env).'
    )
  }
  return key
}

/** Servidor: prefere service role (bypass RLS onde aplicável); senão anon (ex.: dev). */
export function requireSupabaseServerKey(): string {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const key = service || anon
  if (!key) {
    throw new Error(
      'Server Supabase: set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    )
  }
  return key
}
