import axios from 'axios'
import { updateData } from '../updatePipeline'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('updateData', () => {
  const mockId = '123'
  const mockData = { name: 'Test Pipeline', description: 'Test Description' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully update pipeline data', async () => {
    const mockResponse = { data: { ...mockData, id: mockId } }
    mockedAxios.put.mockResolvedValue(mockResponse)

    const result = await updateData(mockId, mockData)

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `/api/pipelines/${mockId}`,
      mockData,
      expect.objectContaining({
        httpsAgent: expect.any(Object),
      })
    )
    expect(result).toEqual({
      success: true,
      data: mockResponse.data,
    })
  })

  it('should return an error object when the API call fails', async () => {
    const mockError = new Error('API Error')
    mockedAxios.put.mockRejectedValue(mockError)
    console.error = jest.fn()

    const result = await updateData(mockId, mockData)

    expect(mockedAxios.put).toHaveBeenCalled()
    expect(result).toEqual({
      success: false,
      error: 'Failed to update pipeline data. Please try again.',
    })
    expect(console.error).toHaveBeenCalledWith(
      'Error updating pipeline data:',
      mockError
    )
  })
})
