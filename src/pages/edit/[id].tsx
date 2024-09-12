/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import EditPipeline from '../../components/EditPipeline/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'


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
              solutionsData={props.solutionsData}
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
  try {
    const pipeData = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/pipelines/${context.params.id}`
    )
    const organizationData = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/organizations/${pipeData.organizationId}`
    )
    const solutionsData = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/solutions`
    )
    return {
      props: {
        pipeData: pipeData,
        orgData: organizationData,
        solutionsData: solutionsData,
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}

