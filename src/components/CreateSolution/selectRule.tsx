import * as React from 'react'
import { Typography, Card, Box, Button, Grid } from '@mui/material'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Grow from '@mui/material/Grow'
const SelectRule = ({ handleRuleSelection }) => {
  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Card sx={{ p: 1, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Creating A Rule (New)
          </Typography>
        </Card>
        <Grid
          container
          spacing={2}
          sx={{
            flexDirection: { md: 'column', lg: 'row' },
          }}
        >
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={500}>
              <Card
                sx={{
                  p: 2,
                  borderBottomRightRadius: 32,
                  borderBottomLeftRadius: 32,
                  display: 'flex',
                  minHeight: { xs: '175px', sm: '225px' },
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Typography variant="h6">Request</Typography>
                    <ArrowRightAltIcon color="secondary" />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    Define the conditions that trigger this rule. Specify the
                    criteria that must be met and any necessary details to
                    ensure accuracy. You can use multiple preconditions and
                    logical operators to refine your rule.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleRuleSelection('request')}
                >
                  Start Request Rule
                </Button>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={700}>
              <Card
                sx={{
                  p: 2,
                  borderBottomRightRadius: 32,
                  borderBottomLeftRadius: 32,
                  minHeight: { xs: '175px', sm: '225px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Typography variant="h6">Response</Typography>
                    <KeyboardBackspaceIcon color="secondary" />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    Determine what happens when this rule is triggered.
                    Configure the appropriate response actions, such as sending
                    notifications, updating records, or executing automated
                    tasks. Responses can be customized based on the request
                    parameters.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleRuleSelection('response')}
                >
                  Start Response Rule
                </Button>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={900}>
              <Card
                sx={{
                  p: 2,
                  borderBottomRightRadius: 32,
                  borderBottomLeftRadius: 32,
                  minHeight: { xs: '175px', sm: '225px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Typography variant="h6">Combination</Typography>
                    <CompareArrowsIcon color="secondary" />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    Set up a rule by defining both the triggering conditions
                    (Request) and the resulting actions (Response).
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleRuleSelection('combination')}
                >
                  Start Combination
                </Button>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default SelectRule
