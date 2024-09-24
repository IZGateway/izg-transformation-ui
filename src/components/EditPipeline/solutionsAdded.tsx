import * as React from 'react'
import { Card, CardContent, Button, Box } from '@mui/material'

const SolutionsAdded = (props) => {
  return (
    <Card
      sx={{
        marginTop: 4,
        borderRadius: '30px',
      }}
      id="zip"
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
            mt: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            id="reorder"
            color="primary"
            variant="outlined"
            sx={{
              borderRadius: '30px',
            }}
            onClick={() => props.onReorderToggler(true)}
            disabled={props.isReorder}
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
            onClick={() => {
              props.onSave()
              props.onReorderToggler(false)
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
