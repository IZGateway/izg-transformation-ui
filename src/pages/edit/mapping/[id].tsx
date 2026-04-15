import CreateMapping from '../../../components/CreateMapping/index'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateMapping/utils'

const EditMapping = () => {
  const router = useRouter()
  const { isReady, query } = router
  const { id } = query

  const {
    data: mappingData,
    isLoading: isLoadingMapping,
    mutate: mutateMappingData,
  } = useSWR(isReady ? `/api/mappings/${id}` : null, fetcher)

  const { data: organizationsData, isLoading: isLoadingOrgs } = useSWR(
    `/api/organizations`,
    fetcher
  )

  if (!isReady || isLoadingMapping || !mappingData || isLoadingOrgs)
    return <>Loading...</>

  const orgList = Array.isArray(organizationsData)
    ? organizationsData
    : (organizationsData as any)?.data ?? []

  const matchedOrg = orgList.find(
    (o: any) => o.id === mappingData.organizationId
  )
  const enrichedMapping = {
    ...mappingData,
    organizationName:
      mappingData.organizationName ||
      matchedOrg?.organizationName ||
      matchedOrg?.name ||
      '',
  }

  return (
    <Container title="Edit Mapping">
      <ErrorBoundary>
        <Box sx={{ position: 'relative' }}>
          <CreateMapping
            mappingData={enrichedMapping}
            mutateMapping={mutateMappingData}
            organizationsData={orgList}
          />
        </Box>
      </ErrorBoundary>
    </Container>
  )
}

export default EditMapping
