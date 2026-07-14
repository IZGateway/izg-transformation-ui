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
import { withRequestContext } from './requestContext'
import { asyncRequestContext } from './Context'

const makeCtx = () =>
  ({
    req: { headers: { 'x-forwarded-for': '203.0.113.7' }, socket: {} },
    res: {},
  } as any)

describe('withRequestContext (IGDD-2223)', () => {
  beforeEach(() => jest.clearAllMocks())

  it('runs the handler inside a populated request context', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { name: 'Austin Moody', email: 'a@b.com' },
    })
    ;(getToken as jest.Mock).mockResolvedValue({
      sub: '00usub',
      sessionId: 'sess-1',
      jti: 'ID.jti1',
      authTime: 1782755733,
    })

    let seen: any
    const wrapped = withRequestContext(async () => {
      seen = asyncRequestContext.getStore()
      return { props: {} }
    })

    await wrapped(makeCtx())

    expect(seen).toMatchObject({
      userId: '00usub',
      email: 'a@b.com',
      name: 'Austin Moody',
      sessionId: 'sess-1',
      ipAddress: '203.0.113.7',
    })
  })

  it('does not fabricate identity when there is no session', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    ;(getToken as jest.Mock).mockResolvedValue(null)

    let seen: any
    const wrapped = withRequestContext(async () => {
      seen = asyncRequestContext.getStore()
      return { props: {} }
    })

    await wrapped(makeCtx())

    expect(seen.userId).toBeUndefined()
    expect(seen.email).toBeUndefined()
    expect(seen.sessionId).toBeUndefined()
  })
})
