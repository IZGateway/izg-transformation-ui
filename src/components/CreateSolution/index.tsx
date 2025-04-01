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
          }}
        >
          <Box sx={{ position: 'relative', width: '35%' }}>
            <RuleInfo
              solutionData={currentsolution}
              setSolutionData={setCurrentSolution}
            />
          </Box>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={[
                {
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '1em',
                  height: '5em',
                  background: `linear-gradient(to top, rgb(from ${palette.background} r g b / 0) 0%,rgb(from ${palette.background} r g b / 1) 100%)`,
                  // opacity: isScrollable ? (showTopGradient ? 0 : 1) : 0,
                  // transition: showTopGradient
                  //   ? 'opacity 100ms ease-in'
                  //   : 'opacity 100ms ease-out',
                  pointerEvents: 'none',
                  zIndex: 50,
                },
                { zoom: '100% / ' },
              ]}
            />
            <Box
              // onScroll={handleScroll}
              // ref={(element) =>
              //   element && checkScrollability(element as HTMLDivElement)
              // }
              sx={{
                width: '-webkit-fill-available',
                position: 'relative',
                paddingLeft: 1,
                paddingRight: 1,
                paddingBottom: 1,
                maxHeight: 'calc(100vh - 275px)',
                overflowY: 'auto',
              }}
            >
              <CreateRule ruleType={rule} />
            </Box>
            <Box
              // onScroll={handleScroll}
              // ref={(element) =>
              //   element && checkScrollability(element as HTMLDivElement)
              // }
              sx={{
                width: '-webkit-fill-available',
                position: 'relative',
                paddingLeft: 1,
                paddingRight: 1,
                paddingBottom: 1,
                maxHeight: 'calc(100vh - 275px)',
                overflowY: 'auto',
              }}
            >
              <Card
                sx={{
                  minWidth: 275,
                  borderRadius: '0px 0px 30px 30px',
                  marginTop: 4,
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
                  >
                    Add New Precondition
                    <PlaylistAddIcon />
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box
              // onScroll={handleScroll}
              // ref={(element) =>
              //   element && checkScrollability(element as HTMLDivElement)
              // }
              sx={{
                width: '-webkit-fill-available',
                position: 'relative',
                paddingLeft: 1,
                paddingRight: 1,
                paddingBottom: 1,
                maxHeight: 'calc(100vh - 275px)',
                overflowY: 'auto',
              }}
            >
              <Operations
                operations={operationList}
                setOperations={setOperationList}
                operationTypeData={operationTypeData}
                operationFieldsData={operationFieldsData}
              />
            </Box>
            <CardContent sx={{ padding: '16px !important' }}>
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
            </CardContent>
          </Box>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default CreateSolution
