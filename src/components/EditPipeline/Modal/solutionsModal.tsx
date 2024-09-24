import React, { useState } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { v4 as uuidv4 } from 'uuid'
import PreconditionsSection from './preconditionsSection'
import { transformPreconditions } from './utils'
import styles from './styles'

const SolutionsModal = (props) => {
  const [hasPreconditions, setHasPreconditions] = useState(false)
  const [preconditions, setPreconditions] = useState([
    { id: '', method: '', value: '' },
  ])

  const handleAddPrecondition = () => {
    setPreconditions([...preconditions, { id: '', method: '', value: '' }])
  }

  const handleSave = () => {
    const transformedPreconditions = hasPreconditions
      ? transformPreconditions(
          props.preconditionsData,
          props.preconditionMethodsData,
          preconditions
        )
      : []

    const newUUID = uuidv4()
    const newPipeData = [
      ...props.pipeData,
      {
        id: newUUID,
        solutionId: props.selectedSolution.id,
        solutionVersion: '1.0',
        preconditions: transformedPreconditions,
      },
    ]
    console.log(props.pipeData)
    props.setSelectedSolution('')
    props.toggleDrawer(false)
    props.onClickSave(newPipeData)
    props.setIsReorder(true)
  }

  const handleClose = () => {
    props.setSelectedSolution('')
    props.toggleDrawer(false)
  }

  return (
    <Box sx={styles.modalContainer}>
      <Box sx={styles.contentContainer}>
        <Box sx={styles.headerContainer}>
          <Typography variant="h1" sx={styles.title}>
            Make some additional configurations to save your solution.
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>

        <Typography variant="h5" sx={styles.solutionName}>
          {props.selectedSolution.name} Details
        </Typography>
        <Typography variant="body1" sx={styles.solutionDescription}>
          {props.selectedSolution.description}
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
                  onChange={() => setHasPreconditions(!hasPreconditions)}
                />
              }
              label={hasPreconditions ? 'Yes' : 'No'}
            />
          </Box>
          <Divider sx={styles.divider} />
          {hasPreconditions && (
            <PreconditionsSection
              preconditions={preconditions}
              setPreconditions={setPreconditions}
              preconditionMethodsData={props.preconditionMethodsData}
              preconditionsData={props.preconditionsData}
            />
          )}
        </FormControl>

        <Box sx={styles.saveButtonContainer}>
          {hasPreconditions && (
            <>
              <Divider sx={styles.divider} />
              <Button
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
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SolutionsModal
