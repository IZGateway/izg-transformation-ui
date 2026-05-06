import type { NextApiRequest, NextApiResponse } from 'next'
import fetchDataFromEndpoint from '../serverside/FetchDataFromEndpoint'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''

  if (req.method === 'GET') {
    try {
      const mappingsData = await fetchDataFromEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings?limit=1000`,
        req
      )
      res.status(200).json(mappingsData)
    } catch (error) {
      console.error('Error fetching mappings:', error)
      res
        .status(500)
        .json({ message: 'Error fetching mappings', error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const createdMapping = await pushDataToEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings`,
        req.body,
        req,
        'POST'
      )
      res.status(201).json(createdMapping)
    } catch (error) {
      console.error('Error creating mapping:', error)
      res
        .status(500)
        .json({ message: 'Error creating mapping', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default handler
