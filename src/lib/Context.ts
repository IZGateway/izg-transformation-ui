import { AsyncLocalStorage } from 'async_hooks'
import type { Session } from 'next-auth'

/**
 * Per-request identity/context captured for audit logging (IGDD-2223).
 * Populated for API routes (via withMiddleware's establishContext) and for
 * server-side page renders (via withRequestContext). Read by the Winston
 * sessionUser format in logger.ts.
 */
export interface Context {
  user?: string
  ipAddress?: string
  sub?: string
  userId?: string
  email?: string
  name?: string
  sessionId?: string
  jti?: string
  authTime?: number
  session?: Session | null
}

// Attach to global so every server bundle/module graph shares ONE
// AsyncLocalStorage instance. Without this, Next can bundle logger.ts and the
// page/API module graphs separately, giving each its own AsyncLocalStorage —
// the store set by withMiddleware/withRequestContext would then be invisible to
// the logger's getStore(), and sessionUser would never be injected. Mirrors the
// global.tokenStore pattern (single Node process per container).
declare global {
  // eslint-disable-next-line no-var
  var asyncRequestContext: AsyncLocalStorage<Context> | undefined
}

export const asyncRequestContext: AsyncLocalStorage<Context> =
  global.asyncRequestContext ||
  (global.asyncRequestContext = new AsyncLocalStorage<Context>())
