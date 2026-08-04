import { Box } from '@mui/material'
import { InferGetServerSidePropsType } from 'next'
import { useState } from 'react'
import Container from '../../../components/Container'
import ErrorBoundary from '../../../components/ErrorBoundary'
import CreatePipeline from '../../../components/CreatePipeline'
import AppHeaderBar from '../../../components/AppHeader'
import Footer from '../../../components/Footer'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'
import fetchDataFromEndpoint from '../../api/serverside/FetchDataFromEndpoint'
import PreconditionProvider from '../../../contexts/EditPipeline/preconditionContext'
import SolutionsDataProvider from '../../../contexts/EditPipeline/solutionsDataContext'
import UpdatePipelineDataProvider from '../../../contexts/EditPipeline/updatePipeDataContext'
import ServiceUnavailablePage from '../../../components/ServiceUnavailablePage'
import { isServiceUnavailableError } from '../../../utility/serviceUnavailable'
import { withRequestContext } from '../../../lib/requestContext'

const AddPipeline = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [helpOpen, setHelpOpen] = useState(false)

  if (props.serviceUnavailable) {
    return (
      <Container title="New Pipeline">
        <AppHeaderBar open />
        <ServiceUnavailablePage />
        <Footer />
      </Container>
    )
  }


  return (
    <Container title="New Pipeline">
      <AppHeaderBar open />
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <PreconditionProvider
            preconditionsData={props.preconditionsData ?? []}
            preconditionMethodsData={props.preconditionMethodsData ?? []}
          >
            <SolutionsDataProvider solutionsData={props.solutionsData?.data ?? []}>
              <UpdatePipelineDataProvider currentOrder={[]}>
                <CreatePipeline organizations={props.organizationsData ?? []} />
              </UpdatePipelineDataProvider>
            </SolutionsDataProvider>
          </PreconditionProvider>
        </Box>
      </ErrorBoundary>
      <Footer />
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="pipelines/create-edit"
        title="Pipeline Help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default AddPipeline

export const getServerSideProps = withRequestContext(async (context) => {
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
    if (isServiceUnavailableError(error)) {
      return { props: { serviceUnavailable: true } }
    }
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})
