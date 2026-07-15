import { label, Middleware } from 'next-api-middleware'
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import logger from '../../../logger'
import hasAccessToDestId from '../../lib/accesshelper'
import { asyncRequestContext } from '../../lib/Context'
import { buildRequestContext } from '../../lib/requestContext'

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
let hasLoggedDebugWarning = false

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
  const isDebug = LOG_LEVEL.toLowerCase() === 'debug'

  if (isDebug && !hasLoggedDebugWarning) {
    logger.warn(
      'WARNING: LOG_LEVEL is set to DEBUG, this will log sensitive information for every API request'
    )
    hasLoggedDebugWarning = true
  }

  await next()

  if (isDebug) {
    logger.info('API Request ' + req.url, {
      req,
      res,
      statusCode: res.statusCode,
      user,
      'x-forwarded-for': req.headers['x-forwarded-for'] || null,
      'user-agent': req.headers['user-agent'] || null,
    })
  } else {
    logger.info('API Request ' + req.url, {
      statusCode: res.statusCode,
      user,
      'x-forwarded-for': req.headers['x-forwarded-for'] || null,
      'user-agent': req.headers['user-agent'] || null,
    })
  }
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

const baseMiddleware = label(
  {
    logRequest,
    captureErrors,
    checkAccessToDestId,
    checkAccessToDestIdSlug,
  },
  ['captureErrors'] //default functions
)

// Establish the per-request audit context (IGDD-2223) around the ENTIRE
// composed middleware chain + route handler, so every log emitted downstream
// carries sessionUser — on every route, regardless of whether it opts into
// logRequest. This wraps the whole chain rather than using an inner middleware
// because next-api-middleware defers downstream execution via queueMicrotask,
// which would fall outside an inner AsyncLocalStorage.run() scope.
const withMiddleware =
  (...chosenMiddleware: Parameters<typeof baseMiddleware>) =>
  (handler: Parameters<ReturnType<typeof baseMiddleware>>[0]) => {
    const composed = baseMiddleware(...chosenMiddleware)(handler)
    return async (req: any, res: any) => {
      const context = await buildRequestContext(req, res)
      return asyncRequestContext.run(context, () => composed(req, res))
    }
  }

export default withMiddleware
