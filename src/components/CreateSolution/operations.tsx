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
} from '@mui/material'
import _ from 'lodash'
import { useState } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { buildOperation } from './utils'
const operationFormFields = {
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
    {
      name: 'key',
      label: 'Lookup Key',
      required: true,
      inputType: 'text',
    },
  ],
}

const Operations = ({
  operations,
  setOperations,
  operationTypeData,
  operationFieldsData,
}) => {
  const [operationType, setOperationType] = useState(operations.operation || '')
  const handleChangeOperationType = (e) => {
    const newType = e.target.value
    setOperationType(newType)
    setOperations([{ method: newType }])
  }

  const handleFieldChange = (fieldName, value) => {
    const updated = [
      buildOperation(operations[0] || {}, fieldName, value, operationType),
    ]
    setOperations(updated)
  }

  return (
    <Box>
      <Card
        sx={{
          minWidth: 250,
          borderRadius: '0px 0px 30px 30px',
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <div>
          <CardHeader title="Operations" />
          <Divider />
          <CardContent>
            <Typography pb={2} gutterBottom variant="body1">
              To add an operation, select the operation type from the dropdown
              list, which will initiate the configuration of the operation you
              wish to apply.
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="operation-type-label">Operation Type</InputLabel>
              <Select
                labelId="operation-type-label"
                value={operationType}
                label="Operation Type"
                fullWidth
                onChange={handleChangeOperationType}
              >
                {operationTypeData.map((type) => (
                  <MenuItem key={type.method} value={type.method}>
                    {type.method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {operationType && (
              <Box
                display={'flex'}
                gap={4}
                justifyContent="space-between"
                mt={4}
                alignItems={{ xs: 'flex-end', md: 'center' }}
                pr={{ xs: 0, md: 4 }}
                pb={{ xs: 0, md: 2 }}
                flexDirection={{ xs: 'column', md: 'row' }}
              >
                {operationFormFields[operationType]?.map((field) => (
                  <FormGroup
                    key={field.name}
                    row
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    {field.inputType === 'select' ? (
                      <FormControl fullWidth>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          label={field.label}
                          displayEmpty
                          required
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
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
                      <FormControl>
                        <TextField
                          label={field.label}
                          required={field.required}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                        />
                      </FormControl>
                    )}
                  </FormGroup>
                ))}
                <Tooltip arrow title="Delete Operation">
                  <IconButton aria-label="delete" color="error">
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </div>
      </Card>
    </Box>
  )
}

export default Operations
