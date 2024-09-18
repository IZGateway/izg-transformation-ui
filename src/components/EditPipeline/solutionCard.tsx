import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material'
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SolutionCard = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...(props.isReorder ? { ...attributes, ...listeners } : {})}
    >
      <Card
        sx={{
          height: '100%',
          marginTop: 4,
          borderRadius: '0px 0px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title={
            props.isReorder
              ? `${props.index}. ${props.solution.solutionName}`
              : props.solution.solutionName
          }
        />
        <Divider />
        <CardContent>
          <Typography variant="body1">{props.solution.description}</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SolutionCard
