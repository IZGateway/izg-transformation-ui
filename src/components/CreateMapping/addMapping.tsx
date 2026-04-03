import axios from 'axios'
import https from 'https'

export async function addMapping(data: any) {
  try {
    const response = await axios.post(`/api/mappings`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating mapping:', error)
    return {
      success: false,
      error: 'Failed to create mapping. Please try again.',
    }
  }
}
