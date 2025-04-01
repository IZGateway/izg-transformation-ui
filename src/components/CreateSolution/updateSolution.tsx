import axios from 'axios'
import https from 'https'

export async function updateSolution(id: string, data: any) {
  try {
    console.log(data)
    const response = await axios.put(`/api/solutions/${id}`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error updating solution data:', error)
    return {
      success: false,
      error: 'Failed to update solution data. Please try again.',
    }
  }
}
