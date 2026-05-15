# Configuring Operations

Operations define the individual transformation steps applied to messages within a
solution. Each operation has a **type** and a set of type-specific fields.

Operations are configured on the **Request** and **Response** tabs of the solution form.
Multiple operations can be added to each tab and are executed in order.

## Adding an Operation

1. On the solution create/edit page, select the **Request** or **Response** tab.
2. Click **Add Operation** (or the equivalent button).
3. Select an operation type from the dropdown.
4. Fill in the required fields for that type.
5. Repeat to add additional operations.

## Removing an Operation

Click the **Delete** (trash/bin) icon on any operation row to remove it.

## Operation Types

### mapper

Translates a code value using the configured mappings.

| Field | Required | Description |
|---|---|---|
| **Code Field** | Yes | The message field containing the source code to translate |
| **Code System Field** | Yes | The message field containing the source code system |
| **Fallback Code System** | Yes | A default code system used when the field value is absent |

### copy

Copies a value from one message field to another.

| Field | Required | Description |
|---|---|---|
| **Source** | Yes | The source field to read from |
| **Destination** | Yes | The destination field to write to |

### set

Sets a message field to a fixed value.

| Field | Required | Description |
|---|---|---|
| **Destination Field** | Yes | The field to set |
| **Set Value** | Yes | The literal value to assign |

### regex_replace

Applies a regular expression replacement to a field value.

| Field | Required | Description |
|---|---|---|
| **Field** | Yes | The message field to apply the regex to |
| **Regex** | Yes | The regular expression pattern |
| **Replace** | No | The replacement string (leave blank to delete matched text) |

### save_state

Saves a field value into a keyed lookup for use later in the pipeline.

| Field | Required | Description |
|---|---|---|
| **Field** | Yes | The message field whose value to save |
| **Lookup Key** | Yes | The key under which to store the saved value |

![Operations form](../images/solution-operations.png)
