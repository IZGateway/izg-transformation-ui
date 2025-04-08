import * as React from 'react'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'
import fetchDataFromEndpoint from '../api/serverside/FetchDataFromEndpoint'
import Footer from '../../components/Footer/index'
import SolutionsTable from '../../components/SolutionsTable'

const Solutions = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <Container title="Solutions Creator">
      <AppHeaderBar open />
      <ErrorBoundary>
        <SolutionsTable data={props.data} />
      </ErrorBoundary>
      <Footer />
    </Container>
  )
}

export default Solutions

export const getServerSideProps = async (context) => {
  const XFORM_SERVICE_ENDPOINT = process.env.XFORM_SERVICE_ENDPOINT || ''
  try {
    const solutionsResponse = await fetchDataFromEndpoint(
      `${XFORM_SERVICE_ENDPOINT}/api/v1/solutions?includeInactive=true`,
      context.req
    )
    const organizationsData = await solutionsResponse.data
    return { props: { data: organizationsData } }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error(error)
  }
}
