import Container from '../../components/Container'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import {
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'
import Close from '../Close'
import {
  Typography,
  Tooltip,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
} from '@mui/material'
import SolutionInfo from './solutionInfo'
import React from 'react'
import _ from 'lodash'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Operations, { operationFormFields } from './operations'
import PreconditionsSection from '../EditPipeline/Modal/preconditionsSection'
import {
  transformPreconditions,
  useFormattedPreconditions,
} from '../EditPipeline/Modal/utils'
import { updateSolution } from './updateSolution'
import { reverseTransformOperations, transformOperations } from './utils'
import CombinedContext from '../../contexts/app'
import CustomSnackbar from '../SnackBar'
import { addSolution } from './addSolution'
import { v4 as uuidv4 } from 'uuid'
import SolutionHeader from './solutionHeader'

const CreateSolution = ({
  solutionData,
  mutateSolution,
  requestOperations,
  responseOperations,
  preconditionsData,
  preconditionMethodsData,
  operationTypeData,
  operationFieldsData,
  existingPreconditions = [{ id: '', method: '', value: '' }],
}) => {
  const router = useRouter()
  const { query } = router
  const { alert, setAlert } = useContext(CombinedContext)
  const isEditMode = !!solutionData?.id
  const request = _.isEmpty(requestOperations) ? false : true
  const response = _.isEmpty(responseOperations) ? false : true
  const [currentSolutionTab, setCurrentSolutionTab] = useState(() => {
    if (isEditMode) {
      if (request && response) return 'request'
      if (request) return 'request'
      if (response) return 'response'
    } else {
      return 'request'
    }
  })
  const operations =
    currentSolutionTab === 'request' ? requestOperations : responseOperations
  const [currentsolution, setCurrentSolution] = useState(() =>
    isEditMode
      ? solutionData
      : {
          solutionName: '',
          description: '',
          version: '',
          active: true,
        }
  )
  const [operationList, setOperationList] = useState(() =>
    isEditMode && operations?.[0]?.operationList
      ? reverseTransformOperations(
          operations[0].operationList,
          operationFieldsData
        )
      : []
  )
  const [preconditions, setPreconditions] = useState(() =>
    isEditMode && operations?.[0]?.preconditions
      ? operations[0].preconditions
      : []
  )
  const [hasPreconditions, setHasPreconditions] = useState(
    preconditions.length > 0
  )
  const [hasOperations, setHasOperations] = useState(operationList.length > 0)
  const [isDirty, setIsDirty] = useState(false)
  const initialSolutionRef = useRef(currentsolution)
  const initialOperationsRef = useRef(operationList)
  const initialPreconditionsRef = useRef(preconditions)
  const [showSnackbar, setShowSnackbar] = useState(false)

  useEffect(() => {
    if (!isEditMode) return

    const selected =
      currentSolutionTab === 'request' ? requestOperations : responseOperations
    const reversedOps = reverseTransformOperations(
      selected?.[0]?.operationList || [],
      operationFieldsData
    )
    const initialPreconds = selected?.[0]?.preconditions || []

    setOperationList(reversedOps)
    setPreconditions(initialPreconds)

    initialOperationsRef.current = reversedOps
    initialPreconditionsRef.current = initialPreconds
    initialSolutionRef.current = solutionData
  }, [
    currentSolutionTab,
    requestOperations,
    responseOperations,
    isEditMode,
    solutionData,
  ])

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

  useEffect(() => {
    if (!_.isEmpty(alert.level)) {
      setShowSnackbar(true)
    } else {
      setShowSnackbar(false)
    }
  }, [alert])

  const formattedPreconditions = useFormattedPreconditions(
    hasPreconditions,
    existingPreconditions ? preconditions : [{ id: '', method: '', value: '' }]
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
    const isOperationsValid =
      operationList.length === 0 ||
      operationList.every((op) => {
        if (!op.method) return false

        const requiredFields = operationFormFields[op.method] || []
        return requiredFields.every((field) => {
          const value = op[field.name]
          return value !== undefined && value !== ''
        })
      })

    const arePreconditionsValid =
      preconditions.length === 0 ||
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
  }, [operationList, preconditions, formattedPreconditions])

  const handleClose = () => {
    setShowSnackbar(false)
    setAlert({
      level: '',
      message: '',
    })
  }

  const handleSwitchSolution = () => {
    setCurrentSolutionTab((prev) =>
      prev === 'request' ? 'response' : 'request'
    )
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
    const solutionOperations = {
      preconditions: transformedPreconditions,
      operationList: transformedOperationList,
    }

    const requestBody = {
      ...currentsolution,
      requestOperations:
        currentSolutionTab === 'request'
          ? [solutionOperations]
          : requestOperations,
      responseOperations:
        currentSolutionTab === 'response'
          ? [solutionOperations]
          : responseOperations,
    }

    if (!isEditMode && !requestBody.id) {
      requestBody.id = uuidv4()
    }

    const res = isEditMode
      ? await updateSolution(query.id as string, requestBody)
      : await addSolution(requestBody)

    if (!res.success) {
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
      mutateSolution()
    }
  }
  const isSolutionInfoValid =
    !_.isEmpty(currentsolution.solutionName) &&
    !_.isEmpty(currentsolution.description) &&
    !_.isEmpty(currentsolution.solutionName)

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
          <Box
            sx={{
              position: 'relative',
              width: { sm: '100%', md: '35%' },
              minWidth: 350,
            }}
          >
            <SolutionInfo
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
              <SolutionHeader currentSolutionTab={currentSolutionTab} />
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
                <CardContent
                  sx={{
                    pb: '0!important',
                  }}
                >
                  {preconditions.length > 0 && (
                    <PreconditionsSection
                      preconditions={formattedPreconditions}
                      setPreconditions={(newPreconditions) => {
                        setPreconditions(newPreconditions)
                        setIsDirty(true)
                      }}
                      preconditionMethodsData={preconditionMethodsData}
                      preconditionsData={preconditionsData}
                      setHasPreconditions={setHasPreconditions}
                    />
                  )}
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
                  pb: 0,
                  mb: 6,
                }}
              >
                <CardHeader title="Operations" />
                <Divider />
                <CardContent
                  sx={{
                    pb: '0!important',
                  }}
                >
                  <Typography gutterBottom variant="body1">
                    To add multiple operations, select add new operation and
                    fill in the type and required fields.
                  </Typography>
                  <Operations
                    operations={operationList}
                    setOperations={(newOperationList) => {
                      setOperationList(newOperationList)
                      setIsDirty(true)
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
                      zIndex: 10,
                      bgcolor: 'white',
                      ':hover': {
                        bgcolor: 'white',
                      },
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
                border: `1px solid #CCC`,
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
                <Button
                  id="response"
                  data-testid="response-button"
                  color="primary"
                  variant="outlined"
                  onClick={handleSwitchSolution}
                  disabled={isDirty}
                  endIcon={
                    <ArrowForwardIcon
                      sx={{
                        transform:
                          currentSolutionTab === 'request'
                            ? 'rotate(0deg)'
                            : 'rotate(180deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  }
                  sx={{
                    borderRadius: '30px',
                    display: 'flex',
                    mr: 'auto',
                  }}
                >
                  {currentSolutionTab === 'request'
                    ? 'Go to Response Solution'
                    : 'Go to Request Solution'}
                </Button>
                <Tooltip title="Save solution" arrow placement="bottom">
                  <Button
                    id="save"
                    data-testid="save-button"
                    color="secondary"
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isDirty || !isFormValid || !isSolutionInfoValid}
                    sx={{
                      borderRadius: '30px',
                      display: 'flex',
                    }}
                  >
                    Save Solution
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
