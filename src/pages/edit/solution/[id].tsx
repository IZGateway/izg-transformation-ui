import CreateSolution from '../../../components/CreateSolution/index'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateSolution/utils'
import { useState } from 'react'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'
import ServiceUnavailablePage from '../../../components/ServiceUnavailablePage'

const EditSolution = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  const router = useRouter()
  const { isReady, query } = router
  const { id } = query

  const {
    data: solutionData,
    isLoading: isLoadingSolution,
    mutate: mutateSolutionData,
    error: errorSolution,
  } = useSWR(isReady ? `/api/solutions/${id}` : null, fetcher)

  const { data: preconditionsData, error: errorPreconditions } = useSWR(
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

  const fetchError = errorSolution || errorPreconditions || errorPreconditionMethods || errorOperationType || errorOperationFields

  if (fetchError) return <Container title="Edit Solution"><ServiceUnavailablePage /></Container>

  if (!isReady || isLoadingSolution || !solutionData) return <>Loading...</>

  return (
    <Container title="Edit Solution">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <CreateSolution
              solutionData={{
                id: solutionData.id,
                solutionName: solutionData.solutionName,
                description: solutionData.description,
                version: solutionData.version,
                active: solutionData.active,
              }}
              mutateSolution={mutateSolutionData}
              requestOperations={solutionData.requestOperations || []}
              responseOperations={solutionData.responseOperations || []}
              preconditionsData={preconditionsData || []}
              preconditionMethodsData={preconditionMethodsData || []}
              operationTypeData={operationTypeData || []}
              operationFieldsData={operationFieldsData || []}
            />
          </div>
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

export default EditSolution
