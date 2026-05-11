/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'
import OktaProvider from 'next-auth/providers/okta'
import logger from '../../../../logger'
import _ from 'lodash'
import { getTokenStore } from '../../../lib/tokenStore'
import { canAccessConsole, getGroups, getRolesFromGroups } from '../../../lib/rbac'

const userInfoEndpoint = `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}${process.env.OKTA_USERINFO_PATH}`
const isDebugging = process.env.NEXTAUTH_DEBUG === 'true'

export const authOptions = {
  debug: isDebugging,
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      issuer: `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}`,
      idToken: true,
      authorization: { params: { scope: 'openid email profile' } },
    }),
  ],
  session: {
    maxAge: 30 * 60,
    jwt: true
  },
  callbacks: {
    async signIn(params) {
      const roles = getRolesFromGroups(params?.profile?.groups)
      const canSignIn = canAccessConsole(roles)

      if (!canSignIn) {
        logger.warn('SIGN IN DENIED: user has no console-access role assignment')
      }

      return canSignIn
    },

    async session({ session, token }) {
      const groups = getGroups(token?.groups)
      const roles = getRolesFromGroups(groups)

      return {
        expires: session.expires,
        user: {
          name: session.user.name,
          email: session.user.email,
          isAdmin:
            token?.groups?.includes(process.env.OPERATIONS_GROUP) ||
            roles.includes('admin'),
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
        const groups = getGroups(profile?.groups)
        const roles = getRolesFromGroups(groups)

        // Store the access token in server-side map using the user's sub as the key
        if (token.sub && accessToken) {
          const store = getTokenStore()
          store.set(token.sub, accessToken)
        }

        // Include access_token in JWT so API routes can read it even if in-memory map is empty.
        return {
          ...token,
          access_token: accessToken,
          groups,
          roles,
          jurisdictions: accessToken ? await getJurisdictions(accessToken) : []
        }
      }
      return token
    }
  }
}

async function getJurisdictions(access_token: string) {
  try {
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    const data = await response.json()
    return data?.jurisdictions?.map((j) => _.lowerCase(j))
  } catch (err) {
    logger.error('ERROR FETCHING USER INFO FROM OKTA: ' + err)
    return []
  }
}

export default NextAuth(authOptions)
