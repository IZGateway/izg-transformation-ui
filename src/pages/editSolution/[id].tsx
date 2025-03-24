import CreateSolution from '../../components/CreateSolution/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import PipelineDataProvider from '../../contexts/EditPipeline/pipelineDataContext'
import PreconditionProvider from '../../contexts/EditPipeline/preconditionContext'
import SolutionsDataProvider from '../../contexts/EditPipeline/solutionsDataContext'
import UpdatePipelineDataProvider from '../../contexts/EditPipeline/updatePipeDataContext'
const EditSolution = (props) => {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    if (!isReady) return
  }),
    [isReady, query]

  return !isReady ? (
    <>Loading....</>
  ) : (
    <Container title="Edit Solution">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <CreateSolution
              solutionData={props.solutionData}
              requestOperations={props.requestOperations}
              responseOperations={props.responseOperations}
            />
          </div>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default EditSolution

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const solutionData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions/${context.params.id}`,
      context.req
    )

    return {
      props: {
        solutionData: {
          id: solutionData.id,
          name: solutionData.solutionName,
          description: solutionData.description,
          version: solutionData.version,
          active: solutionData.active,
        },
        requestOperations: solutionData.requestOperations
          ? solutionData.requestOperations
          : {},
        responseOperations: solutionData.responseOperations
          ? solutionData.responseOperations
          : {},
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
