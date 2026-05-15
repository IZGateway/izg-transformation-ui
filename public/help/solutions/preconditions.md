# Preconditions in Solutions

Preconditions are conditional checks attached to a solution. When a precondition is
configured, the solution's operations are only executed if all preconditions evaluate
to true for the current message.

> **Note:** Preconditions in solutions control whether the solution's operations are
> applied to a message. For preconditions that control whether an entire pipeline runs,
> see [Preconditions in Pipelines](../pipelines/preconditions.md).

## Configuring Preconditions

Preconditions are configured on the solution create/edit page, typically in a dedicated
**Preconditions** section below the operations.

Each precondition has three fields:

| Field | Description |
|---|---|
| **Field** | The message field to evaluate |
| **Method** | The comparison method (e.g., equals, contains, exists) |
| **Value** | The value to compare against |

## Adding a Precondition

1. On the solution create/edit page, locate the **Preconditions** section.
2. Click **Add Precondition**.
3. Select the **Field**, **Method**, and enter the **Value**.
4. Repeat to add additional preconditions (all conditions must be true — they are
   AND-ed together).

## Removing a Precondition

Click the **Delete** icon on the precondition row you want to remove.

## Example

To apply a solution only to ADT A01 messages from a specific organization:

- Field: `message.type` — Method: `equals` — Value: `ADT_A01`
- Field: `message.sendingOrg` — Method: `equals` — Value: `GeneralHospitalIIS`
