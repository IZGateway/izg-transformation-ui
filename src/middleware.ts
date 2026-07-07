import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { canAccessConsole, canAccessPath, getRolesFromGroups } from './lib/rbac'

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    const rolesFromGroups = getRolesFromGroups(req.nextauth.token?.groups)
    const rolesFromToken = Array.isArray(req.nextauth.token?.roles)
      ? req.nextauth.token.roles
      : []
    const roles = rolesFromGroups.length ? rolesFromGroups : rolesFromToken

    if (!canAccessConsole(roles)) {
      return NextResponse.redirect(new URL('/api/auth/error?error=AccessDenied', req.url))
    }

    if (!pathname.startsWith('/api') && !canAccessPath(pathname, roles)) {
      return NextResponse.redirect(new URL('/api/auth/error?error=AccessDenied', req.url))
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
