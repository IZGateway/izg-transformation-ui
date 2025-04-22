import * as React from 'react'
import {
  Box,
  FormControl,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { buildOperation, removeOperation } from './utils'
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
    { name: 'field', label: 'Field', required: true, inputType: 'select' },
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
}) => {
  const [fadeOutIndex, setFadeOutIndex] = useState(null)
  const handleRemoveOperation = (index) => {
    setFadeOutIndex(index)
    setTimeout(() => {
      removeOperation(index, operations, setOperations)
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
      updated[index].method,
      updated
    )
    setOperations(updated)
  }
  return (
    <Box
      sx={{
        marginBottom: 2,
        paddingRight: '28px',
        backgroundColor: '#FFF',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '142px',
          bottom: '64px',
          left: { xs: '21%', md: '4.5%' },
          width: '2px',
          backgroundColor: '#177B8F',
          zIndex: 0,
        },
      }}
    >
      {operations.map((operation, index) => (
        <Box
          key={index}
          sx={{
            borderRadius: '0px',
            marginBottom: 2,
            zIndex: 10,
            backgroundColor: '#FFF',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            display={'flex'}
            gap={2}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="operation-type-label">Operation Type</InputLabel>
              <Select
                value={operation.method || ''}
                label="Operation Type"
                onChange={(e) =>
                  handleChangeOperationType(index, e.target.value)
                }
                labelId="operation-type-label"
              >
                {operationTypeData.map((type) => (
                  <MenuItem
                    aria-disabled="true"
                    key={type.method}
                    value={type.method}
                  >
                    {type.method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip arrow title="Delete Operation">
              <IconButton
                aria-label="delete"
                color="error"
                sx={{ marginRight: 0.4, mt: 1, height: '100%' }}
                onClick={() => handleRemoveOperation(index)}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display={'flex'} gap={2} justifyContent={'flex-end'} mr={'60px'}>
            {operation.method &&
              operationFormFields[operation.method]?.map((field) => (
                <Box key={field.name} width={'100%'}>
                  <FormGroup
                    row
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '100%',
                      animation:
                        fadeOutIndex === index
                          ? 'fadeOut 0.3s ease-in-out'
                          : 'fadeIn 0.3s ease-in-out',
                    }}
                  >
                    {field.inputType === 'select' ? (
                      <FormControl sx={{ mt: 2 }} fullWidth>
                        <InputLabel id={field.label}>{field.label}</InputLabel>

                        <Select
                          value={operation[field.name] || ''}
                          onChange={(e) =>
                            handleFieldChange(index, field.name, e.target.value)
                          }
                          required={field.required}
                          label={field.label}
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
                      <FormControl sx={{ mt: 2 }} fullWidth>
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
                </Box>
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default Operations
