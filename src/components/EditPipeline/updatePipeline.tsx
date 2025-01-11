import axios from 'axios'
import https from 'https'

export async function updateData(id: string, data: any) {
  try {
    const response = await axios.put(`/api/pipelines/${id}`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating pipeline data:', error)
    return {
      success: false,
      error: 'Failed to update pipeline data. Please try again.',
    }
  }
}
