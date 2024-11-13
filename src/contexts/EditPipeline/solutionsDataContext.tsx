import { createContext, useContext } from 'react'

type SolutionsDataContextType = {
  solutionsData: Solution[]
}

type OperationGroup = {
  preconditions: Precondition[] | null
}

const SolutionsDataContext = createContext<
  SolutionsDataContextType | undefined
>(undefined)

const SolutionsDataProvider = ({ children, solutionsData }) => {
  return (
    <SolutionsDataContext.Provider value={{ solutionsData }}>
      {children}
    </SolutionsDataContext.Provider>
  )
}

export default SolutionsDataProvider

export const useSolutionsDataContext = () => {
  const context = useContext(SolutionsDataContext)
  if (!context) {
    throw new Error(
      'useSolutionsDataContext must be used within a SolutionsDataProvider'
    )
  }
  return context
}

export type Solution = {
  id: string
  solutionName: string
  description: string
  version: string
  active: boolean
  requestOperations: OperationGroup[]
}

export type Precondition = {
  method: string
  id: string
  dataPath: string
  comparisonValue?: string
  regex?: string
}
