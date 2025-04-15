import CreateSolution from '../../../components/CreateSolution/index'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { fetcher } from '../../../components/CreateSolution/utils'
import useSWR from 'swr'

const AddSolution = () => {
  const router = useRouter()
  const { isReady, query } = router

  const { id } = query

  const {
    data: solutionData,
    isLoading: isLoadingSolution,
    mutate: mutateSolutionData,
  } = useSWR(isReady ? `/api/solutions/${id}` : null, fetcher)

  const { data: preconditionsData } = useSWR(
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

  if (!isReady || isLoadingSolution || !solutionData) return <>Loading...</>

  return (
    <Container title="Add Solution">
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
    </Container>
  )
}

export default AddSolution
