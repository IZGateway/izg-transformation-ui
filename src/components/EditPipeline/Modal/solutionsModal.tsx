import React, { useCallback, useState, useMemo } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Drawer,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { v4 as uuidv4 } from 'uuid'
import styles from './styles'
import PreconditionsSection from './preconditionsSection'
import { transformPreconditions, useFormattedPreconditions } from './utils'
import { usePreconditionContext } from '../../../contexts/EditPipeline/preconditionContext'
import { useReorderContext } from '../../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../../contexts/EditPipeline/updatePipeDataContext'

const SolutionsModal = ({
  selectedSolution,
  isNewSolution,
  existingPreconditions = [{ id: '', method: '', value: '' }],
  setOpen,
  open,
}) => {
  const { preconditionsData, preconditionMethodsData } =
    usePreconditionContext()
  const { pipeData, setPipeData, setTempPipeData } = useUpdatePipeDataContext()
  const { setIsReorder } = useReorderContext()
  const [hasPreconditions, setHasPreconditions] = useState(!isNewSolution)
  const [preconditions, setPreconditions] = useState(existingPreconditions)

  const formattedPreconditions = useFormattedPreconditions(
    hasPreconditions,
    existingPreconditions ? preconditions : [{ id: '', method: '', value: '' }]
  )

  const isFormValid = useMemo(() => {
    if (!hasPreconditions) return true

    return formattedPreconditions.every((precondition) => {
      if (!precondition.id || !precondition.method) return false
      if (
        !['exists', 'not_exists'].includes(precondition.method) &&
        !precondition.value
      )
        return false
      return true
    })
  }, [hasPreconditions, formattedPreconditions])

  const handleAddPrecondition = useCallback(() => {
    setHasPreconditions(true)
    setPreconditions((prev) => [...prev, { id: '', method: '', value: '' }])
  }, [setHasPreconditions, setPreconditions])

  const handleSave = () => {
    const transformedPreconditions = !hasPreconditions
      ? []
      : transformPreconditions(
          preconditionsData,
          preconditionMethodsData,
          formattedPreconditions
        )

    const newPipeData = [
      ...pipeData,
      {
        id: uuidv4(),
        solutionId: selectedSolution.id,
        solutionVersion: '1.0',
        preconditions: transformedPreconditions,
      },
    ]
    setOpen(false)
    setPipeData(newPipeData)
    setTempPipeData(pipeData)
    setIsReorder(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (isNewSolution) {
      setHasPreconditions(false)
      setPreconditions([])
    }
  }

  return (
    <Drawer
      data-testid="solutions-modal-drawer"
      variant="temporary"
      PaperProps={{
        sx: {
          borderRadius: '20px 0px 0px 20px',
          boxShadow: 'none',
        },
      }}
      open={open}
      onClose={handleClose}
      anchor="right"
    >
      <Box sx={styles.modalContainer}>
        <Box sx={styles.contentContainer}>
          <Box sx={styles.headerContainer}>
            <Typography variant="h1" sx={styles.title}>
              Make some additional configurations to save your solution.
            </Typography>
            <Tooltip arrow placement="bottom" title="Close">
              <IconButton onClick={handleClose}>
                <CloseIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="h5" sx={styles.solutionName}>
            {selectedSolution.solutionName} Details
          </Typography>
          <Typography variant="body1" sx={styles.solutionDescription}>
            {selectedSolution.description}
          </Typography>

          <FormControl sx={styles.formControl}>
            <Box sx={styles.preconditionToggle}>
              <Typography variant="h6">
                Does this solution have any preconditions?
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasPreconditions}
                    onChange={() => setHasPreconditions((prev) => !prev)}
                  />
                }
                label={hasPreconditions ? 'Yes' : 'No'}
              />
            </Box>
            <Divider sx={styles.divider} />
            {hasPreconditions && (
              <PreconditionsSection
                preconditions={formattedPreconditions}
                setPreconditions={(newPreconditions) => {
                  setPreconditions(newPreconditions)
                }}
                preconditionMethodsData={preconditionMethodsData}
                preconditionsData={preconditionsData}
              />
            )}
          </FormControl>

          <Box sx={styles.saveButtonContainer}>
            {hasPreconditions && (
              <>
                <Divider sx={styles.divider} />
                <Button
                  data-testid="add-more-preconditions-button"
                  sx={{
                    marginBottom: 3,
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                  }}
                  onClick={handleAddPrecondition}
                  variant="outlined"
                >
                  Add More
                </Button>
              </>
            )}

            <Button
              id="save-solution-preconditions"
              color="secondary"
              variant="contained"
              onClick={handleSave}
              sx={styles.saveButton}
              disabled={!isFormValid}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default SolutionsModal
