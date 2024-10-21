import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionsModified from '../solutionsModifed'
import ReorderProvider from '../../../contexts/EditPipeline/reorderContext'
import UpdatePipelineDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'

// Mock handleSave function
const mockHandleSave = jest.fn()

const renderComponent = () => {
  return render(
    <ReorderProvider>
      <UpdatePipelineDataProvider>
        <SolutionsModified handleSave={mockHandleSave} />
      </UpdatePipelineDataProvider>
    </ReorderProvider>
  )
}

describe('SolutionsModified', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly', () => {
    renderComponent()
    expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
    expect(screen.getByTestId('save-button')).toBeInTheDocument()
  })

  test('clicking Reorder button shows Cancel button and calls setTempPipeData', () => {
    renderComponent()
    const reorderButton = screen.getByTestId('reorder-button')
    fireEvent.click(reorderButton)

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('reorder-button')).not.toBeInTheDocument()
  })

  test('clicking Cancel button restores pipeData and shows Reorder button', () => {
    renderComponent()
    const reorderButton = screen.getByTestId('reorder-button')
    fireEvent.click(reorderButton)

    const cancelButton = screen.getByTestId('cancel-button')
    fireEvent.click(cancelButton)

    expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
    expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
  })

  test('clicking Save button calls handleSave if there are changes to pipeData', async () => {
    mockHandleSave.mockResolvedValue({ success: true })

    renderComponent()
    const saveButton = screen.getByTestId('save-button')

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockHandleSave).toHaveBeenCalledTimes(1)
    })
  })

  test('clicking Reorder then Save shows correct button sequence', async () => {
    mockHandleSave.mockResolvedValue({ success: true })

    renderComponent()

    const reorderButton = screen.getByTestId('reorder-button')
    fireEvent.click(reorderButton)

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.queryByTestId('reorder-button')).not.toBeInTheDocument()

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(0)
  })

  // Add a new test for unsuccessful save
  test('clicking Save with unsuccessful response shows error alert', async () => {
    // Mock unsuccessful save response
    mockHandleSave.mockResolvedValue({ success: false, error: 'Save failed' })

    renderComponent()

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

    renderComponent()

    const saveButton = screen.getByTestId('save-button')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(
        screen.getByText('Pipeline has been saved successfully')
      ).toBeInTheDocument()
    })

    expect(mockHandleSave).toHaveBeenCalledTimes(1)
  })
})
