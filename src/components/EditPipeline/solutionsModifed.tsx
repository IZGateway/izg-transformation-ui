import * as React from 'react'
import { Card, CardContent, Button, Box } from '@mui/material'
import { useReorderContext } from '../../contexts/EditPipeline/reorderContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

const SolutionsModified = ({ handleSave }) => {
  const { isReorder, setIsReorder } = useReorderContext()
  const { pipeData, setPipeData, tempPipeData, setTempPipeData } =
    useUpdatePipeDataContext()

  const onReorder = () => {
    setTempPipeData(pipeData)
    setIsReorder(true)
  }

  const onCancel = () => {
    if (tempPipeData) {
      setPipeData(tempPipeData)
      setTempPipeData(null)
    }
    setIsReorder(false)
  }

  const onSave = async () => {
    await handleSave()
    setIsReorder(false)
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
