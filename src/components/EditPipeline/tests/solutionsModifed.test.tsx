import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionsModified from '../solutionsModifed'
import * as ReorderContext from '../../../contexts/EditPipeline/reorderContext'
import * as UpdatePipeDataContext from '../../../contexts/EditPipeline/updatePipeDataContext'

// Add mock context values
const mockPipeData = [
  {
    id: '1',
    solutionId: 'solution1',
    solutionVersion: '1.0',
    preconditions: [
      {
        id: 'precond1',
        name: 'Precondition 1',
        method: 'equals',
        dataPath: '/MSH-9-1',
        comparisonValue: 'VXU',
      },
    ],
  },
  {
    id: '2',
    solutionId: 'solution2',
    solutionVersion: '2.0',
    preconditions: [
      {
        id: 'precond2',
        name: 'Precondition 2',
        method: 'equals',
        dataPath: '/MSH-9-1',
        comparisonValue: 'VXU',
      },
    ],
  },
]
const mockModifiedPipeData = [
  {
    id: '2',
    solutionId: 'solution2',
    solutionVersion: '2.0',
    preconditions: [
      {
        id: 'precond2',
        name: 'Precondition 2',
        method: 'equals',
        dataPath: '/MSH-9-1',
        comparisonValue: 'VXU',
      },
    ],
  },
  {
    id: '1',
    solutionId: 'solution1',
    solutionVersion: '1.0',
    preconditions: [
      {
        id: 'precond1',
        name: 'Precondition 1',
        method: 'equals',
        dataPath: '/MSH-9-1',
        comparisonValue: 'VXU',
      },
    ],
  },
]

// Add this near the top with other mocks
const mockSetPipeData = jest.fn()

// Mock the context hooks
jest.mock('../../../contexts/EditPipeline/updatePipeDataContext', () => ({
  useUpdatePipeDataContext: jest.fn(),
}))
jest.mock('../../../contexts/EditPipeline/reorderContext', () => ({
  ...jest.requireActual('../../../contexts/EditPipeline/reorderContext'),
  useReorderContext: jest.fn(),
}))

// Mock the UpdatePipeDataContext module
jest.mock('../../../contexts/EditPipeline/updatePipeDataContext', () => ({
  ...jest.requireActual('../../../contexts/EditPipeline/updatePipeDataContext'),
  useUpdatePipeDataContext: jest.fn(() => ({
    pipeData: mockPipeData,
    setPipeData: jest.fn(),
    tempPipeData: mockPipeData,
    setTempPipeData: jest.fn(),
  })),
}))

// let mockIsReorder = false
// Mock handleSave function
const mockHandleSave = jest.fn()

const renderComponent = (isReorder = false) => {
  jest.spyOn(ReorderContext, 'useReorderContext').mockReturnValue({
    isReorder,
    setIsReorder: jest.fn(),
  })
  return render(<SolutionsModified handleSave={mockHandleSave} />)
}

describe('SolutionsModified', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // mockIsReorder = false

    // jest.mocked(ReorderContext.useReorderContext).mockReturnValue({
    //   isReorder: mockIsReorder,
    //   setIsReorder: mockSetIsReorder,
    // })

    jest
      .mocked(UpdatePipeDataContext.useUpdatePipeDataContext)
      .mockReturnValue({
        pipeData: mockPipeData,
        setPipeData: mockSetPipeData,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })
  })

  test('renders correctly', () => {
    renderComponent()
    expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
  })

  test('Cancel button is shown when Reorder button is clicked', async () => {
    renderComponent(true)

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('reorder-button')).not.toBeInTheDocument()
  })

  test('clicking Save button calls handleSave when data has changed', async () => {
    jest
      .mocked(UpdatePipeDataContext.useUpdatePipeDataContext)
      .mockReturnValue({
        pipeData: mockModifiedPipeData,
        setPipeData: mockSetPipeData,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })

    mockHandleSave.mockResolvedValue({ success: true })
    renderComponent(true)

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockHandleSave).toHaveBeenCalledTimes(1)
    })
  })

  // Add a new test for unsuccessful save
  test('clicking Save with unsuccessful response shows error alert', async () => {
    jest
      .mocked(UpdatePipeDataContext.useUpdatePipeDataContext)
      .mockReturnValue({
        pipeData: mockModifiedPipeData,
        setPipeData: mockSetPipeData,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })

    mockHandleSave.mockResolvedValue({ success: false, error: 'Save failed' })

    renderComponent(true)

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText('Error! Pipeline failed to save')
      ).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(1)
  })

  test('clicking Save button with successful response shows success alert', async () => {
    mockHandleSave.mockResolvedValue({ success: true })
    jest
      .mocked(UpdatePipeDataContext.useUpdatePipeDataContext)
      .mockReturnValue({
        pipeData: mockModifiedPipeData,
        setPipeData: mockSetPipeData,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })
    renderComponent(true)

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText('Pipeline has been saved successfully')
      ).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(1)
  })

  test('clicking Save with no changes to data shows info alert', async () => {
    renderComponent()

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText('No changes detected. Pipeline not saved')
      ).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(0)
  })
})
