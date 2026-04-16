import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/user')
  const isMemberRoute = pathname.startsWith('/member')


  if (!user && (isAdminRoute || isUserRoute)) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  let role: string | null = null

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    role = userData?.role ?? null
  }


  if (user && role) {
    if (isAdminRoute && role !== 'admin') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (isUserRoute && role !== 'user') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (isMemberRoute && role !== 'band_member') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // if (user && isAuthRoute) {
  //   if (role === 'admin') {
  //     url.pathname = '/admin/dashboard'
  //   } else {
  //     url.pathname = '/user/dashboard'
  //   }
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}