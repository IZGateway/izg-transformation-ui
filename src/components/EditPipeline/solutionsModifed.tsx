import * as React from 'react'
import { Card, CardContent, Button, Box } from '@mui/material'
import { useReorderContext } from '../../contexts/EditPipeline/reorderContext'

const SolutionsModified = ({ handleSave, handleCancel, handleReorder }) => {
  const { isReorder, setIsReorder } = useReorderContext()
  const onSave = async () => {
    await handleSave()
    setIsReorder(false)
  }
  const onCancel = () => {
    handleCancel()
    setIsReorder(false)
  }
  const onReorder = () => {
    handleReorder()
    setIsReorder(true)
  }

  return (
    <Card sx={{ marginTop: 4, borderRadius: '30px' }} id="zip">
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          {isReorder ? (
            <Button
              id="cancel"
              color="error"
              variant="outlined"
              sx={{ borderRadius: '30px', display: 'flex', width: '10%' }}
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : (
            <Button
              id="reorder"
              color="primary"
              variant="outlined"
              sx={{ borderRadius: '30px', display: 'flex', width: '10%' }}
              onClick={onReorder}
            >
              Reorder
            </Button>
          )}
          <Button
            id="save"
            color="secondary"
            variant="contained"
            sx={{ borderRadius: '30px', display: 'flex', width: '10%' }}
            onClick={onSave}
          >
            Save
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SolutionsModified
