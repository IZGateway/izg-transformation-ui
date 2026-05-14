# Preconditions in Pipelines

Pipeline preconditions are conditional checks that determine whether a pipeline
processes an incoming message. If any precondition fails, the pipeline skips the
message entirely.

> **Note:** These preconditions control whether the pipeline runs at all. For
> preconditions that control whether a specific solution's operations are applied
> within the pipeline, see [Preconditions in Solutions](../solutions/preconditions.md).

## Configuring Preconditions

Preconditions are configured on the pipeline create/edit page in the **Preconditions**
section.

Each precondition row has three fields:

| Field | Description |
|---|---|
| **Field** | The message field to evaluate |
| **Method** | The comparison method (e.g., equals, contains, exists) |
| **Value** | The value to compare against (entered as text) |

A vertical line connects precondition rows visually to indicate they are part of the
same evaluation chain. All preconditions must be true for the pipeline to execute
(AND logic).

## Adding a Precondition

1. On the pipeline create/edit page, scroll to the **Preconditions** section.
2. Click **Add Precondition** (or the equivalent button).
3. Select the **Field** and **Method** from the dropdowns; enter the **Value**.
4. Repeat to add additional conditions.

## Removing a Precondition

Click the **Delete** (trash) icon on the row you want to remove.

## Example

To configure a pipeline that processes only ADT A01 messages:

- Field: `message.eventType` — Method: `equals` — Value: `ADT_A01`

To further restrict to messages from a specific sending facility:

- Field: `message.eventType` — Method: `equals` — Value: `ADT_A01`
- Field: `message.sendingFacility` — Method: `equals` — Value: `GENERAL_HOSPITAL`

Both conditions must be true for the pipeline to run.
