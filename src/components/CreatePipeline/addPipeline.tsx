import axios from 'axios'
import type { PipeData } from '../../contexts/EditPipeline/pipelineDataContext'

export type CreatePipelinePayload = {
  pipelineName: string
  organizationId: string
  description: string | null
  inboundEndpoint: string
  outboundEndpoint: string
  active: boolean
  pipes: PipeData[]
}

export async function addPipeline(data: CreatePipelinePayload) {
  try {
    const response = await axios.post(`/api/pipelines`, data)
    return { success: true, data: response.data }
  } catch (error: any) {
    const status = error?.response?.status
    const backendError =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.response?.data ||
      null
    console.error(
      'Error creating pipeline (status',
      status,
      '):',
      backendError ?? error
    )
    const errorMessage =
      typeof backendError === 'string' && backendError
        ? backendError
        : 'Failed to create pipeline. Please try again.'
    return { success: false, error: errorMessage }
  }
}
