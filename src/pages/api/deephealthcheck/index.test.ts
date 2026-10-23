/**
 * IGDD-3178: /api/deephealthcheck is exempt from both the `withAuth` matcher and
 * DPoP verification in src/middleware.ts, so the full per-component result —
 * upstream error messages, the Okta issuer, and the internal address behind
 * XFORM_SERVICE_HEALTHCHECK_URL — was reaching unauthenticated callers.
 */
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

const mockAxiosGet = jest.fn()
jest.mock('axios', () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}))

jest.mock('fs', () => ({ readFileSync: jest.fn(() => 'pem-bytes') }))

import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import handler from './index'

/**
 * Stand-in addresses, not real ones. This repo is public, so the actual ALB DNS
 * name and Okta issuer do not belong in a committed test — least of all one
 * asserting that we stop disclosing them.
 *
 * The `.example` TLD is reserved by RFC 2606 and can never be delegated, so if a
 * mock is ever dropped the request fails loudly against an unresolvable name
 * instead of quietly reaching a real dependency.
 */
const XFORM_URL = 'https://xform-service.izg.example:444/health'
const OKTA_ISSUER = 'https://okta.izg.example'

/**
 * `buildRequestContext` skips session resolution entirely when there is no cookie
 * header, so an authenticated case must send one or it silently resolves to no
 * session at all.
 */
const buildReqRes = (opts: { cookie?: boolean } = {}) =>
  createMocks({
    method: 'GET',
    url: '/api/deephealthcheck',
    headers: opts.cookie
      ? { cookie: '__Secure-next-auth.session-token=stub' }
      : {},
  })

describe('GET /api/deephealthcheck disclosure by caller (IGDD-3178)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getToken as jest.Mock).mockResolvedValue({ sub: '00usub' })

    process.env.XFORM_SERVICE_HEALTHCHECK_URL = XFORM_URL
    process.env.XFORM_SERVICE_ENDPOINT_CRT_PATH = '/certs/console.crt'
    process.env.XFORM_SERVICE_ENDPOINT_KEY_PATH = '/certs/console.key'
    process.env.NEXT_PUBLIC_OKTA_ISSUER = OKTA_ISSUER
    process.env.OKTA_ISSUER_PATH = '/oauth2/default'

    mockAxiosGet.mockResolvedValue({
      data: {
        healthy: true,
        statusAt: '2026-10-19T18:31:18.819+0000',
        lastChangeReason: 'Normal application startup',
      },
    })
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ issuer: OKTA_ISSUER }),
    }) as never
  })

  const anonymous = () =>
    (getServerSession as jest.Mock).mockResolvedValue(null)

  /** Holds the `admin` role — the only caller entitled to the full result. */
  const admin = () =>
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'ops@example.com', roles: ['admin'], isAdmin: true },
    })

  /**
   * Signed in but without the `admin` role. Anyone who completes the Okta flow
   * lands here, including a user holding no Xform roles at all.
   */
  const signedInNonAdmin = (roles: string[] = []) =>
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'viewer@example.com', roles, isAdmin: false },
    })

  /**
   * The guard that matters: an exact key set, so a field added to either probe
   * later fails this test rather than reaching anonymous callers unnoticed.
   */
  it('discloses only component, status and statusAt to an unauthenticated caller', async () => {
    anonymous()
    const { req, res } = buildReqRes()

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const body = res._getJSONData()
    expect(body).toHaveLength(2)
    for (const component of body) {
      expect(Object.keys(component).sort()).toEqual([
        'component',
        'status',
        'statusAt',
      ])
    }
  })

  it('discloses no dependency address or upstream detail to an unauthenticated caller', async () => {
    anonymous()
    const { req, res } = buildReqRes()

    await handler(req, res)

    const serialized = JSON.stringify(res._getJSONData())
    for (const secret of [
      'xform-service.izg.example',
      'okta.izg.example',
      // Not ours, but still a literal in the handler that must not reach an
      // anonymous caller.
      'status.okta.com',
      'Normal application startup',
      '/certs/',
    ]) {
      expect(serialized).not.toContain(secret)
    }
  })

  it('still reports liveness per component to an unauthenticated caller', async () => {
    anonymous()
    const { req, res } = buildReqRes()

    await handler(req, res)

    const body = res._getJSONData()
    expect(body.map((c: { component: string }) => c.component)).toEqual([
      'OKTA',
      'XFORMSERVICE',
    ])
    expect(
      body.every((c: { status: string }) => c.status === 'connected')
    ).toBe(true)
  })

  it('gives a caller holding the admin role the full result', async () => {
    admin()
    const { req, res } = buildReqRes({ cookie: true })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const serialized = JSON.stringify(res._getJSONData())
    expect(serialized).toContain(XFORM_URL)
    expect(serialized).toContain('Normal application startup')
    expect(serialized).toContain('status.okta.com')
  })

  /**
   * The reason the gate is `isAdmin` and not merely `session.user`: authenticating
   * to the console is not by itself a claim to see where its dependencies live.
   */
  it('withholds detail from a signed-in caller without the admin role', async () => {
    signedInNonAdmin()
    const { req, res } = buildReqRes({ cookie: true })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const body = res._getJSONData()
    for (const component of body) {
      expect(Object.keys(component).sort()).toEqual([
        'component',
        'status',
        'statusAt',
      ])
    }
    expect(JSON.stringify(body)).not.toContain('izg.example')
  })

  it('withholds detail from a signed-in caller holding a non-admin role', async () => {
    signedInNonAdmin(['pipeline-reader'])
    const { req, res } = buildReqRes({ cookie: true })

    await handler(req, res)

    const body = res._getJSONData()
    expect(JSON.stringify(body)).not.toContain('izg.example')
    expect(Object.keys(body[0]).sort()).toEqual([
      'component',
      'status',
      'statusAt',
    ])
  })

  /**
   * A failing dependency is where the disclosure is worst — `reason` carries the
   * upstream error message verbatim.
   */
  it('withholds the upstream error message when a dependency is unreachable', async () => {
    anonymous()
    mockAxiosGet.mockRejectedValue(
      new Error('connect ECONNREFUSED 10.0.4.17:444')
    )
    const { req, res } = buildReqRes()

    await handler(req, res)

    const body = res._getJSONData()
    const xform = body.find(
      (c: { component: string }) => c.component === 'XFORMSERVICE'
    )
    expect(xform).toEqual({
      component: 'XFORMSERVICE',
      status: 'unable to connect',
      statusAt: expect.any(String),
    })
    expect(JSON.stringify(body)).not.toContain('10.0.4.17')
  })

  it('reports the upstream error message to a caller holding the admin role', async () => {
    admin()
    mockAxiosGet.mockRejectedValue(
      new Error('connect ECONNREFUSED 10.0.4.17:444')
    )
    const { req, res } = buildReqRes({ cookie: true })

    await handler(req, res)

    expect(JSON.stringify(res._getJSONData())).toContain(
      'ECONNREFUSED 10.0.4.17'
    )
  })

  /** The load balancer acts on the status code, so it must not vary by caller. */
  it('returns the same status code either way', async () => {
    anonymous()
    const anon = buildReqRes()
    await handler(anon.req, anon.res)

    admin()
    const auth = buildReqRes({ cookie: true })
    await handler(auth.req, auth.res)

    expect(anon.res._getStatusCode()).toBe(auth.res._getStatusCode())
  })
})
