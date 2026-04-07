import * as React from 'react'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import Footer from '../../components/Footer/index'
import MappingTable from '../../components/MappingTable'
import { useEffect, useState } from 'react'
import CustomSnackbar from '../../components/SnackBar'

const Mapping = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    const msg = sessionStorage.getItem('mappingSuccessMessage')
    if (msg) {
      setSnackbarMessage(msg)
      setSnackbarOpen(true)
      sessionStorage.removeItem('mappingSuccessMessage')
    }
  }, [])

  return (
    <Container title="Manage Mappings">
      <AppHeaderBar open />
      <ErrorBoundary>
        <MappingTable data={props.data} />
      </ErrorBoundary>
      <Footer />
      <CustomSnackbar
        open={snackbarOpen}
        severity="success"
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  )
}

export default Mapping

export const getServerSideProps = async (context: any) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const organizationsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/organizations?includeInactive=false&limit=1000`,
      context.req
    )
    const organizationsData = await organizationsResponse.data

    const mappingsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/mappings?includeInactive=true`,
      context.req
    )
    const mappingsData = await mappingsResponse.data
    const combinedData = combineData(organizationsData, mappingsData)
    return { props: { data: combinedData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}

const combineData = (organizationsData: any[], mappingsData: any[]) => {
  const organizationsMap: { [key: string]: any } = {}
  organizationsData.forEach((org) => {
    organizationsMap[org.id] = org
  })

  const combinedData = []
  mappingsData.forEach((pipe) => {
    const orgid = pipe.organizationId
    if (organizationsMap[orgid]) {
      const combinedObject = {
        ...organizationsMap[orgid],
        ...pipe,
      }

      combinedData.push(combinedObject)
    }
  })
  console.log(JSON.stringify(combinedData, null, 2))
  return combinedData
}
