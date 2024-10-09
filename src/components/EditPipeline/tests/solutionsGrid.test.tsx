import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SolutionsGrid from '../solutionsGrid'
import ReorderProvider from '../../../contexts/EditPipeline/reorderContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import * as UpdatePipeDataContext from '../../../contexts/EditPipeline/updatePipeDataContext'

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

const setPipeDataMock = jest.fn()

// Mock the UpdatePipeDataContext module
jest.mock('../../../contexts/EditPipeline/updatePipeDataContext', () => ({
  ...jest.requireActual('../../../contexts/EditPipeline/updatePipeDataContext'),
  useUpdatePipeDataContext: jest.fn(() => ({
    pipeData: mockPipeData,
    setPipeData: setPipeDataMock,
    tempPipeData: mockPipeData,
    setTempPipeData: jest.fn(),
  })),
}))

// Mock the SolutionCard component
jest.mock('../solutionCard', () => ({
  __esModule: true,
  default: jest.fn(({ solution, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: solution.id })
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 1000 : 'auto',
        }}
        data-testid={`sortable-${solution.id}`}
        {...{ ...attributes, ...listeners }}
      >
        {index}. {solution.solutionName}
      </div>
    )
  }),
}))

// Mock the @dnd-kit libraries
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: jest.fn(({ children, onDragEnd }) => (
    <div
      data-testid="dnd-context"
      onClick={() =>
        onDragEnd({
          active: { id: 'solution1' },
          over: { id: 'solution2' },
        })
      }
    >
      {children}
    </div>
  )),
}))

// Mock the @dnd-kit/sortable libraries
jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  SortableContext: ({ children }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
}))

// Mock the useSortable hook
jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  useSortable: jest.fn(({ id }) => ({
    attributes: {
      role: 'button',
      tabIndex: 0,
      'aria-disabled': false,
      'aria-pressed': false,
      'aria-describedby': 'DndDescribedBy-1',
      'data-testid': `sortable-${id}`,
    },
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: id === 'solution1',
  })),
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

const setupDragTest = (setPipeDataMock: jest.Mock) => {
  let isDragging = false
  let draggedId: string | null = null

  ;(useSortable as jest.Mock).mockImplementation(({ id }) => ({
    attributes: { 'data-testid': `sortable-${id}` },
    listeners: {
      onMouseDown: () => {
        isDragging = true
        draggedId = id
      },
      onMouseUp: () => {
        if (isDragging && draggedId && draggedId !== id) {
          const newOrder = mockPipeData.slice().sort((a, b) => {
            if (a.solutionId === id) return -1
            if (b.solutionId === id) return 1
            return 0
          })
          setPipeDataMock(newOrder)
        }
        isDragging = false
        draggedId = null
      },
    },
    setNodeRef: jest.fn(),
    transform: isDragging ? { x: 0, y: 50, scaleX: 1, scaleY: 1 } : null,
    transition: isDragging ? 'transform 0.3s' : null,
    isDragging: isDragging && id === draggedId,
  }))

  render(renderSolutionsGrid())
  return {
    solution1: screen.getByTestId('sortable-solution1'),
    solution2: screen.getByTestId('sortable-solution2'),
  }
}

const renderSolutionsGrid = () => (
  <SolutionsDataProvider solutionsData={mockSolutionsData}>
    <ReorderProvider>
      <SolutionsGrid />
    </ReorderProvider>
  </SolutionsDataProvider>
)

describe('SolutionsGrid Component', () => {
  it('renders correctly', () => {
    render(renderSolutionsGrid())
    expect(screen.getByTestId('solutions-grid')).toBeInTheDocument()
    expect(screen.getByText('Add more above')).toBeInTheDocument()
    expect(screen.getAllByTestId(/sortable-/)).toHaveLength(2)
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('applies correct styles to dragged item', () => {
    let isDragging = false
    jest.mocked(useSortable).mockImplementation(
      ({ id }) =>
        ({
          setNodeRef: jest.fn(),
          transform: isDragging ? { x: 10, y: 20, scaleX: 1, scaleY: 1 } : null,
          transition: isDragging ? 'transform 0.3s' : null,
          isDragging: isDragging && id === 'solution1',
        } as any)
    )

    const { rerender } = render(renderSolutionsGrid())

    const solutionCard = screen.getByTestId('sortable-solution1')

    expect(solutionCard).toHaveStyle({
      transform: '',
      transition: '',
      zIndex: 'auto',
    })

    isDragging = true
    rerender(renderSolutionsGrid())

    expect(solutionCard).toHaveStyle({
      transform: 'translate3d(10px, 20px, 0) scaleX(1) scaleY(1)',
      transition: 'transform 0.3s',
      zIndex: '1000',
    })
  })

  it('does not update order when dragged over the same item', () => {
    const { solution1, solution2 } = setupDragTest(setPipeDataMock)

    fireEvent.mouseDown(solution1)
    fireEvent.mouseMove(solution2, { clientX: 0, clientY: 50 })
    fireEvent.mouseMove(solution1, { clientX: 0, clientY: 0 })
    fireEvent.mouseUp(solution1)

    expect(setPipeDataMock).not.toHaveBeenCalled()
  })

  it('calls handleDragEnd when drag and drop is performed', () => {
    const setPipeDataMock = jest.fn()
    jest
      .mocked(UpdatePipeDataContext.useUpdatePipeDataContext)
      .mockReturnValue({
        pipeData: mockPipeData,
        setPipeData: setPipeDataMock,
        tempPipeData: mockPipeData,
        setTempPipeData: jest.fn(),
      })

    const { solution1, solution2 } = setupDragTest(setPipeDataMock)

    fireEvent.mouseDown(solution1)
    fireEvent.mouseMove(solution2, { clientX: 0, clientY: 50 })
    fireEvent.mouseUp(solution2)

    expect(setPipeDataMock).toHaveBeenCalledTimes(1)
    expect(setPipeDataMock).toHaveBeenCalledWith([
      expect.objectContaining({ solutionId: 'solution2' }),
      expect.objectContaining({ solutionId: 'solution1' }),
    ])
  })
})
