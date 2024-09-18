import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

const SolutionsModal = (props) => {
  const [hasPreconditions, setHasPreconditions] = React.useState(false)
  const [preconditions, setPreconditions] = React.useState([
    { field: '', conditional: '', value: '' },
  ])
  const handleAddPrecondition = () => {
    setPreconditions([
      ...preconditions,
      { field: '', conditional: '', value: '' },
    ])
  }

  const handleSave = () => {
    props.setSelectedSolution('')
    props.setRefreshKey(props.refreshKey + 1)
    props.toggleDrawer(false)
  }

  const handleClose = () => {
    props.setSelectedSolution('')
    props.toggleDrawer(false)
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '50vw',
        borderRadius: '16px',
        position: 'relative', // Add this
      }}
    >
      <Box
        sx={{
          margin: 4,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto', // Changed from 'auto' to 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexDirection: 'row',
          }}
        >
          <Typography
            variant="h1"
            fontWeight={700}
            fontSize={'32px'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              width: '75%',
            }}
          >
            Make some additional configurations to save you solution.
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
        <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
          {props.selectedSolution.name} Details
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 0, marginBottom: 4 }}>
          {props.selectedSolution.description}
        </Typography>

        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
              }}
            >
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
          <Box>
            {hasPreconditions && (
              <>
                <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
                <Box sx={{ maxHeight: 'calc(100% - 200px)', overflow: 'auto' }}>
                  <Box>
                    {preconditions.map((precondition, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
                        )}
                        <FormGroup
                          row
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            maxHeight: 'calc(100% - 100px)',
                            overflow: 'auto',
                            flexGrow: 1,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <FormControl sx={{ width: '25%' }}>
                            <Select
                              value={precondition.field}
                              id={`precondition-field-${index}`}
                              onChange={(e) => {
                                const newPreconditions = [...preconditions]
                                newPreconditions[index].field = e.target.value
                                setPreconditions(newPreconditions)
                              }}
                              displayEmpty
                              required
                            >
                              <MenuItem value="" disabled>
                                Field
                              </MenuItem>
                              {/* Add your field options here */}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ width: '25%' }}>
                            <Select
                              value={precondition.conditional}
                              id={`precondition-conditional-${index}`}
                              onChange={(e) => {
                                const newPreconditions = [...preconditions]
                                newPreconditions[index].conditional =
                                  e.target.value
                                setPreconditions(newPreconditions)
                              }}
                              displayEmpty
                              required
                            >
                              <MenuItem value="" disabled>
                                Conditional
                              </MenuItem>
                              {/* Add your conditional options here */}
                            </Select>
                          </FormControl>
                          <FormControl sx={{ width: '25%' }}>
                            <TextField
                              value={precondition.value}
                              id={`precondition-value-${index}`}
                              onChange={(e) => {
                                const newPreconditions = [...preconditions]
                                newPreconditions[index].value = e.target.value
                                setPreconditions(newPreconditions)
                              }}
                              placeholder="Value"
                              required
                            />
                          </FormControl>
                          <IconButton
                            onClick={() => {
                              const newPreconditions = preconditions.filter(
                                (_, i) => i !== index
                              )
                              setPreconditions(newPreconditions)
                            }}
                            aria-label="delete"
                          >
                            <DeleteOutlinedIcon sx={{ color: 'red' }} />
                          </IconButton>
                        </FormGroup>
                      </React.Fragment>
                    ))}
                  </Box>
                  <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
                </Box>
                <Box
                  sx={{
                    marginBottom: 3,
                    maxHeight: 'calc(100% - 100px)',
                    display: 'flex',
                    justifyContent: 'left',
                    alignItems: 'center',
                  }}
                >
                  <Button onClick={handleAddPrecondition} variant="outlined">
                    ADD MORE
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </FormControl>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 4,
          }}
        >
          <Button
            id="save-solution-preconditions"
            color="secondary"
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '30px',
              width: '100%',
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SolutionsModal
