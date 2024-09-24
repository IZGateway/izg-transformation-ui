import * as React from 'react'
import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback } from 'react'
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
import SolutionsAdded from './solutionsAdded'
import CloseIcon from '@mui/icons-material/Close'
import SolutionsGrid from './solutionsGrid'

const EditPipeline = ({
  pipeData,
  orgData,
  solutionsData,
  setPipeData,
  preconditionsData,
  preconditionMethodsData,
}) => {
  const router = useRouter()
  const { isReady, query } = router
  const [description, setDescription] = useState(pipeData.description)
  const [open, setOpen] = useState(false)
  const [isReorder, setIsReorder] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(pipeData.pipes)

  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])

  const updatePipelineData = useCallback(
    (newOrder) => {
      setCurrentOrder(newOrder)
      setPipeData((prevPipeData) => ({
        ...prevPipeData,
        pipes: newOrder,
      }))
    },
    [setPipeData]
  )

  const handleDelete = useCallback(
    (id) => {
      const newOrder = currentOrder.filter((pipe) => pipe.id !== id)
      updatePipelineData(newOrder)
    },
    [currentOrder, updatePipelineData]
  )

  const handleSave = useCallback(async () => {
    try {
      updatePipelineData(currentOrder)
      setIsReorder(false)
    } catch (error) {
      console.error('Error updating pipeline order:', error)
    }
  }, [currentOrder, updatePipelineData])

  return !isReady ? (
    <>Loading....</>
  ) : (
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
                  {pipeData.pipelineName} Pipeline
                </Typography>
                {open ? (
                  <Box display={'flex'} flexDirection={'row'}>
                    <TextField
                      id="pipeline-description"
                      label="Pipeline Description"
                      variant="standard"
                      size="small"
                      value={description}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
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
                      {pipeData.description} 25/75 Characters
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
                <Settings pipeData={pipeData} orgData={orgData} />

                <Box sx={{ width: '70%' }}>
                  <SolutionsList
                    solutionsData={solutionsData}
                    pipeData={currentOrder}
                    onAddSolution={updatePipelineData}
                    setIsReorder={setIsReorder}
                    preconditionsData={preconditionsData}
                    preconditionMethodsData={preconditionMethodsData}
                  />
                  {currentOrder.length > 0 && (
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
                            Once you have adjusted your settings add a
                            solutions. You can add as many you like, please note
                            the order is sequential.
                          </Typography>
                        </CardContent>
                      </Card>

                      <SolutionsGrid
                        pipeData={currentOrder}
                        solutionsData={solutionsData}
                        isReorder={isReorder}
                        onOrderChange={updatePipelineData}
                        handleDelete={handleDelete}
                      />
                    </>
                  )}
                  <SolutionsAdded
                    isReorder={isReorder}
                    onReorderToggler={setIsReorder}
                    onSave={handleSave}
                  />
                </Box>
              </Box>
            </>
          </div>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default EditPipeline
