import axios from 'axios'
import { addPipeline, CreatePipelinePayload } from '../addPipeline'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockPayload: CreatePipelinePayload = {
  pipelineName: 'Test Pipeline',
  organizationId: 'org-1',
  description: 'A test pipeline',
  inboundEndpoint: 'izgts:IISHubService',
  outboundEndpoint: 'izghub:IISHubService',
  active: false,
  pipes: [],
}

describe('addPipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success and data when the API call succeeds', async () => {
    const mockResponse = { data: { id: 'abc123', ...mockPayload } }
    mockedAxios.post.mockResolvedValue(mockResponse)

    const result = await addPipeline(mockPayload)

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/pipelines', mockPayload)
    expect(result).toEqual({ success: true, data: mockResponse.data })
  })

  it('sends active:true when creating an active pipeline', async () => {
    const activePayload = { ...mockPayload, active: true }
    mockedAxios.post.mockResolvedValue({ data: activePayload })

    await addPipeline(activePayload)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/pipelines',
      expect.objectContaining({ active: true })
    )
  })

  it('sends description as null when no description provided', async () => {
    const noDescPayload = { ...mockPayload, description: null }
    mockedAxios.post.mockResolvedValue({ data: noDescPayload })

    await addPipeline(noDescPayload)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/pipelines',
      expect.objectContaining({ description: null })
    )
  })

  it('returns error object when the API call fails', async () => {
    const mockError = new Error('Network Error')
    mockedAxios.post.mockRejectedValue(mockError)
    console.error = jest.fn()

    const result = await addPipeline(mockPayload)

    expect(result).toEqual({
      success: false,
      error: 'Failed to create pipeline. Please try again.',
    })
    expect(console.error).toHaveBeenCalledWith(
      'Error creating pipeline:',
      mockError
    )
  })
})
