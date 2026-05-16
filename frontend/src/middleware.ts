import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/account', '/checkout', '/vendor', '/admin']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth token is stored in localStorage (client-side only).
  // We use a cookie set by the client as a hint for server-side redirect.
  const authCookie = request.cookies.get('shofy_auth')?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !authCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && authCookie) {
    // Respect ?redirect= param so the layout's temporary mis-redirect
    // (before Zustand hydrates) doesn't loop the user to TOP.
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    const destination =
      redirectTo && PROTECTED_PREFIXES.some((p) => redirectTo.startsWith(p))
        ? redirectTo
        : '/'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/vendor/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
}
