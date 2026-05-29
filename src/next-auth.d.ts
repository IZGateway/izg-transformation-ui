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
  }
}
