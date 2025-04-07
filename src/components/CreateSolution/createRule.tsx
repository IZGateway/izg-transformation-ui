import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Box,
} from '@mui/material'

const CreateRule = (props) => {
  return (
    <Box>
      <Card
        sx={{
          minWidth: 250,
          borderRadius: '0px 0px 30px 30px',
          marginTop: 0,
        }}
      >
        {props.currentRuleTab === 'request' && (
          <div>
            <CardHeader title="Creating a Rule (Request)" />
            <Divider />
            <CardContent>
              <Typography variant="body1">
                Request operations are designed to process the incoming request
                message as it is received by the Xform Service. These operations
                typically handle various tasks such as validation,
                transformation, routing, and enrichment of the request data
                before it is further processed or passed along to other
                services.
              </Typography>
            </CardContent>
          </div>
        )}
        {props.currentRuleTab === 'response' && (
          <div>
            <CardHeader title="Creating a Rule (Response)" />
            <Divider />
            <CardContent>
              <Typography variant="body1">
                Response operations are designed to process the incoming request
                message as it is received by the Xform Service. These operations
                typically handle various tasks such as validation,
                transformation, routing, and enrichment of the request data
                before it is further processed or passed along to other
                services.
              </Typography>
            </CardContent>
          </div>
        )}
      </Card>
    </Box>
  )
}

export default CreateRule
