import { Box } from '@mui/material'
import { InferGetServerSidePropsType } from 'next'
import Container from '../../../components/Container'
import ErrorBoundary from '../../../components/ErrorBoundary'
import CreatePipeline from '../../../components/CreatePipeline'
import AppHeaderBar from '../../../components/AppHeader'
import Footer from '../../../components/Footer'
import fetchDataFromEndpoint from '../../api/serverside/FetchDataFromEndpoint'
import PreconditionProvider from '../../../contexts/EditPipeline/preconditionContext'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import UpdatePipelineDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'

const AddPipeline = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <Container title="New Pipeline">
      <AppHeaderBar open />
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <PreconditionProvider
            preconditionsData={props.preconditionsData}
            preconditionMethodsData={props.preconditionMethodsData}
          >
            <SolutionsDataProvider solutionsData={props.solutionsData.data}>
              <UpdatePipelineDataProvider currentOrder={[]}>
                <CreatePipeline organizations={props.organizationsData} />
              </UpdatePipelineDataProvider>
            </SolutionsDataProvider>
          </PreconditionProvider>
        </Box>
      </ErrorBoundary>
      <Footer />
    </Container>
  )
}

export default AddPipeline

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=1000`,
      context.req
    )
    const organizationsData =
      organizationsResponse.data ?? organizationsResponse
    const solutionsData = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions?limit=1000000`,
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
        organizationsData,
        solutionsData,
        preconditionsData,
        preconditionMethodsData,
      },
    }
  } catch (error) {
    console.error('Error fetching data for new pipeline page:', error)
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}
