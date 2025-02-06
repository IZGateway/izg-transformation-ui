'use client'
import React, { useEffect, useCallback, useState, useMemo } from 'react'
import { isEqual } from 'lodash'
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
import { Solution } from '../../../contexts/EditPipeline/solutionsDataContext'

interface SolutionsModalProps {
  selectedSolution: Solution
  isNewSolution?: boolean
  initialHasPreconditions?: boolean
  existingPreconditions?: Array<{ [key: string]: string }>
  setOpen: (open: boolean) => void
  open: boolean
}

const SolutionsModal = ({
  selectedSolution,
  isNewSolution,
  initialHasPreconditions,
  existingPreconditions = [{ id: '', method: '', value: '' }],
  setOpen,
  open,
}: SolutionsModalProps) => {
  const { preconditionsData, preconditionMethodsData } =
    usePreconditionContext()
  const { pipeData, tempPipeData, setTempPipeData } = useUpdatePipeDataContext()
  const { setIsReorder } = useReorderContext()
  const [hasPreconditions, setHasPreconditions] = useState(
    initialHasPreconditions
  )
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
    setClosing(true)
    setTimeout(() => {
      const transformedPreconditions = !hasPreconditions
        ? []
        : transformPreconditions(
            preconditionsData,
            preconditionMethodsData,
            formattedPreconditions
          )
      const currentPipeData = tempPipeData || pipeData
      const newPipeData = isNewSolution
        ? [
            ...currentPipeData,
            {
              id: uuidv4(),
              solutionId: selectedSolution.id,
              solutionVersion: '1.0',
              preconditions: transformedPreconditions,
            },
          ]
        : currentPipeData.map((solution) =>
            solution.solutionId === selectedSolution.id
              ? { ...solution, preconditions: transformedPreconditions }
              : solution
          )

      if (!isEqual(newPipeData, pipeData)) {
        setTempPipeData(newPipeData)
        setIsReorder(true)
      }
      setOpen(false)
    }, 400)
  }

  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleClose = () => {
    setClosing(true)
    // Set a timeout to simulate the closing animation duration before setting the drawer to closed
    setTimeout(() => {
      setOpen(false) // Close the drawer after the transition duration
    }, 400) // Matches the transition duration (0.4s)
  }

  return (
    <Box sx={{ borderRadius: '20px 0px 0px 20px', boxShadow: 'none' }}>
      <Drawer
        data-testid="solutions-modal-drawer"
        variant="temporary"
        PaperProps={{
          sx: {
            borderRadius: '20px 0px 0px 20px',
            boxShadow: 'none',
            transform:
              mounted && closing
                ? 'translateX(100%)' // Apply effect when closing
                : mounted && open
                ? 'translateX(0%)' // Normal slide-in effect when open
                : 'translateX(100%)', // Default position when closed
            transition: 'transform 0.4s ease-in-out', // Smooth transition for both opening and closing
          },
        }}
        open={open}
        anchor="right"
        onClose={() => {
          // Reset states once the drawer finishes closing
          if (!open) {
            setClosing(false)
            if (isNewSolution) {
              setHasPreconditions(false)
              setPreconditions([])
            }
          }
        }}
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
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between',
                    position: 'static',
                  }}
                  control={
                    <Switch
                      checked={hasPreconditions}
                      onChange={(e) => setHasPreconditions(e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ width: '30px' }}>
                      {hasPreconditions ? 'Yes' : 'No'}
                    </Box>
                  }
                />
              </Box>
              <Divider sx={styles.divider} />
              {hasPreconditions && (
                <PreconditionsSection
                  preconditions={formattedPreconditions}
                  setPreconditions={(newPreconditions) =>
                    setPreconditions(newPreconditions)
                  }
                  preconditionMethodsData={preconditionMethodsData}
                  preconditionsData={preconditionsData}
                  setHasPreconditions={setHasPreconditions}
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
                data-testid="save-solution-button"
                color="secondary"
                variant="contained"
                onClick={handleSave}
                sx={styles.saveButton}
                disabled={!isFormValid}
              >
                Save Solution
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default SolutionsModal
