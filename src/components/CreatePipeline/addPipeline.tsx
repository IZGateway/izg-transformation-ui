import axios from 'axios'

export type CreatePipelinePayload = {
  pipelineName: string
  organizationId: string
  description: string | null
  inboundEndpoint: string
  outboundEndpoint: string
  active: boolean
  pipes: object[]
}

export async function addPipeline(data: CreatePipelinePayload) {
  try {
    const response = await axios.post(`/api/pipelines`, data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error creating pipeline:', error)
    return {
      success: false,
      error: 'Failed to create pipeline. Please try again.',
    }
  }
}
