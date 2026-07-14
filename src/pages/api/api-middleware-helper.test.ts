import { createMocks } from 'node-mocks-http'

// Mock next-auth so importing authOptions (which calls NextAuth(...) at module
// load) is side-effect free, and so we control the resolved session/token.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
  getServerSession: jest.fn(),
}))
jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  getToken: jest.fn(),
}))
jest.mock('next-auth/providers/okta', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}))

import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import withMiddleware from './api-middleware-helper'
import { asyncRequestContext } from '../../lib/Context'
import logger from '../../../logger'

describe('withMiddleware establishContext (IGDD-2223)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { name: 'Austin Moody', email: 'a@b.com' },
    })
    ;(getToken as jest.Mock).mockResolvedValue({
      sub: '00usub',
      sessionId: 'sess-1',
      jti: 'ID.jti1',
      authTime: 1782755733,
    })
  })

  it('establishes the request context for a route that does NOT opt into logRequest', async () => {
    let seen: any
    const handler = withMiddleware()(async (_req: any, res: any) => {
      seen = asyncRequestContext.getStore()
      res.status(200).end()
    })

    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(seen).toMatchObject({
      userId: '00usub',
      email: 'a@b.com',
      name: 'Austin Moody',
      sessionId: 'sess-1',
      jti: 'ID.jti1',
      authTime: 1782755733,
    })
  })

  it('injects sessionUser onto a real log line emitted downstream of the handler', async () => {
    // Capture the fully-formatted info object the transport receives (after the
    // sessionUser format + ecs serialization have run).
    const captured: any[] = []
    const transport = logger.transports[0]
    const logSpy = jest
      .spyOn(transport as any, 'log')
      .mockImplementation((info: any, cb: any) => {
        captured.push(info)
        if (typeof cb === 'function') cb()
      })

    const handler = withMiddleware()(async (_req: any, res: any) => {
      logger.info('downstream log line')
      res.status(200).end()
    })
    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    const line = captured.find(
      (i) => i.message === 'downstream log line'
    )
    expect(line).toBeDefined()
    expect(line.sessionUser).toMatchObject({
      userId: '00usub',
      email: 'a@b.com',
      sessionId: 'sess-1',
    })
    logSpy.mockRestore()
  })

  it('preserves the existing user (email) field on the API Request line', async () => {
    const infoSpy = jest.spyOn(logger, 'info')
    const handler = withMiddleware('logRequest')(async (_req: any, res: any) => {
      res.status(200).end()
    })

    const { req, res } = createMocks({ method: 'GET' })
    await handler(req, res)

    const apiReqCall = infoSpy.mock.calls.find((c) =>
      String(c[0]).startsWith('API Request')
    )
    expect(apiReqCall).toBeDefined()
    expect((apiReqCall as any[])[1].user).toBe('a@b.com')
    infoSpy.mockRestore()
  })
})
