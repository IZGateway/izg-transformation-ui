# Spec: Mapping Management

**Source ticket:** [IGDD-2533](https://izgateway.atlassian.net/browse/IGDD-2533)

## ADDED Requirements

### Requirement: Mappings list overview
The user guide MUST document the Mappings list page so users understand all
configured mappings at a glance.

#### Scenario: Viewing the mappings list
WHEN a user navigates to Mappings
THEN the guide shows a screenshot of the `/mapping` page with the DataGrid populated
AND identifies each column (name, status, actions) and what each represents

#### Scenario: Empty mappings list
WHEN no mappings have been configured
THEN the guide shows a screenshot of the empty state
AND explains that mappings MUST be created before solutions can reference them

### Requirement: Search and filter
The user guide MUST document how to find a specific mapping in the list.

#### Scenario: Using the quick filter
WHEN a user types in the DataGrid quick filter toolbar
THEN the guide shows a screenshot of filtered results
AND explains that filtering is applied to the mapping name

### Requirement: Success notification after save
The user guide MUST document the snackbar notification pattern that appears
after a mapping is saved successfully.

#### Scenario: Snackbar on return to list
WHEN a user saves a mapping and is returned to the Mappings list
THEN the guide shows a screenshot of the success snackbar notification
AND explains that the notification confirms the save was successful
AND notes that it disappears automatically after a few seconds

### Requirement: Navigate to edit a mapping
The user guide MUST explain how to open an existing mapping for editing.

#### Scenario: Opening edit from the list
WHEN a user clicks the edit action on a mapping row
THEN the guide explains the user is taken to the Edit Mapping page for that mapping
