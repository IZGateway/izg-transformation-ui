import * as React from 'react'
import { Card, CardContent, Button, Box } from '@mui/material'

const SolutionsAdded = (props) => {
  return (
    <Card sx={{ marginTop: 4, borderRadius: '0px 0px 16px 16px' }} id="zip">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginRight: 4,
        }}
      ></Box>
      <CardContent>
        <Box display={'flex'} flexDirection={'row'} gap={2} mt={4}>
          <Button
            id="reorder"
            color="primary"
            variant="outlined"
            sx={{
              borderRadius: '30px',
            }}
          >
            Reorder
          </Button>
          <Button
            id="save"
            color="secondary"
            variant="contained"
            sx={{
              borderRadius: '30px',
            }}
          >
            Save
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SolutionsAdded
