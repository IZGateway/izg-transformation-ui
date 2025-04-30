import type { NextApiRequest, NextApiResponse } from 'next'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const data = req.body
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''

  setTimeout(async () => {
    try {
      const createdSolution = await pushDataToEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions`,
        data,
        req,
        'POST'
      )
      res.status(201).json(createdSolution)
    } catch (error) {
      console.error('Error creating solution:', error)
      res
        .status(500)
        .json({ message: 'Error creating solution', error: error.message })
    }
  }, 400)
}

export default handler
