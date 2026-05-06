import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
  Box,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SearchableSelect from '../SearchableSelect'

type Organization = {
  id: string
  organizationName: string
}

export type PipelineInfoState = {
  pipelineName: string
  description: string
  organizationId: string
}

type Props = {
  pipelineInfo: PipelineInfoState
  setPipelineInfo: React.Dispatch<React.SetStateAction<PipelineInfoState>>
  organizations: Organization[]
  isComplete: boolean
}

const MAX_DESCRIPTION_LENGTH = 250

const PipelineInfo = ({
  pipelineInfo,
  setPipelineInfo,
  organizations,
  isComplete,
}: Props) => {
  const handleTextChange =
    (field: keyof PipelineInfoState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPipelineInfo((prev) => ({ ...prev, [field]: e.target.value }))
    }

  return (
    <Card sx={{ borderRadius: '30px' }} data-testid="pipeline-info-container">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isComplete ? (
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
                1
              </Box>
            )}
            <Typography variant="h6" fontWeight={600}>
              Pipeline Info
            </Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Please select a source. At moment the destination will be IZ Gateway
          Production or Onboarding
        </Typography>

        <TextField
          fullWidth
          required
          id="pipeline-name"
          label="Pipeline Name"
          value={pipelineInfo.pipelineName}
          onChange={handleTextChange('pipelineName')}
          sx={{ marginBottom: 2 }}
          inputProps={{ 'data-testid': 'pipeline-name-input' }}
        />

        <TextField
          fullWidth
          id="pipeline-description"
          label="Description"
          multiline
          rows={3}
          value={pipelineInfo.description}
          onChange={handleTextChange('description')}
          inputProps={{
            maxLength: MAX_DESCRIPTION_LENGTH,
            'data-testid': 'pipeline-description-input',
          }}
          helperText={`${pipelineInfo.description.length}/${MAX_DESCRIPTION_LENGTH}`}
          sx={{ marginBottom: 2 }}
        />

        <SearchableSelect
          options={organizations.map((org) => ({
            value: org.id,
            label: org.organizationName,
          }))}
          value={pipelineInfo.organizationId}
          onChange={(value) =>
            setPipelineInfo((prev) => ({ ...prev, organizationId: value }))
          }
          label="Organization"
          required
          testId="organization-select"
        />
      </CardContent>
    </Card>
  )
}

export default PipelineInfo
