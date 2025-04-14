import { v4 as uuidv4 } from 'uuid'

export function buildOperation(
  existingOperation,
  fieldName,
  value,
  operationType
) {
  return {
    ...existingOperation,
    id: existingOperation.id || uuidv4(),
    method: operationType,
    order: existingOperation.order || 1073741824,
    [fieldName]: value,
  }
}

export const removeOperation = (
  index,
  operations,
  setOperations,
  setHasOperations
) => {
  const newOperations = operations.filter((_, i) => i !== index)
  setOperations(newOperations)
  if (newOperations.length === 0) {
    setHasOperations(false)
  }
}

export const transformOperations = (operations, operationFieldsData) => {
  return operations.map((operation, index) => {
    const transformedOperation = {
      ...operation,
      order: operation.order ?? index * 1073741824,
    }

    Object.keys(operation).forEach((key) => {
      if (key.endsWith('Field') && operation[key]) {
        const matchingField = operationFieldsData.data.find(
          (field) => field.id === operation[key]
        )
        if (matchingField) {
          transformedOperation[key] = matchingField.dataPath
        }
      }
    })

    return transformedOperation
  })
}

export const reverseTransformOperations = (operations, operationFieldsData) => {
  return operations.map((operation) => {
    const newOp = { ...operation }
    Object.keys(operation).forEach((key) => {
      if (key.endsWith('Field') && operation[key]) {
        const matching = operationFieldsData.data.find(
          (field) => field.dataPath === operation[key]
        )
        if (matching) {
          newOp[key] = matching.id
        }
      }
    })
    return newOp
  })
}
