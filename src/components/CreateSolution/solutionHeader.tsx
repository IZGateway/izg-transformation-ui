import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Box,
} from '@mui/material'

const solutionHeader = (props) => {
  return (
    <Box>
      <Card
        sx={{
          minWidth: 250,
          borderRadius: '0px 0px 30px 30px',
          marginTop: 0,
        }}
      >
        {props.currentSolutionTab === 'request' && (
          <div>
            <CardHeader title="Creating a Solution (Request)" />
            <Divider />
            <CardContent>
              <Typography variant="body1">
                Request operations handles response messages returned from the
                outbound endpoint. It processes the response, executing
                necessary transformations in the pipeline before sending the
                transformed response back to the original sender.
              </Typography>
            </CardContent>
          </div>
        )}
        {props.currentSolutionTab === 'response' && (
          <div>
            <CardHeader title="Creating a Solution (Response)" />
            <Divider />
            <CardContent>
              <Typography variant="body1">
                Response operations Processes incoming request messages as they
                are received. This includes validating, transforming, routing,
                and enriching the data in the pipeline before forwarding it to
                the outbound endpoint.
              </Typography>
            </CardContent>
          </div>
        )}
      </Card>
    </Box>
  )
}

export default solutionHeader
