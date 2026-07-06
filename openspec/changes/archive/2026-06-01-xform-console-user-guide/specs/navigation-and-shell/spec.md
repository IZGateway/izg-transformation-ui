# Spec: Navigation and Shell

## ADDED Requirements

### Requirement: Application shell overview
The user guide MUST orient the user to the persistent UI elements present on every page.

#### Scenario: AppHeader welcome bar
WHEN a user is logged in on any page
THEN the guide shows a screenshot of the AppHeader
AND identifies the application name and the logged-in user's name displayed in the header

#### Scenario: Side navigation
WHEN a user is on any page
THEN the guide shows a screenshot of the navigation menu
AND labels each navigation item and the route it leads to:
  Pipelines → `/manage`
  Solutions → `/solutions`
  Mappings → `/mapping`

### Requirement: Error page
The user guide MUST document the custom error page so users know what to do when they encounter it.

#### Scenario: Application error
WHEN the application encounters an unhandled error
THEN the guide shows a screenshot of the "Oh No!" error page
AND identifies the helpdesk link the user should use to report the problem
AND identifies the Reload button the user can use to attempt recovery

### Requirement: Page not found
The user guide MUST document the 404 page.

#### Scenario: Unknown route
WHEN a user navigates to a URL that does not exist in the application
THEN the guide shows a screenshot of the 404 page
AND explains the user should use the navigation menu to return to a known page
AND identifies the helpdesk link for reporting unexpected 404 errors
