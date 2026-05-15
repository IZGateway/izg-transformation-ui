# Spec: Solution Create and Edit

## ADDED Requirements

### Requirement: Create a new solution
The user guide MUST walk the user through creating a solution, using the running
end-to-end example scenario defined in design.md.

#### Scenario: Opening the create form
WHEN a user clicks Add New on the Solutions list
THEN the guide shows a screenshot of the empty Create Solution form
AND identifies each required field

#### Scenario: Completing the solution form
WHEN a user fills in all required solution fields
THEN the guide shows a screenshot of the completed form before submission
AND explains what each field controls (input format, output format, mapping assignment)

#### Scenario: Successful solution creation
WHEN a user submits a valid Create Solution form
THEN the guide shows the success notification (snackbar)
AND shows the new solution appearing in the Solutions list

#### Scenario: Validation error on create
WHEN a user submits the Create Solution form with missing required fields
THEN the guide shows the inline validation error messages
AND explains which fields are required

### Requirement: Edit an existing solution
The user guide MUST document how to modify an existing solution's configuration.

#### Scenario: Opening an existing solution for edit
WHEN a user opens an existing solution in the Edit Solution form
THEN the guide shows a screenshot of the form pre-populated with existing values

#### Scenario: Saving edits
WHEN a user modifies a field and submits the Edit Solution form
THEN the guide shows the success notification
AND explains any downstream effects on pipelines using this solution

### Requirement: Operations
The user guide MUST document how Operations are configured within a solution,
as a subsection of the solution create/edit workflow.

#### Scenario: Adding an operation
WHEN a user adds an operation to a solution
THEN the guide shows a screenshot of the operations sub-form
AND explains what an operation is and how it transforms message content

#### Scenario: Ordering operations
WHEN a user reorders operations within a solution
THEN the guide explains that operations execute in the order shown
AND shows the resulting order after a reorder action

#### Scenario: Removing an operation
WHEN a user removes an operation from a solution
THEN the guide shows the resulting state with the operation removed

### Requirement: Preconditions within solutions
The user guide MUST document Preconditions as they appear in the solution
create/edit workflow (distinct from pipeline-level preconditions).

#### Scenario: Adding a precondition to a solution
WHEN a user adds a precondition to a solution
THEN the guide shows a screenshot of the preconditions sub-form in the solution context
AND clarifies how solution-level preconditions differ from pipeline-level preconditions
