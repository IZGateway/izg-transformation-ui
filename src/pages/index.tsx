import { useState } from 'react'
import { Box } from '@mui/material'
import Container from '../components/Container'
import HelpButton from '../components/HelpButton'
import HelpPanel from '../components/HelpPanel'
import type { NextPage } from 'next'

const HomePage: NextPage = () => {
  const [helpOpen, setHelpOpen] = useState(false)
  return (
    <Container title="IZ Gateway Xform Console">
      <div>Landing Page</div>
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <HelpButton onClick={() => setHelpOpen(true)} />
      </Box>
      <HelpPanel
        docPath="login"
        title="Signing In"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </Container>
  )
}

export default HomePage
