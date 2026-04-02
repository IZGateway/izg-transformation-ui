import type { NextApiRequest, NextApiResponse } from 'next'
import fetchDataFromEndpoint from '../serverside/FetchDataFromEndpoint'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''

  try {
    const organizationsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=1000`,
      req
    )
    // The xform service returns { data: [...], ... } — unwrap to an array
    const orgs = Array.isArray(organizationsData)
      ? organizationsData
      : organizationsData?.data ?? []
    res.status(200).json(orgs)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    res
      .status(500)
      .json({ message: 'Error fetching organizations', error: error.message })
  }
}

export default handler
