import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'

const Solutions = (props) => {
  return (
    <Card sx={{ minWidth: 275, borderRadius: '0px 0px 30px 30px' }}>
      <CardHeader title="Search for Solutions" />
      <Divider />
      <CardContent>
        <Typography variant="body1" component="div">
          Once you have adjusted your settings add a solutions. You can add as
          many you like, please note they are sequential.
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="solutions-select-label">Solutions</InputLabel>
          <Select
            labelId="solutions-select-label"
            id="solutions-select"
            // value={age}
            label="Solutions Endpoint"
            // onChange={handleChange}
          >
            {Object.entries(solArray).length > 0 ? (
              Object.entries(solArray).map(([id]) => (
                <MenuItem key={id} value={solArray[id][0]}>
                  {solArray[id][1]}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">No solutions available</MenuItem>
            )}
          </Select>
        </FormControl>
        <Button
          id="add"
          color="secondary"
          variant="outlined"
          sx={{
            borderRadius: '30px',
          }}
        >
          Add
        </Button>
      </CardContent>
    </Card>
  )
}

export default Solutions
