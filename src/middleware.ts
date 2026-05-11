import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { canAccessConsole, canAccessPath, getRolesFromGroups } from './lib/rbac'

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    const roles = getRolesFromGroups(req.nextauth.token?.groups)

    if (!canAccessConsole(roles)) {
      return NextResponse.redirect(new URL('/api/auth/signout?callbackUrl=/', req.url))
    }

    if (!canAccessPath(pathname, roles)) {
      return NextResponse.redirect(new URL('/404', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/healthcheck') ||
          pathname.startsWith('/api/deephealthcheck')
        ) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|api/healthcheck|api/deephealthcheck|_next/static|_next/image|favicon.ico).*)',
  ],
}
