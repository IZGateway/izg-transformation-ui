import React, { useCallback, useMemo } from 'react'
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
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import SolutionCard from './solutionCard'
import { useSolutionsDataContext } from '../../contexts/EditPipeline/solutionsDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

interface Precondition {
  method: string
  id: string
  dataPath: string
  regex: string
  comparisonValue: string
}

const SolutionsGrid = () => {
  const { solutionsData } = useSolutionsDataContext()
  const { pipeData, setPipeData } = useUpdatePipeDataContext()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (active.id !== over?.id) {
        const oldIndex = pipeData.findIndex((item) => item.id === active.id)
        const newIndex = pipeData.findIndex((item) => item.id === over?.id)
        const newOrder = arrayMove(pipeData, oldIndex, newIndex)
        setPipeData(newOrder)
      }
    },
    [pipeData, setPipeData]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <SortableContext
        items={useMemo(() => pipeData.map((item) => item.id), [pipeData])}
        strategy={rectSortingStrategy}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gridAutoRows: 'minmax(201px, 1fr)',
            gap: 2,
            marginTop: 4,
          }}
        >
          {pipeData.map((pipe, index) => {
            const solution = solutionsData.find((s) => s.id === pipe.solutionId)
            return (
              <SolutionCard
                key={pipe.id}
                solution={solution}
                id={pipe.id}
                index={index + 1}
                preconditions={pipe.preconditions as Precondition[]}
              />
            )
          })}
          {solutionsData.length > 0 && (
            <Card
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 4,
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
    </DndContext>
  )
}

export default React.memo(SolutionsGrid)
