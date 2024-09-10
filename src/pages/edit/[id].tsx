/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import EditPipeline from '../../components/EditPipeline/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import axios from 'axios'
import * as fs from 'fs'
import path from 'path'
import https from 'https'

const Edit = (props) => {
  const router = useRouter()
  const { isReady, query } = router
  useEffect(() => {
    if (!isReady) return
  }, [isReady, query])
  return !isReady ? (
    <>Loading....</>
  ) : (
    <Container title="Edit Connection">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <EditPipeline
              pipeId={router?.query?.id as string}
              pipeData={props.pipeData}
              orgData={props.orgData}
            />
          </div>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default Edit

export const getServerSideProps = async (context) => {
  const TS_ENDPOINT = process.env.TS_ENDPOINT || ''
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
    const pipeResponse = await axios.get(
      `${TS_ENDPOINT}/api/v1/pipelines/${context.params.id}`,
      {
        httpsAgent: new https.Agent(httpsAgentOptions),
        timeout: 30000,
      }
    )
    const organizationResponse = await axios.get(
      `${TS_ENDPOINT}/api/v1/organizations/${pipeResponse.data.organizationId}`,
      {
        httpsAgent: new https.Agent(httpsAgentOptions),
        timeout: 30000,
      }
    )
    return {
      props: {
        pipeData: pipeResponse.data,
        orgData: organizationResponse.data,
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
