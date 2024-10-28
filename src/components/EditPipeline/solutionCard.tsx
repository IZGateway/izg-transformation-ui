import { useCallback, memo, useState } from 'react'
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SolutionsModal from './Modal/solutionsModal'
import { useReorderContext } from '../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'
import palette from '../../styles/theme/palette'

interface SolutionCardProps {
  id: string
  solution: {
    id: string
    solutionName: string
    description: string
    requestOperations: Array<object>
  }
  index: number
  preconditions: Array<{
    method: string
    id: string
    dataPath: string
    regex?: string
    comparisonValue?: string
  }>
}

const SolutionCard = memo(
  ({ id, solution, index, preconditions }: SolutionCardProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id })
    const { isReorder } = useReorderContext()
    const { pipeData, setPipeData } = useUpdatePipeDataContext()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDelete = useCallback(() => {
      const newOrder = pipeData.filter((pipe) => pipe.id !== id)
      setPipeData(newOrder)
    }, [id, pipeData, setPipeData])

    const formattedPreconditions = preconditions.map((precondition) => ({
      id: precondition.id,
      method: precondition.method,
      value: precondition.comparisonValue || '',
    }))

    return (
      <Box
        data-testid={`solution-card-container-${index}`}
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 2000 : 'auto',
          borderRadius: '0px 0px 30px 30px',
        }}
        {...(isReorder && { ...attributes, ...listeners })}
        sx={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%',
            borderRadius: '0px 0px 30px 30px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isReorder
              ? isDragging
                ? `0px 1px 5px 3px ${palette.primaryDark}`
                : `0px 1px 4px 1px ${palette.secondaryLight}`
              : '',
          }}
        >
          <CardHeader
            title={
              <Typography
                data-testid="solution-name"
                variant="h5"
                noWrap
                sx={{ fontSize: '1.4em', whiteSpace: 'nowrap' }}
              >
                {`${index}. ${solution.solutionName}`}
              </Typography>
            }
            action={
              <>
                {isReorder && (
                  <IconButton
                    data-testid="delete-button"
                    aria-label="delete"
                    onClick={handleDelete}
                  >
                    <DeleteOutlinedIcon />
                  </IconButton>
                )}
                <IconButton
                  data-testid="edit-button"
                  aria-label="edit"
                  onClick={() => {
                    setIsModalOpen(true)
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </>
            }
          />
          <Divider />
          <CardContent>
            <Typography data-testid="solution-description" variant="body1">
              {solution.description}
            </Typography>
          </CardContent>
        </Card>
        {isModalOpen && (
          <SolutionsModal
            selectedSolution={solution}
            isNewSolution={preconditions.length === 0}
            existingPreconditions={formattedPreconditions}
            setOpen={setIsModalOpen}
            open={isModalOpen}
          />
        )}
      </Box>
    )
  }
)

SolutionCard.displayName = 'SolutionCard'

export default SolutionCard
