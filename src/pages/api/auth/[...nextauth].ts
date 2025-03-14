/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'
import OktaProvider from 'next-auth/providers/okta'
import logger from '../../../../logger'
import _ from 'lodash'
import { getTokenStore } from '../../../lib/tokenStore'

const userInfoEndpoint = `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}${process.env.OKTA_USERINFO_PATH}`
const isDebugging = (`${process.env.NEXTAUTH_DEBUG}` as unknown as boolean) || false

export const authOptions = {
  debug: isDebugging,
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID as string,
      clientSecret: process.env.OKTA_CLIENT_SECRET as string,
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

    async session({ session, token }) {
      return {
        expires: session.expires,
        user: {
          name: session.user.name,
          email: session.user.email,
          isAdmin: token?.groups?.includes(process.env.OPERATIONS_GROUP),
          jurisdictions: token?.jurisdictions
        }
      }
    },

    async jwt({ token, user, account, profile, isNewUser, idToken }) {
      if (account) {
        // Store the access token in server-side map using the user's sub as the key
        const store = getTokenStore()
        store.set(token.sub, account.access_token)

        // Don't include access_token in the token at all
        return {
          ...token,
          groups: profile.groups,
          jurisdictions: await getJurisdictions(account.access_token)
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
