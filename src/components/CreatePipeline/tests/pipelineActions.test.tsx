import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PipelineActions from '../pipelineActions'
import * as ReorderContext from '../../../contexts/EditPipeline/reorderContext'
import * as UpdatePipeDataContext from '../../../contexts/EditPipeline/updatePipeDataContext'

jest.mock('../../../contexts/EditPipeline/reorderContext', () => ({
  ...jest.requireActual('../../../contexts/EditPipeline/reorderContext'),
  useReorderContext: jest.fn(),
}))

jest.mock('../../../contexts/EditPipeline/updatePipeDataContext', () => ({
  ...jest.requireActual('../../../contexts/EditPipeline/updatePipeDataContext'),
  useUpdatePipeDataContext: jest.fn(() => ({
    pipeData: [],
    setPipeData: jest.fn(),
    tempPipeData: null,
    setTempPipeData: jest.fn(),
  })),
}))

const mockOnSave = jest.fn()

const renderComponent = (isSaveDisabled = false, isReorder = false) => {
  jest.spyOn(ReorderContext, 'useReorderContext').mockReturnValue({
    isReorder,
    setIsReorder: jest.fn(),
  })
  return render(
    <PipelineActions onSave={mockOnSave} isSaveDisabled={isSaveDisabled} />
  )
}

describe('PipelineActions Component', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the Save and Activate buttons', () => {
    renderComponent()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
    expect(screen.getByTestId('activate-button')).toBeInTheDocument()
  })

  it('renders the Reorder button when not in reorder mode', () => {
    renderComponent()
    expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
    expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
  })

  it('renders the Cancel button when in reorder mode', () => {
    renderComponent(false, true)
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('reorder-button')).not.toBeInTheDocument()
  })

  it('disables Save and Activate buttons when isSaveDisabled is true', () => {
    renderComponent(true)
    expect(screen.getByTestId('save-button')).toBeDisabled()
    expect(screen.getByTestId('activate-button')).toBeDisabled()
  })

  it('enables Save and Activate buttons when isSaveDisabled is false', () => {
    renderComponent(false)
    expect(screen.getByTestId('save-button')).not.toBeDisabled()
    expect(screen.getByTestId('activate-button')).not.toBeDisabled()
  })

  it('calls onSave with active=false when Save is clicked', async () => {
    mockOnSave.mockResolvedValue(undefined)
    renderComponent()

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(false)
    })
  })

  it('calls onSave with active=true when Activate is clicked', async () => {
    mockOnSave.mockResolvedValue(undefined)
    renderComponent()

    fireEvent.click(screen.getByTestId('activate-button'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(true)
    })
  })

  it('shows success alert after successful save', async () => {
    mockOnSave.mockResolvedValue(undefined)
    renderComponent()

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(
        screen.getByText('Pipeline created successfully!')
      ).toBeInTheDocument()
    })
  })

  it('shows error alert when save throws', async () => {
    mockOnSave.mockRejectedValue(new Error('Failed'))
    renderComponent()

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(
        screen.getByText('Error! Could not create pipeline.')
      ).toBeInTheDocument()
    })
  })
})
