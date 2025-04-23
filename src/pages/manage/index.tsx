import * as React from 'react'
import PipelinesTable from '../../components/PipelinesTable'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import Footer from '../../components/Footer/index'

const Manage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <Container title="Manage Pipelines">
      <AppHeaderBar open />
      <ErrorBoundary>
        <PipelinesTable data={props.data} />
      </ErrorBoundary>
      <Footer />
    </Container>
  )
}

export default Manage

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=1000`,
      context.req
    )
    const organizationsData = await organizationsResponse.data

    const pipelineResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/pipelines?limit=1000`,
      context.req
    )
    const pipelineData = await pipelineResponse.data

    const combinedData = combineData(organizationsData, pipelineData)
    return { props: { data: combinedData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}

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
