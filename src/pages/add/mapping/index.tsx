import CreateMapping from '../../../components/CreateMapping'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateMapping/utils'

const AddMapping = () => {
  const { data: organizationsData, isLoading: isLoadingOrgs } = useSWR(
    `/api/organizations`,
    fetcher
  )

  if (isLoadingOrgs) return <>Loading...</>

  return (
    <Container title="Add Mapping">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <CreateMapping
            mappingData={{
              id: '',
              organizationId: '',
              organizationName: '',
              codeSystem: '',
              code: '',
              targetCodeSystem: '',
              targetCode: '',
              description: '',
              active: true,
            }}
            organizationsData={organizationsData || []}
          />
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default AddMapping
