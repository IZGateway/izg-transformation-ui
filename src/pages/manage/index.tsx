import * as React from 'react'
import { useState } from 'react'
import PipelinesTable from '../../components/PipelinesTable'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import Footer from '../../components/Footer/index'
import { Box } from '@mui/material'
import HelpButton from '../../components/HelpButton'
import HelpPanel from '../../components/HelpPanel'
import ServiceUnavailablePage from '../../components/ServiceUnavailablePage'
import { isServiceUnavailableError } from '../../utility/serviceUnavailable'
import { withRequestContext } from '../../lib/requestContext'

const Manage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [helpOpen, setHelpOpen] = useState(false)

  if (props.serviceUnavailable) {
    return (
      <Container title="Manage Pipelines">
        <AppHeaderBar open />
        <ServiceUnavailablePage />
        <Footer />
      </Container>
    )
  }


  return (
    <Container title="Manage Pipelines">
      <AppHeaderBar open />
      <ErrorBoundary>
        <PipelinesTable data={props.data ?? []} />
      </ErrorBoundary>
      <Footer />
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="pipelines/index"
        title="Pipelines Help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default Manage

export const getServerSideProps = withRequestContext(async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=1000`,
      context.req
    )
    const organizationsData = await organizationsResponse.data

    const pipelineResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines?includeInactive=true&limit=1000`,
      context.req
    )
    const pipelineData = await pipelineResponse.data

    const combinedData = combineData(organizationsData, pipelineData)
    return { props: { data: combinedData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    if (isServiceUnavailableError(error)) {
      return { props: { serviceUnavailable: true } }
    }
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})

const combineData = (organizationsData, pipeData) => {
  const organizationsMap = {}
  organizationsData.forEach((org) => {
    organizationsMap[org.id] = org
  })

  const combinedData = []
  pipeData.forEach((pipe) => {
    const orgid = pipe.organizationId
    if (organizationsMap[orgid]) {
      const combinedObject = {
        ...organizationsMap[orgid],
        ...pipe,
      }

      combinedData.push(combinedObject)
    }
  })
  return combinedData
}
