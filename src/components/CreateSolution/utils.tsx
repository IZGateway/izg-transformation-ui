import { v4 as uuidv4 } from 'uuid'

export function buildOperation(
  existingOperation,
  fieldName,
  value,
  operationType
) {
  return {
    ...existingOperation,
    id: existingOperation.id || uuidv4(), // auto generate if not set
    method: operationType,
    order: existingOperation.order || 1073741824, // default order or custom logic
    [fieldName]: value,
  }
}
