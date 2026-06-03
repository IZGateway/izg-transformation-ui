import TransformIcon from '@mui/icons-material/Transform'
import { MenuItem } from '.'
import RuleIcon from '@mui/icons-material/Rule'
import MapIcon from '@mui/icons-material/Map'
import {
  MAPPING_READ_ROLES,
  PIPELINE_READ_ROLES,
  SOLUTION_READ_ROLES,
} from '../../lib/rbac'

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
    requiredRoles: PIPELINE_READ_ROLES,
  },
  {
    label: 'Solutions Creator',
    icon: <RuleIcon fontSize="large" />,
    path: '/solutions',
    requiredRoles: SOLUTION_READ_ROLES,
  },
  {
    label: 'Mapping',
    icon: <MapIcon fontSize="large" />,
    path: '/mapping',
    requiredRoles: MAPPING_READ_ROLES,
  },
]
