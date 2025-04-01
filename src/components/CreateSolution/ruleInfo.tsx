import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  FormControl,
  Box,
  FormControlLabel,
  TextField,
  Switch,
} from '@mui/material'
import { useState } from 'react'

const RuleInfo = (props: { solutionData; setSolutionData }) => {
  console.log(props.solutionData)
  const [isActive, setIsActive] = useState(props.solutionData.active)

  const handleToggle = () => {
    setIsActive((prev) => !prev)
    props.setSolutionData((prev) => ({
      ...prev,
      active: !prev.active,
    }))
  }

  return (
    <Card
      sx={{ borderRadius: '0px 0px 30px 30px' }}
      id="settings"
      data-testid="settings-container"
    >
      <CardHeader title="Rule Info" />

      <Divider />
      <CardContent>
        <Typography variant="body1" component="div">
          The Rule Info section provides key details about the rule, including
          its identification, description, version, and current status. This
          high-level overview helps users quickly understand the rule's function
          and state
        </Typography>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            disabled
            required
            id="id-uuid"
            label="ID / UUID"
            defaultValue={props.solutionData.id}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            disabled
            required
            id="name"
            label="Name"
            defaultValue={props.solutionData.name}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            disabled
            required
            id="version"
            label="Version"
            defaultValue={props.solutionData.version}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            disabled
            required
            id="description"
            label="Description"
            defaultValue={props.solutionData.description}
          />
        </FormControl>
        <Box display="flex" alignItems="center" gap={1} p={2}>
          <Typography variant="body1">Is this rule active?</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={handleToggle}
                color="primary"
              />
            }
            label={isActive ? 'True' : 'False'}
            labelPlacement="end"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default RuleInfo
