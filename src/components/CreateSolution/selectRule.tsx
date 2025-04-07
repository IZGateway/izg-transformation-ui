import * as React from 'react'
import { Typography, Card, Box, Button, Grid } from '@mui/material'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'

const SelectRule = ({ handleRuleSelection }) => {
  return (
    <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Creating A Rule (New)
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Request</Typography>
                <ArrowRightAltIcon />
              </Box>
              <Typography variant="body2" gutterBottom>
                Define the conditions that trigger this rule. Specify the
                criteria that must be met and any necessary details to ensure
                accuracy. You can use multiple preconditions and logical
                operators to refine your rule.
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleRuleSelection('request')}
              >
                Start Request Rule
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Response</Typography>
                <KeyboardBackspaceIcon />
              </Box>
              <Typography variant="body2" gutterBottom>
                Determine what happens when this rule is triggered. Configure
                the appropriate response actions, such as sending notifications,
                updating records, or executing automated tasks. Responses can be
                customized based on the request parameters.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleRuleSelection('response')}
              >
                Start Response Rule
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">Combination</Typography>
                <CompareArrowsIcon />
              </Box>
              <Typography variant="body2" gutterBottom>
                Set up a rule by defining both the triggering conditions
                (Request) and the resulting actions (Response).
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleRuleSelection('combination')}
              >
                Start Combination
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default SelectRule
