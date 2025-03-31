import CreateSolution from '../../components/CreateSolution/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
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
              preconditionsData={props.preconditionsData}
              preconditionMethodsData={props.preconditionMethodsData}
              operationTypeData={props.operationTypeData}
              operationFieldsData={props.operationFieldsData}
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
    const preconditionsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/preconditions/fields`,
      context.req
    )
    const preconditionMethodsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/preconditions/available`,
      context.req
    )
    const operationTypeData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/operations/available`,
      context.req
    )
    const operationFieldsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/operations/fields`,
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
        preconditionsData: preconditionsData,
        preconditionMethodsData: preconditionMethodsData,
        operationTypeData: operationTypeData,
        operationFieldsData: operationFieldsData,
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
