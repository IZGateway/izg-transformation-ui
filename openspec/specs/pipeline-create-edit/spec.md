# Spec: Pipeline Create and Edit

## Purpose

Defines the user guide coverage for creating and editing pipelines, including the
preconditions sub-form and solution assignment within the create/edit workflow.

## Requirements

### Requirement: Create a new pipeline
The user guide MUST walk the user through creating a pipeline from start to finish,
using the running end-to-end example scenario defined in design.md.

#### Scenario: Opening the create form
WHEN a user clicks Add New on the Pipelines list
THEN the guide shows a screenshot of the empty Create Pipeline form
AND identifies each required field

#### Scenario: Completing the pipeline form
WHEN a user fills in the pipeline name and selects a solution
THEN the guide shows a screenshot of the completed form before submission
AND explains what each field controls

#### Scenario: Successful pipeline creation
WHEN a user submits a valid Create Pipeline form
THEN the guide shows the success notification (snackbar)
AND shows the new pipeline appearing in the Pipelines list

#### Scenario: Validation error on create
WHEN a user submits the Create Pipeline form with missing required fields
THEN the guide shows the inline validation error messages
AND explains which fields are required

### Requirement: Edit an existing pipeline
The user guide MUST document how to modify an existing pipeline's configuration.

#### Scenario: Opening an existing pipeline for edit
WHEN a user opens an existing pipeline in the Edit Pipeline form
THEN the guide shows a screenshot of the form pre-populated with existing values

#### Scenario: Saving edits
WHEN a user modifies a field and submits the Edit Pipeline form
THEN the guide shows the success notification
AND explains that changes take effect immediately for active pipelines

### Requirement: Preconditions
The user guide MUST document how Preconditions are configured within a pipeline,
as a subsection of the pipeline create/edit workflow.

#### Scenario: Adding a precondition
WHEN a user adds a precondition to a pipeline
THEN the guide shows a screenshot of the preconditions sub-form
AND explains what a precondition is and when it applies to message routing

#### Scenario: Removing a precondition
WHEN a user removes a precondition from a pipeline
THEN the guide shows the resulting state with the precondition removed

### Requirement: Solution assignment
The user guide MUST document how a Solution is attached to a pipeline within
the create/edit workflow.

#### Scenario: Selecting a solution for a pipeline
WHEN a user selects a solution from the solution picker in the Pipeline form
THEN the guide shows the solution appearing as the assigned solution
AND explains that a pipeline MUST have exactly one solution assigned
