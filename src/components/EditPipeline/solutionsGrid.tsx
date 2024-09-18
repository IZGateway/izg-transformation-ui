import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import SolutionCard from './solutionCard'

const SolutionsGrid = (props) => {
  const [items, setItems] = useState(
    combineData(props.pipeData, props.solutionsData.data)
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
            '& > *': {
              height: 200, // Fixed height for all cards
            },
            marginBottom: 8,
          }}
        >
          {items.map((solution, index) => (
            <SolutionCard
              key={solution.id}
              solution={solution.solutionData}
              id={solution.id}
              index={index + 1}
              isReorder={props.isReorder}
            />
          ))}
          <Card
            sx={{
              height: '100%',
              marginTop: 4,
              borderRadius: '0px 0px 16px 16px',
              display: 'flex',
              alignItems: 'center',
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

export default SolutionsGrid

const combineData = (pipeData, solutionsData) => {
  return pipeData.map((pipe) => {
    const solutionData = solutionsData.find(
      (solution) => solution.id === pipe.solutionId
    )
    return {
      ...pipe,
      solutionData,
    }
  })
}
