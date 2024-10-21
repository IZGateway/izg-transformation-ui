import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionsModal from '../solutionsModal'
import PreconditionProvider from '../../../../contexts/EditPipeline/preconditionContext'
import ReorderProvider from '../../../../contexts/EditPipeline/reorderContext'
import UpdatePipelineDataProvider from '../../../../contexts/EditPipeline/updatePipeDataContext'

const mockSelectedSolution = {
  id: '1',
  solutionName: 'Test Solution',
  description: 'This is a test solution',
}

const mockPreconditionsData = {
  data: [
    { id: '1', method: 'equals', value: 'test1' },
    { id: '1', method: 'not_equals', value: 'test2' },
  ],
}

const mockPreconditionMethodsData = [
  { method: 'equals' },
  { method: 'not_equals' },
  { method: 'exists' },
  { method: 'not_exists' },
]

const renderSolutionsModal = (props = {}) => {
  return render(
    <PreconditionProvider
      preconditionsData={mockPreconditionsData}
      preconditionMethodsData={mockPreconditionMethodsData}
    >
      <ReorderProvider>
        <UpdatePipelineDataProvider>
          <SolutionsModal
            selectedSolution={mockSelectedSolution}
            isNewSolution={true}
            existingPreconditions={[{ id: '', method: '', value: '' }]}
            setOpen={jest.fn()}
            open={true}
            {...props}
          />
        </UpdatePipelineDataProvider>
      </ReorderProvider>
    </PreconditionProvider>
  )
}

describe('SolutionsModal', () => {
  test('renders modal with correct title and solution details', () => {
    renderSolutionsModal()

    expect(
      screen.getByText(
        'Make some additional configurations to save your solution.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Test Solution Details')).toBeInTheDocument()
    expect(screen.getByText('This is a test solution')).toBeInTheDocument()
  })

  test('toggles preconditions when switch is clicked', () => {
    renderSolutionsModal()

    const switchElement = screen.getByRole('checkbox')
    expect(switchElement).not.toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).toBeChecked()
    expect(screen.getByText('Field')).toBeInTheDocument()

    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()
    expect(screen.queryByText('Field')).not.toBeInTheDocument()
  })

  test('adds a new precondition when "Add More" button is clicked', async () => {
    renderSolutionsModal()

    const switchElement = screen.getByRole('checkbox')
    fireEvent.click(switchElement)

    await waitFor(() => {
      expect(screen.getByText('Field')).toBeInTheDocument()
    })
    const addMoreButton = screen.getByTestId('add-more-preconditions-button')
    fireEvent.click(addMoreButton)

    await waitFor(() => {
      const fieldSelects = screen.getAllByTestId(
        /precondition-form-control-Value-\d+/i
      )
      expect(fieldSelects).toHaveLength(2)
    })
  })

  test('saves solution when form is valid', async () => {
    const mockSetOpen = jest.fn()
    renderSolutionsModal({ setOpen: mockSetOpen })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockSetOpen).toHaveBeenCalledWith(false)
    })
  })

  test('closes modal when close button is clicked', () => {
    const mockSetOpen = jest.fn()
    renderSolutionsModal({ setOpen: mockSetOpen })

    const closeButton = screen.getByTestId('CloseIcon')
    fireEvent.click(closeButton)

    expect(mockSetOpen).toHaveBeenCalledWith(false)
  })

  test('loads existing preconditions', async () => {
    render(
      <PreconditionProvider
        preconditionsData={mockPreconditionsData}
        preconditionMethodsData={mockPreconditionMethodsData}
      >
        <ReorderProvider>
          <UpdatePipelineDataProvider>
            <SolutionsModal
              selectedSolution={mockSelectedSolution}
              isNewSolution={false}
              existingPreconditions={mockPreconditionsData.data}
              setOpen={jest.fn()}
              open={true}
            />
          </UpdatePipelineDataProvider>
        </ReorderProvider>
      </PreconditionProvider>
    )

    await waitFor(() => {
      const fieldSelects = screen.getAllByTestId(
        /precondition-form-control-Value-\d+/i
      )
      expect(fieldSelects).toHaveLength(2)
    })
  })
})
