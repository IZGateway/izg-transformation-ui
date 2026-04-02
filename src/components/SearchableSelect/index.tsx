import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

export type SearchableSelectOption = {
  value: string
  label: string
  description?: string
}

type Props = {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  label: string
  required?: boolean
  disabled?: boolean
  testId?: string
  sx?: SxProps<Theme>
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  testId,
  sx,
}: Props) => {
  const selectedOption = options.find((opt) => opt.value === value) ?? null

  return (
    <Autocomplete
      fullWidth
      options={options}
      value={selectedOption}
      onChange={(_, newValue) => onChange(newValue?.value ?? '')}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      disabled={disabled}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          inputProps={{ ...params.inputProps, 'data-testid': testId }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2">{option.label}</Typography>
            {option.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {option.description}
              </Typography>
            )}
          </Box>
        </li>
      )}
    />
  )
}

export default SearchableSelect
