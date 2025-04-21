import _ from 'lodash'
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
    order: existingOperation?.order || _.random(1_000_000_000, 2_000_000_000),
    [fieldName]: value,
  }
}

export const removeOperation = (index, operations, setOperations) => {
  const newOperations = operations.filter((_, i) => i !== index)
  setOperations(newOperations)
}

export const transformOperations = (operations, operationFieldsData) => {
  return operations.map((operation, index) => {
    const transformedOperation = {
      ...operation,
      order: operation.order ?? index * _.random(1_000_000_000, 2_000_000_000),
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

export function isFormChanged(current, initial) {
  return !_.isEqual(current, initial)
}

export const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => res.json())
