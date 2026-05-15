import * as React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

interface HelpButtonProps {
  onClick: () => void
}

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <Tooltip title="Help">
      <IconButton aria-label="Help" onClick={onClick} color="inherit">
        <HelpOutlineIcon />
      </IconButton>
    </Tooltip>
  )
}

export default HelpButton
