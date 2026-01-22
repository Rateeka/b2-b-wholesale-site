import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the retailer dashboard after confirmation
  return NextResponse.redirect(new URL('/retailer/dashboard', requestUrl.origin))
}
