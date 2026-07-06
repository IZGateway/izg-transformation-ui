# Spec: Mapping Create and Edit

**Source ticket:** [IGDD-2533](https://izgateway.atlassian.net/browse/IGDD-2533)

## ADDED Requirements

### Requirement: Create a new mapping
The user guide MUST walk the user through creating a mapping, using the running
end-to-end example scenario defined in design.md.

#### Scenario: Opening the create form
WHEN a user clicks Add New on the Mappings list
THEN the guide shows a screenshot of the empty Create Mapping form
AND identifies each required field

#### Scenario: Completing the mapping form
WHEN a user fills in all required mapping fields
THEN the guide shows a screenshot of the completed form before submission
AND explains what each field controls

#### Scenario: Successful mapping creation
WHEN a user submits a valid Create Mapping form
THEN the guide shows the success snackbar notification on the Mappings list
AND shows the new mapping appearing in the list

#### Scenario: Validation error on create
WHEN a user submits the Create Mapping form with missing required fields
THEN the guide shows the inline validation error messages
AND explains which fields are required

### Requirement: Edit an existing mapping
The user guide MUST document how to modify an existing mapping's configuration.

#### Scenario: Opening an existing mapping for edit
WHEN a user opens an existing mapping in the Edit Mapping form
THEN the guide shows a screenshot of the form pre-populated with existing values

#### Scenario: Saving edits
WHEN a user modifies a field and submits the Edit Mapping form
THEN the guide shows the success snackbar notification on return to the Mappings list
AND explains any downstream effects on solutions using this mapping

### Requirement: Disable a mapping
The user guide MUST document how to disable a mapping from the edit page.

#### Scenario: Disabling a mapping
WHEN a user disables a mapping from the Edit Mapping form
THEN the guide shows the resulting disabled state in the Mappings list
AND warns the user that solutions referencing this mapping will be affected
