import type { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { asyncRequestContext, Context } from './Context'

/**
 * Build the per-request audit context from the authenticated session and JWT.
 * Shared by withMiddleware (API routes) and withRequestContext (page renders)
 * so the two paths cannot drift.
 */
export async function buildRequestContext(
  req: any,
  res: any
): Promise<Context> {
  const session = await getServerSession(req, res, authOptions)
  const token = await getToken({ req })
  const sub = token?.sub

  const forwardedFor = req?.headers?.['x-forwarded-for'] as string | undefined
  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    req?.socket?.remoteAddress ||
    'unknown'

  return {
    user: session?.user?.email || undefined,
    ipAddress,
    sub,
    userId: sub,
    email: session?.user?.email || undefined,
    name: session?.user?.name || undefined,
    sessionId: token?.sessionId,
    jti: token?.jti,
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
    const requestContext = await buildRequestContext(context.req, context.res)
    return asyncRequestContext.run(requestContext, () => handler(context))
  }
}
