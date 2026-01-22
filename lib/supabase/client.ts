import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types'

export function createClient() {
  console.log('[SUPABASE CLIENT] Creating browser client')
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
