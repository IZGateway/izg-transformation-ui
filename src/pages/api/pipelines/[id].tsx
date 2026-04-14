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

  if (req.method === 'GET') {
    try {
      const pipelineData = await fetchDataFromEndpoint(
        `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines/${id}`,
        req
      )
      return res.status(200).json(pipelineData)
    } catch (error: any) {
      const backendStatus =
        error?.response?.status && typeof error.response.status === 'number'
          ? error.response.status
          : 500
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Unknown error'
      console.error(
        'Error fetching pipeline:',
        backendMessage,
        error?.response?.data
      )
      return res
        .status(backendStatus)
        .json({ message: 'Error fetching pipeline', error: backendMessage })
    }
  }

  try {
    const updatedPipeData = await pushDataToEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines/${id}`,
      data,
      req,
      'PUT'
    )
    return res.status(200).json(updatedPipeData)
  } catch (error: any) {
    const backendStatus =
      error?.response?.status && typeof error.response.status === 'number'
        ? error.response.status
        : 500
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      'Unknown error'
    console.error(
      'Error updating pipeline:',
      backendMessage,
      error?.response?.data
    )
    return res
      .status(backendStatus)
      .json({ message: 'Error updating data', error: backendMessage })
  }
}

export default handler
