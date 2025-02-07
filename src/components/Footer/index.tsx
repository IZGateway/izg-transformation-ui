import React from 'react'
import { Box, Typography } from '@mui/material'
import pack from '../../../package.json'

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        position: 'fixed',
        bottom: 0,
        ml: -4,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        top: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Typography variant="caption" align="left">
        Version {pack.version}-{process.env.NEXT_PUBLIC_BUILD_ID || 'Dev'} |
        Immunization (IZ) Gateway Transformation Service 2024
      </Typography>
      {/* <Typography variant="caption" mr={10}>
        This application has been authorized by the Centers for Disease Control
        and Prevention
      </Typography> */}
    </Box>
  )
}

export default Footer
