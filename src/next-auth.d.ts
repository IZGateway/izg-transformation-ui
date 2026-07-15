import 'next-auth/jwt'
import { DefaultSession } from 'next-auth'
import type { XformRole } from './lib/rbac'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession['user'] & {
      isAdmin: boolean
      jurisdictions: string[]
      groups: string[]
      roles: XformRole[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string
    groups?: string[]
    jurisdictions?: string[]
    roles?: XformRole[]
    sessionId?: string
    authTime?: number
    // Okta ID-token jti stored under a non-reserved key: NextAuth's JWT encode
    // unconditionally sets its own `jti` (a fresh UUID) on the session cookie,
    // so the reserved `jti` claim cannot carry our value across requests.
    oktaJti?: string
  }
}
