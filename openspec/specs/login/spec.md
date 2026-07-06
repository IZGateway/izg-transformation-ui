# Spec: Login

## Purpose

Defines the user guide coverage for accessing the Xform Console via Okta authentication,
including successful login, login failure, and session expiry handling.

## Requirements

### Requirement: Login entry point
The user guide MUST explain how users access the Xform Console and what triggers
the Okta authentication flow.

#### Scenario: Successful login
WHEN a user navigates to the Xform Console URL
THEN the guide shows a screenshot of the Okta login page
AND explains that the user MUST enter their organizational credentials

#### Scenario: Successful login redirect
WHEN a user completes Okta authentication
THEN the guide shows a screenshot of the authenticated landing page (Pipelines list)
AND identifies the welcome bar in the AppHeader confirming the logged-in user

#### Scenario: Login failure
WHEN a user enters incorrect credentials in Okta
THEN the guide describes the Okta error message the user will see
AND instructs the user to contact their administrator if the problem persists

### Requirement: Session handling
The user guide MUST explain what happens when a session expires.

#### Scenario: Session timeout
WHEN a user's session expires
THEN the guide explains the user is redirected back to the Okta login page
AND clarifies that unsaved work may be lost
