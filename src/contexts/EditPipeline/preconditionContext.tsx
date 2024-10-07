import React, { createContext, useContext } from 'react'

type PreconditionContextType = {
  preconditionsData: object
  preconditionMethodsData: object
}

const PreconditionContext = createContext<PreconditionContextType | undefined>(
  undefined
)

export const PreconditionProvider: React.FC<
  PreconditionContextType & { children: React.ReactNode }
> = ({ children, preconditionsData, preconditionMethodsData }) => {
  return (
    <PreconditionContext.Provider
      value={{ preconditionsData, preconditionMethodsData }}
    >
      {children}
    </PreconditionContext.Provider>
  )
}
export default PreconditionProvider

export const usePreconditionContext = () => {
  const context = useContext(PreconditionContext)
  if (!context) {
    throw new Error(
      'usePreconditionContext must be used within a PreconditionProvider'
    )
  }
  return context
}
