import TransformIcon from '@mui/icons-material/Transform'
import { MenuItem } from '.'

export const menuItems: MenuItem[] = [
  // {
  //   label: "User Profile",
  //   icon: <AccountCircleIcon fontSize="large" />,
  //   path: "/user",
  // },
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
]
