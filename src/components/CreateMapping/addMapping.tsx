import axios from 'axios'

export async function addMapping(data: any) {
  try {
    const response = await axios.post(`/api/mappings`, data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating mapping:', error)
    return {
      success: false,
      error: 'Failed to create mapping. Please try again.',
    }
  }
}
