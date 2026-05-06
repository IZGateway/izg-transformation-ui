import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import SearchableSelect from '../SearchableSelect'
import {
  INBOUND_ENDPOINTS,
  OUTBOUND_ENDPOINTS,
} from '../CreatePipeline/endpoints'

const MAX_DESCRIPTION_LENGTH = 250

type Props = {
  pipeData: {
    inboundEndpoint?: string
    outboundEndpoint?: string
    description?: string
    [key: string]: unknown
  }
  orgData: { organizationName: string }
  onEndpointChange: (
    field: 'inboundEndpoint' | 'outboundEndpoint',
    value: string
  ) => void
  onDescriptionChange: (value: string) => void
}

const Settings = ({
  pipeData,
  orgData,
  onEndpointChange,
  onDescriptionChange,
}: Props) => {
  return (
    <Card
      sx={{ borderRadius: '0px 0px 30px 30px' }}
      id="settings"
      data-testid="settings-container"
    >
      <CardHeader title="Settings" />
      <Divider />
      <CardContent>
        <Typography variant="body1" component="div">
          Please select a source. At moment the destination will be IZ Gateway
          Production or Onboarding
        </Typography>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <InputLabel id="organization-select-label">Organization</InputLabel>
          <Select
            labelId="organization-select-label"
            id="organization-select"
            defaultValue={orgData.organizationName}
            label="Organization"
            inputProps={{ 'data-testid': 'organization-select' }}
            disabled
          >
            <MenuItem value={orgData.organizationName}>
              {orgData.organizationName}
            </MenuItem>
          </Select>
        </FormControl>
        <SearchableSelect
          options={INBOUND_ENDPOINTS}
          value={pipeData.inboundEndpoint ?? ''}
          onChange={(value) => onEndpointChange('inboundEndpoint', value)}
          label="Input Endpoint"
          required
          testId="input-endpoint-select"
          sx={{ marginBottom: 2 }}
        />
        <SearchableSelect
          options={OUTBOUND_ENDPOINTS}
          value={pipeData.outboundEndpoint ?? ''}
          onChange={(value) => onEndpointChange('outboundEndpoint', value)}
          label="Output Endpoint"
          required
          testId="output-endpoint-select"
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          id="pipeline-description"
          label="Description"
          multiline
          minRows={3}
          maxRows={6}
          value={pipeData.description ?? ''}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
              onDescriptionChange(e.target.value)
            }
          }}
          helperText={`${
            (pipeData.description ?? '').length
          }/${MAX_DESCRIPTION_LENGTH}`}
          inputProps={{ 'data-testid': 'pipeline-description-input' }}
        />
      </CardContent>
    </Card>
  )
}

export default Settings
