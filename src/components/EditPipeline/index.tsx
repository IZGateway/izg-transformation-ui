import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import Close from '../Close'
import EditIcon from '@mui/icons-material/Edit'
import {
  Typography,
  Tooltip,
  Box,
  IconButton,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material'
import Settings from './settings'
import SolutionsList from './solutionsList'
import SolutionsModified from './solutionsModifed'
import CloseIcon from '@mui/icons-material/Close'
import SolutionsGrid from './Grid/solutionsGrid'
import ReorderProvider from '../../contexts/EditPipeline/reorderContext'
import { updateData } from '../../components/EditPipeline/updatePipeline'
import { usePipelineDataContext } from '../../contexts/EditPipeline/pipelineDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'
import palette from '../../styles/theme/palette'
import SaveIcon from '@mui/icons-material/Save'

const EditPipeline = ({ orgData }) => {
  const router = useRouter()
  const { isReady, query } = router
  const { pipelineData, setPipelineData } = usePipelineDataContext()
  const { pipeData } = useUpdatePipeDataContext()
  const [description, setDescription] = useState(pipelineData.description)
  const [open, setOpen] = useState(false)
  const MAX_DESCRIPTION_LENGTH = 75
  const [showTopGradient, setShowTopGradient] = useState(true)
  const [showBottomGradient, setShowBottomGradient] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertState, setAlertState] = useState<{
    show: boolean
    severity: 'success' | 'info' | 'error'
    message: string
  }>({ show: false, severity: 'info', message: '' })
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])

  const handleSave = useCallback(async () => {
    const response = await updateData(query.id as string, {
      ...pipelineData,
      description: description,
      pipes: pipeData,
    })
    if (!response.success) {
      console.error('Error updating pipeline data:', response.error)
    }
    return response
  }, [pipeData, query, pipelineData, description])

  const handleDescriptionSave = async () => {
    try {
      if (description === pipelineData.description) {
        setAlertState({
          show: true,
          severity: 'info',
          message: 'Description Not Changed',
        })
        return
      }
      setPipelineData({
        ...pipelineData,
        description: description,
      })
      const response = await handleSave()

      if (response.success) {
        setAlertState({
          show: true,
          severity: 'success',
          message: 'Description Saved Successfully!',
        })
      }
    } catch (error) {
      console.error('Error saving description:', error)
      setAlertState({
        show: true,
        severity: 'error',
        message: 'Error! Could not save description!',
      })
    } finally {
      setOpen(false)
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
      }, 2000)
    }
  }

  const handleDescriptionCancel = () => {
    setDescription(pipelineData.description)
    setOpen(false)
  }

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
    const isAtTop = scrollTop === 0

    setIsScrollable(scrollHeight > clientHeight)
    setShowBottomGradient(!isAtBottom)
    setShowTopGradient(isAtTop)
  }, [])

  const checkScrollability = useCallback((element: HTMLDivElement) => {
    const { scrollHeight, clientHeight } = element
    const isScrollable = scrollHeight > clientHeight
    setIsScrollable(isScrollable)
  }, [])

  return !isReady ? (
    <>Loading....</>
  ) : (
    <ReorderProvider>
      <Container title="Pipeline">
        <ErrorBoundary>
          <Close />
          <Box data-testid="pipeline-name-container">
            <Typography
              variant="h1"
              fontWeight={700}
              fontSize="32px"
              id="title-pipeline"
            >
              {pipelineData.pipelineName.includes('Pipeline')
                ? pipelineData.pipelineName
                : `${pipelineData.pipelineName} Pipeline`}
            </Typography>

            <Box sx={{ position: 'relative', height: 0 }}>
              <Collapse
                sx={{
                  position: 'absolute',
                  top: 40,
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                }}
                in={showAlert}
              >
                <Alert
                  severity={alertState.severity}
                  variant="filled"
                  sx={{
                    width: 'fit-content',
                    marginRight: 'auto',
                    zIndex: 1000,
                  }}
                  elevation={2}
                >
                  <AlertTitle>{alertState.message}</AlertTitle>
                </Alert>
              </Collapse>
            </Box>

            {open ? (
              <Box
                data-testid="edit-pipeline-description-container"
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                sx={{
                  display: 'flex',
                  position: 'relative',
                  top: 1,
                  left: 0,
                  right: 0,
                }}
              >
                <TextField
                  data-testid="edit-pipeline-description-input"
                  id="pipeline-description"
                  variant="standard"
                  size="medium"
                  sx={{
                    width: '31.5%',
                  }}
                  value={description}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                      setDescription(event.target.value)
                    }
                  }}
                />
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ color: 'primary', marginLeft: 2 }}
                >
                  {description.length}/{MAX_DESCRIPTION_LENGTH} Characters
                </Typography>
                <Tooltip title="Save Description" arrow placement="bottom">
                  <IconButton
                    data-testid="edit-pipeline-description-save-button"
                    aria-label="save"
                    sx={{ marginLeft: 2, paddingLeft: 0, paddingRight: 0 }}
                    color="primary"
                    onClick={handleDescriptionSave}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel" arrow placement="bottom">
                  <IconButton
                    data-testid="edit-pipeline-description-cancel-button"
                    aria-label="cancel"
                    color="primary"
                    onClick={handleDescriptionCancel}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box
                data-testid="pipeline-description-container"
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
              >
                <Typography data-testid="pipeline-description" variant="body1">
                  {pipelineData.description}
                </Typography>

                <Tooltip
                  arrow
                  placement="bottom"
                  title="Edit description of the pipeline"
                >
                  <IconButton
                    data-testid="edit-pipeline-description-button"
                    aria-label="edit"
                    color="primary"
                    sx={{ marginLeft: 2 }}
                    onClick={() => {
                      setOpen(true)
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              position: 'relative',
              gap: 4,
              alignItems: 'flex-start',
              marginTop: 4,
            }}
          >
            <Box sx={{ position: 'relative', width: '35%' }}>
              <Settings pipeData={pipelineData} orgData={orgData} />
            </Box>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Box
                sx={[
                  {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '1em',
                    height: '150px',
                    background: `linear-gradient(to top, rgb(from ${palette.background} r g b / 0) 0%,rgb(from ${palette.background} r g b / 1) 100%)`,
                    opacity: isScrollable ? (showTopGradient ? 0 : 1) : 0,
                    transition: showTopGradient
                      ? 'opacity 100ms ease-in'
                      : 'opacity 100ms ease-out',
                    pointerEvents: 'none',
                    zIndex: 50,
                  },
                  { zoom: '100% / ' },
                ]}
              />
              <Box
                onScroll={handleScroll}
                ref={(element) =>
                  element && checkScrollability(element as HTMLDivElement)
                }
                sx={{
                  width: '-webkit-fill-available',
                  position: 'relative',
                  paddingLeft: 1,
                  paddingRight: 1,
                  paddingBottom: 1,
                  maxHeight: 'calc(100vh - 275px)',
                  overflowY: 'auto',
                }}
              >
                <Box>
                  <SolutionsList />
                  {pipeData && pipeData.length > 0 && (
                    <>
                      <Card
                        data-testid="configured-solutions-container"
                        sx={{
                          minWidth: 275,

                          borderRadius: '0px 0px 30px 30px',
                          marginTop: 4,
                        }}
                      >
                        <CardHeader title="Configured Solutions" />
                        <Divider />
                        <CardContent>
                          <Typography variant="body1">
                            Your added solutions are listed below. You can add
                            or remove as many you like.{' '}
                            <b style={{ textDecoration: 'underline' }}>
                              Please note, the order of operations is
                              sequential.
                            </b>
                          </Typography>
                        </CardContent>
                      </Card>

                      <SolutionsGrid />
                    </>
                  )}
                  <SolutionsModified handleSave={handleSave} />
                </Box>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: '1em',
                  height: '150px',
                  background: `linear-gradient(to top, rgb(from ${palette.background} r g b / 1) 0%,rgb(from ${palette.background} r g b / 0) 100%)`,
                  opacity: showBottomGradient && isScrollable ? 1 : 0,
                  transition: showBottomGradient
                    ? 'opacity 100ms ease-in'
                    : 'opacity 100ms ease-out',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          </Box>
        </ErrorBoundary>
      </Container>
    </ReorderProvider>
  )
}

export default EditPipeline
