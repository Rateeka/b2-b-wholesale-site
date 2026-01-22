import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log('[MIDDLEWARE] Request to:', pathname)
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const cookies = request.cookies.getAll()
  console.log('[MIDDLEWARE] Cookies received:', cookies.map(c => c.name))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[MIDDLEWARE] Setting cookies:', cookiesToSet.map(c => c.name))
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  console.log('[MIDDLEWARE] Calling getUser...')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('[MIDDLEWARE] getUser result:', { hasUser: !!user, userId: user?.id, role: user?.user_metadata?.role })

  // Redirect authenticated users away from login/register pages to their dashboard
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/register'))
  ) {
    const role = user.user_metadata?.role || 'retailer'
    const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/retailer/dashboard'
    console.log('[MIDDLEWARE] Authenticated user on auth page, redirecting to', dashboardPath)
    const url = request.nextUrl.clone()
    url.pathname = dashboardPath
    return NextResponse.redirect(url)
  }

  // Check role-based access
  if (user) {
    const role = user.user_metadata?.role || 'retailer'
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    const isRetailerPath = request.nextUrl.pathname.startsWith('/retailer')

    // Admin trying to access retailer routes
    if (role === 'admin' && isRetailerPath) {
      console.log('[MIDDLEWARE] Admin user on retailer route, redirecting to /admin/dashboard')
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }

    // Retailer trying to access admin routes
    if (role === 'retailer' && isAdminPath) {
      console.log('[MIDDLEWARE] Retailer user on admin route, redirecting to /retailer/dashboard')
      const url = request.nextUrl.clone()
      url.pathname = '/retailer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect unauthenticated users to login (except for public routes)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    console.log('[MIDDLEWARE] No user found, redirecting to /login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  if (user) {
    console.log('[MIDDLEWARE] User authenticated:', user.id, 'role:', user.user_metadata?.role || 'retailer')
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}
