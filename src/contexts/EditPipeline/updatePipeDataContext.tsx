import React, { createContext, useContext, useState } from 'react'
import { PipeData } from './pipelineDataContext'

type UpdatePipeDataContextType = {
  pipeData: PipeData[]
  setPipeData: React.Dispatch<React.SetStateAction<PipeData[]>>
  tempPipeData: PipeData[]
  setTempPipeData: React.Dispatch<React.SetStateAction<PipeData[]>>
}

const UpdatePipeDataContext = createContext<
  UpdatePipeDataContextType | undefined
>(undefined)

const UpdatePipelineDataProvider: React.FC<{
  children: React.ReactNode
  currentOrder?: PipeData[]
  tempOrder?: PipeData[]
}> = ({ children, currentOrder = [], tempOrder = [] }) => {
  const [pipeData, setPipeData] = useState<PipeData[]>(currentOrder)
  const [tempPipeData, setTempPipeData] = useState<PipeData[]>(tempOrder)
  return (
    <UpdatePipeDataContext.Provider
      value={{ pipeData, setPipeData, tempPipeData, setTempPipeData }}
    >
      {children}
    </UpdatePipeDataContext.Provider>
  )
}

export default UpdatePipelineDataProvider

export const useUpdatePipeDataContext = (): UpdatePipeDataContextType => {
  const context = useContext(UpdatePipeDataContext)
  if (!context) {
    throw new Error(
      'useUpdatePipelineDataContext must be used within an UpdatePipelineDataProvider'
    )
  }
  return context
}
