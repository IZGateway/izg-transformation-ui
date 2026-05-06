import ErrorBoundary from '../../components/ErrorBoundary'
import { useRouter } from 'next/router'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'
import _ from 'lodash'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { updateMapping } from './updateMapping'
import { addMapping } from './addMapping'
import CustomSnackbar from '../SnackBar'

type CreateMappingProps = {
  mappingData: any
  mutateMapping?: () => void
  organizationsData?: any[]
}

const CreateMapping = ({
  mappingData,
  mutateMapping,
  organizationsData = [],
}: CreateMappingProps) => {
  const router = useRouter()
  const isEditMode = !!mappingData?.id

  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [currentMapping, setCurrentMapping] = useState(() =>
    isEditMode
      ? {
          ...mappingData,
          notes: mappingData.notes ?? mappingData.description ?? '',
        }
      : {
          organizationId: mappingData?.organizationId || '',
          organizationName: mappingData?.organizationName || '',
          codeSystem: mappingData?.codeSystem || '',
          code: mappingData?.code || '',
          targetCodeSystem: mappingData?.targetCodeSystem || '',
          targetCode: mappingData?.targetCode || '',
          notes: mappingData?.notes ?? mappingData?.description ?? '',
          active: mappingData?.active ?? true,
        }
  )

  const initialMappingRef = useRef(_.cloneDeep(currentMapping))

  useEffect(() => {
    if (!isEditMode) return
    const synced = {
      ...mappingData,
      notes: mappingData.notes ?? mappingData.description ?? '',
    }
    setCurrentMapping(synced)
    initialMappingRef.current = _.cloneDeep(synced)
  }, [mappingData])

  const hasChanges = useMemo(
    () => !_.isEqual(currentMapping, initialMappingRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMapping]
  )

  const isFormValid = useMemo(() => {
    return (
      (isEditMode || currentMapping.organizationId?.trim()) &&
      currentMapping.codeSystem?.trim() &&
      currentMapping.code?.trim() &&
      currentMapping.targetCodeSystem?.trim() &&
      currentMapping.targetCode?.trim()
    )
  }, [currentMapping, isEditMode])

  const handleFieldChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentMapping((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleOrgChange = (e: any) => {
    const orgList: any[] = Array.isArray(organizationsData)
      ? organizationsData
      : (organizationsData as any)?.data ?? []
    const org = orgList.find((o) => o.id === e.target.value)
    setCurrentMapping((prev) => ({
      ...prev,
      organizationId: e.target.value,
      organizationName: org?.organizationName || org?.name || '',
    }))
  }

  const handleToggle = () => {
    setCurrentMapping((prev) => ({ ...prev, active: !prev.active }))
  }

  const handleSnackbarClose = () => setShowSnackbar(false)

  const handleSubmit = async () => {
    if (!isFormValid) {
      setSnackbarMessage('Please fill in all required fields.')
      setSnackbarSeverity('error')
      setShowSnackbar(true)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        organizationId: currentMapping.organizationId,
        codeSystem: currentMapping.codeSystem,
        code: currentMapping.code,
        targetCodeSystem: currentMapping.targetCodeSystem,
        targetCode: currentMapping.targetCode,
        notes: currentMapping.notes,
        active: currentMapping.active,
      }

      const result = isEditMode
        ? await updateMapping(mappingData.id, payload)
        : await addMapping(payload)

      if (result.success) {
        if (isEditMode) {
          setSnackbarMessage('Mapping updated successfully!')
          setSnackbarSeverity('success')
          setShowSnackbar(true)
          if (mutateMapping) mutateMapping()
        } else {
          sessionStorage.setItem(
            'mappingSuccessMessage',
            'Mapping created successfully!'
          )
          router.push('/mapping')
        }
      } else {
        setSnackbarMessage(result.error || 'An error occurred.')
        setSnackbarSeverity('error')
        setShowSnackbar(true)
      }
    } catch (error) {
      console.error('Error submitting mapping:', error)
      setSnackbarMessage('An unexpected error occurred.')
      setSnackbarSeverity('error')
      setShowSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {isEditMode ? 'Edit Mapping Entry' : 'Add Mapping Entry'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Will be automatically updated with source and target values
          </Typography>
        </Box>
        <Button
          variant="text"
          color="primary"
          onClick={() => router.push('/mapping')}
          endIcon={<CloseIcon />}
          sx={{ mt: 0.5, fontWeight: 600 }}
        >
          CLOSE
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Left Column ── */}
        <Grid item xs={12} md={7}>
          {/* Organization */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            {/* Organization */}
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Organization
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Users can only manage mappings for organizations they belong to.
              </Typography>
              <FormControl fullWidth>
                {isEditMode ? (
                  <TextField
                    disabled
                    label="Organization"
                    value={currentMapping.organizationName || ''}
                    helperText="Organization is set by the mapping and cannot be changed."
                  />
                ) : (
                  <>
                    <InputLabel id="mapping-organization-label" required>
                      Organization
                    </InputLabel>
                    <Select
                      labelId="mapping-organization-label"
                      id="mapping-organization-select"
                      value={currentMapping.organizationId || ''}
                      label="Organization *"
                      onChange={handleOrgChange}
                    >
                      {(Array.isArray(organizationsData)
                        ? organizationsData
                        : (organizationsData as any)?.data ?? []
                      ).map((org: any) => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.organizationName || org.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </FormControl>
            </CardContent>

            <Divider sx={{ borderBottomWidth: 2, borderColor: 'divider' }} />

            {/* Source - Incoming */}
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Source - Incoming
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The code and system as received by Xform before processing.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code"
                    value={currentMapping.code || ''}
                    onChange={handleFieldChange('code')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code System"
                    value={currentMapping.codeSystem || ''}
                    onChange={handleFieldChange('codeSystem')}
                  />
                </Grid>
              </Grid>
            </CardContent>

            {/* maps to arrow */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
              }}
            >
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                maps to
              </Typography>
              <ArrowDownwardIcon color="success" fontSize="small" />
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Target - Outgoing */}
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Target - Outgoing
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The code and system sent by Xform after processing.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code"
                    value={currentMapping.targetCode || ''}
                    onChange={handleFieldChange('targetCode')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code System"
                    value={currentMapping.targetCodeSystem || ''}
                    onChange={handleFieldChange('targetCodeSystem')}
                  />
                </Grid>
              </Grid>
            </CardContent>

            <Divider sx={{ borderBottomWidth: 2, borderColor: 'divider' }} />

            {/* Notes */}
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                placeholder="Brief Description of this mapping"
                value={currentMapping.notes || ''}
                onChange={handleFieldChange('notes')}
                inputProps={{ maxLength: 250 }}
                helperText={`${(currentMapping.notes || '').length}/250`}
                FormHelperTextProps={{ sx: { textAlign: 'right' } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right Column ── */}
        <Grid item xs={12} md={5}>
          {/* Mapping Preview */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Mapping Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The incoming code and system as received by Xform.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Org
                </Typography>
                <Typography variant="body2">
                  {currentMapping.organizationName || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2">
                  {currentMapping.code && currentMapping.codeSystem
                    ? `${currentMapping.code} ${currentMapping.codeSystem}`
                    : '—'}
                </Typography>
              </Box>
              <Box sx={{ py: 1, pl: '80px' }}>
                <ArrowDownwardIcon color="success" fontSize="small" />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Target
                </Typography>
                <Typography variant="body2">
                  {currentMapping.targetCode && currentMapping.targetCodeSystem
                    ? `${currentMapping.targetCode} ${currentMapping.targetCodeSystem}`
                    : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body2">
                  {currentMapping.notes || '—'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Activate Mapping */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                Activate Mapping
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The incoming code and system as received by Xform.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentMapping.active ?? true}
                      onChange={handleToggle}
                      color="primary"
                    />
                  }
                  label="Active"
                  labelPlacement="end"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Save */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                All fields marked * are required
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || (!hasChanges && isEditMode)}
                sx={{ borderRadius: 8, px: 4, fontWeight: 700 }}
              >
                {isSubmitting ? 'Saving...' : 'SAVE'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CustomSnackbar
        open={showSnackbar}
        severity={snackbarSeverity}
        message={snackbarMessage}
        onClose={handleSnackbarClose}
      />
    </ErrorBoundary>
  )
}

export default CreateMapping
