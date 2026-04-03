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

// Mock handleSave function
const mockHandleSave = jest.fn()
const mockHandleToggleActive = jest.fn()

const renderComponent = (isReorder = false, isActive = false) => {
  jest.spyOn(ReorderContext, 'useReorderContext').mockReturnValue({
    isReorder,
    setIsReorder: jest.fn(),
  })
  return render(
    <SolutionsModified
      handleSave={mockHandleSave}
      handleToggleActive={mockHandleToggleActive}
      isActive={isActive}
    />
  )
}

describe('SolutionsModified', () => {
  beforeEach(() => {
    jest.clearAllMocks()

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
    expect(screen.getByTestId('apply-button')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-active-button')).toBeInTheDocument()
  })

  test('shows Deactivate label when pipeline is active', () => {
    renderComponent(false, true)
    expect(screen.getByTestId('toggle-active-button')).toHaveTextContent(
      'Deactivate'
    )
  })

  test('shows Activate label when pipeline is inactive', () => {
    renderComponent(false, false)
    expect(screen.getByTestId('toggle-active-button')).toHaveTextContent(
      'Activate'
    )
  })

  test('Cancel button is shown when Reorder button is clicked', async () => {
    renderComponent(true)
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('reorder-button')).not.toBeInTheDocument()
  })

  test('clicking Apply button always calls handleSave', async () => {
    mockHandleSave.mockResolvedValue({ success: true })
    renderComponent()

    const applyButton = screen.getByTestId('apply-button')
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(mockHandleSave).toHaveBeenCalledTimes(1)
    })
  })

  test('clicking Apply with successful response shows success alert', async () => {
    mockHandleSave.mockResolvedValue({ success: true })
    renderComponent()

    const applyButton = screen.getByTestId('apply-button')
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(screen.getByText('Pipeline changes applied!')).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(1)
  })

  test('clicking Apply with unsuccessful response shows error alert', async () => {
    mockHandleSave.mockResolvedValue({ success: false, error: 'Save failed' })
    renderComponent()

    const saveButton = screen.getByTestId('apply-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText('Error! Pipeline failed to apply changes')
      ).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(1)
  })

  test('clicking toggle-active-button calls handleToggleActive', async () => {
    mockHandleToggleActive.mockResolvedValue(undefined)
    renderComponent(false, true)

    fireEvent.click(screen.getByTestId('toggle-active-button'))

    await waitFor(() => {
      expect(mockHandleToggleActive).toHaveBeenCalledTimes(1)
    })
  })
})
