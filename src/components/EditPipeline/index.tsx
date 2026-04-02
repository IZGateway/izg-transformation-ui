import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
import Close from '../Close'
import {
  Typography,
  Box,
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
import SolutionsGrid from './Grid/solutionsGrid'
import ReorderProvider from '../../contexts/EditPipeline/reorderContext'
import { updateData } from '../../components/EditPipeline/updatePipeline'
import { usePipelineDataContext } from '../../contexts/EditPipeline/pipelineDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'
import palette from '../../styles/theme/palette'
import _ from 'lodash'

const EditPipeline = ({ orgData }) => {
  const router = useRouter()
  const { isReady, query } = router
  const { pipelineData, setPipelineData } = usePipelineDataContext()
  const { pipeData, tempPipeData } = useUpdatePipeDataContext()
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
      pipes: tempPipeData ?? pipeData,
    })
    if (!response.success) {
      console.error('Error updating pipeline data:', response.error)
    }
    return response
  }, [tempPipeData, pipeData, query, pipelineData])

  const handleDescriptionSave = useCallback(
    (value: string) => {
      setPipelineData({ ...pipelineData, description: value })
    },
    [pipelineData, setPipelineData]
  )

  const handleToggleActive = useCallback(async () => {
    const newActive = !pipelineData.active
    const response = await updateData(query.id as string, {
      ...pipelineData,
      pipes: tempPipeData ?? pipeData,
      active: newActive,
    })
    if (!response.success) {
      setAlertState({
        show: true,
        severity: 'error',
        message: `Error! Could not ${
          newActive ? 'activate' : 'deactivate'
        } pipeline!`,
      })
    } else {
      setPipelineData({ ...pipelineData, active: newActive })
      setAlertState({
        show: true,
        severity: 'success',
        message: `Pipeline ${
          newActive ? 'activated' : 'deactivated'
        } successfully!`,
      })
    }
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 2000)
  }, [pipelineData, pipeData, tempPipeData, query.id, setPipelineData])

  const handleEndpointChange = useCallback(
    (field: 'inboundEndpoint' | 'outboundEndpoint', value: string) => {
      setPipelineData({ ...pipelineData, [field]: value })
    },
    [pipelineData, setPipelineData]
  )

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
          <Close path={'/manage'} />
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
              <Settings
                pipeData={pipelineData}
                orgData={orgData}
                onEndpointChange={handleEndpointChange}
                onDescriptionChange={handleDescriptionSave}
              />
            </Box>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Box
                sx={[
                  {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '1em',
                    height: '5em',
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
                  {(!_.isEmpty(pipeData) || !_.isEmpty(tempPipeData)) && (
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
                </Box>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: '1em',
                  height: '5em',
                  background: `linear-gradient(to top, rgb(from ${palette.background} r g b / 1) 0%,rgb(from ${palette.background} r g b / 0) 100%)`,
                  opacity: showBottomGradient && isScrollable ? 1 : 0,
                  transition: showBottomGradient
                    ? 'opacity 100ms ease-in'
                    : 'opacity 100ms ease-out',
                  pointerEvents: 'none',
                }}
              />
              <Collapse in={showAlert} sx={{ marginBottom: 1 }}>
                <Alert
                  severity={alertState.severity}
                  variant="filled"
                  sx={{ width: 'fit-content', marginLeft: 'auto' }}
                  elevation={2}
                >
                  <AlertTitle>{alertState.message}</AlertTitle>
                </Alert>
              </Collapse>
              <SolutionsModified
                handleSave={handleSave}
                handleToggleActive={handleToggleActive}
                isActive={!!pipelineData.active}
              />
            </Box>
          </Box>
        </ErrorBoundary>
      </Container>
    </ReorderProvider>
  )
}

export default EditPipeline
