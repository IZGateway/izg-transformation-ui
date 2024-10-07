import axios from 'axios'
import https from 'https'

export async function updateData(id, data) {
  try {
    const response = await axios.put(`/api/pipelines/${id}`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return response.data
  } catch (error) {
    console.error('Error updating pipeline data:', error)
    throw error
  }
}
