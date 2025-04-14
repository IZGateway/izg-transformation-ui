import CreateSolution from '../../../components/CreateSolution/index'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import fetchDataFromEndpoint from '../../api/serverside/FetchDataFromEndpoint'

const AddSolution = (props) => {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    if (!isReady) return
  }),
    [isReady, query]

  return !isReady ? (
    <>Loading....</>
  ) : (
    <Container title="Add Solution">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <CreateSolution
              solutionData={null}
              requestOperations={{}}
              responseOperations={{}}
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

export default AddSolution

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
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
      `${XFORM_SERVICE_ENDPOINT}/api/v1/operation/fields`,
      context.req
    )
    return {
      props: {
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
