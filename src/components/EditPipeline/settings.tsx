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
} from '@mui/material'

const Settings = (props: { pipeData; orgData }) => {
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
            defaultValue={props.orgData.organizationName}
            label="Organization"
            inputProps={{ 'data-testid': 'organization-select' }}
            disabled
          >
            <MenuItem value={props.orgData.organizationName}>
              {props.orgData.organizationName}
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="input-endpoint-select-label">
            Input Endpoint
          </InputLabel>
          <Select
            labelId="input-endpoint-select-label"
            id="input-endpoint-select"
            defaultValue={props.pipeData.inboundEndpoint}
            label="Input Endpoint"
            inputProps={{ 'data-testid': 'input-endpoint-select' }}
            disabled
          >
            <MenuItem value={props.pipeData.inboundEndpoint}>
              {props.pipeData.inboundEndpoint}
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="output-endpoint-select-label">
            Output Endpoint
          </InputLabel>
          <Select
            labelId="output-endpoint-select-label"
            id="output-endpoint-select"
            defaultValue={props.pipeData.outboundEndpoint}
            label="Output Endpoint"
            inputProps={{ 'data-testid': 'output-endpoint-select' }}
            disabled
          >
            <MenuItem value={props.pipeData.outboundEndpoint}>
              {props.pipeData.outboundEndpoint}
            </MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

export default Settings
