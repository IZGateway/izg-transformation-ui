/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'
import OktaProvider from 'next-auth/providers/okta'
import logger from '../../../../logger'
import _ from 'lodash'

const userInfoEndpoint = `${process.env.OKTA_BASE_URL}${process.env.OKTA_USERINFO_PATH}`
const isDebugging =
  (`${process.env.NEXTAUTH_DEBUG}` as unknown as boolean) || false
export const authOptions = {
  debug: isDebugging,
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      issuer: `${process.env.OKTA_BASE_URL}${process.env.OKTA_ISSUER_PATH}`,
      idToken: true,
      authorization: { params: { scope: 'openid email profile' } },
    }),
  ],
  session: {
    maxAge: 30 * 60, // 30 mins
    jwt: true,
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.access_token = token.access_token
        // TODO - this is used for checking if user has access to destId's
        // which we don't have.  Do we need this or jurisdictions?
        session.user.isAdmin = token?.groups?.includes(
          process.env.OPERATIONS_GROUP
        )
        session.user.jurisdictions = token.jurisdictions
      }
      return session
    },
    async jwt({ token, user, account, profile, isNewUser, idToken }) {
      if (account) {
        token.access_token = account.access_token
        token.groups = profile.groups
        try {
          const response = await fetch(userInfoEndpoint, {
            headers: {
              Authorization: 'Bearer ' + account.access_token,
            },
          })
          const data = await response.json()
          token.jurisdictions = data?.jurisdictions?.map((j) => _.lowerCase(j))
        } catch (err) {
          logger.error('ERROR FETCHING USER INFO FROM OKTA: ' + err)
        }
      }
      return token
    },
  },
}
export default NextAuth(authOptions)
