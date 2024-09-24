import React, { useCallback, useMemo } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import SolutionCard from './solutionCard'

const SolutionsGrid = ({
  pipeData,
  solutionsData,
  onOrderChange,
  isReorder,
  handleDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

        const newPipeData = arrayMove(pipeData, oldIndex, newIndex)
        onOrderChange(newPipeData)
      }
    },
    [pipeData, onOrderChange]
  )

  const sortableItems = useMemo(
    () => pipeData.map((item) => item.id),
    [pipeData]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
            '& > *': {
              height: 200,
            },
            marginTop: 4,
          }}
        >
          {pipeData.map((pipe, index) => {
            const solution = solutionsData.data.find(
              (s) => s.id === pipe.solutionId
            )
            return (
              <SolutionCard
                key={pipe.id}
                solution={solution}
                id={pipe.id}
                index={index + 1}
                isReorder={isReorder}
                handleDelete={handleDelete}
              />
            )
          })}
          <Card
            sx={{
              height: 200,
              borderRadius: '16px 16px 16px 16px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              outline: '1px solid #aaaaaa',
              justifyContent: 'center',
              flexDirection: 'column, row',
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
        </Box>
      </SortableContext>
    </DndContext>
  )
}

export default React.memo(SolutionsGrid)
