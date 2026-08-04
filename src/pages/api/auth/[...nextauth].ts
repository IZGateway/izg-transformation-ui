/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'
import OktaProvider from 'next-auth/providers/okta'
import { randomUUID } from 'crypto'
import logger from '../../../../logger'
import _ from 'lodash'
import { getTokenStore } from '../../../lib/tokenStore'
import {
  canAccessConsole,
  getGroups,
  getGroupsFromClaims,
  getRolesFromGroups,
} from '../../../lib/rbac'

const userInfoEndpoint = `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}${process.env.OKTA_USERINFO_PATH}`
const isDebugging = process.env.NEXTAUTH_DEBUG === 'true'
const oktaScopes = process.env.OKTA_SCOPE || 'openid email profile'

export const authOptions = {
  debug: isDebugging,
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      issuer: `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}`,
      idToken: true,
      authorization: { params: { scope: oktaScopes } },
    }),
  ],
  session: {
    maxAge: 30 * 60,
    jwt: true
  },
  callbacks: {
    async signIn(params) {
      const profileGroups = getGroupsFromClaims(params?.profile)
      const idTokenGroups = getGroupsFromIdToken(params?.account?.id_token)
      const accessTokenGroups = getGroupsFromAccessToken(
        params?.account?.access_token
      )
      const groups = mergeGroups(profileGroups, idTokenGroups, accessTokenGroups)
      const roles = getRolesFromGroups(groups)

      // Do not hard-deny in signIn callback because group claims can be absent or partial here.
      // Middleware enforces RBAC after JWT callback enriches token claims.
      logger.debug('SIGN IN CONTINUING: pre-jwt role snapshot', {
        email: params?.user?.email,
        groupsPresent: groups.length > 0,
        roles,
        consoleAccess: canAccessConsole(roles),
      })

      return true
    },

    async session({ session, token }) {
      const groups = getGroups(token?.groups)
      const roles = getRolesFromGroups(groups)

      return {
        expires: session.expires,
        user: {
          name: session.user.name,
          email: session.user.email,
          isAdmin: roles.includes('admin'),
          jurisdictions: token?.jurisdictions || [],
          groups,
          roles,
        }
      }
    },

    async jwt({ token, user, account, profile, isNewUser, idToken }) {
      if (account) {
        const accessToken =
          typeof account.access_token === 'string' ? account.access_token : ''
        const profileGroups = getGroupsFromClaims(profile)
        const idTokenGroups = getGroupsFromIdToken(account?.id_token)
        const accessTokenGroups = getGroupsFromAccessToken(account?.access_token)
        const userInfo = accessToken ? await getUserInfo(accessToken) : {}
        const userInfoGroups = getGroupsFromClaims(userInfo)
        const groups = mergeGroups(
          getGroups(token?.groups),
          profileGroups,
          idTokenGroups,
          accessTokenGroups,
          userInfoGroups
        )
        const roles = getRolesFromGroups(groups)

        // Store the access token in server-side map using the user's sub as the key
        if (token.sub && accessToken) {
          const store = getTokenStore()
          store.set(token.sub, accessToken)
        }

        // Audit identity (IGDD-2223): a console-generated session id stable for
        // the life of this login, plus the Okta id-token jti/auth_time as token
        // references for indirect Okta System Log correlation.
        const sessionId = randomUUID()
        const idTokenClaims = getClaimsFromJwtToken(account?.id_token)
        const authTime =
          typeof idTokenClaims?.auth_time === 'number'
            ? idTokenClaims.auth_time
            : undefined
        const jti =
          typeof idTokenClaims?.jti === 'string' ? idTokenClaims.jti : undefined

        // Once-per-login point-in-time authorization snapshot. groups/roles are
        // logged here only (not on every line); recover them for any line by
        // joining on sessionUser.sessionId.
        logger.info('Session established', {
          sessionUser: {
            name: token.name || user?.name,
            userId: token.sub,
            email: token.email || user?.email,
            sessionId,
            jti,
            authTime,
          },
          groups,
          roles,
        })

        // Include access_token in JWT so API routes can read it even if in-memory map is empty.
        return {
          ...token,
          access_token: accessToken,
          groups,
          roles,
          jurisdictions: getJurisdictionsFromUserInfo(userInfo),
          sessionId,
          authTime,
          // Stored under oktaJti (not the reserved `jti`) because NextAuth's JWT
          // encode overwrites `jti` with its own UUID on every session cookie write.
          oktaJti: jti
        }
      }
      return token
    }
  }
}

const getJurisdictionsFromUserInfo = (userInfo: any) =>
  userInfo?.jurisdictions?.map((j) => _.lowerCase(j)) || []

async function getUserInfo(access_token: string) {
  try {
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    return await response.json()
  } catch (err) {
    logger.error('ERROR FETCHING USER INFO FROM OKTA: ' + err)
    return {}
  }
}

function mergeGroups(...groupLists: string[][]): string[] {
  const mergedGroups = new Set<string>()
  groupLists.forEach((groupList) => {
    groupList.forEach((group) => mergedGroups.add(group))
  })
  return Array.from(mergedGroups)
}

function getGroupsFromIdToken(rawIdToken: unknown): string[] {
  return getGroupsFromJwtToken(rawIdToken)
}

function getGroupsFromAccessToken(rawAccessToken: unknown): string[] {
  return getGroupsFromJwtToken(rawAccessToken)
}

function getGroupsFromJwtToken(rawToken: unknown): string[] {
  const payload = getClaimsFromJwtToken(rawToken)
  return payload ? getGroupsFromClaims(payload) : []
}

function getClaimsFromJwtToken(rawToken: unknown): any | null {
  if (typeof rawToken !== 'string' || !rawToken.includes('.')) {
    return null
  }

  const segments = rawToken.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    return JSON.parse(base64UrlDecode(segments[1]))
  } catch {
    return null
  }
}

function base64UrlDecode(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return Buffer.from(paddedBase64, 'base64').toString('utf8')
}

export default NextAuth(authOptions)
