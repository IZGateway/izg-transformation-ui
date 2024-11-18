/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionCard from '../solutionCard'
import { CSS } from '@dnd-kit/utilities'
import SolutionsModal from '../../Modal/solutionsModal'
import * as ReorderContextModule from '../../../../contexts/EditPipeline/reorderContext'
import * as UpdatePipeDataContextModule from '../../../../contexts/EditPipeline/updatePipeDataContext'

// Mock the SolutionsModal component
jest.mock('../../Modal/solutionsModal', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mocked-solutions-modal" />),
}))

// Mock the useReorderContext hook
jest.mock('../../../../contexts/EditPipeline/reorderContext', () => ({
  ...jest.requireActual('../../../../contexts/EditPipeline/reorderContext'),
  useReorderContext: jest.fn(),
}))

// Mock the UpdatePipeDataContext module
jest.mock('../../../../contexts/EditPipeline/updatePipeDataContext', () => ({
  ...jest.requireActual(
    '../../../../contexts/EditPipeline/updatePipeDataContext'
  ),
  useUpdatePipeDataContext: jest.fn(() => ({
    pipeData: mockPipeData,
    setPipeData: jest.fn(),
    tempPipeData: mockPipeData,
    setTempPipeData: jest.fn(),
  })),
}))

const mockSetNodeRef = jest.fn()
let mockIsDragging = false

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { 'aria-describedby': 'DndDescribedBy-0' },
    listeners: { 'aria-describedby': 'DndDescribedBy-0' },
    setNodeRef: mockSetNodeRef,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 250ms ease',
    isDragging: mockIsDragging,
  }),
}))

const mockSolution = {
  id: 'solution1',
  solutionName: 'Test Solution',
  description: 'This is a test solution',
  version: '1.0',
  active: true,
  requestOperations: [],
}

const mockPreconditions = [
  {
    method: 'equals',
    id: 'precond1',
    dataPath: '/MSH-9-1',
    regex: '',
    comparisonValue: 'VXU',
  },
]
const mockFormattedPreconditions = [
  {
    method: 'equals',
    id: 'precond1',
    value: 'VXU',
  },
]

const mockPipeData = [
  {
    id: '1',
    solutionId: 'solution1',
    solutionVersion: '1.0',
    preconditions: mockPreconditions,
  },
  {
    id: '2',
    solutionId: 'solution2',
    solutionVersion: '1.0',
    preconditions: mockPreconditions,
  },
]

const renderSolutionCard = (isReorder = false) => {
  jest.spyOn(ReorderContextModule, 'useReorderContext').mockReturnValue({
    isReorder,
    setIsReorder: jest.fn(),
  })

  return render(
    <SolutionCard
      id="1"
      solution={mockSolution}
      index={1}
      preconditions={mockPreconditions}
    />
  )
}

describe('SolutionCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    renderSolutionCard()
    expect(screen.getByTestId('solution-name')).toBeInTheDocument()
    expect(screen.getByTestId('solution-description')).toBeInTheDocument()
    expect(screen.getByTestId('edit-button')).toBeInTheDocument()
  })

  it('displays the index and solutionName correctly in the header', () => {
    renderSolutionCard()
    expect(screen.getByTestId('solution-name')).toHaveTextContent(
      '1. Test Solution'
    )
  })

  it('conditionally renders the delete button when isReorder is true', () => {
    renderSolutionCard(true)
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('does not render the delete button when isReorder is false', () => {
    renderSolutionCard(false)
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
  })

  it('calls handleDelete when the delete button is clicked', () => {
    jest.mock('../../../../contexts/EditPipeline/updatePipeDataContext')
    const mockSetPipeData = jest.fn()
    jest
      .spyOn(UpdatePipeDataContextModule, 'useUpdatePipeDataContext')
      .mockReturnValue({
        pipeData: mockPipeData,
        setPipeData: mockSetPipeData,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })

    renderSolutionCard(true)
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)

    expect(mockSetPipeData).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.not.objectContaining({ id: '1', solutionId: 'solution1' }),
      ])
    )
  })

  it('renders the SolutionsModal when isModalOpen is true', () => {
    renderSolutionCard()
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    expect(screen.getByTestId('mocked-solutions-modal')).toBeInTheDocument()
  })

  it('displays the solution description correctly', () => {
    renderSolutionCard()
    expect(screen.getByTestId('solution-description')).toHaveTextContent(
      'This is a test solution'
    )
  })

  it('applies correct styles when dragging', () => {
    const { container } = renderSolutionCard()

    const cardElement = container.firstChild as HTMLElement

    expect(cardElement).toHaveStyle(`
      transform: ${CSS.Transform.toString({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      })};
      transition: transform 250ms ease;
      z-index: auto;
    `)
    expect(mockSetNodeRef).toHaveBeenCalled()

    mockIsDragging = false
  })

  it('passes correct props to SolutionsModal', () => {
    renderSolutionCard()
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)

    expect(SolutionsModal).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedSolution: mockSolution,
        isNewSolution: false,
        existingPreconditions: mockFormattedPreconditions,
        setOpen: expect.any(Function),
        open: true,
      }),
      {}
    )
  })
})
