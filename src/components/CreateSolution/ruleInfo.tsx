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

const RuleInfo = ({ solutionData, setSolutionData }) => {
  const onFieldChange =
    (field: keyof typeof solutionData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSolutionData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleToggle = () => {
    setSolutionData((prev) => ({
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
      <CardContent
        sx={{
          pb: '0!important',
        }}
      >
        <Typography variant="body1" component="div">
          The Rule Info section provides key details about the rule, including
          its identification, description, version, and current status. This
          high-level overview helps users quickly understand the rule's function
          and state
        </Typography>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <TextField
            disabled
            required
            id="id-uuid"
            label="ID / UUID"
            aria-disabled="true"
            value={solutionData.id}
            helperText="This is the unique identifier for the rule. It cannot be changed."
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="name"
            label="Name"
            value={solutionData.solutionName}
            onChange={onFieldChange('solutionName')}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="version"
            label="Version"
            value={solutionData.version}
            onChange={onFieldChange('version')}
          />
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="description"
            label="Description"
            value={solutionData.description}
            onChange={onFieldChange('description')}
            multiline
            minRows={4}
            aria-label='"Description of the rule"'
          />
        </FormControl>
        <Box display="flex" alignItems="center" gap={1} p={2}>
          <Typography variant="body1">Is this rule active?</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={solutionData.active}
                onChange={handleToggle}
                color="primary"
              />
            }
            label={solutionData.active ? 'True' : 'False'}
            labelPlacement="end"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default RuleInfo
