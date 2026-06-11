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

const normalizeGroupName = (groupName: string) =>
  groupName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')

const NORMALIZED_GROUP_ROLE_MAPPING: Record<string, XformRole[]> = Object.entries(
  GROUP_ROLE_MAPPING
).reduce((accumulator, [groupName, roles]) => {
  accumulator[normalizeGroupName(groupName)] = roles
  return accumulator
}, {} as Record<string, XformRole[]>)

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

export const MAPPING_READ_ROLES: XformRole[] = [
  'organization-reader',
  'organization-writer',
  'organization-deleter',
  'admin',
]

export const MAPPING_WRITE_ROLES: XformRole[] = [
  'organization-writer',
  'organization-deleter',
  'admin',
]

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
  if (typeof groups === 'string') {
    const normalizedValue = groups.trim()
    if (!normalizedValue) return []

    if (normalizedValue.startsWith('[') && normalizedValue.endsWith(']')) {
      try {
        const parsedValue = JSON.parse(normalizedValue)
        return getGroups(parsedValue)
      } catch {
        // Fall through to CSV/single-value handling.
      }
    }

    if (normalizedValue.includes(',')) {
      return normalizedValue
        .split(',')
        .map((groupName) => groupName.trim())
        .filter((groupName) => groupName.length > 0)
    }

    return [normalizedValue]
  }

  if (!Array.isArray(groups)) return []

  const extractedGroups: string[] = []

  groups.forEach((group) => {
    if (typeof group === 'string') {
      extractedGroups.push(group)
      return
    }

    if (!group || typeof group !== 'object') {
      return
    }

    const typedGroup = group as {
      name?: unknown
      label?: unknown
      value?: unknown
      profile?: { name?: unknown }
    }

    const groupNameCandidate =
      typedGroup.name ??
      typedGroup.label ??
      typedGroup.value ??
      typedGroup.profile?.name

    if (typeof groupNameCandidate === 'string') {
      extractedGroups.push(groupNameCandidate)
    }
  })

  return extractedGroups
}

export const getGroupsFromClaims = (claims: unknown): string[] => {
  if (!claims || typeof claims !== 'object') return []

  const claimMap = claims as Record<string, unknown>
  const claimCandidates = [
    claimMap.groups,
    claimMap.Groups,
    claimMap.group,
    claimMap.Group,
  ]

  for (const candidate of claimCandidates) {
    const groups = getGroups(candidate)
    if (groups.length > 0) {
      return groups
    }
  }

  return []
}

export const getRolesFromGroups = (groups: unknown): XformRole[] => {
  const normalizedGroups = getGroups(groups)
  const roles = new Set<XformRole>()

  normalizedGroups.forEach((group) => {
    const mappedRoles =
      NORMALIZED_GROUP_ROLE_MAPPING[normalizeGroupName(group)] || []
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
