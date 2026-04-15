import { createMocks } from 'node-mocks-http'
import handler from '../index'

jest.mock('../../serverside/FetchDataFromEndpoint', () => jest.fn())
jest.mock('../../serverside/PushDataToEndpoint', () => jest.fn())

import fetchDataFromEndpoint from '../../serverside/FetchDataFromEndpoint'
import pushDataToEndpoint from '../../serverside/PushDataToEndpoint'

describe('/api/mappings (index)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.XFORM_SERVICE_ENDPOINT = 'https://test.xform.example.com'
  })

  describe('GET', () => {
    it('returns 200 with mappings data', async () => {
      const mockData = [{ id: 'map-1', code: 'J07BB02' }]
      ;(fetchDataFromEndpoint as jest.Mock).mockResolvedValue(mockData)

      const { req, res } = createMocks({ method: 'GET' })
      await handler(req, res)

      expect(fetchDataFromEndpoint).toHaveBeenCalledWith(
        'https://test.xform.example.com/api/v1/mappings?limit=1000',
        req
      )
      expect(res._getStatusCode()).toBe(200)
      expect(res._getJSONData()).toEqual(mockData)
    })

    it('returns 500 when fetch throws', async () => {
      ;(fetchDataFromEndpoint as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { req, res } = createMocks({ method: 'GET' })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(res._getJSONData()).toMatchObject({
        message: 'Error fetching mappings',
      })
    })
  })

  describe('POST', () => {
    it('returns 201 with created mapping', async () => {
      const newMapping = { code: 'NEW', codeSystem: 'SNOMED-CT' }
      const created = { id: 'map-new', ...newMapping }
      ;(pushDataToEndpoint as jest.Mock).mockResolvedValue(created)

      const { req, res } = createMocks({
        method: 'POST',
        body: newMapping,
      })
      await handler(req, res)

      expect(pushDataToEndpoint).toHaveBeenCalledWith(
        'https://test.xform.example.com/api/v1/mappings',
        newMapping,
        req,
        'POST'
      )
      expect(res._getStatusCode()).toBe(201)
      expect(res._getJSONData()).toEqual(created)
    })

    it('returns 500 when push throws', async () => {
      ;(pushDataToEndpoint as jest.Mock).mockRejectedValue(
        new Error('Server error')
      )

      const { req, res } = createMocks({ method: 'POST', body: {} })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(res._getJSONData()).toMatchObject({
        message: 'Error creating mapping',
      })
    })
  })

  describe('unsupported methods', () => {
    it('returns 405 for DELETE', async () => {
      const { req, res } = createMocks({ method: 'DELETE' })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
    })
  })
})
