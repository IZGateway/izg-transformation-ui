import React, { memo, useMemo, useState } from 'react'
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
  Tooltip,
  Link,
} from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import SolutionsModal from './Modal/solutionsModal'
import { useSolutionsDataContext } from '../../contexts/EditPipeline/solutionsDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

const SolutionsList = () => {
  const [selectItem, setSelectItem] = useState<string>('')
  const { solutionsData } = useSolutionsDataContext()
  const { pipeData, tempPipeData } = useUpdatePipeDataContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const solutionsArray = CreateSolutionsArray(
    solutionsData,
    tempPipeData || pipeData
  )
  const selectedSolution = solutionsArray[selectItem] || {
    description: '',
    id: '',
    solutionName: '',
  }

  const handleModalOpen = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      setSelectItem('')
    }
  }

  return (
    <Card
      data-testid="solutions-list-container"
      sx={{ minWidth: 275, borderRadius: '0px 0px 30px 30px' }}
    >
      <CardHeader title="Search for Solutions" />
      <Divider />
      <CardContent>
        <Typography
          variant="body1"
          component="div"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Pick a solution from the dropdown menu.
          <Link
            color="primary"
            href="/manage"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Need help? Find descriptions for these solutions on our documentation page"
          >
            <Tooltip
              title={
                <Typography fontSize=".75rem">
                  <b>Need help?</b>
                  <br /> Find descriptions for
                  <br />
                  these solutions on our
                  <br />
                  documentation page
                </Typography>
              }
              arrow
              placement="right"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HelpIcon
                color="primary"
                sx={{ marginLeft: 1, display: 'flex', alignSelf: 'center' }}
              />
            </Tooltip>
          </Link>
        </Typography>
        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          {Object.keys(solutionsArray).length > 0 ? (
            <InputLabel
              data-testid="solutions-select-label"
              id="solutions-select-label"
              shrink={false}
            >
              {selectedSolution.solutionName || 'Solutions'}
            </InputLabel>
          ) : (
            <InputLabel
              data-testid="solutions-select-label"
              id="solutions-select-label"
              shrink={false}
            >
              No solutions available
            </InputLabel>
          )}
          <Select
            data-testid="solutions-select"
            labelId="solutions-select-label"
            id="solutions-select"
            value={selectItem}
            onChange={(event) => setSelectItem(event.target.value as string)}
            displayEmpty
          >
            {Object.keys(solutionsArray).length > 0 ? (
              Object.entries(solutionsArray).map(([id, solution]) => (
                <MenuItem key={id} value={id}>
                  <Tooltip
                    sx={{ cursor: 'pointer', zIndex: 1000 }}
                    title={
                      <Typography>
                        {(solution as { description: string }).description}
                      </Typography>
                    }
                    arrow
                    placement="left-start"
                  >
                    <span>
                      {(solution as { solutionName: string }).solutionName}
                    </span>
                  </Tooltip>
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">No solutions available</MenuItem>
            )}
          </Select>
        </FormControl>
        <Button
          data-testid="add-button"
          id="add"
          color="secondary"
          variant="outlined"
          sx={{
            borderRadius: '30px',
          }}
          onClick={() => {
            setIsModalOpen(true)
          }}
          disabled={!selectedSolution.id}
        >
          Add
        </Button>

        {isModalOpen && (
          <SolutionsModal
            selectedSolution={selectedSolution}
            isNewSolution={true}
            setOpen={handleModalOpen}
            open={isModalOpen}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default memo(SolutionsList)

const CreateSolutionsArray = (solutionsData, pipeData) => {
  return useMemo(() => {
    if (!solutionsData || !pipeData) {
      return {}
    }

    const pipeSolutionIds = new Set(
      pipeData?.map((pipe) => pipe.solutionId) || []
    )
    return solutionsData
      .filter((solution) => !pipeSolutionIds.has(solution.id))
      .reduce((acc, solution) => {
        acc[solution.id] = {
          id: solution.id,
          solutionName: solution.solutionName,
          description: solution.description,
        }
        return acc
      }, {})
  }, [solutionsData, pipeData])
}
