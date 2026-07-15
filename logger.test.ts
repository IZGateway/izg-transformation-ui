import winston from 'winston'
import ecsFormat from '@elastic/ecs-winston-format'
import { sessionUserFormat } from './logger'
import { asyncRequestContext } from './src/lib/Context'

// Mirror the production format chain (sessionUser injected BEFORE ecs
// serialization) so we assert against the actual serialized output.
const format = winston.format.combine(
  sessionUserFormat(),
  ecsFormat({ convertReqRes: true, apmIntegration: false })
)

const serialize = (message: string) => {
  const info = format.transform({ level: 'info', message }) as any
  return JSON.parse(info[Symbol.for('message')])
}

describe('logger sessionUser injection (IGDD-2223)', () => {
  it('adds sessionUser to the serialized output when a request context is present', () => {
    asyncRequestContext.run(
      {
        name: 'Austin Moody',
        userId: '00usub',
        email: 'a@b.com',
        sessionId: 'sess-1',
        jti: 'ID.jti1',
        authTime: 1782755733,
        ipAddress: '::1',
      },
      () => {
        const parsed = serialize('hello')
        expect(parsed.sessionUser).toEqual({
          name: 'Austin Moody',
          userId: '00usub',
          email: 'a@b.com',
          sessionId: 'sess-1',
          jti: 'ID.jti1',
          authTime: 1782755733,
          ip: '::1',
        })
      }
    )
  })

  it('omits sessionUser and does not throw when there is no request context', () => {
    let parsed: any
    expect(() => {
      parsed = serialize('startup line')
    }).not.toThrow()
    expect(parsed.sessionUser).toBeUndefined()
  })

  it('does not fabricate identity for an empty (unauthenticated) context', () => {
    asyncRequestContext.run({ ipAddress: '::1' }, () => {
      const parsed = serialize('unauthenticated')
      expect(parsed.sessionUser).toBeUndefined()
    })
  })
})
