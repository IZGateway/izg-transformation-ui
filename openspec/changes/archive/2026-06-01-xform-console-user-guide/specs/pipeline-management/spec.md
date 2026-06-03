# Spec: Pipeline Management

## ADDED Requirements

### Requirement: Pipelines list overview
The user guide MUST document the Pipelines list page so users can understand the
current state of all configured pipelines at a glance.

#### Scenario: Viewing the pipelines list
WHEN a user navigates to Pipelines
THEN the guide shows a screenshot of the `/manage` page with the DataGrid populated
AND identifies each column (name, status, actions) and what each represents

#### Scenario: Empty pipelines list
WHEN no pipelines have been configured
THEN the guide shows a screenshot of the empty DataGrid state
AND explains that the user MUST create a pipeline using the Add New button

### Requirement: Search and filter
The user guide MUST document how to find a specific pipeline in a large list.

#### Scenario: Using the quick filter
WHEN a user types in the DataGrid quick filter toolbar
THEN the guide shows a screenshot of filtered results
AND explains that filtering is applied to the pipeline name

### Requirement: Enable and disable pipelines
The user guide MUST document the active/inactive toggle on the Pipelines list.

#### Scenario: Enabling a pipeline
WHEN a user clicks the toggle to activate an inactive pipeline
THEN the guide shows the before and after screenshots of the toggle state
AND describes what "active" means for message routing behavior

#### Scenario: Disabling a pipeline
WHEN a user clicks the toggle to deactivate an active pipeline
THEN the guide shows the resulting inactive state
AND warns the user that disabling a pipeline stops message routing immediately

### Requirement: Navigate to edit a pipeline
The user guide MUST explain how to open an existing pipeline for editing.

#### Scenario: Opening edit from the list
WHEN a user clicks the edit action on a pipeline row
THEN the guide explains the user is taken to the Edit Pipeline page for that pipeline
