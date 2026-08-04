import type { NextApiRequest, NextApiResponse } from 'next'
import fetchDataFromEndpoint from '../../serverside/FetchDataFromEndpoint'
import withMiddleware from '../../api-middleware-helper'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.XFORM_SERVICE_ENDPOINT || ''

  if (req.method === 'GET') {
    try {
      const data = await fetchDataFromEndpoint(
        `${baseUrl}/api/v1/preconditions/fields`,
        req
      )
      res.status(200).json(data)
    } catch (error) {
      console.error('Failed to fetch precondition fields:', error)
      res.status(500).json({ error: 'Failed to fetch precondition fields' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default withMiddleware('logRequest')(handler)
