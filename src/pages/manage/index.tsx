import * as React from 'react'
import ConnectionsTable from '../../components/ConnectionTable'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'

const Manage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <Container title="Manage Pipelines">
      <AppHeaderBar open />
      <ErrorBoundary>
        <ConnectionsTable data={props.data} />
      </ErrorBoundary>
    </Container>
  )
}

export default Manage

export const getServerSideProps = async () => {
  const TS_ENDPOINT = process.env.TS_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=10`
    )
    const organizationsData = organizationsResponse.data
    const pipelineResponse = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/pipelines`
    )

    const pipelineData = pipelineResponse.data
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
