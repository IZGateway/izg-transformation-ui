import CreateMapping from '../../../components/CreateMapping'
import Container from '../../../components/Container'
import { Box } from '@mui/material'
import ErrorBoundary from '../../../components/ErrorBoundary'
import useSWR from 'swr'
import { fetcher } from '../../../components/CreateMapping/utils'
import { useState } from 'react'
import HelpButton from '../../../components/HelpButton'
import HelpPanel from '../../../components/HelpPanel'

const AddMapping = () => {
  const [helpOpen, setHelpOpen] = useState(false)
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

export default AddMapping
