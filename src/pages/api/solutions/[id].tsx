import type { NextApiRequest, NextApiResponse } from 'next'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const data = req.body

  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  console.log('reqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
  console.log(req)
  console.log(XFORM_SERVICE_ENDPOINT)
  setTimeout(async () => {
    try {
      const updatedPipeData = await pushDataToEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions/${id}`,
        data,
        req
      )
      res.status(200).json(updatedPipeData)
    } catch (error) {
      console.error('Error updating data:', error)
      res
        .status(500)
        .json({ message: 'Error updating data', error: error.message })
    }
  }, 400)
}

export default handler
