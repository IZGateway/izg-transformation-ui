import type { NextApiRequest, NextApiResponse } from 'next'
import withMiddleware from '../api-middleware-helper'
import logger from '../../../../logger'
import * as fs from 'fs'
import path from 'path'
import https from 'https'
import axios from 'axios'
import { asyncRequestContext } from '../../../lib/Context'

/** The result of probing one dependency. */
interface ComponentHealth {
  component: string
  status: string
  statusAt: string
  /** May carry an upstream error message, so it is withheld from non-admin callers. */
  reason?: string
  /** The dependency's address, including internal load balancer DNS names. */
  url?: string
  healthy?: boolean
  exception?: string
  oktaGlobalStatusEndpoint?: string
}

/**
 * What a non-admin caller may see of a component result (IGDD-3178).
 *
 * This route is reachable without a credential — it is exempt from both the
 * `withAuth` matcher and DPoP verification in `src/middleware.ts` — so the full
 * result was reaching anonymous callers: upstream error messages, the Okta issuer,
 * and the internal address behind `XFORM_SERVICE_HEALTHCHECK_URL`.
 */
type PublicComponentHealth = Pick<
  ComponentHealth,
  'component' | 'status' | 'statusAt'
>

/**
 * Project a component result down to the fields a non-admin caller may see.
 *
 * An allowlist rather than a redaction: the result is rebuilt from three named
 * fields, so a field added to either probe later is withheld by default instead of
 * being disclosed until someone remembers to strip it.
 */
const publicView = (result: ComponentHealth): PublicComponentHealth => ({
  component: result.component,
  status: result.status,
  statusAt: result.statusAt,
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const deepHealthCheckResults: ComponentHealth[] = []
  const checkConnections = ['OKTA', 'XFORMSERVICE']

  // Holding the `admin` role, as resolved from the caller's Okta groups by the
  // session callback — not mere authentication. Anyone who completes the Okta flow
  // holds a session, so gating on `session.user` alone would disclose dependency
  // addresses to a tenant user with no Xform roles at all. `withMiddleware`
  // establishes the context for this route too; if it failed to, there is no store
  // and this reads false, which withholds detail.
  const isAdmin = Boolean(
    asyncRequestContext.getStore()?.session?.user?.isAdmin
  )
  const publicDeepHealthCheckResults = () =>
    deepHealthCheckResults.map(publicView)

  // XFORM SERVICE
  const xformServiceStatus = async (): Promise<ComponentHealth> => {
    let xformServiceHealthCheck: ComponentHealth
    const XFORM_SERVICE_HEALTHCHECK_ENDPOINT =
      process.env.XFORM_SERVICE_HEALTHCHECK_URL || 'unknown'
    const XFORM_SERVICE_ENDPOINT_CRT_PATH =
      process.env.XFORM_SERVICE_ENDPOINT_CRT_PATH || undefined
    const XFORM_SERVICE_ENDPOINT_KEY_PATH =
      process.env.XFORM_SERVICE_ENDPOINT_KEY_PATH || undefined
    const XFORM_SERVICE_ENDPOINT_PASSCODE =
      process.env.XFORM_SERVICE_ENDPOINT_PASSCODE || undefined
    const httpsAgentOptions = {
      cert: fs.readFileSync(
        path.resolve(XFORM_SERVICE_ENDPOINT_CRT_PATH),
        'utf-8'
      ),
      key: fs.readFileSync(
        path.resolve(XFORM_SERVICE_ENDPOINT_KEY_PATH),
        'utf-8'
      ),
      passphrase: XFORM_SERVICE_ENDPOINT_PASSCODE,
      rejectUnauthorized: false,
      keepAlive: true,
    }
    const responseData = await axios
      .get(XFORM_SERVICE_HEALTHCHECK_ENDPOINT, {
        httpsAgent: new https.Agent(httpsAgentOptions),
        timeout: 30000,
      })
      .then((response) => {
        const data = response.data
        logger.info('XFORMSERVICE Health Status', { data })
        if (data.healthy) {
          xformServiceHealthCheck = {
            component: 'XFORMSERVICE',
            status: 'connected',
            statusAt: data.statusAt,
            reason: data.lastChangeReason,
            healthy: data.healthy,
            url: XFORM_SERVICE_HEALTHCHECK_ENDPOINT,
          }
        } else {
          xformServiceHealthCheck = {
            component: 'XFORMSERVICE',
            status: 'connected but status not healthy',
            statusAt: data.statusAt,
            reason: data.lastChangeReason,
            exception: data.lastException,
            healthy: data.healthy,
            url: XFORM_SERVICE_HEALTHCHECK_ENDPOINT,
          }
        }
        return xformServiceHealthCheck
      })
      .catch((error) => {
        xformServiceHealthCheck = {
          component: 'XFORMSERVICE',
          status: 'unable to connect',
          statusAt: new Date(Date.now()).toISOString(),
          reason: error.message,
          url: XFORM_SERVICE_HEALTHCHECK_ENDPOINT,
        }
        return xformServiceHealthCheck
      })
    return responseData
  }

  // OKTA
  const oktaStatus = async (): Promise<ComponentHealth> => {
    const issuer = process.env.NEXT_PUBLIC_OKTA_ISSUER || ''
    const issuerPath = process.env.OKTA_ISSUER_PATH || ''
    const oktaEndpoint =
      issuer && issuerPath
        ? `${issuer}${issuerPath}/.well-known/openid-configuration`
        : 'unknown'
    try {
      const response = await fetch(oktaEndpoint)
      const data = await response.json()
      logger.debug('okta config api response', { data })
      return {
        component: 'OKTA',
        status: 'connected',
        statusAt: new Date(Date.now()).toISOString(),
        reason: 'received configuration api response',
        url: oktaEndpoint,
        oktaGlobalStatusEndpoint: 'https://status.okta.com',
      }
    } catch (error) {
      return {
        component: 'OKTA',
        status: 'unable to connect',
        statusAt: new Date(Date.now()).toISOString(),
        reason: error.message,
        url: oktaEndpoint,
        oktaGlobalStatusEndpoint: 'https://status.okta.com',
      }
    }
  }

  try {
    for (const component of checkConnections) {
      if (component === 'XFORMSERVICE') {
        const xformServiceHealthCheck = await xformServiceStatus()
        deepHealthCheckResults.push(xformServiceHealthCheck)
      }
      if (component === 'OKTA') {
        const oktaCheck = await oktaStatus()
        deepHealthCheckResults.push(oktaCheck)
      }
    }
    // Always logged in full, whoever asked: the log is the operator's view and is
    // not part of the response.
    logger.info('Deep Health Check', { deepHealthCheckResults })
    res
      .status(200)
      .json(isAdmin ? deepHealthCheckResults : publicDeepHealthCheckResults())
  } catch (error) {
    // The status code does not depend on the caller, so the load balancer probe is
    // unaffected either way; only the body varies. An uncaught error here is almost
    // always a misconfigured XFORM_SERVICE_ENDPOINT_* path, whose message names a
    // filesystem path, so a non-admin caller gets no message at all.
    logger.error('Deep Health Check failed', { errorMessage: error.message })
    res.status(503).json(isAdmin ? error.message : 'Service Unavailable')
  }
}
export default withMiddleware()(handler)
