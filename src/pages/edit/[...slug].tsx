/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react'
import EditPipeline from '../../components/EditPipeline/index'
import Container from '../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

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
            <EditPipeline pipeId={router?.query?.slug[0] as string} />
          </div>
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default Edit
