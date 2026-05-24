import CreateSolution from '../../../components/CreateSolution'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateSolution/utils'
import { useState } from 'react'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'
import ServiceUnavailablePage from '../../../components/ServiceUnavailablePage'

const AddSolution = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  const { data: preconditionsData, isLoading: isLoadingPreconditions, error: errorPreconditions } = useSWR(
    `/api/preconditions/fields`,
    fetcher
  )

  const { data: preconditionMethodsData, error: errorPreconditionMethods } = useSWR(
    `/api/preconditions/available`,
    fetcher
  )

  const { data: operationTypeData, error: errorOperationType } = useSWR(
    `/api/operations/available`,
    fetcher
  )

  const { data: operationFieldsData, error: errorOperationFields } = useSWR(
    `/api/operations/fields`,
    fetcher
  )

  const fetchError = errorPreconditions || errorPreconditionMethods || errorOperationType || errorOperationFields

  if (fetchError) return <Container title="Add Solution"><ServiceUnavailablePage /></Container>

  const isLoading =
    isLoadingPreconditions ||
    !preconditionsData ||
    !preconditionMethodsData ||
    !operationTypeData ||
    !operationFieldsData

  if (isLoading) return <>Loading...</>
  return (
    <Container title="Add Solution">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <CreateSolution
            solutionData={{
              id: '',
              solutionName: '',
              description: '',
              version: '',
              active: true,
            }}
            requestOperations={[]}
            responseOperations={[]}
            preconditionsData={preconditionsData || []}
            preconditionMethodsData={preconditionMethodsData || []}
            operationTypeData={operationTypeData || []}
            operationFieldsData={operationFieldsData || []}
          />
        </Box>
      </ErrorBoundary>
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="solutions/create-edit"
        title="Solution Help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default AddSolution
