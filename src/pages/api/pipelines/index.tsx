import type { NextApiRequest, NextApiResponse } from 'next'
import pushDataToEndpoint from '../serverside/PushDataToEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const data = req.body
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''

  try {
    const createdPipeline = await pushDataToEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines`,
      data,
      req,
      'POST'
    )
    res.status(201).json(createdPipeline)
  } catch (error: any) {
    const backendStatus =
      error?.response?.status && typeof error.response.status === 'number'
        ? error.response.status
        : 500
    const backendMessage =
      error?.response?.data?.message || error?.response?.data || error.message
    console.error(
      'Error creating pipeline:',
      backendMessage,
      error?.response?.data
    )
    res
      .status(backendStatus)
      .json({ message: 'Error creating pipeline', error: backendMessage })
  }
}

export default handler
