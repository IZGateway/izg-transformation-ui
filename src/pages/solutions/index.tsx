import * as React from 'react'
import { useState } from 'react'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import Footer from '../../components/Footer/index'
import SolutionsTable from '../../components/SolutionsTable'
import { Box } from '@mui/material'
import HelpButton from '../../components/HelpButton'
import HelpPanel from '../../components/HelpPanel'
import ServiceUnavailablePage from '../../components/ServiceUnavailablePage'
import { isServiceUnavailableError } from '../../utility/serviceUnavailable'
import { withRequestContext } from '../../lib/requestContext'

const Solutions = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [helpOpen, setHelpOpen] = useState(false)

  if (props.serviceUnavailable) {
    return (
      <Container title="Solutions Creator">
        <AppHeaderBar open />
        <ServiceUnavailablePage />
        <Footer />
      </Container>
    )
  }


  return (
    <Container title="Solutions Creator">
      <AppHeaderBar open />
      <ErrorBoundary>
        <SolutionsTable data={props.data ?? []} />
      </ErrorBoundary>
      <Footer />
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="solutions/index"
        title="Solutions Help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default Solutions

export const getServerSideProps = withRequestContext(async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const solutionsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions?includeInactive=true&limit=100`,
      context.req
    )
    const organizationsData = await solutionsResponse.data
    return { props: { data: organizationsData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    if (isServiceUnavailableError(error)) {
      return { props: { serviceUnavailable: true } }
    }
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})
