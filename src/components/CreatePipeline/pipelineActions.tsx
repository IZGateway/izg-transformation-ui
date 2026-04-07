import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Tooltip,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useState } from 'react'
import { useReorderContext } from '../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

type Props = {
  onSave: (active: boolean) => Promise<void>
  isSaveDisabled: boolean
}

const PipelineActions = ({ onSave, isSaveDisabled }: Props) => {
  const { isReorder, setIsReorder } = useReorderContext()
  const { pipeData, setTempPipeData } = useUpdatePipeDataContext()
  const [showAlert, setShowAlert] = useState(false)
  const [severity, setSeverity] = useState<'success' | 'error'>('success')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onReorder = () => {
    setTempPipeData(pipeData)
    setIsReorder(true)
  }

  const onCancel = () => {
    setTempPipeData(null)
    setIsReorder(false)
  }

  const handleSave = async (active: boolean) => {
    try {
      await onSave(active)
      setErrorMessage(null)
      setSeverity('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    } catch (err: any) {
      setErrorMessage(err?.message ?? null)
      setSeverity('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 5000)
    }
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      <Collapse
        sx={{ marginBottom: 1, position: 'relative', zIndex: 1000 }}
        in={showAlert}
      >
        <Alert
          severity={severity}
          variant="filled"
          sx={{ width: 'fit-content', marginLeft: 'auto' }}
          elevation={2}
        >
          <AlertTitle>
            {severity === 'success'
              ? 'Pipeline created successfully!'
              : 'Error! Could not create pipeline.'}
          </AlertTitle>
          {severity === 'error' && errorMessage}
        </Alert>
      </Collapse>

      <Card
        sx={{
          borderRadius: '30px',
          boxSizing: 'border-box',
          width: '100%',
          marginBottom: 2,
        }}
        data-testid="pipeline-actions-container"
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
                sx={{ borderRadius: '30px', maxWidth: '125px' }}
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
                sx={{ borderRadius: '30px', maxWidth: '125px' }}
                onClick={onReorder}
              >
                Reorder
              </Button>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                id="activate"
                data-testid="activate-button"
                color="secondary"
                variant="outlined"
                sx={{ borderRadius: '30px' }}
                onClick={() => handleSave(true)}
                disabled={isSaveDisabled}
              >
                Activate
              </Button>

              <Tooltip title="Save Pipeline" arrow placement="bottom">
                <span>
                  <Button
                    id="save"
                    data-testid="save-button"
                    color="primary"
                    variant="contained"
                    sx={{ borderRadius: '30px' }}
                    onClick={() => handleSave(false)}
                    disabled={isSaveDisabled}
                    endIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PipelineActions
