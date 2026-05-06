import * as React from 'react'
import {
  Typography,
  CardHeader,
  Card,
  CardContent,
  Divider,
  Box,
} from '@mui/material'

type MappingHeaderProps = {
  isEditMode: boolean
}

const MappingHeader = ({ isEditMode }: MappingHeaderProps) => {
  return (
    <Box>
      <Card
        sx={{
          minWidth: 250,
          borderRadius: '0px 0px 30px 30px',
          marginTop: 0,
        }}
      >
        <CardHeader
          titleTypographyProps={{ fontWeight: 500 }}
          title={isEditMode ? 'Editing a Mapping' : 'Creating a Mapping'}
        />
        <Divider />
        <CardContent>
          <Typography variant="body1">
            {isEditMode
              ? 'Update the mapping details below. Mappings define how source codes are translated to target codes for a specific organization.'
              : 'Create a new mapping to define how a source code should be translated to a target code. Specify the organization, source and target code systems, and the respective codes.'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default MappingHeader
