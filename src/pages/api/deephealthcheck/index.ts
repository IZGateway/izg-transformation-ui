import type { NextApiRequest, NextApiResponse } from 'next'
import withMiddleware from '../api-middleware-helper'
import logger from '../../../../logger'
import * as fs from 'fs'
import path from 'path'
import https from 'https'
import axios from 'axios'
/**
 * @swagger
 * /api/deephealthcheck:
 *   get:
 *     summary: returns HTTP OK (200).
 *     responses:
 *       200:
 *         description: OK.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const deepHealthCheckResults = []
  const checkConnections = ['OKTA', 'XFORMSERVICE']

  // XFORM SERVICE
  const xformServiceStatus = async () => {
    let xformServiceHealthCheck = {}
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
  const oktaStatus = async () => {
    let oktaHealthCheck = {}
    const oktaEndpoint =
      `${process.env.NEXT_PUBLIC_OKTA_ISSUER}${process.env.OKTA_ISSUER_PATH}/.well-known/openid-configuration` || 'unknown'
    try {
      const response = await fetch(oktaEndpoint)
      const data = await response.json()
      logger.debug('okta config api response', { data })
      oktaHealthCheck = {
        component: 'OKTA',
        status: 'connected',
        statusAt: new Date(Date.now()).toISOString(),
        reason: 'received configuration api response',
        url: oktaEndpoint,
        oktaGlobalStatusEndpoint: 'https://status.okta.com',
      }
      return oktaHealthCheck
    } catch (error) {
      oktaHealthCheck = {
        component: 'OKTA',
        status: 'unable to connect',
        statusAt: new Date(Date.now()).toISOString(),
        reason: error.message,
        url: oktaEndpoint,
        oktaGlobalStatusEndpoint: 'https://status.okta.com',
      }
      return oktaHealthCheck
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
    logger.info('Deep Health Check', { deepHealthCheckResults })
    res.status(200).json(deepHealthCheckResults)
  } catch (error) {
    res.status(503).json(error.message)
  }
}
export default withMiddleware()(handler)
