import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { asyncRequestContext, Context } from './Context'
import logger from '../../logger'

/**
 * Build the per-request audit context from the authenticated session and JWT.
 * Shared by withMiddleware (API routes) and withRequestContext (page renders)
 * so the two paths cannot drift.
 */
export async function buildRequestContext(
  req: any,
  res: any
): Promise<Context> {
  const forwardedForHeader = req?.headers?.['x-forwarded-for'] as
    | string
    | string[]
    | undefined
  const forwardedFor = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader
  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    req?.socket?.remoteAddress ||
    undefined

  // A NextAuth session/JWT is only ever present via cookies. With no cookie
  // header there can be no authenticated identity, so skip the getServerSession
  // + getToken parsing cost. This matters for unauthenticated high-frequency
  // endpoints (e.g. health checks polled by load balancers without cookies).
  if (!req?.headers?.cookie) {
    return { ipAddress, session: null }
  }

  const session = await getServerSession(req, res, authOptions)
  const token = await getToken({ req })
  const sub = token?.sub

  return {
    user: session?.user?.email || undefined,
    ipAddress,
    sub,
    userId: sub,
    email: session?.user?.email || undefined,
    name: session?.user?.name || undefined,
    sessionId: token?.sessionId,
    jti: token?.oktaJti,
    authTime: token?.authTime,
    session,
  }
}

/**
 * Higher-order wrapper for getServerSideProps that establishes the audit
 * request context for the entire server-side render, so every log emitted
 * during the render (and downstream) carries sessionUser via logger.ts.
 */
export function withRequestContext(
  handler: (context: GetServerSidePropsContext) => Promise<any>
) {
  return async (context: GetServerSidePropsContext): Promise<any> => {
    // Audit context is additive: never let its establishment break SSR.
    // If buildRequestContext throws (e.g. next-auth token/session
    // resolution), warn-log and render without a store.
    let requestContext
    try {
      requestContext = await buildRequestContext(context.req, context.res)
    } catch (err) {
      logger.warn('Failed to establish audit request context for SSR', { err })
      return handler(context)
    }
    return asyncRequestContext.run(requestContext, () => handler(context))
  }
}
