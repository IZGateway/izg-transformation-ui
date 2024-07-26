import * as React from 'react'
import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Close from '../Close'
import EditIcon from '@mui/icons-material/Edit'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Button,
  Tooltip,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
} from '@mui/material'

const EditPipeline = (props) => {
  const router = useRouter()
  const { isReady, query } = router
  console.log(props)
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
                  Pipeline Name
                </Typography>
                <Box display={'flex'} flexDirection={'row'}>
                  <Typography variant="body1">
                    Transformations needed for all IIS from ORGANIZATION. 25/75
                    Characters
                  </Typography>
                  <Tooltip
                    arrow
                    placement="bottom"
                    title="Edit description of the pipeline"
                  >
                    <IconButton aria-label="edit" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
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
                <Box sx={{ width: '30%' }}>
                  <Card
                    sx={{ borderRadius: '0px 0px 16px 16px' }}
                    id="settings"
                  >
                    <CardHeader title="Settings" />

                    <Divider />
                    <CardContent>
                      <Typography variant="body1" component="div">
                        Please select a source. At moment the destination will
                        be IZ Gateway Production or Onboarding
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel id="organization-select-label">
                          Organization
                        </InputLabel>
                        <Select
                          labelId="organization-select-label"
                          id="organization-select"
                          // value={age}
                          label="Organization"
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="input-endpoint-select-label">
                          Input End Point
                        </InputLabel>
                        <Select
                          labelId="input-endpoint-select-label"
                          id="input-endpoint-select"
                          // value={age}
                          label="Input End Point"
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel id="output-endpoint-select-label">
                          Output Endpoint
                        </InputLabel>
                        <Select
                          labelId="output-endpoint-select-label"
                          id="output-endpoint-select"
                          // value={age}
                          label="Output Endpoint"
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ width: '70%' }}>
                  <Card
                    sx={{ minWidth: 275, borderRadius: '0px 0px 30px 30px' }}
                  >
                    <CardHeader title="Search for Solutions" />
                    <Divider />
                    <CardContent>
                      <Typography variant="body1" component="div">
                        Once you have adjusted your settings add a solutions.
                        You can add as many you like, please note they are
                        sequential.
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel id="solutions-select-label">
                          Solutions
                        </InputLabel>
                        <Select
                          labelId="solutions-select-label"
                          id="solutions-select"
                          // value={age}
                          label="Solutions Endpoint"
                          // onChange={handleChange}
                        >
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        id="add"
                        color="secondary"
                        variant="outlined"
                        sx={{
                          borderRadius: '30px',
                        }}
                      >
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                  <Card
                    sx={{ marginTop: 4, borderRadius: '0px 0px 16px 16px' }}
                    id="zip"
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginRight: 4,
                      }}
                    ></Box>
                    <CardContent>
                      <Box
                        display={'flex'}
                        flexDirection={'row'}
                        gap={2}
                        mt={4}
                      >
                        <Button
                          id="reorder"
                          color="primary"
                          variant="outlined"
                          sx={{
                            borderRadius: '30px',
                          }}
                        >
                          Reorder
                        </Button>
                        <Button
                          id="save"
                          color="secondary"
                          variant="contained"
                          sx={{
                            borderRadius: '30px',
                          }}
                        >
                          Save
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
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
