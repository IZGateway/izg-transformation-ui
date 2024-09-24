export const updatePrecondition = (
  index,
  field,
  value,
  preconditions,
  setPreconditions
) => {
  const newPreconditions = [...preconditions]
  newPreconditions[index][field] = value
  setPreconditions(newPreconditions)
}

export const removePrecondition = (index, preconditions, setPreconditions) => {
  const newPreconditions = preconditions.filter((_, i) => i !== index)
  setPreconditions(newPreconditions)
}

export const transformPreconditions = (
  preconditionsData,
  preconditionMethodsData,
  preconditions
) => {
  return preconditions.map((precondition) => {
    const transformedPrecondition = {
      id: precondition.id,
      method: precondition.method,
      dataPath: '',
    }

    const matchingPrecondition = preconditionsData.data.find(
      (p) => p.id === precondition.id
    )
    console.log(matchingPrecondition)
    transformedPrecondition.dataPath = matchingPrecondition.dataPath

    const methodData = preconditionMethodsData.find(
      (m) => m.method === precondition.method
    )

    if (methodData) {
      const additionalProp = Object.keys(methodData.properties).find(
        (key) => key !== 'id' && key !== 'datapath'
      )
      if (additionalProp) {
        transformedPrecondition[additionalProp] = precondition.value
      }
      console.log(precondition)
    }
    return transformedPrecondition
  })
}
