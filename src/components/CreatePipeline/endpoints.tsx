import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Box,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SearchableSelect from '../SearchableSelect'

export type EndpointsState = {
  inboundEndpoint: string
  outboundEndpoint: string
}

type EndpointOption = {
  value: string
  label: string
}

export const INBOUND_ENDPOINTS: EndpointOption[] = [
  {
    value: 'izgts:IISHubService',
    label: 'izgts:IISHubService',
  },
  {
    value: 'izgts:IISService',
    label: 'izgts:IISService',
  },
]

export const OUTBOUND_ENDPOINTS: EndpointOption[] = [
  {
    value: 'izghub:IISHubService',
    label: 'izghub:IISHubService',
  },
  {
    value: 'iis:IISService',
    label: 'iis:IISService',
  },
]

type Props = {
  endpointsInfo: EndpointsState
  setEndpointsInfo: React.Dispatch<React.SetStateAction<EndpointsState>>
  isComplete: boolean
}

const Endpoints = ({ endpointsInfo, setEndpointsInfo, isComplete }: Props) => {
  return (
    <Card
      sx={{ borderRadius: '30px', marginTop: 2 }}
      data-testid="endpoints-container"
    >
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
                2
              </Box>
            )}
            <Typography variant="h6" fontWeight={600}>
              Endpoints
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

        <SearchableSelect
          options={INBOUND_ENDPOINTS}
          value={endpointsInfo.inboundEndpoint}
          onChange={(value) =>
            setEndpointsInfo((prev) => ({ ...prev, inboundEndpoint: value }))
          }
          label="Inbound Endpoint"
          required
          testId="inbound-endpoint-select"
          sx={{ marginBottom: 2 }}
        />

        <SearchableSelect
          options={OUTBOUND_ENDPOINTS}
          value={endpointsInfo.outboundEndpoint}
          onChange={(value) =>
            setEndpointsInfo((prev) => ({ ...prev, outboundEndpoint: value }))
          }
          label="Outbound Endpoint"
          required
          testId="outbound-endpoint-select"
        />
      </CardContent>
    </Card>
  )
}

export default Endpoints
