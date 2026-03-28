import {
  Card,
  CardContent,
  Button,
  Box,
  Collapse,
  Alert,
  AlertTitle,
  Tooltip,
} from '@mui/material'
import { useReorderContext } from '../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'
import { useState } from 'react'

type Props = {
  handleSave: () => Promise<{ success: boolean; error?: string }>
  handleToggleActive: () => Promise<void>
  isActive: boolean
}

const SolutionsModified = ({
  handleSave,
  handleToggleActive,
  isActive,
}: Props) => {
  const { isReorder, setIsReorder } = useReorderContext()
  const { pipeData, tempPipeData, setPipeData, setTempPipeData } =
    useUpdatePipeDataContext()
  const [showAlert, setShowAlert] = useState(false)
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>(
    'success'
  )

  const onReorder = () => {
    setTempPipeData(pipeData)
    setIsReorder(true)
  }

  const onCancel = () => {
    setTempPipeData(null)
    setIsReorder(false)
  }

  const onSave = async () => {
    try {
      const response = await handleSave()
      if (response.success) {
        if (isReorder) {
          setPipeData(tempPipeData)
          setTempPipeData(null)
          setIsReorder(false)
        }
        setSeverity('success')
      } else {
        console.error('Save failed:', response.error)
        setSeverity('error')
      }
    } catch (error) {
      console.error('Save failed:', error)
      setSeverity('error')
    } finally {
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 2000)
    }
  }

  return (
    <Box>
      <Collapse
        sx={{ marginBottom: 1, position: 'relative', zIndex: 1000 }}
        in={showAlert}
      >
        <Alert
          severity={severity}
          variant="filled"
          sx={{
            width: 'fit-content',
            marginLeft: 'auto',
          }}
          elevation={2}
        >
          <AlertTitle>
            {severity === 'success'
              ? 'Pipeline changes applied!'
              : severity === 'error'
              ? 'Error! Pipeline failed to apply changes'
              : 'No changes detected.'}
          </AlertTitle>
        </Alert>
      </Collapse>
      <Card
        sx={{
          borderRadius: '30px',
          position: 'relative',
          bottom: 0,
          '@supports (width: -moz-available)': {
            width: '-moz-available', // Firefox-specific rule
          },
          '@supports (-webkit-fill-available)': {
            width: '-webkit-fill-available', // Webkit browsers (Chrome, etc.)
          },
          width: '100%', // Fallback for Safari and other browsers
          boxSizing: 'border-box', // Prevent padding/border from affecting width
          marginBottom: 2,
          marginX: 1,
        }}
        data-testid="solutions-modified-container"
        id="zip"
      >
        <CardContent sx={{ padding: '16px !important' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {isReorder ? (
              <Button
                id="cancel"
                data-testid="cancel-button"
                color="error"
                variant="outlined"
                sx={{
                  borderRadius: '30px',
                  display: 'flex',
                  flex: 1,
                  maxWidth: '125px',
                }}
                onClick={onCancel}
              >
                Cancel
              </Button>
            ) : (
              <Button
                id="reorder"
                data-testid="reorder-button"
                color="secondary"
                variant="outlined"
                sx={{
                  borderRadius: '30px',
                  display: 'flex',
                  flex: 1,
                  maxWidth: '125px',
                }}
                onClick={onReorder}
              >
                Reorder
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
              <Tooltip title="Apply Changes" arrow placement="bottom">
                <Button
                  id="apply"
                  data-testid="apply-button"
                  color="secondary"
                  variant="contained"
                  sx={{
                    borderRadius: '30px',
                    minWidth: '120px',
                  }}
                  onClick={onSave}
                >
                  Apply
                </Button>
              </Tooltip>
              <Button
                id="toggle-active"
                data-testid="toggle-active-button"
                variant="outlined"
                color={isActive ? 'error' : 'success'}
                sx={{
                  borderRadius: '30px',
                  minWidth: '130px',
                }}
                onClick={handleToggleActive}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SolutionsModified
