import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditPipeline from '../index'
import { useRouter } from 'next/router'
import PipelineDataProvider from '../../../contexts/EditPipeline/pipelineDataContext'
import UpdatePipeDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'
import ErrorBoundary from '../../ErrorBoundary'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import Container from '../../Container'
import { AppProvider } from '../../../contexts/app'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock the updateData function
jest.mock('../../../components/EditPipeline/updatePipeline', () => ({
  updateData: jest.fn().mockResolvedValue({ success: true }),
}))

// Mock for the Close component
jest.mock('../../Close', () => {
  return function MockClose() {
    return <div data-testid="mock-close">CLOSE</div>
  }
})

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

const renderEditPipeline = () => {
  return render(
    <AppProvider>
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
    </AppProvider>
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
    renderEditPipeline()
    expect(screen.getByText('Loading....')).toBeInTheDocument()
  })

  it('renders correctly', () => {
    renderEditPipeline()
    expect(screen.getByTestId('mock-close')).toBeInTheDocument()
    expect(screen.getByTestId('pipeline-name-container')).toBeInTheDocument()
    expect(
      screen.getByTestId('pipeline-description-container')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('edit-pipeline-description-button')
    ).toBeInTheDocument()
    expect(screen.getByTestId('settings-container')).toBeInTheDocument()
    expect(screen.getByTestId('solutions-list-container')).toBeInTheDocument()
    expect(
      screen.getByTestId('configured-solutions-container')
    ).toBeInTheDocument()
    expect(screen.getByTestId('solutions-grid-container')).toBeInTheDocument()
    expect(screen.getByTestId('solution-card-container-1')).toBeInTheDocument()
    expect(screen.getByTestId('solution-card-container-2')).toBeInTheDocument()
    expect(
      screen.getByTestId('solutions-modified-container')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('edit-pipeline-description-button')
    ).toBeInTheDocument()
    expect(screen.getByTestId('apply-button')).toBeInTheDocument()
    expect(screen.getByTestId('reorder-button')).toBeInTheDocument()
  })

  it('allows editing the pipeline description', async () => {
    renderEditPipeline()
    const editButton = screen.getByTestId('edit-pipeline-description-button')
    fireEvent.click(editButton)

    const input = screen
      .getByTestId('edit-pipeline-description-input')
      .querySelector('input')
    expect(input).toBeInTheDocument()
    expect(screen.getByText('16/75 Characters')).toBeInTheDocument()

    // Change the description
    fireEvent.change(input, { target: { value: 'New Description' } })
    expect(screen.getByText('15/75 Characters')).toBeInTheDocument()

    // Click save and verify alert appears
    const saveButton = screen.getByTestId(
      'edit-pipeline-description-save-button'
    )
    fireEvent.click(saveButton)

    // Verify success alert appears - using findByText to wait for the async update
    expect(
      await screen.findByText('Description Saved Successfully!')
    ).toBeInTheDocument()

    // Verify the description was updated
    expect(screen.getByTestId('pipeline-description')).toHaveTextContent(
      'New Description'
    )
  })

  // Add new test for canceling description edit
  it('allows canceling pipeline description edit', () => {
    renderEditPipeline()
    const originalDescription = mockPipelineData.description

    // Start editing
    const editButton = screen.getByTestId('edit-pipeline-description-button')
    fireEvent.click(editButton)

    // Change the input
    const input = screen
      .getByTestId('edit-pipeline-description-input')
      .querySelector('input')
    fireEvent.change(input, { target: { value: 'Canceled Description' } })

    // Click cancel
    const cancelButton = screen.getByTestId(
      'edit-pipeline-description-cancel-button'
    )
    fireEvent.click(cancelButton)

    // Verify original description remains
    expect(screen.getByTestId('pipeline-description')).toHaveTextContent(
      originalDescription
    )
  })

  it('it displays an info alert if the pipeline description has not changed', async () => {
    renderEditPipeline()
    const editButton = screen.getByTestId('edit-pipeline-description-button')
    fireEvent.click(editButton)

    const input = screen
      .getByTestId('edit-pipeline-description-input')
      .querySelector('input')
    expect(input).toBeInTheDocument()
    expect(screen.getByText('16/75 Characters')).toBeInTheDocument()

    // Click save and verify alert appears
    const saveButton = screen.getByTestId(
      'edit-pipeline-description-save-button'
    )
    fireEvent.click(saveButton)

    // Verify success alert appears - using findByText to wait for the async update
    expect(
      await screen.findByText('Description Not Changed')
    ).toBeInTheDocument()
  })

  it('renders Configured Solutions and SolutionsGrid when pipeData is not empty', () => {
    renderEditPipeline()
    expect(screen.getByText('Configured Solutions')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your added solutions are listed below. You can add or remove as many you like.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('configured-solutions-container')
    ).toBeInTheDocument()
    expect(screen.getByTestId('solutions-grid-container')).toBeInTheDocument()
  })

  it('does not render Configured Solutions or SolutionsGrid when pipeData is empty', () => {
    render(
      <PipelineDataProvider pipelineData={mockPipelineData}>
        <UpdatePipeDataProvider currentOrder={[]}>
          <SolutionsDataProvider solutionsData={[]}>
            <EditPipeline orgData={mockOrgData} />
          </SolutionsDataProvider>
        </UpdatePipeDataProvider>
      </PipelineDataProvider>
    )
    expect(
      screen.queryByTestId('configured-solutions-container')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('solutions-grid-container')
    ).not.toBeInTheDocument()
  })

  it('handles error in ErrorBoundary', () => {
    const ErrorComponent = () => {
      throw new Error('Test error')
    }

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
  })
})
