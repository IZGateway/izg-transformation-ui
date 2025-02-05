const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')
const winston = require('winston')
const ecsFormat = require('@elastic/ecs-winston-format')

module.exports = async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    images: {
      unoptimized: true
    },
    // Disable webpack cache in production
    generateBuildId: async () => {
      return process.env.BUILD_ID || 'development'
    },
    // Ensure cache is completely disabled for production builds
    experimental: {
      // This forces webpack to bypass caching mechanisms
      forceSwcTransforms: true,
    },
    redirects: async () => {
      return [
        {
          source: '/',
          destination: `/manage`,
          permanent: true,
        },
      ]
    },
    env: {
      OPERATIONS_GROUP: `${process.env.OPERATIONS_GROUP}`,
      USER_GROUP: `${process.env.USER_GROUP}`,
    },
    webpack(config, { nextRuntime, isServer, dev }) {
      // Disable caching for production builds
      if (!dev) {
        config.cache = false
      }

      if (typeof nextRuntime === 'undefined') {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        }
      }

      return config
    },
  }

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: ecsFormat({ convertReqRes: true, apmIntegration: false }),
    transports: [new winston.transports.Console()],
    exitOnError: false,
  })

  if (process.env.NODE_ENV === 'production') {
    logger.add(
      new winston.transports.File({
        filename: 'log.json',
        dirname: 'logs',
      })
    )
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    logger.info('Xform Console Service started', {
      'startup-phase': phase,
    })
  } else if (
    process.argv.includes('start') &&
    phase === PHASE_PRODUCTION_SERVER
  ) {
    logger.info('Xform Console Service started ', {
      'startup-phase': phase,
    })
  } else if (
    process.argv.includes('build') &&
    phase === PHASE_PRODUCTION_BUILD
  ) {
    logger.info('Xform Console Service building', {
      'build-phase': phase,
    })
  }
  return nextConfig
}
