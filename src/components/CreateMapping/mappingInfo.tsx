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

const MappingInfo = ({ mappingData, setMappingData }) => {
  const onFieldChange =
    (field: keyof typeof mappingData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMappingData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const handleToggle = () => {
    setMappingData((prev) => ({
      ...prev,
      active: !prev.active,
    }))
  }

  return (
    <Card
      sx={{ borderRadius: '0px 0px 30px 30px' }}
      id="mapping-info"
      data-testid="mapping-info-container"
    >
      <CardHeader
        disableTypography
        sx={{ fontWeight: '500', fontSize: '1.5rem' }}
        title="Mapping Info"
      />

      <Divider />
      <CardContent
        sx={{
          pb: '0!important',
        }}
      >
        <Typography variant="body1" component="div">
          The Mapping Info section provides key details about the code mapping,
          including source and target code systems, codes, and the organization.
          This helps users understand the mapping configuration and its current
          state.
        </Typography>

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <TextField
            disabled
            id="id-uuid"
            label="ID / UUID"
            aria-disabled="true"
            value={mappingData?.id || ''}
            helperText="This is the unique identifier for the Mapping. It cannot be changed."
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="organizationName"
            label="Organization Name"
            value={mappingData?.organizationName || ''}
            onChange={onFieldChange('organizationName')}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="codeSystem"
            label="Source Code System"
            value={mappingData?.codeSystem || ''}
            onChange={onFieldChange('codeSystem')}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="code"
            label="Source Code"
            value={mappingData?.code || ''}
            onChange={onFieldChange('code')}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="targetCodeSystem"
            label="Target Code System"
            value={mappingData?.targetCodeSystem || ''}
            onChange={onFieldChange('targetCodeSystem')}
          />
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <TextField
            required
            id="targetCode"
            label="Target Code"
            value={mappingData?.targetCode || ''}
            onChange={onFieldChange('targetCode')}
          />
        </FormControl>

        <Box display="flex" alignItems="center" gap={1} p={2}>
          <Typography variant="body1">Is this mapping active?</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={mappingData?.active ?? true}
                onChange={handleToggle}
                color="primary"
              />
            }
            label={mappingData?.active ? 'Active' : 'Inactive'}
            labelPlacement="end"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default MappingInfo
