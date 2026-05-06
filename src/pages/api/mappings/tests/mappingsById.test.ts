import { createMocks } from 'node-mocks-http'
import handler from '../[id]'

jest.mock('../../serverside/FetchDataFromEndpoint', () => jest.fn())
jest.mock('../../serverside/PushDataToEndpoint', () => jest.fn())

import fetchDataFromEndpoint from '../../serverside/FetchDataFromEndpoint'
import pushDataToEndpoint from '../../serverside/PushDataToEndpoint'

describe('/api/mappings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.XFORM_SERVICE_ENDPOINT = 'https://test.xform.example.com'
  })

  describe('GET', () => {
    it('returns 200 with the mapping', async () => {
      const mockMapping = { id: 'map-001', code: 'J07BB02' }
      ;(fetchDataFromEndpoint as jest.Mock).mockResolvedValue(mockMapping)

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'map-001' },
      })
      await handler(req, res)

      expect(fetchDataFromEndpoint).toHaveBeenCalledWith(
        'https://test.xform.example.com/api/v1/mappings/map-001',
        req
      )
      expect(res._getStatusCode()).toBe(200)
      expect(res._getJSONData()).toEqual(mockMapping)
    })

    it('returns 500 when fetch throws', async () => {
      ;(fetchDataFromEndpoint as jest.Mock).mockRejectedValue(new Error('fail'))

      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'map-001' },
      })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(res._getJSONData()).toMatchObject({
        message: 'Error fetching mapping',
      })
    })
  })

  describe('PUT', () => {
    it('returns 200 with updated mapping', async () => {
      const update = { code: 'UPDATED', codeSystem: 'CVX' }
      const updated = { id: 'map-001', ...update }
      ;(pushDataToEndpoint as jest.Mock).mockResolvedValue(updated)

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'map-001' },
        body: update,
      })
      await handler(req, res)

      expect(pushDataToEndpoint).toHaveBeenCalledWith(
        'https://test.xform.example.com/api/v1/mappings/map-001',
        update,
        req,
        'PUT'
      )
      expect(res._getStatusCode()).toBe(200)
      expect(res._getJSONData()).toEqual(updated)
    })

    it('returns 500 when put throws', async () => {
      ;(pushDataToEndpoint as jest.Mock).mockRejectedValue(new Error('fail'))

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'map-001' },
        body: {},
      })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(res._getJSONData()).toMatchObject({
        message: 'Error updating mapping',
      })
    })
  })

  describe('DELETE', () => {
    it('returns 204 on successful delete', async () => {
      ;(pushDataToEndpoint as jest.Mock).mockResolvedValue({})

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'map-001' },
      })
      await handler(req, res)

      expect(pushDataToEndpoint).toHaveBeenCalledWith(
        'https://test.xform.example.com/api/v1/mappings/map-001',
        {},
        req,
        'DELETE'
      )
      expect(res._getStatusCode()).toBe(204)
    })

    it('returns 500 when delete throws', async () => {
      ;(pushDataToEndpoint as jest.Mock).mockRejectedValue(new Error('fail'))

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'map-001' },
      })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(res._getJSONData()).toMatchObject({
        message: 'Error deleting mapping',
      })
    })
  })

  describe('unsupported methods', () => {
    it('returns 405 for PATCH', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'map-001' },
      })
      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
    })
  })
})
