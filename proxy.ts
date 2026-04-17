import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),

        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/user') || pathname.startsWith('/member')

  if (!user && (isAdminRoute || isUserRoute)) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  let role: string | null = null

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    role = data?.role ?? null
  }

  if (user && role) {
    if (isAdminRoute && role !== 'admin') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }

    if (isUserRoute && !['user', 'band_member'].includes(role)) {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}