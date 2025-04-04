import * as React from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { buildOperation, removeOperation } from './utils'
import _ from 'lodash'
import { useState } from 'react'

export const operationFormFields = {
  mapper: [
    {
      name: 'codeField',
      label: 'Code Field',
      required: true,
      inputType: 'select',
    },
    {
      name: 'codeSystemField',
      label: 'Code System Field',
      required: true,
      inputType: 'select',
    },
    {
      name: 'codeSystemDefault',
      label: 'Fallback Code System',
      required: true,
      inputType: 'text',
    },
  ],
  copy: [
    {
      name: 'sourceField',
      label: 'Source',
      required: true,
      inputType: 'select',
    },
    {
      name: 'destinationField',
      label: 'Destination',
      required: true,
      inputType: 'select',
    },
  ],
  set: [
    {
      name: 'destinationField',
      label: 'Destination Field',
      required: true,
      inputType: 'select',
    },
    { name: 'setValue', label: 'Set Value', required: true, inputType: 'text' },
  ],
  regex_replace: [
    { name: 'field', label: 'Field', required: true, inputType: 'text' },
    { name: 'regex', label: 'Regex', required: true, inputType: 'text' },
    {
      name: 'replacement',
      label: 'Replace',
      required: false,
      inputType: 'text',
    },
  ],
  save_state: [
    { name: 'field', label: 'Field', required: true, inputType: 'select' },
    { name: 'key', label: 'Lookup Key', required: true, inputType: 'text' },
  ],
}

const Operations = ({
  operations,
  setOperations,
  operationTypeData,
  operationFieldsData,
  setHasOperations,
}) => {
  const [fadeOutIndex, setFadeOutIndex] = useState(null)
  const handleRemoveOperation = (index) => {
    setFadeOutIndex(index)
    setTimeout(() => {
      removeOperation(index, operations, setOperations, setHasOperations)
      setFadeOutIndex(null)
    }, 300)
  }
  const handleChangeOperationType = (index, newType) => {
    const updated = [...operations]
    updated[index] = { method: newType }
    setOperations(updated)
  }
  const handleFieldChange = (index, fieldName, value) => {
    const updated = [...operations]
    updated[index] = buildOperation(
      updated[index] || {},
      fieldName,
      value,
      updated[index].method
    )
    setOperations(updated)
  }
  return (
    <Box>
      {operations.map((operation, index) => (
        <Box
          key={index}
          sx={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: 2,
            marginBottom: 2,
          }}
        >
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Operation Type</InputLabel>
            <Select
              value={operation.method || ''}
              label="Operation Type"
              onChange={(e) => handleChangeOperationType(index, e.target.value)}
              displayEmpty
            >
              {operationTypeData.map((type) => (
                <MenuItem key={type.method} value={type.method}>
                  {type.method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display={'flex'} gap={2} flexWrap="wrap">
            {operation.method &&
              operationFormFields[operation.method]?.map((field) => (
                <FormGroup
                  key={field.name}
                  row
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '300px',
                    animation:
                      fadeOutIndex === index
                        ? 'fadeOut 0.3s ease-in-out'
                        : 'fadeIn 0.3s ease-in-out',
                  }}
                >
                  {field.inputType === 'select' ? (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={operation[field.name] || ''}
                        onChange={(e) =>
                          handleFieldChange(index, field.name, e.target.value)
                        }
                        required={field.required}
                      >
                        {operationFieldsData.data.map((item) => (
                          <MenuItem
                            key={item.id || item.method}
                            value={item.id || item.method}
                          >
                            {item.fieldName || item.method}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl fullWidth>
                      <TextField
                        label={field.label}
                        required={field.required}
                        value={operation[field.name] || ''}
                        onChange={(e) =>
                          handleFieldChange(index, field.name, e.target.value)
                        }
                      />
                    </FormControl>
                  )}
                </FormGroup>
              ))}
            <Tooltip arrow title="Delete Operation">
              <IconButton
                aria-label="delete"
                color="error"
                onClick={() => handleRemoveOperation(index)}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default Operations
