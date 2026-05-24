import CreateSolution from '../../../components/CreateSolution'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateSolution/utils'
import { useState } from 'react'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'

const AddSolution = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  const { data: preconditionsData, isLoading: isLoadingPreconditions } = useSWR(
    `/api/preconditions/fields`,
    fetcher
  )

  const { data: preconditionMethodsData } = useSWR(
    `/api/preconditions/available`,
    fetcher
  )

  const { data: operationTypeData } = useSWR(
    `/api/operations/available`,
    fetcher
  )

  const { data: operationFieldsData } = useSWR(
    `/api/operations/fields`,
    fetcher
  )

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
