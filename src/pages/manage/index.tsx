import * as React from 'react'
import ConnectionsTable from '../../components/ConnectionTable'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import axios from 'axios'
import * as fs from 'fs'
import path from 'path'
import https from 'https'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'

const Manage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <Container title="Manage Connections">
      <AppHeaderBar open />
      <ErrorBoundary>
        <ConnectionsTable data={props.data} />
      </ErrorBoundary>
    </Container>
  )
}

export default Manage

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    throw new Error('No server session found.')
  }

  const TS_ENDPOINT = process.env.TS_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=10`,
      session
    )
    const organizationsData = organizationsResponse.data
    const pipelineResponse = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/pipelines`,
      session
    )
    const pipelineData = pipelineResponse.data
    const combinedData = combineData(organizationsData, pipelineData)
    return { props: { data: combinedData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}

const fetchDataFromEndpoint = async (endpoint, session) => {
  const IZG_ENDPOINT_CRT_PATH = process.env.IZG_ENDPOINT_CRT_PATH || ''
  const IZG_ENDPOINT_KEY_PATH = process.env.IZG_ENDPOINT_KEY_PATH || ''
  const IZG_ENDPOINT_PASSCODE = process.env.IZG_ENDPOINT_PASSCODE || ''
  const httpsAgentOptions = {
    cert: fs.readFileSync(path.resolve(IZG_ENDPOINT_CRT_PATH), 'utf-8'),
    key: fs.readFileSync(path.resolve(IZG_ENDPOINT_KEY_PATH), 'utf-8'),
    passphrase: IZG_ENDPOINT_PASSCODE,
    rejectUnauthorized: false,
    keepAlive: true,
  }
  try {
    console.log('Fetching data from endpoint: ' + endpoint)
    console.log('Request headers: ', {
      Authorization: `Bearer ${session.accessToken}`,
    })

    const response = await axios.get(endpoint, {
      httpsAgent: new https.Agent(httpsAgentOptions),
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    return response.data
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
