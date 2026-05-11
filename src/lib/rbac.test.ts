import {
  canAccessConsole,
  canAccessPath,
  getRolesFromGroups,
} from './rbac'

describe('rbac', () => {
  it('maps onboarding staff to read-only roles', () => {
    const roles = getRolesFromGroups(['Xform Onboarding Staff'])

    expect(roles).toEqual(
      expect.arrayContaining([
        'pipeline-reader',
        'solution-reader',
        'organization-reader',
      ])
    )
    expect(roles).not.toContain('pipeline-writer')
    expect(roles).not.toContain('solution-writer')
  })

  it('denies console access for sender-only users', () => {
    const roles = getRolesFromGroups(['Xform Sender'])

    expect(canAccessConsole(roles)).toBe(false)
  })

  it('allows onboarding staff to view but not edit pipelines', () => {
    const roles = getRolesFromGroups(['Xform Onboarding Staff'])

    expect(canAccessPath('/manage', roles)).toBe(true)
    expect(canAccessPath('/edit/pipeline/1234', roles)).toBe(false)
  })

  it('denies solution screens for business analyst', () => {
    const roles = getRolesFromGroups(['Xform Business Analyst'])

    expect(canAccessPath('/solutions', roles)).toBe(false)
    expect(canAccessPath('/add/solution', roles)).toBe(false)
  })

  it('allows unknown routes by default', () => {
    const roles = getRolesFromGroups(['Xform Onboarding Staff'])

    expect(canAccessPath('/some-future-route', roles)).toBe(true)
  })
})
