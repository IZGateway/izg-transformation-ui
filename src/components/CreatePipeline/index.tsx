import { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Close from '../Close'
import PipelineInfo, { PipelineInfoState } from './pipelineInfo'
import Endpoints, { EndpointsState } from './endpoints'
import PipelineActions from './pipelineActions'
import SolutionsList from '../EditPipeline/solutionsList'
import SolutionsGrid from '../EditPipeline/Grid/solutionsGrid'
import ReorderProvider from '../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'
import { addPipeline } from './addPipeline'

type Organization = {
  id: string
  organizationName: string
}

type Props = {
  organizations: Organization[]
}

const CreatePipelineInner = ({ organizations }: Props) => {
  const router = useRouter()
  const { pipeData, tempPipeData } = useUpdatePipeDataContext()

  const [pipelineInfo, setPipelineInfo] = useState<PipelineInfoState>({
    pipelineName: '',
    description: '',
    organizationId: '',
  })

  const [endpointsInfo, setEndpointsInfo] = useState<EndpointsState>({
    inboundEndpoint: '',
    outboundEndpoint: '',
  })

  const isPipelineInfoComplete =
    pipelineInfo.pipelineName.trim().length > 0 &&
    pipelineInfo.organizationId.length > 0

  const isEndpointsComplete =
    endpointsInfo.inboundEndpoint.length > 0 &&
    endpointsInfo.outboundEndpoint.length > 0

  const hasSolutions = (tempPipeData ?? pipeData).length > 0

  const isSaveDisabled = !isPipelineInfoComplete || !isEndpointsComplete

  const handleSave = useCallback(
    async (active: boolean) => {
      const pipes = tempPipeData ?? pipeData

      const payload = {
        pipelineName: pipelineInfo.pipelineName.trim(),
        organizationId: pipelineInfo.organizationId,
        description: pipelineInfo.description.trim() || null,
        inboundEndpoint: endpointsInfo.inboundEndpoint,
        outboundEndpoint: endpointsInfo.outboundEndpoint,
        active,
        pipes,
      }

      const response = await addPipeline(payload)
      if (!response.success) {
        throw new Error(response.error)
      }
      router.push('/manage')
    },
    [pipelineInfo, endpointsInfo, pipeData, tempPipeData, router]
  )

  return (
    <ReorderProvider>
      <Close path="/manage" />

      <Typography variant="h4" fontWeight={700} sx={{ marginBottom: 0.5 }}>
        New Pipeline
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Fill Out the required information to create a new pipeline
      </Typography>

      <Grid container spacing={3} alignItems="flex-start">
        {/* Left column: Pipeline Info + Endpoints */}
        <Grid item xs={12} md={4}>
          <PipelineInfo
            pipelineInfo={pipelineInfo}
            setPipelineInfo={setPipelineInfo}
            organizations={organizations}
            isComplete={isPipelineInfoComplete}
          />
          <Endpoints
            endpointsInfo={endpointsInfo}
            setEndpointsInfo={setEndpointsInfo}
            isComplete={isEndpointsComplete}
          />
        </Grid>

        {/* Right column: Search for Solutions + Configured Solutions */}
        <Grid item xs={12} md={8}>
          {/* Section 3: Search for Solutions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              px: 0.5,
            }}
            data-testid="search-solutions-container"
          >
            {hasSolutions ? (
              <CheckCircleIcon color="success" />
            ) : (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                3
              </Box>
            )}
            <Typography variant="h6" fontWeight={600}>
              Search for Solutions
            </Typography>
          </Box>
          <SolutionsList />

          {/* Configured Solutions */}
          <Card
            sx={{ borderRadius: '30px', marginTop: 2 }}
            data-testid="configured-solutions-container"
          >
            <CardHeader
              title="Configured Solutions"
              subheader="Once you have adjusted your settings add a solutions. You can add as many you like, please note the order is sequential."
            />
            <Divider />
            <CardContent>
              <SolutionsGrid />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <PipelineActions onSave={handleSave} isSaveDisabled={isSaveDisabled} />
    </ReorderProvider>
  )
}

const CreatePipeline = ({ organizations }: Props) => {
  return <CreatePipelineInner organizations={organizations} />
}

export default CreatePipeline
