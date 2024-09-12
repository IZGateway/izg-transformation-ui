import * as React from 'react'
import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Close from '../Close'
import EditIcon from '@mui/icons-material/Edit'
import { Typography, Tooltip, Box, IconButton, TextField } from '@mui/material'
import Settings from './settings'
import Solutions from './solutions'
import SolutionsAdded from './solutionsAdded'
import CloseIcon from '@mui/icons-material/Close'
import SolutionsGrid from './solutionsGrid'

const EditPipeline = ({ pipeData, orgData, solutionsData }) => {
  const router = useRouter()
  const { isReady, query } = router
  const [description, setDescription] = React.useState(pipeData.description)
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])

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
                  <Solutions
                    solutionsData={solutionsData}
                    pipeData={pipeData.pipes}
                    onAddSolution={(solution) => {
                      console.log(solution)
                    }}
                  />
                  <SolutionsGrid
                    pipeData={pipeData.pipes}
                    solutionsData={solutionsData}
                  />
                  <SolutionsAdded />
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
