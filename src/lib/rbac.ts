export type XformRole =
  | 'pipeline-reader'
  | 'pipeline-writer'
  | 'pipeline-deleter'
  | 'solution-reader'
  | 'solution-writer'
  | 'solution-deleter'
  | 'organization-reader'
  | 'organization-writer'
  | 'organization-deleter'
  | 'admin'
  | 'xform-sender'

const GROUP_ROLE_MAPPING: Record<string, XformRole[]> = {
  'Xform Administrators': [
    'pipeline-reader',
    'pipeline-writer',
    'pipeline-deleter',
    'solution-reader',
    'solution-writer',
    'solution-deleter',
    'organization-reader',
    'organization-writer',
    'organization-deleter',
    'admin',
  ],
  'Xform Business Analyst': [
    'pipeline-reader',
    'pipeline-writer',
    'pipeline-deleter',
    'organization-reader',
  ],
  'Xform Solutions Engineer': [
    'pipeline-reader',
    'pipeline-writer',
    'pipeline-deleter',
    'solution-reader',
    'solution-writer',
    'solution-deleter',
    'organization-reader',
    'organization-writer',
  ],
  'Xform Operations Staff': [
    'pipeline-reader',
    'pipeline-writer',
    'pipeline-deleter',
    'solution-reader',
    'solution-writer',
    'solution-deleter',
    'organization-reader',
    'organization-writer',
  ],
  'Xform Onboarding Staff': [
    'pipeline-reader',
    'solution-reader',
    'organization-reader',
  ],
  'Xform Sender': ['xform-sender'],
}

const CONSOLE_LOGIN_ROLES: XformRole[] = [
  'pipeline-reader',
  'pipeline-writer',
  'pipeline-deleter',
  'solution-reader',
  'solution-writer',
  'solution-deleter',
  'organization-reader',
  'organization-writer',
  'organization-deleter',
  'admin',
]

export const PIPELINE_READ_ROLES: XformRole[] = [
  'pipeline-reader',
  'pipeline-writer',
  'pipeline-deleter',
  'admin',
]

export const PIPELINE_WRITE_ROLES: XformRole[] = [
  'pipeline-writer',
  'pipeline-deleter',
  'admin',
]

export const SOLUTION_READ_ROLES: XformRole[] = [
  'solution-reader',
  'solution-writer',
  'solution-deleter',
  'admin',
]

export const SOLUTION_WRITE_ROLES: XformRole[] = [
  'solution-writer',
  'solution-deleter',
  'admin',
]

// Mapping permissions are aligned with pipeline roles until dedicated mapping roles exist.
export const MAPPING_READ_ROLES = PIPELINE_READ_ROLES
export const MAPPING_WRITE_ROLES = PIPELINE_WRITE_ROLES

const ROUTE_ROLE_RULES: Array<{ prefix: string; requiredRoles: XformRole[] }> =
  [
    { prefix: '/manage', requiredRoles: PIPELINE_READ_ROLES },
    { prefix: '/add/pipeline', requiredRoles: PIPELINE_WRITE_ROLES },
    { prefix: '/edit/pipeline', requiredRoles: PIPELINE_WRITE_ROLES },
    { prefix: '/solutions', requiredRoles: SOLUTION_READ_ROLES },
    { prefix: '/add/solution', requiredRoles: SOLUTION_WRITE_ROLES },
    { prefix: '/edit/solution', requiredRoles: SOLUTION_WRITE_ROLES },
    { prefix: '/mapping', requiredRoles: MAPPING_READ_ROLES },
    { prefix: '/add/mapping', requiredRoles: MAPPING_WRITE_ROLES },
    { prefix: '/edit/mapping', requiredRoles: MAPPING_WRITE_ROLES },
  ]

export const getGroups = (groups: unknown): string[] => {
  if (!Array.isArray(groups)) return []
  return groups.filter((group): group is string => typeof group === 'string')
}

export const getRolesFromGroups = (groups: unknown): XformRole[] => {
  const normalizedGroups = getGroups(groups)
  const roles = new Set<XformRole>()

  normalizedGroups.forEach((group) => {
    const mappedRoles = GROUP_ROLE_MAPPING[group] || []
    mappedRoles.forEach((role) => roles.add(role))
  })

  return Array.from(roles)
}

export const hasAnyRole = (
  userRoles: XformRole[] | undefined,
  requiredRoles: XformRole[]
) => {
  if (!userRoles || !requiredRoles.length) return false
  return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole))
}

export const canAccessConsole = (roles: XformRole[]) =>
  hasAnyRole(roles, CONSOLE_LOGIN_ROLES)

export const canAccessPath = (pathname: string, roles: XformRole[]) => {
  const matchingRule = ROUTE_ROLE_RULES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  )

  if (!matchingRule) {
    return true
  }

  return hasAnyRole(roles, matchingRule.requiredRoles)
}
