import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormGroup,
  IconButton,
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
    { name: 'source', label: 'Source', required: true, inputType: 'select' },
    {
      name: 'destination',
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
    { name: 'replace', label: 'Replace', required: false, inputType: 'text' },
  ],
  save_state: [
    { name: 'field', label: 'Field', required: true, inputType: 'select' },
    {
      name: 'lookupKey',
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
  console.log(operationFieldsData)
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
          minWidth: 275,
          borderRadius: '0px 0px 30px 30px',
          marginTop: 4,
        }}
      >
        <div>
          <CardHeader title="Operations" />
          <Divider />
          <CardContent>
            <Typography variant="body1">
              To add an operation, select the operation type from the dropdown
              list, which will initiate the configuration of the operation you
              wish to apply.
            </Typography>
            <FormControl sx={{ width: '25%' }}>
              <InputLabel id="operation-type-label">Operation Type</InputLabel>
              <Select
                labelId="operation-type-label"
                value={operationType}
                label="Operation Type"
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
              <>
                {operationFormFields[operationType]?.map((field) => (
                  <FormGroup
                    key={field.name}
                    row
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 3,
                      width: '25%',
                    }}
                  >
                    {field.inputType === 'select' ? (
                      <FormControl fullWidth margin="normal">
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
                      <FormControl fullWidth margin="normal">
                        <TextField
                          label={field.label}
                          required={field.required}
                          fullWidth
                          margin="normal"
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                        />
                      </FormControl>
                    )}
                    <IconButton aria-label="delete" color="error">
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </FormGroup>
                ))}
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </Box>
  )
}

export default Operations
