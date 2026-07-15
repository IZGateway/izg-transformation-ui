// Mock next-auth so importing authOptions (which runs NextAuth(...) and the
// Okta provider factory at module load) is side-effect free.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}))
jest.mock('next-auth/providers/okta', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}))

import { authOptions } from './[...nextauth]'
import logger from '../../../../logger'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const b64url = (obj: unknown) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const ID_TOKEN = `header.${b64url({
  auth_time: 1782755733,
  jti: 'ID.jti1',
  groups: ['IZG Operations'],
})}.signature`

const jwt = (authOptions as any).callbacks.jwt as (params: any) => Promise<any>

const baseToken = { sub: '00usub', name: 'Austin Moody', email: 'a@b.com' }
const account = { id_token: ID_TOKEN } // no access_token → skips Okta userinfo fetch

describe('jwt callback audit identity (IGDD-2223)', () => {
  let infoSpy: jest.SpyInstance

  beforeEach(() => {
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => logger)
  })
  afterEach(() => infoSpy.mockRestore())

  it('generates a sessionId and captures jti/authTime from the id_token', async () => {
    const result = await jwt({ token: { ...baseToken }, account, user: {} })

    expect(result.sessionId).toMatch(UUID_RE)
    expect(result.authTime).toBe(1782755733)
    // Persisted under oktaJti, not the reserved `jti` (which NextAuth's encode
    // overwrites with its own UUID on the session cookie).
    expect(result.oktaJti).toBe('ID.jti1')
  })

  it('logs exactly one Session established record with groups + roles', async () => {
    const result = await jwt({ token: { ...baseToken }, account, user: {} })

    const calls = infoSpy.mock.calls.filter((c) => c[0] === 'Session established')
    expect(calls).toHaveLength(1)

    const payload = calls[0][1]
    expect(payload.sessionUser.sessionId).toBe(result.sessionId)
    expect(payload.sessionUser.userId).toBe('00usub')
    expect(payload.sessionUser.jti).toBe('ID.jti1')
    expect(Array.isArray(payload.groups)).toBe(true)
    expect(payload.groups).toContain('IZG Operations')
    expect(Array.isArray(payload.roles)).toBe(true)
  })

  it('keeps the same sessionId on subsequent (no-account) calls in a login', async () => {
    const first = await jwt({ token: { ...baseToken }, account, user: {} })
    const next = await jwt({ token: first })
    expect(next.sessionId).toBe(first.sessionId)
  })

  it('produces a new sessionId on a new login', async () => {
    const login1 = await jwt({ token: { ...baseToken }, account, user: {} })
    const login2 = await jwt({ token: { ...baseToken }, account, user: {} })
    expect(login2.sessionId).not.toBe(login1.sessionId)
  })

  it('never logs raw token material', async () => {
    await jwt({ token: { ...baseToken }, account, user: {} })
    const logged = JSON.stringify(infoSpy.mock.calls)
    expect(logged).not.toContain(ID_TOKEN)
  })
})
