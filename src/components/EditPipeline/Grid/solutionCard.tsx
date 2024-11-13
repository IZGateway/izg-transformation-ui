import { useCallback, memo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SolutionsModal from '../Modal/solutionsModal'
import { useReorderContext } from '../../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../../contexts/EditPipeline/updatePipeDataContext'
import styles from './draggable.module.css'

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
  isDragging?: boolean
  isReleased?: boolean
  activeId?: string
}

const SolutionCard = memo(
  ({
    id,
    solution,
    index,
    preconditions,
    isDragging,
    activeId,
  }: SolutionCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id })
    const { isReorder } = useReorderContext()
    const { pipeData, setPipeData } = useUpdatePipeDataContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isOverButtons, setIsOverButtons] = useState(false)

    const handleDelete = useCallback(() => {
      const newOrder = pipeData.filter((pipe) => pipe.id !== id)
      setPipeData(newOrder)
    }, [id, pipeData, setPipeData])
    const formattedPreconditions = preconditions.map((precondition) => ({
      id: precondition.id,
      method: precondition.method,
      value: precondition.comparisonValue || '',
    }))

    const handleButtonsHover = useCallback((isOver: boolean) => {
      setIsOverButtons(isOver)
    }, [])

    return (
      <Box
        data-testid={`solution-card-container-${index}`}
        ref={setNodeRef}
        className={`${styles.Draggable} ${
          isReorder
            ? isDragging
              ? styles.dragging
              : styles.released
            : styles.reorder
        }`}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 2000 : 'auto',
        }}
        {...(isReorder &&
          !isOverButtons &&
          !isModalOpen && { ...attributes, ...listeners })}
        sx={{ height: '100%' }}
      >
        <Card
          sx={{
            height: '100%',
            borderRadius: '0px 0px 30px 30px',
            display: activeId?.localeCompare(id) !== 0 ? 'flex' : 'none',
            flexDirection: 'column',
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
                  <Tooltip title="Delete Solution" arrow placement="bottom">
                    <IconButton
                      onMouseEnter={() => handleButtonsHover(true)}
                      onMouseLeave={() => handleButtonsHover(false)}
                      data-testid="delete-button"
                      aria-label="delete"
                      onClick={handleDelete}
                      color="error"
                    >
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Edit Solution" arrow placement="bottom">
                  <IconButton
                    onMouseEnter={() => handleButtonsHover(true)}
                    onMouseLeave={() => handleButtonsHover(false)}
                    data-testid="edit-button"
                    aria-label="edit"
                    color="primary"
                    onClick={() => {
                      setIsModalOpen(true)
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
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
