import React, { useCallback, useMemo, useState } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensors,
  useSensor,
  KeyboardSensor,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import SolutionCard from './solutionCard'
import { useSolutionsDataContext } from '../../contexts/EditPipeline/solutionsDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

const SolutionsGrid = () => {
  const { solutionsData } = useSolutionsDataContext()
  const { pipeData, setPipeData } = useUpdatePipeDataContext()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeSolution, setActiveSolution] = useState<any>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = pipeData.findIndex((item) => item.id === active.id)
        const newIndex = pipeData.findIndex((item) => item.id === over.id)
        setPipeData(arrayMove(pipeData, oldIndex, newIndex))
      }

      setActiveId(null)
      setActiveSolution(null)
      setOverIndex(null)
    },
    [pipeData, setPipeData]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(active.id as string)
      const draggedSolution = solutionsData.find(
        (s) => s.id === pipeData.find((p) => p.id === active.id)?.solutionId
      )
      setActiveSolution(draggedSolution)
    },
    [pipeData, solutionsData]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event
      setOverIndex(
        over ? pipeData.findIndex((item) => item.id === over.id) : null
      )
    },
    [pipeData]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext
        items={useMemo(() => pipeData.map((item) => item.id), [pipeData])}
        strategy={rectSortingStrategy}
      >
        <Box
          data-testid="solutions-grid-container"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
            gridAutoRows: 'minmax(201px, 1fr)',
            gap: 2,
            marginTop: 4,
          }}
        >
          {pipeData.map((pipe, index) => {
            const solution = solutionsData.find((s) => s.id === pipe.solutionId)
            let displayIndex = index + 1

            if (activeId) {
              const activeIndex = pipeData.findIndex(
                (item) => item.id === activeId
              )
              const currentIndex = index

              if (overIndex !== null) {
                const isMovingDown = activeIndex < overIndex
                const isInShiftRange = isMovingDown
                  ? currentIndex > activeIndex && currentIndex <= overIndex
                  : currentIndex < activeIndex && currentIndex >= overIndex

                if (pipe.id === activeId) {
                  displayIndex = overIndex + 1
                } else if (isInShiftRange) {
                  displayIndex = currentIndex + (isMovingDown ? -1 : 1) + 1
                }
              }
            }

            return (
              <SolutionCard
                data-testid={`solution-card-${index + 1}`}
                key={pipe.id}
                solution={solution}
                id={pipe.id}
                index={displayIndex}
                preconditions={pipe.preconditions}
                activeId={activeId}
              />
            )
          })}
          {solutionsData.length > 0 && (
            <Card
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: '30px',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'none',
                outline: '1px solid #aaaaaa',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <AddIcon fontSize="large" color="disabled" />
                <Typography variant="body1">Add more above</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </SortableContext>

      <DragOverlay style={{ zIndex: 0 }}>
        {activeId && activeSolution ? (
          <SolutionCard
            id={activeSolution.id}
            key={activeSolution.id}
            solution={activeSolution}
            index={
              overIndex !== null
                ? overIndex + 1
                : pipeData.findIndex(
                    (p) => p.solutionId === activeSolution.id
                  ) + 1
            }
            preconditions={activeSolution.requestOperations[0].preconditions}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default React.memo(SolutionsGrid)
