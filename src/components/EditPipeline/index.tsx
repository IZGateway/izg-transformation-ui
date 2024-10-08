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
} from '@mui/material'
import Settings from './settings'
import SolutionsList from './solutionsList'
import SolutionsModified from './solutionsModifed'
import CloseIcon from '@mui/icons-material/Close'
import SolutionsGrid from './solutionsGrid'
import ReorderProvider from '../../contexts/EditPipeline/reorderContext'
import { updateData } from '../../components/EditPipeline/updatePipeline'
import { usePipelineDataContext } from '../../contexts/EditPipeline/pipelineDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

const EditPipeline = ({ orgData }) => {
  const router = useRouter()
  const { isReady, query } = router
  const { pipelineData } = usePipelineDataContext()
  const { pipeData } = useUpdatePipeDataContext()
  const [description, setDescription] = useState(pipelineData.description)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])

  const handleSave = useCallback(async () => {
    await updateData(query.id as string, {
      ...pipelineData,
      pipes: pipeData,
    })
  }, [pipeData, query, pipelineData])

  return !isReady ? (
    <>Loading....</>
  ) : (
    <ReorderProvider>
      <Container title="Pipeline">
        <ErrorBoundary>
          <Box sx={{ position: 'relative' }}>
            <div>
              <Close />
              <>
                <Box sx={{ marginTop: 4 }}>
                  <Typography
                    variant="h1"
                    fontWeight={700}
                    fontSize="32px"
                    id="title-pipeline"
                  >
                    {pipelineData.pipelineName} Pipeline
                  </Typography>
                  {open ? (
                    <Box display={'flex'} flexDirection={'row'}>
                      <TextField
                        data-testid="pipeline-description"
                        id="pipeline-description"
                        label="Pipeline Description"
                        variant="standard"
                        size="small"
                        value={description}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setDescription(event.target.value)
                        }}
                      />
                      <IconButton
                        aria-label="close"
                        color="primary"
                        onClick={() => {
                          setOpen(false)
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box display={'flex'} flexDirection={'row'}>
                      <Typography variant="body1">
                        {pipelineData.description} 25/75 Characters
                      </Typography>

                      <Tooltip
                        arrow
                        placement="bottom"
                        title="Edit description of the pipeline"
                      >
                        <IconButton
                          aria-label="edit"
                          color="primary"
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
                    gap: 4,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginTop: 4,
                  }}
                >
                  <Settings pipeData={pipelineData} orgData={orgData} />

                  <Box sx={{ width: '70%' }}>
                    <SolutionsList />
                    {pipeData && pipeData.length > 0 && (
                      <>
                        <Card
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
              </>
            </div>
          </Box>
        </ErrorBoundary>
      </Container>
    </ReorderProvider>
  )
}

export default EditPipeline
