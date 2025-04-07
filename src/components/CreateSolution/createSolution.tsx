import axios from 'axios'
import https from 'https'

export async function createSolution(data: any) {
  try {
    const response = await axios.post(`/api/solutions`, data, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating solution:', error)
    return {
      success: false,
      error: 'Failed to create solution. Please try again.',
    }
  }
}
