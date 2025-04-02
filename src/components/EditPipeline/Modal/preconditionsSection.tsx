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
    setFadeOutIndex(index) // Trigger fade-out animation for the row
    setTimeout(() => {
      removePrecondition(
        index,
        preconditions,
        setPreconditions,
        setHasPreconditions
      )
      setFadeOutIndex(null) // Reset fade-out index after removal
    }, 300) // Match the duration of the fade-out animation
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
        displayEmpty
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
      {preconditions.map((precondition, index) => (
        <FormGroup
          key={index}
          row
          sx={{
            ...styles.preconditionRow,
            flexFlow: { xs: 'column', sm: 'column', md: 'row' },
            animation:
              fadeOutIndex === index
                ? 'fadeOut 0.3s ease-in-out'
                : 'fadeIn 0.3s ease-in-out',
          }}
        >
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
            sx={{ minWidth: '150px' }}
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
              disabled={['exists', 'not_exists'].includes(precondition.method)}
            />
          </FormControl>
          <Tooltip title="Delete precondition" arrow>
            <IconButton
              data-testid={`delete-precondition-button-${index}`}
              onClick={() => handleRemovePrecondition(index)}
              aria-label="delete"
              color="error"
            >
              <DeleteOutlinedIcon />
            </IconButton>
          </Tooltip>
        </FormGroup>
      ))}
    </Box>
  )
}

export default PreconditionsSection
