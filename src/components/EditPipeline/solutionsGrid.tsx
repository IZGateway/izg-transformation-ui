import { Grid } from '@mui/material'
import SolutionCard from './solutionCard'

interface Solution {
  id: string
  solutionData: string
}

const SolutionsGrid = (props) => {
  const combinedData = combineData(props.pipeData, props.solutionsData.data)
  return (
    <Grid container spacing={2}>
      {Object.values(combinedData).map((solution: Solution) => (
        <Grid item xs={12} md={6} lg={4} key={solution.id}>
          <SolutionCard solution={solution.solutionData} />
        </Grid>
      ))}
    </Grid>
  )
}

export default SolutionsGrid

const combineData = (pipeData, solutionsData) => {
  return pipeData.map((pipe) => {
    const solutionData = solutionsData.find(
      (solution) => solution.id === pipe.solutionId
    )
    return {
      ...pipe,
      solutionData,
    }
  })
}
