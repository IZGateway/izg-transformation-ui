import { label, Middleware } from 'next-api-middleware'
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import logger from '../../../logger'
import hasAccessToDestId from '../../lib/accesshelper'

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

// Catch any errors
const captureErrors: Middleware = async (req, res, next) => {
  try {
    await next()
  } catch (err) {
    logger.error('Error with ' + req.url, { err: err })
    res.status(500)
    res.json({ error: err })
  }
}

// log the api requests and response code
const logRequest: Middleware = async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user?.email || null
  if (LOG_LEVEL.toLocaleLowerCase() === 'debug') {
    logger.warn(
      'WARNING: LOG_LEVEL is set to DEBUG, this will log sensitive information for every API request'
    )
    logger.info('API Request ' + req.url, {
      req,
      res,
      user,
      'x-forwarded-for': req.headers['x-forwarded-for'] || null,
      'user-agent': req.headers['user-agent'] || null,
    })
  } else {
    logger.info('API Request ' + req.url, {
      user,
      'x-forwarded-for': req.headers['x-forwarded-for'] || null,
      'user-agent': req.headers['user-agent'] || null,
    })
  }
  await next()
}

// check access to destination
const checkAccessToDestId: Middleware = async (req, res, next) => {
  const destId = req.query.id.toString()
  const session = await getServerSession(req, res, authOptions)
  const hasAccess = hasAccessToDestId(destId, session)
  if (hasAccess) {
    await next()
  } else {
    res.status(401).send('unauthorized')
    logger.warn('Unauthorized access attempt', {
      url: req.url,
      user: session?.user?.email || null,
    })
  }
}
const checkAccessToDestIdSlug: Middleware = async (req, res, next) => {
  const { slug } = req.query
  const destId = slug[1]
  const session = await getServerSession(req, res, authOptions)
  const hasAccess = hasAccessToDestId(destId, session)
  if (hasAccess) {
    await next()
  } else {
    res.status(401).send('unauthorized')
    logger.warn('Unauthorized access attempt', {
      url: req.url,
      user: session?.user?.email || null,
    })
  }
}

const withMiddleware = label(
  {
    logRequest,
    captureErrors,
    checkAccessToDestId,
    checkAccessToDestIdSlug,
  },
  ['captureErrors'] //default functions
)

export default withMiddleware
