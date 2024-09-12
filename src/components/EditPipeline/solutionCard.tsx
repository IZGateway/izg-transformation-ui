import { Card, CardContent, Typography } from '@mui/material'

const SolutionCard = (props) => {
  //   console.log(props)
  return (
    <Card
      sx={{ marginTop: 4, borderRadius: '0px 0px 16px 16px', marginBottom: 0 }}
    >
      <CardContent>
        <Typography variant="h6">{props.solution.solutionName}</Typography>
        <Typography variant="body1">{props.solution.description}</Typography>
      </CardContent>
    </Card>
  )
}

export default SolutionCard
