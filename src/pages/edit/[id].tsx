/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import EditPipeline from '../../components/EditPipeline/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import pushDataToEndpoint from '../api/serverside/PushDataToEndpoint'
import { updateData } from '../../components/EditPipeline/updatePipeline'

const Edit = (props) => {
  const router = useRouter()
  const { isReady, query } = router

  const [pipeData, setPipeData] = React.useState(props.pipeData)

  useEffect(() => {
    if (!isReady) return

    if (pipeData !== props.pipeData) {
      updateData(query.id as string, pipeData)
        .then((updatedData) => {
          console.log('Data updated successfully:', updatedData)
        })
        .catch((error) => {
          console.error('Failed to update data:', error)
        })
    }
  }, [isReady, query, pipeData, props.pipeData])

  return !isReady ? (
    <>Loading....</>
  ) : (
    <Container title="Edit Connection">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <div>
            <EditPipeline
              pipeData={pipeData}
              orgData={props.orgData}
              solutionsData={props.solutionsData}
              setPipeData={setPipeData}
              preconditionsData={props.preconditionsData}
              preconditionMethodsData={props.preconditionMethodsData}
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
    const preconditionsData = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/preconditions/fields`
    )
    const preconditionMethodsData = await fetchDataFromEndpoint(
      `${TS_ENDPOINT}/api/v1/preconditions/available`
    )
    return {
      props: {
        pipeData: pipeData,
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
