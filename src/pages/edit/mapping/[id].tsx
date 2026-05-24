import CreateMapping from '../../../components/CreateMapping/index'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateMapping/utils'
import { useState } from 'react'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'
import ServiceUnavailablePage from '../../../components/ServiceUnavailablePage'

const EditMapping = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  const router = useRouter()
  const { isReady, query } = router
  const { id } = query

  const {
    data: mappingData,
    isLoading: isLoadingMapping,
    mutate: mutateMappingData,
    error: errorMapping,
  } = useSWR(isReady ? `/api/mappings/${id}` : null, fetcher)

  const { data: organizationsData, isLoading: isLoadingOrgs, error: errorOrgs } = useSWR(
    `/api/organizations`,
    fetcher
  )

  const fetchError = errorMapping || errorOrgs

  if (fetchError) return <Container title="Edit Mapping"><ServiceUnavailablePage /></Container>

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
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="mappings/create-edit"
        title="Mapping Help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default EditMapping
