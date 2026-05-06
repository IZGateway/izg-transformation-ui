import React, { memo, useMemo, useState } from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Button,
  Link,
  Tooltip,
} from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import SolutionsModal from './Modal/solutionsModal'
import SearchableSelect from '../SearchableSelect'
import { useSolutionsDataContext } from '../../contexts/EditPipeline/solutionsDataContext'
import { useUpdatePipeDataContext } from '../../contexts/EditPipeline/updatePipeDataContext'

const SolutionsList = () => {
  const [selectItem, setSelectItem] = useState<string>('')
  const { solutionsData } = useSolutionsDataContext()
  const { pipeData, tempPipeData } = useUpdatePipeDataContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const solutionsOptions = useMemo(() => {
    if (!solutionsData) return []
    const pipeSolutionIds = new Set(
      (tempPipeData || pipeData)?.map((p) => p.solutionId) || []
    )
    return solutionsData
      .filter((s) => !pipeSolutionIds.has(s.id))
      .map((s) => ({
        value: s.id,
        label: s.solutionName,
        description: s.description,
      }))
  }, [solutionsData, tempPipeData, pipeData])

  const selectedSolution = useMemo(() => {
    if (!selectItem) return null
    return solutionsData?.find((s) => s.id === selectItem) ?? null
  }, [solutionsData, selectItem])

  const handleModalOpen = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) setSelectItem('')
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
        <SearchableSelect
          options={solutionsOptions}
          value={selectItem}
          onChange={setSelectItem}
          label="Solutions"
          testId="solutions-select"
          sx={{ marginTop: 2, marginBottom: 2 }}
        />
        <Button
          data-testid="add-button"
          id="add"
          color="secondary"
          variant="outlined"
          sx={{ borderRadius: '30px' }}
          onClick={() => setIsModalOpen(true)}
          disabled={!selectItem}
        >
          Add
        </Button>

        {isModalOpen && selectedSolution && (
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
