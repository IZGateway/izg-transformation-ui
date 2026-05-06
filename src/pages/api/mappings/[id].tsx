import type { NextApiRequest, NextApiResponse } from 'next'
import fetchDataFromEndpoint from '../serverside/FetchDataFromEndpoint'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''

  if (req.method === 'GET') {
    try {
      const mappingData = await fetchDataFromEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings/${id}`,
        req
      )
      res.status(200).json(mappingData)
    } catch (error) {
      console.error('Error fetching mapping:', error)
      res
        .status(500)
        .json({ message: 'Error fetching mapping', error: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedMapping = await pushDataToEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings/${id}`,
        req.body,
        req,
        'PUT'
      )
      res.status(200).json(updatedMapping)
    } catch (error) {
      console.error('Error updating mapping:', error)
      res
        .status(500)
        .json({ message: 'Error updating mapping', error: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      await pushDataToEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings/${id}`,
        {},
        req,
        'DELETE'
      )
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting mapping:', error)
      res
        .status(500)
        .json({ message: 'Error deleting mapping', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default handler
