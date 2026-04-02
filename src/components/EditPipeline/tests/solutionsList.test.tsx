import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionsList from '../solutionsList'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import UpdatePipelineDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'

// Mock the SolutionsModal component
jest.mock('../Modal/solutionsModal', () => {
  return function MockSolutionsModal({ setOpen }) {
    return (
      <div data-testid="solutions-modal" onClick={() => setOpen(false)}>
        Mock Solutions Modal
      </div>
    )
  }
})

const mockSolutionsData = [
  {
    id: '1',
    solutionName: 'Solution 1',
    description: 'Description 1',
    version: '1.0',
    active: true,
    requestOperations: [],
  },
  {
    id: '2',
    solutionName: 'Solution 2',
    description: 'Description 2',
    version: '1.0',
    active: true,
    requestOperations: [],
  },
]

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

const renderSolutionsList = (solutionsData = mockSolutionsData) => {
  render(
    <SolutionsDataProvider solutionsData={solutionsData}>
      <UpdatePipelineDataProvider currentOrder={mockPipeData}>
        <SolutionsList />
      </UpdatePipelineDataProvider>
    </SolutionsDataProvider>
  )
}

describe('SolutionsList', () => {
  test('renders correctly', () => {
    renderSolutionsList()
    expect(screen.getByText('Search for Solutions')).toBeInTheDocument()
    expect(
      screen.getByText('Pick a solution from the dropdown menu.')
    ).toBeInTheDocument()
    expect(screen.getByTestId('add-button')).toBeInTheDocument()
  })

  test('displays select menu items correctly', () => {
    renderSolutionsList()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /solutions/i }))
    expect(screen.getByText('Solution 1')).toBeInTheDocument()
    expect(screen.getByText('Solution 2')).toBeInTheDocument()
  })

  test('displays empty dropdown when solutionsData is empty', () => {
    renderSolutionsList([])

    expect(
      screen.getByRole('combobox', { name: /solutions/i })
    ).toBeInTheDocument()
    expect(screen.queryByText('Solution 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Solution 2')).not.toBeInTheDocument()

    expect(screen.getByTestId('add-button')).toBeDisabled()
  })

  test('displays selected item in select block and label block', async () => {
    renderSolutionsList()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /solutions/i }))
    fireEvent.click(screen.getByText('Solution 1'))

    await waitFor(() => {
      expect(screen.getByTestId('solutions-select')).toHaveValue('Solution 1')
    })
  })

  test('ADD button is disabled when no menu item is selected', () => {
    renderSolutionsList()
    expect(screen.getByTestId('add-button')).toBeDisabled()
  })

  test('Solutions Modal renders when ADD is clicked', async () => {
    renderSolutionsList()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /solutions/i }))
    fireEvent.click(screen.getByText('Solution 1'))

    await waitFor(() => {
      expect(screen.getByTestId('add-button')).toBeEnabled()
    })

    fireEvent.click(screen.getByTestId('add-button'))

    expect(screen.getByTestId('solutions-modal')).toBeInTheDocument()
  })

  test('select menu resets after closing the solutionsModal', async () => {
    renderSolutionsList()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /solutions/i }))
    fireEvent.click(screen.getByText('Solution 1'))

    await waitFor(() => {
      expect(screen.getByTestId('add-button')).toBeEnabled()
    })

    fireEvent.click(screen.getByTestId('add-button'))
    fireEvent.click(screen.getByTestId('solutions-modal'))

    await waitFor(() => {
      expect(screen.queryByTestId('solutions-modal')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('solutions-select')).toHaveValue('')
    expect(screen.getByTestId('add-button')).toBeDisabled()
  })
})
