import React from 'react'
import {
  Box,
  Divider,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
}) => {
  return (
    <Box sx={styles.preconditionsContainer}>
      {preconditions.map((precondition, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Divider sx={styles.divider} />}
          <FormGroup row sx={styles.preconditionRow}>
            <FormControl sx={{ width: '25%' }}>
              <InputLabel id="precondition-id-label" shrink={false}>
                {precondition.id ? '' : 'Field'}
              </InputLabel>
              <Select
                value={precondition.id}
                id={`precondition-id-${index}`}
                onChange={(e) =>
                  updatePrecondition(
                    index,
                    'id',
                    e.target.value,
                    preconditions,
                    setPreconditions
                  )
                }
                displayEmpty
                required
              >
                {preconditionsData.data.map((preconditionItem) => (
                  <MenuItem
                    key={preconditionItem.id}
                    value={preconditionItem.id}
                  >
                    {preconditionItem.fieldName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: '25%' }}>
              <InputLabel id="precondition-method-label" shrink={false}>
                {precondition.method ? '' : 'Conditional'}
              </InputLabel>
              <Select
                value={precondition.method}
                id={`precondition-method-${index}`}
                onChange={(e) =>
                  updatePrecondition(
                    index,
                    'method',
                    e.target.value,
                    preconditions,
                    setPreconditions
                  )
                }
                displayEmpty
                required
              >
                {preconditionMethodsData.map((method) => (
                  <MenuItem key={method.method} value={method.method}>
                    {method.method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: '25%' }}>
              <TextField
                value={precondition.value}
                id={`precondition-value-${index}`}
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
              />
            </FormControl>
            <IconButton
              onClick={() =>
                removePrecondition(index, preconditions, setPreconditions)
              }
              aria-label="delete"
            >
              <DeleteOutlinedIcon sx={{ color: 'red' }} />
            </IconButton>
          </FormGroup>
        </React.Fragment>
      ))}
    </Box>
  )
}

export default PreconditionsSection
