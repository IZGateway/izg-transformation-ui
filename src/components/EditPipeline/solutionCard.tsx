import { useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SolutionCard = ({ id, solution, index, isReorder, handleDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDeleteClick = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleDelete(id)
    },
    [id, handleDelete]
  )

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...(isReorder ? { ...attributes, ...listeners } : {})}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: '0px 0px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title={
            isReorder
              ? `${index}. ${solution.solutionName}`
              : solution.solutionName
          }
          action={
            isReorder ? (
              <IconButton aria-label="delete" onClick={handleDeleteClick}>
                <DeleteOutlinedIcon />
              </IconButton>
            ) : null
          }
        />
        <Divider />
        <CardContent>
          <Typography variant="body1">{solution.description}</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SolutionCard
