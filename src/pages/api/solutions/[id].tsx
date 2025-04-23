import type { NextApiRequest, NextApiResponse } from 'next'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'
import fetchDataFromEndpoint from '../serverside/FetchDataFromEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const data = req.body

  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  if (req.method === 'PUT') {
    setTimeout(async () => {
      try {
        const updatedSolutionData = await pushDataToEndpoint(
          `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions/${id}`,
          data,
          req,
          'PUT'
        )
        res.status(200).json(updatedSolutionData)
      } catch (error) {
        console.error('Error updating solution:', error)
        res
          .status(500)
          .json({ message: 'Error updating solution', error: error.message })
      }
    }, 400)
  } else if (req.method === 'GET') {
    setTimeout(async () => {
      try {
        const getSolution = await fetchDataFromEndpoint(
          `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions/${id}`,
          req
        )
        res.status(200).json(getSolution)
      } catch (error) {
        console.error('Error getting solution:', error)
        res
          .status(500)
          .json({ message: 'Error getting solution', error: error.message })
      }
    }, 400)
  }
}

export default handler
