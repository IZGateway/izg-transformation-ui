import fs from 'fs'
import path from 'path'
import axios from 'axios'
import https from 'https'

const fetchDataFromEndpoint = async (endpoint) => {
  const XFORM_SERVICE_ENDPOINT_CRT_PATH =
    process.env.XFORM_SERVICE_ENDPOINT_CRT_PATH || ''
  const XFORM_SERVICE_ENDPOINT_KEY_PATH =
    process.env.XFORM_SERVICE_ENDPOINT_KEY_PATH || ''
  const XFORM_SERVICE_ENDPOINT_PASSCODE =
    process.env.XFORM_SERVICE_ENDPOINT_PASSCODE || ''
  const httpsAgentOptions = {
    cert: fs.readFileSync(
      path.resolve(XFORM_SERVICE_ENDPOINT_CRT_PATH),
      'utf-8'
    ),
    key: fs.readFileSync(
      path.resolve(XFORM_SERVICE_ENDPOINT_KEY_PATH),
      'utf-8'
    ),
    passphrase: XFORM_SERVICE_ENDPOINT_PASSCODE,
    rejectUnauthorized: false,
    keepAlive: true,
  }
  try {
    const response = await axios.get(endpoint, {
      httpsAgent: new https.Agent(httpsAgentOptions),
      timeout: 30000,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
export default fetchDataFromEndpoint
