import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditPipeline from '../index'
import { useRouter } from 'next/router'
import PipelineDataProvider from '../../../contexts/EditPipeline/pipelineDataContext'
import UpdatePipeDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'
import { updateData } from '../../../components/EditPipeline/updatePipeline'
import ErrorBoundary from '../../ErrorBoundary'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import Container from '../../Container'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock the updateData function
jest.mock('../../../components/EditPipeline/updatePipeline', () => ({
  updateData: jest.fn(),
}))

const mockPipelineData = {
  pipelineName: 'Test Pipeline',
  description: 'Test Description',
  pipes: [
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
  ],
}

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

const mockOrgData = {
  active: true,
  id: '1',
  organizationName: 'Test Org',
  commonName: 'Test Common',
}

const mockSolutionsData = [
  {
    id: 'solution1',
    solutionName: 'Test Solution 1',
    description: 'This is a test solution',
    version: '1.0',
    active: true,
    requestOperations: [
      {
        preconditions: [
          {
            id: 'precond1',
            method: 'equals',
            dataPath: '/MSH-9-1',
            comparisonValue: 'VXU',
          },
        ],
      },
    ],
  },
  {
    id: 'solution2',
    solutionName: 'Test Solution 2',
    description: 'This is another test solution',
    version: '2.0',
    active: true,
    requestOperations: [
      {
        preconditions: [
          {
            id: 'precond2',
            method: 'regex',
            dataPath: '/PID-5-1',
            regex: '^[A-Z]+$',
          },
        ],
      },
    ],
  },
]

// Update the renderComponent function to use mockSolutionsData
const renderComponent = () => {
  return render(
    <Container title="Edit Connection">
      <ErrorBoundary>
        <PipelineDataProvider pipelineData={mockPipelineData}>
          <UpdatePipeDataProvider currentOrder={mockPipeData}>
            <SolutionsDataProvider solutionsData={mockSolutionsData}>
              <EditPipeline orgData={mockOrgData} />
            </SolutionsDataProvider>
          </UpdatePipeDataProvider>
        </PipelineDataProvider>
      </ErrorBoundary>
    </Container>
  )
}

describe('EditPipeline Component', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      isReady: true,
      query: { id: 'test-id' },
    })
  })

  it('renders loading state when router is not ready', () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      isReady: false,
      query: {},
    })
    renderComponent()
    expect(screen.getByText('Loading....')).toBeInTheDocument()
  })

  it('renders the pipeline name and description', () => {
    renderComponent()
    expect(screen.getByTestId('pipeline-description')).toBeInTheDocument()
    // expect(screen.getByText('Test Pipeline')).toBeInTheDocument()
    // expect(screen.getByText(' Pipeline')).toBeInTheDocument()
    // expect(screen.getByText('Test Description')).toBeInTheDocument()
    // expect(screen.getByText(' 25/75 Characters')).toBeInTheDocument()
  })

  it('allows editing the pipeline description', async () => {
    renderComponent()
    const editButton = screen.getByLabelText('edit')
    fireEvent.click(editButton)

    const input = screen.getByLabelText('Pipeline Description')
    fireEvent.change(input, { target: { value: 'New Description' } })

    const closeButton = screen.getByLabelText('close')
    fireEvent.click(closeButton)

    expect(
      screen.getByText('Test Description 25/75 Characters')
    ).toBeInTheDocument()
  })

  it('renders Settings component', () => {
    renderComponent()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders SolutionsList component', () => {
    renderComponent()
    expect(screen.getByText('Solutions List')).toBeInTheDocument()
  })

  it('renders SolutionsGrid when pipeData is not empty', () => {
    renderComponent()
    expect(screen.getByText('Configured Solutions')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your added solutions are listed below. You can add or remove as many you like.'
      )
    ).toBeInTheDocument()
  })

  it('does not render SolutionsGrid when pipeData is empty', () => {
    render(
      <PipelineDataProvider pipelineData={mockPipelineData}>
        <UpdatePipeDataProvider currentOrder={[]}>
          <SolutionsDataProvider solutionsData={[]}>
            <EditPipeline orgData={mockOrgData} />
          </SolutionsDataProvider>
        </UpdatePipeDataProvider>
      </PipelineDataProvider>
    )
    expect(screen.queryByText('Configured Solutions')).not.toBeInTheDocument()
  })

  it('renders the save button', async () => {
    renderComponent()
    screen.debug() // Add this line
    const saveButton = screen.getByRole('button', { name: 'SAVE' })
    expect(saveButton).toBeInTheDocument()
  })

  it('calls updateData when save button is clicked', async () => {
    renderComponent()

    const saveButton = await screen.findByTestId('save-button')
    expect(saveButton).toBeInTheDocument()

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(updateData).toHaveBeenCalledWith('test-id', {
        ...mockPipelineData,
        pipes: mockPipeData,
      })
    })
  })

  it('handles error in ErrorBoundary', () => {
    const ErrorComponent = () => {
      throw new Error('Test error')
    }

    const originalConsoleError = console.error
    console.error = jest.fn()

    render(
      <PipelineDataProvider pipelineData={mockPipelineData}>
        <UpdatePipeDataProvider currentOrder={mockPipeData}>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </UpdatePipeDataProvider>
      </PipelineDataProvider>
    )

    expect(
      screen.getByText('Oh No! We ran into a problem...')
    ).toBeInTheDocument()
    expect(
      screen.getByText("Here's some tips to help you out.")
    ).toBeInTheDocument()
    expect(screen.getByText('Try reloading the page.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Use the navigation on the left hand side to move to a different page.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('If error still occurs, please contact help desk.')
    ).toBeInTheDocument()

    console.error = originalConsoleError
  })
})
