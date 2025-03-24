import TransformIcon from '@mui/icons-material/Transform'
import { MenuItem } from '.'
import RuleIcon from '@mui/icons-material/Rule'

export const menuItems: MenuItem[] = [
  {
    label: 'Manage Pipelines',
    icon: (
      <TransformIcon
        sx={{
          transform: 'rotate(90deg)',
        }}
        fontSize="large"
      />
    ),
    path: '/manage',
  },
  {
    label: 'Solutions Creator',
    icon: <RuleIcon fontSize="large" />,
    path: '/solutions',
  },
]
