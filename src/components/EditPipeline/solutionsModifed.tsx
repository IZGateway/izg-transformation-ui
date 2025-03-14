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
import { PipeData } from '../../contexts/EditPipeline/pipelineDataContext'
import { useState } from 'react'
import { isEqual } from 'lodash'

const SolutionsModified = ({ handleSave }) => {
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
    setTempPipeData(null as unknown as React.SetStateAction<PipeData[]>)
    setIsReorder(false)
  }

  const onSave = async () => {
    try {
      if (isEqual(tempPipeData, pipeData) || !isReorder) {
        setIsReorder(false)
        setSeverity('info')
        return
      }

      setPipeData(tempPipeData)

      const response = await handleSave()
      if (response.success) {
        setIsReorder(false)
        setTempPipeData(null as unknown as React.SetStateAction<PipeData[]>)
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
            <Tooltip title="Apply Changes" arrow placement="bottom">
              <Button
                id="apply"
                data-testid="apply-button"
                color="secondary"
                variant="contained"
                sx={{
                  borderRadius: '30px',
                  display: 'flex',
                  flex: 1,
                  maxWidth: '125px',
                }}
                onClick={onSave}
              >
                Apply
              </Button>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SolutionsModified
