export const updatePrecondition = (
  index: number,
  field: string,
  value: string,
  preconditions: Array<{ [key: string]: string }>,
  setPreconditions: React.Dispatch<
    React.SetStateAction<Array<{ [key: string]: string }>>
  >
) => {
  setPreconditions((prevPreconditions) => {
    const newPreconditions = [...prevPreconditions]
    newPreconditions[index] = { ...newPreconditions[index], [field]: value }
    return newPreconditions
  })
}

export const removePrecondition = (
  index,
  preconditions,
  setPreconditions,
  setHasPreconditions
) => {
  const newPreconditions = preconditions.filter((_, i) => i !== index)
  setPreconditions(newPreconditions)
  setHasPreconditions(newPreconditions.length > 0)
}

export const transformPreconditions = (
  preconditionsData,
  preconditionMethodsData,
  preconditions
) => {
  return preconditions.map(
    (precondition: { id: string; method: string; value: string }) => {
      const transformedPrecondition = {
        id: precondition.id,
        method: precondition.method,
        dataPath: '',
      }

      const matchingPrecondition = preconditionsData.data.find(
        (p) => p.id === precondition.id
      )
      transformedPrecondition.dataPath = matchingPrecondition.dataPath

      const methodData = preconditionMethodsData.find(
        (m) => m.method === precondition.method
      )

      if (methodData) {
        const additionalProp = Object.keys(methodData.properties).find(
          (key) => key !== 'id' && key !== 'dataPath'
        )
        if (additionalProp) {
          transformedPrecondition[additionalProp] = precondition.value
        }
      }
      return transformedPrecondition
    }
  )
}

export const formatPreconditions = (
  hasPreconditions: boolean,
  existingPreconditions: Array<{ [key: string]: string }>
): Array<{ id: string; method: string; value: string }> => {
  if (!hasPreconditions) return []
  if (existingPreconditions.length === 0 || !existingPreconditions) {
    return [{ id: '', method: '', value: '' }]
  }
  return existingPreconditions.map((precondition) => {
    const valueKey = Object.keys(precondition).find(
      (key) => !['id', 'method', 'dataPath'].includes(key)
    )
    return {
      id: precondition.id || '',
      method: precondition.method || '',
      value: precondition[valueKey] || '',
    }
  })
}
