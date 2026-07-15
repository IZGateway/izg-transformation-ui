jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), request: jest.fn() },
}))
jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  getToken: jest.fn(),
}))

import axios from 'axios'
import { getToken } from 'next-auth/jwt'
import fetchDataFromEndpoint from '../FetchDataFromEndpoint'
import pushDataToEndpoint from '../PushDataToEndpoint'
import { isServiceUnavailableError } from '../../../../utility/serviceUnavailable'

const BEARER = 'Bearer eyJSECRET_ACCESS_TOKEN'

const makeAxiosError = (status: number, message: string) =>
  Object.assign(new Error(message), {
    name: 'AxiosError',
    code: 'ERR_BAD_RESPONSE',
    isAxiosError: true,
    config: {
      headers: { Authorization: BEARER },
      httpsAgent: { options: { key: 'PRIVATE_KEY_MATERIAL', passphrase: 'PASS' } },
    },
    request: {},
    response: { status, config: { headers: { Authorization: BEARER } } },
  })

const loggedContains = (spy: jest.SpyInstance, needle: string) =>
  spy.mock.calls.some((call) =>
    call.some((arg: unknown) => {
      if (arg instanceof Error) {
        const own: Record<string, unknown> = { message: arg.message, stack: arg.stack }
        for (const k of Object.getOwnPropertyNames(arg)) own[k] = (arg as any)[k]
        return JSON.stringify(own).includes(needle)
      }
      return JSON.stringify(arg ?? '').includes(needle)
    })
  )

describe('proxy helper error redaction (IGDD-3108)', () => {
  let errSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.XFORM_SERVICE_ENDPOINT_USE_CERT = 'false'
    process.env.XFORM_SERVICE_ENDPOINT_USE_JWT = 'true'
    ;(getToken as jest.Mock).mockResolvedValue({
      access_token: 'eyJSECRET_ACCESS_TOKEN',
      sub: '00usub',
    })
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => errSpy.mockRestore())

  describe('FetchDataFromEndpoint', () => {
    it('does not log the bearer token and throws a redacted error on a 404', async () => {
      ;(axios.get as jest.Mock).mockRejectedValue(
        makeAxiosError(404, 'Request failed with status code 404')
      )

      await expect(fetchDataFromEndpoint('https://svc/x', {})).rejects.toMatchObject({
        message: 'Request failed with status code 404',
      })

      expect(loggedContains(errSpy, 'Bearer')).toBe(false)
      expect(loggedContains(errSpy, 'PRIVATE_KEY_MATERIAL')).toBe(false)

      const thrown = await fetchDataFromEndpoint('https://svc/x', {}).catch((e) => e)
      expect((thrown as any).config).toBeUndefined()
      expect((thrown as any).response?.status).toBe(404)
    })

    it('still throws ServiceUnavailableError on 503, secret-free, preserving status', async () => {
      ;(axios.get as jest.Mock).mockRejectedValue(
        makeAxiosError(503, 'Request failed with status code 503')
      )
      const thrown = await fetchDataFromEndpoint('https://svc/x', {}).catch((e) => e)
      expect(isServiceUnavailableError(thrown)).toBe(true)
      expect((thrown as any).response?.status).toBe(503)
      expect((thrown as any).status).toBe(503)
      expect(loggedContains(errSpy, 'Bearer')).toBe(false)
    })
  })

  describe('PushDataToEndpoint', () => {
    it('does not log the bearer token and throws a redacted error on a 400', async () => {
      ;(axios.request as jest.Mock).mockRejectedValue(
        makeAxiosError(400, 'Request failed with status code 400')
      )

      const thrown = await pushDataToEndpoint('https://svc/x', {}, {}, 'POST').catch((e) => e)
      expect((thrown as any).config).toBeUndefined()
      expect((thrown as Error).message).toBe('Request failed with status code 400')
      expect(loggedContains(errSpy, 'Bearer')).toBe(false)
      expect(loggedContains(errSpy, 'PRIVATE_KEY_MATERIAL')).toBe(false)
    })

    it('still throws ServiceUnavailableError on 503, secret-free, preserving status', async () => {
      ;(axios.request as jest.Mock).mockRejectedValue(
        makeAxiosError(503, 'Request failed with status code 503')
      )
      const thrown = await pushDataToEndpoint('https://svc/x', {}, {}, 'POST').catch((e) => e)
      expect(isServiceUnavailableError(thrown)).toBe(true)
      expect((thrown as any).response?.status).toBe(503)
      expect((thrown as any).status).toBe(503)
      expect(loggedContains(errSpy, 'Bearer')).toBe(false)
    })
  })
})
