import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  useContext,
  useMemo,
  useRef,
} from 'react'
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
import Operations, { operationFormFields } from './operations'
import PreconditionsSection from '../EditPipeline/Modal/preconditionsSection'
import {
  transformPreconditions,
  useFormattedPreconditions,
} from '../EditPipeline/Modal/utils'
import { updateSolution } from './updateSolution'
import { transformOperations } from './utils'
import CombinedContext from '../../contexts/app'
import CustomSnackbar from '../SnackBar'

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
  const { alert, setAlert } = useContext(CombinedContext)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [currentsolution, setCurrentSolution] = useState(solutionData)

  const request = _.isEmpty(requestOperations) ? false : true
  const response = _.isEmpty(responseOperations) ? false : true
  const [activeRule, setActiveRule] = useState<
    'request' | 'response' | undefined
  >(() => {
    if (request) return 'request'
    if (!request && response) return 'response'
    return undefined
  })
  const operations =
    activeRule === 'request' ? requestOperations : responseOperations
  const [operationList, setOperationList] = useState<any[]>(
    operations[0]?.operationList || []
  )
  const [preconditions, setPreconditions] = useState<any[]>(
    operations[0]?.preconditions || []
  )
  const [hasPreconditions, setHasPreconditions] = useState(
    preconditions.length > 0
  )
  const [hasOperations, setHasOperations] = useState(operationList.length > 0)
  const [isDirty, setIsDirty] = useState(false)
  const initialSolutionRef = useRef(currentsolution)
  const initialOperationsRef = useRef(operationList)
  const initialPreconditionsRef = useRef(preconditions)

  useEffect(() => {
    const solutionChanged = !_.isEqual(
      currentsolution,
      initialSolutionRef.current
    )
    const operationsChanged = !_.isEqual(
      operationList,
      initialOperationsRef.current
    )
    const preconditionsChanged = !_.isEqual(
      preconditions,
      initialPreconditionsRef.current
    )
    setIsDirty(solutionChanged || operationsChanged || preconditionsChanged)
  }, [currentsolution, operationList, preconditions])
  const formattedPreconditions = useFormattedPreconditions(
    true,
    operations[0].preconditions
      ? preconditions
      : [{ id: '', method: '', value: '' }]
  )
  const isOperationsValid = useMemo(() => {
    if (!hasOperations) return true

    return operationList.every((op) => {
      if (!op.method) return false

      const requiredFields = operationFormFields[op.method] || []
      return requiredFields.every((field) => {
        const value = op[field.name]
        return value !== undefined && value !== ''
      })
    })
  }, [hasOperations, operationList])

  const isFormValid = useMemo(() => {
    const arePreconditionsValid =
      !hasPreconditions ||
      formattedPreconditions.every((precondition) => {
        if (!precondition.id || !precondition.method) return false
        if (
          !['exists', 'not_exists'].includes(precondition.method) &&
          !precondition.value
        )
          return false
        return true
      })
    return arePreconditionsValid && isOperationsValid
  }, [hasPreconditions, formattedPreconditions, isOperationsValid])
  useEffect(() => {
    const newOperations =
      activeRule === 'request' ? requestOperations : responseOperations

    setOperationList(newOperations[0]?.operationList || [])
    setPreconditions(newOperations[0]?.preconditions || [])
  }, [activeRule, requestOperations, responseOperations])

  useEffect(() => {
    if (!_.isEmpty(alert.level)) {
      setShowSnackbar(true)
    } else {
      setShowSnackbar(false)
    }
  }, [alert])
  const handleClose = () => {
    setShowSnackbar(false)
    setAlert({
      level: '',
      message: '',
    })
  }

  const handleSwitchRule = () => {
    if (activeRule === 'request' && response) {
      setActiveRule('response')
    } else if (activeRule === 'response' && request) {
      setActiveRule('request')
    }
  }

  const handleSave = async () => {
    const transformedPreconditions = !hasPreconditions
      ? []
      : transformPreconditions(
          preconditionsData,
          preconditionMethodsData,
          formattedPreconditions
        )
    const transformedOperationList = transformOperations(
      operationList,
      operationFieldsData
    )
    let requestBody
    if (activeRule === 'request') {
      requestBody = {
        ...currentsolution,
        responseOperations: [],
        requestOperations: [
          {
            preconditions: transformedPreconditions,
            operationList: transformedOperationList,
          },
        ],
      }
    }
    if (activeRule === 'response') {
      requestBody = {
        ...currentsolution,
        requestOperations: [],
        responseOperations: [
          {
            preconditions: transformedPreconditions,
            operationList: operationList,
          },
        ],
      }
    }
    const res = await updateSolution(query.id as string, requestBody)
    if (!res.success) {
      console.error('Error saving solution:', res.error)
      setAlert({
        level: 'error',
        message: 'Error! Could not save solution!',
      })
    } else {
      setIsDirty(false)
      setAlert({
        level: 'success',
        message: 'Solution Saved Successfully!',
      })
    }
  }

  const handleAddPrecondition = useCallback(() => {
    setHasPreconditions(true)
    setPreconditions((prev) => [...prev, { id: '', method: '', value: '' }])
  }, [setHasPreconditions, setPreconditions])

  const handleAddOperation = () => {
    setHasOperations(true)
    setOperationList((prev) => [...prev, { method: '' }])
  }

  return (
    <Container title="Solution">
      <ErrorBoundary>
        <Close path={'/solutions'} />
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
          <Box sx={{ position: 'relative', width: { sm: '100%', md: '35%' } }}>
            <RuleInfo
              solutionData={currentsolution}
              setSolutionData={(updatedSolution) => {
                setCurrentSolution(updatedSolution)
                setIsDirty(true)
              }}
            />
          </Box>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                position: 'relative',
                mb: 2,
              }}
            >
              <CreateRule ruleType={activeRule} />
            </Box>
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
                    setPreconditions={(newPreconditions) => {
                      setPreconditions(newPreconditions)
                      setIsDirty(true)
                    }}
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
            <Box
              sx={{
                width: '100%',
                position: 'relative',
              }}
            >
              <Card
                sx={{
                  minWidth: 250,
                  borderRadius: '0px 0px 30px 30px',
                  marginTop: 2,
                }}
              >
                <CardHeader title="Operations" />
                <Divider />
                <CardContent>
                  <Typography pb={2} gutterBottom variant="body1">
                    To add multiple operations, select add new operation and
                    fill in the type and required fields.
                  </Typography>
                  <Operations
                    operations={operationList}
                    setOperations={(newOperationList) => {
                      setOperationList(newOperationList)
                    }}
                    operationTypeData={operationTypeData}
                    operationFieldsData={operationFieldsData}
                    setHasOperations={setHasOperations}
                  />
                  <Button
                    data-testid="add-more-operation-button"
                    sx={{
                      marginBottom: 3,
                      display: 'inline-flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                    }}
                    onClick={handleAddOperation}
                    variant="outlined"
                    endIcon={<PlaylistAddIcon />}
                  >
                    Add New Operation
                  </Button>
                </CardContent>
              </Card>
            </Box>
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
                {request && response && (
                  <Button
                    id="response"
                    data-testid="response-button"
                    color="error"
                    variant="outlined"
                    onClick={handleSwitchRule}
                    disabled={isDirty}
                    sx={{
                      borderRadius: '30px',
                      display: 'flex',
                      flex: 1,
                      maxWidth: '125px',
                    }}
                  >
                    {activeRule === 'request'
                      ? 'Go to Response Rule'
                      : 'Go to Request Rule'}
                  </Button>
                )}
                <Tooltip title="Save rule" arrow placement="bottom">
                  <Button
                    id="save"
                    data-testid="save-button"
                    color="secondary"
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isDirty || !isFormValid}
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
        <CustomSnackbar
          open={showSnackbar}
          severity={alert.level}
          message={alert.message}
          onClose={handleClose}
        />
      </ErrorBoundary>
    </Container>
  )
}

export default CreateSolution
