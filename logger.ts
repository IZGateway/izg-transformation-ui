import winston from 'winston'
import ecsFormat from '@elastic/ecs-winston-format'
import { asyncRequestContext } from './src/lib/Context'

// Inject a sessionUser identity object into every log event emitted inside an
// authenticated request context (IGDD-2223). Additive only: it writes ONLY the
// sessionUser key and never touches existing fields (e.g. the `user` string).
// No-ops (never throws) when there is no request context (startup, background,
// unauthenticated).
export const sessionUserFormat = winston.format((info) => {
  const store = asyncRequestContext.getStore()
  if (store && (store.userId || store.email)) {
    info.sessionUser = {
      name: store.name,
      userId: store.userId,
      email: store.email,
      sessionId: store.sessionId,
      jti: store.jti,
      authTime: store.authTime,
      ip: store.ipAddress,
    }
  }
  return info
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    sessionUserFormat(),
    ecsFormat({ convertReqRes: true, apmIntegration: false })
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
})

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      //path to log file
      filename: 'log.json',
      dirname: 'logs',
    })
  )
}

//convert console log to winston ecs format to ship to elastic search
console.log = (...args) => logger.info.call(logger, ...args)
console.info = (...args) => logger.info.call(logger, ...args)
console.warn = (...args) => logger.warn.call(logger, ...args)
console.error = (...args) => logger.error.call(logger, ...args)
console.debug = (...args) => logger.debug.call(logger, ...args)

export default logger
