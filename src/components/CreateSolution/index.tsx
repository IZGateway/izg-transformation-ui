import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import Close from '../Close'
import EditIcon from '@mui/icons-material/Edit'
import {
  Typography,
  Tooltip,
  Box,
  IconButton,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  AlertTitle,
  Collapse,
  Grid,
  FormGroup,
  FormControl,
} from '@mui/material'
import RuleInfo from './ruleInfo'
import palette from '../../styles/theme/palette'
import React from 'react'
import CreateRule from './createRule'
import _ from 'lodash'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import Operations from './operations'
import PreconditionsSection from '../EditPipeline/Modal/preconditionsSection'
import {
  transformPreconditions,
  useFormattedPreconditions,
} from '../EditPipeline/Modal/utils'
import { updateSolution } from './updateSolution'

const CreateSolution = ({
  solutionData,
  requestOperations,
  responseOperations,
  preconditionsData,
  preconditionMethodsData,
  operationTypeData,
  operationFieldsData,
}) => {
  const router = useRouter()
  const { isReady, query } = router
  console.log(solutionData)
  const [currentsolution, setCurrentSolution] = useState(solutionData)
  const [alertState, setAlertState] = useState<{
    show: boolean
    severity: 'success' | 'info' | 'error'
    message: string
  }>({ show: false, severity: 'info', message: '' })
  const request = _.isEmpty(requestOperations) ? false : true
  const response = _.isEmpty(responseOperations) ? false : true
  const combination = request && response
  const rule = request ? 'request' : response ? 'response' : undefined
  const operations = rule === 'request' ? requestOperations : responseOperations
  const [operationList, setOperationList] = useState<any[]>(operations)
  const [preconditions, setPreconditions] = useState(
    operations[0].preconditions
  )
  const [hasPreconditions, setHasPreconditions] = useState(
    operations[0].preconditions?.length > 0
  )
  const formattedPreconditions = useFormattedPreconditions(
    true,
    operations[0].preconditions
      ? preconditions
      : [{ id: '', method: '', value: '' }]
  )
  console.log(currentsolution)
  console.log(solutionData)
  const handleSave = async () => {
    const transformedPreconditions = !hasPreconditions
      ? []
      : transformPreconditions(
          preconditionsData,
          preconditionMethodsData,
          formattedPreconditions
        )

    const requestBody = {
      ...currentsolution,
      requestOperations: [],
      responseOperations: [
        {
          preconditions: transformedPreconditions,
          operationList: operationList,
        },
      ],
    }
    console.log(requestBody)
    const response = await updateSolution(query.id as string, requestBody)
    if (!response.success) {
      console.error('Error saving description:', response.error)
      setAlertState({
        show: true,
        severity: 'error',
        message: 'Error! Could not save description!',
      })
    } else {
      setAlertState({
        show: true,
        severity: 'success',
        message: 'Description Saved Successfully!',
      })
    }
  }

  const handleAddPrecondition = useCallback(() => {
    setHasPreconditions(true)
    setPreconditions((prev) => [...prev, { id: '', method: '', value: '' }])
  }, [setHasPreconditions, setPreconditions])
  return (
    <Container title="Solution">
      <ErrorBoundary>
        <Close />
        <Box
          sx={{
            display: 'flex',
            position: 'relative',
            gap: 4,
            alignItems: 'flex-start',
            marginTop: 4,
            width: '100%',
            paddingTop: 2,
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
          }}
        >
          {/* Rule Info */}
          <Box sx={{ position: 'relative', width: { sm: '100%', md: '35%' } }}>
            <RuleInfo
              solutionData={currentsolution}
              setSolutionData={setCurrentSolution}
            />
          </Box>
          <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Rule Type */}
            <Box
              sx={{
                width: '100%',
                position: 'relative',
                mb: 2,
              }}
            >
              <CreateRule ruleType={rule} />
            </Box>
            {/* Pre Conditions*/}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Card
                sx={{
                  minWidth: 250,
                  borderRadius: '0px 0px 30px 30px',
                  marginTop: 2,
                }}
              >
                <CardHeader title="Preconditions" />
                <Divider />
                <CardContent>
                  <PreconditionsSection
                    preconditions={formattedPreconditions}
                    setPreconditions={(newPreconditions) =>
                      setPreconditions(newPreconditions)
                    }
                    preconditionMethodsData={preconditionMethodsData}
                    preconditionsData={preconditionsData}
                    setHasPreconditions={true}
                  />

                  <Button
                    data-testid="add-more-preconditions-button"
                    sx={{
                      marginBottom: 3,
                      display: 'inline-flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                    }}
                    onClick={handleAddPrecondition}
                    variant="outlined"
                    endIcon={<PlaylistAddIcon />}
                  >
                    Add New Precondition
                  </Button>
                </CardContent>
              </Card>
            </Box>
            {/* Operations */}
            <Box
              sx={{
                width: '100%',
                position: 'relative',
              }}
            >
              <Operations
                operations={operationList}
                setOperations={setOperationList}
                operationTypeData={operationTypeData}
                operationFieldsData={operationFieldsData}
              />
            </Box>
            {/* Action Bar */}
            <Card
              sx={{
                borderRadius: '30px',
                position: 'sticky',
                zIndex: 100,
                bottom: 0,
                '@supports (width: -moz-available)': {
                  width: '-moz-available',
                },
                '@supports (-webkit-fill-available)': {
                  width: '-webkit-fill-available',
                },
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: 2,
                padding: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {combination && (
                  <Button
                    id="response"
                    data-testid="response-button"
                    color="error"
                    variant="outlined"
                    sx={{
                      borderRadius: '30px',
                      display: 'flex',
                      flex: 1,
                      maxWidth: '125px',
                    }}
                  >
                    Go to Response rule
                  </Button>
                )}
                <Tooltip title="Save rule" arrow placement="bottom">
                  <Button
                    id="save"
                    data-testid="save-button"
                    color="secondary"
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                      borderRadius: '30px',
                      display: 'flex',
                      flex: 1,
                      maxWidth: '125px',
                    }}
                  >
                    Save Rule
                  </Button>
                </Tooltip>
              </Box>
            </Card>
          </Box>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default CreateSolution
