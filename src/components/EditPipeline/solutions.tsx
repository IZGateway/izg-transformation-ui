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
  Drawer,
} from '@mui/material'
import SolutionsModal from './solutionsModal'

const Solutions = (props) => {
  const [selectedSolution, setSelectedSolution] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleChange = (event) => {
    setSelectedSolution(event.target.value)
  }

  const solArray = solutionsArray(props.solutionsData, props.pipeData)

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
          <InputLabel
            id="solutions-select-label"
            key={refreshKey}
            shrink={false}
          >
            {selectedSolution ? selectedSolution.name : 'Solutions'}
          </InputLabel>
          <Select
            labelId="solutions-select-label"
            id="solutions-select"
            value={selectedSolution}
            label="Solutions Endpoint"
            onChange={handleChange}
          >
            {Object.keys(solArray).length > 0 ? (
              Object.entries(solArray).map(([id, solution]) => (
                <MenuItem
                  key={id}
                  value={{
                    id: solution.id,
                    name: solution.name,
                    description: solution.description,
                  }}
                >
                  {solution.name}
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
          onClick={() => toggleDrawer(true)}
          disabled={!selectedSolution}
        >
          Add
        </Button>
        <Drawer
          variant="temporary"
          PaperProps={{
            sx: {
              borderRadius: '20px 0px 0px 20px',
            },
          }}
          open={open}
          onClose={() => toggleDrawer(false)}
          anchor="right"
        >
          <SolutionsModal
            selectedSolution={selectedSolution}
            setSelectedSolution={setSelectedSolution}
            setRefreshKey={setRefreshKey}
            toggleDrawer={toggleDrawer}
          />
        </Drawer>
      </CardContent>
    </Card>
  )
}

export default Solutions

const solutionsArray = (solutionsData, pipeData) => {
  console.log(solutionsData, pipeData)
  const pipeSolutionIds = new Set(pipeData.map((pipe) => pipe.solutionId))
  return solutionsData.data
    .filter((solution) => !pipeSolutionIds.has(solution.id))
    .reduce((acc, solution) => {
      acc[solution.id] = {
        id: solution.id,
        name: solution.solutionName,
        description: solution.description,
      }
      return acc
    }, {})
}
