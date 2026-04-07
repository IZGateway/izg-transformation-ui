import axios from 'axios'
import https from 'https'

export async function updateMapping(id: string, data: any) {
  try {
    const response = await axios.put(`/api/mappings/${id}`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating mapping data:', error)
    return {
      success: false,
      error: 'Failed to update mapping data. Please try again.',
    }
  }
}
