import EditPipeline from '../../components/EditPipeline'
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
const Edit = (props) => {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    if (!isReady) return
  }),
    [isReady, query]

  return !isReady ? (
    <>Loading....</>
  ) : (
    <Container title="Edit Pipeline">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <PreconditionProvider
              preconditionsData={props.preconditionsData}
              preconditionMethodsData={props.preconditionMethodsData}
            >
              <SolutionsDataProvider solutionsData={props.solutionsData.data}>
                <PipelineDataProvider pipelineData={props.pipelineData}>
                  <UpdatePipelineDataProvider
                    currentOrder={props.pipelineData.pipes}
                  >
                    <EditPipeline orgData={props.orgData} />
                  </UpdatePipelineDataProvider>
                </PipelineDataProvider>
              </SolutionsDataProvider>
            </PreconditionProvider>
          </div>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default Edit

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const pipelineData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines/${context.params.id}`,
      context.req
    )
    const organizationData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations/${pipelineData.organizationId}`,
      context.req
    )
    const solutionsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions`,
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
    return {
      props: {
        pipelineData: pipelineData,
        orgData: organizationData,
        solutionsData: solutionsData,
        preconditionsData: preconditionsData,
        preconditionMethodsData: preconditionMethodsData,
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
