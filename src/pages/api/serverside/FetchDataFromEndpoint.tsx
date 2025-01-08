import fs from 'fs'
import path from 'path'
import axios from 'axios'
import https from 'https'

const fetchDataFromEndpoint = async (endpoint : string, access_token : string) => {
  const XFORM_SERVICE_ENDPOINT_CRT_PATH =
    process.env.XFORM_SERVICE_ENDPOINT_CRT_PATH || ''
  const XFORM_SERVICE_ENDPOINT_KEY_PATH =
    process.env.XFORM_SERVICE_ENDPOINT_KEY_PATH || ''
  const XFORM_SERVICE_ENDPOINT_PASSCODE =
    process.env.XFORM_SERVICE_ENDPOINT_PASSCODE || ''
  const XFORM_SERVICE_ENDPOINT_USE_CERT : boolean = process.env.XFORM_SERVICE_ENDPOINT_USE_CERT === 'true'

  const httpsAgentOptions: https.AgentOptions = {
    rejectUnauthorized: false,
    keepAlive: true,
  }

  if (XFORM_SERVICE_ENDPOINT_USE_CERT) {
    httpsAgentOptions.cert = fs.readFileSync(
      path.resolve(XFORM_SERVICE_ENDPOINT_CRT_PATH),
      'utf-8'
    )

    httpsAgentOptions.key = fs.readFileSync(
      path.resolve(XFORM_SERVICE_ENDPOINT_KEY_PATH),
      'utf-8'
    )

    httpsAgentOptions.passphrase = XFORM_SERVICE_ENDPOINT_PASSCODE
  }

  try {
    const headers = XFORM_SERVICE_ENDPOINT_USE_CERT ? {} : { Authorization: `Bearer ${access_token}` }
    const response = await axios.get(endpoint, {
      httpsAgent: new https.Agent(httpsAgentOptions),
      headers,
      timeout: 30000,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
export default fetchDataFromEndpoint
