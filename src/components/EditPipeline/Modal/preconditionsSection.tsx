import React, { useState } from 'react'
import {
  Box,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { updatePrecondition, removePrecondition } from './utils'
import styles from './styles'

const PreconditionsSection = ({
  preconditions,
  setPreconditions,
  preconditionMethodsData,
  preconditionsData,
  setHasPreconditions,
}) => {
  const [fadeOutIndex, setFadeOutIndex] = useState(null) // Track which row is fading out

  const handleRemovePrecondition = (index) => {
    setFadeOutIndex(index)
    setTimeout(() => {
      removePrecondition(
        index,
        preconditions,
        setPreconditions,
        setHasPreconditions
      )
      setFadeOutIndex(null)
    }, 300)
  }

  const renderFormControl = (index, field, value, label, data) => (
    <FormControl
      data-testid={`precondition-form-control-${label}-${index}`}
      sx={{ width: { xs: '100%', md: '33.3%' } }}
    >
      <InputLabel shrink={false}>{value ? '' : label}</InputLabel>
      <Select
        value={value}
        onChange={(e) =>
          updatePrecondition(
            index,
            field,
            e.target.value,
            preconditions,
            setPreconditions
          )
        }
        required
      >
        {data.map((item) => (
          <MenuItem key={item.id || item.method} value={item.id || item.method}>
            {item.fieldName || item.method}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  return (
    <Box
      sx={{
        ...styles.preconditionsContainer,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: { xs: '21%', md: '3.3%' }, // Center the line horizontally
          width: '2px', // Thickness of the line
          backgroundColor: '#177B8F', // Blue color for the line
          zIndex: 0, // Place the line behind the content
        },
      }}
    >
      {preconditions.length > 0 &&
        preconditions.map((precondition, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider sx={styles.divider} />}
            <FormGroup row sx={styles.preconditionRow}>
              {renderFormControl(
                index,
                'id',
                precondition.id,
                'Field',
                preconditionsData.data
              )}
              {renderFormControl(
                index,
                'method',
                precondition.method,
                'Conditional',
                preconditionMethodsData
              )}
              <FormControl
                data-testid={`precondition-form-control-value-${index}`}
                sx={{ width: '25%' }}
              >
                <TextField
                  value={precondition.value || ''}
                  label={precondition.value ? '' : 'Value'}
                  InputLabelProps={{ shrink: false }}
                  onChange={(e) =>
                    updatePrecondition(
                      index,
                      'value',
                      e.target.value,
                      preconditions,
                      setPreconditions
                    )
                  }
                  placeholder="Value"
                  required
                  disabled={['exists', 'not_exists'].includes(
                    precondition.method
                  )}
                />
              </FormControl>
              <IconButton
                data-testid={`delete-precondition-button-${index}`}
                onClick={() =>
                  removePrecondition(
                    index,
                    preconditions,
                    setPreconditions,
                    setHasPreconditions
                  )
                }
                aria-label="delete"
                color="error"
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </FormGroup>
          </React.Fragment>
        ))}
    </Box>
  )
}

export default PreconditionsSection
