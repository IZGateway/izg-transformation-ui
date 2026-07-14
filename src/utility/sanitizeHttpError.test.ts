import { redactHttpError } from './sanitizeHttpError'
import {
  ServiceUnavailableError,
  isServiceUnavailableError,
} from './serviceUnavailable'

const makeAxiosError = (status: number, message: string) =>
  Object.assign(new Error(message), {
    name: 'AxiosError',
    code: 'ERR_BAD_RESPONSE',
    isAxiosError: true,
    config: {
      headers: { Authorization: 'Bearer eyJSECRET_ACCESS_TOKEN' },
      httpsAgent: {
        options: {
          cert: 'CERT_MATERIAL',
          key: 'PRIVATE_KEY_MATERIAL',
          passphrase: 'PASSPHRASE_SECRET',
        },
      },
    },
    request: { some: 'thing' },
    response: {
      status,
      data: { message: 'Pipeline name already exists' },
      config: { headers: { Authorization: 'Bearer eyJSECRET_ACCESS_TOKEN' } },
    },
  })

// Everything a redacted error must never expose.
const SECRETS = [
  'Bearer',
  'Authorization',
  'eyJSECRET_ACCESS_TOKEN',
  'CERT_MATERIAL',
  'PRIVATE_KEY_MATERIAL',
  'PASSPHRASE_SECRET',
]

const dumpAllProps = (err: unknown) => {
  if (!(err instanceof Error)) return JSON.stringify(err)
  const own: Record<string, unknown> = { message: err.message, stack: err.stack }
  for (const k of Object.getOwnPropertyNames(err)) own[k] = (err as any)[k]
  return JSON.stringify(own)
}

describe('redactHttpError (IGDD-3108)', () => {
  it('strips config/request/response.config and all credential material', () => {
    const redacted = redactHttpError(makeAxiosError(404, 'Request failed with status code 404'))

    expect((redacted as any).config).toBeUndefined()
    expect((redacted as any).request).toBeUndefined()
    expect((redacted as any).response?.config).toBeUndefined()

    const dump = dumpAllProps(redacted)
    for (const secret of SECRETS) {
      expect(dump).not.toContain(secret)
    }
  })

  it('retains safe diagnostics (message, code, status)', () => {
    const redacted = redactHttpError(makeAxiosError(404, 'Request failed with status code 404'))

    expect(redacted).toBeInstanceOf(Error)
    expect(redacted.message).toBe('Request failed with status code 404')
    expect(redacted.code).toBe('ERR_BAD_RESPONSE')
    expect(redacted.status).toBe(404)
    expect(redacted.response?.status).toBe(404)
  })

  it('preserves response.data (backend error body) while dropping response.config', () => {
    const redacted = redactHttpError(makeAxiosError(400, 'Request failed with status code 400'))

    // downstream API routes read error.response.data.message for user-facing errors
    expect(redacted.response?.data).toEqual({ message: 'Pipeline name already exists' })
    expect((redacted.response as any)?.config).toBeUndefined()
  })

  it('preserves service-unavailable detection for 503', () => {
    const redacted = redactHttpError(makeAxiosError(503, 'Request failed with status code 503'))
    expect(isServiceUnavailableError(redacted)).toBe(true)
  })

  it('leaves a ServiceUnavailableError detectable and secret-free', () => {
    const redacted = redactHttpError(new ServiceUnavailableError('boom'))
    expect(isServiceUnavailableError(redacted)).toBe(true)
    expect(dumpAllProps(redacted)).not.toContain('Bearer')
  })

  it('handles non-Error input without leaking', () => {
    expect(redactHttpError('plain string').message).toBe('plain string')
    expect(redactHttpError(undefined).message).toBe('Unknown error')
  })
})
