import { createContext, useContext } from 'react'
import { Precondition } from './solutionsDataContext'

type PipelineDataContextType = {
  pipelineData: PipelineData | null
}

type PipelineData = {
  pipelineName: string
  description: string
  pipes: PipeData[]
}

const pipelineDataContext = createContext<PipelineDataContextType | null>(null)

const PipelineDataProvider = ({
  children,
  pipelineData,
}: {
  children: React.ReactNode
  pipelineData: PipelineData | null
}) => {
  return (
    <pipelineDataContext.Provider value={{ pipelineData }}>
      {children}
    </pipelineDataContext.Provider>
  )
}

export default PipelineDataProvider

export const usePipelineDataContext = () => {
  const context = useContext(pipelineDataContext)
  if (!context) {
    throw new Error(
      'usePipelineDataContext must be used within a PipelineDataProvider'
    )
  }
  return context
}

export type PipeData = {
  id: string
  solutionId: string
  solutionVersion: string
  preconditions: Precondition[]
}
